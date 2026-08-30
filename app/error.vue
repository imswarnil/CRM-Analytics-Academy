<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const localePath = useLocalePath()

useHead({ htmlAttrs: { lang: 'en' } })

const is404 = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? 'Page not found' : 'Something went wrong'),
  description: 'We are sorry but this page could not be found.',
  // A soft-404 that search engines are told to index is worse than the 404
  // itself — it puts an empty page in the index under a real URL.
  robots: 'noindex, follow'
})

// The tree is still fetched so the header drawer has somewhere to go — landing
// on a 404 with no way back into the curriculum is the actual failure.
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
provide('navigation', navigation)
</script>

<template>
  <div class="app">
    <AppHeader />

    <main class="app__main">
      <div class="shell err">
        <p class="err__code">
          {{ error?.statusCode || 500 }}
        </p>
        <h1 class="err__title">
          {{ is404 ? 'That lesson is not here.' : 'Something went wrong.' }}
        </h1>
        <p class="lead err__desc">
          {{ is404
            ? 'The page may have been renamed or moved. The curriculum below is the fastest way back.'
            : 'This one is on us. Try again, or head back to the curriculum.' }}
        </p>

        <div class="err__actions">
          <UiButton
            variant="primary"
            :to="localePath('/')"
            icon="i-lucide-house"
            label="Go home"
          />
          <UiButton
            :to="localePath('/foundations')"
            icon="i-lucide-compass"
            label="Browse the curriculum"
          />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.app__main { flex: 1; }

.err {
  max-width: 40rem;
  padding-block: var(--s-9);
  text-align: center;
}

.err__code {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(4rem, 2rem + 10vi, 9rem);
  line-height: 1;
  color: var(--c-brand-soft);
}

.err__title {
  margin-block-start: var(--s-3);
  text-wrap: balance;
}

.err__desc {
  margin-block-start: var(--s-3);
  margin-inline: auto;
  max-width: 44ch;
}

.err__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-3);
  margin-block-start: var(--s-6);
}
</style>
