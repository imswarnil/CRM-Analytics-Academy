/**
 * Stripe → the Academy. Signature-checked (STRIPE_WEBHOOK_SECRET), each event
 * handled once (app.stripe_event). Subscribe the endpoint to:
 *
 *   checkout.session.completed
 *   customer.subscription.updated · customer.subscription.deleted
 *   charge.refunded
 *
 * Lifetime: a paid checkout writes app.entitlement; a full refund removes it.
 * Monthly: app.subscription mirrors the subscription. New customers reach
 * Salesforce as Web-to-Lead events.
 */
interface StripeSubscription {
  id: string
  customer: string
  status: string
  cancel_at_period_end: boolean
  current_period_end?: number
  items?: { data: { current_period_end?: number, price?: { unit_amount?: number } }[] }
  metadata: Record<string, string>
}

async function userById(id: string) {
  const [u] = await useDb()`select id::text as id, email, name from neon_auth."user" where id::text = ${id}`
  return u ? { id: String(u.id), email: String(u.email), name: u.name as string | null } : null
}

async function syncSubscription(sub: StripeSubscription) {
  const userId = sub.metadata?.user_id
  const plan = sub.metadata?.kind
  if (!isSubscriptionPlan(plan) || !userId) return
  const end = sub.current_period_end ?? sub.items?.data[0]?.current_period_end
  const sql = useDb()
  const [before] = await sql`select status from app.subscription where user_id = ${userId}`
  await sql`
    insert into app.subscription (user_id, plan, stripe_customer, stripe_subscription, status, current_period_end, cancel_at_period_end, updated_at)
    values (${userId}, ${plan}, ${sub.customer}, ${sub.id}, ${sub.status}, ${end ? new Date(end * 1000).toISOString() : null}, ${sub.cancel_at_period_end}, now())
    on conflict (user_id) do update set plan = excluded.plan, stripe_customer = excluded.stripe_customer, stripe_subscription = excluded.stripe_subscription,
      status = excluded.status, current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end, updated_at = now()`
  if (!before && ['active', 'trialing'].includes(sub.status)) {
    const user = await userById(userId)
    if (user) await sendAcademyEvent('subscribe', user, { plan, usd: (sub.items?.data[0]?.price?.unit_amount ?? 0) / 100, seats: 1 })
  }
}

export default defineEventHandler(async (event) => {
  const payload = await readRawBody(event, 'utf8') ?? ''
  if (!(await verifyStripeSignature(payload, getRequestHeader(event, 'stripe-signature')))) {
    throw createError({ statusCode: 400, statusMessage: 'Bad signature' })
  }
  const evt = JSON.parse(payload) as { id: string, type: string, data: { object: Record<string, unknown> } }
  const sql = useDb()
  const fresh = await sql`insert into app.stripe_event (id, type) values (${evt.id}, ${evt.type}) on conflict do nothing returning id`
  if (!fresh.length) return { ok: true, duplicate: true }

  try {
    const obj = evt.data.object
    const meta = (obj.metadata ?? {}) as Record<string, string>
    if (evt.type === 'checkout.session.completed') {
      if (meta.kind === 'lifetime' && meta.user_id && obj.payment_status === 'paid') {
        await sql`
          insert into app.entitlement (user_id, product, note, expires_at)
          values (${meta.user_id}, 'lifetime', ${`stripe ${String(obj.id)}`}, null)
          on conflict (user_id) do update set product = 'lifetime', expires_at = null, note = excluded.note`
        const user = await userById(meta.user_id)
        if (user) await sendAcademyEvent('subscribe', user, { plan: 'lifetime', usd: Number(obj.amount_total ?? 0) / 100, seats: 1 })
      } else if (isSubscriptionPlan(meta.kind) && typeof obj.subscription === 'string') {
        await syncSubscription(await stripe<StripeSubscription>('GET', `subscriptions/${obj.subscription}`))
      }
    } else if (evt.type === 'customer.subscription.updated' || evt.type === 'customer.subscription.deleted') {
      await syncSubscription(obj as unknown as StripeSubscription)
    } else if (evt.type === 'charge.refunded' && obj.refunded === true && typeof obj.payment_intent === 'string') {
      // A charge does not carry the checkout's metadata: find the session.
      const found = await stripe<{ data: { metadata?: Record<string, string> }[] }>('GET', 'checkout/sessions', { payment_intent: obj.payment_intent, limit: 1 })
      const m = found.data[0]?.metadata
      if (m?.kind === 'lifetime' && m.user_id) await sql`delete from app.entitlement where user_id = ${m.user_id} and product = 'lifetime'`
    }
  } catch (e) {
    // Let Stripe retry: forget that this event was handled.
    await sql`delete from app.stripe_event where id = ${evt.id}`
    throw e
  }
  return { ok: true }
})
