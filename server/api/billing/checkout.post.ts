/**
 * Pro, self-serve: { plan: 'monthly' | 'yearly' | 'lifetime' } → a Stripe Checkout URL.
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
  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: plan === 'lifetime' ? 'payment' : 'subscription',
    customer_email: user.email,
    client_reference_id: user.id,
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
