<script setup lang="ts">
/** A progress ring. 0 is an empty circle, 1 is a filled disc. */
const props = withDefaults(defineProps<{ value: number, size?: number, active?: boolean }>(), { size: 44, active: false })
const r = 16
const c = 2 * Math.PI * r
const dash = computed(() => `${Math.max(0, Math.min(1, props.value)) * c} ${c}`)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    class="flex-none"
    role="img"
    :aria-label="`${Math.round(value * 100)}% complete`"
  >
    <circle
      cx="20"
      cy="20"
      r="18.5"
      :fill="value >= 1 || active ? 'var(--signal)' : 'var(--card)'"
      stroke="var(--ink)"
      stroke-width="1.5"
    />
    <circle
      v-if="value > 0 && value < 1"
      cx="20"
      cy="20"
      :r="r"
      fill="none"
      stroke="var(--signal)"
      stroke-width="5"
      :stroke-dasharray="dash"
      transform="rotate(-90 20 20)"
    />
  </svg>
</template>
