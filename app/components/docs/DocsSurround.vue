<script setup lang="ts">
/**
 * Previous / next lesson. Replaces UContentSurround.
 *
 * Takes the array Nuxt Content's queryCollectionItemSurroundings returns —
 * [previous, next], either of which may be null at the ends of the curriculum.
 */
defineProps<{
  surround?: (({ path: string, title?: string, description?: string }) | null)[]
}>()
</script>

<template>
  <nav
    v-if="surround?.some(Boolean)"
    class="surround"
    aria-label="Lesson navigation"
  >
    <NuxtLink
      v-if="surround[0]"
      :to="surround[0].path"
      class="surround__link surround__link--prev"
      rel="prev"
    >
      <span class="surround__dir">
        <Icon
          name="i-lucide-arrow-left"
          class="surround__arrow"
        />
        Previous
      </span>
      <span class="surround__title">{{ surround[0].title }}</span>
    </NuxtLink>
    <!-- Keeps "next" hard against the end of the row when there is no previous. -->
    <span
      v-else
      class="surround__spacer"
    />

    <NuxtLink
      v-if="surround[1]"
      :to="surround[1].path"
      class="surround__link surround__link--next"
      rel="next"
    >
      <span class="surround__dir">
        Next
        <Icon
          name="i-lucide-arrow-right"
          class="surround__arrow"
        />
      </span>
      <span class="surround__title">{{ surround[1].title }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
.surround {
  display: grid;
  gap: var(--s-4);
  margin-block-start: var(--s-7);

  @media (min-width: 40rem) {
    grid-template-columns: 1fr 1fr;
  }
}

.surround__link {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-4);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  background: var(--c-bg-raised);
  text-decoration: none;
  transition:
    border-color var(--dur-mid) var(--ease-out),
    box-shadow var(--dur-mid) var(--ease-out),
    transform var(--dur-mid) var(--ease-spring);

  &:hover {
    border-color: var(--c-brand);
    box-shadow: var(--shadow-2);
    transform: translateY(-2px);
  }
}

// The arrows are logical, so they flip with the document for Arabic and Urdu.
.surround__link--next {
  text-align: end;
  align-items: flex-end;
}

.surround__dir {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  font-size: var(--t-micro);
  font-weight: 700;
  letter-spacing: var(--tr-caps);
  text-transform: uppercase;
  color: var(--c-text-faint);
}

.surround__arrow {
  width: 0.9rem;
  height: 0.9rem;
}

:global([dir="rtl"]) .surround__arrow {
  transform: scaleX(-1);
}

.surround__title {
  font-weight: 650;
  color: var(--c-text);
  line-height: 1.35;
}

.surround__spacer {
  display: none;

  @media (min-width: 40rem) {
    display: block;
  }
}
</style>
