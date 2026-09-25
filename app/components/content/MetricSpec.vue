<script setup lang="ts">
/**
 * A metric definition, written down properly.
 *
 * The recurring failure in GTM analytics is not a broken chart, it is two teams
 * using the same word for different numbers. So every metric this curriculum
 * introduces is specified the same way: what it is, how it is computed, at what
 * grain, and the specific way it goes wrong. The last field is the one people
 * skip and the one that saves the dashboard.
 *
 * ::metric-spec
 * ---
 * items:
 *   - name: Win Rate
 *     formula: count(Closed Won) / count(Closed Won + Closed Lost)
 *     grain: Per opportunity, filtered to IsClosed = true
 *     watchout: Excluding open deals is correct; excluding *nothing* silently
 *       counts open pipeline as a loss.
 * ---
 * ::
 */
defineProps<{
  items: {
    name: string
    formula: string
    grain?: string
    source?: string
    watchout?: string
  }[]
}>()
</script>

<template>
  <div class="not-prose my-8 space-y-3">
    <div
      v-for="(m, i) in items"
      :key="i"
      class="overflow-hidden rounded-xl border border-default bg-default"
    >
      <div class="flex items-center gap-2 border-b border-default bg-elevated/50 px-4 py-2.5">
        <UIcon
          name="i-lucide-sigma"
          class="size-4 shrink-0 text-primary"
        />
        <h4 class="text-sm font-semibold text-highlighted">
          {{ m.name }}
        </h4>
      </div>
      <dl class="divide-y divide-default text-sm">
        <div class="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:gap-4">
          <dt class="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-dimmed">
            Formula
          </dt>
          <dd class="min-w-0 break-words font-mono text-[13px] text-highlighted">
            {{ m.formula }}
          </dd>
        </div>
        <div
          v-if="m.grain"
          class="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:gap-4"
        >
          <dt class="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-dimmed">
            Grain
          </dt>
          <dd class="min-w-0 text-muted">
            {{ m.grain }}
          </dd>
        </div>
        <div
          v-if="m.source"
          class="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:gap-4"
        >
          <dt class="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-dimmed">
            Source
          </dt>
          <dd class="min-w-0 font-mono text-[13px] text-muted">
            {{ m.source }}
          </dd>
        </div>
        <div
          v-if="m.watchout"
          class="flex flex-col gap-1 bg-warning/5 px-4 py-2.5 sm:flex-row sm:gap-4"
        >
          <dt class="flex w-24 shrink-0 items-center gap-1 text-xs font-medium uppercase tracking-wide text-warning">
            <UIcon
              name="i-lucide-triangle-alert"
              class="size-3.5"
            />
            Watch
          </dt>
          <dd class="min-w-0 text-muted">
            {{ m.watchout }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
