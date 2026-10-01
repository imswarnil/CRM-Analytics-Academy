import type { H3Event } from 'h3'
import type { LeadRow } from './n8n'

/**
 * Inbound leads: validation, storage, enrichment and the hand-off to n8n.
 *
 * One service behind /api/leads and the older /api/inquiries, so both forms
 * obey the same rules. Every type shares the contact fields; what differs is
 * which of them are required, whether a work email is required, and which
 * type-specific fields may land in `details` — anything else the client sends
 * is dropped rather than stored.
 */
export const LEAD_TYPES = ['quote', 'sales', 'contact', 'instructor', 'sponsor', 'team', 'nomination', 'training', 'implementation'] as const
export type LeadType = typeof LEAD_TYPES[number]

/** Business conversations: these need a company email. */
export const WORK_EMAIL_TYPES: LeadType[] = ['quote', 'sales', 'team', 'training', 'implementation', 'sponsor']
const COMPANY_REQUIRED: LeadType[] = ['quote', 'sales', 'team', 'implementation', 'sponsor']

const DETAIL_FIELDS: Record<LeadType, string[]> = {
  quote: ['plan', 'delivery', 'timeline', 'teamSize'],
  sales: ['topic', 'timeline', 'teamSize'],
  contact: ['topic'],
  instructor: ['expertise', 'experienceYears', 'linkedin', 'portfolio', 'topics', 'availability'],
  sponsor: ['tier', 'placement', 'timeline'],
  team: ['plan', 'teamSize'],
  nomination: ['nomineeName', 'nomineeUrl', 'builtWhat', 'photoUrl', 'relationship'],
  training: ['center', 'track', 'cohort', 'experience'],
  implementation: ['scope', 'orgEdition', 'dataSources', 'timeline']
}

const REQUIRED_DETAILS: Partial<Record<LeadType, { key: string, label: string }[]>> = {
  nomination: [{ key: 'nomineeName', label: 'the nominee\'s name' }, { key: 'builtWhat', label: 'what they built' }],
  instructor: [{ key: 'expertise', label: 'your area of expertise' }]
}

const URL_DETAILS = new Set(['linkedin', 'portfolio', 'nomineeUrl', 'photoUrl'])
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const RATE_MAX = 5

function fail(message: string, statusCode = 400): never {
  throw createError({ statusCode, statusMessage: message })
}

function text(v: unknown, max: number): string | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  if (s.length > max) fail(`A field is longer than ${max} characters.`)
  return s
}

