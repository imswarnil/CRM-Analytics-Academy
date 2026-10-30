/** Every organisation with its seat use and members, for /admin → Seats. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()
  const [orgs, members] = await Promise.all([
    sql`
      select o.*, (select count(*)::int from app.org_member m where m.org_id = o.id) as used
      from app.org o order by o.created_at desc`,
    sql`
      select m.org_id, m.user_id, m.role, m.joined_at, u.name, u.email, coalesce(p.lessons_done, 0)::int as lessons
      from app.org_member m
      left join neon_auth."user" u on u.id::text = m.user_id
      left join app.user_points p on p.user_id = m.user_id
      order by m.joined_at`
  ])
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    orgs: orgs.map(o => ({
      id: Number(o.id),
      name: String(o.name),
      kind: String(o.kind),
      seats: Number(o.seats),
      used: Number(o.used),
      joinCode: String(o.join_code),
      domain: o.domain as string | null,
      leadId: o.lead_id === null ? null : Number(o.lead_id),
      note: o.note as string | null,
      expiresAt: o.expires_at ?? null,
      createdAt: o.created_at,
      members: members.filter(m => Number(m.org_id) === Number(o.id)).map(m => ({ userId: String(m.user_id), role: String(m.role), name: m.name as string | null, email: m.email as string | null, lessons: Number(m.lessons), joinedAt: m.joined_at }))
    }))
  }
})
