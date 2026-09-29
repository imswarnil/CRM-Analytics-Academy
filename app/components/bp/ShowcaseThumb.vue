<script setup lang="ts">
/**
 * A showcase card's thumbnail: an ice sheet of graph paper with the
 * dashboard screenshot framed on it, a corner icon, and a line chart that
 * draws itself when the card is hovered —
 * a different kind of chart per card. With no screenshot yet, the frame
 * reads "drop screenshot" instead of showing a broken image.
 */
const props = withDefaults(defineProps<{ image?: string, alt?: string, icon?: string, seed?: string }>(), { icon: 'i-lucide-layout-dashboard', seed: '' })

// The shared placeholder is not a screenshot; show the drawing instead.
const shot = computed(() => (props.image && !props.image.includes('placeholder') ? props.image : ''))

// Every card draws a different kind of chart on hover — line, area, bars,
// donut or funnel — picked and shaped deterministically from its seed, so a
// card looks the same on every visit and no two neighbours match.
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    return h / 4294967296
  }
}
const KINDS = ['line', 'bars', 'donut', 'area', 'funnel'] as const
const chart = computed(() => {
  const r = rng(props.seed || 'x')
  const kind = KINDS[Math.floor(r() * KINDS.length)]!
  const ys = Array.from({ length: 9 }, (_, i) => Math.max(6, Math.min(64, 50 - i * 3 + (r() - 0.5) * 34)))
  const line = ys.map((y, i) => `${i * 25},${y.toFixed(1)}`).join(' ')
  const bars = Array.from({ length: 12 }, () => 14 + r() * 52)
  const share = 0.35 + r() * 0.45
  const funnel = [1, 0.62 + r() * 0.2, 0.38 + r() * 0.15, 0.18 + r() * 0.12]
  return { kind, line, area: `0,70 ${line} 200,70`, bars, share, funnel }
})

// Donut arc from 12 o'clock, as a path so the draw-on animation can trace it.
function arc(from: number, to: number, r = 22, cx = 35, cy = 35) {
  const p = (t: number) => {
    const a = 2 * Math.PI * t - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
  }
  return `M ${p(from)} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${p(to - 0.0001)}`
}
</script>

<template>
  <div class="graph-paper relative aspect-video overflow-hidden border-b-[1.5px] border-(--ink) bg-(--ice) p-4">
    <div
      v-if="shot"
      class="size-full overflow-hidden border-[1.5px] border-(--ink) bg-(--card)"
    >
      <NuxtImg
        :src="shot"
        :alt="alt"
        loading="lazy"
        width="600"
        height="338"
        class="size-full object-cover"
      />
    </div>
    <div
      v-else
      class="flex size-full items-center justify-center border-[1.5px] border-dashed border-(--ink2) font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)"
    >
      Drop screenshot
    </div>

    <span class="bp-iconbox absolute end-3 top-3 size-9! text-(--signal)">
      <UIcon
        :name="icon"
        class="size-4"
      />
    </span>

    <!-- Line and area -->
    <svg
      v-if="chart.kind === 'line' || chart.kind === 'area'"
      viewBox="0 0 200 70"
      class="pointer-events-none absolute inset-x-4 bottom-3 h-14 w-[calc(100%-2rem)]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        v-if="chart.kind === 'area'"
        :points="chart.area"
        fill="var(--signal)"
        fill-opacity=".14"
        class="bp-fade"
      />
      <polyline
        :points="chart.line"
        fill="none"
        stroke="var(--signal)"
        stroke-width="2.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
        class="bp-draw"
      />
    </svg>

    <!-- Bars -->
    <svg
      v-else-if="chart.kind === 'bars'"
      viewBox="0 0 200 70"
      class="pointer-events-none absolute inset-x-4 bottom-3 h-14 w-[calc(100%-2rem)]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        v-for="(v, i) in chart.bars"
        :key="i"
        :x="i * (200 / 12) + 2"
        :y="70 - v"
        :width="200 / 12 - 4"
        :height="v"
        :fill="i === chart.bars.length - 1 ? 'var(--signal)' : 'var(--tide)'"
        stroke="var(--ink)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
        class="bp-grow-y"
        :style="{ transitionDelay: `${i * 35}ms` }"
      />
    </svg>

    <!-- Donut -->
    <svg
      v-else-if="chart.kind === 'donut'"
      viewBox="0 0 70 70"
      class="pointer-events-none absolute bottom-3 start-6 size-24"
      aria-hidden="true"
    >
      <path
        :d="arc(0, 0.9999)"
        fill="none"
        stroke="var(--frost)"
        stroke-width="9"
        class="bp-fade"
      />
      <path
        :d="arc(0, chart.share)"
        fill="none"
        stroke="var(--signal)"
        stroke-width="9"
        class="bp-draw"
      />
      <text
        x="35"
        y="39"
        text-anchor="middle"
        font-size="12"
        font-weight="800"
        fill="var(--ink)"
        class="bp-fade"
      >{{ Math.round(chart.share * 100) }}%</text>
    </svg>

    <!-- Funnel -->
    <svg
      v-else
      viewBox="0 0 120 70"
      class="pointer-events-none absolute bottom-3 start-6 h-16 w-28"
      aria-hidden="true"
    >
      <rect
        v-for="(v, i) in chart.funnel"
        :key="i"
        :x="60 - v * 55"
        :y="4 + i * 16"
        :width="v * 110"
        height="12"
        :fill="i === chart.funnel.length - 1 ? 'var(--signal)' : 'var(--tide)'"
        stroke="var(--ink)"
        stroke-width="1"
        class="bp-grow-x"
        :style="{ transitionDelay: `${i * 80}ms` }"
      />
    </svg>
  </div>
</template>
