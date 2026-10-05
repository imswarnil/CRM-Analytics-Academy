/**
 * Build the static search indexes: the site search (⌘K) and the MCP server.
 *
 * 1. public/search/<locale>.json — the ⌘K dialog's sections, one file per
 *    locale, fetched the first time a visitor opens search. This replaced
 *    @nuxt/content's client-side search, which on EVERY page load downloaded
 *    the whole 12-locale content database (4.5 MB on the wire), started a
 *    SQLite wasm runtime and replayed 2,286 inserts on the main thread — to
 *    serve a dialog almost nobody opens. It was the reason every page felt slow.
 *
 * 2. public/ask-index.json — the MCP server's lesson index (below).
 * *
 * Parses every markdown file under content/en/ (English is the source of
 * truth — the index is deliberately monolingual) and writes
 * public/ask-index.json: one entry per lesson
 * with its route path, title, description, headings, and a plain-text
 * body capped at ~2000 chars. The MCP
 * route (server/routes/mcp.post.ts) reads the file through the ASSETS
 * binding, because the deployed Worker has no content database at runtime.
 *
 * Runs before `nuxt build` (see package.json), the same slot as
 * gate-content.mjs. Gated lessons (`access: pro`) are excluded for the same
 * reason they are excluded from /raw: an index entry is public text.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { splitProBlocks, stripProBlocks } from './lib/pro-blocks.mjs'

const ROOT = process.cwd()
const CONTENT_ROOT = path.join(ROOT, 'content')
const CONTENT = path.join(CONTENT_ROOT, 'en')
const SEARCH_OUT = path.join(ROOT, 'public', 'search')
const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'hi', 'ar', 'ru', 'bn', 'ur']
const SECTION_CAP = 320
const SITE = 'https://crmanalytics.imswarnil.com'
const LLMS_BLURB = 'A free, open-source curriculum for mastering Salesforce CRM Analytics — data prep, SAQL, dashboards, and Einstein Discovery. Machine-translated from English.'
const OUT = path.join(ROOT, 'public', 'ask-index.json')
const TEXT_CAP = 2000

/** Recursive file walk (same hand-rolled shape as gate-content.mjs). */
async function walk(dir, out = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, out)
    else if (full.endsWith('.md')) out.push(full)
  }
  return out
}

/**
 * content/en/1.foundations/3.saql.md -> /foundations/saql
 * Numeric prefixes stripped, index.md collapses to the directory route —
 * matching how [...slug].vue and gate-content.mjs map content to routes.
 */
function toRoute(file, base = CONTENT) {
  const rel = path.relative(base, file).replace(/\.md$/, '')
  const parts = rel.split(path.sep).map(p => p.replace(/^\d+\./, ''))
  const route = '/' + parts.join('/')
  return route.replace(/\/index$/, '') || '/'
}

/** Split frontmatter from body; frontmatter parsed with the yaml dep. */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: raw }
  let data = {}
  try {
    data = parseYaml(m[1]) ?? {}
  } catch {
    // A lesson with broken frontmatter still gets indexed from its body.
  }
  return { data, body: raw.slice(m[0].length) }
}

/** Strip inline markdown/HTML/MDC syntax from a single line of prose. */
function cleanInline(line) {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/:[\w-]+\{[^}]*\}/g, ' ') // inline MDC components
    .replace(/\{[^}]*\}/g, ' ') // attribute braces
    .replace(/<[^>]+>/g, ' ') // html tags
    .replace(/[*_~`]+/g, '') // emphasis / inline code markers
    .replace(/^[-+*]\s+/, '') // list bullets
    .replace(/^\d+\.\s+/, '') // ordered list markers
    .replace(/^>\s?/, '') // blockquote markers
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Markdown body -> { headings, text }. Line-oriented: drops code fences and
 * MDC component syntax, keeps prose, and salvages the human-readable string
 * values (title/description/label/q/a) from MDC yaml blocks since those carry
 * real lesson content.
 */
function extractText(body) {
  const headings = []
  const chunks = []
  let inFence = false
  let mdcOpen = 0
  let inMdcYaml = false

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    if (/^:{2,}[\w-]/.test(line)) {
      mdcOpen += 1
      continue
    }
    if (/^:{2,}$/.test(line)) {
      mdcOpen = Math.max(0, mdcOpen - 1)
      inMdcYaml = false
      continue
    }
    if (line === '---') {
      if (mdcOpen > 0) inMdcYaml = !inMdcYaml
      continue
    }
    if (inMdcYaml) {
      const m = line.match(/^(?:-\s+)?(?:title|description|label|q|a|text):\s*(.*)$/)
      if (m) {
        const value = cleanInline(m[1].replace(/^["']|["']$/g, ''))
        if (value && !value.startsWith('i-')) chunks.push(value)
      }
      continue
    }

    const h = line.match(/^#{1,6}\s+(.*)$/)
    if (h) {
      const text = cleanInline(h[1])
      if (text) headings.push(text)
      continue
    }

    const text = cleanInline(line)
    if (text) chunks.push(text)
  }

  return { headings, text: chunks.join(' ') }
}

/** The anchor id Nuxt Content gives a heading. */
function slugify(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
}

/**
 * One lesson -> search sections in the shape UContentSearch expects:
 * { id: '/route#anchor', title, titles: [ancestors], level, content }.
 */
function toSections(route, title, body) {
  const sections = [{ id: route, title, titles: [], level: 1, content: '' }]
  let current = sections[0]
  const h2 = []
  let inFence = false
  let mdc = 0
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence || line === '---' || /^#\s/.test(line)) continue
    if (/^:{2,}[\w-]/.test(line)) {
      mdc += 1
      continue
    }
    if (/^:{2,}$/.test(line)) {
      mdc = Math.max(0, mdc - 1)
      continue
    }
    // Component props (`label: "…"`, `- value: 19`) are data, not prose.
    if (mdc && /^(-\s+)?[\w-]+:(\s|$)/.test(line)) continue
    const h = line.match(/^(#{2,3})\s+(.*)$/)
    if (h) {
      const text = cleanInline(h[2])
      if (!text) continue
      const level = h[1].length
      if (level === 2) h2.splice(0, h2.length, text)
      current = { id: `${route}#${slugify(text)}`, title: text, titles: level === 3 ? [title, ...h2] : [title], level, content: '' }
      sections.push(current)
      continue
    }
    const text = cleanInline(line)
    if (text && current.content.length < SECTION_CAP) current.content = `${current.content} ${text}`.trim()
  }
  return sections
}

