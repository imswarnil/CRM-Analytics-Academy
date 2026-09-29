<script setup lang="ts">
/**
 * A dashboard wireframe, drawn.
 *
 * Every "what we build and why" lesson needs to show a layout before the reader
 * has anything built. A screenshot cannot do that job: it would be a picture of
 * *my* org, it goes stale the moment a label changes, it is unreadable on a
 * phone, and it ships a few hundred KB per lesson. So the frame, the chrome and
 * the widget placeholders are drawn from the same tokens as the rest of the
 * page — following the design system's `im-mock` — and every block carries the
 * label and the widget type the reader is actually going to create.
 *
 * `span` is in twelfths, matching CRM Analytics' own 12-column dashboard grid,
 * so a wireframe here transfers directly to the canvas.
 *
 * ::dashboard-mock
 * ---
 * title: Academy — Pipeline Health
 * subtitle: Weekly, AEs and their managers
 * filters: [Close Quarter, Segment, Region]
 * widgets:
 *   - label: Open pipeline
 *     type: kpi
 *     span: 3
 *   - label: Pipeline by stage
 *     type: funnel
 *     span: 6
 *     note: Grouped by Stage, measure = sum(Amount)
 * ---
 * ::
 */
type WidgetType = 'kpi' | 'bar' | 'column' | 'line' | 'donut' | 'table' | 'funnel' | 'map' | 'text' | 'filter' | 'gauge' | 'heat'

const props = defineProps<{
  title: string
  subtitle?: string
  /** Global filter chips drawn in the toolbar. */
  filters?: string[]
  widgets: {
    label: string
    type?: WidgetType
    /** Width in twelfths of the row. Defaults to 4. */
    span?: number
    note?: string
  }[]
  /** Label under the frame, e.g. which app it lives in. */
  caption?: string
}>()

const ICONS: Record<WidgetType, string> = {
  kpi: 'i-lucide-hash',
  bar: 'i-lucide-bar-chart-3',
  column: 'i-lucide-bar-chart-big',
  line: 'i-lucide-trending-up',
  donut: 'i-lucide-pie-chart',
  table: 'i-lucide-table-2',
  funnel: 'i-lucide-filter',
  map: 'i-lucide-map',
  text: 'i-lucide-type',
  filter: 'i-lucide-sliders-horizontal',
  gauge: 'i-lucide-gauge',
  heat: 'i-lucide-grid-3x3'
}

// Tailwind needs these class strings to exist literally, so the span map is
// written out rather than interpolated.
const SPANS: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
}
const icon = (t?: WidgetType) => ICONS[t ?? 'bar'] ?? ICONS.bar
const span = (n?: number) => SPANS[Math.min(12, Math.max(1, n ?? 4))]
</script>

<template>
  <figure class="not-prose my-8">
    <div class="overflow-hidden rounded-xl border border-default bg-default shadow-sm">
      <!-- chrome -->
      <div class="flex items-center gap-2 border-b border-default bg-elevated/60 px-3 py-2">
        <span
          class="flex gap-1.5"
          aria-hidden="true"
        >
          <span class="size-2.5 rounded-full bg-dimmed/40" />
          <span class="size-2.5 rounded-full bg-dimmed/40" />
          <span class="size-2.5 rounded-full bg-dimmed/40" />
        </span>
        <div class="min-w-0 flex-1 text-center">
          <p class="truncate text-xs font-semibold text-highlighted">
            {{ props.title }}
          </p>
          <p
            v-if="props.subtitle"
            class="truncate text-[11px] text-muted"
          >
            {{ props.subtitle }}
          </p>
        </div>
        <UIcon
          name="i-lucide-refresh-cw"
          class="size-3.5 shrink-0 text-dimmed"
        />
      </div>

      <!-- global filters -->
      <div
        v-if="props.filters?.length"
        class="flex flex-wrap gap-1.5 border-b border-default bg-elevated/25 px-3 py-2"
      >
        <span
          v-for="(f, i) in props.filters"
          :key="i"
          class="inline-flex items-center gap-1 rounded-md border border-default bg-default px-2 py-0.5 text-[11px] text-muted"
        >
          <UIcon
            name="i-lucide-chevron-down"
            class="size-3"
          />
          {{ f }}
        </span>
      </div>

      <!-- the 12-column canvas -->
      <div class="grid grid-cols-12 gap-2 p-3">
        <div
          v-for="(w, i) in props.widgets"
          :key="i"
          class="flex min-h-[64px] flex-col justify-between rounded-lg border border-dashed border-default bg-elevated/30 p-2.5"
          :class="span(w.span)"
        >
          <div class="flex items-start gap-1.5">
            <UIcon
              :name="icon(w.type)"
              class="mt-px size-3.5 shrink-0 text-primary/70"
            />
            <p class="text-[11px] font-semibold leading-tight text-highlighted">
              {{ w.label }}
            </p>
          </div>
          <p
            v-if="w.note"
            class="mt-1.5 font-mono text-[10px] leading-snug text-dimmed"
          >
            {{ w.note }}
          </p>
        </div>
      </div>
    </div>
    <figcaption
      v-if="props.caption"
      class="mt-2 text-center text-xs text-muted"
    >
      {{ props.caption }}
    </figcaption>
  </figure>
</template>
