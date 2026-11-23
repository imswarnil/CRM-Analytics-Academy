import type { H3Event } from 'h3'
import type { DomainKind, NetworkKind, ScoreReason, ScoreResult } from './score'

/**
 * Real-time first-party lead enrichment (2026-11-23).
 *
 * Runs in the Worker's `waitUntil` after a sign-up, a lead form, a checkout
 * or a milestone — never in the response path — and uses real data only:
 *
 *   1. Cloudflare's `request.cf` at the moment of the event: country, region,
 *      city, timezone, ASN and AS organisation. The IP address is never read
 *      or stored; only what Cloudflare derived from it.
 *   2. The email domain: personal / business / education / government /
 *      disposable, and for a business domain its own home page, fetched once
 *      and cached per domain in app.company_domain (title, description, site
 *      name, logo, LinkedIn page).
 *   3. Product signals from our own tables: lessons, streak, active days,
 *      quizzes, exams and best score, checkout intent, Pro plan, team seat.
 *   4. The score and grade from score.ts, with every reason.
 *
 * One row per person in app.enrichment (user_id) or per "talk to us" request
 * (lead_id). Optional paid provider: ENRICH_PROVIDER_URL (off unless set).
 * Every function here resolves — it never throws into a caller.
 */

export interface Touch {
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  asn: number | null
  asOrg: string | null
}

/** What Cloudflare derived from the request — never the address itself. Null in dev. */
export function touchFrom(event: H3Event): Touch | null {
  const cf = cloudflareOf(event).request?.cf
  if (!cf) return null
  const s = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null)
  return {
    country: s(cf.country, 2),
    region: s(cf.region, 80),
    city: s(cf.city, 80),
    timezone: s(cf.timezone, 60),
    asn: Number.isInteger(cf.asn) ? Number(cf.asn) : null,
    asOrg: s(cf.asOrganization, 120)
  }
}

export type Plan = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'grant' | 'seat'
export interface Signals {
  userId: string
  email: string
  name: string | null
  signedUp: string | null
  lessons: number
  points: number
  quizzes: number
  exams: number
  bestExamPct: number
  checkouts: number
  lastActive: string | null
  daysSinceActive: number | null
  activeDays30: number
  streak: number
  plan: Plan
  pro: boolean
  org: { id: number, name: string, kind: string, role: string, active: boolean, seats: number, expiresAt: string | null, domain: string | null } | null
}

