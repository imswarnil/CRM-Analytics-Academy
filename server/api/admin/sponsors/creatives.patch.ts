/**
 * Moderate a creative: pause (temporarily off the site), reject (with a note
 * the sponsor sees in their studio), or restore to published / draft.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: string, status?: string, note?: string }>(event)
  const id = String(body?.id ?? '')
  const status = String(body?.status ?? '')
  if (!UUID_RE.test(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  if (!['published', 'paused', 'rejected', 'draft'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad status' })
  }
  const note = String(body?.note ?? '').trim().slice(0, 500) || null

  const sql = useDb()
  const rows = await sql`select sponsor_id::text, format from app.sponsor_creative where id = ${id}::uuid`
  const row = rows[0]
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (status === 'published') {
    // One live creative per format per sponsor.
    await sql`
      update app.sponsor_creative set status = 'draft', updated_at = now()
      where sponsor_id = ${row.sponsor_id}::uuid and format = ${row.format} and status = 'published' and id <> ${id}::uuid
    `
  }
  await sql`
    update app.sponsor_creative
    set status = ${status}, review_note = ${note},
        published_at = case when ${status} = 'published' then now() else published_at end,
        updated_at = now()
    where id = ${id}::uuid
  `
  await placementChanged()
  return { ok: true }
})
