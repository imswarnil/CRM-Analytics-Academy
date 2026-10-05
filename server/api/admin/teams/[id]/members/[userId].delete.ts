/** Remove someone from a team as an admin. Their team Pro ends at once. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  const userId = String(getRouterParam(event, 'userId') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(id) || !userId) throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()
  const rows = await sql`delete from app.team_member where team_id = ${id}::uuid and user_id = ${userId} returning user_id`
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Not on this team' })
  return { ok: true }
})
