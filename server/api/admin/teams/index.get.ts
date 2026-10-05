/** Every team — bought or granted — with seat usage, for /admin → Teams. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()
  const rows = await sql`
    select t.id::text, t.name, t.domain, t.extra_domains, t.seats, t.status, t.current_period_end, t.created_at,
           t.dodo_subscription_id, t.source, t.contact_email, t.auto_join, t.note, t.granted_by,
           o.email as owner_email,
           (select count(*)::int from app.team_member m where m.team_id = t.id) as members,
           (select count(*)::int from app.team_invite i where i.team_id = t.id and i.accepted_at is null and i.expires_at > now()) as pending,
           coalesce((select json_agg(json_build_object('userId', m.user_id, 'email', m.email, 'role', m.role, 'joinedAt', m.joined_at) order by m.joined_at)
                     from app.team_member m where m.team_id = t.id), '[]'::json) as roster
    from app.team t
    left join neon_auth."user" o on o.id::text = t.owner_user_id
    order by t.created_at desc
    limit 500
  `
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    teams: rows.map(r => ({
      id: r.id as string,
      name: r.name as string,
      domain: r.domain as string,
      extraDomains: (r.extra_domains as string[]) ?? [],
      seats: Number(r.seats),
      members: Number(r.members),
      pending: Number(r.pending),
      status: r.status as string,
      periodEnd: r.current_period_end as string | null,
      createdAt: r.created_at as string,
      subscription: r.dodo_subscription_id as string | null,
      ownerEmail: r.owner_email as string | null,
      source: (r.source as 'dodo' | 'admin') ?? 'dodo',
      contactEmail: r.contact_email as string | null,
      autoJoin: Boolean(r.auto_join),
      note: r.note as string | null,
      grantedBy: r.granted_by as string | null,
      roster: r.roster as { userId: string, email: string, role: string, joinedAt: string }[]
    }))
  }
})
