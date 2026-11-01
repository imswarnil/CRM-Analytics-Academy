/**
 * A team admin assigns seats by email: { emails } (comma, space or newline
 * separated). Each email holds a seat until that person signs in and takes it
 * (server/utils/meter.ts claimSeat) — or the admin frees it. Refused beyond the
 * seats bought.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'org-invite', 30, 60)
  const body = await readBody<{ emails?: string | string[] }>(event).catch(() => null)
  const list = (Array.isArray(body?.emails) ? body!.emails : String(body?.emails ?? '').split(/[\s,;]+/))
    .map(e => String(e).trim().toLowerCase()).filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e))
  const emails = [...new Set(list)].slice(0, 200)
  if (!emails.length) throw createError({ statusCode: 400, statusMessage: 'Add at least one email address.' })
  const sql = useDb()
  const [org] = await sql`
    select o.id, o.seats,
           (select count(*)::int from app.org_member m where m.org_id = o.id) + (select count(*)::int from app.org_invite i where i.org_id = o.id) as used
    from app.org_member me join app.org o on o.id = me.org_id
    where me.user_id = ${user.id} and me.role = 'admin' and o.status = 'active'`
  if (!org) throw createError({ statusCode: 403, statusMessage: 'Only your team admin can assign seats.' })
  const already = await sql`
    select lower(u.email) as email from app.org_member m join neon_auth."user" u on u.id::text = m.user_id where m.org_id = ${org.id}
    union select lower(email) from app.org_invite where org_id = ${org.id}`
  const have = new Set(already.map(r => String(r.email)))
  const fresh = emails.filter(e => !have.has(e))
  if (Number(org.used) + fresh.length > Number(org.seats)) {
    throw createError({ statusCode: 409, statusMessage: `That needs ${Number(org.used) + fresh.length} seats; the team has ${org.seats}. Add seats first.` })
  }
  for (const e of fresh) await sql`insert into app.org_invite (org_id, email) values (${org.id}, ${e}) on conflict do nothing`
  return { ok: true, added: fresh.length }
})
