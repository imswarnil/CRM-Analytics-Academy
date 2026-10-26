/** Approve, reject or delete a community interview question. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: number, action?: string, note?: string }>(event)
  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Which question?' })
  const sql = useDb()
  if (body?.action === 'delete') {
    await sql`delete from app.interview_question where id = ${id}`
  } else if (body?.action === 'approve' || body?.action === 'reject') {
    await sql`update app.interview_question set status = ${body.action === 'approve' ? 'approved' : 'rejected'},
      review_note = ${body.note ? String(body.note).slice(0, 500) : null}, updated_at = now() where id = ${id}`
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
  }
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
