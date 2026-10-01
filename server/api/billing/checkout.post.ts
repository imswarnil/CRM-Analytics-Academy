/**
 * Starts a checkout: Pro Monthly, Pro Annual, or a Team's seats.
 *
 * Signed-in only, so the payment can be tied to an account: the user id rides
 * along in the session metadata, and the webhook uses it to grant Pro (or to
 * create the team). The return redirect grants nothing.
 *
 * A team is bought on a company email: its domain becomes the team's, and
 * members must share it. Seats are the subscription's quantity (3–50);
 * larger teams, invoicing and SSO go through /sales.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot buy Pro.' })
  }

  const body = await readBody<{ plan?: string, seats?: number, teamName?: string }>(event)
  const plan: Plan = body?.plan === 'annual' ? 'annual' : body?.plan === 'team' ? 'team' : 'monthly'
  if (body?.plan === 'lifetime') {
    throw createError({ statusCode: 400, statusMessage: 'Lifetime is no longer offered. Pro Annual is the best value.' })
  }

  const productId = dodoProduct(plan)
  if (!productId) throw createError({ statusCode: 503, statusMessage: 'This plan is not available yet.' })

  let quantity = 1
  const metadata: Record<string, string> = { user_id: user.id, plan }

  if (plan === 'team') {
    const seats = Math.floor(Number(body?.seats))
    if (!Number.isFinite(seats) || seats < TEAM_SEATS.min || seats > TEAM_SEATS.max) {
      throw createError({ statusCode: 400, statusMessage: `A self-serve team has ${TEAM_SEATS.min}–${TEAM_SEATS.max} seats. For more, talk to sales.` })
    }
    if (isPersonalMailbox(user.email)) {
      throw createError({ statusCode: 400, statusMessage: 'Teams are bought on a company email address, not a personal mailbox. Sign in with your work email.' })
    }
    const teamName = String(body?.teamName ?? '').trim().slice(0, 80)
    if (teamName.length < 2) throw createError({ statusCode: 400, statusMessage: 'Give the team a name.' })
    quantity = seats
    Object.assign(metadata, { seats: String(seats), team_name: teamName, team_domain: teamEmailDomain(user.email) })
  }

  const origin = getRequestOrigin(event)
  const session = await dodoFetch<{ session_id: string, checkout_url: string }>('/checkouts', {
    method: 'POST',
    body: {
      product_cart: [{ product_id: productId, quantity }],
      customer: { email: user.email, name: user.name || user.email },
      return_url: plan === 'team' ? `${origin}/team?checkout=done` : `${origin}/dashboard?checkout=done`,
      metadata
    }
  })

  setResponseHeader(event, 'cache-control', 'no-store')
  return { url: session.checkout_url }
})
