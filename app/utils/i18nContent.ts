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

/** Recursively rewrite a Nuxt Content navigation tree's paths to route paths. */
export function localizeNavigation<T extends { path?: string, children?: T[] }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    path: item.path ? contentToRoutePath(item.path) : item.path,
    children: item.children ? localizeNavigation(item.children) : undefined
  }))
}
