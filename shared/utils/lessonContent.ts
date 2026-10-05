/**
 * The rules for lesson frontmatter, the people registry and file naming —
 * shared by the admin editor (to check as you type) and the server routes (to
 * refuse a bad save). content.config.ts holds the same shapes as zod schemas
 * for the build; keep the three in step.
 */

/** What a third-party credit can point at. */
export const CREDIT_KINDS = ['video', 'post', 'article', 'image', 'dataset'] as const
export type CreditKind = typeof CREDIT_KINDS[number]

/** How someone appears on /instructors. */
export const PERSON_ROLES = ['instructor', 'blogger', 'creator', 'community', 'maintainer'] as const
export type PersonRole = typeof PERSON_ROLES[number]

/** The registry entry for the site owner: the author of any lesson that names none. */
export const OWNER_SLUG = 'swarnil-singhai'

/** Link keys a person entry may carry, in display order. */
export const PERSON_LINK_KEYS = ['site', 'linkedin', 'youtube', 'x', 'github'] as const

export interface LessonCredit {
  kind: CreditKind
  title: string
  author: string
  authorUrl?: string
  url: string
  license?: string
  note?: string
}

/** "Building a Pipeline Dashboard!" → "building-a-pipeline-dashboard". */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}

/**
 * Numeric prefixes are always at least two digits. They sort as strings, so
 * an unpadded "10." lands between "1." and "2." in the sidebar.
 */
export function padPrefix(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

/** "03.functions.md" → { num: 3, width: 2, slug: "functions", ext: ".md" }. */
export function splitPrefix(name: string): { num: number, width: number, slug: string, ext: string } {
  const m = name.match(/^(\d+)\.(.+?)(\.md)?$/)
  if (!m) return { num: Number.NaN, width: 2, slug: name.replace(/\.md$/, ''), ext: name.endsWith('.md') ? '.md' : '' }
  return { num: Number(m[1]), width: Math.max(2, m[1]!.length), slug: m[2]!, ext: m[3] ?? '' }
}

const isUrl = (v: unknown) => typeof v === 'string' && /^https?:\/\/\S+$/.test(v)
const isText = (v: unknown) => typeof v === 'string' && v.trim().length > 0

/**
 * Problems with a lesson's frontmatter, as sentences an author can act on.
 * `knownPeople`, when given, is every slug in content/people — an author that
 * is not there would render as a bare slug, so it is refused.
 */
export function lessonProblems(data: Record<string, unknown>, knownPeople?: Set<string>): string[] {
  const out: string[] = []
  if (!isText(data.title)) out.push('title is required.')
  if (!isText(data.description)) out.push('description is required.')
  if (data.access !== undefined && data.access !== 'free' && data.access !== 'pro') out.push('access must be free or pro.')

  if (data.authors !== undefined) {
    if (!Array.isArray(data.authors) || data.authors.some(a => typeof a !== 'string')) {
      out.push('authors must be a list of people slugs.')
    } else if (knownPeople) {
      for (const a of data.authors as string[]) {
        if (!knownPeople.has(a)) out.push(`authors: "${a}" is not in content/people — add the person first.`)
      }
    }
  }

  if (data.credits !== undefined) {
    if (!Array.isArray(data.credits)) {
      out.push('credits must be a list.')
    } else {
      (data.credits as Record<string, unknown>[]).forEach((c, i) => {
        const n = `credits[${i + 1}]`
        if (!c || typeof c !== 'object') return out.push(`${n} must be an object.`)
        if (!(CREDIT_KINDS as readonly string[]).includes(String(c.kind))) out.push(`${n}.kind must be one of ${CREDIT_KINDS.join(', ')}.`)
        if (!isText(c.title)) out.push(`${n}.title is required.`)
        if (!isText(c.author)) out.push(`${n}.author is required.`)
        if (!isUrl(c.url)) out.push(`${n}.url must be an http(s) link.`)
        if (c.authorUrl !== undefined && !isUrl(c.authorUrl)) out.push(`${n}.authorUrl must be an http(s) link.`)
      })
    }
  }

  if (data.video !== undefined) {
    const v = data.video as Record<string, unknown> | null
    if (!v || typeof v !== 'object' || !isText(v.id)) out.push('video.id is required when video is set.')
    else {
      if (v.authorUrl !== undefined && !isUrl(v.authorUrl)) out.push('video.authorUrl must be an http(s) link.')
      for (const k of ['start', 'end'] as const) {
        if (v[k] !== undefined && typeof v[k] !== 'number') out.push(`video.${k} must be a number of seconds.`)
      }
    }
  }
  return out
}

/** Problems with a content/people/<slug>.yml entry. */
export function personProblems(data: Record<string, unknown>): string[] {
  const out: string[] = []
  if (!isText(data.name)) out.push('name is required.')
  if (!(PERSON_ROLES as readonly string[]).includes(String(data.role))) out.push(`role must be one of ${PERSON_ROLES.join(', ')}.`)
  if (data.avatar !== undefined && !isUrl(data.avatar) && !(typeof data.avatar === 'string' && data.avatar.startsWith('/'))) {
    out.push('avatar must be an http(s) link or a /public path.')
  }
  if (data.links !== undefined) {
    if (!data.links || typeof data.links !== 'object') out.push('links must be a map.')
    else {
      for (const [k, v] of Object.entries(data.links as Record<string, unknown>)) {
        if (!(PERSON_LINK_KEYS as readonly string[]).includes(k)) out.push(`links.${k} is not one of ${PERSON_LINK_KEYS.join(', ')}.`)
        else if (!isUrl(v)) out.push(`links.${k} must be an http(s) link.`)
      }
    }
  }
  return out
}
