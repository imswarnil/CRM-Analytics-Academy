/**
 * Change a team: seats, validity, status (revoke = inactive), auto-join,
 * domains, contact, note. Works on bought teams too — extending a paying
 * company by a month, or adding seats they paid for by invoice — but a
 * bought team's dates are otherwise set by Dodo's webhooks.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Bad team id' })
  const g = parseGrant(await readBody<Record<string, unknown>>(event), false)

  const sql = useDb()
  const rows = await sql`
    update app.team set
      name = coalesce(${g.name ?? null}, name),
      domain = coalesce(${g.domain ?? null}, domain),
      extra_domains = coalesce(${g.extraDomains ?? null}, extra_domains),
      seats = coalesce(${g.seats ?? null}, seats),
      status = coalesce(${g.status ?? null}, status),
      current_period_end = coalesce(${g.validUntil ?? null}, current_period_end),
      contact_email = coalesce(${g.contactEmail ?? null}, contact_email),
      auto_join = coalesce(${g.autoJoin ?? null}, auto_join),
      note = coalesce(${g.note ?? null}, note),
      updated_at = now()
    where id = ${id}::uuid
    returning id
  `
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Team not found' })
  return { ok: true }
})
