/**
 * The signed-in learner's organisation, if they hold a seat in one: name,
 * kind, seats used, and — for the org's own admins — the members and the
 * join code to hand out.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const [org] = await sql`
    select o.id, o.name, o.kind, o.seats, o.join_code, o.expires_at, o.domains, o.billing, o.status as org_status, m.role,
           (select count(*)::int from app.org_invite i where i.org_id = o.id) as invited,
           (select count(*)::int from app.org_member x where x.org_id = o.id) as used
    from app.org_member m join app.org o on o.id = m.org_id
    where m.user_id = ${user.id}`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  if (!org) return { org: null }
  const admin = org.role === 'admin'
  const invites = admin ? await sql`select email, created_at from app.org_invite where org_id = ${org.id} order by created_at` : []
  const members = admin
    ? await sql`
        select m.user_id, m.role, m.joined_at, u.name, u.email, coalesce(p.lessons_done, 0)::int as lessons, coalesce(p.points, 0)::int as points,
               (select count(*)::int from app.meter_view v where v.subject = 'u:' || m.user_id) as sessions
        from app.org_member m
        left join neon_auth."user" u on u.id::text = m.user_id
        left join app.user_points p on p.user_id = m.user_id
        where m.org_id = ${org.id} order by m.joined_at`
    : []
  return {
    org: {
      name: String(org.name),
      kind: String(org.kind),
      seats: Number(org.seats),
      used: Number(org.used),
      expiresAt: org.expires_at ?? null,
      role: String(org.role),
      joinCode: admin ? String(org.join_code) : null,
      domains: (org.domains as string[] | null) ?? [],
      billing: String(org.billing),
      invited: Number(org.invited),
      invites: invites.map(r => String(r.email)),
      members: members.map(r => ({ userId: String(r.user_id), role: String(r.role), joinedAt: r.joined_at, name: r.name as string | null, email: r.email as string | null, lessons: Number(r.lessons), points: Number(r.points), sessions: Number(r.sessions) }))
    }
  }
})
