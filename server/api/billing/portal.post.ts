/** Pro Monthly: the Stripe customer portal (card, invoices, cancel). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'portal', 20, 60)
  const [sub] = await useDb()`select stripe_customer from app.subscription where user_id = ${user.id}`
  if (!sub) throw createError({ statusCode: 404, statusMessage: 'No subscription to manage.' })
  const session = await stripe<{ url: string }>('POST', 'billing_portal/sessions', {
    customer: String(sub.stripe_customer),
    return_url: `${getRequestOrigin(event)}/account`
  })
  return { url: session.url }
})
