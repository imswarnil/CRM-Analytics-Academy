<script setup lang="ts">
/**
 * The page header every content page shares: a small label, a title, one
 * line of lead and an optional slot for actions. Plain paper, no ornament,
 * so the content carries the page.
 */
const props = defineProps<{
  sheet: string
  title: string
  lead?: string
  center?: boolean
}>()
</script>

<template>
  <header class="border-b border-(--line) bg-(--paper)">
    <div
      class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      :class="props.center ? 'text-center' : ''"
    >
      <p class="eyebrow">
        {{ props.sheet }}
      </p>
      <h1 class="bp-h1 mt-3 max-w-4xl">
        {{ props.title }}
      </h1>
      <p
        v-if="props.lead"
        class="bp-lead mt-4 max-w-2xl"
        :class="props.center ? 'mx-auto' : ''"
      >
        {{ props.lead }}
      </p>
      <slot />
    </div>
  </header>
</template>
