<script setup lang="ts">
/**
 * The rows at one step of a visualiser, with what happened to each: kept or
 * dropped by a filter, matched / unmatched / fanned out by a join, and new
 * columns (a transform's output) tinted. Rows are keyed by their `__id`, so a
 * row can be followed from step to step.
 */
import { type Row, columnsOf, fmt } from '~/utils/vis/data'

const props = defineProps<{
  rows: Row[]
  marks?: Record<string, string>
  newCols?: string[]
  dropCols?: string[]
  caption?: string
}>()
const { t } = useI18n()
const cols = computed(() => [...columnsOf(props.rows), ...(props.dropCols ?? []).filter(c => !columnsOf(props.rows).includes(c))])
const markOf = (r: Row) => props.marks?.[String(r.__id)]
const ROW: Record<string, string> = {
  dropped: 'bg-error/10 text-(--ink2) line-through decoration-error/70',
  unmatched: 'bg-warning/15',
  fanout: 'bg-(--glow)/25',
  multi: 'bg-(--glow)/25',
  kept: '',
  matched: ''
}
const BAR: Record<string, string> = { kept: 'bg-(--signal)', matched: 'bg-(--signal)', dropped: 'bg-error', unmatched: 'bg-warning', fanout: 'bg-(--glow)', multi: 'bg-(--glow)' }
</script>

<template>
  <div class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)">
    <table class="w-full border-collapse text-[13px]">
      <caption
        v-if="props.caption"
        class="border-b-[1.5px] border-(--ink) bg-(--ice) px-3 py-1.5 text-start font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)"
      >
        {{ props.caption }}
      </caption>
      <thead>
        <tr class="border-b-[1.5px] border-(--ink)">
          <th class="w-1 p-0" />
          <th
            v-for="c in cols"
            :key="c"
            class="whitespace-nowrap px-3 py-1.5 text-start font-mono text-[11px] font-semibold"
            :class="props.newCols?.includes(c) ? 'bg-(--ice) text-(--signal)' : props.dropCols?.includes(c) ? 'text-error line-through' : 'text-(--ink)'"
          >
            {{ c }}
          </th>
        </tr>
      </thead>
      <TransitionGroup
        tag="tbody"
        name="vis-row"
      >
        <tr
          v-for="(r, i) in props.rows"
          :key="String(r.__id ?? i)"
          class="border-b border-dashed border-(--line) last:border-b-0"
          :class="ROW[markOf(r) ?? ''] ?? ''"
        >
          <td class="w-1 p-0">
            <span
              class="block h-full min-h-7 w-1"
              :class="BAR[markOf(r) ?? ''] ?? ''"
            />
          </td>
          <td
            v-for="c in cols"
            :key="c"
            class="whitespace-nowrap px-3 py-1.5 tabular-nums"
            :class="[props.newCols?.includes(c) ? 'bg-(--ice)/60 font-semibold' : '', props.dropCols?.includes(c) ? 'opacity-30' : '', r[c] === null || r[c] === undefined ? 'italic text-(--ink2)' : '']"
          >
            {{ props.dropCols?.includes(c) ? '—' : fmt(r[c] ?? null) }}
          </td>
        </tr>
      </TransitionGroup>
      <tbody v-if="!props.rows.length">
        <tr>
          <td
            :colspan="cols.length + 1"
            class="px-3 py-4 text-center text-(--ink2)"
          >
            {{ t('vis.noRows') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.vis-row-enter-active,
.vis-row-leave-active,
.vis-row-move {
  transition: all 0.35s ease;
}
.vis-row-enter-from,
.vis-row-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.vis-row-leave-active {
  position: absolute;
}
@media (prefers-reduced-motion: reduce) {
  .vis-row-enter-active,
  .vis-row-leave-active,
  .vis-row-move {
    transition: none;
  }
}
</style>
