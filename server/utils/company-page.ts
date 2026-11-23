/**
 * What a company's own home page says about it: title, description, site
 * name, logo, LinkedIn page. Pure (string in, object out) so
 * scripts/check-gtm.mjs can test it; the fetch and the cache are in enrich.ts.
 */
export interface CompanyPage {
  company: string | null
  title: string | null
  description: string | null
  siteName: string | null
  logo: string | null
  linkedin: string | null
}

const ENTITIES: Record<string, string> = { 'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', 'apos': '\'', 'nbsp': ' ', '#39': '\'' }
function decode(s: string): string {
  return s
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const n = e[1] === 'x' || e[1] === 'X' ? Number.parseInt(e.slice(2), 16) : Number(e.slice(1))
        return Number.isFinite(n) && n > 31 ? String.fromCodePoint(n) : ' '
      }
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/\s+/g, ' ')
    .trim()
}
const clip = (s: string | null | undefined, n: number) => {
  const v = decode(String(s ?? ''))
  return v ? v.slice(0, n) : null
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag)
  return m ? (m[2] ?? m[3] ?? m[4] ?? null) : null
}

function meta(html: string, key: string): string | null {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0]
    const k = (attr(tag, 'property') ?? attr(tag, 'name') ?? '').toLowerCase()
    if (k === key) return attr(tag, 'content')
  }
  return null
}

function absolute(href: string | null, base: string): string | null {
  if (!href) return null
  try {
    const u = new URL(href, base)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString().slice(0, 400) : null
  } catch {
    return null
  }
}

/** "acme-corp.co.uk" → "Acme Corp" (the last resort for a name). */
export function nameFromDomain(domain: string): string {
  const parts = domain.split('.')
  const root = parts.length > 2 && /^(co|com|org|net|ac|gov)$/.test(parts[parts.length - 2]!) ? parts[parts.length - 3]! : parts[parts.length - 2] ?? parts[0]!
  return root.split(/[-_]/).filter(Boolean).map(w => w[0]!.toUpperCase() + w.slice(1)).join(' ')
}

export function parseCompanyPage(html: string, domain: string): CompanyPage {
  const head = html.slice(0, 300_000)
  const base = `https://${domain}/`
  const title = clip(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1], 200)
  const description = clip(meta(head, 'og:description') ?? meta(head, 'description'), 400)
  const siteName = clip(meta(head, 'og:site_name') ?? meta(head, 'application-name'), 120)

  const icons: { rel: string, href: string }[] = []
  for (const m of head.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(m[0], 'rel') ?? '').toLowerCase()
    const href = attr(m[0], 'href')
    if (href && /icon/.test(rel)) icons.push({ rel, href })
  }
  const best = icons.find(i => i.rel.includes('apple-touch-icon')) ?? icons.find(i => i.rel.includes('icon'))
  const logo = absolute(best?.href ?? meta(head, 'og:image') ?? '/favicon.ico', base)

  const li = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/company\/([a-z0-9%_.-]+)\/?/i.exec(html.slice(0, 600_000))
  const linkedin = li ? `https://www.linkedin.com/company/${li[1]}` : null

  // A title like "Acme — Data for everyone | Home": the first segment is the name.
  const fromTitle = title?.split(/\s[|–—·:-]\s/)[0]?.trim() || null
  const company = (siteName || (fromTitle && fromTitle.length <= 60 ? fromTitle : null) || nameFromDomain(domain)).slice(0, 120)
  return { company, title, description, siteName, logo, linkedin }
}
