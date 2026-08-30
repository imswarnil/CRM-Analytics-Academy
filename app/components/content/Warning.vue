<script setup lang="ts">
/**
 * MDC block for `::warning` in lesson markdown. These were Nuxt UI components
 * before; with that gone, the warning blocks in content/ had nothing to render
 * into and fell back to bare paragraphs.
 */
defineProps<{
  title?: string
  icon?: string
}>()
</script>

<template>
  <UiCallout
    type="warning"
    :title="title"
    :icon="icon"
  >
    <slot />
  </UiCallout>
</template>
