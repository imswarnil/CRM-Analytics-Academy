/**
 * Sponsorships (app.sponsor): requested on /sponsor, invoiced through Stripe
 * from /admin, designed and published by the sponsor at /sponsor/studio,
 * approved by the owner, live for their package's days once paid AND approved.
 */
export interface SponsorCreative {
  logo: string
  headline: string
  body: string
  cta: string
  url: string
  bg: string
  fg: string
  accent: string
}

const HEX = /^#[0-9a-f]{6}$/i
const clip = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 ? ' ' : c)).join('').trim().slice(0, n)

/** Validates a sponsor's banner. Links must be https; colours must be hex. */
export function cleanCreative(input: Record<string, unknown>): SponsorCreative {
  const url = clip(input.url, 300)
  const logo = clip(input.logo, 400)
  if (url && !/^https:\/\/[^\s]+$/i.test(url)) throw createError({ statusCode: 400, statusMessage: 'The link must start with https://' })
  // A logo is an uploaded image (/media/…, POST /api/upload) or an https:// URL.
  if (logo && !/^(https:\/\/[^\s]+|\/media\/[\w/.-]+)$/i.test(logo)) throw createError({ statusCode: 400, statusMessage: 'Upload a logo or use an https:// image.' })
  return {
    logo,
    headline: clip(input.headline, 70),
    body: clip(input.body, 140),
    cta: clip(input.cta, 24),
    url,
    bg: HEX.test(String(input.bg)) ? String(input.bg) : '#0c1b33',
    fg: HEX.test(String(input.fg)) ? String(input.fg) : '#ffffff',
    accent: HEX.test(String(input.accent)) ? String(input.accent) : '#2f5bea'
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
