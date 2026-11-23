/**
 * Salesforce REST, server to server — the account sync's only door into the
 * org. Pure: `fetch` and `sleep` are passed in, nothing is auto-imported, so
 * scripts/check-gtm.mjs dry-runs it against mocked responses.
 *
 * ⚠️ The org was frozen once. This uses the OAuth 2.0 **Client Credentials**
 * flow of an External Client App whose run-as user is a dedicated API-only
 * integration user: no username, no password, no UI login, nothing to lock.
 * Writes are sObject Collections upserts by external ID (≤ 200 records a call,
 * allOrNone false), never the Bulk API, with backoff on 429/5xx and a hard cap
 * on calls per run. Setup: salesforce/CRM-PROCESS.md → "Account sync".
 */

export interface SfConfig {
  /** The org's My Domain, e.g. https://acme.my.salesforce.com (client credentials needs it). */
  instanceUrl: string
  clientId: string
  clientSecret: string
  apiVersion: string
}

export function sfConfigFromEnv(env: Record<string, string | undefined> = process.env): SfConfig | null {
  const instanceUrl = String(env.SF_INSTANCE_URL ?? '').trim().replace(/\/+$/, '')
  const clientId = String(env.SF_CLIENT_ID ?? '').trim()
  const clientSecret = String(env.SF_CLIENT_SECRET ?? '').trim()
  if (!instanceUrl || !clientId || !clientSecret || !/^https:\/\/[a-z0-9.-]+$/i.test(instanceUrl)) return null
  const v = String(env.SF_API_VERSION ?? '').trim()
  return { instanceUrl, clientId, clientSecret, apiVersion: /^v\d{2}\.0$/.test(v) ? v : 'v62.0' }
}

export type FetchLike = (url: string, init?: { method?: string, headers?: Record<string, string>, body?: string | URLSearchParams, signal?: AbortSignal }) => Promise<{ ok: boolean, status: number, json: () => Promise<unknown>, text: () => Promise<string> }>

export class SfError extends Error {
  kind: 'auth' | 'limit' | 'http' | 'network'
  constructor(kind: 'auth' | 'limit' | 'http' | 'network', message: string) {
    super(message)
    this.kind = kind
  }
}

export interface SfSession {
  token: string
  instanceUrl: string
  apiVersion: string
  /** Calls made so far this run (the token included). */
  calls: number
  maxCalls: number
  fetch: FetchLike
  sleep: (ms: number) => Promise<void>
}

export async function sfConnect(cfg: SfConfig, f: FetchLike, opts: { maxCalls?: number, sleep?: (ms: number) => Promise<void> } = {}): Promise<SfSession> {
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: cfg.clientId, client_secret: cfg.clientSecret })
  let res
  try {
    res = await f(`${cfg.instanceUrl}/services/oauth2/token`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body })
  } catch (e) {
    throw new SfError('network', `token: ${String((e as Error).message).slice(0, 120)}`)
  }
  if (!res.ok) {
    // Never echo the response body: it can name the client. The status is enough.
    throw new SfError('auth', `token request refused (${res.status}) — check the External Client App and its run-as user`)
  }
  const json = await res.json() as { access_token?: string, instance_url?: string }
  if (!json.access_token) throw new SfError('auth', 'token response had no access_token')
  return {
    token: json.access_token,
    instanceUrl: (json.instance_url || cfg.instanceUrl).replace(/\/+$/, ''),
    apiVersion: cfg.apiVersion,
    calls: 1,
    maxCalls: opts.maxCalls ?? 12,
    fetch: f,
    sleep: opts.sleep ?? (ms => new Promise(r => setTimeout(r, ms)))
  }
}

export interface UpsertResult {
  externalId: string
  ok: boolean
  id: string | null
  created: boolean
  error: string | null
}

/** One collections call with up to 3 tries: backoff on 429, 5xx and network errors. */
async function call(s: SfSession, method: string, path: string, body: unknown): Promise<unknown> {
  let last = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    if (s.calls >= s.maxCalls) throw new SfError('limit', `call cap of ${s.maxCalls} reached for this run`)
    s.calls++
    let res
    try {
      res = await s.fetch(`${s.instanceUrl}/services/data/${s.apiVersion}${path}`, {
        method,
        headers: { 'authorization': `Bearer ${s.token}`, 'content-type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify(body)
      })
    } catch (e) {
      last = `network: ${String((e as Error).message).slice(0, 100)}`
      await s.sleep(500 * 3 ** attempt)
      continue
    }
    if (res.ok) return res.json()
    const text = (await res.text().catch(() => '')).slice(0, 300)
    if (res.status === 401) throw new SfError('auth', `401 from ${path}: the token was refused`)
    if (res.status === 403 && /REQUEST_LIMIT_EXCEEDED/.test(text)) throw new SfError('limit', 'Salesforce API daily limit reached')
    if (res.status === 429 || res.status >= 500) {
      last = `${res.status}: ${text}`
      await s.sleep(500 * 3 ** attempt)
      continue
    }
    throw new SfError('http', `${res.status} from ${path}: ${text}`)
  }
  throw new SfError('http', `gave up after 3 tries: ${last}`)
}

/**
 * Upserts records by external ID with sObject Collections
 * (PATCH /composite/sobjects/{type}/{field}), `batch` records a call.
 * Each record must carry `attributes.type` and the external ID field.
 */
