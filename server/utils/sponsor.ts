/**
 * Sponsorships (app.sponsor): requested on /sponsor, invoiced through Stripe
 * from /admin, designed and published by the sponsor at /sponsor/studio,
 * approved by the owner, live for their package's days once paid AND approved.
 */
export interface SponsorCreative {
  logo: string
  /** A photo or product shot for the card and tile formats. */
  photo: string
  headline: string
  tagline: string
  body: string
  /** A price or offer, as the sponsor writes it ("From $49/mo", "Free trial"). */
  price: string
  /** The website shown under the company name (defaults to the link's host). */
  website: string
  cta: string
  url: string
  bg: string
  fg: string
  accent: string
  layout: 'image' | 'side' | 'text'
  radius: 'square' | 'rounded' | 'pill'
  font: 'sans' | 'serif' | 'mono'
}
const pickOne = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (list.includes(v as T) ? v as T : fallback)
const IMAGE = /^(https:\/\/[^\s]+|\/media\/[\w/.-]+)$/i

const HEX = /^#[0-9a-f]{6}$/i
const clip = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 ? ' ' : c)).join('').trim().slice(0, n)

/** Validates a sponsor's banner. Links must be https; colours must be hex. */
export function cleanCreative(input: Record<string, unknown>): SponsorCreative {
  const url = clip(input.url, 300)
  const logo = clip(input.logo, 400)
  const photo = clip(input.photo, 400)
  if (url && !/^https:\/\/[^\s]+$/i.test(url)) throw createError({ statusCode: 400, statusMessage: 'The link must start with https://' })
  // Images are uploads (/media/…, POST /api/upload) or https:// URLs.
  if (logo && !IMAGE.test(logo)) throw createError({ statusCode: 400, statusMessage: 'Upload a logo or use an https:// image.' })
  if (photo && !IMAGE.test(photo)) throw createError({ statusCode: 400, statusMessage: 'Upload a photo or use an https:// image.' })
  return {
    logo,
    photo,
    headline: clip(input.headline, 70),
    tagline: clip(input.tagline, 80),
    body: clip(input.body, 220),
    price: clip(input.price, 30),
    website: clip(input.website, 60).replace(/^https?:\/\//i, ''),
    cta: clip(input.cta, 24),
    url,
    bg: HEX.test(String(input.bg)) ? String(input.bg) : '#0c1b33',
    fg: HEX.test(String(input.fg)) ? String(input.fg) : '#ffffff',
    accent: HEX.test(String(input.accent)) ? String(input.accent) : '#2f5bea',
    layout: pickOne(input.layout, ['image', 'side', 'text'] as const, 'image'),
    radius: pickOne(input.radius, ['square', 'rounded', 'pill'] as const, 'rounded'),
    font: pickOne(input.font, ['sans', 'serif', 'mono'] as const, 'sans')
  }
}

/** A sponsorship row as the portal and admin see it. */
export function sponsorView(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    company: String(r.company),
    email: String(r.email),
    package: String(r.package),
    days: Number(r.days),
    status: String(r.status),
    creative: (r.creative ?? {}) as Partial<SponsorCreative>,
    creativeStatus: String(r.creative_status),
    reviewNote: (r.review_note as string | null) ?? null,
    invoiceUrl: (r.invoice_url as string | null) ?? null,
    startsAt: r.starts_at ?? null,
    endsAt: r.ends_at ?? null,
    createdAt: r.created_at
  }
}

/** Goes live when paid and approved; ends when its days are up. */
export async function settleSponsors(): Promise<void> {
  const sql = useDb()
  await sql`update app.sponsor set status = 'ended' where status = 'live' and ends_at < now()`
  await sql`
    update app.sponsor set status = 'live', starts_at = now(), ends_at = now() + make_interval(days => days)
    where status = 'paid' and creative_status = 'approved'`
}

/** The live banners. Memoised a minute per isolate: one query per isolate, not per view. */
export async function liveSponsors(): Promise<{ id: number, company: string, creative: SponsorCreative }[]> {
  return memo('sponsor-live', 60_000, async () => {
    await settleSponsors()
    const rows = await useDb()`
      select id, company, creative from app.sponsor
      where status = 'live' and creative_status = 'approved' and now() between starts_at and ends_at
      order by starts_at`
    return rows.map(r => ({ id: Number(r.id), company: String(r.company), creative: r.creative as SponsorCreative }))
  }, () => true)
}

/** One view or click of a live sponsor on a page (app.sponsor_stat, per day and page). */
export async function countSponsor(id: number, kind: 'view' | 'click', path: string): Promise<void> {
  const clean = path.replace(/^\/(es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/, '').slice(0, 200) || '/'
  if (!Number.isInteger(id) || id <= 0 || !/^\/[a-z0-9/-]*$/.test(clean)) return
  await useDb()`
    insert into app.sponsor_stat (sponsor_id, path, views, clicks)
    select ${id}, ${clean}, ${kind === 'view' ? 1 : 0}, ${kind === 'click' ? 1 : 0}
    where exists (select 1 from app.sponsor where id = ${id} and status = 'live')
    on conflict (sponsor_id, day, path) do update set views = app.sponsor_stat.views + excluded.views, clicks = app.sponsor_stat.clicks + excluded.clicks`
}
