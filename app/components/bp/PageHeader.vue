<script setup lang="ts">
/**
 * A Blueprint sheet header: graph paper, mono sheet number, big title — and,
 * on wide screens, a drafting sketch on the right that draws itself once on
 * load. The sketch is seeded by the title, so every page has its own.
 */
const props = defineProps<{
  sheet: string
  title: string
  lead?: string
  center?: boolean
}>()
// Corner decoration: a faint bar chart and ring chart, and three floating
// icon tiles picked by the title — every page a little different, none loud.
const ICONS = ['i-lucide-bar-chart-3', 'i-lucide-database', 'i-lucide-sparkles', 'i-lucide-workflow', 'i-lucide-pie-chart', 'i-lucide-filter', 'i-lucide-terminal', 'i-lucide-line-chart', 'i-lucide-git-merge']
const TINTS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']
const seed = computed(() => [...props.title].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7))
const tiles = computed(() => [0, 1, 2].map(i => ({ icon: ICONS[(seed.value + i * 4) % ICONS.length]!, tint: TINTS[(seed.value + i) % TINTS.length]! })))
const bars = computed(() => Array.from({ length: 7 }, (_, i) => 20 + ((seed.value >> i) % 7) * 11))
</script>

<template>
  <header class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
    <!-- Corners: a bar chart bottom-left, a ring top-right, floating icons -->
    <svg
      class="pointer-events-none absolute -bottom-2 left-0 h-24 w-56 opacity-[0.09] sm:h-28 sm:w-72"
      viewBox="0 0 140 60"
      aria-hidden="true"
    >
      <rect
        v-for="(h, i) in bars"
        :key="i"
        :x="4 + i * 19"
        :y="60 - h * 0.6"
        width="13"
        :height="h * 0.6"
        rx="2"
        fill="var(--signal)"
      />
    </svg>
    <svg
      class="pointer-events-none absolute -end-10 -top-10 size-44 opacity-[0.08] sm:size-56"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="var(--signal)"
        stroke-width="14"
        stroke-dasharray="150 239"
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="var(--ink)"
        stroke-width="14"
        stroke-dasharray="60 239"
        stroke-dashoffset="-155"
      />
    </svg>
    <span
      v-for="(tile, i) in tiles"
      :key="i"
      class="bp-float pointer-events-none absolute hidden items-center justify-center rounded-xl md:flex xl:hidden"
      :class="['end-[8%] top-[18%] size-11', 'end-[22%] bottom-[14%] size-9', 'end-[3%] bottom-[30%] size-8'][i]"
      :style="{ background: `color-mix(in srgb, ${tile.tint} 12%, transparent)`, color: tile.tint, animationDelay: `${i * 1.3}s`, opacity: center ? 0.5 : 0.85 }"
      aria-hidden="true"
    >
      <UIcon
        :name="tile.icon"
        class="size-1/2"
      />
    </span>
    <BpDrawing
      :seed="title"
      class="absolute top-1/2 hidden w-[22rem] -translate-y-1/2 opacity-60 xl:block"
      style="inset-inline-end: max(1rem, calc((100vw - var(--ui-container)) / 2 + 1rem))"
      :class="center ? 'opacity-30' : ''"
    />
    <div
      class="relative mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      :class="center ? 'text-center' : ''"
    >
      <p class="eyebrow">
        {{ sheet }}
      </p>
      <h1
        class="bp-h1 mt-4"
        :class="center ? '' : 'xl:max-w-[calc(100%_-_24rem)]'"
      >
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="bp-lead mt-5 max-w-2xl"
        :class="center ? 'mx-auto' : ''"
      >
        {{ lead }}
      </p>
      <slot />
    </div>
  </header>
</template>

<style scoped>
.bp-float { animation: bp-float 6s ease-in-out infinite; }
@keyframes bp-float { 50% { transform: translateY(-8px) rotate(-3deg); } }
@media (prefers-reduced-motion: reduce) { .bp-float { animation: none; } }
</style>
