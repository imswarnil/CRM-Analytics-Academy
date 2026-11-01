/**
 * A team admin changes the number of seats: { seats }. Stripe prorates; the
 * webhook confirms. Never below the seats already taken.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ seats?: number }>(event).catch(() => null)
  const seats = Math.round(Number(body?.seats))
  if (!(seats >= TEAM_MIN_SEATS && seats <= 1000)) throw createError({ statusCode: 400, statusMessage: `A team has ${TEAM_MIN_SEATS} to 1,000 seats.` })
  const sql = useDb()
  const [org] = await sql`
    select o.id, o.stripe_subscription,
           (select count(*)::int from app.org_member m where m.org_id = o.id) + (select count(*)::int from app.org_invite i where i.org_id = o.id) as used
    from app.org o where o.admin_user_id = ${user.id} and o.status = 'active' and o.stripe_subscription is not null`
  if (!org) throw createError({ statusCode: 404, statusMessage: 'You do not manage a paid team.' })
  if (seats < Number(org.used)) throw createError({ statusCode: 400, statusMessage: `${org.used} seats are assigned — free some first.` })
  const sub = await stripe<{ items: { data: { id: string }[] } }>('GET', `subscriptions/${org.stripe_subscription}`)
  await stripe('POST', `subscriptions/${org.stripe_subscription}`, { items: [{ id: sub.items.data[0]!.id, quantity: seats }], proration_behavior: 'create_prorations' })
  await sql`update app.org set seats = ${seats} where id = ${org.id}`
  return { ok: true, seats }
})
