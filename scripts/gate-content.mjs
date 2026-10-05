/**
 * Moves gated lessons out of the public build.
 *
 * Runs before `nuxt build`. Any lesson whose frontmatter says `access: pro` is
 * copied into server/assets/gated/ — which Nitro bundles into the server, not
 * into .output/public — and its route is written to .gated-routes.json so the
 * prerenderer can skip it.
 *
 * This is the actual paywall. Everything in the client is presentation: if the
 * markdown reaches the static bundle, it is public no matter what the UI
 * draws over it, because "view source" is a button on every browser. So the
 * test this script has to pass is not "does the lesson look locked" but "is
 * the text absent from .output/public", which scripts/verify-gating.mjs
 * asserts after the build.
 */
import { copyFile, readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { placeholder, splitProBlocks, stripProBlocks } from './lib/pro-blocks.mjs'
import { muxIdOf } from './lib/lessons.mjs'

/**
 * Recursive file walk.
 *
 * Hand-rolled rather than fs.promises.glob: that is still flagged experimental
 * on Node 22, which is what CI runs, and this script gates a live deploy. A
 * dozen lines of readdir is a better trade than an experimental API in the
 * path of the paywall check.
 */
async function walk(dir, match, out = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, match, out)
    else if (match(full)) out.push(full)
  }
  return out
}

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'server/assets/gated')
const STUBS = path.join(ROOT, '.gated-stubs')
const ROUTES = path.join(ROOT, '.gated-routes.json')
const FILES = path.join(ROOT, '.gated-files.json')
// Inline `::pro` blocks of otherwise free lessons, one JSON per locale+route.
const OUT_BLOCKS = path.join(ROOT, 'server/assets/gated-blocks')
// Transcripts: free lessons' are public files, Pro lessons' live in the Worker.
const TRANSCRIPTS = path.join(ROOT, 'content-transcripts')
const PUBLIC_TRANSCRIPTS = path.join(ROOT, 'public/transcripts')
const GATED_TRANSCRIPTS = path.join(ROOT, 'server/assets/gated-transcripts')

function split(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  return { data: parseYaml(m[1]) ?? {}, body: m[2] }
}

/**
 * content/en/01.foundations/03.saql.md -> /foundations/saql
 * Numeric ordering prefixes and the locale segment are both stripped, matching
 * how [...slug].vue maps a route to a content path.
 */
function toRoute(file) {
  const rel = path.relative(CONTENT, file).replace(/\.md$/, '')
  const parts = rel.split(path.sep).map(p => p.replace(/^\d+\./, ''))
  const locale = parts.shift()
  const route = '/' + parts.join('/')
  return { locale, route: route.replace(/\/index$/, '') || '/' }
}

/**
 * The free part of a Pro lesson: the title and introduction, up to the first
 * `## ` heading (or the first section, if the introduction is a single line),
 * capped at ~1,800 characters. Enough for a reader to judge whether it is worth unlocking,
 * and a small enough fraction that it gives nothing away.
 */
