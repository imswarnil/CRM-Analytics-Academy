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
 * 3. public/llms.txt + public/llms-full.txt — the curriculum for AI
 *    assistants, in learning order, and public/raw/** — every lesson as
 *    markdown (English at /raw/<route>.md, translations at /raw/<locale>/…).
 *    public/<locale>/llms.txt indexes each translation.
 *
 * Runs before `nuxt build` (scripts/prebuild.mjs).
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

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

/** A lesson as standalone markdown: its title and description, then the body. */
function rawMarkdown(title, description, body) {
  const lead = [`# ${title}`, '', description ? `> ${description}` : '', ''].join('\n')
  return `${lead}\n${body.replace(/^\s*#\s+[^\n]*\n/, '').trim()}\n`
}

/**
 * The English llms.txt and llms-full.txt, in the order the course is meant
 * to be taken: what the Academy is, how to use it, then every section with its
 * lessons numbered. llms-full.txt is the same list followed by every lesson's
 * full markdown, in order — one file an assistant can read to teach the course.
 */
async function buildLlms() {
  const sections = (await readdir(CONTENT, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  const head = [
    '# CRM Analytics Academy',
    '',
    '> A free, open-source course for Salesforce CRM Analytics (formerly Tableau CRM / Einstein Analytics), taught the way go-to-market teams use it: data preparation, datasets, SAQL, dashboards, bindings, Einstein Discovery, and funnel, pipeline and RevOps dashboards built end to end.',
    '',
    `Site: ${SITE} · Source: https://github.com/imswarnil/CRM-Analytics-Academy · License: MIT · Author: Swarnil Singhai`,
    '',
    '## How to learn with this course',
    '',
    '- The sections are numbered and build on each other. Take them in order: Introduction → Basics → Setup → Data Preparation → Datasets → Visualization → Lenses → SAQL → Dashboard Design → Interactions → Bindings → Dashboard JSON → Collaboration → APIs → Einstein Discovery, then the three GTM tracks (Demand, Pipeline, RevOps) after GTM Engineering.',
    '- Every lesson is free. Most end with a graded quiz and interview questions.',
    '- Practise in a free CRM Analytics Developer Edition org (Introduction → Set up your org); the datasets are at ' + SITE + '/datasets.',
    '- Each lesson link below is the raw markdown of that lesson. The rendered page is the same path without /raw and .md.',
    `- Translations: the course is machine-translated into 11 languages; each has its own index at ${SITE}/<locale>/llms.txt (es, fr, de, pt, ja, zh, hi, ar, ru, bn, ur).`,
    `- MCP: ${SITE}/mcp (list_curriculum, search_lessons, get_lesson).`,
    ''
  ]
  const index = []
  const full = []
  let n = 0
  for (const [i, dir] of sections.entries()) {
    const files = (await walk(path.join(CONTENT, dir))).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    let title = dir.replace(/^\d+\./, '')
    try {
      title = String(parseYaml(await readFile(path.join(CONTENT, dir, '.navigation.yml'), 'utf8'))?.title ?? title)
    } catch { /* no .navigation.yml: keep the folder name */ }
    const lessons = []
    for (const file of files) {
      const { data, body } = parseFrontmatter(await readFile(file, 'utf8'))
      lessons.push({ route: toRoute(file), title: String(data.title ?? ''), description: String(data.description ?? ''), body })
    }
    const intro = lessons[0]?.description
    index.push(`## ${String(i).padStart(2, '0')}. ${title}`, '', ...(intro ? [intro, ''] : []))
    for (const l of lessons) {
      n++
      index.push(`- ${n}. [${l.title}](${SITE}/raw${l.route}.md): ${l.description}`.trim())
      full.push(`---\n\nLesson ${n} · Section ${String(i).padStart(2, '0')} ${title} · ${SITE}${l.route}\n\n${rawMarkdown(l.title, l.description, l.body)}`)
    }
    index.push('')
  }
  const more = [
    '## More',
    '',
    `- [Curriculum](${SITE}/curriculum): every lesson on one page, with length and kind.`,
    `- [Certification practice](${SITE}/certification): timed practice papers in the format of the CRM Analytics and Einstein Discovery Consultant exam (60 questions, 105 minutes, 68% to pass), plus a drill per exam domain.`,
    `- [Interview questions](${SITE}/interview-questions): a growing bank of CRM Analytics interview questions with model answers, by type, topic, level and company.`,
    `- [YouTube channel](https://www.youtube.com/@crmanalyticsacademy): the lesson videos.`,
    `- [Datasets](${SITE}/datasets): practice data for the exercises.`,
    `- [Resources](${SITE}/resources): curated CRM Analytics resources.`,
    `- [Full text](${SITE}/llms-full.txt): this index followed by all ${n} lessons in order.`,
    ''
  ]
  await writeFile(path.join(ROOT, 'public', 'llms.txt'), [...head, `## The curriculum (${sections.length} sections, ${n} lessons)`, '', ...index, ...more].join('\n'), 'utf8')
  await writeFile(path.join(ROOT, 'public', 'llms-full.txt'), [...head, ...index, ...full].join('\n'), 'utf8')
  console.log(`[llms] ${n} lessons -> public/llms.txt, public/llms-full.txt`)
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
      const { data, body } = parseFrontmatter(await readFile(file, 'utf8'))
      const route = (locale === 'en' ? '' : `/${locale}`) + toRoute(english.get(rel))
      const title = String(data.title ?? '')
      out.push(...toSections(route, title, body))
      // Every lesson in this locale's own words gets a raw markdown copy; an
      // untranslated lesson is already in the English one.
      if (own.has(rel)) {
        const raw = locale === 'en' ? `/raw${toRoute(english.get(rel))}.md` : `/raw/${locale}${toRoute(english.get(rel))}.md`
        llms.push({ route, raw, title, description: String(data.description ?? '') })
        // Written as static files straight from the markdown — no renderer.
        const target = path.join(ROOT, 'public', raw)
        await mkdir(path.dirname(target), { recursive: true })
        await writeFile(target, rawMarkdown(title, data.description, body), 'utf8')
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
  await buildLlms()

  // Numeric-aware sort so 2.setup precedes 10.whatever — the index order is
  // the curriculum order list_curriculum shows to MCP clients.
  const files = (await walk(CONTENT)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  const index = []

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const { data, body } = parseFrontmatter(raw)

    const { headings, text } = extractText(body)
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
