/**
 * Mark a lesson complete, or un-complete it.
 *
 * `lesson_path` is stored locale-stripped, so a learner who switches from
 * English to Spanish keeps their progress rather than starting again. The path
 * is validated against a strict shape before it reaches the database: it is
 * the one field the client controls, and an unvalidated one becomes a way to
 * write arbitrary rows.
 */
const LESSON_PATH = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ lessonPath?: string, done?: boolean }>(event)

  const path = String(body?.lessonPath ?? '')
  if (!LESSON_PATH.test(path) || path.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }

  // The demo account is shared. Letting it write would mean every visitor
  // editing the same progress row and watching it change under them.
  if (await isDemoUser(user.id)) {
    setResponseHeader(event, 'cache-control', 'no-store')
    return { ok: true, demo: true, persisted: false }
  }

  const sql = useDb()
  if (body?.done === false) {
    await sql`delete from app.progress where user_id = ${user.id} and lesson_path = ${path}`
  } else {
    await sql`
      insert into app.progress (user_id, lesson_path)
      values (${user.id}, ${path})
      on conflict (user_id, lesson_path) do nothing
    `
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, persisted: true }
})
