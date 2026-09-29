<script setup lang="ts">
/**
 * A funnel with the conversion rate *between* the stages.
 *
 * Drawn as bars whose width is proportional to volume, because that is the one
 * thing a funnel is for: seeing where the drop is. The step-to-step rate sits in
 * the gap rather than on the bar, since the number people act on is the
 * conversion between two stages, not the absolute count in one.
 *
 * ::funnel-viz
 * ---
 * stages:
 *   - label: Sessions
 *     value: 412000
 *   - label: Signups
 *     value: 9840
 * ---
 * ::
 */
const props = withDefaults(
  defineProps<{
    stages: {
      label: string
      value: number
      note?: string
    }[]
    /** Shown under the last stage, e.g. "Q3 FY26, AMER". */
    caption?: string
    /**
     * Bar length scale.
     *
     * `linear` is truthful and unreadable once a funnel spans orders of
     * magnitude: 412,000 sessions against 448 opportunities makes every bar
     * after the second a stub, and the reader loses the four stages that
     * matter most. `log` keeps them all legible and is the honest choice
     * PROVIDED the axis is understood as logarithmic -- which is why the
     * component says so under the bars rather than leaving it implied.
     */
    scale?: 'linear' | 'log'
  }>(),
  { scale: 'linear' }
)

const top = computed(() => Math.max(...props.stages.map(s => s.value), 1))
const floor = computed(() => Math.max(1, Math.min(...props.stages.map(s => s.value))))
const fmt = (n: number) => n.toLocaleString('en-US')
const pct = (a: number, b: number) => b ? `${((a / b) * 100).toFixed(1)}%` : '—'

// Log bars are mapped onto the span between the smallest and largest stage, so
// the shortest bar is still visibly a bar rather than a hairline.
function width(v: number) {
  if (props.scale === 'log') {
    const lo = Math.log10(floor.value)
    const hi = Math.log10(top.value)
    const t = hi === lo ? 1 : (Math.log10(Math.max(v, 1)) - lo) / (hi - lo)
    return 12 + t * 88
  }
  return Math.max(1.5, (v / top.value) * 100)
}
</script>

<template>
  <figure class="not-prose my-8">
    <div class="space-y-1">
      <template
        v-for="(s, i) in props.stages"
        :key="i"
      >
        <div class="border-[1.5px] border-(--ink) bg-(--card) p-3">
          <div class="mb-2 flex items-baseline justify-between gap-3">
            <p class="text-sm font-semibold text-(--ink)">
              {{ s.label }}
            </p>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-(--ink)">
              {{ fmt(s.value) }}
            </p>
          </div>
          <div
            class="h-2.5 overflow-hidden border border-(--ink) bg-(--paper)"
            aria-hidden="true"
          >
            <div
              class="h-full bg-(--signal)"
              :style="{ width: `${width(s.value)}%` }"
            />
          </div>
          <p
            v-if="s.note"
            class="mt-2 text-xs text-(--ink2)"
          >
            {{ s.note }}
          </p>
        </div>

        <!-- The gap carries the step conversion — the actionable number. -->
        <div
          v-if="i < props.stages.length - 1"
          class="flex items-center gap-2 py-0.5 pl-3 text-xs text-(--ink2)"
        >
          <UIcon
            name="i-lucide-corner-down-right"
            class="size-3.5 shrink-0 text-(--ink2)"
          />
          <span class="font-semibold tabular-nums text-(--signal)">
            {{ pct(props.stages[i + 1]!.value, s.value) }}
          </span>
          <span>convert to {{ props.stages[i + 1]!.label }}</span>
        </div>
      </template>
    </div>
    <figcaption
      v-if="props.caption || props.scale === 'log'"
      class="mt-2 text-xs text-(--ink2)"
    >
      {{ props.caption }}
      <span
        v-if="props.scale === 'log'"
        class="text-(--ink2)"
      >Bar lengths are logarithmic — compare the percentages, not the bars.</span>
    </figcaption>
  </figure>
</template>
