/** Pro Monthly / Yearly: the provider's customer portal (card, invoices, cancel). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'portal', 20, 60)
  const [sub] = await useDb()`select stripe_customer from app.subscription where user_id = ${user.id}`
  if (!sub) throw createError({ statusCode: 404, statusMessage: 'No subscription to manage.' })
  // Dodo customer ids start with cus_ too, but a Dodo subscription row is the
  // one written while PAYMENT_PROVIDER=dodo.
  if (paymentProvider() === 'dodo') {
    const portal = await dodoFetch<{ link: string }>(`/customers/${encodeURIComponent(String(sub.stripe_customer))}/customer-portal/session`, { method: 'POST' })
    return { url: portal.link }
  }
  const session = await stripe<{ url: string }>('POST', 'billing_portal/sessions', {
    customer: String(sub.stripe_customer),
    return_url: `${getRequestOrigin(event)}/account`
  })
  return { url: session.url }
})