export async function sfUpsert(s: SfSession, sobject: string, extField: string, records: Record<string, unknown>[], batch = 200): Promise<UpsertResult[]> {
  const out: UpsertResult[] = []
  for (let i = 0; i < records.length; i += batch) {
    const chunk = records.slice(i, i + batch)
    const res = await call(s, 'PATCH', `/composite/sobjects/${sobject}/${extField}`, { allOrNone: false, records: chunk }) as { id?: string, success?: boolean, created?: boolean, errors?: { statusCode?: string, message?: string }[] }[]
    chunk.forEach((r, j) => {
      const x = res?.[j]
      out.push({
        externalId: String(r[extField]),
        ok: Boolean(x?.success),
        id: x?.id ?? null,
        created: Boolean(x?.created),
        error: x?.success ? null : (x?.errors ?? []).map(e => `${e.statusCode ?? 'ERROR'}: ${e.message ?? ''}`).join('; ').slice(0, 300) || 'no result'
      })
    })
  }
  return out
}

// ---- payloads ----------------------------------------------------------------
// One function per object, so what is sent is reviewable in one place and the
// field list matches salesforce/crm/ exactly. Values are trimmed to the field
// lengths in the metadata.

const t = (v: unknown, n: number) => (v === null || v === undefined || v === '' ? null : String(v).slice(0, n))
const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : null)

export interface LearnerRow {
  userId: string
  email: string
  name: string | null
  plan: string
  pro: boolean
  lessons: number
  points: number
  streak: number
  activeDays30: number
  lastActive: string | null
  quizzes: number
  exams: number
  bestExamPct: number
  checkouts: number
  signedUp: string | null
  score: number
  grade: string
  reasons: string
  emailDomain: string | null
  domainKind: string | null
  company: string | null
  website: string | null
  linkedin: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  networkOrg: string | null
  source: string | null
  orgId: number | null
}

export function learnerRecord(l: LearnerRow): Record<string, unknown> {
  const rec: Record<string, unknown> = {
    attributes: { type: 'Academy_Learner__c' },
    Academy_User_Id__c: l.userId,
    Name: t(l.name || l.email.split('@')[0] || 'Learner', 80),
    Email__c: t(l.email, 254),
    Plan__c: l.plan,
    Is_Pro__c: l.pro,
    Active__c: l.activeDays30 > 0,
    Lessons_Done__c: l.lessons,
    Points__c: l.points,
    Streak_Days__c: l.streak,
    Active_Days_30__c: l.activeDays30,
    Last_Active__c: l.lastActive,
    Quiz_Attempts__c: l.quizzes,
    Exam_Attempts__c: l.exams,
    Best_Exam_Score__c: l.bestExamPct,
    Checkout_Intent__c: l.checkouts,
    Signed_Up__c: l.signedUp,
    Site_Score__c: l.score,
    Site_Grade__c: l.grade,
    Score_Reasons__c: t(l.reasons, 1000),
    Email_Domain__c: t(l.emailDomain, 120),
    Domain_Type__c: l.domainKind,
    Company__c: t(l.company, 120),
    Company_Website__c: t(l.website, 255),
    Company_LinkedIn__c: t(l.linkedin, 255),
    Country__c: t(l.country, 2),
    Region__c: t(l.region, 80),
    City__c: t(l.city, 80),
    Timezone__c: t(l.timezone, 60),
    Network_Org__c: t(l.networkOrg, 120),
    Traffic_Source__c: t(l.source, 60)
  }
  // A lookup by the org's external ID, or cleared when the seat is gone.
  if (l.orgId) rec.Organisation__r = { Academy_Org_Id__c: String(l.orgId) }
  else rec.Organisation__c = null
  return rec
}

export interface OrgRow {
  id: number
  name: string
  kind: string
  seats: number
  used: number
  joinCode: string
  domain: string | null
  status: string
  expiresAt: string | null
}

export function orgRecord(o: OrgRow): Record<string, unknown> {
  const active = o.status === 'active' && (!o.expiresAt || new Date(o.expiresAt).getTime() > Date.now())
  return {
    attributes: { type: 'Account' },
    Academy_Org_Id__c: String(o.id),
    Name: t(o.name, 255),
    Org_Type__c: o.kind === 'college' ? 'university' : o.kind,
    Academy_Plan__c: 'seats',
    Seats_Purchased__c: o.seats,
    // The org's validation rule: used ≤ purchased.
    Seats_Used__c: Math.min(o.used, o.seats),
    Join_Code__c: o.joinCode,
    Seat_Term_End__c: day(o.expiresAt),
    Lifecycle_Stage__c: active ? 'customer' : 'churned',
    Motion__c: 'sales-led',
    Website: o.domain ? `https://${o.domain}` : null
  }
}

export interface SeatRow {
  orgId: number
  userId: string
  role: string
  joinedAt: string | null
  active: boolean
}

export const seatKey = (orgId: number | string, userId: string) => `${orgId}:${userId}`

export function seatRecord(s: SeatRow): Record<string, unknown> {
  return {
    attributes: { type: 'Seat_Assignment__c' },
    Academy_Seat_Key__c: seatKey(s.orgId, s.userId),
    Account__r: { Academy_Org_Id__c: String(s.orgId) },
    Learner__r: { Academy_User_Id__c: s.userId },
    Academy_User_Id__c: s.userId,
    Role__c: s.role === 'admin' ? 'admin' : 'member',
    Status__c: s.active ? 'active' : 'freed',
    Joined_On__c: day(s.joinedAt)
  }
}

/** A seat that no longer exists on the site: freed, never deleted (the history stays). */
export function freedSeatRecord(key: string): Record<string, unknown> {
  return { attributes: { type: 'Seat_Assignment__c' }, Academy_Seat_Key__c: key, Status__c: 'freed' }
}

/** Stable hash of a payload: only changed rows are sent. */
export async function recordHash(rec: Record<string, unknown>): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(rec)))
  return [...new Uint8Array(buf)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('')
}
