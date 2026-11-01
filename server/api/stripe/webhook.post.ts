/**
 * Stripe → the Academy. Signature-checked (STRIPE_WEBHOOK_SECRET), each event
 * handled once (app.stripe_event). Subscribe the endpoint to:
 *
 *   checkout.session.completed
 *   customer.subscription.created / updated / deleted
 *   invoice.paid
 *
 * Pro: app.subscription mirrors the subscription. Teams: the app.org row made
 * at checkout becomes active, its seats follow the subscription quantity, and
 * its buyer becomes its admin. Sponsors: a paid invoice marks the sponsorship
 * paid, and live once its banner is approved. New customers reach Salesforce
 * as Web-to-Lead events (subscribe / team / sponsor).
 */
interface StripeSubscription {
  id: string
  customer: string
  status: string
  cancel_at_period_end: boolean
  current_period_end: number
  metadata: Record<string, string>
  items: { data: { quantity: number, price: { lookup_key?: string, unit_amount?: number } }[] }
}

const ACTIVE = new Set(['active', 'trialing', 'past_due'])

async function userById(id: string) {
  const [u] = await useDb()`select id::text as id, email, name from neon_auth."user" where id::text = ${id}`
  return u ? { id: String(u.id), email: String(u.email), name: u.name as string | null } : null
}

async function syncSubscription(sub: StripeSubscription, isNew: boolean) {
  const sql = useDb()
  const kind = sub.metadata?.kind
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null
  if (kind === 'pro' && sub.metadata.user_id) {
    const [before] = await sql`select status from app.subscription where user_id = ${sub.metadata.user_id}`
    await sql`
      insert into app.subscription (user_id, stripe_customer, stripe_subscription, plan, status, current_period_end, cancel_at_period_end, updated_at)
      values (${sub.metadata.user_id}, ${sub.customer}, ${sub.id}, ${sub.metadata.plan ?? 'proMonthly'}, ${sub.status}, ${periodEnd}, ${sub.cancel_at_period_end}, now())
      on conflict (user_id) do update set stripe_customer = excluded.stripe_customer, stripe_subscription = excluded.stripe_subscription,
        plan = excluded.plan, status = excluded.status, current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end, updated_at = now()`
    // First time active → Salesforce: a self-serve customer.
    if (ACTIVE.has(sub.status) && (isNew || !before || !ACTIVE.has(String(before.status)))) {
      const user = await userById(sub.metadata.user_id)
      const usd = (sub.items.data[0]?.price.unit_amount ?? 0) / 100
      if (user) await sendAcademyEvent('subscribe', user, { plan: sub.metadata.plan ?? 'proMonthly', usd, seats: 1 })
    }
    return
  }
  if (kind === 'team' && sub.metadata.org_id) {
    const orgId = Number(sub.metadata.org_id)
    const seats = sub.items.data[0]?.quantity ?? 1
    const [before] = await sql`select status from app.org where id = ${orgId}`
    const status = ACTIVE.has(sub.status) ? 'active' : 'cancelled'
    await sql`
      update app.org set stripe_customer = ${sub.customer}, stripe_subscription = ${sub.id}, seats = ${seats}, status = ${status},
        expires_at = ${status === 'active' ? null : new Date().toISOString()}
      where id = ${orgId}`
    if (status === 'active' && sub.metadata.user_id) {
      await sql`
        insert into app.org_member (org_id, user_id, role) values (${orgId}, ${sub.metadata.user_id}, 'admin')
        on conflict (org_id, user_id) do update set role = 'admin'`
      if (before?.status !== 'active') {
        const user = await userById(sub.metadata.user_id)
        const usd = ((sub.items.data[0]?.price.unit_amount ?? 0) / 100) * seats
        if (user) await sendAcademyEvent('team', user, { plan: 'teamSeat', usd, seats })
      }
    }
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
    if (evt.type === 'checkout.session.completed' && typeof obj.subscription === 'string') {
      const sub = await stripe<StripeSubscription>('GET', `subscriptions/${obj.subscription}`)
      await syncSubscription(sub, true)
    } else if (evt.type.startsWith('customer.subscription.')) {
      await syncSubscription(obj as unknown as StripeSubscription, evt.type === 'customer.subscription.created')
    } else if (evt.type === 'invoice.paid') {
      const sponsorId = Number((obj.metadata as Record<string, string> | undefined)?.sponsor_id)
      if (sponsorId) {
        const [s] = await sql`
          update app.sponsor set status = case when creative_status = 'approved' then 'live' else 'paid' end,
            starts_at = case when creative_status = 'approved' then now() else starts_at end,
            ends_at = case when creative_status = 'approved' then now() + make_interval(days => days) else ends_at end
          where id = ${sponsorId} and status in ('requested', 'invoiced')
          returning email, company, package, owner_user_id`
        if (s) {
          const usd = Number(obj.amount_paid ?? 0) / 100
          await sendAcademyEvent('sponsor', { id: String(s.owner_user_id ?? `sponsor-${sponsorId}`), email: String(s.email), name: String(s.company) }, { plan: String(s.package), usd, seats: 0 })
        }
      }
    }
  } catch (e) {
    // Let Stripe retry: forget that this event was handled.
    await sql`delete from app.stripe_event where id = ${evt.id}`
    throw e
  }
  return { ok: true }
})
