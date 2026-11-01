/**
 * The home page in the visitor's language, decided before anything loads.
 *
 * wrangler.jsonc runs the Worker first for `/` only (assets.run_worker_first);
 * every other page is still served straight from the edge. For `/`:
 *
 *   crawler                         the English page (each locale is its own
 *                                   indexed URL, linked by hreflang)
 *   `crma_locale` cookie (a choice) that language
 *   no choice yet                   the country's language (COUNTRY_LOCALE in
 *                                   shared/utils/regions.ts), remembered in the
 *                                   cookie; unmapped countries get English and
 *                                   plugins/locale-auto.client.ts may still
 *                                   pick the browser's language
 *
 * Anything that is not a redirect is the prerendered page from ASSETS. In dev
 * and prerender there is no ASSETS binding and this does nothing.
 */
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|pagespeed|headless/i
const LOCALES = new Set(['es', 'fr', 'de', 'pt', 'ja', 'zh', 'hi', 'ar', 'ru', 'bn', 'ur'])
const COOKIE = 'crma_locale'

export default defineEventHandler(async (event) => {
  // Dev emulates an ASSETS binding that cannot serve the page: let Nuxt render it.
  if (import.meta.dev || event.method !== 'GET' || getRequestURL(event).pathname !== '/') return
  const cf = cloudflareOf(event)
  const assets = cf.env?.ASSETS as { fetch: (r: Request) => Promise<Response> } | undefined
  if (!assets) return

  const ua = getRequestHeader(event, 'user-agent') ?? ''
  const chosen = getCookie(event, COOKIE)
  let target: string | null = null
  if (!BOT.test(ua)) {
    if (chosen) {
      target = LOCALES.has(chosen) ? chosen : null
    } else {
      const country = cf.request?.cf?.country ?? getRequestHeader(event, 'cf-ipcountry') ?? ''
      const fromCountry = COUNTRY_LOCALE[country]
      if (fromCountry && LOCALES.has(fromCountry)) {
        target = fromCountry
        setCookie(event, COOKIE, fromCountry, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/', secure: true })
      }
    }
  }
  if (target) {
    setResponseHeader(event, 'cache-control', 'private, no-store')
    setResponseHeader(event, 'vary', 'Cookie, CF-IPCountry')
    return sendRedirect(event, `/${target}${getRequestURL(event).search}`, 302)
  }
  return assets.fetch(toWebRequest(event))
})
