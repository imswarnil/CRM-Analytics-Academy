/**
 * Prospecting data providers behind one adapter interface. Pure: `fetch` and
 * `sleep` come in through the context, nothing is auto-imported, so
 * scripts/check-prospect.mjs runs every adapter against mocked responses.
 *
 * A provider is on when its env var is set:
 *   APOLLO_API_KEY   Apollo.io — company search, people search, credits
 *   HUNTER_API_KEY   Hunter.io — domain search, email finder, email verifier, credits
 *   PDL_API_KEY · SNOV_CLIENT_ID · PROSPEO_API_KEY — adapter slots, not implemented yet
 *
 * Keys go in headers, never in our own URLs or logs. Every call goes through
 * `ctx.call` (prospect.ts): it caches the answer in the database so the same
 * lookup is never paid for twice, logs the call and backs off on 429.
 */

export type Capability = 'companies' | 'people' | 'domain' | 'find' | 'verify'
export type ProviderId = 'apollo' | 'hunter' | 'pdl' | 'snov' | 'prospeo'

export interface CompanyQuery {
  keywords?: string
  industry?: string
  /** Employee ranges like "11,50", "51,200". */
  sizes?: string[]
  country?: string
  usesSalesforce?: boolean
  page?: number
}
export interface CompanyHit {
  provider: ProviderId
  providerId: string | null
  name: string
  domain: string | null
  website: string | null
  linkedin: string | null
  industry: string | null
  size: number | null
  country: string | null
  city: string | null
  usesSalesforce: boolean | null
}
export interface PeopleQuery {
  domain: string
  titles?: string[]
  seniorities?: string[]
  page?: number
}
export interface PersonHit {
  provider: ProviderId
  providerId: string | null
  firstName: string | null
  lastName: string | null
  title: string | null
  seniority: string | null
  email: string | null
  emailStatus: 'valid' | 'risky' | 'invalid' | 'unknown' | null
  linkedin: string | null
  country: string | null
  city: string | null
  company: string | null
  domain: string | null
}
export interface EmailFound {
  email: string
  score: number | null
  status: 'valid' | 'risky' | 'invalid' | 'unknown'
}
export interface Verification {
  status: 'valid' | 'risky' | 'invalid' | 'unknown'
  detail: string
}
export interface Credits {
  label: string
  used: number | null
  available: number | null
}

export interface HttpResult {
  ok: boolean
  status: number
  json: () => Promise<unknown>
}
export interface ProviderContext {
  key: string
  /** One HTTP call, cached and rate-limited by the caller. `cacheKey` null = never cache. */
  http: (op: string, cacheKey: string | null, url: string, init?: { method?: string, headers?: Record<string, string>, body?: string }) => Promise<unknown>
}

export interface ProspectProvider {
  id: ProviderId
  label: string
  env: string
  capabilities: Capability[]
  /** Calls per minute the provider allows on a basic plan (we stay under it). */
  perMinute: number
  searchCompanies?: (q: CompanyQuery, ctx: ProviderContext) => Promise<CompanyHit[]>
  searchPeople?: (q: PeopleQuery, ctx: ProviderContext) => Promise<PersonHit[]>
  findEmail?: (p: { firstName: string, lastName: string, domain: string }, ctx: ProviderContext) => Promise<EmailFound | null>
  verifyEmail?: (email: string, ctx: ProviderContext) => Promise<Verification>
  credits?: (ctx: ProviderContext) => Promise<Credits[]>
}

const s = (v: unknown, n = 200) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null)
const domainOf = (v: unknown) => s(v, 200)?.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase() || null
const sorted = (a?: string[]) => [...(a ?? [])].map(x => x.trim()).filter(Boolean).sort()

// ---- Apollo.io ------------------------------------------------------------------------
// https://docs.apollo.io — POST, key in the X-Api-Key header.

