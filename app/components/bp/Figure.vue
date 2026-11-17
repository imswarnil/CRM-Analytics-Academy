<script setup lang="ts">
/**
 * A drawing frame: mono caption row above ("FIG. 01 — …" left, a spec right),
 * ink border with crop marks, optional ruler strip underneath.
 */
defineProps<{
  caption?: string
  spec?: string
  ruler?: boolean
  shadow?: boolean
}>()
</script>

<template>
  <figure class="m-0 flex flex-col">
    <figcaption
      v-if="caption || spec"
      class="mb-2 flex justify-between gap-4 font-medium text-[11px] text-(--ink2)"
    >
      <span>{{ caption }}</span>
      <span>{{ spec }}</span>
    </figcaption>
    <div
      class="crosshair flex flex-1 flex-col border border-(--line) bg-(--card) rounded-2xl"
      :class="shadow ? 'shadow-[0_12px_32px_-18px_rgb(12_27_51/.3)]' : ''"
    >
      <slot />
    </div>
    <div
      v-if="ruler"
      class="ruler mt-1 text-(--ink)"
    />
  </figure>
</template>
