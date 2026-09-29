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
  <figure class="m-0">
    <figcaption
      v-if="caption || spec"
      class="mb-2 flex justify-between gap-4 font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)"
    >
      <span>{{ caption }}</span>
      <span>{{ spec }}</span>
    </figcaption>
    <div
      class="crosshair border-[1.5px] border-(--ink) bg-(--card)"
      :class="shadow ? 'shadow-[10px_10px_0_var(--ice)]' : ''"
    >
      <slot />
    </div>
    <div
      v-if="ruler"
      class="ruler mt-1 text-(--ink)"
    />
  </figure>
</template>
