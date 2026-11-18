/**
 * The caller's organisation (Teams & institutions): name, seats in use and,
 * for its admins, the join code and the member list.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await claimSeat(user).catch(() => false)
  const sql = useDb()
  const [org] = await sql`
    select o.id, o.name, o.kind, o.seats, o.join_code, o.domain, o.auto_join, o.status, o.expires_at, m.role,
           (select count(*)::int from app.org_member x where x.org_id = o.id) as used
    from app.org_member m join app.org o on o.id = m.org_id where m.user_id = ${user.id}`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  if (!org) return { org: null }
  const admin = org.role === 'admin'
  const invites = admin ? await sql`select email from app.org_invite where org_id = ${org.id} order by created_at` : []
  const members = admin
    ? await sql`
        select m.user_id, m.role, m.joined_at, u.name, u.email, coalesce(p.lessons_done, 0)::int as lessons
        from app.org_member m join neon_auth."user" u on u.id::text = m.user_id
        left join app.user_points p on p.user_id = m.user_id
        where m.org_id = ${org.id} order by m.joined_at`
    : []
  return {
    org: {
      name: String(org.name),
      kind: String(org.kind),
      seats: Number(org.seats),
      used: Number(org.used),
      active: org.status === 'active' && (!org.expires_at || new Date(org.expires_at as string) > new Date()),
      expiresAt: (org.expires_at as string | null) ?? null,
      role: String(org.role),
      joinCode: admin ? String(org.join_code) : null,
      domain: (org.domain as string | null) ?? null,
      autoJoin: Boolean(org.auto_join),
      invites: invites.map(r => String(r.email)),
      members: members.map(r => ({ userId: String(r.user_id), name: r.name as string | null, email: String(r.email), role: String(r.role), lessons: Number(r.lessons), joinedAt: r.joined_at as string }))
    }
  }
})