async function buildSearch() {
  await mkdir(SEARCH_OUT, { recursive: true })
  // English is the fallback for any lesson a locale has not translated yet,
  // pointed at the locale's own URL.
  const english = new Map()
  for (const file of await walk(CONTENT)) english.set(path.relative(CONTENT, file), file)

  for (const locale of LOCALES) {
    const base = path.join(CONTENT_ROOT, locale)
    const own = new Set((await walk(base)).map(f => path.relative(base, f)))
    const rels = [...new Set([...english.keys(), ...own])]
      .filter(rel => english.has(rel))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    const out = []
    const llms = []
    for (const rel of rels) {
      const file = own.has(rel) ? path.join(base, rel) : english.get(rel)
      let { data, body } = parseFrontmatter(await readFile(file, 'utf8'))
      // Access is decided by the English lesson, as in gate-content.
      const en = file === english.get(rel) ? { data, body } : parseFrontmatter(await readFile(english.get(rel), 'utf8'))
      const enData = en.data
      // A translation whose ::pro blocks do not match English's is withheld by
      // gate-content (it may hold a block's text unwrapped); index English instead.
      if (file !== english.get(rel) && splitProBlocks(body).blocks.length !== splitProBlocks(en.body).blocks.length) {
        ;({ data, body } = en)
        own.delete(rel)
      }
      const isPro = data.access === 'pro' || enData.access === 'pro'
      const route = (locale === 'en' ? '' : `/${locale}`) + toRoute(english.get(rel))
      const title = String(data.title ?? '')
      // A Pro lesson is findable by its title; its body is not public text,
      // and neither are the inline `::pro` blocks of a free one.
      out.push(...(isPro ? [{ id: route, title, titles: [], level: 1, content: String(data.description ?? '') }] : toSections(route, title, stripProBlocks(body))))
      // Only translated, free lessons get a raw copy: an English fallback is
      // already in the English llms.txt, and a Pro body is never public.
      if (own.has(rel) && !isPro) {
        const raw = `/raw/${locale}${toRoute(english.get(rel))}.md`
        llms.push({ route, raw, title, description: String(data.description ?? '') })
        // Written as a static file straight from the translated markdown.
        // These used to be prerender routes — 1,500 trips through the Nitro
        // renderer for what is the source file minus its frontmatter, and
        // enough extra heap to push the build past 12 GB.
        if (locale !== 'en') {
          const target = path.join(ROOT, 'public', raw)
          await mkdir(path.dirname(target), { recursive: true })
          const lead = [`# ${title}`, '', data.description ? `> ${data.description}` : '', ''].join('\n')
          await writeFile(target, `${lead}\n${stripProBlocks(body).replace(/^\s*#\s+[^\n]*\n/, '').trim()}\n`, 'utf8')
        }
      }
    }
    await writeFile(path.join(SEARCH_OUT, `${locale}.json`), JSON.stringify(out), 'utf8')
    if (locale !== 'en') {
      await mkdir(path.join(ROOT, 'public', locale), { recursive: true })
      await writeFile(path.join(ROOT, 'public', locale, 'llms.txt'), [
        `# CRM Analytics Academy (${locale})`,
        '',
        `> ${LLMS_BLURB}`,
        '',
        `Language: ${locale}. The English original is at ${SITE}/llms.txt.`,
        '',
        '## Lessons',
        '',
        ...llms.map(l => `- [${l.title}](${SITE}${l.raw}): ${l.description}`.trim()),
        ''
      ].join('\n'), 'utf8')
    }
  }
  console.log(`[search] ${LOCALES.length} locale index(es) -> public/search/`)
}

async function main() {
  await buildSearch()

  // Numeric-aware sort so 2.setup precedes 10.whatever — the index order is
  // the curriculum order list_curriculum shows to MCP clients.
  const files = (await walk(CONTENT)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  const index = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, body } = parseFrontmatter(raw)

    // Gated lessons never enter a public file — same rule as /raw and the
    // prerender ignore list.
    if (data.access === 'pro') continue

    // Inline `::pro` blocks are gated text too: an index entry is public.
    const { headings, text } = extractText(stripProBlocks(body))
    const words = text ? text.split(/\s+/).length : 0

    index.push({
      path: toRoute(file),
      title: String(data.title ?? headings[0] ?? ''),
      description: String(data.description ?? ''),
      headings,
      text: text.slice(0, TEXT_CAP),
      words
    })
  }

  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(index), 'utf8')
  console.log(`[ask-index] ${index.length} lesson(s) -> public/ask-index.json`)
}

main().catch((e) => {
  console.error('[ask-index] failed:', e)
  process.exit(1)
})
