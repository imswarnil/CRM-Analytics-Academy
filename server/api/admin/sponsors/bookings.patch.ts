/**
 * Change a booking:
 *   cancel    release the month (held or paid). Refund a paid one in Dodo.
 *   refunded  clear the needs-refund flag once the refund is made in Dodo.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: string, action?: string, note?: string }>(event)
  const id = String(body?.id ?? '')
  if (!UUID_RE.test(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  const note = String(body?.note ?? '').trim().slice(0, 500) || null
  const sql = useDb()

  if (body?.action === 'cancel') {
    await sql`
      update app.sponsor_booking set status = 'cancelled', note = coalesce(${note}, 'cancelled by admin'), updated_at = now()
      where id = ${id}::uuid and status in ('held', 'paid')
    `
  } else if (body?.action === 'refunded') {
    await sql`
      update app.sponsor_booking set needs_refund = false, note = coalesce(${note}, 'refunded'), updated_at = now()
      where id = ${id}::uuid
    `
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }
  await placementChanged()
  return { ok: true }
})
