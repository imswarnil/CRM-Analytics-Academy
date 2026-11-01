import type { H3Event } from 'h3'

/**
 * The visitor meter — a sign-up funnel, not a paywall. Without an account a
 * reader gets ANON_SESSIONS metered pages (a lesson, an interview answer, a
 * visualiser; re-reading one the same day is free) per hashed IP per
 * ANON_WINDOW_DAYS, then the wall asks them to sign up. Any account is
 * unlimited on free content; paid lessons need Pro (server/utils/entitlement.ts).
 *
 * Signing in also settles organisation seats: an email invited to a team
 * (app.org_invite) takes its seat, and a VERIFIED email on an organisation's
 * domain list joins while seats last.
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

/**
 * Seats on sign-in: an invitation to this email takes its seat (the invite is
 * the seat, already counted); otherwise a verified email on an organisation's
 * domain list joins while seats last.
 */
export async function claimSeat(user: SessionUser): Promise<void> {
  const sql = useDb()
  const email = user.email.toLowerCase()
  const [invite] = await sql`
    select i.org_id from app.org_invite i join app.org o on o.id = i.org_id
    where lower(i.email) = ${email} and o.status = 'active'
      and not exists (select 1 from app.org_member m where m.user_id = ${user.id}) limit 1`
  if (invite) {
    await sql.transaction([
      sql`insert into app.org_member (org_id, user_id) values (${invite.org_id}, ${user.id}) on conflict do nothing`,
      sql`delete from app.org_invite where org_id = ${invite.org_id} and lower(email) = ${email}`
    ])
    return
  }
  if (!user.emailVerified) return
  const domain = email.split('@')[1]
  if (!domain) return
  const [org] = await sql`
    select o.id from app.org o
    where ${domain} = any(o.domains) and o.status = 'active' and (o.expires_at is null or o.expires_at > now())
      and (select count(*) from app.org_member m where m.org_id = o.id) + (select count(*) from app.org_invite i where i.org_id = o.id) < o.seats
      and not exists (select 1 from app.org_member m where m.user_id = ${user.id})
    order by o.created_at limit 1`
  if (org) await sql`insert into app.org_member (org_id, user_id) values (${org.id}, ${user.id}) on conflict do nothing`
}

export async function meterStatus(event: H3Event, user: SessionUser | null): Promise<MeterStatus> {
  if (!user && BOT.test(getRequestHeader(event, 'user-agent') ?? '')) {
    return { signedIn: false, unlimited: true, via: 'crawler', allowance: 0, used: 0, remaining: 0, bought: 0, windowDays: null }
  }
  if (user) {
    await claimSeat(user).catch(() => {})
    return { signedIn: true, unlimited: true, via: 'account', allowance: 0, used: 0, remaining: 0, bought: 0, windowDays: null }
  }
  const subject = await subjectOf(event, user)
  const sql = useDb()
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
  const days = ANON_WINDOW_DAYS
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
