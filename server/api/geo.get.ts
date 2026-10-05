/**
 * The visitor's country, from Cloudflare's edge (`request.cf.country`, also
 * sent as the CF-IPCountry header). Used once, on a first visit, to choose a
 * language when the browser's own language doesn't settle it. Nothing is
 * stored or logged; it is the two-letter code and nothing else.
 */
export default defineEventHandler((event) => {
  const cf = cloudflareOf(event).request?.cf
  const country = cf?.country || getRequestHeader(event, 'cf-ipcountry') || ''
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { country: /^[A-Z]{2}$/.test(country) ? country : null }
})
