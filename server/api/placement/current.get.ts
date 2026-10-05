/**
 * What every promo slot on the site shows this month: the sponsor's name and
 * their published creative per format, or no sponsor (→ house placeholder).
 *
 * This is fetched once per page view by every reader who is not on Pro, so
 * it must be cheap: an isolate memo (60 s) in front of the Workers edge cache
 * (5 min) in front of one small query. Browsers and any CDN in front may keep
 * it for 60 s and serve it stale for 10 min while revalidating. A newly
 * published creative therefore shows within about five minutes everywhere
 * (immediately in the colo that published it, which drops its own copy).
 *
 * Path is deliberately neutral — never "ad"/"sponsor" — so filter lists leave
 * it alone.
 */
export default defineEventHandler(async (event) => {
  const data = await memo('placement:current', 60_000, () =>
    edgeCached(event, PLACEMENT_CACHE_KEY, 300, loadCurrentPlacement)
  )
  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return data
})
