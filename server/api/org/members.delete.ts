/** An organisation admin frees a seat: { userId }. Admins cannot remove themselves. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ userId?: string }>(event).catch(() => null)
  const target = String(body?.userId ?? '')
  if (!target || target === user.id) throw createError({ statusCode: 400, statusMessage: 'Pick a member.' })
  const rows = await useDb()`
    delete from app.org_member m using app.org_member me
    where me.user_id = ${user.id} and me.role = 'admin' and m.org_id = me.org_id and m.user_id = ${target}
    returning m.user_id`
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'No such member.' })
  return { ok: true }
})
