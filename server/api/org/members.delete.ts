/**
 * An org admin frees a seat: { userId }. Admins cannot remove themselves
 * (that would leave the org without anyone to manage it); the site owner can
 * in /admin.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ userId?: string }>(event).catch(() => null)
  const target = String(body?.userId ?? '')
  if (!/^[\w-]{6,64}$/.test(target) || target === user.id) throw createError({ statusCode: 400, statusMessage: 'Bad member' })
  const sql = useDb()
  const removed = await sql`
    delete from app.org_member m
    using app.org_member me
    where me.user_id = ${user.id} and me.role = 'admin'
      and m.org_id = me.org_id and m.user_id = ${target}
    returning m.user_id`
  if (!removed.length) throw createError({ statusCode: 404, statusMessage: 'No such member in your organisation.' })
  return { ok: true }
})
