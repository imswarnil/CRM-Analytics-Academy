import type { H3Event } from 'h3'

/**
 * Server side of the monthly sponsorship (tables in server/db/010_sponsors.sql).
 *
 * File and route names say "partner" / "placement", never "sponsor" or "ad":
 * filter lists match those words in URLs, and a blocked request on a lesson
 * page is a broken lesson page.
 */
type Sql = ReturnType<typeof useDb>

export const PARTNER_PRODUCT_ENV = 'DODO_PRODUCT_SPONSOR_MONTH'

export function partnerProduct(): string | undefined {
  return process.env[PARTNER_PRODUCT_ENV]
}

/** "2026-11" → "2026-11-01" (the column type is date, first of month). */
export const monthDate = (key: string) => `${key}-01`

/**
 * Releases holds whose checkout was abandoned. Run lazily before anything
 * that reads or claims months, so no cron is needed: a stale hold blocks
 * nobody for longer than the next visit to the calendar.
 */
export async function releaseExpiredHolds(sql: Sql) {
  await sql`
    update app.sponsor_booking
    set status = 'cancelled', note = coalesce(note, 'hold expired'), updated_at = now()
    where status = 'held' and hold_expires_at < now()
  `
}

export interface SponsorAccount {
  id: string
  name: string
  website: string | null
  contactEmail: string
}

export async function findSponsor(sql: Sql, userId: string): Promise<SponsorAccount | null> {
  const rows = await sql`select id::text, name, website, contact_email from app.sponsor where user_id = ${userId} limit 1`
  const r = rows[0]
  return r ? { id: r.id as string, name: r.name as string, website: r.website as string | null, contactEmail: r.contact_email as string } : null
}

/** Normalises a brand website to an https URL, or null. */
export function cleanWebsite(raw: unknown): string | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    u.protocol = 'https:'
    return u.toString().slice(0, 300)
  } catch {
    return null
  }
}

/** A click-through URL must be absolute https. */
export function cleanClickUrl(raw: unknown): string | null {
  const s = String(raw ?? '').trim()
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:') return null
    return u.toString().slice(0, 500)
  } catch {
    return null
  }
}

/** Creative images must be our own uploads, served by /media. */
export function cleanMediaUrl(raw: unknown): string | null {
  const s = String(raw ?? '').trim()
  if (!s) return null
  return /^\/media\/brand\/[\w-]+\/[\w.-]+\.(png|jpg|webp)$/.test(s) ? s : null
}

export interface CurrentPlacement {
  month: string
  sponsor: { name: string } | null
  creatives: Partial<Record<PartnerFormat, PartnerCreative>>
}

/**
 * The current month's sponsor and their newest published creative per
 * format. Tolerates a database that has not run 010 yet: no tables means no
 * sponsor, and the site shows the house placeholder.
 */
export async function loadCurrentPlacement(): Promise<CurrentPlacement> {
  const month = partnerMonthKey(new Date())
  const empty: CurrentPlacement = { month, sponsor: null, creatives: {} }
  if (!process.env.DATABASE_URL) return empty
  try {
    const sql = useDb()
    const rows = await sql`
      select s.id::text as sponsor_id, s.name
      from app.sponsor_booking b
      join app.sponsor s on s.id = b.sponsor_id
      where b.month = ${monthDate(month)}::date and b.status = 'paid'
      limit 1
    `
    const sponsor = rows[0]
    if (!sponsor) return empty
    const creatives = await sql`
      select distinct on (format)
        id::text, format, mode, image_url, image_mobile_url, logo_url, headline, body, cta, theme, alt
      from app.sponsor_creative
      where sponsor_id = ${sponsor.sponsor_id}::uuid and status = 'published'
      order by format, published_at desc nulls last
    `
    const out: CurrentPlacement = { month, sponsor: { name: sponsor.name as string }, creatives: {} }
    for (const c of creatives) {
      out.creatives[c.format as PartnerFormat] = {
        id: c.id as string,
        format: c.format as PartnerFormat,
        mode: c.mode as PartnerMode,
        imageUrl: c.image_url as string | null,
        imageMobileUrl: c.image_mobile_url as string | null,
        logoUrl: c.logo_url as string | null,
        headline: c.headline as string | null,
        body: c.body as string | null,
        cta: c.cta as string | null,
        theme: c.theme as PartnerTheme,
        alt: c.alt as string | null,
        sponsor: sponsor.name as string
      }
    }
    return out
  } catch (e) {
    console.error('placement: could not load the current sponsor', e)
    return empty
  }
}

/**
 * Edge cache through the Workers Cache API (caches.default), keyed by a
 * synthetic URL. A Worker's own responses are not cached by Cloudflare's CDN
 * automatically — Cache-Control alone only helps browsers — so the shared,
 * per-colo copy has to be put there by hand. Outside Workers (nuxt dev) it
 * simply runs `fn`.
 */
interface EdgeCacheStorage {
  default: {
    match: (req: Request) => Promise<Response | undefined>
    put: (req: Request, res: Response) => Promise<void>
    delete: (req: Request) => Promise<boolean>
  }
}
function edgeCacheStore(): EdgeCacheStorage['default'] | null {
  const c = (globalThis as unknown as { caches?: EdgeCacheStorage }).caches
  return c?.default ?? null
}

