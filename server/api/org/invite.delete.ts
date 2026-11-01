/** A team admin frees a seat assigned by email: { email }. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ email?: string }>(event).catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const sql = useDb()
  const removed = await sql`
    delete from app.org_invite i using app.org_member me
    where me.user_id = ${user.id} and me.role = 'admin' and i.org_id = me.org_id and lower(i.email) = ${email}
    returning i.email`
  if (!removed.length) throw createError({ statusCode: 404, statusMessage: 'No such invitation.' })
  return { ok: true }
})
