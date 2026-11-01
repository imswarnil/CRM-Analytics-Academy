/**
 * "Sponsor the Academy": { company, email, package } — three fields, nothing
 * else. Creates the sponsorship (status requested) and a sales-led lead in
 * Salesforce. The owner sends a Stripe invoice from /admin → Sponsors.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await guard(event, 'sponsor', { limit: 5, perMinutes: 60, token: body.token as string, honeypot: body.website })
  const user = await getSessionUser(event).catch(() => null)
  const email = String(user?.email ?? body.email ?? '').trim().toLowerCase().slice(0, 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  const company = String(body.company ?? '').split('').map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, 120)
  if (company.length < 2) throw createError({ statusCode: 400, statusMessage: 'Your company name is required.' })
  const pkg = SPONSOR_PACKAGES.includes(body.package as SponsorPackage) ? body.package as SponsorPackage : 'sponsorMonth'
  const sql = useDb()
  const [row] = await sql`
    insert into app.sponsor (owner_user_id, email, company, package, days)
    values (${user?.id ?? null}, ${email}, ${company}, ${pkg}, ${PRICES[pkg].days}) returning id`
  await sql`insert into app.lead (product, last_name, email, company, user_id, interest, source)
    values ('sponsorship', ${company}, ${email}, ${company}, ${user?.id ?? null}, 'sponsorship', ${String(body.source ?? '').slice(0, 60) || null})`
  const sf = await sendLeadToSalesforce({ event: 'request', product: 'sponsorship', lastName: company, email, company, lessonsDone: 0, points: 0, userId: user?.id ?? null, message: `Sponsorship request: ${pkg} (${PRICES[pkg].days} days, ${PRICES[pkg].usd} USD). Sponsor #${row!.id}.` })
  await sql`update app.lead set sf_status = ${sf} where id = (select max(id) from app.lead where email = ${email})`
  return { ok: true, id: Number(row!.id) }
})
