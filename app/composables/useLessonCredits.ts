/**
 * Who wrote a lesson and whose work it embeds, resolved for rendering and for
 * JSON-LD.
 *
 * Authors and credits are declared on the ENGLISH lesson only (translations
 * are generated and may mangle or drop the fields), so a translated page reads
 * them from the English document — the same way it borrows `mux`. Author slugs
 * resolve against the people collection (content/people/<slug>.yml); a lesson
 * with no authors is the site owner's.
 */
import type { Ref } from 'vue'

export interface LessonPerson {
  slug: string
  name: string
  role: string
  avatar: string | null
  headline: string | null
  links: Record<string, string>
  /** Their card on /instructors. */
  to: string
}

export interface LessonCreditItem extends Omit<LessonCredit, 'kind'> {
  kind: string
}

export interface VideoCredit {
  author: string
  authorUrl: string | null
  title: string | null
  url: string
}

interface CreditFields {
  authors?: string[]
  credits?: LessonCreditItem[]
  video?: { id: string, title?: string, author?: string, authorUrl?: string }
}

/** content/people/jane-doe.yml → jane-doe, whatever shape the item's stem has. */
export const personSlug = (item: { stem?: string, id?: string }) =>
  String(item.stem ?? item.id ?? '').split('/').pop()!.replace(/\.yml$/, '')

export function usePeople() {
  return useAsyncData('people', () => queryCollection('people').all(), { default: () => [] })
}

export function toLessonPerson(p: { stem?: string, id?: string, name: string, role: string, avatar?: string, headline?: string, links?: Record<string, string | undefined> }): LessonPerson {
  const slug = personSlug(p)
  return {
    slug,
    name: p.name,
    role: p.role,
    avatar: p.avatar ?? null,
    headline: p.headline ?? null,
    links: Object.fromEntries(Object.entries(p.links ?? {}).filter((e): e is [string, string] => typeof e[1] === 'string')),
    to: `/instructors#${slug}`
  }
}

export async function useLessonCredits(opts: {
  page: Ref<CreditFields | null | undefined>
  contentPath: string
  englishPath: string
}) {
  const isEnglish = opts.contentPath === opts.englishPath
  const [{ data: english }, { data: people }] = await Promise.all([
    useAsyncData(`credits-${opts.englishPath}`, async () => {
      if (isEnglish) return null
      const doc = await queryCollection('docs').path(opts.englishPath).select('authors', 'credits', 'video').first()
      return (doc as CreditFields | null) ?? null
    }),
    usePeople()
  ])

  const source = computed<CreditFields>(() => (isEnglish ? opts.page.value : english.value) ?? opts.page.value ?? {})

  const authors = computed<LessonPerson[]>(() => {
    const all = (people.value ?? []).map(toLessonPerson)
    const bySlug = new Map(all.map(p => [p.slug, p]))
    const slugs = source.value.authors?.length ? source.value.authors : [OWNER_SLUG]
    return slugs.map(s => bySlug.get(s) ?? {
      // A slug with no registry entry still credits someone; the editor
      // refuses to save one, so this only covers a hand edit.
      slug: s,
      name: s === OWNER_SLUG ? SITE.author : s.replace(/-/g, ' '),
      role: 'instructor',
      avatar: null,
      headline: null,
      links: {},
      to: `/instructors#${s}`
    })
  })

  const credits = computed<LessonCreditItem[]>(() => source.value.credits ?? [])

  const videoCredit = computed<VideoCredit | null>(() => {
    const v = source.value.video
    if (!v?.id || !v.author) return null
    return { author: v.author, authorUrl: v.authorUrl ?? null, title: v.title ?? null, url: `https://www.youtube.com/watch?v=${v.id}` }
  })

  const personLd = (p: LessonPerson) => ({
    '@type': 'Person',
    'name': p.name,
    'url': `${SITE.url}${p.to}`,
    ...(Object.keys(p.links).length ? { sameAs: Object.values(p.links) } : {})
  })

  const CREDIT_TYPES: Record<string, string> = {
    video: 'VideoObject',
    post: 'BlogPosting',
    article: 'Article',
    image: 'ImageObject',
    dataset: 'Dataset'
  }
  const creditLd = (c: { kind: string, title: string, url: string, author: string, authorUrl?: string | null, license?: string }) => ({
    '@type': CREDIT_TYPES[c.kind] ?? 'CreativeWork',
    'name': c.title,
    'url': c.url,
    'author': { '@type': 'Person', 'name': c.author, ...(c.authorUrl ? { url: c.authorUrl } : {}) },
    ...(c.license ? { license: c.license } : {})
  })

  /**
   * schema.org: `citation` for every credited source; `isBasedOn` for the
   * embedded third-party video the lesson is built around.
   */
  const citationLd = computed(() => {
    const out: Record<string, unknown> = {}
    if (credits.value.length) out.citation = credits.value.map(creditLd)
    if (videoCredit.value) {
      out.isBasedOn = creditLd({
        kind: 'video',
        title: videoCredit.value.title ?? 'YouTube video',
        url: videoCredit.value.url,
        author: videoCredit.value.author,
        authorUrl: videoCredit.value.authorUrl
      })
    }
    return out
  })

  const authorLd = computed(() => {
    const list = authors.value.map(personLd)
    return list.length === 1 ? list[0] : list
  })

  return { authors, credits, videoCredit, authorLd, citationLd }
}
