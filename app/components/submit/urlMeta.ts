/**
 * Link previews for the contribute form: title, description, site name and a
 * favicon or logo for any URL a contributor types.
 *
 * Asks the site's own /api/url-meta (which fetches the page server-side) and,
 * if that is unavailable, falls back to Google's favicon service so every
 * link still gets an icon. Results are cached per URL for the page's life,
 * so the review step does not refetch what the details step already saw.
 */
export interface UrlMeta {
  url: string
  title?: string
  description?: string
  siteName?: string
  icon?: string
  image?: string
}

const cache = new Map<string, Promise<UrlMeta>>()

export function isHttpUrl(value: string | undefined | null): value is string {
  if (!value) return false
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function fallbackIcon(url: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return ''
  }
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function fetchUrlMeta(raw: string): Promise<UrlMeta> {
  const url = raw.trim()
  const hit = cache.get(url)
  if (hit) return hit
  const request = $fetch<UrlMeta>('/api/url-meta', { query: { url }, timeout: 8000 })
    .then(meta => ({ ...meta, url, icon: meta?.icon || fallbackIcon(url) }))
    .catch(() => ({ url, icon: fallbackIcon(url) }))
  cache.set(url, request)
  return request
}
