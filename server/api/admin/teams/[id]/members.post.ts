/**
 * Add people to a team by email, as an admin. Someone who already has an
 * account joins at once (and has Pro on their next page load); anyone else
 * gets an invite link — there is no mail service, so the links come back in
 * the response for the admin to send. Domain rules are not applied: an admin
 * may add a contractor on a gmail address on purpose.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Bad team id' })

  const body = await readBody<{ emails?: string }>(event)
  const emails = [...new Set(String(body?.emails ?? '').toLowerCase().split(/[\s,;]+/).filter(Boolean))]
  if (!emails.length) throw createError({ statusCode: 400, statusMessage: 'Paste one or more email addresses.' })
  if (emails.length > 200) throw createError({ statusCode: 400, statusMessage: 'Add at most 200 at a time.' })
  const invalid = emails.filter(e => !EMAIL.test(e))
  if (invalid.length) throw createError({ statusCode: 400, statusMessage: `Not email addresses: ${invalid.slice(0, 5).join(', ')}` })

  const sql = useDb()
  const teams = await sql`select id::text, seats, contact_email from app.team where id = ${id}::uuid`
  const team = teams[0]
  if (!team) throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  const users = await sql`select id::text, lower(email) as email from neon_auth."user" where lower(email) = any(${emails})`
  const byEmail = new Map(users.map(u => [u.email as string, u.id as string]))
  const origin = getRequestOrigin(event)

  const results: { email: string, status: 'added' | 'invited' | 'already' | 'other-team' | 'no-seat', link?: string, team?: string }[] = []
  let { members, pending } = await seatsTaken(id)

  for (const email of emails) {
    const userId = byEmail.get(email)
    if (userId) {
      const current = await findUserTeam(userId)
      if (current?.team.id === id) {
        results.push({ email, status: 'already' })
        continue
      }
      if (current) {
        results.push({ email, status: 'other-team', team: current.team.name })
        continue
      }
      if (members + pending >= Number(team.seats)) {
        results.push({ email, status: 'no-seat' })
        continue
      }
      await joinGrantedTeam(id, { id: userId, email }, team.contact_email as string | null)
      members += 1
      results.push({ email, status: 'added' })
      continue
    }

    const open = await sql`select 1 from app.team_invite where team_id = ${id}::uuid and lower(email) = ${email} and accepted_at is null and expires_at > now()`
    if (!open.length && members + pending >= Number(team.seats)) {
      results.push({ email, status: 'no-seat' })
      continue
    }
    if (open.length) await sql`delete from app.team_invite where team_id = ${id}::uuid and lower(email) = ${email} and accepted_at is null`
    else pending += 1
    const token = newInviteToken()
    await sql`
      insert into app.team_invite (team_id, email, token_hash, invited_by, expires_at)
      values (${id}::uuid, ${email}, ${await hashInviteToken(token)}, ${admin.id}, now() + interval '30 days')
    `
    results.push({ email, status: 'invited', link: `${origin}/join?token=${encodeURIComponent(token)}` })
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { results }
})
