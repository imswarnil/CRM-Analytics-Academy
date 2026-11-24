import type { ProspectProvider, ProviderContext } from './prospect-providers'

/**
 * Prospecting — the database side: settings, the provider call wrapper
 * (cache, rate limit, backoff, call log), suppression and
 * the activity timeline. Admin only; nothing here runs for visitors.
 */

export interface ProspectSettings {
  dailyCap: number
  rampStart: number
  rampStep: number
  windowStart: number
  windowEnd: number
  defaultTz: string
  senderName: string
  footer: string
  suppressLearners: boolean
}
export const DEFAULT_PROSPECT_SETTINGS: ProspectSettings = {
  dailyCap: 30,
  rampStart: 10,
  rampStep: 5,
  windowStart: 9,
  windowEnd: 17,
  defaultTz: 'Asia/Kolkata',
  senderName: 'Swarnil Singhai',
  footer: 'Swarnil Singhai · CRM Analytics Academy · crmanalytics.imswarnil.com\nYou are getting this because of your role at your company. Reply "no" or use the link below and I will not write again.',
  suppressLearners: true
}

export async function prospectSettings(): Promise<ProspectSettings> {
  const rows = await useDb()`select key, value from app.prospect_setting`
  const map = Object.fromEntries(rows.map(r => [String(r.key), r.value]))
  const s = { ...DEFAULT_PROSPECT_SETTINGS }
  const num = (k: string, min: number, max: number) => (typeof map[k] === 'number' ? Math.min(max, Math.max(min, Math.round(map[k] as number))) : null)
  s.dailyCap = num('daily_cap', 0, 200) ?? s.dailyCap
  s.rampStart = num('ramp_start', 1, 200) ?? s.rampStart
  s.rampStep = num('ramp_step', 0, 100) ?? s.rampStep
  s.windowStart = num('window_start', 0, 23) ?? s.windowStart
  s.windowEnd = num('window_end', 1, 24) ?? s.windowEnd
  if (typeof map.default_tz === 'string' && isTimeZone(map.default_tz)) s.defaultTz = map.default_tz
  if (typeof map.sender_name === 'string' && map.sender_name.trim()) s.senderName = map.sender_name.trim().slice(0, 80)
  if (typeof map.footer === 'string' && map.footer.trim()) s.footer = map.footer.trim().slice(0, 500)
  if (typeof map.suppress_learners === 'boolean') s.suppressLearners = map.suppress_learners
  return s
}

const hash = async (s: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('')

/** The answers of a cached lookup are kept this long (re-asking costs credits). */
const CACHE_DAYS = 30

/**
 * The context a provider adapter calls through: cache first, then a
 * per-minute limit from our own call log, then fetch with backoff on 429.
 */
export function providerContext(p: ProspectProvider, opts: { fresh?: boolean } = {}): ProviderContext {
  const key = String(process.env[p.env] ?? '').trim()
  const sql = useDb()
  return {
    key,
    async http(op, cacheKey, url, init) {
      const k = cacheKey ? await hash(cacheKey) : null
      if (k && !opts.fresh) {
        const [hit] = await sql`select response from app.prospect_cache where provider = ${p.id} and op = ${op} and key = ${k}
                                  and created_at > now() - make_interval(days => ${CACHE_DAYS})`
        if (hit) {
          await sql`insert into app.provider_call (provider, op, status, cached) values (${p.id}, ${op}, 200, true)`
          return hit.response
        }
      }
      const [{ n } = { n: 0 }] = await sql`select count(*)::int as n from app.provider_call where provider = ${p.id} and not cached and at > now() - interval '1 minute'`
      if (Number(n) >= p.perMinute) throw createError({ statusCode: 429, statusMessage: `${p.label}: rate limit (${p.perMinute}/min) — try again in a minute` })
      let status = 0
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) })
        status = res.status
        await sql`insert into app.provider_call (provider, op, status) values (${p.id}, ${op}, ${status})`
        if (res.status === 429 || res.status >= 500) {
          await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
          continue
        }
        if (!res.ok) {
          const msg = res.status === 401 || res.status === 403 ? 'the API key was refused' : res.status === 402 ? 'out of credits' : `HTTP ${res.status}`
          throw createError({ statusCode: 502, statusMessage: `${p.label}: ${msg}` })
        }
        const json = await res.json()
        if (k) {
          await sql`insert into app.prospect_cache (provider, op, key, response) values (${p.id}, ${op}, ${k}, ${JSON.stringify(json)}::jsonb)
                    on conflict (provider, op, key) do update set response = excluded.response, created_at = now()`
        }
        return json
      }
      throw createError({ statusCode: 502, statusMessage: `${p.label}: busy (${status}) after 3 tries` })
    }
  }
}

export async function logActivity(prospectId: number, kind: string, detail?: string | null) {
  await useDb()`insert into app.prospect_activity (prospect_id, kind, detail) values (${prospectId}, ${kind}, ${detail?.slice(0, 1000) ?? null})`
}

