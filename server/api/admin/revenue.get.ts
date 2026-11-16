/** Money and members for the admin overview: All Access sales and verified YouTube subscribers. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [r] = await useDb()`
    select (select count(*)::int from app.entitlement where product = 'all-access') as sold,
           (select count(*)::int from app.entitlement where product <> 'all-access' and pro and (expires_at is null or expires_at > now())) as granted,
           (select count(*)::int from app.youtube_link where subscribed) as youtube,
           (select count(*)::int from app.youtube_link where not subscribed) as not_subscribed`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sold = Number(r?.sold ?? 0)
  return {
    configured: stripeConfigured(),
    allAccess: { sold, income: sold * PRICES.allAccess.usd, granted: Number(r?.granted ?? 0) },
    youtube: { verified: Number(r?.youtube ?? 0), notSubscribed: Number(r?.not_subscribed ?? 0) }
  }
})
