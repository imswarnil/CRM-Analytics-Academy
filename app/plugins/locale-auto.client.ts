/**
 * Opens the site in the visitor's language on their first visit.
 *
 * Every page is prerendered and served from the edge without the Worker, so
 * the i18n module's server-side detection never sees most requests. This does
 * it in the browser instead, once:
 *
 *  1. The visitor's COUNTRY decides, from /api/geo (Cloudflare's cf.country),
 *     through COUNTRY_LOCALE in shared/utils/regions.ts: Spain, Mexico or
 *     Argentina open in Spanish, Brazil in Portuguese, Japan in Japanese…
 *     Countries where the Salesforce world works in English (India, Pakistan,
 *     the Philippines, the US, the UK…) are deliberately unmapped.
 *  2. Only when the country is unmapped do the browser's languages decide
 *     (a Spanish-language browser in the US still gets Spanish).
 *  3. Otherwise English. A choice in the language switcher always wins after.
 *
 * The decision is remembered in its own cookie, `crma_locale`, which only
 * this plugin and the language switcher write. It used to read the i18n
 * module's `i18n_redirected` cookie instead, but the module writes that during
 * hydration (with `en` on every unprefixed page, and on every Worker response),
 * so by the time this ran the cookie was always set and detection never
 * happened. Crawlers are never redirected — each locale is its own indexed URL,
 * with hreflang pointing between them — and neither are private routes or
 * the English-only pages.
 */
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless|pagespeed/i
const PRIVATE = /^\/(api|admin|dashboard|submit|sign-in|sign-up|_studio|raw)(\/|$)/

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', async () => {
    try {
      const i18n = nuxtApp.$i18n as {
        locale: { value: string }
        locales: { value: { code: string, name?: string }[] }
        t: (key: string, params?: Record<string, unknown>) => string
      }
      // Composables resolved before the first await, while the Nuxt context
      // is still current.
      const cookie = useCookie<string | null>(LOCALE_CHOICE_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
      const moduleCookie = useCookie<string | null>('i18n_redirected', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
      const route = useRoute()
      const switchLocalePath = useSwitchLocalePath()
      const toast = useToast()
      if (cookie.value || i18n.locale.value !== 'en') {
        // Arriving on a localized URL is itself a choice; remember it.
        if (!cookie.value) cookie.value = i18n.locale.value
        return
      }
      if (BOT.test(navigator.userAgent) || navigator.webdriver || PRIVATE.test(route.path)) return

      const supported = i18n.locales.value.map(l => l.code)
      const fromBrowser = (navigator.languages?.length ? navigator.languages : [navigator.language])
        .map(l => l.toLowerCase().split('-')[0]!)
        .find(l => supported.includes(l))

      const { country } = await $fetch<{ country: string | null }>('/api/geo', { timeout: 1500 }).catch(() => ({ country: null }))
      const fromCountry = country ? COUNTRY_LOCALE[country] : undefined
      const target = (fromCountry && supported.includes(fromCountry) ? fromCountry : fromBrowser) || 'en'

      cookie.value = target
      moduleCookie.value = target
      if (target === 'en') return

      const to = switchLocalePath(target as never)
      // English-only pages have no translated route; leave them be.
      if (!to || to === route.fullPath) return
      const englishPath = route.fullPath
      await nuxtApp.runWithContext(() => navigateTo(to, { replace: true }))

      const name = i18n.locales.value.find(l => l.code === target)?.name ?? target
      toast.add({
        title: i18n.t('localeAuto.switched', { language: name }),
        icon: 'i-lucide-languages',
        actions: [{
          label: i18n.t('localeAuto.keepEnglish'),
          color: 'neutral',
          variant: 'outline',
          onClick: () => {
            cookie.value = 'en'
            moduleCookie.value = 'en'
            nuxtApp.runWithContext(() => navigateTo(englishPath, { replace: true }))
          }
        }]
      })
    } catch {
      // A language guess is a nicety; it must never break the page.
    }
  })
})
