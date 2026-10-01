/**
 * Invite someone to the team. There is no email service, so the response
 * carries the invite link for the owner to send; only its hash is stored.
 * The address must be on the team's domain (or an allowed extra domain), and
 * an invite reserves a seat until it is accepted or expires (14 days).
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const team = await requireTeamManager(user.id)
  if (!['active', 'past_due'].includes(team.status)) {
    throw createError({ statusCode: 409, statusMessage: 'This team\'s subscription is not active.' })
  }

  const body = await readBody<{ email?: string }>(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Enter an email address.' })
  if (!emailMatchesTeam(email, team)) {
    throw createError({ statusCode: 400, statusMessage: `Invites go to ${[team.domain, ...team.extra_domains].map(d => '@' + d).join(' or ')} addresses.` })
  }

  const sql = useDb()
  const already = await sql`select 1 from app.team_member where team_id = ${team.id} and lower(email) = ${email} limit 1`
  if (already.length) throw createError({ statusCode: 409, statusMessage: 'That person is already on the team.' })

  const taken = await seatsTaken(team.id)
  // A re-invite replaces the old one, so it does not need a seat of its own.
  const open = await sql`select id from app.team_invite where team_id = ${team.id} and lower(email) = ${email} and accepted_at is null and expires_at > now()`
  if (!open.length && taken.members + taken.pending >= team.seats) {
    throw createError({ statusCode: 409, statusMessage: `All ${team.seats} seats are taken. Add seats from billing, or remove someone first.` })
  }
  if (open.length) await sql`delete from app.team_invite where team_id = ${team.id} and lower(email) = ${email} and accepted_at is null`

  const token = newInviteToken()
  const rows = await sql`
    insert into app.team_invite (team_id, email, token_hash, invited_by)
    values (${team.id}, ${email}, ${await hashInviteToken(token)}, ${user.id})
    returning id::text, expires_at
  `
  setResponseHeader(event, 'cache-control', 'no-store')
  return {
    id: rows[0]?.id as string,
    email,
    expiresAt: rows[0]?.expires_at as string,
    link: `${getRequestOrigin(event)}/join?token=${encodeURIComponent(token)}`
  }
})
