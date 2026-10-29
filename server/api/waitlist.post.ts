/** Toggle "notify me when this section opens" for the signed-in learner. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'waitlist', 60, 60)
  const body = await readBody<{ section?: string, join?: boolean }>(event).catch(() => null)
  const section = String(body?.section ?? '')
  if (!/^[a-z0-9-]{2,60}$/.test(section)) throw createError({ statusCode: 400, statusMessage: 'Unknown section' })
  const sql = useDb()
  // `join: true` only ever adds (used right after sign-up); otherwise it toggles.
  const removed = body?.join ? [] : await sql`delete from app.waitlist where user_id = ${user.id} and section = ${section} returning 1`
  if (!removed.length) await sql`insert into app.waitlist (user_id, section) values (${user.id}, ${section}) on conflict do nothing`
  forget('waitlist-counts')
  setResponseHeader(event, 'cache-control', 'no-store')
  return { waiting: !removed.length }
})
