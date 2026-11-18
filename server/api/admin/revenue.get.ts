/** Money and members for the admin overview: MRR, lifetime sales, grants and team seats. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [r] = await useDb()`
    select (select count(*)::int from app.subscription where status in ('active', 'trialing', 'past_due') and plan = 'monthly') as monthly,
           (select count(*)::int from app.subscription where status in ('active', 'trialing', 'past_due') and plan = 'yearly') as yearly,
           (select count(*)::int from app.subscription where status in ('active', 'trialing') and cancel_at_period_end) as cancelling,
           (select count(*)::int from app.entitlement where product = 'lifetime') as lifetime,
           (select count(*)::int from app.entitlement where product = 'grant' and (expires_at is null or expires_at > now())) as granted,
           (select count(*)::int from app.org where status = 'active') as orgs,
           (select coalesce(sum(seats), 0)::int from app.org where status = 'active') as seats,
           (select count(*)::int from app.org_member) as seats_used`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const monthly = Number(r?.monthly ?? 0)
  const yearly = Number(r?.yearly ?? 0)
  const lifetime = Number(r?.lifetime ?? 0)
  return {
    configured: stripeConfigured(),
    mrr: Math.round(monthly * PRICES.monthly.usd + (yearly * PRICES.yearly.usd) / 12),
    monthly: { active: monthly + yearly, cancelling: Number(r?.cancelling ?? 0) },
    yearly: { active: yearly },
    lifetime: { sold: lifetime, income: lifetime * PRICES.lifetime.usd },
    granted: Number(r?.granted ?? 0),
    teams: { orgs: Number(r?.orgs ?? 0), seats: Number(r?.seats ?? 0), used: Number(r?.seats_used ?? 0) }
  }
})
