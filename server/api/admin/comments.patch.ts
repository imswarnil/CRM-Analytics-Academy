/** Hide or restore a comment. */
export default defineEventHandler(async (event) => {
  const user = await requireModerator(event)
  const body = await readBody<{ id?: unknown, status?: unknown }>(event)
  const id = Number(body?.id)
  const status = body?.status === 'hidden' ? 'hidden' : 'visible'
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id' })

  const sql = useDb()
  const rows = await sql`
    update app.comment
    set status = ${status},
        hidden_by = case when ${status} = 'hidden' then ${user.id} else null end,
        hidden_at = case when ${status} = 'hidden' then now() else null end
    where id = ${id}
    returning lesson_path
  `
  if (rows.length) forget(`comments:${rows[0]!.lesson_path}`)
  return { ok: true }
})
