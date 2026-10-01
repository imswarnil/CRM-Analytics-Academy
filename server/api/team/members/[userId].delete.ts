/**
 * Remove someone from the team (freeing their seat), or leave it yourself.
 * The owner cannot be removed; ownership changes go through support.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const target = getRouterParam(event, 'userId') ?? ''
  const mine = await findUserTeam(user.id)
  if (!mine) throw createError({ statusCode: 404, statusMessage: 'You are not on a team.' })

  const leaving = target === user.id
  if (!leaving && mine.role === 'member') throw createError({ statusCode: 403, statusMessage: 'Only the team owner or an admin can remove people.' })
  if (target === mine.team.owner_user_id) throw createError({ statusCode: 400, statusMessage: 'The team owner cannot be removed.' })

  const sql = useDb()
  await sql`delete from app.team_member where team_id = ${mine.team.id} and user_id = ${target}`
  return { ok: true }
})
