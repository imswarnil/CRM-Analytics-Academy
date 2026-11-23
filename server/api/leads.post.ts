/**
 * A request from /pro (seats for a company, team or university) or an
 * interest raised elsewhere (Salesforce set-up help, consulting, mentoring):
 * one row in app.lead → a Salesforce Lead by Web-to-Lead.
 *
 * No payment is taken here (All Access is a Stripe checkout); the owner
 * follows up by email.
 */
// Control characters out (they could break a Salesforce field or a log line).
const clean = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, n)

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await guard(event, 'lead', { limit: 5, perMinutes: 60, token: body.token as string, honeypot: body.website })

  const interest = clean(body.product, 40)
  if (!(LEAD_INTERESTS as readonly string[]).includes(interest)) throw createError({ statusCode: 400, statusMessage: 'Pick what you are interested in.' })
  const business = interest === 'seats' || interest === 'consulting' || interest === 'sponsorship'
  const user = await getSessionUser(event).catch(() => null)

  const email = clean(user?.email ?? body.email, 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  // One name field; split for Salesforce. Falls back to the email's name part.
  const fullName = clean(body.name ?? [body.firstName, body.lastName].filter(Boolean).join(' '), 120) || clean(user?.name, 120) || email.split('@')[0]!
  const [firstRaw, ...restName] = fullName.split(/\s+/)
  const lastName = restName.length ? restName.join(' ') : firstRaw!
  const firstName = restName.length ? firstRaw! : null
  const company = clean(body.company, 120) || null
  if (business && !company && interest !== 'seats') throw createError({ statusCode: 400, statusMessage: 'Your organisation is required.' })
  const orgKind = ORG_KINDS.includes(body.orgKind as OrgKind) ? body.orgKind as OrgKind : null
  const seatsRaw = Math.round(Number(body.seats))
  const seats = interest === 'seats' && seatsRaw >= 1 && seatsRaw <= 10000 ? seatsRaw : null

  const title = clean(body.title, 80) || null
  const phone = clean(body.phone, 40).replace(/[^\d+().\s-]/g, '') || null
  const message = clean(body.message, 2000) || null
  const country = clean(cloudflareOf(event).request?.cf?.country ?? getRequestHeader(event, 'cf-ipcountry'), 2) || null
  const locale = clean(body.locale, 5) || null
  const landing = clean(body.landing, 200) || null

  const sql = useDb()
  const stats = user ? await sql`select lessons_done, points from app.user_points where user_id = ${user.id}` : []
  const lessonsDone = Number(stats[0]?.lessons_done ?? 0)
  const points = Number(stats[0]?.points ?? 0)
  const source = clean(body.source, 60) || 'direct'

  const [row] = await sql`
    insert into app.lead (product, first_name, last_name, email, company, title, country, phone, team_size, message, user_id, locale, source, landing,
                          lessons_done, points, seats, org_kind, interest)
    values (${interest}, ${firstName}, ${lastName}, ${email}, ${company}, ${title}, ${country}, ${phone}, ${seats ? String(seats) : null}, ${message},
            ${user?.id ?? null}, ${locale}, ${source}, ${landing}, ${lessonsDone}, ${points}, ${seats}, ${orgKind}, ${interest})
    returning id`

  // Enrich (geo + network at this moment, the email domain, product signals,
  // the score) and send to Salesforce after the response: neither slows the form.
  const touch = touchFrom(event)
  const leadId = Number(row!.id)
  event.waitUntil((async () => {
    const enrichment = await enrichLead(leadId, { touch })
    const sf = await sendLeadToSalesforce({
      event: 'request',
      product: interest,
      firstName,
      lastName,
      email,
      company,
      title,
      country,
      phone,
      seats,
      orgKind,
      message,
      lessonsDone,
      points,
      source,
      landing,
      locale,
      userId: user?.id ?? null,
      enrichment
    })
    await sql`update app.lead set sf_status = ${sf} where id = ${leadId}`
  })().catch(e => console.warn(`lead ${leadId}: ${String((e as Error).message).slice(0, 120)}`)))

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
