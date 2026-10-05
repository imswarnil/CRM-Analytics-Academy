/** Delete one of your own comments. Moderators hide instead, from /admin. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id' })

  const sql = useDb()
  const rows = await sql`delete from app.comment where id = ${id} and user_id = ${user.id} returning lesson_path`
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true }
})
