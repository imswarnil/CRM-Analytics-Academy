/** Delete one of your creatives (its stats go with it). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!UUID_RE.test(id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const sql = useDb()
  const sponsor = await findSponsor(sql, user.id)
  if (!sponsor) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const rows = await sql`delete from app.sponsor_creative where id = ${id}::uuid and sponsor_id = ${sponsor.id}::uuid returning id`
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  await placementChanged()
  return { ok: true }
})
