/**
 * Accept an invite. The signed-in account's email must match the invite (and
 * so the team's domain); the seat is consumed here, not when it was sent.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ token?: string }>(event)
  const token = String(body?.token ?? '')
  if (token.length < 16) throw createError({ statusCode: 400, statusMessage: 'This invite link is incomplete.' })

  const sql = useDb()
  const rows = await sql`
    select i.id::text, i.email, i.expires_at, i.accepted_at, t.id::text as team_id, t.name, t.status, t.seats
    from app.team_invite i join app.team t on t.id = i.team_id
    where i.token_hash = ${await hashInviteToken(token)}
    limit 1
  `
  const inv = rows[0]
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'This invite does not exist or was withdrawn.' })
  if (inv.accepted_at) throw createError({ statusCode: 409, statusMessage: 'This invite has already been used.' })
  if (new Date(inv.expires_at as string) < new Date()) throw createError({ statusCode: 410, statusMessage: 'This invite has expired. Ask for a new one.' })
  if (!['active', 'past_due'].includes(inv.status as string)) throw createError({ statusCode: 409, statusMessage: 'This team\'s subscription is not active.' })
  if (String(inv.email).toLowerCase() !== user.email.toLowerCase()) {
    throw createError({ statusCode: 403, statusMessage: `This invite is for ${inv.email}. Sign in with that address to accept it.` })
  }

  const other = await findUserTeam(user.id)
  if (other && other.team.id !== inv.team_id) throw createError({ statusCode: 409, statusMessage: `You are already on the team "${other.team.name}".` })

  const members = await sql`select count(*)::int as n from app.team_member where team_id = ${inv.team_id}`
  if (Number(members[0]?.n ?? 0) >= Number(inv.seats)) throw createError({ statusCode: 409, statusMessage: 'The team has no free seats. Ask the owner to add one.' })

  await sql`
    insert into app.team_member (team_id, user_id, email, role)
    values (${inv.team_id}::uuid, ${user.id}, ${user.email}, 'member')
    on conflict (team_id, user_id) do nothing
  `
  await sql`update app.team_invite set accepted_at = now(), accepted_by = ${user.id} where id = ${inv.id}::uuid`
  return { ok: true, team: { id: inv.team_id as string, name: inv.name as string } }
})
