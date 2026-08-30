<script setup lang="ts">
/**
 * MDC block for `::danger` in lesson markdown. These were Nuxt UI components
 * before; with that gone, the danger blocks in content/ had nothing to render
 * into and fell back to bare paragraphs.
 */
defineProps<{
  title?: string
  icon?: string
}>()
</script>

<template>
  <UiCallout
    type="danger"
    :title="title"
    :icon="icon"
  >
    <slot />
  </UiCallout>
</template>