export async function edgeCached<T>(event: H3Event, key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const cache = edgeCacheStore()
  const req = new Request(`https://edge-cache.internal/${key}`)
  if (cache) {
    try {
      const hit = await cache.match(req)
      if (hit) return await hit.json() as T
    } catch { /* cache unavailable: fall through */ }
  }
  const value = await fn()
  if (cache) {
    const res = new Response(JSON.stringify(value), {
      headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${ttlSeconds}` }
    })
    const put = cache.put(req, res).catch(() => {})
    const ctx = event.context.cloudflare?.context as { waitUntil?: (p: Promise<unknown>) => void } | undefined
    if (ctx?.waitUntil) ctx.waitUntil(put)
    else await put
  }
  return value
}

/** Drops a key from this colo's edge cache (best effort; other colos expire on their own). */
export async function edgeForget(key: string) {
  const cache = edgeCacheStore()
  if (!cache) return
  try {
    await cache.delete(new Request(`https://edge-cache.internal/${key}`))
  } catch { /* ignore */ }
}

export interface CreativeInput {
  format: PartnerFormat
  mode: PartnerMode
  imageUrl: string | null
  imageMobileUrl: string | null
  logoUrl: string | null
  headline: string | null
  body: string | null
  cta: string | null
  theme: PartnerTheme
  clickUrl: string
  alt: string | null
}

/**
 * Validates a creative from the studio. Throws a 400 naming the first
 * problem; returns the cleaned record otherwise.
 */
export function validateCreative(raw: Record<string, unknown>): CreativeInput {
  const bad = (m: string) => createError({ statusCode: 400, statusMessage: m })
  const text = (v: unknown, max: number, field: string) => {
    const s = String(v ?? '').replace(/\s+/g, ' ').trim()
    if (s.length > max) throw bad(`The ${field} must be ${max} characters or fewer.`)
    return s || null
  }

  const format = raw.format as PartnerFormat
  if (!['leaderboard', 'square', 'text'].includes(format)) throw bad('Unknown format.')
  const mode: PartnerMode = format === 'text' ? 'designed' : raw.mode === 'image' ? 'image' : 'designed'
  const theme: PartnerTheme = raw.theme === 'navy' || raw.theme === 'signal' ? raw.theme : 'paper'

  const clickUrl = cleanClickUrl(raw.clickUrl)
  if (!clickUrl) throw bad('The link must be a full https:// address.')

  const out: CreativeInput = {
    format,
    mode,
    imageUrl: null,
    imageMobileUrl: null,
    logoUrl: raw.logoUrl ? cleanMediaUrl(raw.logoUrl) : null,
    headline: text(raw.headline, PARTNER_LIMITS.headline, 'headline'),
    body: text(raw.body, PARTNER_LIMITS.body, 'body'),
    cta: text(raw.cta, PARTNER_LIMITS.cta, 'button text'),
    theme,
    clickUrl,
    alt: text(raw.alt, PARTNER_LIMITS.alt, 'alt text')
  }
  if (raw.logoUrl && !out.logoUrl) throw bad('Upload the logo here rather than linking to it.')

  if (mode === 'image') {
    out.imageUrl = cleanMediaUrl(raw.imageUrl)
    if (!out.imageUrl) throw bad('Upload an image for this creative.')
    if (format === 'leaderboard' && raw.imageMobileUrl) {
      out.imageMobileUrl = cleanMediaUrl(raw.imageMobileUrl)
      if (!out.imageMobileUrl) throw bad('Upload the mobile image here rather than linking to it.')
    }
    if (!out.alt) throw bad('Describe the image in the alt text — screen readers read it out.')
  } else if (!out.headline) {
    throw bad('Write a headline.')
  }
  return out
}

/** True when the sponsor owns at least one paid month that has not ended. */
export async function hasLiveOrFutureMonth(sql: Sql, sponsorId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from app.sponsor_booking
    where sponsor_id = ${sponsorId}::uuid and status = 'paid'
      and month >= date_trunc('month', now() at time zone 'utc')::date
    limit 1
  `
  return rows.length > 0
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const PLACEMENT_CACHE_KEY = 'placement-current-v1'

/** Called after anything that changes what the site serves. */
export async function placementChanged() {
  forget('placement:')
  await edgeForget(PLACEMENT_CACHE_KEY)
}

/**
 * Pixel dimensions of a PNG, JPEG or WebP from its bytes, without decoding.
 * Returns null for anything it cannot read — the caller rejects those.
 */
export function imageDimensions(b: Uint8Array): { w: number, h: number } | null {
  const u16 = (i: number) => (b[i]! << 8) | b[i + 1]!
  const u32 = (i: number) => ((b[i]! << 24) | (b[i + 1]! << 16) | (b[i + 2]! << 8) | b[i + 3]!) >>> 0
  const le16 = (i: number) => b[i]! | (b[i + 1]! << 8)
  const le24 = (i: number) => b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16)

  // PNG: IHDR is always the first chunk.
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    return { w: u32(16), h: u32(20) }
  }
  // JPEG: walk the segments to the first SOFn.
  if (b.length > 4 && b[0] === 0xFF && b[1] === 0xD8) {
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xFF) return null
      const marker = b[i + 1]!
      const len = u16(i + 2)
      if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
        return { h: u16(i + 5), w: u16(i + 7) }
      }
      i += 2 + len
    }
    return null
  }
  // WebP: RIFF....WEBP then VP8 / VP8L / VP8X.
  if (b.length > 30 && b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) {
    const chunk = String.fromCharCode(b[12]!, b[13]!, b[14]!, b[15]!)
    if (chunk === 'VP8 ') return { w: le16(26) & 0x3FFF, h: le16(28) & 0x3FFF }
    if (chunk === 'VP8L') {
      const bits = b[21]! | (b[22]! << 8) | (b[23]! << 16) | (b[24]! << 24)
      return { w: (bits & 0x3FFF) + 1, h: ((bits >> 14) & 0x3FFF) + 1 }
    }
    if (chunk === 'VP8X') return { w: le24(24) + 1, h: le24(27) + 1 }
  }
  return null
}
