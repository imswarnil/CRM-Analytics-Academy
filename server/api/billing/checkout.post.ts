/**
 * All Access: a one-time Stripe Checkout payment → its URL. Access is granted
 * by the webhook when Stripe confirms the payment, never here.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'checkout', 20, 60)
  const body = await readBody<{ locale?: string }>(event).catch(() => null)
  if (await hasPro(user.id)) throw createError({ statusCode: 409, statusMessage: 'You already have All Access.' })

  const origin = getRequestOrigin(event)
  const session = await stripe<{ url: string }>('POST', 'checkout/sessions', {
    mode: 'payment',
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: await priceId('allAccess'), quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { kind: 'all_access', user_id: user.id },
    payment_intent_data: { metadata: { kind: 'all_access', user_id: user.id } },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pro?checkout=cancelled`,
    locale: ['es', 'fr', 'de', 'pt', 'ja', 'zh', 'ru'].includes(String(body?.locale)) ? body!.locale : 'auto'
  })
  return { url: session.url }
})