/** Product signals for many users in one query (the sync uses the same loader). */
export async function loadSignals(userIds: string[]): Promise<Map<string, Signals>> {
  const out = new Map<string, Signals>()
  if (!userIds.length) return out
  const sql = useDb()
  const rows = await sql`
    with ids as (select distinct unnest(${userIds}::text[]) as id),
    act as (
      select user_id, completed_at as at from app.progress where user_id = any(${userIds}::text[]) and completed_at > now() - interval '60 days'
      union all select user_id, created_at from app.quiz_attempt where user_id = any(${userIds}::text[]) and created_at > now() - interval '60 days'
      union all select user_id, created_at from app.exam_attempt where user_id = any(${userIds}::text[]) and created_at > now() - interval '60 days'
      union all select user_id, created_at from app.event where user_id = any(${userIds}::text[]) and created_at > now() - interval '60 days'
    )
    select i.id as user_id, u.email, u.name, u."createdAt" as signed_up,
           coalesce(pt.lessons_done, 0)::int as lessons, coalesce(pt.points, 0)::int as points,
           coalesce(q.n, 0)::int as quizzes, coalesce(x.n, 0)::int as exams, coalesce(x.best, 0)::int as best_exam,
           coalesce(c.n, 0)::int as checkouts,
           a.last_at, coalesce(a.days30, 0)::int as active_days_30, coalesce(a.days, '{}') as days,
           s.plan as sub_plan, s.status as sub_status, en.product as ent_product, en.expires_at as ent_expires,
           m.role as org_role, o.id as org_id, o.name as org_name, o.kind as org_kind, o.status as org_status,
           o.expires_at as org_expires, o.seats as org_seats, o.domain as org_domain
      from ids i
      join neon_auth."user" u on u.id::text = i.id
      left join app.user_points pt on pt.user_id = i.id
      left join (select user_id, count(*) as n from app.quiz_attempt where user_id = any(${userIds}::text[]) group by 1) q on q.user_id = i.id
      left join (select user_id, count(*) as n, max(round(score * 100.0 / total)) as best
                   from app.exam_attempt where user_id = any(${userIds}::text[]) group by 1) x on x.user_id = i.id
      left join (select user_id, count(*) as n from app.event where name = 'checkout' and user_id = any(${userIds}::text[]) group by 1) c on c.user_id = i.id
      left join (select user_id, max(at) as last_at,
                        count(distinct (at at time zone 'UTC')::date) filter (where at > now() - interval '30 days') as days30,
                        array_agg(distinct to_char(at at time zone 'UTC', 'YYYY-MM-DD')) as days
                   from act group by 1) a on a.user_id = i.id
      left join app.subscription s on s.user_id = i.id
      left join app.entitlement en on en.user_id = i.id
      left join app.org_member m on m.user_id = i.id
      left join app.org o on o.id = m.org_id`
  const now = Date.now()
  for (const r of rows) {
    const subActive = ['active', 'trialing', 'past_due'].includes(String(r.sub_status ?? ''))
    const entActive = r.ent_product && (!r.ent_expires || new Date(r.ent_expires as string).getTime() > now)
    const orgActive = r.org_id && r.org_status === 'active' && (!r.org_expires || new Date(r.org_expires as string).getTime() > now)
    const plan: Plan = subActive ? (r.sub_plan === 'yearly' ? 'yearly' : 'monthly') : entActive ? (r.ent_product === 'lifetime' ? 'lifetime' : 'grant') : orgActive ? 'seat' : 'free'
    const lastActive = r.last_at ? new Date(r.last_at as string).toISOString() : null
    out.set(String(r.user_id), {
      userId: String(r.user_id),
      email: String(r.email ?? ''),
      name: (r.name as string | null) ?? null,
      signedUp: r.signed_up ? new Date(r.signed_up as string).toISOString() : null,
      lessons: Number(r.lessons),
      points: Number(r.points),
      quizzes: Number(r.quizzes),
      exams: Number(r.exams),
      bestExamPct: Number(r.best_exam),
      checkouts: Number(r.checkouts),
      lastActive,
      daysSinceActive: lastActive ? Math.floor((now - new Date(lastActive).getTime()) / 86400000) : null,
      activeDays30: Number(r.active_days_30),
      streak: streakFrom((r.days as string[]) ?? []),
      plan,
      pro: plan !== 'free',
      org: r.org_id
        ? { id: Number(r.org_id), name: String(r.org_name), kind: String(r.org_kind), role: String(r.org_role), active: Boolean(orgActive), seats: Number(r.org_seats), expiresAt: r.org_expires ? new Date(r.org_expires as string).toISOString() : null, domain: (r.org_domain as string | null) ?? null }
        : null
    })
  }
  return out
}

export interface DomainInfo {
  domain: string
  kind: DomainKind
  company: string | null
  title: string | null
  description: string | null
  logo: string | null
  linkedin: string | null
  website: string | null
  provider: Record<string, unknown> | null
}

const UA = 'CRMAnalyticsAcademyBot/1.0 (+https://crmanalytics.imswarnil.com/privacy)'
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/

/** Reads at most `limit` bytes of a response body as text. */
async function readCapped(res: Response, limit: number): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let size = 0
  while (size < limit) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    size += value.byteLength
  }
  await reader.cancel().catch(() => {})
  const all = new Uint8Array(Math.min(size, limit))
  let at = 0
  for (const c of chunks) {
    const part = c.subarray(0, Math.max(0, all.length - at))
    all.set(part, at)
    at += part.length
  }
  return new TextDecoder().decode(all)
}

