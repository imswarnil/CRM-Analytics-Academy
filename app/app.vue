<script setup lang="ts">
const { seo } = useAppConfig()
const { locale } = useI18n()

// Navigation: fetch the full per-locale tree, then expose only the current
// locale's branch with paths rewritten to localized routes.
const { data: navTree } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const navigation = computed(() => {
  const branch = navTree.value?.find(item => item.path === `/${locale.value}`)
  return branch?.children ? localizeNavigation(branch.children) : []
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
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})
useHead(i18nHead)

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  ogType: 'website',
  ogUrl: () => SITE.url + route.path,
  twitterCard: 'summary_large_image'
})

// Site-wide structured data.
useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    'name': SITE.name,
    'url': SITE.url,
    'description': SITE.description,
    'logo': `${SITE.url}/favicon.ico`,
    'sameAs': [SITE.github]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE.name,
    'url': SITE.url,
    'description': SITE.description,
    'inLanguage': 'en'
  }
])

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
