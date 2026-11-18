/** An organisation admin assigns seats by email: { emails } (pasted list). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'org-invite', 30, 60)
  const body = await readBody<{ emails?: string }>(event).catch(() => null)
  const [me] = await useDb()`select org_id from app.org_member where user_id = ${user.id} and role = 'admin'`
  if (!me) throw createError({ statusCode: 403, statusMessage: 'Only your organisation\'s admin can invite.' })
  const added = await addInvites(Number(me.org_id), parseEmails(body?.emails))
  return { added }
})