async function fetchCompanyPage(domain: string) {
  for (const host of [domain, `www.${domain}`]) {
    try {
      const res = await fetch(`https://${host}/`, {
        headers: { 'user-agent': UA, 'accept': 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(4000)
      })
      if (!res.ok || !String(res.headers.get('content-type') ?? '').includes('text/html')) continue
      const html = await readCapped(res, 256 * 1024)
      return { ...parseCompanyPage(html, domain), website: `https://${host}/` }
    } catch {
      // try the next host
    }
  }
  return null
}

/** Optional paid enrichment by domain only (never the email). Off unless ENRICH_PROVIDER_URL is set. */
async function fetchProvider(domain: string): Promise<Record<string, unknown> | null> {
  const url = process.env.ENRICH_PROVIDER_URL
  if (!url) return null
  try {
    const res = await fetch(url.replace('{domain}', encodeURIComponent(domain)), {
      headers: { accept: 'application/json', ...(process.env.ENRICH_PROVIDER_KEY ? { authorization: `Bearer ${process.env.ENRICH_PROVIDER_KEY}` } : {}) },
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) return null
    const text = await readCapped(res, 16 * 1024)
    const json = JSON.parse(text) as Record<string, unknown>
    return json && typeof json === 'object' ? json : null
  } catch {
    return null
  }
}

/** The company behind an email domain, fetched once and cached for 30 days. */
export async function domainInfo(domain: string | null): Promise<DomainInfo | null> {
  if (!domain || !DOMAIN_RE.test(domain) || domain.length > 120) return null
  const kind = domainKind(domain)!
  const sql = useDb()
  const [cached] = await sql`select * from app.company_domain where domain = ${domain}`
  const fresh = cached && (cached.kind !== 'business' || (cached.fetched_at && new Date(cached.fetched_at as string).getTime() > Date.now() - 30 * 86400000))
  if (cached && fresh) return rowToDomain(cached)

  if (kind !== 'business') {
    await sql`insert into app.company_domain (domain, kind, status, fetched_at) values (${domain}, ${kind}, 'skipped', now())
              on conflict (domain) do update set kind = excluded.kind, status = 'skipped', fetched_at = now()`
    return { domain, kind, company: null, title: null, description: null, logo: null, linkedin: null, website: null, provider: null }
  }
  const [page, provider] = await Promise.all([fetchCompanyPage(domain), fetchProvider(domain)])
  const providerName = provider && typeof provider.name === 'string' ? provider.name.slice(0, 120) : null
  const company = page?.siteName || providerName || page?.company || nameFromDomain(domain)
  const [row] = await sql`
    insert into app.company_domain (domain, kind, company, title, description, logo, linkedin, website, provider, status, fetched_at)
    values (${domain}, ${kind}, ${company}, ${page?.title ?? null}, ${page?.description ?? null}, ${page?.logo ?? null},
            ${page?.linkedin ?? null}, ${page?.website ?? null}, ${provider ? JSON.stringify(provider) : null}::jsonb,
            ${page ? 'fetched' : 'failed'}, now())
    on conflict (domain) do update set kind = excluded.kind, company = excluded.company, title = excluded.title,
      description = excluded.description, logo = excluded.logo, linkedin = excluded.linkedin, website = excluded.website,
      provider = coalesce(excluded.provider, app.company_domain.provider), status = excluded.status, fetched_at = now()
    returning *`
  return rowToDomain(row!)
}

function rowToDomain(r: Record<string, unknown>): DomainInfo {
  return {
    domain: String(r.domain),
    kind: r.kind as DomainKind,
    company: (r.company as string | null) ?? null,
    title: (r.title as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    logo: (r.logo as string | null) ?? null,
    linkedin: (r.linkedin as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    provider: (r.provider as Record<string, unknown> | null) ?? null
  }
}

/** What a Web-to-Lead post and /admin show of one enrichment. */
export interface EnrichmentSummary {
  emailDomain: string | null
  domainKind: DomainKind | null
  company: string | null
  website: string | null
  linkedin: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  networkOrg: string | null
  networkKind: NetworkKind
  score: number
  grade: string
  reasons: ScoreReason[]
  signals: Signals | null
}

export function signalsLine(s: Signals | null): string {
  if (!s) return 'No account'
  return [
    `${s.plan === 'free' ? 'Free' : `Pro (${s.plan})`}`,
    `${s.lessons} lessons`,
    `${s.streak}-day streak`,
    `${s.activeDays30} active days/30`,
    s.exams ? `${s.exams} exams, best ${s.bestExamPct}%` : '',
    s.checkouts ? `${s.checkouts} checkout(s)` : '',
    s.org ? `seat at ${s.org.name}` : '',
    s.lastActive ? `last active ${s.lastActive.slice(0, 10)}` : ''
  ].filter(Boolean).join(' · ').slice(0, 255)
}

interface Person {
  email: string
  title?: string | null
  company?: string | null
  country?: string | null
  interest?: string | null
  seats?: number | null
  source?: string | null
}

async function compute(person: Person, touch: Touch | null, signals: Signals | null, previous: Record<string, unknown> | undefined) {
  const domain = emailDomain(person.email)
  const info = await domainInfo(domain).catch(() => null)
  const asOrg = touch?.asOrg ?? (previous?.as_org as string | null) ?? null
  const nKind = networkKind(asOrg)
  const country = touch?.country ?? person.country ?? (previous?.country as string | null) ?? null
  const result: ScoreResult = scoreLead({
    domainKind: domainKind(domain),
    companyFound: Boolean(info?.website),
    networkKind: nKind,
    networkOrg: asOrg,
    title: person.title,
    country,
    interest: person.interest,
    seats: person.seats,
    lessons: signals?.lessons,
    activeDays30: signals?.activeDays30,
    daysSinceActive: signals ? signals.daysSinceActive : person.interest ? 0 : null,
    examAttempts: signals?.exams,
    bestExamPct: signals?.bestExamPct,
    checkoutIntent: signals?.checkouts,
    pro: signals?.pro,
    orgSeat: Boolean(signals?.org?.active)
  })
  const summary: EnrichmentSummary = {
    emailDomain: domain,
    domainKind: domainKind(domain),
    company: person.company || info?.company || null,
    website: info?.website ?? null,
    linkedin: info?.linkedin ?? null,
    country,
    region: touch?.region ?? (previous?.region as string | null) ?? null,
    city: touch?.city ?? (previous?.city as string | null) ?? null,
    timezone: touch?.timezone ?? (previous?.timezone as string | null) ?? null,
    networkOrg: asOrg,
    networkKind: nKind,
    score: result.score,
    grade: result.grade,
    reasons: result.reasons,
    signals
  }
  return { summary, result, touch }
}

function signalsJson(s: Signals | null) {
  if (!s) return {}
  const { email: _e, name: _n, userId: _u, ...rest } = s
  return rest
}

/**
 * Enrich a signed-in person. `throttleHours` skips the work when the row is
 * fresher than that (lesson milestones); sign-ups and checkouts pass 0.
 */
export async function enrichUser(userId: string, opts: { touch?: Touch | null, event?: string, source?: string | null, throttleHours?: number } = {}): Promise<EnrichmentSummary | null> {
  try {
    const sql = useDb()
    const [previous] = await sql`select * from app.enrichment where user_id = ${userId}`
    if (opts.throttleHours && previous && new Date(previous.updated_at as string).getTime() > Date.now() - opts.throttleHours * 3600000) return null
    const signals = (await loadSignals([userId])).get(userId) ?? null
    if (!signals) return null
    const { summary, result, touch } = await compute({ email: signals.email, source: opts.source }, opts.touch ?? null, signals, previous)
    await sql`
      insert into app.enrichment (user_id, email_domain, domain_kind, company, country, region, city, timezone, asn, as_org, network_kind,
                                  first_touch, last_event, last_event_at, signals, fit, engagement, score, grade, reasons, updated_at)
      values (${userId}, ${summary.emailDomain}, ${summary.domainKind}, ${summary.company}, ${summary.country}, ${summary.region}, ${summary.city},
              ${summary.timezone}, ${touch?.asn ?? null}, ${summary.networkOrg}, ${summary.networkKind}, ${opts.source ?? null},
              ${opts.event ?? null}, now(), ${JSON.stringify(signalsJson(signals))}::jsonb, ${result.fit}, ${result.engagement},
              ${result.score}, ${result.grade}, ${JSON.stringify(result.reasons)}::jsonb, now())
      on conflict (user_id) do update set
        email_domain = excluded.email_domain, domain_kind = excluded.domain_kind, company = excluded.company,
        country = excluded.country, region = excluded.region, city = excluded.city, timezone = excluded.timezone,
        asn = coalesce(excluded.asn, app.enrichment.asn), as_org = excluded.as_org, network_kind = excluded.network_kind,
        first_touch = coalesce(app.enrichment.first_touch, excluded.first_touch),
        last_event = coalesce(excluded.last_event, app.enrichment.last_event), last_event_at = now(),
        signals = excluded.signals, fit = excluded.fit, engagement = excluded.engagement, score = excluded.score,
        grade = excluded.grade, reasons = excluded.reasons, updated_at = now()`
    return summary
  } catch (e) {
    console.warn(`enrich user failed: ${String((e as Error).message).slice(0, 120)}`)
    return null
  }
}

/** Enrich one "talk to us" request (app.lead), with the person's signals when signed in. */
export async function enrichLead(leadId: number, opts: { touch?: Touch | null } = {}): Promise<EnrichmentSummary | null> {
  try {
    const sql = useDb()
    const [lead] = await sql`select * from app.lead where id = ${leadId}`
    if (!lead) return null
    const userId = (lead.user_id as string | null) ?? null
    const signals = userId ? (await loadSignals([userId])).get(userId) ?? null : null
    const { summary, result, touch } = await compute({
      email: String(lead.email), title: lead.title as string | null, company: lead.company as string | null, country: lead.country as string | null,
      interest: (lead.interest ?? lead.product) as string | null, seats: lead.seats as number | null, source: lead.source as string | null
    }, opts.touch ?? null, signals, undefined)
    await sql`
      insert into app.enrichment (lead_id, email_domain, domain_kind, company, country, region, city, timezone, asn, as_org, network_kind,
                                  first_touch, last_event, last_event_at, signals, fit, engagement, score, grade, reasons, updated_at)
      values (${leadId}, ${summary.emailDomain}, ${summary.domainKind}, ${summary.company}, ${summary.country}, ${summary.region},
              ${summary.city}, ${summary.timezone}, ${touch?.asn ?? null}, ${summary.networkOrg}, ${summary.networkKind},
              ${lead.source as string | null}, 'lead', now(), ${JSON.stringify(signalsJson(signals))}::jsonb, ${result.fit},
              ${result.engagement}, ${result.score}, ${result.grade}, ${JSON.stringify(result.reasons)}::jsonb, now())
      on conflict (lead_id) do update set
        email_domain = excluded.email_domain, domain_kind = excluded.domain_kind, company = excluded.company,
        country = coalesce(excluded.country, app.enrichment.country), region = coalesce(excluded.region, app.enrichment.region),
        city = coalesce(excluded.city, app.enrichment.city), timezone = coalesce(excluded.timezone, app.enrichment.timezone),
        asn = coalesce(excluded.asn, app.enrichment.asn), as_org = coalesce(excluded.as_org, app.enrichment.as_org),
        network_kind = excluded.network_kind, signals = excluded.signals, fit = excluded.fit, engagement = excluded.engagement,
        score = excluded.score, grade = excluded.grade, reasons = excluded.reasons, updated_at = now()`
    return summary
  } catch (e) {
    console.warn(`enrich lead failed: ${String((e as Error).message).slice(0, 120)}`)
    return null
  }
}
