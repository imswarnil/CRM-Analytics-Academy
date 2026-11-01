<script setup lang="ts">
/**
 * The narration under a visualiser's stage, written out like a whiteboard
 * explainer: the sentence types itself with a pen riding the end of the text,
 * then a hand-drawn underline is drawn beneath it. Each new `text` starts over.
 * With reduced motion the sentence simply appears.
 */
const props = defineProps<{ text: string, eyebrow?: string, error?: boolean }>()

// The server renders the whole sentence (no-JS readers, crawlers, screenshots);
// the browser rewrites it with the pen once mounted.
const shown = ref(props.text)
const done = ref(true)
let raf = 0
function write(text: string) {
  cancelAnimationFrame(raf)
  if (import.meta.server || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = text
    done.value = true
    return
  }
  shown.value = ''
  done.value = false
  const start = performance.now()
  // About 55 characters a second, never longer than 1.6 s for a sentence.
  const total = Math.min(1600, text.length * 18)
  const tick = (now: number) => {
    const n = Math.ceil((Math.min(1, (now - start) / total)) * text.length)
    shown.value = text.slice(0, n)
    if (n < text.length) raf = requestAnimationFrame(tick)
    else done.value = true
  }
  raf = requestAnimationFrame(tick)
}
watch(() => props.text, t => write(t))
onMounted(() => write(props.text))
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div
    class="relative"
    aria-live="polite"
  >
    <p
      v-if="props.eyebrow"
      class="eyebrow"
      :class="props.error ? 'text-error' : ''"
    >
      {{ props.eyebrow }}
    </p>
    <p
      class="mt-1 min-h-[3.2em] text-[17px] leading-snug sm:text-lg"
      :class="props.error ? 'text-error' : 'text-(--ink)'"
    >
      <span class="sr-only">{{ props.text }}</span>
      <span aria-hidden="true">{{ shown }}</span><UIcon
        v-if="!done"
        name="i-lucide-pen-line"
        class="ms-0.5 inline size-5 -translate-y-0.5 text-(--signal)"
        aria-hidden="true"
      />
    </p>
    <svg
      class="pointer-events-none h-2.5 w-56 max-w-full"
      viewBox="0 0 220 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        :key="props.text"
        d="M2 6 C 40 2, 80 9, 120 5 S 190 3, 218 6"
        fill="none"
        :stroke="props.error ? 'var(--color-error-500, #dc2626)' : 'var(--signal)'"
        stroke-width="2.5"
        stroke-linecap="round"
        class="vis-scribble"
        :class="done ? 'vis-scribble--draw' : ''"
      />
    </svg>
  </div>
</template>

<style scoped>
.vis-scribble {
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
}
.vis-scribble--draw {
  animation: scribble 0.55s ease-out forwards;
}
@keyframes scribble {
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .vis-scribble {
    stroke-dashoffset: 0;
  }
}
</style>
