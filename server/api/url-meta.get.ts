/**
 * GET /api/url-meta?url=https://…  →  { url, title?, description?, siteName?, icon?, image? }
 *
 * Link previews and favicons for anything a visitor pastes (resources,
 * showcase submissions, nominations). All the SSRF guarding is in
 * server/utils/urlMeta.ts; this only shapes the request and caches the
 * answer, since a page's title and icon change rarely.
 */
export default defineEventHandler(async (event) => {
  const url = String(getQuery(event).url ?? '').trim()
  if (!url || url.length > 2000) throw createError({ statusCode: 400, statusMessage: 'Pass ?url=' })
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`
  if (!safeUrl(withScheme)) throw createError({ statusCode: 400, statusMessage: 'That URL cannot be previewed.' })
  const meta = await fetchUrlMeta(withScheme)
  setResponseHeader(event, 'cache-control', 'public, max-age=86400, s-maxage=86400')
  return meta
})
