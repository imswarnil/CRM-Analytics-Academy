/**
 * Helpers for locale-aware Nuxt Content.
 *
 * Content lives under content/<locale>/… so every page exists per language.
 * Routes use `prefix_except_default`: the default locale has no URL prefix
 * (/foundations) while others do (/es/foundations). These map between the two.
 */

export const DEFAULT_LOCALE = 'en'

/** Route path (/foundations or /es/foundations) → content path (/en/… or /es/…). */
export function routeToContentPath(routePath: string, localeCodes: string[]): string {
  const segments = routePath.split('/').filter(Boolean)
  // Any path that already starts with a locale code is the content path as-is
  // (content lives under content/<locale>/). Otherwise it's a clean default-
  // locale URL (/foundations) that needs the default-locale prefix.
  if (segments.length && localeCodes.includes(segments[0]!)) {
    return routePath
  }
  return `/${DEFAULT_LOCALE}${routePath === '/' ? '' : routePath}`
}

/** Content path (/en/foundations) → route path (/foundations or /es/foundations). */
export function contentToRoutePath(contentPath: string): string {
  const segments = contentPath.split('/').filter(Boolean)
  if (segments[0] === DEFAULT_LOCALE) {
    const rest = segments.slice(1).join('/')
    return rest ? `/${rest}` : '/'
  }
  return contentPath
}

/**
 * Recursively rewrite a Nuxt Content navigation tree's paths to route paths.
 *
 * `targetLocale` re-prefixes the result for a different locale than the paths
 * came from. That is what lets an untranslated locale borrow the English tree:
 * `/en/foundations` becomes `/de/foundations`, which is a real route that
 * renders the English page via the fallback in `[...slug].vue`.
 */
export function localizeNavigation<T extends { path?: string, children?: T[] }>(
  items: T[],
  targetLocale?: string
): T[] {
  const toRoute = (path: string) => {
    const route = contentToRoutePath(path)
    if (!targetLocale || targetLocale === DEFAULT_LOCALE) return route
    return `/${targetLocale}${route === '/' ? '' : route}`
  }

  return items.map(item => ({
    ...item,
    path: item.path ? toRoute(item.path) : item.path,
    children: item.children ? localizeNavigation(item.children, targetLocale) : undefined
  }))
}

/** Pages with no translated copy; a locale prefix would only redirect back. */
const UNLOCALIZED = /^\/(pricing|teams|nominate|join|team|raw|api|_studio|sample-data|showcase\/)/

/**
 * A link written inside lesson markdown, pointed at the reader's locale.
 *
 * Lessons are authored in English with English links (`/saql/functions`), and
 * the translator copies them verbatim, so every internal link in a German
 * lesson used to drop the reader back into English. Site-internal paths get
 * the locale prefix; external URLs, anchors, files and English-only pages
 * pass through untouched.
 */
export function localizeHref(href: string | undefined, locale: string, localeCodes: string[]): string | undefined {
  if (!href || locale === DEFAULT_LOCALE || !href.startsWith('/') || href.startsWith('//')) return href
  if (UNLOCALIZED.test(href) || /\.[a-z0-9]{2,5}([?#].*)?$/i.test(href)) return href
  const first = href.split(/[/?#]/)[1] ?? ''
  if (localeCodes.includes(first)) return href
  return `/${locale}${href === '/' ? '' : href}`
}
