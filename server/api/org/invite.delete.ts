/** An organisation admin withdraws an invite: { email }. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ email?: string }>(event).catch(() => null)
  const email = String(body?.email ?? '').toLowerCase()
  await useDb()`
    delete from app.org_invite i using app.org_member me
    where me.user_id = ${user.id} and me.role = 'admin' and i.org_id = me.org_id and i.email = ${email}`
  return { ok: true }
})
