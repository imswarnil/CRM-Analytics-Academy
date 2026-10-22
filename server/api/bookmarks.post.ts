/**
 * Save or unsave a lesson for later: { path, saved }. The path is the
 * locale-stripped lesson route, like progress.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ path?: unknown, saved?: unknown }>(event)
  const path = String(body?.path ?? '')
  if (!/^\/[a-z0-9/-]{1,200}$/.test(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad lesson path' })
  }
  const sql = useDb()
  if (body?.saved === false) {
    await sql`delete from app.bookmark where user_id = ${user.id} and lesson_path = ${path}`
  } else {
    await sql`insert into app.bookmark (user_id, lesson_path) values (${user.id}, ${path}) on conflict do nothing`
  }
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
