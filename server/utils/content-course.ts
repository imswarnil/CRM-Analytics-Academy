/**
 * The course as it is committed: every English section and lesson, and the
 * people registry, read from GitHub in one GraphQL request.
 *
 * Read from GitHub rather than from the deployed site so the editor shows what
 * main holds right now — including a commit made a minute ago that has not
 * deployed yet. Cached per commit, so a reload costs one ref lookup until
 * somebody commits again.
 */
import { parse as parseYaml } from 'yaml'

export interface CourseLesson {
  /** File name inside the section: 03.functions.md */
  file: string
  /** Repo path: content/en/07.saql/03.functions.md */
  path: string
  sha: string
  num: number
  slug: string
  title: string
  navTitle: string | null
  access: 'free' | 'pro'
  authors: string[]
  credits: number
  /** Route on the site: /saql/functions */
  route: string
}

export interface CourseSection {
  /** Folder name: 07.saql */
  dir: string
  path: string
  /** Git tree sha of the folder — the reorder's optimistic lock. */
  treeSha: string
  num: number
  slug: string
  title: string
  icon: string | null
  /** Blob sha of .navigation.yml, or null when the folder has none. */
  navSha: string | null
  lessons: CourseLesson[]
}

export interface PersonEntry {
  slug: string
  path: string
  sha: string
  name: string
  role: string
  avatar: string | null
  headline: string | null
}

export interface Course {
  head: string
  /** Tree sha of content/en — the section reorder's optimistic lock. */
  enTreeSha: string
  sections: CourseSection[]
  people: PersonEntry[]
}

interface GqlBlob { text?: string | null }
interface GqlEntry<O> { name: string, type: string, oid: string, object?: O | null }
interface GqlTree<O> { oid: string, entries: GqlEntry<O>[] }

const QUERY = `
query($owner: String!, $name: String!, $en: String!, $people: String!) {
  repository(owner: $owner, name: $name) {
    en: object(expression: $en) {
      ... on Tree { oid entries { name type oid object {
        ... on Tree { oid entries { name type oid object { ... on Blob { text } } } }
      } } }
    }
    people: object(expression: $people) {
      ... on Tree { oid entries { name type oid object { ... on Blob { text } } } }
    }
  }
}`

/** Frontmatter of a markdown file, parsed; {} when absent or unparseable. */
export function frontmatterOf(raw: string): Record<string, unknown> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  try {
    const data = parseYaml(m[1]!)
    return data && typeof data === 'object' ? data as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function yamlOf(raw: string): Record<string, unknown> {
  try {
    const data = parseYaml(raw)
    return data && typeof data === 'object' ? data as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

/** content/en/07.saql/03.functions.md → /saql/functions (index lessons are the section route). */
export function lessonRoute(sectionDir: string, file: string): string {
  const section = splitPrefix(sectionDir).slug
  const lesson = splitPrefix(file).slug
  return lesson === 'index' ? `/${section}` : `/${section}/${lesson}`
}

export async function readCourse(head?: string): Promise<Course> {
  const commit = head ?? await mainHead()
  return memo(`content:course:${commit}`, 10 * 60_000, async () => {
    const [owner, name] = contentRepo().split('/')
    const data = await graphql<{
      repository: {
        en: GqlTree<GqlTree<GqlBlob>> | null
        people: GqlTree<GqlBlob> | null
      }
    }>(QUERY, { owner, name, en: `${commit}:content/en`, people: `${commit}:content/people` })

    const en = data.repository.en
    if (!en) throw createError({ statusCode: 502, statusMessage: 'content/en is missing on the content branch.' })

    const sections: CourseSection[] = en.entries
      .filter(e => e.type === 'tree' && e.object)
      .map((dir) => {
        const { num, slug } = splitPrefix(dir.name)
        const entries = dir.object!.entries
        const nav = entries.find(f => f.name === '.navigation.yml')
        const navData = nav?.object?.text ? yamlOf(nav.object.text) : {}
        const lessons: CourseLesson[] = entries
          .filter(f => f.type === 'blob' && f.name.endsWith('.md'))
          .map((f) => {
            const fm = frontmatterOf(f.object?.text ?? '')
            const nav = fm.navigation as { title?: unknown } | undefined
            const split = splitPrefix(f.name)
            return {
              file: f.name,
              path: `content/en/${dir.name}/${f.name}`,
              sha: f.oid,
              num: split.num,
              slug: split.slug,
              title: typeof fm.title === 'string' ? fm.title : split.slug,
              navTitle: nav && typeof nav.title === 'string' ? nav.title : null,
              access: fm.access === 'pro' ? 'pro' as const : 'free' as const,
              authors: Array.isArray(fm.authors) ? fm.authors.filter((a): a is string => typeof a === 'string') : [],
              credits: Array.isArray(fm.credits) ? fm.credits.length : 0,
              route: lessonRoute(dir.name, f.name)
            }
          })
          .sort((a, b) => a.file.localeCompare(b.file))
        return {
          dir: dir.name,
          path: `content/en/${dir.name}`,
          treeSha: dir.oid,
          num,
          slug,
          title: typeof navData.title === 'string' ? navData.title : slug,
          icon: typeof navData.icon === 'string' ? navData.icon : null,
          navSha: nav?.oid ?? null,
          lessons
        }
      })
      .sort((a, b) => a.dir.localeCompare(b.dir))

    const people: PersonEntry[] = (data.repository.people?.entries ?? [])
      .filter(e => e.type === 'blob' && e.name.endsWith('.yml'))
      .map((e) => {
        const p = yamlOf(e.object?.text ?? '')
        return {
          slug: e.name.replace(/\.yml$/, ''),
          path: `content/people/${e.name}`,
          sha: e.oid,
          name: typeof p.name === 'string' ? p.name : e.name,
          role: typeof p.role === 'string' ? p.role : 'community',
          avatar: typeof p.avatar === 'string' ? p.avatar : null,
          headline: typeof p.headline === 'string' ? p.headline : null
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return { head: commit, enTreeSha: en.oid, sections, people }
  })
}
