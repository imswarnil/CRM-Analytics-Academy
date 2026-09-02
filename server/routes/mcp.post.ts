/**
 * MCP server for the curriculum (ai.md, option 2) — a minimal, dependency-free
 * streamable-HTTP endpoint speaking JSON-RPC 2.0.
 *
 * Any MCP-capable client (Claude, Cursor, ...) pointed at
 * https://crmanalytics.imswarnil.com/mcp gets three read-only tools:
 * list_curriculum, search_lessons, get_lesson. The client's own model does the
 * generation; we only serve retrieval, so this costs nothing at any scale.
 *
 * Data source: public/ask-index.json, baked by scripts/build-search-index.mjs
 * at build time. The deployed Worker has no content database (see app/app.vue),
 * so at runtime the file is fetched through the ASSETS binding; in `nuxt dev`
 * there is no binding and it is read from disk instead.
 *
 * Read-only by design — no auth, no writes, a per-IP rate limit (same in-memory
 * pattern as server/api/submissions.post.ts). See ai.md "What not to do".
 */

import type { H3Event } from 'h3'

interface AskDoc {
  path: string
  title: string
  description: string
  headings: string[]
  text: string
  words: number
}

const SITE_URL = 'https://crmanalytics.imswarnil.com'
const SERVER_INFO = { name: 'crm-analytics-academy', version: '1.0.0' }
const PROTOCOL_VERSION = '2025-03-26'

// ---------------------------------------------------------------------------
// Rate limit — per IP, in-memory (resets when the isolate recycles, which is
// fine: the point is to blunt a hammering loop, not to meter usage).
// ---------------------------------------------------------------------------

const RATE = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 60

// ---------------------------------------------------------------------------
// Index loading
// ---------------------------------------------------------------------------

let indexCache: AskDoc[] | null = null

async function loadIndex(event: H3Event): Promise<AskDoc[]> {
  if (indexCache) return indexCache

  // Deployed: the prerendered site (public/) is served by Workers Static
  // Assets, and Nitro's cloudflare_module preset exposes that store to the
  // Worker as the ASSETS binding. The hostname is irrelevant — the binding
  // only looks at the path.
  // A string URL rather than a `new Request(...)`: on the deployed Worker both
  // work, but in `nuxt dev` the binding is emulated by miniflare across a
  // realm boundary where a Node-built Request fails to round-trip.
  const env = event.context.cloudflare?.env as Record<string, unknown> | undefined
  const assets = env?.ASSETS as { fetch: (req: Request | string) => Promise<Response> } | undefined
  if (assets) {
    try {
      const res = await assets.fetch('https://assets.local/ask-index.json')
      if (res.ok) {
        indexCache = await res.json() as AskDoc[]
        return indexCache
      }
    } catch {
      // Emulated binding misbehaving (dev) — fall through to the disk read.
    }
  }

  // Dev fallback: no binding, read the generated file from disk. The import is
  // inside the branch so the Worker bundle never evaluates it.
  try {
    const { readFile } = await import('node:fs/promises')
    indexCache = JSON.parse(await readFile('public/ask-index.json', 'utf8')) as AskDoc[]
    return indexCache
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Search index unavailable. Run `pnpm ask:index`.' })
  }
}

// ---------------------------------------------------------------------------
// Retrieval — the same tokenizing and field-weighted scoring as /ask
// ---------------------------------------------------------------------------

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(term => term.length > 1)
}

function countHits(haystack: string, term: string): number {
  let count = 0
  let at = haystack.indexOf(term)
  while (at !== -1) {
    count += 1
    at = haystack.indexOf(term, at + term.length)
  }
  return count
}

function scoreDoc(doc: AskDoc, terms: string[]): number {
  const lowTitle = doc.title.toLowerCase()
  const lowHeadings = doc.headings.join(' ').toLowerCase()
  const lowDescription = doc.description.toLowerCase()
  const lowText = doc.text.toLowerCase()

  let score = 0
  for (const term of terms) {
    score += countHits(lowTitle, term) * 5
    score += countHits(lowHeadings, term) * 3
    score += countHits(lowDescription, term) * 2
    score += countHits(lowText, term)
  }
  return score
}

function snippetFor(doc: AskDoc, terms: string[]): string {
  const low = doc.text.toLowerCase()
  let at = -1
  for (const term of terms) {
    const hit = low.indexOf(term)
    if (hit !== -1 && (at === -1 || hit < at)) at = hit
  }
  if (at === -1) return doc.text.slice(0, 200)
  const start = Math.max(0, at - 80)
  const end = Math.min(doc.text.length, at + 120)
  return (start > 0 ? '…' : '') + doc.text.slice(start, end) + (end < doc.text.length ? '…' : '')
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'list_curriculum',
    description: 'List every module and lesson in the CRM Analytics Academy curriculum, with the path to pass to get_lesson.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'search_lessons',
    description: 'Keyword-search the curriculum. Returns the five best-matching lessons with their path and a matching passage.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to search for, e.g. "date toggle faceting".' }
      },
      required: ['query'],
      additionalProperties: false
    }
  },
  {
    name: 'get_lesson',
    description: 'Fetch one lesson by path (as returned by list_curriculum or search_lessons), e.g. "/foundations/what-is-crm-analytics".',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'The lesson route path, starting with "/".' }
      },
      required: ['path'],
      additionalProperties: false
    }
  }
]

