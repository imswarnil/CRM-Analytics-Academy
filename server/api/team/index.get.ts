/**
 * The caller's team: members, open invites and seat usage. Members see the
 * roster; only the owner and admins see invites.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')

  const mine = await findUserTeam(user.id)
  if (!mine) return { team: null }

  const sql = useDb()
  const members = await sql`
    select user_id, email, role, joined_at from app.team_member
    where team_id = ${mine.team.id}
    order by case role when 'owner' then 0 when 'admin' then 1 else 2 end, joined_at
  `
  const canManage = mine.role !== 'member'
  const invites = canManage
    ? await sql`
        select id::text, email, created_at, expires_at from app.team_invite
        where team_id = ${mine.team.id} and accepted_at is null and expires_at > now()
        order by created_at desc
      `
    : []
  const taken = await seatsTaken(mine.team.id)

  return {
    team: mine.team,
    role: mine.role,
    canManage,
    seats: { total: mine.team.seats, used: taken.members, pending: taken.pending, free: Math.max(0, mine.team.seats - taken.members - taken.pending) },
    members: members.map(m => ({ userId: m.user_id as string, email: m.email as string, role: m.role as string, joinedAt: m.joined_at as string, you: m.user_id === user.id })),
    invites: invites.map(i => ({ id: i.id as string, email: i.email as string, createdAt: i.created_at as string, expiresAt: i.expires_at as string }))
  }
})
