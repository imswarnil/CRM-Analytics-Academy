/** Publish or unpublish one of your creatives. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!UUID_RE.test(id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const action = (await readBody<{ action?: string }>(event))?.action

  const sql = useDb()
  const sponsor = await findSponsor(sql, user.id)
  if (!sponsor) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const rows = await sql`select status, format from app.sponsor_creative where id = ${id}::uuid and sponsor_id = ${sponsor.id}::uuid`
  const row = rows[0]
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (action === 'publish') {
    if (row.status === 'paused' || row.status === 'rejected') {
      throw createError({ statusCode: 409, statusMessage: 'The site owner has held this creative back. Create a new one to publish.' })
    }
    if (!(await hasLiveOrFutureMonth(sql, sponsor.id))) {
      throw createError({ statusCode: 409, statusMessage: 'Creatives go live once a month is paid.' })
    }
    await sql`
      update app.sponsor_creative set status = 'draft', updated_at = now()
      where sponsor_id = ${sponsor.id}::uuid and format = ${row.format} and status = 'published' and id <> ${id}::uuid
    `
    await sql`update app.sponsor_creative set status = 'published', published_at = now(), updated_at = now() where id = ${id}::uuid`
  } else if (action === 'unpublish') {
    await sql`update app.sponsor_creative set status = 'draft', updated_at = now() where id = ${id}::uuid and status = 'published'`
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
  }
  await placementChanged()
  return { ok: true }
})
