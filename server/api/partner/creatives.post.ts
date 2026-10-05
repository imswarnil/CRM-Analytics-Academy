/**
 * Save a creative from the studio — create, or update one of your own by id.
 * `publish: true` also makes it live: it replaces any other published
 * creative of the same format (one per format is served), and it shows in
 * every placement of that format during your paid months.
 *
 * A creative the site owner paused or rejected can still be edited, but only
 * the owner can put it back live — make a new one instead.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const raw = (await readBody<Record<string, unknown>>(event)) ?? {}
  const sql = useDb()
  const sponsor = await findSponsor(sql, user.id)
  if (!sponsor) throw createError({ statusCode: 404, statusMessage: 'Book a month first.' })

  const c = validateCreative(raw)
  const publish = raw.publish === true
  if (publish && !(await hasLiveOrFutureMonth(sql, sponsor.id))) {
    throw createError({ statusCode: 409, statusMessage: 'Creatives go live once a month is paid. Save it as a draft for now.' })
  }

  let id = typeof raw.id === 'string' && UUID_RE.test(raw.id) ? raw.id : null
  if (id) {
    const own = await sql`select status, format from app.sponsor_creative where id = ${id}::uuid and sponsor_id = ${sponsor.id}::uuid`
    const row = own[0]
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    if (row.format !== c.format) throw createError({ statusCode: 400, statusMessage: 'A creative cannot change format.' })
    const locked = row.status === 'paused' || row.status === 'rejected'
    if (locked && publish) {
      throw createError({ statusCode: 409, statusMessage: 'The site owner has held this creative back. Create a new one to publish.' })
    }
    // Editing a live creative keeps it live (the change shows within minutes);
    // editing a draft keeps it a draft unless publishing.
    const status = locked ? row.status as string : publish || row.status === 'published' ? 'published' : 'draft'
    await sql`
      update app.sponsor_creative set
        mode = ${c.mode}, image_url = ${c.imageUrl}, image_mobile_url = ${c.imageMobileUrl}, logo_url = ${c.logoUrl},
        headline = ${c.headline}, body = ${c.body}, cta = ${c.cta}, theme = ${c.theme},
        click_url = ${c.clickUrl}, alt = ${c.alt},
        status = ${status},
        published_at = case when ${publish}::boolean then now() else published_at end,
        updated_at = now()
      where id = ${id}::uuid
    `
  } else {
    const rows = await sql`
      insert into app.sponsor_creative
        (sponsor_id, format, mode, image_url, image_mobile_url, logo_url, headline, body, cta, theme, click_url, alt, status, published_at)
      values
        (${sponsor.id}::uuid, ${c.format}, ${c.mode}, ${c.imageUrl}, ${c.imageMobileUrl}, ${c.logoUrl}, ${c.headline}, ${c.body}, ${c.cta},
         ${c.theme}, ${c.clickUrl}, ${c.alt}, ${publish ? 'published' : 'draft'}, ${publish ? new Date().toISOString() : null})
      returning id::text
    `
    id = rows[0]!.id as string
  }

  if (publish) {
    await sql`
      update app.sponsor_creative set status = 'draft', updated_at = now()
      where sponsor_id = ${sponsor.id}::uuid and format = ${c.format} and status = 'published' and id <> ${id}::uuid
    `
  }
  await placementChanged()
  return { ok: true, id }
})
