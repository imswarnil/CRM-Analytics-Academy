/**
 * Revenue for /admin: MRR from Pro (monthly, and yearly ÷ 12) and team seats,
 * from what the Stripe webhook recorded; sponsorship income from paid, live
 * and ended sponsorships at list price.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()
  const [[subs], [teams], [sponsors]] = await Promise.all([
    sql`select count(*) filter (where plan = 'proMonthly')::int as monthly, count(*) filter (where plan = 'proYearly')::int as yearly,
               count(*) filter (where cancel_at_period_end)::int as cancelling
        from app.subscription where status in ('active', 'trialing', 'past_due')`,
    sql`select count(*)::int as teams, coalesce(sum(seats), 0)::int as seats from app.org where billing = 'stripe' and status = 'active'`,
    sql`select count(*) filter (where status = 'live')::int as live,
               count(*) filter (where status in ('requested', 'invoiced'))::int as open,
               count(*) filter (where creative_status = 'submitted')::int as review,
               coalesce(sum(case when status in ('paid', 'live', 'ended') then case package when 'sponsorWeek' then ${PRICES.sponsorWeek.usd} else ${PRICES.sponsorMonth.usd} end end), 0)::int as income
        from app.sponsor`
  ])
  const proMrr = Number(subs?.monthly ?? 0) * PRICES.proMonthly.usd + Number(subs?.yearly ?? 0) * (PRICES.proYearly.usd / 12)
  const teamMrr = Number(teams?.seats ?? 0) * PRICES.teamSeat.usd
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    configured: stripeConfigured(),
    pro: { monthly: Number(subs?.monthly ?? 0), yearly: Number(subs?.yearly ?? 0), cancelling: Number(subs?.cancelling ?? 0), mrr: Math.round(proMrr) },
    teams: { count: Number(teams?.teams ?? 0), seats: Number(teams?.seats ?? 0), mrr: teamMrr },
    sponsors: { live: Number(sponsors?.live ?? 0), open: Number(sponsors?.open ?? 0), review: Number(sponsors?.review ?? 0), income: Number(sponsors?.income ?? 0) },
    mrr: Math.round(proMrr + teamMrr)
  }
})
