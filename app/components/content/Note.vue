<script setup lang="ts">
/**
 * MDC block for `::note` in lesson markdown. These were Nuxt UI components
 * before; with that gone, the note blocks in content/ had nothing to render
 * into and fell back to bare paragraphs.
 */
defineProps<{
  title?: string
  icon?: string
}>()
</script>

<template>
  <UiCallout
    type="note"
    :title="title"
    :icon="icon"
  >
    <slot />
  </UiCallout>
</template>