function listCurriculum(docs: AskDoc[]): string {
  // Group by top-level route segment; the module's own index page (a
  // single-segment path) names the group.
  const modules = new Map<string, { title: string, lessons: AskDoc[] }>()
  for (const doc of docs) {
    const segments = doc.path.split('/').filter(Boolean)
    const key = segments[0] ?? ''
    if (!modules.has(key)) modules.set(key, { title: key, lessons: [] })
    const mod = modules.get(key)!
    if (segments.length === 1) mod.title = doc.title || key
    else mod.lessons.push(doc)
  }

  const lines: string[] = [`CRM Analytics Academy curriculum (${docs.length} pages). Lessons render at ${SITE_URL}<path>; raw markdown at ${SITE_URL}/raw<path>.md`, '']
  for (const [key, mod] of modules) {
    lines.push(`# ${mod.title} (/${key})`)
    for (const lesson of mod.lessons) {
      lines.push(`- ${lesson.title} — ${lesson.path}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

function searchLessons(docs: AskDoc[], query: string): string {
  const terms = tokenize(query)
  if (!terms.length) return 'Query is empty — give me a few keywords.'

  const hits = docs
    .map(doc => ({ doc, score: scoreDoc(doc, terms) }))
    .filter(hit => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (!hits.length) return `No lessons match "${query}". Try list_curriculum to browse.`

  return hits
    .map(({ doc }) => `## ${doc.title}\npath: ${doc.path}\n${doc.description}\n> ${snippetFor(doc, terms)}`)
    .join('\n\n')
}

function getLesson(docs: AskDoc[], path: string): string {
  const wanted = '/' + String(path).trim().replace(/^\/+/, '').replace(/\/+$/, '')
  const doc = docs.find(d => d.path === wanted)
  if (!doc) {
    return `No lesson at "${wanted}". Use list_curriculum or search_lessons to find valid paths.`
  }
  return [
    `# ${doc.title}`,
    doc.description,
    '',
    doc.text,
    '',
    `(Indexed excerpt, ~${Math.min(doc.words, 400)} of ${doc.words} words. Full lesson as markdown: ${SITE_URL}/raw${doc.path}.md)`
  ].join('\n')
}

// ---------------------------------------------------------------------------
// JSON-RPC plumbing
// ---------------------------------------------------------------------------

type RpcId = string | number | null

function rpcResult(id: RpcId, result: unknown) {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(id: RpcId, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const seen = RATE.get(ip)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again in a minute.' })
    }
    seen.count += 1
  } else {
    RATE.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  let body: { jsonrpc?: string, id?: RpcId, method?: string, params?: Record<string, unknown> }
  try {
    body = await readBody(event)
  } catch {
    return rpcError(null, -32700, 'Parse error')
  }
  if (!body || typeof body !== 'object' || typeof body.method !== 'string') {
    return rpcError(null, -32600, 'Invalid request')
  }

  const id = body.id ?? null
  const params = body.params ?? {}

  // Notifications get no response body at all.
  if (body.method.startsWith('notifications/')) {
    setResponseStatus(event, 202)
    return null
  }

  setHeader(event, 'Content-Type', 'application/json')

  if (body.method === 'initialize') {
    const requested = typeof params.protocolVersion === 'string' ? params.protocolVersion : PROTOCOL_VERSION
    return rpcResult(id, {
      protocolVersion: requested,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO
    })
  }

  if (body.method === 'ping') {
    return rpcResult(id, {})
  }

  if (body.method === 'tools/list') {
    return rpcResult(id, { tools: TOOLS })
  }

  if (body.method === 'tools/call') {
    const name = typeof params.name === 'string' ? params.name : ''
    const args = (params.arguments ?? {}) as Record<string, unknown>
    const docs = await loadIndex(event)

    let text: string
    if (name === 'list_curriculum') {
      text = listCurriculum(docs)
    } else if (name === 'search_lessons') {
      if (typeof args.query !== 'string') return rpcError(id, -32602, 'search_lessons requires a "query" string')
      text = searchLessons(docs, args.query)
    } else if (name === 'get_lesson') {
      if (typeof args.path !== 'string') return rpcError(id, -32602, 'get_lesson requires a "path" string')
      text = getLesson(docs, args.path)
    } else {
      return rpcError(id, -32602, `Unknown tool "${name}"`)
    }

    return rpcResult(id, { content: [{ type: 'text', text }] })
  }

  return rpcError(id, -32601, `Method not found: ${body.method}`)
})
