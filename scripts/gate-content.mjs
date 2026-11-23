#!/usr/bin/env node
/**
 * Gated lessons: keeps their bodies out of everything public.
 *
 * A lesson is gated when its ENGLISH frontmatter says `access: pro`; every
 * translation follows. For each such lesson, in every locale that has it:
 *
 *   server/assets/gated/<locale>/<route>.json   the full markdown + the quiz,
 *                                               interview and walkthrough —
 *                                               bundled into the Worker only
 *   .gated-stubs/<locale>/course/<NN.section>/<NN.lesson>.md
 *                                               a public stub: title, navigation,
 *                                               description, `access: pro` and a
 *                                               two-paragraph teaser
 *   .gated-files.json                           the real files content.config.ts
 *                                               excludes in favour of the stubs
 *
 * A lesson marked `comingSoon: true` (not a section index) is gated the same
 * way, as a DRAFT: the asset carries `draft: true`, the stub carries no
 * teaser, and /api/lesson serves the body to the admin alone — so the full
 * lesson and its recording script can be written, reviewed and recorded on
 * the live site before anyone else can read a word of it.
 *
 * The body is served by /api/lesson/<locale>/<route> to members with Pro
 * (server/utils/entitlement.ts), or to the admin for a draft. All three outputs are gitignored and
 * rebuilt on every `pnpm build` (scripts/prebuild.mjs), in CI too.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, stringify } from 'yaml'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(ROOT, 'content')
const STUBS = path.join(ROOT, '.gated-stubs')
const ASSETS = path.join(ROOT, 'server', 'assets', 'gated')
const LIST = path.join(ROOT, '.gated-files.json')
const NON_LESSON = new Set(['interview-questions', 'exam', 'notes'])
// Fields only members get; the stub never carries them.
const PRIVATE_FIELDS = ['quiz', 'interview', 'walkthrough', 'video']

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory() && !NON_LESSON.has(e.name)) await walk(p, out)
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

function split(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  return m ? { data: parse(m[1]) ?? {}, body: raw.slice(m[0].length) } : { data: {}, body: raw }
}

/** The lesson's route: locale + path segments without their NN. prefixes. */
const routeOf = (locale, rel) => [locale, ...rel.replace(/\.md$/, '').split('/').map(s => s.replace(/^\d+\./, ''))]
  .filter(s => s !== 'index').join('/')

/** The first two prose paragraphs — enough to know what the lesson is about. */
function teaser(body) {
  const paras = body.split(/\n{2,}/).map(s => s.trim())
    .filter(s => s && !/^(#|::|:::|```|\||!\[|<|-\s|\d+\.\s|>)/.test(s))
  return paras.slice(0, 2).join('\n\n')
}

await rm(STUBS, { recursive: true, force: true })
await rm(ASSETS, { recursive: true, force: true })

const locales = (await readdir(CONTENT, { withFileTypes: true }))
  .filter(d => d.isDirectory() && /^[a-z]{2}$/.test(d.name)).map(d => d.name)
const gated = []
for (const en of await walk(path.join(CONTENT, 'en'))) {
  const rel = path.relative(path.join(CONTENT, 'en'), en)
  const head = split(await readFile(en, 'utf8')).data
  const draft = head.comingSoon === true && !/(^|\/)\d{2}\.index\.md$/.test(rel)
  const access = head.access === 'pro' ? 'pro' : 'free'
  if (access !== 'pro' && !draft) continue
  for (const locale of locales) {
    const file = path.join(CONTENT, locale, rel)
    if (!existsSync(file)) continue
    const { data, body } = split(await readFile(file, 'utf8'))
    const route = routeOf(locale, rel)
    const asset = path.join(ASSETS, `${route}.json`)
    await mkdir(path.dirname(asset), { recursive: true })
    const extra = Object.fromEntries(PRIVATE_FIELDS.filter(k => data[k] !== undefined).map(k => [k, data[k]]))
    await writeFile(asset, JSON.stringify({ access, ...(draft ? { draft: true } : {}), markdown: body, data: extra }))

    const stub = { ...data, ...(access === 'pro' ? { access } : {}) }
    for (const k of PRIVATE_FIELDS) delete stub[k]
    const out = path.join(STUBS, locale, rel)
    await mkdir(path.dirname(out), { recursive: true })
    // A draft's stub is the title and description only: nothing of the body.
    await writeFile(out, `---\n${stringify(stub, { lineWidth: 0 }).trimEnd()}\n---\n${draft ? '' : `\n${teaser(body)}\n`}`)
    gated.push(`${locale}/${rel}`)
  }
}
await writeFile(LIST, JSON.stringify(gated, null, 2))
console.log(`[gate] ${gated.length} lesson file(s) gated (Pro and drafts) across ${locales.length} locales`)