/** Why an address must not be contacted, or null. */
export async function suppressionReason(email: string, settings?: ProspectSettings): Promise<string | null> {
  const e = email.toLowerCase()
  const domain = `@${e.split('@')[1] ?? ''}`
  const sql = useDb()
  const [row] = await sql`select reason from app.prospect_suppression where value in (${e}, ${domain}) limit 1`
  if (row) return String(row.reason)
  if ((settings ?? await prospectSettings()).suppressLearners) {
    const [learner] = await sql`select 1 from neon_auth."user" where lower(email) = ${e} limit 1`
    if (learner) return 'learner'
  }
  return null
}

export async function suppress(value: string, reason: 'unsubscribed' | 'bounced' | 'manual' | 'deleted', note?: string | null) {
  await useDb()`insert into app.prospect_suppression (value, reason, note) values (${value.toLowerCase()}, ${reason}, ${note ?? null})
                on conflict (value) do nothing`
}

export interface NewProspect {
  firstName?: unknown
  lastName?: unknown
  title?: unknown
  seniority?: unknown
  email?: unknown
  emailStatus?: unknown
  linkedin?: unknown
  country?: unknown
  city?: unknown
  timezone?: unknown
  company?: unknown
  domain?: unknown
  provider?: unknown
  providerId?: unknown
}

/**
 * Saves people as prospects (dedupe by email), linking or creating their
 * company by domain, with the source and lawful basis GDPR needs, and a
 * "found" entry on each timeline. Optionally adds them to a list.
 */
export async function saveProspects(people: NewProspect[], opts: { source: string, lawfulBasis?: 'legitimate_interest' | 'consent', listId?: number | null }) {
  const sql = useDb()
  const out = { created: 0, existing: 0, skipped: 0, ids: [] as number[] }
  const companyIds = new Map<string, number>()
  for (const raw of people.slice(0, 500)) {
    const email = pemail(raw.email)
    const first = pclean(raw.firstName, 80)
    const last = pclean(raw.lastName, 80)
    if (!email && !(first && pdomain(raw.domain))) {
      out.skipped++
      continue
    }
    const domain = pdomain(raw.domain) ?? (email && domainKind(emailDomain(email)) === 'business' ? emailDomain(email) : null)
    let companyId: number | null = null
    if (domain) {
      companyId = companyIds.get(domain) ?? null
      if (!companyId) {
        const [c] = await sql`
          insert into app.prospect_company (domain, name, provider) values (${domain}, ${pclean(raw.company, 200) ?? nameFromDomain(domain)}, 'prospect')
          on conflict (domain) do update set domain = excluded.domain returning id`
        companyId = Number(c!.id)
        companyIds.set(domain, companyId)
      }
    }
    if (email) {
      const [dupe] = await sql`select id from app.prospect where lower(email) = ${email}`
      if (dupe) {
        out.existing++
        out.ids.push(Number(dupe.id))
        if (opts.listId) await sql`insert into app.prospect_list_member (list_id, prospect_id) values (${opts.listId}, ${dupe.id}) on conflict do nothing`
        continue
      }
    }
    const status = ['valid', 'risky', 'invalid', 'unknown'].includes(String(raw.emailStatus)) && email ? String(raw.emailStatus) : null
    const tz = pclean(raw.timezone, 60)
    const [row] = await sql`
      insert into app.prospect (company_id, first_name, last_name, title, seniority, email, email_status, linkedin, country, city, timezone,
                                source, lawful_basis, provider, provider_id)
      values (${companyId}, ${first}, ${last}, ${pclean(raw.title, 160)}, ${pclean(raw.seniority, 40)}, ${email}, ${status},
              ${pclean(raw.linkedin, 300)}, ${pclean(raw.country, 80)}, ${pclean(raw.city, 80)}, ${tz && isTimeZone(tz) ? tz : null},
              ${opts.source.slice(0, 120)}, ${opts.lawfulBasis ?? 'legitimate_interest'}, ${pclean(raw.provider, 20)}, ${pclean(raw.providerId, 64)})
      returning id`
    const id = Number(row!.id)
    out.created++
    out.ids.push(id)
    await logActivity(id, 'found', `Source: ${opts.source}${status ? ` · email ${status}` : ''} · basis: ${opts.lawfulBasis ?? 'legitimate interest (B2B)'}`)
    if (opts.listId) await sql`insert into app.prospect_list_member (list_id, prospect_id) values (${opts.listId}, ${id}) on conflict do nothing`
  }
  return out
}

/** Trimmed text without control characters, or null. */
export function pclean(v: unknown, n: number): string | null {
  const s = [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, n)
  return s || null
}
export function pdomain(v: unknown): string | null {
  const d = pclean(v, 200)?.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '') ?? null
  return d && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(d) ? d : null
}
export function pemail(v: unknown): string | null {
  const e = pclean(v, 254)?.toLowerCase() ?? null
  return e && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null
}