function teaser(body) {
  const lines = body.split(/\r?\n/)
  const out = []
  let headings = 0
  let inBlock = false
  for (const line of lines) {
    // Never cut an MDC component in half — its YAML would not parse.
    if (/^::[a-z]/.test(line)) inBlock = true
    if (/^::\s*$/.test(line)) {
      inBlock = false
      out.push(line)
      continue
    }
    // Stop at the first section heading once there is a real introduction to
    // show; a lesson with a one-line intro gets its first section too.
    if (!inBlock && /^## /.test(line) && (++headings >= 2 || out.join('\n').replace(/^#.*$/m, '').trim().length > 160)) break
    out.push(line)
    if (!inBlock && out.join('\n').length > 1800) break
  }
  while (inBlock && out.length && !/^::\s*$/.test(out[out.length - 1] ?? '')) out.pop()
  return out.join('\n').trim()
}

/**
 * The stub that takes a Pro lesson's place in the content collection. The
 * collection is published whole as a client-side database (dump.docs.sql), so
 * anything in it is public; the stub carries only what a locked page shows —
 * title, description, navigation, the video's (signed, useless on their own)
 * playback ids — and the teaser. Quizzes, interview answers and walkthrough
 * scripts stay behind the paywall with the body.
 */
function stub(data, body) {
  const keep = {}
  for (const k of ['title', 'description', 'navigation', 'links', 'mux', 'badge']) {
    if (data[k] !== undefined) keep[k] = data[k]
  }
  keep.access = 'pro'
  // A `::pro` block inside a Pro lesson is part of the gated body; it must not
  // ride out in the public teaser.
  return `---\n${stringifyYaml(keep).trim()}\n---\n\n${teaser(stripProBlocks(body))}\n`
}

/** The frontmatter exactly as written, so an inline-gated lesson's stub keeps every field. */
function rawFrontmatter(raw) {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  return m ? m[0] : ''
}

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await rm(STUBS, { recursive: true, force: true })
  await rm(OUT_BLOCKS, { recursive: true, force: true })
  await rm(PUBLIC_TRANSCRIPTS, { recursive: true, force: true })
  await rm(GATED_TRANSCRIPTS, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const gated = new Set()
  const files = []
  const all = await walk(CONTENT, f => f.endsWith('.md'))

  // English is the only hand-written locale; the other eleven are generated
  // from it. So a lesson's access and videos are decided by its English file
  // and applied to every translation — otherwise the Spanish copy of a Pro
  // lesson would give the lesson away, and a translation that lost the field
  // would quietly make it free.
  const english = new Map()
  const words = new Map()
  // How many `::pro` blocks each English lesson has. A translation must have
  // the same number, block for block, or it is not served at all (see below).
  const blockCount = new Map()
  const problems = []
  for (const file of all) {
    const rel = path.relative(CONTENT, file).split(path.sep)
    if (rel[0] !== 'en') continue
    const { data, body } = split(await readFile(file, 'utf8'))
    english.set(rel.slice(1).join('/'), data)
    words.set(rel.slice(1).join('/'), stripProBlocks(body).split(/\s+/).filter(Boolean).length)
    const { blocks, errors } = splitProBlocks(body)
    blockCount.set(rel.slice(1).join('/'), blocks.length)
    for (const e of errors) problems.push(`${rel.join('/')}: ${e}`)
    // One video per lesson: `mux` is a single playback id. The old per-language
    // map still works, but only its English entry is played.
    if (data.mux && typeof data.mux === 'object') {
      console.warn(`[gate-content] ${rel.join('/')}: \`mux\` is a per-language map — only \`mux.en\` is used now. Make it a single id: mux: "${muxIdOf(data.mux)}"`)
    }
  }
  // A mis-nested block could close early and publish the rest of itself, so a
  // malformed `::pro` stops the build instead of being guessed at.
  if (problems.length) {
    console.error('[gate-content] malformed ::pro block(s):')
    for (const p of problems) console.error(`  ${p}`)
    process.exit(1)
  }
  let inlineFiles = 0

  /**
   * Inline `::pro` blocks in a free lesson. Same machinery as a whole Pro
   * lesson: the block's markdown goes to server/assets/gated-blocks/, the
   * public copy (a stub in .gated-stubs/, swapped in for the real file) has a
   * `::pro-locked{…}` placeholder where the block was.
   *
   * Translations copy MDC blocks, so a translated file normally has the same
   * blocks, translated. When it does not — the English lesson gained a block
   * and the translation has not caught up, so the text it wraps may still be
   * sitting in the translation unwrapped — the translation is withheld
   * entirely and that locale falls back to the English page. Failing closed
   * costs a reader a translation for a day; failing open gives the block away.
   */
  async function gateInline(file, raw, body, relParts, en) {
    const rel = relParts.join('/')
    const { locale, route } = toRoute(file)
    const { blocks, errors } = splitProBlocks(body)
    const expected = blockCount.get(relParts.slice(1).join('/')) ?? 0
    if (locale !== 'en' && (expected || blocks.length) && (blocks.length !== expected || errors.length)) {
      console.warn(`[gate-content] ${rel}: ${blocks.length} ::pro block(s), English has ${expected} — withheld until re-translated; /${locale}${route} shows the English page`)
      files.push(rel)
      return
    }
    if (!blocks.length || en?.access === 'pro') return

    const assetPath = path.join(OUT_BLOCKS, locale, `${route === '/' ? 'index' : route.replace(/^\//, '')}.json`)
    await mkdir(path.dirname(assetPath), { recursive: true })
    await writeFile(assetPath, JSON.stringify({ blocks: blocks.map(b => ({ n: b.n, markdown: b.markdown })) }), 'utf8')

    const stubPath = path.join(STUBS, rel)
    await mkdir(path.dirname(stubPath), { recursive: true })
    const { segments } = splitProBlocks(body)
    const publicBody = segments.map(s => (s.block ? placeholder({ locale, route, block: s.block }) : s.text)).join('\n')
    await writeFile(stubPath, `${rawFrontmatter(raw)}${publicBody}`, 'utf8')
    files.push(rel)
    inlineFiles++
  }

  for (const file of all) {
    const raw = await readFile(file, 'utf8')
    const { data, body } = split(raw)
    const rel0 = path.relative(CONTENT, file).split(path.sep)
    const en = english.get(rel0.slice(1).join('/'))
    if (en?.access === 'pro') {
      data.access = 'pro'
      if (en.mux !== undefined) data.mux = en.mux
    }
    if (data.access !== 'pro') {
      await gateInline(file, raw, body, rel0, en)
      continue
    }

    const rel = path.relative(CONTENT, file)
    files.push(rel.split(path.sep).join('/'))

    const { locale, route } = toRoute(file)
    // One asset per locale+route, as nested folders: Nitro reads server
    // assets through unstorage, which treats ':' in a key as a path separator,
    // so the API's key `gated:en:saql:functions.json` resolves to
    // gated/en/saql/functions.json. A flat file with colons in its name is
    // listed by getKeys() and then never found by getItem().
    const assetPath = path.join(OUT, locale, `${route.replace(/^\//, '')}.json`)
    await mkdir(path.dirname(assetPath), { recursive: true })
    await writeFile(assetPath, JSON.stringify({ access: 'pro', markdown: body, data }), 'utf8')

    const stubPath = path.join(STUBS, rel)
    await mkdir(path.dirname(stubPath), { recursive: true })
    await writeFile(stubPath, stub(data, body), 'utf8')

    gated.add(locale === 'en' ? route : `/${locale}${route}`)
  }

  // Every English lesson with its access and videos, for the admin Lessons
  // view. The Worker has no content database, so this is how it knows the
  // curriculum without calling GitHub for 161 files.
  const manifest = [...english.entries()]
    .filter(([rel]) => !rel.startsWith('.') && rel.includes('/'))
    .map(([rel, d]) => ({
      file: `en/${rel}`,
      route: '/' + rel.replace(/\.md$/, '').split('/').map(p => p.replace(/^\d+\./, '')).join('/').replace(/\/index$/, ''),
      section: rel.split('/')[0],
      title: String(d.navigation?.title ?? d.title ?? rel),
      access: d.access === 'pro' ? 'pro' : 'free',
      mux: d.mux ?? null
    }))
    .sort((x, y) => x.file.localeCompare(y.file))
  await mkdir(path.join(ROOT, 'server/assets'), { recursive: true })
  await writeFile(path.join(ROOT, 'server/assets/lessons.json'), JSON.stringify(manifest), 'utf8')

  // Per-lesson length and kind for the Blueprint charts (curriculum bars,
  // the player's course timeline, the home page's "curriculum, plotted").
  // Minutes = reading at 200 wpm plus the walkthrough's spoken seconds,
  // rounded, never under 3. Committed, so dev and typecheck always have it.
  const meta = {}
  // Written by scripts/video/captions.mjs: route → { playbackId, uploadDate, duration }.
  const videoInfo = JSON.parse(await readFile(path.join(TRANSCRIPTS, 'videos.json'), 'utf8').catch(() => '{}'))
  for (const [rel, d] of english) {
    if (!rel.includes('/')) continue
    const route = '/' + rel.replace(/\.md$/, '').split('/').map(p => p.replace(/^\d+\./, '')).join('/').replace(/\/index$/, '')
    const spoken = Array.isArray(d.walkthrough?.shots)
      ? d.walkthrough.shots.reduce((n, sh) => n + (Number(sh.seconds) || 0), 0)
      : 0
    const minutes = Math.max(3, Math.round((words.get(rel) ?? 0) / 200 + spoken / 60))
    const video = Boolean(d.mux || d.video?.id || d.walkthrough?.shots?.length)
    const langs = await publishTranscripts(route, d)
    const info = muxIdOf(d.mux) ? videoInfo[route] : undefined
    meta[route] = {
      minutes,
      type: video ? 'video' : 'article',
      access: d.access === 'pro' ? 'pro' : 'free',
      quiz: Array.isArray(d.quiz) && d.quiz.length > 0,
      // Languages this lesson's video has a transcript in (English first).
      ...(langs.length ? { transcripts: langs } : {}),
      // Upload date and length of the Mux asset, for VideoObject JSON-LD.
      ...(info && info.playbackId === muxIdOf(d.mux) && (info.uploadDate || info.duration)
        ? { video: { ...(info.uploadDate ? { uploadDate: info.uploadDate } : {}), ...(info.duration ? { duration: Math.round(info.duration) } : {}) } }
        : {})
    }
  }
  await mkdir(path.join(ROOT, 'app/data'), { recursive: true })
  const metaPath = path.join(ROOT, 'app/data/lesson-meta.json')
  const next = JSON.stringify(meta, null, 1) + '\n'
  const prev = await readFile(metaPath, 'utf8').catch(() => '')
  if (prev !== next) await writeFile(metaPath, next, 'utf8')

  // content.config.ts reads this list to exclude the real files from the
  // collection, and adds .gated-stubs/ as a second source in their place.
  await writeFile(FILES, JSON.stringify(files.sort(), null, 2), 'utf8')
  await writeFile(ROUTES, JSON.stringify([...gated].sort(), null, 2), 'utf8')
  console.log(`[gate-content] ${files.length} gated file(s) (${inlineFiles} with inline ::pro blocks) -> server/assets/ + .gated-stubs/`)
}

/**
 * Transcripts of the lesson's video, from content-transcripts/<locale>/<route>.vtt
 * (English synced from Mux by scripts/video/captions.mjs, the rest translated).
 * A free lesson's go to public/transcripts/ — static files the player and the
 * transcript panel read. A Pro lesson's go to server/assets/gated-transcripts/,
 * inside the Worker, served only by /api/transcript after hasPro(): the words
 * of a paid video are as paid as the video.
 */
async function publishTranscripts(route, data) {
  if (!muxIdOf(data.mux) || !existsSync(TRANSCRIPTS)) return []
  const name = `${route === '/' ? 'index' : route.replace(/^\//, '')}.vtt`
  const dest = data.access === 'pro' ? GATED_TRANSCRIPTS : PUBLIC_TRANSCRIPTS
  const langs = []
  for (const locale of (await readdir(TRANSCRIPTS)).sort()) {
    const src = path.join(TRANSCRIPTS, locale, name)
    if (!/^[a-z]{2}$/.test(locale) || !existsSync(src)) continue
    const out = path.join(dest, locale, name)
    await mkdir(path.dirname(out), { recursive: true })
    await copyFile(src, out)
    langs.push(locale)
  }
  return langs.sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)))
}

main().catch((e) => {
  console.error('[gate-content] failed:', e)
  process.exit(1)
})
