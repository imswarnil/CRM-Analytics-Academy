/**
 * Starts a Pro checkout.
 *
 * Signed-in only, so the payment can be tied to an account: the user id rides
 * along in the session metadata, and the webhook uses it to grant Pro. The
 * email is pre-filled for convenience; it is not what the grant keys on.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot buy Pro.' })
  }

  const body = await readBody<{ plan?: string }>(event)
  const plan = body?.plan === 'lifetime' ? 'lifetime' : 'monthly'
  const productId = dodoProduct(plan)
  if (!productId) throw createError({ statusCode: 503, statusMessage: 'This plan is not available yet.' })

  const origin = getRequestOrigin(event)
  const session = await dodoFetch<{ session_id: string, checkout_url: string }>('/checkouts', {
    method: 'POST',
    body: {
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email, name: user.name || user.email },
      return_url: `${origin}/dashboard?checkout=done`,
      metadata: { user_id: user.id, plan }
    }
  })

  setResponseHeader(event, 'cache-control', 'no-store')
  return { url: session.checkout_url }
})
