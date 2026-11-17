/**
 * Create or change an organisation (admin only).
 *   create: { name, kind, seats, months?, domain?, adminEmail?, leadId? }
 *   update: { id, seats?, months?, status? }
 * The admin email, if it belongs to an account, becomes the org's admin.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  const sql = useDb()
  const months = Number(b.months)
  const expires = Number.isFinite(months) && months > 0 ? new Date(Date.now() + Math.min(months, 120) * 30.44 * 86_400_000).toISOString() : null
  const seats = Math.round(Number(b.seats))

  if (b.id) {
    const id = Number(b.id)
    const status = b.status === 'ended' ? 'ended' : b.status === 'active' ? 'active' : null
    await sql`
      update app.org set
        seats = coalesce(${Number.isFinite(seats) && seats > 0 ? seats : null}, seats),
        expires_at = case when ${Boolean(b.months)} then ${expires}::timestamptz else expires_at end,
        status = coalesce(${status}, status)
      where id = ${id}`
    return { ok: true }
  }

  const name = String(b.name ?? '').trim().slice(0, 120)
  const kind = ORG_KINDS.includes(b.kind as OrgKind) ? b.kind as OrgKind : 'company'
  const domain = String(b.domain ?? '').trim().toLowerCase().replace(/^@/, '') || null
  if (name.length < 2 || !(seats >= 1)) throw createError({ statusCode: 400, statusMessage: 'Name and seats are required.' })
  if (domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) throw createError({ statusCode: 400, statusMessage: 'Bad domain.' })
  const [org] = await sql`
    insert into app.org (name, kind, seats, join_code, domain, expires_at, lead_id)
    values (${name}, ${kind}, ${seats}, ${newJoinCode()}, ${domain}, ${expires}, ${b.leadId ? Number(b.leadId) : null})
    returning id, join_code`
  const email = String(b.adminEmail ?? '').trim().toLowerCase()
  if (email) {
    const [u] = await sql`select id::text as id from neon_auth."user" where lower(email) = ${email}`
    if (u) await sql`insert into app.org_member (org_id, user_id, role) values (${org!.id}, ${u.id}, 'admin') on conflict (user_id) do nothing`
  }
  if (b.leadId) await sql`update app.lead set status = 'won' where id = ${Number(b.leadId)}`
  return { id: Number(org!.id), joinCode: String(org!.join_code) }
})
