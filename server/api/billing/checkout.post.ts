/**
 * Pro, self-serve: { plan: 'monthly' | 'yearly' | 'lifetime' } → a checkout URL,
 * from Dodo Payments when PAYMENT_PROVIDER=dodo (server/utils/dodo.ts), else Stripe.
 * Monthly is a subscription, lifetime one payment. Access is granted by the
 * webhook when Stripe confirms, never here.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'checkout', 20, 60)
  const body = await readBody<{ plan?: string, locale?: string }>(event).catch(() => null)
  const plan = body?.plan === 'lifetime' ? 'lifetime' : isSubscriptionPlan(body?.plan) ? body.plan : null
  if (!plan) throw createError({ statusCode: 400, statusMessage: 'Pick monthly, yearly or lifetime.' })
  if (await hasPro(user.id)) throw createError({ statusCode: 409, statusMessage: 'You already have Pro.' })

  const origin = getRequestOrigin(event)
  const meta = { kind: plan, user_id: user.id }

  if (paymentProvider() === 'dodo') {
    const productId = dodoProduct(plan)
    if (!productId) throw createError({ statusCode: 503, statusMessage: 'This plan is not available yet.' })
    const session = await dodoFetch<{ session_id: string, checkout_url: string }>('/checkouts', {
      method: 'POST',
      body: {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: user.email, name: user.name || user.email },
        return_url: `${origin}/dashboard?checkout=success`,
        metadata: meta
      }
    })
    setResponseHeader(event, 'cache-control', 'no-store')
    return { url: session.checkout_url }
  }

  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: plan === 'lifetime' ? 'payment' : 'subscription',
    customer_email: user.email,
    client_reference_id: user.id,
    // Indian Stripe accounts must collect the buyer's name and billing address
    // on export (non-INR, cross-border) payments; harmless everywhere else.
    billing_address_collection: 'required',
    line_items: [{ price: await priceId(plan), quantity: 1 }],
    allow_promotion_codes: true,
    metadata: meta,
    ...(plan !== 'lifetime' ? { subscription_data: { metadata: meta } } : { payment_intent_data: { metadata: meta } }),
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pro?checkout=cancelled`,
    locale: ['es', 'de', 'pt', 'fr', 'ja'].includes(String(body?.locale)) ? body!.locale : 'auto'
  })
  return { url: session.url }
})
