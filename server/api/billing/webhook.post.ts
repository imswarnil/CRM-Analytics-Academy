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
 *
 * A team plan never touches the buyer's personal entitlement: its events
 * create or update the app.team row (keyed on the subscription), whose seats
 * are the subscription quantity and whose members get Pro through hasPro().
 *
 * A sponsorship (metadata.kind = 'sponsor') never touches entitlements
 * either — it is a one-time payment, and without its own branch it would fall
 * into the lifetime-Pro grant below. Its events settle the months held at
 * checkout (app.sponsor_booking, see server/api/partner/checkout.post.ts):
 *
 *   payment.succeeded                     → held months become paid
 *   payment.failed / payment.cancelled    → held months are released
 */
interface DodoEvent {
  type: string
  data: {
    payment_id?: string
    subscription_id?: string | null
    status?: string
    quantity?: number
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

  if (d.metadata?.kind === 'sponsor' || d.metadata?.plan === 'sponsor') {
    try {
      return { ok: true, sponsor: await applySponsorEvent(sql, msg.type, d) }
    } catch (e) {
      // Un-claim the event so Dodo's retry processes it again instead of
      // being skipped as a duplicate.
      await sql`delete from app.webhook_event where id = ${getRequestHeader(event, 'webhook-id')}`
      throw e
    }
  }

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

  if (plan === 'team') {
    if (!d.subscription_id) return { ok: true, ignored: 'team payment without a subscription' }
    await applyTeamEvent(sql, msg.type, userId, d, customer)
    return { ok: true, team: true }
  }

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
        where user_id = ${userId} and source = 'dodo' and plan in ('monthly', 'annual')
      `
      break
  }

  return { ok: true }
})

/**
 * Team lifecycle from a team-seat subscription. The row is keyed on the
 * subscription id, so a retried or out-of-order delivery converges on the
 * same team rather than creating a second one.
 */
async function applyTeamEvent(
  sql: ReturnType<typeof useDb>,
  type: string,
  ownerId: string,
  d: DodoEvent['data'],
  customer: string | null
) {
  const seats = Math.max(1, Number(d.quantity ?? d.metadata?.seats ?? 3))
  const until = d.next_billing_date ?? null

  switch (type) {
    case 'subscription.active':
    case 'subscription.renewed':
    case 'subscription.unpaused':
    case 'subscription.plan_changed':
    case 'subscription.updated': {
      const rows = await sql`
        insert into app.team (name, owner_user_id, domain, seats, dodo_subscription_id, dodo_customer_id, status, current_period_end)
        values (${d.metadata?.team_name || 'My team'}, ${ownerId}, ${d.metadata?.team_domain || ''}, ${seats}, ${d.subscription_id}, ${customer}, 'active', ${until})
        on conflict (dodo_subscription_id) where dodo_subscription_id is not null do update set
          seats = excluded.seats,
          status = 'active',
          current_period_end = coalesce(excluded.current_period_end, app.team.current_period_end),
          dodo_customer_id = coalesce(excluded.dodo_customer_id, app.team.dodo_customer_id),
          updated_at = now()
        returning id
      `
      const teamId = rows[0]?.id as string
      const owner = await sql`select email from neon_auth."user" where id::text = ${ownerId} limit 1`
      await sql`
        insert into app.team_member (team_id, user_id, email, role)
        values (${teamId}, ${ownerId}, ${(owner[0]?.email as string | undefined) ?? ''}, 'owner')
        on conflict (team_id, user_id) do nothing
      `
      break
    }
    case 'subscription.on_hold':
      await sql`update app.team set status = 'past_due', updated_at = now() where dodo_subscription_id = ${d.subscription_id}`
      break
    case 'subscription.cancelled':
      // Seats stay live until the period that was paid for ends.
      await sql`
        update app.team set status = 'cancelled',
          current_period_end = coalesce(${until}::timestamptz, current_period_end, now()), updated_at = now()
        where dodo_subscription_id = ${d.subscription_id}
      `
      break
    case 'subscription.expired':
    case 'subscription.failed':
      await sql`update app.team set status = 'inactive', updated_at = now() where dodo_subscription_id = ${d.subscription_id}`
      break
  }
}

/**
 * Settles a sponsorship checkout. Idempotent by construction: every update is
 * conditioned on the booking's current status, so a replayed or reordered
 * delivery changes nothing the second time.
 */
async function applySponsorEvent(
  sql: ReturnType<typeof useDb>,
  type: string,
  d: DodoEvent['data']
): Promise<string> {
  const ref = d.metadata?.checkout_ref
  if (!ref || !/^[0-9a-f-]{36}$/i.test(ref)) return 'ignored: no checkout_ref'

  if (type === 'payment.failed' || type === 'payment.cancelled') {
    await sql`
      update app.sponsor_booking set status = 'cancelled', note = ${`payment ${type.split('.')[1]}`}, updated_at = now()
      where checkout_ref = ${ref}::uuid and status = 'held'
    `
    await placementChanged()
    return 'released'
  }

  if (type !== 'payment.succeeded') return `ignored: ${type}`

  const paymentId = d.payment_id ?? null
  // The normal case: the hold is still live.
  await sql`
    update app.sponsor_booking
    set status = 'paid', paid_at = now(), hold_expires_at = null, dodo_payment_id = ${paymentId}, updated_at = now()
    where checkout_ref = ${ref}::uuid and status = 'held'
  `

  // The buyer took longer than the hold. Re-claim each lapsed month if it is
  // still free; if someone else has it now, the money arrived for a month we
  // cannot give, so flag it for a refund in /admin → Sponsors.
  const lapsed = await sql`
    select id::text, sponsor_id::text, to_char(month, 'YYYY-MM-DD') as month from app.sponsor_booking
    where checkout_ref = ${ref}::uuid and status = 'cancelled' and dodo_payment_id is null and needs_refund = false
  `
  for (const row of lapsed) {
    // The buyer's OWN newer hold on this month (a second checkout they
    // started) yields to the one they actually paid.
    await sql`
      update app.sponsor_booking set status = 'cancelled', note = 'superseded by payment of an earlier checkout', updated_at = now()
      where month = ${row.month}::date and sponsor_id = ${row.sponsor_id}::uuid and status = 'held'
    `
    try {
      await sql`
        update app.sponsor_booking
        set status = 'paid', paid_at = now(), hold_expires_at = null, dodo_payment_id = ${paymentId},
            note = 'paid after the hold lapsed', updated_at = now()
        where id = ${row.id}::uuid and status = 'cancelled'
      `
    } catch (e) {
      if ((e as { code?: string }).code !== '23505') throw e
      await sql`
        update app.sponsor_booking
        set needs_refund = true, dodo_payment_id = ${paymentId},
            note = 'paid after the hold lapsed; month already taken — refund', updated_at = now()
        where id = ${row.id}::uuid
      `
    }
  }

  await placementChanged()
  return 'paid'
}
