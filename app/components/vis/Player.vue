<script setup lang="ts">
/**
 * Step controls shared by the visualisers: first / previous / play / next /
 * last, a scrubber, and the arrow keys. `modelValue` is the step index.
 */
const props = defineProps<{ count: number }>()
const { $track } = useNuxtApp()
const step = defineModel<number>({ required: true })
const { t } = useI18n()
const route = useRoute()
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function go(i: number) {
  step.value = Math.min(Math.max(i, 0), Math.max(props.count - 1, 0))
}
function toggle() {
  playing.value = !playing.value
  clearInterval(timer)
  if (!playing.value) return
  if (step.value >= props.count - 1) go(0)
  $track?.('visualiser_run', route.path)
  timer = setInterval(() => {
    if (step.value >= props.count - 1) {
      playing.value = false
      clearInterval(timer)
    } else {
      go(step.value + 1)
    }
  }, 1600)
}
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable]')) return
  if (e.key === 'ArrowRight') go(step.value + 1)
  else if (e.key === 'ArrowLeft') go(step.value - 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
})
watch(() => props.count, () => go(step.value))
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 border-[1.5px] border-(--ink) bg-(--card) px-3 py-2">
    <UButton
      icon="i-lucide-skip-back"
      color="neutral"
      variant="ghost"
      size="sm"
      square
      :aria-label="t('vis.first')"
      @click="go(0)"
    />
    <UButton
      icon="i-lucide-chevron-left"
      color="neutral"
      variant="ghost"
      size="sm"
      square
      :aria-label="t('vis.prev')"
      @click="go(step - 1)"
    />
    <UButton
      :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
      size="sm"
      @click="toggle"
    >
      {{ playing ? t('vis.pause') : t('vis.play') }}
    </UButton>
    <UButton
      icon="i-lucide-chevron-right"
      color="neutral"
      variant="ghost"
      size="sm"
      square
      :aria-label="t('vis.next')"
      @click="go(step + 1)"
    />
    <UButton
      icon="i-lucide-skip-forward"
      color="neutral"
      variant="ghost"
      size="sm"
      square
      :aria-label="t('vis.last')"
      @click="go(count - 1)"
    />
    <input
      type="range"
      min="0"
      :max="Math.max(count - 1, 0)"
      :value="step"
      class="min-w-24 flex-1 accent-(--signal)"
      :aria-label="t('vis.scrub')"
      @input="go(Number(($event.target as HTMLInputElement).value))"
    >
    <span class="font-mono text-xs tabular-nums text-(--ink2)">{{ t('vis.stepOf', { n: step + 1, total: count }) }}</span>
  </div>
</template>
