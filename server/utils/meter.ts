import type { H3Event } from 'h3'

/**
 * Usage-based access: sessions, paid in points (shared/utils/products.ts has
 * the numbers). One session = one metered page the first time it is opened on
 * a day; re-reading it that day is free.
 *
 *   anonymous   ANON_SESSIONS per hashed IP per ANON_WINDOW_DAYS
 *   account     ACCOUNT_SESSIONS in total, plus every pack in app.session_ledger
 *   unlimited   admin, an admin grant (app.entitlement), or a seat in an active
 *               organisation — including one joined automatically because the
 *               account's VERIFIED email domain is on the organisation's list
 *
 * The IP is never stored: the subject is a SHA-256 of it with the site's
 * secret. Crawlers are never metered (the pages are public and prerendered;
 * the meter is a fair-use wall, not a lock on public content).
 */
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|pagespeed/i

export interface MeterStatus {
  signedIn: boolean
  unlimited: boolean
  /** Why unlimited: an organisation's name, 'grant', 'admin' or 'crawler'. */
  via: string | null
  allowance: number
  used: number
  remaining: number
  bought: number
  /** Anonymous allowances reset; this is when the oldest counted session drops out. */
  windowDays: number | null
}

async function subjectOf(event: H3Event, user: SessionUser | null) {
  if (user) return `u:${user.id}`
  return `ip:${(await sha256(`meter:${clientAddress(event) ?? 'unknown'}:${await secretKey()}`)).slice(0, 40)}`
}

/** Joins the user to an organisation whose domain list has their verified email domain. */
async function joinByDomain(user: SessionUser): Promise<void> {
  if (!user.emailVerified) return
  const domain = user.email.split('@')[1]?.toLowerCase()
  if (!domain) return
  const sql = useDb()
  const [org] = await sql`
    select o.id from app.org o
    where ${domain} = any(o.domains) and (o.expires_at is null or o.expires_at > now())
      and (select count(*) from app.org_member m where m.org_id = o.id) < o.seats
      and not exists (select 1 from app.org_member m where m.user_id = ${user.id})
    order by o.created_at limit 1`
  if (org) await sql`insert into app.org_member (org_id, user_id) values (${org.id}, ${user.id}) on conflict do nothing`
}

async function unlimitedVia(user: SessionUser | null): Promise<string | null> {
  if (!user) return null
  if (isAdmin(user)) return 'admin'
  await joinByDomain(user).catch(() => {})
  const sql = useDb()
  const [row] = await sql`
    select (select o.name from app.org_member m join app.org o on o.id = m.org_id
            where m.user_id = ${user.id} and (o.expires_at is null or o.expires_at > now()) limit 1) as org,
           exists (select 1 from app.entitlement e where e.user_id = ${user.id} and e.pro and (e.expires_at is null or e.expires_at > now())) as grant`
  return row?.org ? String(row.org) : row?.grant ? 'grant' : null
}

export async function meterStatus(event: H3Event, user: SessionUser | null): Promise<MeterStatus> {
  if (!user && BOT.test(getRequestHeader(event, 'user-agent') ?? '')) {
    return { signedIn: false, unlimited: true, via: 'crawler', allowance: 0, used: 0, remaining: 0, bought: 0, windowDays: null }
  }
  const via = await unlimitedVia(user)
  const subject = await subjectOf(event, user)
  const sql = useDb()
  if (user) {
    const [row] = await sql`
      select (select count(*)::int from app.meter_view where subject = ${subject}) as used,
             (select coalesce(sum(sessions), 0)::int from app.session_ledger where user_id = ${user.id}) as bought`
    const used = Number(row?.used ?? 0)
    const bought = Number(row?.bought ?? 0)
    const allowance = ACCOUNT_SESSIONS + bought
    return { signedIn: true, unlimited: Boolean(via), via, allowance, used, remaining: Math.max(0, allowance - used), bought, windowDays: null }
  }
  const [row] = await sql`
    select count(*)::int as used from app.meter_view
    where subject = ${subject} and created_at > now() - make_interval(days => ${ANON_WINDOW_DAYS})`
  const used = Number(row?.used ?? 0)
  return { signedIn: false, unlimited: false, via: null, allowance: ANON_SESSIONS, used, remaining: Math.max(0, ANON_SESSIONS - used), bought: 0, windowDays: ANON_WINDOW_DAYS }
}

/**
 * Opens a metered page: free if already opened today or unlimited, else one
 * session if any are left. The check and the insert are one statement under
 * an advisory lock on the subject, so two tabs cannot both take the last one.
 */
export async function chargeSession(event: H3Event, user: SessionUser | null, path: string): Promise<{ ok: boolean, charged: boolean, status: MeterStatus }> {
  const status = await meterStatus(event, user)
  if (status.unlimited) return { ok: true, charged: false, status }
  const subject = await subjectOf(event, user)
  const sql = useDb()
  const [seen] = await sql`select 1 from app.meter_view where subject = ${subject} and path = ${path} and day = current_date`
  if (seen) return { ok: true, charged: false, status }
  // Accounts count every session ever; anonymous visitors only the window.
  const days = user ? 36500 : ANON_WINDOW_DAYS
  const [, inserted] = await sql.transaction([
    sql`select pg_advisory_xact_lock(hashtext(${subject}))`,
    sql`
      insert into app.meter_view (subject, path)
      select ${subject}, ${path}
      where (select count(*) from app.meter_view where subject = ${subject} and created_at > now() - make_interval(days => ${days})) < ${status.allowance}
      on conflict do nothing
      returning 1`
  ])
  if (!inserted?.length) {
    // Another request for the same page may have recorded it a moment ago.
    const [now] = await sql`select 1 from app.meter_view where subject = ${subject} and path = ${path} and day = current_date`
    if (now) return { ok: true, charged: false, status }
    return { ok: false, charged: false, status: { ...status, remaining: 0 } }
  }
  return { ok: true, charged: true, status: { ...status, used: status.used + 1, remaining: Math.max(0, status.remaining - 1) } }
}
