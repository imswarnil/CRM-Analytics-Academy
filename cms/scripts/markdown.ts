import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

/**
 * Markdown ⇄ Payload mapping, shared by import and pull so the two can never
 * disagree about what a field means.
 */

export const CONTENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content')

export type Frontmatter = Record<string, unknown>

export function readMarkdown(file: string): { data: Frontmatter, body: string } {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  return { data: (YAML.parse(m[1]!) ?? {}) as Frontmatter, body: m[2] ?? '' }
}

/** "07.saql" → { order: 7, slug: 'saql' } */
export function splitPrefix(name: string) {
  const m = name.replace(/\.md$/, '').match(/^(\d+)\.(.+)$/)
  return m ? { order: Number(m[1]), slug: m[2]! } : { order: 0, slug: name.replace(/\.md$/, '') }
}
export const pad = (n: number) => String(n).padStart(2, '0')

export function listDirs(dir: string) {
  return readdirSync(dir).filter(n => !n.startsWith('.') && statSync(path.join(dir, n)).isDirectory()).sort()
}
export function listMarkdown(dir: string) {
  return existsSync(dir) ? readdirSync(dir).filter(n => n.endsWith('.md')).sort() : []
}

/* ------------------------------------------------------------------ lessons */

const LESSON_KEYS = ['title', 'navigation', 'description', 'access', 'mux', 'video', 'walkthrough', 'quiz', 'interview', 'links']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

export function lessonFromMarkdown(data: Frontmatter, body: string): Doc {
  const nav = data.navigation
  const simpleNav = nav && typeof nav === 'object' && Object.keys(nav).length === 1 && 'title' in nav
  const extra: Frontmatter = {}
  for (const [k, v] of Object.entries(data)) {
    if (!LESSON_KEYS.includes(k) || (k === 'navigation' && !simpleNav)) extra[k] = v
  }
  const wt = data.walkthrough as Doc | undefined
  return {
    title: data.title,
    navTitle: simpleNav ? (nav as Doc).title : undefined,
    description: data.description,
    access: data.access === 'pro' ? 'pro' : 'free',
    accessSet: 'access' in data,
    body,
    mux: data.mux ?? null,
    video: data.video ?? {},
    walkthrough: wt ? { org: wt.org, shots: wt.shots ?? [] } : { shots: [] },
    quiz: ((data.quiz as Doc[]) ?? []).map(q => ({ q: q.q, options: (q.options ?? []).map((text: string) => ({ text })), answer: q.answer })),
    interview: (data.interview as Doc[]) ?? [],
    links: (data.links as Doc[]) ?? [],
    extra: Object.keys(extra).length ? extra : null
  }
}

/** Rebuilds frontmatter, keeping the key order of `previous` when there is one. */
export function lessonToFrontmatter(doc: Doc, previous?: Frontmatter): Frontmatter {
  const fm: Frontmatter = {}
  fm.title = doc.title
  if (doc.navTitle) fm.navigation = { title: doc.navTitle }
  if (doc.description) fm.description = doc.description
  if (doc.access === 'pro' || previous?.access !== undefined) fm.access = doc.access
  if (doc.mux) fm.mux = doc.mux
  if (doc.video?.id) fm.video = clean({ id: doc.video.id, start: doc.video.start, end: doc.video.end })
  if (doc.links?.length) fm.links = doc.links.map((l: Doc) => clean({ label: l.label, icon: l.icon, to: l.to, target: l.target }))
  if (doc.walkthrough?.shots?.length) {
    fm.walkthrough = clean({
      org: doc.walkthrough.org,
      shots: doc.walkthrough.shots.map((s: Doc) => clean({ shot: s.shot, screen: s.screen, say: s.say, onscreen: s.onscreen, seconds: s.seconds }))
    })
  }
  if (doc.quiz?.length) fm.quiz = doc.quiz.map((q: Doc) => ({ q: q.q, options: (q.options ?? []).map((o: Doc) => o.text), answer: q.answer }))
  if (doc.interview?.length) fm.interview = doc.interview.map((i: Doc) => ({ q: i.q, a: i.a }))
  Object.assign(fm, doc.extra ?? {})
  return ordered(fm, previous)
}

