<script setup lang="ts">
/**
 * The hero's figure, as a three-sheet slider: the ARR chart (passed in by the
 * page as the `arr` slot), a running dataflow, and a grid of what the course
 * teaches.
 *
 * All slides share one grid cell, so the frame is always as tall as the
 * tallest sheet and nothing below it jumps on a change. It advances every 7s,
 * pauses while hovered or focused and when the tab is hidden, and never
 * auto-advances for readers who asked for reduced motion. Arrow keys work when
 * it has focus; a horizontal swipe works on touch.
 */
const { t } = useI18n()

const slides = computed(() => [
  { caption: 'Fig. 01 — Academy ARR by month', spec: 'Built in Build 14' },
  { caption: `Fig. 02 — ${t('home.slides.dataflow')}`, spec: 'Recipe → dataset → dashboard' },
  { caption: `Fig. 03 — ${t('home.slides.topics')}`, spec: '6 skills · 6 lessons' }
])

const index = ref(0)
const paused = ref(false)
const reduced = ref(false)
const total = computed(() => slides.value.length)

function go(i: number) {
  index.value = (i + total.value) % total.value
}
const next = () => go(index.value + 1)
const prev = () => go(index.value - 1)

let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}
function start() {
  stop()
  if (reduced.value || paused.value) return
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') next()
  }, 7000)
}
// Any manual move restarts the clock, so a slide never flips the instant
// after someone chose it.
watch(index, start)
watch(paused, start)

onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = mq.matches
  mq.addEventListener('change', (e) => {
    reduced.value = e.matches
    start()
  })
  start()
})
onBeforeUnmount(stop)

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prev()
  }
}

let touchX: number | null = null
function onTouchStart(e: TouchEvent) {
  touchX = e.touches[0]?.clientX ?? null
}
function onTouchEnd(e: TouchEvent) {
  if (touchX == null) return
  const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX
  touchX = null
  if (Math.abs(dx) > 40) {
    if (dx < 0) next()
    else prev()
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div
    class="min-w-0 outline-none"
    role="region"
    aria-roledescription="carousel"
    :aria-label="t('home.slides.label')"
    tabindex="0"
    @keydown="onKey"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div
      class="grid"
      :aria-live="paused || reduced ? 'polite' : 'off'"
    >
      <div
        v-for="(s, i) in slides"
        :key="s.caption"
        class="bp-slide [grid-area:1/1]"
        :class="{ 'bp-slide--on': i === index }"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${i + 1} / ${total}`"
        :aria-hidden="i !== index"
        :inert="i !== index"
      >
        <BpFigure
          :caption="s.caption"
          :spec="s.spec"
          shadow
          class="h-full"
        >
          <slot
            v-if="i === 0"
            name="arr"
          />
          <div
            v-else-if="i === 1"
            class="my-auto p-4 sm:p-5"
          >
            <BpDataflow :active="i === index" />
            <p class="mt-3 border-t border-dashed border-(--line) pt-3 font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
              {{ t('home.slides.dataflowNote') }}
            </p>
          </div>
          <BpTopicGrid
            v-else
            class="my-auto"
            :active="i === index"
          />
        </BpFigure>
      </div>
    </div>

    <!-- controls -->
    <div class="mt-5 flex items-center gap-3">
      <button
        type="button"
        class="bp-slide-btn"
        :aria-label="t('home.slides.prev')"
        @click="prev"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
      </button>
      <button
        type="button"
        class="bp-slide-btn"
        :aria-label="t('home.slides.next')"
        @click="next"
      >
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4"
        />
      </button>
      <span class="font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
        Fig. {{ pad(index + 1) }} / {{ pad(total) }}
      </span>
      <span class="ms-auto flex gap-1.5">
        <button
          v-for="(s, i) in slides"
          :key="`dot-${i}`"
          type="button"
          class="size-2.5 border-[1.5px] border-(--ink) transition-colors"
          :class="i === index ? 'bg-(--signal)' : 'bg-(--card) hover:bg-(--ice)'"
          :aria-label="s.caption"
          :aria-current="i === index ? 'true' : undefined"
          @click="go(i)"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.bp-slide {
  opacity: 0;
  transform: translateX(14px);
  visibility: hidden;
  transition:
    opacity .35s ease-out,
    transform .45s cubic-bezier(.3, 1.5, .5, 1),
    visibility 0s .45s;
}
.bp-slide--on {
  opacity: 1;
  transform: none;
  visibility: visible;
  transition:
    opacity .35s ease-out,
    transform .45s cubic-bezier(.3, 1.5, .5, 1),
    visibility 0s;
}
.bp-slide-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1.5px solid var(--ink);
  background: var(--card);
  color: var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  transition:
    transform .15s,
    box-shadow .15s,
    background-color .15s;
}
.bp-slide-btn:hover {
  background: var(--ice);
}
.bp-slide-btn:active {
  transform: translate(3px, 3px);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .bp-slide,
  .bp-slide--on {
    transform: none;
    transition: none;
  }
}
</style>
