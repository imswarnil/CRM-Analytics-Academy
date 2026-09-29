<script setup lang="ts">
/**
 * A row of KPI tiles — the dashboard's headline numbers, drawn in prose.
 *
 * Modelled on the design system's `im-stat`: a big tabular figure, a quiet
 * label, and a delta that is coloured by direction rather than by sentiment.
 * The distinction matters — a *rising* churn number is red, so `trend` says
 * which way the arrow points and `good` says whether that is welcome.
 *
 * ::lesson-kpis
 * ---
 * items:
 *   - label: Open pipeline
 *     value: $89.5M
 *     delta: +12.4%
 *     trend: up
 *     hint: Sum of Amount where IsClosed = false
 *     spark: [3, 5, 4, 6, 7, 6, 9]
 * ---
 * ::
 */
const props = withDefaults(
  defineProps<{
    items: {
      label: string
      value: string | number
      delta?: string
      /** Direction of the arrow. */
      trend?: 'up' | 'down' | 'flat'
      /** Is that direction good news? Defaults to true for up, false for down. */
      good?: boolean
      hint?: string
      /** Bare numbers; scaled to the tallest, so any unit works. */
      spark?: number[]
    }[]
    columns?: number
  }>(),
  { columns: 4 }
)

const cols: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 lg:grid-cols-5'
}

function isGood(k: { trend?: string, good?: boolean }) {
  if (k.good !== undefined) return k.good
  return k.trend !== 'down'
}
function arrow(t?: string) {
  return t === 'down' ? 'i-lucide-trending-down' : t === 'flat' ? 'i-lucide-minus' : 'i-lucide-trending-up'
}
function peak(spark: number[]) {
  return Math.max(...spark, 1)
}
</script>

<template>
  <div
    class="not-prose my-8 grid gap-3"
    :class="cols[props.columns] ?? cols[4]"
  >
    <div
      v-for="(k, i) in props.items"
      :key="i"
      class="flex flex-col justify-between gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4"
    >
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
          {{ k.label }}
        </p>
        <p class="mt-1 text-3xl font-black tabular-nums leading-none tracking-[-0.03em] text-(--ink)">
          {{ k.value }}
        </p>
        <p
          v-if="k.delta"
          class="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold"
          :class="k.trend === 'flat' ? 'text-(--ink2)' : isGood(k) ? 'text-(--signal)' : 'text-(--ink)'"
        >
          <UIcon
            :name="arrow(k.trend)"
            class="size-3.5"
          />
          {{ k.delta }}
        </p>
      </div>

      <!-- Sparkline: bars rather than a path, so it stays legible at 40px tall
           and needs no charting dependency. -->
      <div
        v-if="k.spark?.length"
        class="flex h-8 items-end gap-0.5"
        aria-hidden="true"
      >
        <span
          v-for="(v, j) in k.spark"
          :key="j"
          class="min-h-px flex-1 bg-(--tide)"
          :style="{ height: `${Math.max(4, (v / peak(k.spark)) * 100)}%` }"
        />
      </div>

      <p
        v-if="k.hint"
        class="border-t border-dashed border-(--line) pt-2 font-mono text-[11px] leading-snug text-(--ink2)"
      >
        {{ k.hint }}
      </p>
    </div>
  </div>
</template>
