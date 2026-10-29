/**
 * "Get it" on /pro: one product request → app.lead → a Salesforce Lead.
 *
 * No payment is taken. The owner sees the lead in /admin → Leads and in
 * Salesforce, follows up, and grants access (Pro) in /admin → Users. Products
 * granted to an account (Pro, the bootcamp) need the requester signed in.
 */
// Control characters out (they could break a Salesforce field or a log line).
const clean = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, n)

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await guard(event, 'lead', { limit: 5, perMinutes: 60, token: body.token as string, honeypot: body.website })

  const product = productById(clean(body.product, 40))
  if (!product) throw createError({ statusCode: 400, statusMessage: 'Pick a product.' })
  const user = await getSessionUser(event).catch(() => null)
  if (product.needsAccount && !user) throw createError({ statusCode: 401, statusMessage: 'Sign in first — this is added to your account.' })

  const email = clean(user?.email ?? body.email, 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  const lastName = clean(body.lastName, 80)
  if (lastName.length < 1) throw createError({ statusCode: 400, statusMessage: 'Your last name is required.' })
  const firstName = clean(body.firstName, 40) || null
  const company = clean(body.company, 120) || null
  if (product.audience === 'business' && !company) throw createError({ statusCode: 400, statusMessage: 'Your company is required.' })
  const title = clean(body.title, 80) || null
  const phone = clean(body.phone, 40).replace(/[^\d+().\s-]/g, '') || null
  const teamSize = clean(body.teamSize, 20) || null
  const message = clean(body.message, 2000) || null
  const country = clean(cloudflareOf(event).request?.cf?.country ?? getRequestHeader(event, 'cf-ipcountry'), 2) || null
  const locale = clean(body.locale, 5) || null
  const source = clean(body.source, 60) || null
  const landing = clean(body.landing, 200) || null

  const sql = useDb()
  const [stats] = user ? await sql`select lessons_done, points from app.user_points where user_id = ${user.id}` : []
  const lessonsDone = Number(stats?.lessons_done ?? 0)
  const points = Number(stats?.points ?? 0)

  const [row] = await sql`
    insert into app.lead (product, first_name, last_name, email, company, title, country, phone, team_size, message, user_id, locale, source, landing, lessons_done, points)
    values (${product.id}, ${firstName}, ${lastName}, ${email}, ${company}, ${title}, ${country}, ${phone}, ${teamSize}, ${message}, ${user?.id ?? null}, ${locale}, ${source}, ${landing}, ${lessonsDone}, ${points})
    returning id`

  const sf = await sendLeadToSalesforce({ product: product.id, productName: product.id, firstName, lastName, email, company, title, country, phone, teamSize, message, lessonsDone, points, source, landing, locale, userId: user?.id ?? null })
  await sql`update app.lead set sf_status = ${sf} where id = ${row!.id}`

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
