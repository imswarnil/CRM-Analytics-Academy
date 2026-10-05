/**
 * The experts network's roster (app.expert, server/db/011_experts.sql).
 *
 * A profile is public only while its status is 'approved'. Admins create one
 * from an `expert` application in app.lead, then edit what the card shows:
 * photo, headline, skills, order and visibility. The email on a profile is
 * how the network reaches its members and is never served publicly.
 */
export const EXPERT_STATUSES = ['pending', 'approved', 'hidden'] as const
export type ExpertStatus = typeof EXPERT_STATUSES[number]

/** A public roster card, as GET /api/experts returns it (mirrored in app/utils/experts.ts). */
export interface PublicExpert {
  id: number
  name: string
  headline: string | null
  photoUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  skills: string[]
  years: number | null
  country: string | null
}

export interface ExpertInput {
  name?: string
  email?: string | null
  headline?: string | null
  bio?: string | null
  photoUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  skills?: string[]
  years?: number | null
  country?: string | null
  timezone?: string | null
  status?: ExpertStatus
  sortOrder?: number
}

function bad(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

function optText(v: unknown, max: number, label: string): string | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  if (s.length > max) bad(`${label} is longer than ${max} characters.`)
  return s
}

/** https only: these URLs are rendered as images and links on a public page. */
function optHttps(v: unknown, label: string): string | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  const withScheme = /^https?:\/\//i.test(s) ? s.replace(/^http:/i, 'https:') : `https://${s}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' || !u.hostname.includes('.')) throw new Error('bad')
    return u.toString().slice(0, 500)
  } catch {
    bad(`${label} must be a public https:// link.`)
  }
}

/**
 * Validate the fields a request sends. Only keys present in the body are
 * returned, so a PATCH changes exactly what it names.
 */
export function cleanExpert(body: Record<string, unknown>, requireName: boolean): ExpertInput {
  const out: ExpertInput = {}
  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k)

  if (has('name') || requireName) {
    const name = String(body.name ?? '').trim()
    if (name.length < 2 || name.length > 120) bad('A name of 2–120 characters is required.')
    out.name = name
  }
  if (has('email')) {
    const email = String(body.email ?? '').trim().toLowerCase()
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) bad('That email address is not valid.')
    out.email = email || null
  }
  if (has('headline')) out.headline = optText(body.headline, 160, 'The headline')
  if (has('bio')) out.bio = optText(body.bio, 1200, 'The bio')
  if (has('photoUrl')) out.photoUrl = optHttps(body.photoUrl, 'The photo URL')
  if (has('linkedinUrl')) out.linkedinUrl = optHttps(body.linkedinUrl, 'The LinkedIn URL')
  if (has('portfolioUrl')) out.portfolioUrl = optHttps(body.portfolioUrl, 'The portfolio URL')
  if (has('skills')) {
    const raw = Array.isArray(body.skills) ? body.skills : String(body.skills ?? '').split(',')
    const skills = [...new Set(raw.map(s => String(s ?? '').trim()).filter(Boolean))]
    if (skills.length > 12) bad('Twelve skills at most.')
    if (skills.some(s => s.length > 40)) bad('A skill is longer than 40 characters.')
    out.skills = skills
  }
  if (has('years')) {
    const raw = String(body.years ?? '').trim()
    const n = raw ? Number.parseInt(raw, 10) : null
    if (n !== null && (!Number.isFinite(n) || n < 0 || n > 60)) bad('Years must be between 0 and 60.')
    out.years = n
  }
  if (has('country')) out.country = optText(body.country, 80, 'The country')
  if (has('timezone')) out.timezone = optText(body.timezone, 64, 'The time zone')
  if (has('status')) {
    const s = String(body.status) as ExpertStatus
    if (!EXPERT_STATUSES.includes(s)) bad('Unknown status.')
    out.status = s
  }
  if (has('sortOrder')) {
    const n = Number.parseInt(String(body.sortOrder ?? ''), 10)
    if (!Number.isFinite(n) || n < -10000 || n > 10000) bad('Order must be a whole number.')
    out.sortOrder = n
  }
  return out
}

/** "3–5" or "10+" (the application's ranges) → the lower bound, 3 or 10. */
export function yearsFromRange(range: string | undefined): number | null {
  const m = String(range ?? '').match(/\d+/)
  return m ? Math.min(60, Number(m[0])) : null
}

/** An app.expert row as the admin console sees it. */
export function adminExpert(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    leadId: r.lead_id == null ? null : Number(r.lead_id),
    userId: (r.user_id as string | null) ?? null,
    name: r.name as string,
    email: (r.email as string | null) ?? null,
    headline: (r.headline as string | null) ?? null,
    bio: (r.bio as string | null) ?? null,
    photoUrl: (r.photo_url as string | null) ?? null,
    linkedinUrl: (r.linkedin_url as string | null) ?? null,
    portfolioUrl: (r.portfolio_url as string | null) ?? null,
    skills: (r.skills as string[] | null) ?? [],
    years: r.years == null ? null : Number(r.years),
    country: (r.country as string | null) ?? null,
    timezone: (r.timezone as string | null) ?? null,
    status: r.status as ExpertStatus,
    sortOrder: Number(r.sort_order ?? 100),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at)
  }
}
