/**
 * Grant Pro to a company: create an admin team with a seat count and an end
 * date. Members then come from /admin (by email), from invite links, or —
 * with auto-join — from anyone with a verified address on the domain.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)
  const grant = parseGrant(body, true)

  const sql = useDb()
  const rows = await sql`
    insert into app.team (name, owner_user_id, domain, extra_domains, seats, status, current_period_end,
                          source, contact_email, auto_join, note, granted_by)
    values (${grant.name!}, null, ${grant.domain!}, ${grant.extraDomains ?? []}, ${grant.seats!}, 'active',
            ${grant.validUntil!}, 'admin', ${grant.contactEmail ?? null}, ${grant.autoJoin ?? false},
            ${grant.note ?? null}, ${admin.email})
    returning id::text
  `
  return { ok: true, id: rows[0]?.id as string }
})
