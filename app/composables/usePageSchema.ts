type JsonLd = Record<string, unknown>

/** Stable node ids, so every page's schema links into one site graph. */
export const ORG_ID = `${SITE.url}/#organization`
export const WEBSITE_ID = `${SITE.url}/#website`

interface PageSchema {
  name: string
  description?: string
  /** schema.org WebPage subtype: AboutPage, CollectionPage, ContactPage, FAQPage … */
  type?: string
  /** Crumbs between Home and this page, e.g. [{ name: 'Showcase', path: '/showcase' }]. */
  trail?: { name: string, path: string }[]
  /** Further entities for this page (a Course, a Service, an ItemList …). */
  extra?: JsonLd[]
}

/**
 * A typed WebPage and its BreadcrumbList for a hand-written page, plus any
 * page-specific entities. Lessons build their own (TechArticle, HowTo …) in
 * [...slug].vue; this is everything else.
 */
export function usePageSchema(opts: PageSchema | (() => PageSchema)) {
  const route = useRoute()
  const { locale, locales } = useI18n()
  const localePath = useLocalePath()

  const lang = computed(() => locales.value.find(l => l.code === locale.value)?.language || locale.value)

  useJsonLd(computed(() => {
    const o = typeof opts === 'function' ? opts() : opts
    const url = `${SITE.url}${route.path === '/' ? '' : route.path}`
    const abs = (path: string) => `${SITE.url}${path === '/' ? '' : path}`
    const crumbs = [
      { name: 'Home', item: abs(localePath('/')) },
      ...(o.trail ?? []).map(c => ({ name: c.name, item: abs(localePath(c.path)) })),
      { name: o.name, item: url }
    ]
    return [
      {
        '@context': 'https://schema.org',
        '@type': o.type ?? 'WebPage',
        '@id': `${url}#webpage`,
        'url': url,
        'name': o.name,
        ...(o.description ? { description: o.description } : {}),
        'inLanguage': lang.value,
        'isPartOf': { '@id': WEBSITE_ID },
        'publisher': { '@id': ORG_ID },
        'breadcrumb': { '@id': `${url}#breadcrumb` }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        'itemListElement': crumbs.map((c, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'name': c.name,
          'item': c.item
        }))
      },
      ...(o.extra ?? []).map(e => ({ '@context': 'https://schema.org', ...e }))
    ]
  }).value)
}
