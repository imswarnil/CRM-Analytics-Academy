/**
 * What a URL says about itself: title, description, site name, icon, image.
 *
 * Used to enrich a lead from its company domain and, through /api/url-meta,
 * to show a favicon and preview beside any link a contributor pastes.
 *
 * This fetches URLs chosen by the public, so it is written as an SSRF
 * boundary first: http(s) only, no credentials in the URL, no localhost,
 * private or link-local addresses (literal or by internal-looking hostname),
 * 4 seconds per request and 10 in all, at most five redirects each re-checked, and only the
 * first 512 KB of the body read. It never throws — a page that cannot be
 * read yields the URL and a fallback icon.
 */
export interface UrlMeta {
  url: string
  title?: string
  description?: string
  siteName?: string
  icon?: string
  image?: string
}

const TIMEOUT_MS = 4000 // per request
const TOTAL_MS = 10000 // the whole lookup, redirects and body included
const MAX_BYTES = 512 * 1024
const MAX_REDIRECTS = 5

function fallbackIcon(host: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
}

function isPrivateIpv4(host: string) {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  return a === 10 || a === 127 || a === 0 || a >= 224
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127)
}

/** A URL we are willing to fetch, or null. */
export function safeUrl(input: string): URL | null {
  let u: URL
  try {
    u = new URL(input.trim())
  } catch {
    return null
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  if (u.username || u.password) return null
  if (u.port && !['80', '443'].includes(u.port)) return null
  const host = u.hostname.toLowerCase().replace(/\.$/, '')
  if (!host.includes('.')) return null
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')
    || host.endsWith('.internal') || host.endsWith('.lan') || host.endsWith('.home') || host.endsWith('.corp')) return null
  if (host.startsWith('[') || host.includes(':')) return null // IPv6 literals: not needed, not allowed
  if (isPrivateIpv4(host)) return null
  if (/^\d+$/.test(host) || /^0x/i.test(host)) return null // decimal / hex IP tricks
  return u
}

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    total += value.length
  }
  reader.cancel().catch(() => {})
  const all = new Uint8Array(Math.min(total, MAX_BYTES))
  let offset = 0
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - offset))
    all.set(part, offset)
    offset += part.length
    if (offset >= all.length) break
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(all)
}

const decode = (s: string) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, '\'')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\s+/g, ' ').trim()

function attr(tag: string, name: string) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : undefined
}

function metaContent(html: string, keys: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase()
    if (keys.includes(key)) {
      const c = attr(tag, 'content')
      if (c) return decode(c)
    }
  }
  return undefined
}

function absolute(href: string | undefined, base: URL) {
  if (!href) return undefined
  try {
    const u = new URL(decode(href), base)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : undefined
  } catch {
    return undefined
  }
}

function pickIcon(html: string, base: URL) {
  const links = (html.match(/<link\b[^>]*>/gi) ?? []).map(tag => ({
    rel: (attr(tag, 'rel') ?? '').toLowerCase(),
    href: attr(tag, 'href'),
    sizes: attr(tag, 'sizes') ?? ''
  }))
  const size = (s: string) => Number(s.split('x')[0]) || 0
  const apple = links.filter(l => l.rel.includes('apple-touch-icon')).sort((a, b) => size(b.sizes) - size(a.sizes))[0]
  const icon = links.filter(l => /(^|\s)icon(\s|$)/.test(l.rel) || l.rel.includes('shortcut icon')).sort((a, b) => size(b.sizes) - size(a.sizes))[0]
  return absolute(apple?.href ?? icon?.href, base)
}

export async function fetchUrlMeta(input: string): Promise<UrlMeta> {
  let target = safeUrl(input)
  if (!target) return { url: input }
  const result: UrlMeta = { url: target.toString(), icon: fallbackIcon(target.hostname) }

  const overall = AbortSignal.timeout(TOTAL_MS)
  try {
    let res: Response | undefined
    // Some sites (Akamai geo-routing, consent walls) redirect until a cookie
    // they set comes back. A jar for this one lookup, same host only.
    const jar = new Map<string, string>()
    let jarHost = target.hostname
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (target.hostname !== jarHost) {
        jar.clear()
        jarHost = target.hostname
      }
      res = await fetch(target.toString(), {
        redirect: 'manual',
        signal: AbortSignal.any([overall, AbortSignal.timeout(TIMEOUT_MS)]),
        headers: {
          'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'user-agent': 'Mozilla/5.0 (compatible; CRMAnalyticsAcademyBot/1.0; +https://crmanalytics.imswarnil.com)',
          ...(jar.size ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {})
        }
      })
      if (res.status >= 300 && res.status < 400) {
        const setCookies = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.()
          ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie') as string] : [])
        for (const c of setCookies) {
          const [pair] = c.split(';')
          const eq = pair?.indexOf('=') ?? -1
          if (pair && eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
        }
        const next = safeUrl(new URL(res.headers.get('location') ?? '', target).toString())
        if (!next) return result
        target = next
        continue
      }
      break
    }
    if (!res || !res.ok) return result
    if (!(res.headers.get('content-type') ?? '').includes('html')) return { ...result, url: target.toString() }

    const html = await readCapped(res)
    const head = html.split(/<\/head>/i)[0] ?? html
    const title = metaContent(head, ['og:title', 'twitter:title']) ?? decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
    return {
      url: target.toString(),
      title: title || undefined,
      description: metaContent(head, ['description', 'og:description', 'twitter:description'])?.slice(0, 400),
      siteName: metaContent(head, ['og:site_name', 'application-name']),
      icon: pickIcon(head, target) ?? absolute('/favicon.ico', target) ?? result.icon,
      image: absolute(metaContent(head, ['og:image', 'og:image:url', 'twitter:image']), target)
    }
  } catch {
    return result
  }
}
