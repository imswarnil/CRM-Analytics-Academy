<script setup lang="ts">
/**
 * Decoration: faint charts floating in the corners of a hero — a bar chart,
 * a line, a donut and a scatter, at low opacity, drifting slowly. Purely
 * visual (aria-hidden, pointer-events none), CSS-only motion that stops for
 * prefers-reduced-motion. Place inside a `relative overflow-hidden` parent.
 *
 *   <BpFloatCharts tone="dark" />   on navy bands
 *   <BpFloatCharts />               on light surfaces
 */
const props = withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
const ink = computed(() => (props.tone === 'dark' ? '#7CBEFF' : '#0176D3'))
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <!-- bars, top right -->
    <svg
      class="fc fc-a absolute -end-6 -top-4 w-44 sm:w-56"
      viewBox="0 0 140 90"
      :style="{ opacity: props.tone === 'dark' ? 0.16 : 0.09 }"
    >
      <rect
        v-for="(h, i) in [34, 52, 40, 68, 58, 82]"
        :key="i"
        :x="6 + i * 22"
        :y="88 - h"
        width="14"
        :height="h"
        rx="2"
        :fill="ink"
      />
    </svg>
    <!-- line, bottom left -->
    <svg
      class="fc fc-b absolute -bottom-2 -start-6 w-52 sm:w-64"
      viewBox="0 0 160 70"
      :style="{ opacity: props.tone === 'dark' ? 0.18 : 0.1 }"
    >
      <polyline
        points="4,58 30,46 54,50 78,30 102,36 126,16 156,22"
        fill="none"
        :stroke="ink"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-for="(p, i) in [[30, 46], [78, 30], [126, 16]]"
        :key="i"
        :cx="p[0]"
        :cy="p[1]"
        r="4"
        :fill="ink"
      />
    </svg>
    <!-- donut, bottom right -->
    <svg
      class="fc fc-c absolute bottom-6 end-[18%] hidden w-20 md:block"
      viewBox="0 0 40 40"
      :style="{ opacity: props.tone === 'dark' ? 0.16 : 0.08 }"
    >
      <circle
        cx="20"
        cy="20"
        r="15"
        fill="none"
        :stroke="ink"
        stroke-width="6"
        stroke-dasharray="62 94"
      />
    </svg>
    <!-- scatter, top left -->
    <svg
      class="fc fc-d absolute start-[38%] top-4 hidden w-24 lg:block"
      viewBox="0 0 60 40"
      :style="{ opacity: props.tone === 'dark' ? 0.14 : 0.07 }"
    >
      <circle
        v-for="(p, i) in [[6, 30], [14, 24], [22, 27], [30, 16], [38, 19], [46, 9], [54, 12]]"
        :key="i"
        :cx="p[0]"
        :cy="p[1]"
        r="2.5"
        :fill="ink"
      />
    </svg>
  </div>
</template>

<style scoped>
.fc { animation: fc-drift 9s ease-in-out infinite; }
.fc-b { animation-delay: -3s; }
.fc-c { animation-delay: -5s; }
.fc-d { animation-delay: -7s; }
@keyframes fc-drift { 50% { transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .fc { animation: none; } }
</style>