async function sha256(input: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Five submissions per hashed IP per hour, counted in the database so every isolate agrees. */
async function rateLimit(event: H3Event) {
  const ip = getRequestHeader(event, 'cf-connecting-ip') || getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const hash = await sha256(`lead:${ip}:${process.env.NEON_AUTH_COOKIE_SECRET ?? ''}`)
  const sql = useDb()
  const rows = await sql`
    insert into app.lead_rate (ip_hash, count, window_start) values (${hash}, 1, now())
    on conflict (ip_hash) do update set
      count = case when app.lead_rate.window_start < now() - interval '1 hour' then 1 else app.lead_rate.count + 1 end,
      window_start = case when app.lead_rate.window_start < now() - interval '1 hour' then now() else app.lead_rate.window_start end
    returning count
  `
  if (Number(rows[0]?.count ?? 0) > RATE_MAX) fail('Too many requests. Please try again later.', 429)
}

export interface CleanLead {
  type: LeadType
  name: string
  email: string
  company: string | null
  companyDomain: string | null
  role: string | null
  phone: string | null
  country: string | null
  seats: number | null
  budget: string | null
  message: string | null
  sourcePage: string | null
  utm: Record<string, string>
  details: Record<string, string>
}

export function validateLead(body: Record<string, unknown>): CleanLead {
  const type = String(body.type ?? '') as LeadType
  if (!LEAD_TYPES.includes(type)) fail('Unknown form type.')

  const name = String(body.name ?? '').trim()
  if (name.length < 2 || name.length > 120) fail('Please enter your name.')

  const email = String(body.email ?? '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) fail('Please enter a valid email address.')
  const domain = emailDomain(email)
  const free = isFreeEmailDomain(domain)
  if (WORK_EMAIL_TYPES.includes(type) && free) {
    fail(`Please use your work email — ${domain} is a personal address. We use your company domain to prepare the proposal and, for teams, to give your colleagues access.`)
  }

  const company = text(body.company, 160)
  if (COMPANY_REQUIRED.includes(type) && !company) fail('Please enter your company.')

  const seatsRaw = String(body.seats ?? '').trim()
  let seats: number | null = null
  if (seatsRaw) {
    seats = Number.parseInt(seatsRaw, 10)
    if (!Number.isFinite(seats) || seats < 1 || seats > 100000) fail('Please enter a number of seats between 1 and 100,000.')
  }

  const raw = (body.details && typeof body.details === 'object' ? body.details : {}) as Record<string, unknown>
  const details: Record<string, string> = {}
  for (const key of DETAIL_FIELDS[type]) {
    const v = text(raw[key], key === 'builtWhat' ? 2000 : 300)
    if (!v) continue
    if (URL_DETAILS.has(key) && !safeUrl(/^https?:\/\//i.test(v) ? v : `https://${v}`)) fail('Please enter a valid public link (https://…).')
    details[key] = URL_DETAILS.has(key) && !/^https?:\/\//i.test(v) ? `https://${v}` : v
  }
  for (const r of REQUIRED_DETAILS[type] ?? []) {
    if (!details[r.key]) fail(`Please tell us ${r.label}.`)
  }

  const rawUtm = (body.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>
  const utm: Record<string, string> = {}
  for (const k of UTM_KEYS) {
    const v = text(rawUtm[k], 120)
    if (v) utm[k] = v
  }

  const source = text(body.sourcePage, 300)
  return {
    type,
    name,
    email,
    company,
    companyDomain: free ? null : domain,
    role: text(body.role, 120),
    phone: text(body.phone, 40),
    country: text(body.country, 80),
    seats,
    budget: text(body.budget, 80),
    message: text(body.message, 4000),
    sourcePage: source && source.startsWith('/') ? source : null,
    utm,
    details
  }
}

/** Company name from a page title: "Acme | The CRM for …" → "Acme". */
function companyFromTitle(title?: string) {
  if (!title) return undefined
  const first = title.split(/\s[|–—·:-]\s/)[0]?.trim()
  return first && first.length <= 80 ? first : undefined
}

export async function enrichLead(id: number) {
  const sql = useDb()
  const rows = await sql`select company_domain from app.lead where id = ${id}`
  const domain = rows[0]?.company_domain as string | null
  if (!domain) return
  const meta = await fetchUrlMeta(`https://${domain}`)
  await sql`
    update app.lead set
      company_name = coalesce(${meta.siteName ?? companyFromTitle(meta.title) ?? null}, company_name),
      logo_url = coalesce(${meta.icon ?? null}, logo_url),
      site_title = ${meta.title?.slice(0, 300) ?? null},
      site_description = ${meta.description?.slice(0, 600) ?? null},
      enriched_at = now(),
      updated_at = now()
    where id = ${id}
  `
}

export async function loadLead(id: number): Promise<LeadRow | null> {
  const sql = useDb()
  const rows = await sql`
    select id, type, name, email, company, company_domain, role, phone, country, seats, budget, message,
           source_page, utm, details, company_name, logo_url, site_title, site_description, created_at
    from app.lead where id = ${id}
  `
  const r = rows[0]
  if (!r) return null
  return { ...r, id: Number(r.id), seats: r.seats == null ? null : Number(r.seats), created_at: String(r.created_at) } as LeadRow
}

/** Runs after the response when the platform allows it; otherwise inline. */
function inBackground(event: H3Event, task: Promise<unknown>) {
  const ctx = (event.context.cloudflare as { context?: { waitUntil?: (p: Promise<unknown>) => void } } | undefined)?.context
  const wait = ctx?.waitUntil?.bind(ctx) ?? (event as unknown as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil?.bind(event)
  const safe = task.catch(e => console.error('[leads] background task failed', e))
  if (wait) {
    wait(safe)
    return Promise.resolve()
  }
  return safe
}

export async function submitLead(event: H3Event, body: Record<string, unknown>) {
  // Honeypot: a field hidden from people. Answer as if it worked.
  if (String(body.website ?? '').trim()) return { ok: true }

  const lead = validateLead(body)
  await rateLimit(event)

  const sql = useDb()
  const rows = await sql`
    insert into app.lead (type, name, email, company, company_domain, role, phone, country, seats, budget, message, source_page, utm, details)
    values (${lead.type}, ${lead.name}, ${lead.email}, ${lead.company}, ${lead.companyDomain}, ${lead.role}, ${lead.phone},
            ${lead.country}, ${lead.seats}, ${lead.budget}, ${lead.message}, ${lead.sourcePage},
            ${JSON.stringify(lead.utm)}::jsonb, ${JSON.stringify(lead.details)}::jsonb)
    returning id
  `
  const id = Number(rows[0]?.id)

  await inBackground(event, (async () => {
    await enrichLead(id)
    const row = await loadLead(id)
    if (row) await forwardLead(row)
  })())

  return { ok: true, id }
}
