<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { seo } = useAppConfig()
const { locale, locales: allLocales } = useI18n()

// Navigation: fetch the full per-locale tree, then expose only the current
// locale's branch with paths rewritten to localized routes.
const { data: navTree, refresh: refreshNav } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))

// On a prerendered page this resolved at build time and arrives in the
// payload. On a route the Worker renders at runtime — /dashboard, /account —
// there is no content database bound to the Worker, so the server-side query
// comes back empty and the curriculum reads as zero lessons.
//
// The browser can answer it: @nuxt/content ships the collection as a dump
// (/dump.docs.sql) and queries it client-side. So retry there, and only when
// the server actually returned nothing — on the 768 prerendered pages this
// condition is false and no second query happens.
onMounted(() => {
  if (!navTree.value?.length) refreshNav()
})
const navigation = computed<ContentNavigationItem[]>(() => {
  const branch = navTree.value?.find(item => item.path === `/${locale.value}`)
  if (branch?.children?.length) return localizeNavigation(branch.children)

  // A locale with no translated content yet borrows the English tree, pointed at
  // its own URLs. Without this the prerenderer never discovers those routes —
  // crawlLinks only follows links that exist — so every lesson 404s in that
  // language and the hreflang alternates advertise dead pages. The routes do
  // render: [...slug].vue already falls back to the English document.
  const english = navTree.value?.find(item => item.path === `/${DEFAULT_LOCALE}`)
  return english?.children ? localizeNavigation(english.children, locale.value) : []
})

const { data: allFiles } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})
// Search only the current locale; rewrite result links to localized routes.
const files = computed(() =>
  (allFiles.value || [])
    .filter(f => f.id?.startsWith(`/${locale.value}/`) || f.id === `/${locale.value}`)
    .map(f => ({ ...f, id: contentToRoutePath(f.id) }))
)

const route = useRoute()

// i18n SEO: localized <html lang/dir>, canonical, and hreflang alternates.
const i18nHead = useLocaleHead()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // Matches manifest.webmanifest. Both moved off Salesforce blue
    // when the palette did; a stale value here shows as the wrong colour in
    // the Android status bar of an installed app.
    { name: 'theme-color', content: '#2563eb' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/manifest.webmanifest' }
  ]
})
useHead(i18nHead)

// useLocaleHead emits the hreflang alternates and <html lang/dir>, but not a
// canonical, so add one. Every locale prerenders its own copy of a page and each
// copy is its own canonical URL — the alternates above are what ties the twelve
// together, so pointing them all at English would instead ask Google to drop
// eleven of them.
const canonical = computed(() => {
  const path = route.path.replace(/\/+$/, '')
  return `${SITE.url}${path || ''}`
})

useHead({
  link: [{ rel: 'canonical', href: canonical }]
})

/** BCP-47 tag for a locale, in the underscore form Open Graph expects. */
const ogLocale = (code: string) =>
  (allLocales.value.find(l => l.code === code)?.language || code).replace('-', '_')

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: () => ogLocale(locale.value),
  ogLocaleAlternate: () => allLocales.value
    .filter(l => l.code !== locale.value)
    .map(l => ogLocale(l.code)),
  twitterCard: 'summary_large_image'
})

// Site-wide structured data. It must declare the language actually rendered:
// every locale prerenders its own copy of this page, and a hardcoded 'en' told
// search engines all twelve of them were English.
const bcp47 = computed(() => ogLocale(locale.value).replace('_', '-'))

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    'name': SITE.name,
    'url': SITE.url,
    'description': SITE.description,
    'logo': `${SITE.url}/icon-512.png`,
    'sameAs': [SITE.github]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE.name,
    'url': SITE.url,
    'description': SITE.description,
    'inLanguage': bcp47.value
  }
])

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <!-- One shell for every page: the design system's sticky top navbar,
         the page, then the ink footer (which the shell itself renders, and
         omits on lesson screens where the player owns the viewport). -->
    <AppShell>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </AppShell>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
      <PwaInstallPrompt />
    </ClientOnly>
  </UApp>
</template>
