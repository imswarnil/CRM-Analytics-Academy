/** Edit the brand name and website shown on the calendar and on creatives. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ name?: unknown, website?: unknown }>(event)
  const sql = useDb()
  const sponsor = await findSponsor(sql, user.id)
  if (!sponsor) throw createError({ statusCode: 404, statusMessage: 'Book a month first.' })

  const name = String(body?.name ?? '').trim().slice(0, 80)
  if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'The brand name needs at least two characters.' })
  const website = cleanWebsite(body?.website)

  await sql`update app.sponsor set name = ${name}, website = ${website}, updated_at = now() where id = ${sponsor.id}::uuid`
  await placementChanged()
  return { ok: true }
})
