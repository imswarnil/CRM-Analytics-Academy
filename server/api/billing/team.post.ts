/**
 * A team: { name, seats } → a Stripe Checkout URL for `seats` × the seat price
 * per month. The organisation is created now as `pending` with the buyer as
 * its admin; the webhook activates it when Stripe confirms the subscription.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'checkout', 20, 60)
  const body = await readBody<{ name?: string, seats?: number }>(event).catch(() => null)
  const name = String(body?.name ?? '').split('').map(c => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? ' ' : c)).join('').trim().slice(0, 120)
  const seats = Math.round(Number(body?.seats))
  if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Name your team.' })
  if (!(seats >= TEAM_MIN_SEATS && seats <= 1000)) throw createError({ statusCode: 400, statusMessage: `A team has ${TEAM_MIN_SEATS} to 1,000 seats.` })

  const sql = useDb()
  const [mine] = await sql`select o.id, o.status from app.org_member m join app.org o on o.id = m.org_id where m.user_id = ${user.id}`
  if (mine && mine.status === 'active') throw createError({ statusCode: 409, statusMessage: 'You already hold a seat in a team.' })
  // A pending team from an abandoned checkout is reused rather than piling up.
  const [pending] = await sql`select id from app.org where admin_user_id = ${user.id} and status = 'pending' order by id desc limit 1`
  const orgId = pending
    ? Number((await sql`update app.org set name = ${name}, seats = ${seats} where id = ${pending.id} returning id`)[0]!.id)
    : Number((await sql`
        insert into app.org (name, kind, seats, join_code, billing, status, admin_user_id)
        values (${name}, 'team', ${seats}, ${newJoinCode()}, 'stripe', 'pending', ${user.id}) returning id`)[0]!.id)

  const origin = getRequestOrigin(event)
  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: 'subscription',
    customer: await customerFor(user),
    client_reference_id: user.id,
    line_items: [{ price: await priceId('teamSeat'), quantity: seats, adjustable_quantity: { enabled: true, minimum: TEAM_MIN_SEATS, maximum: 1000 } }],
    allow_promotion_codes: true,
    metadata: { kind: 'team', user_id: user.id, org_id: String(orgId) },
    subscription_data: { metadata: { kind: 'team', user_id: user.id, org_id: String(orgId) } },
    success_url: `${origin}/team?checkout=success`,
    cancel_url: `${origin}/pro?checkout=cancelled`
  })
  return { url: session.url }
})
