/**
 * Join an organisation with its code: { code }. One organisation per
 * learner. When the organisation has a domain (a college), the learner's
 * email must be verified and at that domain. Seats are checked inside the
 * insert, so two people cannot take the last seat at once.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'org-join', 10, 60)
  const body = await readBody<{ code?: string }>(event).catch(() => null)
  const code = String(body?.code ?? '').trim().toUpperCase()
  if (!/^[A-Z0-9]{8}$/.test(code)) throw createError({ statusCode: 400, statusMessage: 'That code is not valid.' })
  const sql = useDb()
  const [org] = await sql`select id, domain, status, expires_at from app.org where join_code = ${code}`
  if (!org || org.status !== 'active' || (org.expires_at && new Date(org.expires_at as string) <= new Date())) {
    throw createError({ statusCode: 404, statusMessage: 'That code is not valid.' })
  }
  if (org.domain) {
    const domain = user.email.split('@')[1]?.toLowerCase()
    if (!user.emailVerified || domain !== org.domain) {
      throw createError({ statusCode: 403, statusMessage: `Sign in with your verified @${org.domain} email to join.` })
    }
  }
  const rows = await sql`
    insert into app.org_member (org_id, user_id, role)
    select ${org.id}, ${user.id}, 'member'
    where (select count(*) from app.org_member where org_id = ${org.id}) < (select seats from app.org where id = ${org.id})
    on conflict do nothing
    returning org_id`
  if (!rows.length) {
    const [mine] = await sql`select org_id from app.org_member where user_id = ${user.id}`
    throw createError({ statusCode: 409, statusMessage: mine ? 'You already belong to an organisation.' : 'Every seat is taken — ask your admin for more.' })
  }
  return { ok: true }
})
