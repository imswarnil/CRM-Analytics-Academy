/**
 * Dodo Payments → the Academy. The only thing that grants or removes Pro when
 * PAYMENT_PROVIDER=dodo: the return from checkout is a redirect the browser
 * controls and proves nothing; this signed server-to-server delivery is the
 * record. Each delivery id is stored once (app.stripe_event, shared with the
 * Stripe webhook — the ids never collide), so retries are no-ops.
 *
 * Point the Dodo webhook at https://crmanalytics.imswarnil.com/api/billing/webhook
 * and subscribe to:
 *
 *   payment.succeeded                    lifetime (one-time) → app.entitlement
 *   subscription.active / .renewed       monthly · yearly    → app.subscription (status active)
 *   subscription.cancelled               keep access, cancel at period end
 *   subscription.expired / .failed / .on_hold   access ends
 *   refund.succeeded                     a refunded lifetime loses Pro
 */
interface DodoEvent {
  type: string
  data: {
    payment_id?: string
    subscription_id?: string | null
    product_id?: string
    product_cart?: { product_id: string }[] | null
    status?: string
    next_billing_date?: string
    cancel_at_next_billing_date?: boolean
    total_amount?: number
    recurring_pre_tax_amount?: number
    customer?: { customer_id?: string, email?: string, name?: string }
    metadata?: Record<string, string>
  }
}

export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  const id = getRequestHeader(event, 'webhook-id')
  const ok = await verifyDodoWebhook({ id, timestamp: getRequestHeader(event, 'webhook-timestamp'), signature: getRequestHeader(event, 'webhook-signature') }, raw)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })

  const msg = JSON.parse(raw) as DodoEvent
  const sql = useDb()
  const fresh = await sql`insert into app.stripe_event (id, type) values (${`dodo:${id}`}, ${msg.type}) on conflict do nothing returning id`
  if (!fresh.length) return { ok: true, duplicate: true }

  try {
    const d = msg.data
    // The account comes from checkout metadata; failing that, the customer's
    // email matched against Neon Auth.
    let userId = d.metadata?.user_id
    if (!userId && d.customer?.email) {
      const [u] = await sql`select id::text as id from neon_auth."user" where lower(email) = lower(${d.customer.email}) limit 1`
      userId = u?.id as string | undefined
    }
    const plan = (d.metadata?.kind as DodoPlan | undefined) ?? planOfProduct(d.product_id ?? d.product_cart?.[0]?.product_id)
    const customer = d.customer?.customer_id ?? ''

    if (msg.type === 'refund.succeeded') {
      if (d.payment_id) await sql`delete from app.entitlement where product = 'lifetime' and note = ${`dodo ${d.payment_id}`}`
      return { ok: true }
    }
    if (!userId) return { ok: true, ignored: 'no matching user' }

    if (msg.type === 'payment.succeeded' && !d.subscription_id && plan === 'lifetime') {
      await sql`
        insert into app.entitlement (user_id, product, note, expires_at)
        values (${userId}, 'lifetime', ${`dodo ${d.payment_id}`}, null)
        on conflict (user_id) do update set product = 'lifetime', expires_at = null, note = excluded.note`
      const [u] = await sql`select id::text as id, email, name from neon_auth."user" where id::text = ${userId}`
      if (u) await sendAcademyEvent('subscribe', { id: String(u.id), email: String(u.email), name: u.name as string | null }, { plan: 'lifetime', usd: (d.total_amount ?? 0) / 100, seats: 1 })
      return { ok: true }
    }

    if (!d.subscription_id || (plan !== 'monthly' && plan !== 'yearly')) return { ok: true, ignored: msg.type }
    const status = ({
      'subscription.active': 'active',
      'subscription.renewed': 'active',
      'subscription.plan_changed': 'active',
      'subscription.cancelled': 'active',
      'subscription.on_hold': 'past_due',
      'subscription.failed': 'canceled',
      'subscription.expired': 'canceled'
    } as Record<string, string>)[msg.type]
    if (!status) return { ok: true, ignored: msg.type }
    const cancelAtEnd = msg.type === 'subscription.cancelled' || Boolean(d.cancel_at_next_billing_date)
    const [before] = await sql`select status from app.subscription where user_id = ${userId}`
    await sql`
      insert into app.subscription (user_id, plan, stripe_customer, stripe_subscription, status, current_period_end, cancel_at_period_end, updated_at)
      values (${userId}, ${plan}, ${customer}, ${d.subscription_id}, ${status}, ${d.next_billing_date ?? null}, ${cancelAtEnd}, now())
      on conflict (user_id) do update set plan = excluded.plan, stripe_customer = excluded.stripe_customer,
        stripe_subscription = excluded.stripe_subscription, status = excluded.status,
        current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end, updated_at = now()`
    if (!before && status === 'active') {
      const [u] = await sql`select id::text as id, email, name from neon_auth."user" where id::text = ${userId}`
      if (u) await sendAcademyEvent('subscribe', { id: String(u.id), email: String(u.email), name: u.name as string | null }, { plan, usd: (d.recurring_pre_tax_amount ?? d.total_amount ?? 0) / 100, seats: 1 })
    }
  } catch (e) {
    // Let Dodo retry: forget that this delivery was handled.
    await sql`delete from app.stripe_event where id = ${`dodo:${id}`}`
    throw e
  }
  return { ok: true }
})
