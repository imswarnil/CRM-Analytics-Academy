/**
 * The live sponsor banners. Normally they arrive with the page view
 * (POST /api/collect returns the one to show); this is the fallback when that
 * request is blocked.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=60')
  return { sponsors: await liveSponsors() }
})
