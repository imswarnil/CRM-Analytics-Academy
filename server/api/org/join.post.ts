/**
 * Take a seat: { code } → membership of that org, if a seat is free.
 *
 * The seat count is checked inside the same transaction as the insert, under
 * an advisory lock on the org, so the last seat cannot be taken twice. One
 * org per account (a unique index); joining a second one is refused.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'org-join', 10, 60)
  const body = await readBody<{ code?: string }>(event).catch(() => null)
  const code = String(body?.code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!/^[A-Z0-9]{8}$/.test(code)) throw createError({ statusCode: 400, statusMessage: 'That code does not look right — it is 8 letters and digits.' })

  const sql = useDb()
  const [org] = await sql`select id, seats, expires_at from app.org where join_code = ${code}`
  if (!org) throw createError({ statusCode: 404, statusMessage: 'No organisation has that code.' })
  if (org.expires_at && new Date(org.expires_at as string) < new Date()) throw createError({ statusCode: 410, statusMessage: 'This organisation\'s seats have ended.' })
  const [mine] = await sql`select org_id from app.org_member where user_id = ${user.id}`
  if (mine) throw createError({ statusCode: 409, statusMessage: Number(mine.org_id) === Number(org.id) ? 'You already have a seat here.' : 'You already hold a seat in another organisation.' })

  const [, joined] = await sql.transaction([
    sql`select pg_advisory_xact_lock(hashtext(${`org:${org.id}`}))`,
    sql`
      insert into app.org_member (org_id, user_id)
      select ${org.id}, ${user.id}
      where (select count(*) from app.org_member where org_id = ${org.id}) < ${org.seats}
      on conflict do nothing
      returning org_id`
  ])
  if (!joined?.length) throw createError({ statusCode: 409, statusMessage: 'Every seat is taken — ask your admin for more.' })
  return { ok: true }
})
