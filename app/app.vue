<script setup lang="ts">
const { seo } = useAppConfig()

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false
})

const route = useRoute()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: () => SITE.url + route.path }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

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
