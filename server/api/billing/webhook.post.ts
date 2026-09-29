/**
 * Dodo Payments webhook: the only thing that grants or revokes Pro.
 *
 * The return from checkout is a redirect the browser controls, so it proves
 * nothing; this signed, server-to-server delivery is the record. Every event
 * id is written to app.webhook_event first, so a retried delivery is a no-op
 * rather than a second grant.
 *
 *   payment.succeeded (one-time)          → Pro, lifetime
 *   subscription.active / .renewed        → Pro, until the period end
 *   subscription.cancelled                → Pro until the paid period ends
 *   subscription.expired / .failed        → Pro revoked
 */
interface DodoEvent {
  type: string
  data: {
    payment_id?: string
    subscription_id?: string | null
    status?: string
    next_billing_date?: string
    customer?: { customer_id?: string, email?: string }
    metadata?: Record<string, string>
  }
}

export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  const ok = await verifyDodoWebhook({
    id: getRequestHeader(event, 'webhook-id'),
    timestamp: getRequestHeader(event, 'webhook-timestamp'),
    signature: getRequestHeader(event, 'webhook-signature')
  }, raw)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })

  const msg = JSON.parse(raw) as DodoEvent
  const sql = useDb()

  const seen = await sql`
    insert into app.webhook_event (id, kind) values (${getRequestHeader(event, 'webhook-id')}, ${msg.type})
    on conflict (id) do nothing
    returning id
  `
  if (!seen.length) return { ok: true, duplicate: true }

  const d = msg.data
  // Prefer the account id carried from checkout; fall back to the email on
  // the Dodo customer, matched against Neon Auth, for payments that began
  // somewhere other than our checkout endpoint.
  let userId = d.metadata?.user_id
  if (!userId && d.customer?.email) {
    const rows = await sql`select id::text from neon_auth."user" where lower(email) = lower(${d.customer.email}) limit 1`
    userId = rows[0]?.id as string | undefined
  }
  if (!userId) return { ok: true, ignored: 'no matching user' }

  const plan = d.metadata?.plan ?? (d.subscription_id ? 'monthly' : 'lifetime')
  const customer = d.customer?.customer_id ?? null

  const grant = (until: string | null) => sql`
    insert into app.entitlement (user_id, pro, source, plan, granted_at, dodo_payment_id, dodo_customer_id, dodo_subscription_id, current_period_end, updated_at)
    values (${userId}, true, 'dodo', ${plan}, now(), ${d.payment_id ?? null}, ${customer}, ${d.subscription_id ?? null}, ${until}, now())
    on conflict (user_id) do update set
      pro = true, source = 'dodo', plan = excluded.plan,
      granted_at = coalesce(app.entitlement.granted_at, now()),
      dodo_payment_id = coalesce(excluded.dodo_payment_id, app.entitlement.dodo_payment_id),
      dodo_customer_id = coalesce(excluded.dodo_customer_id, app.entitlement.dodo_customer_id),
      dodo_subscription_id = coalesce(excluded.dodo_subscription_id, app.entitlement.dodo_subscription_id),
      current_period_end = excluded.current_period_end,
      updated_at = now()
  `

  switch (msg.type) {
    case 'payment.succeeded':
      // A subscription's first payment also arrives here; its lifecycle is
      // handled by the subscription events, so only one-time purchases grant.
      if (!d.subscription_id) await grant(null)
      break
    case 'subscription.active':
    case 'subscription.renewed':
    case 'subscription.unpaused':
      await grant(d.next_billing_date ?? null)
      break
    case 'subscription.cancelled':
      // Keep access until the period they paid for ends.
      await sql`
        update app.entitlement set current_period_end = coalesce(${d.next_billing_date ?? null}::timestamptz, current_period_end, now()), updated_at = now()
        where user_id = ${userId} and source = 'dodo'
      `
      break
    case 'subscription.expired':
    case 'subscription.failed':
      // Only revoke what Dodo granted — never an admin grant or a lifetime.
      await sql`
        update app.entitlement set pro = false, updated_at = now()
        where user_id = ${userId} and source = 'dodo' and plan = 'monthly'
      `
      break
  }

  return { ok: true }
})
