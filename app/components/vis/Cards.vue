<script setup lang="ts">
/**
 * Rows as cards on a visualiser's stage, animated like a motion graphic: new
 * rows pop in, rows that leave fall away, the rest glide to their new place
 * (FLIP, by each row's __id). Marks colour a card — kept, dropped (struck
 * through), unmatched, fanned out — and new columns are lit. A card shows the
 * row's name and up to `max` fields, new ones first, so it stays readable.
 */
import { type Row, fmt } from '~/utils/vis/data'

const props = withDefaults(defineProps<{
  rows: Row[]
  marks?: Record<string, string>
  newCols?: string[]
  dropCols?: string[]
  max?: number
  dense?: boolean
}>(), { max: 6, dense: false })

const TITLE = ['Name', 'Account', 'AccountId', 'StageName', 'Region', 'Id']
function view(r: Row) {
  const keys = Object.keys(r).filter(k => !k.startsWith('__'))
  const titleKey = TITLE.find(k => keys.includes(k) && r[k] !== null) ?? keys[0]
  // When every column is new (a projection), nothing stands out — so nothing is lit.
  const lit = (props.newCols ?? []).filter(k => keys.includes(k))
  const fresh = lit.length < keys.length - 1 ? lit : []
  const rest = keys.filter(k => k !== titleKey && !fresh.includes(k))
  const fields = [...fresh, ...rest].slice(0, props.max).map(k => ({
    k,
    v: props.dropCols?.includes(k) ? '—' : fmt(r[k] ?? null),
    isNew: fresh.includes(k),
    isNull: r[k] === null || r[k] === undefined,
    dropped: props.dropCols?.includes(k)
  }))
  return { title: titleKey ? fmt(r[titleKey] ?? null) : '—', titleKey, fields, more: Math.max(0, fresh.length + rest.length - props.max) }
}
// Few rows get big cards; many get compact ones, so any step fits the stage.
const size = computed(() => (props.dense ? 'sm' : props.rows.length <= 6 ? 'lg' : props.rows.length <= 12 ? 'md' : 'sm'))
const GRID = { lg: 'grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3', md: 'grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-2.5', sm: 'grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2' }
const cards = computed(() => props.rows.map((r, i) => ({ key: String(r.__id ?? i), mark: props.marks?.[String(r.__id)] ?? '', ...view(r) })))
const MARK: Record<string, string> = {
  dropped: 'vis-card--dropped border-error bg-error/10',
  unmatched: 'border-warning bg-warning/15',
  fanout: 'border-(--glow) bg-(--glow)/20',
  multi: 'border-(--glow) bg-(--glow)/20',
  kept: 'border-(--signal)',
  matched: 'border-(--signal)'
}
</script>

<template>
  <TransitionGroup
    tag="ul"
    name="vis-card"
    class="vis-cards relative grid content-start"
    :class="GRID[size]"
  >
    <li
      v-for="(c, i) in cards"
      :key="c.key"
      class="vis-card border-[1.5px] bg-(--card) shadow-[3px_3px_0_var(--ink)]"
      :data-size="size"
      :class="MARK[c.mark] ?? 'border-(--ink)'"
      :style="{ '--i': i }"
    >
      <p
        class="vis-card__title truncate font-bold text-(--ink)"
        :title="c.title"
      >
        {{ c.title }}
      </p>
      <dl class="vis-card__fields mt-1 space-y-px font-mono leading-tight">
        <div
          v-for="f in c.fields"
          :key="f.k"
          class="flex gap-1.5"
          :class="f.isNew ? 'vis-new bg-(--ice) text-(--signal)' : ''"
        >
          <dt
            class="w-[45%] shrink-0 truncate text-(--ink2)"
            :class="f.dropped ? 'line-through' : ''"
          >
            {{ f.k }}
          </dt>
          <dd
            class="min-w-0 truncate"
            :class="f.isNull ? 'italic text-(--ink2)' : 'text-(--ink)'"
          >
            {{ f.v }}
          </dd>
        </div>
        <p
          v-if="c.more"
          class="text-(--ink2)"
        >
          +{{ c.more }}
        </p>
      </dl>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.vis-card { padding: 0.5rem; }
.vis-card__title { font-size: 13px; }
.vis-card__fields { font-size: 10.5px; }
.vis-card[data-size='lg'] { padding: 0.85rem 1rem; box-shadow: 5px 5px 0 var(--ink); }
.vis-card[data-size='lg'] .vis-card__title { font-size: 17px; }
.vis-card[data-size='lg'] .vis-card__fields { font-size: 12.5px; margin-top: 0.4rem; }
.vis-card[data-size='lg'] .vis-card__fields > div { padding: 1px 0; }
.vis-card[data-size='md'] { padding: 0.6rem 0.7rem; }
.vis-card[data-size='md'] .vis-card__title { font-size: 14.5px; }
.vis-card[data-size='md'] .vis-card__fields { font-size: 11.5px; }
.vis-card-move {
  transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1);
}
.vis-card-enter-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.3, 1.5, 0.5, 1);
  transition-delay: calc(var(--i, 0) * 35ms);
}
.vis-card-enter-from {
  opacity: 0;
  transform: scale(0.6) translateY(10px);
}
.vis-card-leave-active {
  position: absolute;
  transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.5, 0, 0.8, 0.4);
}
.vis-card-leave-to {
  opacity: 0;
  transform: translateY(70px) rotate(-8deg) scale(0.85);
}
.vis-card--dropped {
  text-decoration: line-through;
  text-decoration-color: rgb(220 38 38 / 0.7);
  animation: shake 0.45s ease-in-out 1;
}
.vis-new {
  animation: glow 1.2s ease-out 1;
}
@keyframes shake {
  25% { transform: translateX(-3px) rotate(-1deg); }
  75% { transform: translateX(3px) rotate(1deg); }
}
@keyframes glow {
  from { background: var(--signal); color: white; }
}
@media (prefers-reduced-motion: reduce) {
  .vis-card-move, .vis-card-enter-active, .vis-card-leave-active { transition: none; }
  .vis-card--dropped, .vis-new { animation: none; }
}
</style>
