/**
 * Team helpers shared by the /api/team routes.
 */
export interface TeamRow {
  id: string
  name: string
  owner_user_id: string
  domain: string
  extra_domains: string[]
  seats: number
  status: string
  current_period_end: string | null
  created_at: string
}

/** The caller's team and their role on it, or null. One team per user. */
export async function findUserTeam(userId: string): Promise<{ team: TeamRow, role: 'owner' | 'admin' | 'member' } | null> {
  const sql = useDb()
  const rows = await sql`
    select t.id::text, t.name, t.owner_user_id, t.domain, t.extra_domains, t.seats, t.status,
           t.current_period_end, t.created_at, m.role
    from app.team_member m
    join app.team t on t.id = m.team_id
    where m.user_id = ${userId}
    order by (t.status = 'active') desc, t.created_at desc
    limit 1
  `
  const r = rows[0]
  if (!r) return null
  const { role, ...team } = r
  return { team: team as TeamRow, role: role as 'owner' | 'admin' | 'member' }
}

/** Requires the caller to own or administer a team; returns it. */
export async function requireTeamManager(userId: string): Promise<TeamRow> {
  const mine = await findUserTeam(userId)
  if (!mine) throw createError({ statusCode: 404, statusMessage: 'You are not on a team.' })
  if (mine.role === 'member') throw createError({ statusCode: 403, statusMessage: 'Only the team owner or an admin can do that.' })
  return mine.team
}

/** Seats taken: members plus open (unexpired, unaccepted) invites. */
export async function seatsTaken(teamId: string): Promise<{ members: number, pending: number }> {
  const sql = useDb()
  const rows = await sql`
    select
      (select count(*)::int from app.team_member where team_id = ${teamId}) as members,
      (select count(*)::int from app.team_invite where team_id = ${teamId} and accepted_at is null and expires_at > now()) as pending
  `
  return { members: Number(rows[0]?.members ?? 0), pending: Number(rows[0]?.pending ?? 0) }
}

/** SHA-256 hex of an invite token; only the hash is ever stored. */
export async function hashInviteToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export function newInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
