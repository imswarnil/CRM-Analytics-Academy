/**
 * A request from /pro (seats for a company, team or university) or an
 * interest raised elsewhere (Salesforce set-up help, consulting, mentoring):
 * one row in app.lead → a Salesforce Lead by Web-to-Lead.
 *
 * No payment is taken. Pro itself is bought with points (POST /api/redeem),
 * so it never becomes a lead. The owner follows up, and for seats creates the
 * organisation in /admin → Seats.
 *
 * Attribution: the browser sends its analytics visitor id; the visitor's own
 * first page view gives the source and landing page, and their view count
 * says how much they read before asking.
 */
// Control characters out (they could break a Salesforce field or a log line).
const clean = (v: unknown, n: number) => [...String(v ?? '')].map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, n)

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await guard(event, 'lead', { limit: 5, perMinutes: 60, token: body.token as string, honeypot: body.website })

  const interest = clean(body.product, 40)
  if (!(LEAD_INTERESTS as readonly string[]).includes(interest)) throw createError({ statusCode: 400, statusMessage: 'Pick what you are interested in.' })
  const business = interest === 'seats' || interest === 'consulting'
  const user = await getSessionUser(event).catch(() => null)

  const email = clean(user?.email ?? body.email, 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  const lastName = clean(body.lastName, 80)
  if (lastName.length < 1) throw createError({ statusCode: 400, statusMessage: 'Your last name is required.' })
  const firstName = clean(body.firstName, 40) || null
  const company = clean(body.company, 120) || null
  if (business && !company) throw createError({ statusCode: 400, statusMessage: 'Your organisation is required.' })
  const orgKind = ORG_KINDS.includes(body.orgKind as OrgKind) ? body.orgKind as OrgKind : null
  const seatsRaw = Math.round(Number(body.seats))
  const seats = interest === 'seats' && seatsRaw >= 1 && seatsRaw <= 10000 ? seatsRaw : null
  if (interest === 'seats' && !seats) throw createError({ statusCode: 400, statusMessage: 'How many seats do you need?' })
  const title = clean(body.title, 80) || null
  const phone = clean(body.phone, 40).replace(/[^\d+().\s-]/g, '') || null
  const message = clean(body.message, 2000) || null
  const country = clean(cloudflareOf(event).request?.cf?.country ?? getRequestHeader(event, 'cf-ipcountry'), 2) || null
  const locale = clean(body.locale, 5) || null
  const landing = clean(body.landing, 200) || null
  const visitor = /^[a-z0-9]{8,40}$/i.test(String(body.visitor ?? '')) ? String(body.visitor) : null

  const sql = useDb()
  const [stats, first] = await Promise.all([
    user ? sql`select lessons_done, points from app.user_points where user_id = ${user.id}` : Promise.resolve([]),
    visitor
      ? sql`
          select (array_agg(referrer order by created_at))[1] as source, (array_agg(path order by created_at))[1] as landing, count(*)::int as views
          from app.page_view where visitor = ${visitor}`
      : Promise.resolve([])
  ])
  const lessonsDone = Number(stats[0]?.lessons_done ?? 0)
  const points = Number(stats[0]?.points ?? 0)
  // The visitor's first recorded source beats the session's: it is how they
  // found the Academy, not how they came back today.
  const source = clean(first[0]?.source, 60) || clean(body.source, 60) || 'direct'
  const firstLanding = clean(first[0]?.landing, 200) || null
  const viewsBefore = first[0] ? Number(first[0].views) : null

  const [row] = await sql`
    insert into app.lead (product, first_name, last_name, email, company, title, country, phone, team_size, message, user_id, locale, source, landing,
                          lessons_done, points, visitor, seats, org_kind, interest, first_landing, views_before)
    values (${interest}, ${firstName}, ${lastName}, ${email}, ${company}, ${title}, ${country}, ${phone}, ${seats ? String(seats) : null}, ${message},
            ${user?.id ?? null}, ${locale}, ${source}, ${landing}, ${lessonsDone}, ${points}, ${visitor}, ${seats}, ${orgKind}, ${interest}, ${firstLanding}, ${viewsBefore})
    returning id`

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
    landing: landing ?? firstLanding,
    firstLanding,
    viewsBefore,
    locale,
    userId: user?.id ?? null
  })
  await sql`update app.lead set sf_status = ${sf} where id = ${row!.id}`

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
