/**
 * Opens the site in the visitor's language on their first visit.
 *
 * Every page is prerendered and served from the edge without the Worker, so
 * the i18n module's server-side detection never sees most requests. This does
 * it in the browser instead, once:
 *
 *  1. The browser's languages (navigator.languages), in the reader's own order
 *     of preference. A supported one wins — including English: someone whose
 *     browser asks for English gets English, wherever they are.
 *  2. Only when no browser language is supported (Italian, Korean …) does the
 *     country decide, from /api/geo. Countries where English is the usual
 *     language of the web for this subject (India, Pakistan, the Philippines…)
 *     are deliberately not mapped.
 *
 * The choice is written to the same `i18n_redirected` cookie the i18n module
 * uses, so it happens exactly once; the language switcher overrides it for
 * good. Crawlers are never redirected — each locale is its own indexed URL,
 * with hreflang pointing between them — and neither are private routes or
 * the English-only pages (pricing, teams, training, implementation).
 */
const COUNTRY_LOCALE: Record<string, string> = {
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es',
  DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  // French
  FR: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr', GA: 'fr', CD: 'fr', CG: 'fr', HT: 'fr',
  // German
  DE: 'de', AT: 'de', LI: 'de',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  // Japanese, Chinese
  JP: 'ja', CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar', QA: 'ar',
  SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar', DZ: 'ar', SD: 'ar', PS: 'ar',
  // Russian, Bengali
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', BD: 'bn'
}

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
      const cookie = useCookie<string | null>('i18n_redirected', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
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

      let target = fromBrowser
      if (!target) {
        const { country } = await $fetch<{ country: string | null }>('/api/geo', { timeout: 1500 }).catch(() => ({ country: null }))
        target = (country && COUNTRY_LOCALE[country]) || 'en'
      }

      cookie.value = target
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
            nuxtApp.runWithContext(() => navigateTo(englishPath, { replace: true }))
          }
        }]
      })
    } catch {
      // A language guess is a nicety; it must never break the page.
    }
  })
})
