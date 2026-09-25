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
const props = defineProps<{
  stages: {
    label: string
    value: number
    note?: string
  }[]
  /** Shown under the last stage, e.g. "Q3 FY26, AMER". */
  caption?: string
}>()

const top = computed(() => Math.max(...props.stages.map(s => s.value), 1))
const fmt = (n: number) => n.toLocaleString('en-US')
const pct = (a: number, b: number) => b ? `${((a / b) * 100).toFixed(1)}%` : '—'
</script>

<template>
  <figure class="not-prose my-8">
    <div class="space-y-1">
      <template
        v-for="(s, i) in props.stages"
        :key="i"
      >
        <div class="rounded-lg border border-default bg-elevated/30 p-3">
          <div class="mb-2 flex items-baseline justify-between gap-3">
            <p class="text-sm font-semibold text-highlighted">
              {{ s.label }}
            </p>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-highlighted">
              {{ fmt(s.value) }}
            </p>
          </div>
          <div
            class="h-2 overflow-hidden rounded-full bg-default"
            aria-hidden="true"
          >
            <div
              class="h-full rounded-full bg-primary/70"
              :style="{ width: `${Math.max(1.5, (s.value / top) * 100)}%` }"
            />
          </div>
          <p
            v-if="s.note"
            class="mt-2 text-xs text-muted"
          >
            {{ s.note }}
          </p>
        </div>

        <!-- The gap carries the step conversion — the actionable number. -->
        <div
          v-if="i < props.stages.length - 1"
          class="flex items-center gap-2 py-0.5 pl-3 text-xs text-muted"
        >
          <UIcon
            name="i-lucide-corner-down-right"
            class="size-3.5 shrink-0 text-dimmed"
          />
          <span class="font-semibold tabular-nums text-primary">
            {{ pct(props.stages[i + 1]!.value, s.value) }}
          </span>
          <span>convert to {{ props.stages[i + 1]!.label }}</span>
        </div>
      </template>
    </div>
    <figcaption
      v-if="props.caption"
      class="mt-2 text-xs text-muted"
    >
      {{ props.caption }}
    </figcaption>
  </figure>
</template>
