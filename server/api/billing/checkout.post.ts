/**
 * Pro: { plan: 'proMonthly' | 'proYearly' } → a Stripe Checkout URL. Access is
 * granted by the webhook when Stripe confirms the subscription, never here.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'checkout', 20, 60)
  const body = await readBody<{ plan?: string, locale?: string }>(event).catch(() => null)
  const plan = body?.plan === 'proYearly' ? 'proYearly' : body?.plan === 'proMonthly' ? 'proMonthly' : null
  if (!plan) throw createError({ statusCode: 400, statusMessage: 'Pick monthly or yearly.' })
  if (await hasPro(user.id)) throw createError({ statusCode: 409, statusMessage: 'You already have Pro — manage it from your dashboard.' })

  const origin = getRequestOrigin(event)
  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: 'subscription',
    customer: await customerFor(user),
    client_reference_id: user.id,
    line_items: [{ price: await priceId(plan), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: { kind: 'pro', user_id: user.id, plan },
    subscription_data: { metadata: { kind: 'pro', user_id: user.id, plan } },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pro?checkout=cancelled`,
    locale: ['es', 'fr', 'de', 'pt', 'ja', 'zh', 'ru'].includes(String(body?.locale)) ? body!.locale : 'auto'
  })
  return { url: session.url }
})
