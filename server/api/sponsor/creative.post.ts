/**
 * The sponsor saves their banner: { id, creative, submit }. `submit: true`
 * sends it for the owner's approval; any edit after approval goes back to
 * review, so nothing unreviewed is ever shown.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ id?: number, creative?: Record<string, unknown>, submit?: boolean }>(event).catch(() => null)
  const creative = cleanCreative(body?.creative ?? {})
  if (body?.submit && (!creative.headline || !creative.url || !creative.cta)) {
    throw createError({ statusCode: 400, statusMessage: 'A headline, a button label and a link are needed to publish.' })
  }
  const sql = useDb()
  const [row] = await sql`
    update app.sponsor set creative = ${JSON.stringify(creative)}::jsonb,
      creative_status = ${body?.submit ? 'submitted' : 'draft'}, review_note = null
    where id = ${Number(body?.id)} and owner_user_id = ${user.id} and status not in ('ended', 'cancelled')
    returning *`
  if (!row) throw createError({ statusCode: 404, statusMessage: 'No such sponsorship.' })
  // A live banner that is edited comes down until it is approved again.
  if (row.status === 'live') await sql`update app.sponsor set status = 'paid' where id = ${row.id}`
  return { ok: true, sponsorship: sponsorView(row) }
})
