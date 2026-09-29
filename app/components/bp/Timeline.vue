<script setup lang="ts">
/**
 * The course timeline: one bar per lesson, height by minutes. Drawn as a
 * single SVG scaled to its container, so 161 bars can never overflow it the
 * way a row of 161 flex items with borders does. Hovering a bar lifts it to
 * cyan and names the lesson; clicking goes there.
 */
interface Bar {
  value: number
  tone: 'signal' | 'tide' | 'ice' | 'hatch'
  title: string
  to: string
}

const props = withDefaults(defineProps<{ bars: Bar[], height?: number }>(), { height: 64 })

const hover = ref<number | null>(null)
const max = computed(() => Math.max(1, ...props.bars.map(b => b.value)))
const W = 1000
const step = computed(() => W / Math.max(1, props.bars.length))
const gap = computed(() => Math.min(2, step.value * 0.25))
const h = (v: number) => Math.max(3, (v / max.value) * (props.height - 2))
const fill = (b: Bar, i: number) => {
  if (hover.value === i) return 'var(--glow)'
  if (b.tone === 'hatch') return 'url(#bp-tl-hatch)'
  return `var(--${b.tone})`
}
const current = computed(() => (hover.value == null ? null : props.bars[hover.value]))
const tipLeft = computed(() => (hover.value == null ? 0 : ((hover.value + 0.5) / props.bars.length) * 100))
</script>

<template>
  <div class="relative">
    <svg
      :viewBox="`0 0 ${W} ${height}`"
      preserveAspectRatio="none"
      class="block w-full"
      :style="{ height: `${height}px` }"
      role="img"
      :aria-label="`Course timeline, ${bars.length} lessons`"
      @mouseleave="hover = null"
    >
      <defs>
        <pattern
          id="bp-tl-hatch"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect
            width="4"
            height="4"
            fill="var(--card)"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            stroke="var(--ink2)"
            stroke-width="1.5"
          />
        </pattern>
      </defs>
      <line
        x1="0"
        :y1="height - 0.5"
        :x2="W"
        :y2="height - 0.5"
        stroke="var(--ink)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <NuxtLink
        v-for="(b, i) in bars"
        :key="i"
        :to="b.to"
        :aria-label="b.title"
        @mouseenter="hover = i"
        @focus="hover = i"
      >
        <rect
          :x="i * step + gap / 2"
          :y="height - h(b.value)"
          :width="Math.max(0.5, step - gap)"
          :height="h(b.value)"
          :fill="fill(b, i)"
          stroke="var(--ink)"
          stroke-width="0.75"
          vector-effect="non-scaling-stroke"
        />
        <!-- A full-height hit area, so short bars are as easy to hover. -->
        <rect
          :x="i * step"
          y="0"
          :width="step"
          :height="height"
          fill="transparent"
        />
      </NuxtLink>
    </svg>
    <span
      v-if="current"
      class="pointer-events-none absolute -top-8 z-20 max-w-[18rem] -translate-x-1/2 truncate whitespace-nowrap bg-(--ink) px-2 py-1 font-mono text-[10px] text-(--paper)"
      :style="{ left: `clamp(4.5rem, ${tipLeft}%, calc(100% - 4.5rem))` }"
    >{{ current.title }} · {{ current.value }} min</span>
  </div>
</template>
