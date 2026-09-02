/**
 * Build the static search index behind /ask and the MCP server.
 *
 * Parses every markdown file under content/en/ (English is the source of
 * truth — the index is deliberately monolingual) and writes
 * public/ask-index.json: one entry per lesson
 * with its route path, title, description, headings, and a plain-text
 * body capped at ~2000 chars. The /ask page ranks it client-side; the MCP
 * route (server/routes/mcp.post.ts) reads the same file through the ASSETS
 * binding, because the deployed Worker has no content database at runtime.
 *
 * Runs before `nuxt build` (see package.json), the same slot as
 * gate-content.mjs. Gated lessons (`access: pro`) are excluded for the same
 * reason they are excluded from /raw: an index entry is public text.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content', 'en')
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
function toRoute(file) {
  const rel = path.relative(CONTENT, file).replace(/\.md$/, '')
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

async function main() {
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
