/** Move an enquiry through new → contacted → won / closed. */
export default defineEventHandler(async (event) => {
  const user = await requireModerator(event)
  const body = await readBody<{ id?: unknown, status?: unknown, note?: unknown }>(event)

  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id.' })
  const status = String(body?.status ?? '')
  if (!['new', 'contacted', 'won', 'closed'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad status.' })
  }
  const note = String(body?.note ?? '').trim().slice(0, 2000) || null

  const sql = useDb()
  await sql`
    update app.inquiry
    set status = ${status}, note = coalesce(${note}, note), handled_by = ${user.id}, handled_at = now()
    where id = ${id}
  `
  return { ok: true }
})
