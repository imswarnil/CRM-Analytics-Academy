<script setup lang="ts">
/**
 * Blueprint bar chart: ink-outlined bars on a faint grid, y ticks in mono,
 * x labels underneath. The hovered bar turns cyan and gets a dashed
 * crosshair line and an ink tooltip chip.
 */
interface Bar {
  label: string
  value: number
  tone?: 'signal' | 'tide' | 'frost' | 'ice' | 'hatch'
  title?: string
  to?: string
}

const props = withDefaults(defineProps<{
  bars: Bar[]
  height?: number
  ticks?: string[]
  format?: (v: number) => string
  gap?: number
}>(), { height: 180, ticks: () => [], gap: 6 })

const hover = ref<number | null>(null)
const max = computed(() => Math.max(1, ...props.bars.map(b => b.value)))
const fill = (b: Bar, i: number) => {
  if (hover.value === i) return 'var(--glow)'
  return b.tone === 'hatch'
    ? 'transparent'
    : `var(--${b.tone ?? 'signal'})`
}
// Past ~60 bars a 1.5px outline on both sides is wider than the bar.
const dense = computed(() => props.bars.length > 60)
const fmt = (v: number) => props.format ? props.format(v) : String(v)
</script>

<template>
  <div class="relative">
    <div
      class="relative flex items-end"
      :style="{ height: `${height}px`, gap: `${gap}px` }"
    >
      <!-- horizontal guides -->
      <div
        v-for="(t, i) in ticks"
        :key="t"
        class="pointer-events-none absolute inset-x-0 border-t border-(--line)"
        :style="{ bottom: `${(i / Math.max(1, ticks.length - 1)) * 100}%` }"
      >
        <span class="absolute -top-2 -left-1 -translate-x-full font-mono text-[9px] text-(--ink2)">{{ t }}</span>
      </div>

      <component
        :is="b.to ? resolveComponent('NuxtLink') : 'div'"
        v-for="(b, i) in bars"
        :key="i"
        :to="b.to"
        class="relative min-w-0 flex-1 border-(--ink) transition-[background-color,transform] duration-200"
        :class="[b.tone === 'hatch' ? 'hatch' : '', hover === i ? 'z-10 scale-x-105' : '', dense ? 'border-x-0 border-t' : 'border-[1.5px]']"
        :style="{ height: `${Math.max(2, (b.value / max) * 100)}%`, background: fill(b, i) }"
        @mouseenter="hover = i"
        @mouseleave="hover = null"
        @focus="hover = i"
        @blur="hover = null"
      >
        <template v-if="hover === i">
          <span class="pointer-events-none absolute -top-[200px] bottom-0 left-1/2 border-l border-dashed border-(--ink)" />
          <span class="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap bg-(--ink) px-2 py-1 font-mono text-[10px] text-(--paper)">
            {{ b.title ?? `${b.label} · ${fmt(b.value)}` }}
          </span>
        </template>
      </component>
    </div>
    <div
      v-if="bars.some(b => b.label)"
      class="mt-2 flex"
      :style="{ gap: `${gap}px` }"
    >
      <span
        v-for="(b, i) in bars"
        :key="i"
        class="flex-1 truncate text-center font-mono text-[9px] uppercase text-(--ink2)"
      >{{ b.label }}</span>
    </div>
  </div>
</template>
