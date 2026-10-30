/**
 * Create or change an organisation's seats.
 *
 *   { name, kind, seats, months?, domain?, leadId?, note?, adminEmail? }   create
 *   { id, seats?, months?, note?, regenerateCode?, adminEmail? }             update
 *   { id, removeUserId }                                                     free a seat
 *   { id, delete: true }                                                     remove the org
 *
 * `adminEmail` makes that existing account the org's admin (taking a seat).
 * `months` sets the end date from today; 0 = no end date.
 */
const clean = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, n)

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()
  const id = Number(body.id) || null
  const months = body.months === undefined ? undefined : Math.min(Math.max(Number(body.months) || 0, 0), 120)
  const expires = months === undefined ? undefined : months > 0 ? new Date(Date.now() + months * 30.44 * 86_400_000).toISOString() : null
  const seats = body.seats === undefined ? undefined : Math.round(Number(body.seats))
  if (seats !== undefined && !(seats >= 1 && seats <= 10000)) throw createError({ statusCode: 400, statusMessage: 'Seats must be 1–10,000.' })

  if (id && body.delete === true) {
    await sql`delete from app.org where id = ${id}`
    return { ok: true }
  }
  if (id && body.removeUserId) {
    await sql`delete from app.org_member where org_id = ${id} and user_id = ${clean(body.removeUserId, 64)}`
    return { ok: true }
  }

  let orgId = id
  if (!orgId) {
    const name = clean(body.name, 120)
    const kind = ORG_KINDS.includes(body.kind as OrgKind) ? body.kind as OrgKind : 'company'
    if (name.length < 2 || seats === undefined) throw createError({ statusCode: 400, statusMessage: 'A name and a seat count are required.' })
    const domain = clean(body.domain, 120).toLowerCase() || null
    const [row] = await sql`
      insert into app.org (name, kind, seats, join_code, domain, lead_id, note, expires_at)
      values (${name}, ${kind}, ${seats}, ${newJoinCode()}, ${domain}, ${Number(body.leadId) || null}, ${clean(body.note, 300) || null}, ${expires ?? null})
      returning id`
    orgId = Number(row!.id)
    if (body.leadId) await sql`update app.lead set status = 'won' where id = ${Number(body.leadId)}`
  } else {
    if (seats !== undefined) {
      const [{ used } = { used: 0 }] = await sql`select count(*)::int as used from app.org_member where org_id = ${orgId}`
      if (seats < Number(used)) throw createError({ statusCode: 400, statusMessage: `${used} seats are in use — free some before lowering.` })
      await sql`update app.org set seats = ${seats} where id = ${orgId}`
    }
    if (expires !== undefined) await sql`update app.org set expires_at = ${expires} where id = ${orgId}`
    if (body.note !== undefined) await sql`update app.org set note = ${clean(body.note, 300) || null} where id = ${orgId}`
    if (body.regenerateCode) await sql`update app.org set join_code = ${newJoinCode()} where id = ${orgId}`
  }

  const adminEmail = clean(body.adminEmail, 254).toLowerCase()
  if (adminEmail) {
    const [u] = await sql`select id::text as id from neon_auth."user" where lower(email) = ${adminEmail}`
    if (!u) throw createError({ statusCode: 404, statusMessage: 'No account with that email — ask them to sign up first.' })
    const [other] = await sql`select org_id from app.org_member where user_id = ${u.id} and org_id <> ${orgId}`
    if (other) throw createError({ statusCode: 409, statusMessage: 'That account already holds a seat in another organisation.' })
    await sql`
      insert into app.org_member (org_id, user_id, role) values (${orgId}, ${u.id}, 'admin')
      on conflict (org_id, user_id) do update set role = 'admin'`
  }
  return { ok: true, id: orgId }
})
