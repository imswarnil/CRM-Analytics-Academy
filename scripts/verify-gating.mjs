/**
 * Asserts that no gated lesson leaked into the public build.
 *
 * This runs after the build and fails it if it finds anything. A paywall that
 * is only enforced in the UI is not a paywall — the markdown either is or is
 * not in .output/public, and that is a fact a script can check, unlike "does
 * the page look locked", which is a fact only a human notices being wrong.
 *
 * It checks three ways, because there are three ways the content can escape:
 * the prerendered HTML, the payload JSON Nuxt emits beside it, and the content
 * SQL dumps @nuxt/content writes for client-side queries.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

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
const PUBLIC = path.join(ROOT, '.output/public')
const GATED = path.join(ROOT, 'server/assets/gated')

/**
 * Distinctive verbatim slices of the part of each lesson that must stay
 * hidden.
 *
 * Taken only from runs of plain prose — no markdown syntax, quotes or
 * backslashes — so the same characters appear verbatim whether the body leaked
 * as markdown (/raw, llms-full.txt) or as the parsed text nodes of the content
 * database. A probe that spans `**bold**` would match neither, and produce a
 * green check over a real leak.
 *
 * Anything that also appears in public text is skipped — the teaser is
 * public on purpose, and a sentence shared with a free lesson is not a leak.
 */
function probes(markdown, stubText) {
  const body = markdown.replace(/^---[\s\S]*?---/, '')
  // Any script, not only Latin: the translated copies of a Pro lesson are
  // gated too, and a probe set that cannot see Chinese or Bengali would pass
  // a leaked translation. Dense scripts need fewer characters to be
  // distinctive, so the minimum length drops for them.
  const runs = body.match(/\p{L}[^*_`[\]()|\\"'<>{}#:\n]{15,}/gu) ?? []
  const out = []
  for (const run of runs) {
    const dense = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(run)
    const slice = run.slice(0, dense ? 16 : 44).trim()
    if (slice.length < (dense ? 12 : 36) || stubText.includes(slice)) continue
    out.push(slice)
    if (out.length >= 6) break
  }
  return out
}

/** Content dumps ship gzipped and base64-encoded; read them decoded. */
async function readText(file) {
  const raw = await readFile(file, 'utf8')
  if (/sql_dump\.txt$/.test(file) && /^[A-Za-z0-9+/=\s]+$/.test(raw.slice(0, 200))) {
    try {
      return gunzipSync(Buffer.from(raw, 'base64')).toString('utf8')
    } catch {
      return raw
    }
  }
  return raw
}

async function main() {
  if (!existsSync(GATED)) {
    console.log('[verify-gating] no gated content — nothing to check')
    return
  }
  if (!existsSync(PUBLIC)) {
    console.error('[verify-gating] .output/public missing — run the build first')
    process.exit(1)
  }

  const assets = await walk(GATED, f => f.endsWith('.json'))
  if (!assets.length) {
    console.log('[verify-gating] no gated content — nothing to check')
    return
  }

  const needles = []
  // Text that is public on purpose: the stubs' teasers, and every lesson that
  // is not gated. A sentence a Pro lesson shares with a free one proves
  // nothing when it turns up in the bundle, so it is not used as a probe.
  const STUBS = path.join(ROOT, '.gated-stubs')
  const gatedFiles = new Set(JSON.parse(await readFile(path.join(ROOT, '.gated-files.json'), 'utf8')))
  const CONTENT = path.join(ROOT, 'content')
  const publicFiles = [
    ...(await walk(STUBS, f => f.endsWith('.md'))),
    ...(await walk(CONTENT, f => f.endsWith('.md') && !gatedFiles.has(path.relative(CONTENT, f).split(path.sep).join('/'))))
  ]
  const stubs = (await Promise.all(publicFiles.map(f => readFile(f, 'utf8')))).join('\n')
  for (const file of assets) {
    const { markdown } = JSON.parse(await readFile(file, 'utf8'))
    const found = probes(markdown, stubs)
    if (!found.length) {
      console.error(`[verify-gating] FAIL — no usable probes for ${file}; the check would pass blindly`)
      process.exit(1)
    }
    for (const p of found) needles.push({ file, probe: p })
  }

  const leaks = []
  // Every text-ish file, not a chosen few: the two leaks this check was
  // written to catch were in /raw/*.md and llms-full.txt, neither of which an
  // html+json allowlist would have opened.
  const TEXTUAL = /\.(html|json|txt|sql|md|xml|js)$/i
  for (const file of await walk(PUBLIC, f => TEXTUAL.test(f))) {
    const size = (await stat(file)).size
    // The content dumps are large; read them anyway — they are the most
    // likely place for a body to be hiding.
    if (size > 60_000_000) continue
    const text = (await readText(file)).replace(/\s+/g, ' ')
    for (const { file: src, probe: p } of needles) {
      if (text.includes(p)) leaks.push({ lesson: src, found_in: path.relative(PUBLIC, file) })
    }
  }

  if (leaks.length) {
    console.error(`[verify-gating] FAIL — gated content found in the public bundle:`)
    for (const l of leaks.slice(0, 20)) console.error(`  ${l.lesson}  ->  ${l.found_in}`)
    process.exit(1)
  }

  console.log(`[verify-gating] OK — ${assets.length} gated lesson(s), ${needles.length} probes, none present in .output/public`)
}

main().catch((e) => {
  console.error('[verify-gating] failed:', e)
  process.exit(1)
})
