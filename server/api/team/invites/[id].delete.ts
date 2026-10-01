/** Withdraw an open invite, which frees its seat. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const team = await requireTeamManager(user.id)
  const id = getRouterParam(event, 'id') ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid invite' })
  const sql = useDb()
  await sql`delete from app.team_invite where id = ${id}::uuid and team_id = ${team.id} and accepted_at is null`
  return { ok: true }
})