const APOLLO = 'https://api.apollo.io/api/v1'
const apolloInit = (key: string, body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json', 'cache-control': 'no-cache', 'x-api-key': key }, body: JSON.stringify(body) })

export const apollo: ProspectProvider = {
  id: 'apollo',
  label: 'Apollo.io',
  env: 'APOLLO_API_KEY',
  capabilities: ['companies', 'people'],
  perMinute: 50,
  async searchCompanies(q, ctx) {
    const body: Record<string, unknown> = { page: q.page ?? 1, per_page: 25 }
    if (q.keywords) body.q_organization_keyword_tags = q.keywords.split(',').map(x => x.trim()).filter(Boolean)
    if (q.industry) body.q_organization_keyword_tags = [...(body.q_organization_keyword_tags as string[] ?? []), q.industry]
    if (q.sizes?.length) body.organization_num_employees_ranges = sorted(q.sizes)
    if (q.country) body.organization_locations = [q.country]
    if (q.usesSalesforce) body.currently_using_any_of_technology_uids = ['salesforce']
    const json = await ctx.http('companies', JSON.stringify(body), `${APOLLO}/mixed_companies/search`, apolloInit(ctx.key, body)) as { organizations?: Record<string, unknown>[], accounts?: Record<string, unknown>[] }
    return [...(json.organizations ?? []), ...(json.accounts ?? [])].map(o => ({
      provider: 'apollo' as const,
      providerId: s(o.id, 64),
      name: s(o.name, 200) ?? 'Unknown',
      domain: domainOf(o.primary_domain ?? o.website_url),
      website: s(o.website_url, 300),
      linkedin: s(o.linkedin_url, 300),
      industry: s(o.industry, 120),
      size: Number.isFinite(Number(o.estimated_num_employees)) && o.estimated_num_employees !== null ? Number(o.estimated_num_employees) : null,
      country: s(o.country, 80),
      city: s(o.city, 80),
      usesSalesforce: q.usesSalesforce ? true : null
    }))
  },
  async searchPeople(q, ctx) {
    const body: Record<string, unknown> = { page: q.page ?? 1, per_page: 25, q_organization_domains_list: [q.domain] }
    if (q.titles?.length) body.person_titles = sorted(q.titles)
    if (q.seniorities?.length) body.person_seniorities = sorted(q.seniorities)
    const json = await ctx.http('people', JSON.stringify(body), `${APOLLO}/mixed_people/search`, apolloInit(ctx.key, body)) as { people?: Record<string, unknown>[], contacts?: Record<string, unknown>[] }
    return [...(json.people ?? []), ...(json.contacts ?? [])].map((p) => {
      const org = (p.organization ?? {}) as Record<string, unknown>
      // Apollo returns a placeholder for locked emails.
      const email = s(p.email, 254)
      const usable = email && !/not_unlocked|email_not_unlocked|domain\.com$/.test(email) ? email.toLowerCase() : null
      return {
        provider: 'apollo' as const,
        providerId: s(p.id, 64),
        firstName: s(p.first_name, 80),
        lastName: s(p.last_name, 80),
        title: s(p.title, 160),
        seniority: s(p.seniority, 40),
        email: usable,
        emailStatus: usable ? (p.email_status === 'verified' ? 'valid' : 'unknown') : null,
        linkedin: s(p.linkedin_url, 300),
        country: s(p.country, 80),
        city: s(p.city, 80),
        company: s(org.name, 200),
        domain: domainOf(org.primary_domain) ?? q.domain
      }
    })
  },
  async credits(ctx) {
    const json = await ctx.http('credits', null, `${APOLLO}/usage_stats/api_usage_stats`, apolloInit(ctx.key, {})) as Record<string, { day?: { limit?: number, consumed?: number, left_over?: number } }>
    return Object.entries(json ?? {}).filter(([k]) => /search/.test(k)).slice(0, 4).map(([k, v]) => ({
      label: `${k.replace(/[^a-z_]/gi, ' ').trim()} (today)`,
      used: v?.day?.consumed ?? null,
      available: v?.day?.left_over ?? (v?.day?.limit !== undefined && v?.day?.consumed !== undefined ? v.day.limit - v.day.consumed : null)
    }))
  }
}

// ---- Hunter.io ------------------------------------------------------------------------
// https://hunter.io/api-documentation/v2 — GET, key in the X-API-KEY header.

const HUNTER = 'https://api.hunter.io/v2'
const hunterInit = (key: string) => ({ method: 'GET', headers: { 'x-api-key': key, 'accept': 'application/json' } })

/** Hunter's verifier → our four statuses. accept_all/webmail = risky; disposable = invalid. */
export function hunterStatus(status: unknown, result?: unknown): Verification['status'] {
  switch (String(status ?? '')) {
    case 'valid': return 'valid'
    case 'invalid':
    case 'disposable': return 'invalid'
    case 'accept_all':
    case 'webmail': return 'risky'
  }
  switch (String(result ?? '')) {
    case 'deliverable': return 'valid'
    case 'undeliverable': return 'invalid'
    case 'risky': return 'risky'
  }
  return 'unknown'
}

export const hunter: ProspectProvider = {
  id: 'hunter',
  label: 'Hunter.io',
  env: 'HUNTER_API_KEY',
  capabilities: ['domain', 'people', 'find', 'verify'],
  perMinute: 300,
  async searchPeople(q, ctx) {
    const params = new URLSearchParams({ domain: q.domain, limit: '25', offset: String(((q.page ?? 1) - 1) * 25) })
    if (q.seniorities?.length) params.set('seniority', sorted(q.seniorities).filter(x => ['junior', 'senior', 'executive'].includes(x)).join(',') || 'senior,executive')
    const json = await ctx.http('domain', params.toString(), `${HUNTER}/domain-search?${params}`, hunterInit(ctx.key)) as { data?: { organization?: string, domain?: string, emails?: Record<string, unknown>[] } }
    const titles = (q.titles ?? []).map(t => t.toLowerCase())
    return (json.data?.emails ?? [])
      .filter(e => !titles.length || titles.some(t => String(e.position ?? '').toLowerCase().includes(t.toLowerCase())))
      .map(e => ({
        provider: 'hunter' as const,
        providerId: null,
        firstName: s(e.first_name, 80),
        lastName: s(e.last_name, 80),
        title: s(e.position, 160),
        seniority: s(e.seniority, 40),
        email: s(e.value, 254)?.toLowerCase() ?? null,
        emailStatus: e.verification && typeof e.verification === 'object' ? hunterStatus((e.verification as Record<string, unknown>).status) : 'unknown',
        linkedin: s(e.linkedin, 300),
        country: null,
        city: null,
        company: s(json.data?.organization, 200),
        domain: domainOf(json.data?.domain) ?? q.domain
      }))
  },
  async findEmail(p, ctx) {
    const params = new URLSearchParams({ domain: p.domain, first_name: p.firstName, last_name: p.lastName })
    const json = await ctx.http('find', params.toString().toLowerCase(), `${HUNTER}/email-finder?${params}`, hunterInit(ctx.key)) as { data?: { email?: string | null, score?: number, verification?: { status?: string } } }
    const email = s(json.data?.email, 254)
    if (!email) return null
    return { email: email.toLowerCase(), score: json.data?.score ?? null, status: hunterStatus(json.data?.verification?.status) }
  },
  async verifyEmail(email, ctx) {
    const params = new URLSearchParams({ email })
    const json = await ctx.http('verify', email.toLowerCase(), `${HUNTER}/email-verifier?${params}`, hunterInit(ctx.key)) as { data?: { status?: string, result?: string, score?: number } }
    return { status: hunterStatus(json.data?.status, json.data?.result), detail: `hunter: ${json.data?.status ?? json.data?.result ?? 'no answer'}${json.data?.score !== undefined ? ` (${json.data.score})` : ''}` }
  },
  async credits(ctx) {
    const json = await ctx.http('credits', null, `${HUNTER}/account`, hunterInit(ctx.key)) as { data?: { requests?: Record<string, { used?: number, available?: number }> } }
    return Object.entries(json.data?.requests ?? {}).map(([k, v]) => ({ label: `${k} (this month)`, used: v.used ?? null, available: v.available ?? null }))
  }
}

// ---- adapter slots ----------------------------------------------------------------------
// Switched on by their env var once implemented: add the methods, list the capabilities.

const slot = (id: ProviderId, label: string, env: string): ProspectProvider => ({ id, label, env, capabilities: [], perMinute: 60 })
export const PROVIDERS: ProspectProvider[] = [
  apollo,
  hunter,
  slot('pdl', 'People Data Labs', 'PDL_API_KEY'),
  slot('snov', 'Snov.io', 'SNOV_CLIENT_ID'),
  slot('prospeo', 'Prospeo', 'PROSPEO_API_KEY')
]

/** The providers whose key is set, in preference order. */
export function activeProviders(env: Record<string, string | undefined>): ProspectProvider[] {
  return PROVIDERS.filter(p => Boolean(env[p.env]?.trim()) && p.capabilities.length)
}
export function providerFor(cap: Capability, env: Record<string, string | undefined>, prefer?: string): ProspectProvider | null {
  const list = activeProviders(env).filter(p => p.capabilities.includes(cap))
  return list.find(p => p.id === prefer) ?? list[0] ?? null
}
