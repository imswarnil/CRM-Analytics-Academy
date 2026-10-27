<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.'
})

// Never query content on the Worker (no content database there; see app.vue).
const onWorker = import.meta.server && !import.meta.prerender && !import.meta.dev
const { data: navigation } = await useAsyncData('navigation', () => onWorker ? Promise.resolve([]) : queryCollectionNavigation('docs'))
const { data: files } = useLazyAsyncData('search', () => onWorker ? Promise.resolve([]) : queryCollectionSearchSections('docs'), {
  server: false
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <AppHeader />

    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
