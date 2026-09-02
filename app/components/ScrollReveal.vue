<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

/**
 * Fades and lifts its content in the first time it scrolls into view.
 *
 * The animation is CSS (see .reveal in main.css); this component only flips
 * the class, so prerendered HTML still carries the full content for crawlers
 * and the reduced-motion media query can neutralise the effect entirely.
 * `delay` staggers siblings revealed by the same scroll.
 */
const props = withDefaults(defineProps<{
  delay?: number
}>(), { delay: 0 })

const el = ref<HTMLElement | null>(null)
const visible = ref(false)

onMounted(() => {
  const { stop } = useIntersectionObserver(el, (entries) => {
    if (entries.some(e => e.isIntersecting)) {
      visible.value = true
      stop()
    }
  }, { threshold: 0.15 })
})
</script>

<template>
  <div
    ref="el"
    class="reveal"
    :class="{ 'reveal-visible': visible }"
    :style="{ '--reveal-delay': `${props.delay}ms` }"
  >
    <slot />
  </div>
</template>
