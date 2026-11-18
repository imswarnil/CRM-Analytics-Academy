import type { SessionUser } from './auth'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Clean, de-duplicated, lower-cased emails from a pasted list (comma, space or newline). */
export function parseEmails(raw: unknown, max = 2000): string[] {
  const list = String(raw ?? '').toLowerCase().split(/[\s,;]+/).map(s => s.trim()).filter(s => EMAIL.test(s) && s.length <= 254)
  return [...new Set(list)].slice(0, max)
}

/**
 * Give a signed-in learner the seat that is waiting for them, if any: an
 * invite for their verified email, or an organisation with `auto_join` at
 * their verified email's domain. One organisation per learner; the seat
 * count is checked inside the insert. Returns true when a seat was claimed.
 * Called by GET /api/progress (every session) and GET /api/org.
 */
export async function claimSeat(user: SessionUser): Promise<boolean> {
  if (!user.emailVerified) return false
  const email = user.email.toLowerCase()
  const domain = email.split('@')[1] ?? ''
  const sql = useDb()
  const rows = await sql`
    with mine as (select 1 from app.org_member where user_id = ${user.id}),
    target as (
      select o.id from app.org o
      where o.status = 'active' and (o.expires_at is null or o.expires_at > now())
        and (exists (select 1 from app.org_invite i where i.org_id = o.id and i.email = ${email})
             or (o.auto_join and o.domain = ${domain}))
        and (select count(*) from app.org_member m where m.org_id = o.id) < o.seats
      order by exists (select 1 from app.org_invite i where i.org_id = o.id and i.email = ${email}) desc, o.id
      limit 1
    )
    insert into app.org_member (org_id, user_id, role)
    select id, ${user.id}, 'member' from target where not exists (select 1 from mine)
    on conflict do nothing
    returning org_id`
  if (!rows.length) return false
  await sql`delete from app.org_invite where email = ${email}`
  return true
}

/** Add invites to an organisation, skipping people who already hold a seat there. */
export async function addInvites(orgId: number, emails: string[]): Promise<number> {
  if (!emails.length) return 0
  const rows = await useDb()`
    insert into app.org_invite (org_id, email)
    select ${orgId}, e from unnest(${emails}::text[]) as e
    where not exists (
      select 1 from app.org_member m join neon_auth."user" u on u.id::text = m.user_id
      where m.org_id = ${orgId} and lower(u.email) = e)
    on conflict do nothing
    returning email`
  return rows.length
}
