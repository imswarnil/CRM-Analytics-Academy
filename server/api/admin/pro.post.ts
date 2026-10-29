/**
 * Grant or revoke Pro: { userId, pro: boolean, months?: number, note? }.
 * `months` omitted = no end date. This is how a lead becomes a member.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ userId?: string, pro?: boolean, months?: number, note?: string }>(event)
  const userId = String(body?.userId ?? '')
  if (!/^[\w-]{6,64}$/.test(userId)) throw createError({ statusCode: 400, statusMessage: 'Bad user' })
  const sql = useDb()
  const [exists] = await sql`select 1 as ok from neon_auth."user" where id::text = ${userId}`
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'No such user' })
  if (!body?.pro) {
    await sql`delete from app.entitlement where user_id = ${userId}`
    return { pro: false }
  }
  const months = Number(body.months)
  const expires = Number.isFinite(months) && months > 0 ? new Date(Date.now() + Math.min(months, 120) * 30.44 * 86_400_000).toISOString() : null
  const note = String(body.note ?? '').slice(0, 200) || null
  await sql`
    insert into app.entitlement (user_id, pro, note, expires_at) values (${userId}, true, ${note}, ${expires})
    on conflict (user_id) do update set pro = true, note = excluded.note, expires_at = excluded.expires_at, granted_at = now()`
  return { pro: true, expiresAt: expires }
})