/* ----------------------------------------------------------------- showcase */

const SHOWCASE_LIST_KEYS = ['datasets', 'techniques']
const SHOWCASE_KEYS = ['title', 'description', 'image', 'author', 'authorUrl', 'domain', 'difficulty', 'publishedAt', 'kpis', 'recipe', ...SHOWCASE_LIST_KEYS]

export function showcaseFromMarkdown(data: Frontmatter, body: string): Doc {
  const extra = Object.fromEntries(Object.entries(data).filter(([k]) => !SHOWCASE_KEYS.includes(k)))
  const doc: Doc = { body, extra: Object.keys(extra).length ? extra : null }
  for (const k of SHOWCASE_KEYS) doc[k] = data[k]
  for (const k of SHOWCASE_LIST_KEYS) doc[k] = ((data[k] as string[]) ?? []).map(name => ({ name }))
  doc.kpis = (data.kpis as Doc[]) ?? []
  doc.recipe = (data.recipe as Doc[]) ?? []
  return doc
}

export function showcaseToFrontmatter(doc: Doc, previous?: Frontmatter): Frontmatter {
  const fm: Frontmatter = {}
  for (const k of ['title', 'description', 'image', 'author', 'authorUrl', 'domain', 'difficulty', 'publishedAt']) {
    if (doc[k] != null && doc[k] !== '') fm[k] = doc[k]
  }
  for (const k of SHOWCASE_LIST_KEYS) if (doc[k]?.length) fm[k] = doc[k].map((x: Doc) => x.name)
  if (doc.kpis?.length) fm.kpis = doc.kpis.map((x: Doc) => clean({ name: x.name, formula: x.formula, note: x.note }))
  if (doc.recipe?.length) fm.recipe = doc.recipe.map((x: Doc) => clean({ step: x.step, detail: x.detail }))
  Object.assign(fm, doc.extra ?? {})
  return ordered(fm, previous)
}

/* ---------------------------------------------------------------- resources */

const RESOURCE_KEYS = ['title', 'description', 'url', 'category', 'icon', 'submittedBy', 'submittedByUrl', 'featured']

export function resourceFromMarkdown(data: Frontmatter): Doc {
  const extra = Object.fromEntries(Object.entries(data).filter(([k]) => !RESOURCE_KEYS.includes(k)))
  const doc: Doc = { extra: Object.keys(extra).length ? extra : null }
  for (const k of RESOURCE_KEYS) doc[k] = data[k]
  doc.featured = Boolean(data.featured)
  doc.featuredSet = 'featured' in data
  return doc
}

export function resourceToFrontmatter(doc: Doc, previous?: Frontmatter): Frontmatter {
  const fm: Frontmatter = {}
  for (const k of RESOURCE_KEYS) {
    if (k === 'featured') {
      if (doc.featured || previous?.featured !== undefined) fm.featured = Boolean(doc.featured)
    } else if (doc[k] != null && doc[k] !== '') {
      fm[k] = doc[k]
    }
  }
  Object.assign(fm, doc.extra ?? {})
  return ordered(fm, previous)
}

/* ------------------------------------------------------------------ helpers */

function clean<T extends Doc>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '')) as T
}

/** Keys in the order the existing file had them; new keys at the end. */
function ordered(fm: Frontmatter, previous?: Frontmatter): Frontmatter {
  if (!previous) return fm
  const out: Frontmatter = {}
  for (const k of Object.keys(previous)) if (k in fm) out[k] = fm[k]
  for (const k of Object.keys(fm)) if (!(k in out)) out[k] = fm[k]
  return out
}

/** Semantic equality: what the site would parse, ignoring YAML formatting. */
export function sameContent(a: { data: Frontmatter, body: string }, b: { data: Frontmatter, body: string }) {
  return JSON.stringify(sortKeys(a.data)) === JSON.stringify(sortKeys(b.data)) && a.body.trim() === b.body.trim()
}
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys((v as Doc)[k])]))
  }
  return v
}
