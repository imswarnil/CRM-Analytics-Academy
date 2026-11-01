<script setup lang="ts">
/**
 * One step of a visualiser as a motion graphic: data flows through a node.
 *
 *   INPUT table ──packets──▶ [ NODE ] ──packets──▶ OUTPUT table
 *                              │
 *                              └─ bin: rows and columns it dropped
 *
 * Four phases replay whenever `stepKey` changes:
 *   in       the input is on screen, marked (rows a filter will drop are red)
 *   flow     each row leaves as a packet and travels into the node; columns
 *            the node drops are struck through and fold away
 *   process  the node works: spinner, a counter and a progress bar; dropped
 *            rows fall into the bin underneath
 *   out      packets leave for the output, whose rows land one by one, new
 *            columns lit
 *
 * Tables show at most COLS columns (the ones the step is about first) and ROWS
 * rows, so the stage never gets crowded. Groups (SAQL group / cogroup) render
 * as stacked buckets instead of a table. Reduced motion jumps to `out`.
 */
import { type Row, columnsOf, fmt } from '~/utils/vis/data'

export interface FlowGroup {
  key: string
  rows: Row[]
  /** A cogroup key the join throws away. */
  dropped?: boolean
  /** A second side (cogroup b). */
  b?: Row[]
}

const props = withDefaults(defineProps<{
  stepKey: string
  op: string
  icon: string
  detail?: string
  input?: Row[]
  inputGroups?: FlowGroup[]
  inputLabel?: string
  side?: Row[]
  sideLabel?: string
  /** A source node: no input table, a dataset tile instead. */
  source?: string
  output?: Row[]
  outputGroups?: FlowGroup[]
  outputLabel?: string
  marks?: Record<string, string>
  newCols?: string[]
  dropCols?: string[]
  /** Columns the operation reads (filter field, keys, group by) — shown first. */
  focus?: string[]
  error?: boolean
}>(), { input: () => [], output: () => [], detail: '', inputLabel: '', sideLabel: '', outputLabel: '', source: '', focus: () => [], error: false })
const { t } = useI18n()

const COLS = 5
const ROWS = 8
const TITLE = ['Name', 'Account', 'AccountId', 'StageName', 'Region', 'Id']

/* --- Timeline ------------------------------------------------------------------ */
type Phase = 'in' | 'flow' | 'process' | 'out'
const phase = ref<Phase>('out')
const processed = ref(0)
const at = (p: Phase) => ['in', 'flow', 'process', 'out'].indexOf(phase.value) >= ['in', 'flow', 'process', 'out'].indexOf(p)
let timers: ReturnType<typeof setTimeout>[] = []
let raf = 0
const clear = () => {
  timers.forEach(clearTimeout)
  timers = []
  cancelAnimationFrame(raf)
}

const inCount = computed(() => (props.inputGroups?.length ? props.inputGroups.reduce((s, g) => s + g.rows.length, 0) : props.input.length + (props.side?.length ?? 0)) || props.output.length)
const packetsIn = computed(() => Math.min(inCount.value, 12))
const FLOW_MS = computed(() => 900 + packetsIn.value * 70)
const PROCESS_MS = computed(() => 1100 + (droppedRows.value.length || dropped.value.length ? 500 : 0))

function play() {
  clear()
  if (import.meta.server || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    phase.value = 'out'
    processed.value = inCount.value
    return
  }
  phase.value = 'in'
  processed.value = 0
  timers.push(setTimeout(() => (phase.value = 'flow'), 650))
  timers.push(setTimeout(() => {
    phase.value = 'process'
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / (PROCESS_MS.value - 150))
      processed.value = Math.round(k * inCount.value)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }, 650 + FLOW_MS.value))
  timers.push(setTimeout(() => (phase.value = 'out'), 650 + FLOW_MS.value + PROCESS_MS.value))
}
watch(() => props.stepKey, play)
onMounted(play)
onBeforeUnmount(clear)

/* --- What to show -------------------------------------------------------------- */
function pick(all: string[], first: string[]) {
  const title = TITLE.find(k => all.includes(k))
  const order = [...new Set([...(title ? [title] : []), ...first.filter(k => all.includes(k)), ...all])]
  return order.slice(0, Math.max(COLS, first.filter(k => all.includes(k)).length + 1))
}
const inAll = computed(() => columnsOf(props.input))
const outAll = computed(() => columnsOf(props.output))
/** Columns the node removes: given, or (for a row-preserving step) the input columns the output lost. */
const dropped = computed(() => {
  if (props.dropCols?.length) return props.dropCols
  if (!props.input.length || !props.output.length || props.inputGroups?.length) return []
  const ids = new Set(props.input.map(r => String(r.__id)))
  if (!props.output.every(r => ids.has(String(r.__id)))) return []
  return inAll.value.filter(c => !outAll.value.includes(c))
})
const lit = computed(() => {
  const n = (props.newCols ?? []).filter(c => outAll.value.includes(c))
  // A projection makes every column "new": then nothing stands out.
  return n.length < outAll.value.length ? n : []
})
const inCols = computed(() => pick(inAll.value, [...dropped.value, ...props.focus]))
const outCols = computed(() => pick(outAll.value, [...lit.value, ...props.focus]))
const sideCols = computed(() => pick(columnsOf(props.side ?? []), props.focus).slice(0, 3))

const markOf = (r: Row) => props.marks?.[String(r.__id)] ?? ''
const droppedRows = computed(() => props.input.filter(r => markOf(r) === 'dropped'))
const droppedGroups = computed(() => (props.outputGroups ?? []).filter(g => g.dropped))
const binCount = computed(() => droppedRows.value.length + droppedGroups.value.length)

const titleOf = (r: Row) => {
  const k = TITLE.find(c => r[c] !== undefined && r[c] !== null) ?? Object.keys(r).find(c => !c.startsWith('__'))
  return k ? fmt(r[k] ?? null) : '—'
}
const TONE: Record<string, string> = { kept: 'bg-(--signal)', matched: 'bg-(--signal)', dropped: 'bg-error', unmatched: 'bg-warning', fanout: 'bg-(--glow)', multi: 'bg-(--glow)' }
const ROW: Record<string, string> = { dropped: 'bg-error/10 text-(--ink2)', unmatched: 'bg-warning/15', fanout: 'bg-(--glow)/20', multi: 'bg-(--glow)/20' }
const packetTone = (i: number) => {
  if (props.input[i]) return 'bg-(--ink)'
  return i - props.input.length >= 0 && props.side?.length ? 'bg-(--glow)' : 'bg-(--ink)'
}
const outPackets = computed(() => Math.min((props.outputGroups?.length ?? props.output.length), 12))
const outCount = computed(() => props.outputGroups ? props.outputGroups.filter(g => !g.dropped).length : props.output.length)
</script>

<template>
  <div
    class="vis-flow grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_3.5rem_13rem_3.5rem_minmax(0,1fr)] lg:gap-0"
    :data-phase="phase"
  >
    <!-- INPUT -->
    <section class="min-w-0 self-start">
      <p class="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.12em] text-(--ink2)">
        <span class="bg-(--ink) px-1.5 py-px text-(--paper)">{{ props.source ? t('vis.flow.source') : t('vis.flow.input') }}</span>
        <span class="truncate">{{ props.inputLabel }}</span>
        <span class="ms-auto tabular-nums">{{ props.inputGroups?.length ? t('vis.flow.groups', { n: props.inputGroups.length }) : t('vis.rowsIn', { n: props.source ? inCount : props.input.length }) }}</span>
      </p>

      <div
        v-if="props.source"
        class="flex items-center gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4 shadow-[4px_4px_0_var(--ink)]"
      >
        <UIcon
          name="i-lucide-database"
          class="size-10 shrink-0 text-(--signal)"
          :class="phase === 'flow' ? 'vis-throb' : ''"
        />
        <div class="min-w-0">
          <p class="truncate text-lg font-extrabold text-(--ink)">
            {{ props.source }}
          </p>
          <p class="font-mono text-xs text-(--ink2)">
            {{ t('vis.rowsIn', { n: inCount }) }} · {{ outAll.length }} col
          </p>
        </div>
      </div>

      <div
        v-else-if="props.inputGroups?.length"
        class="space-y-1.5"
      >
        <div
          v-for="(g, gi) in props.inputGroups.slice(0, ROWS)"
          :key="g.key"
          class="vis-sent flex items-center gap-2 border-[1.5px] border-(--ink) bg-(--card) px-2 py-1 font-mono text-xs"
          :style="{ '--i': gi }"
        >
          <b class="truncate text-(--ink)">{{ g.key }}</b>
          <span class="ms-auto shrink-0 text-(--ink2)">{{ g.rows.length }}<template v-if="g.b"> · {{ g.b.length }}</template></span>
        </div>
      </div>

      <template v-else>
        <div class="overflow-hidden border-[1.5px] border-(--ink) bg-(--card) shadow-[4px_4px_0_var(--ink)]">
          <table class="w-full border-collapse text-[12.5px]">
            <thead>
              <tr class="border-b-[1.5px] border-(--ink) bg-(--ice)">
                <th class="w-1 p-0" />
                <th
                  v-for="c in inCols"
                  :key="c"
                  class="p-0 text-start font-mono text-[10.5px] font-semibold"
                >
                  <div
                    class="vis-cell truncate"
                    :class="[dropped.includes(c) ? 'text-error' : props.focus.includes(c) ? 'text-(--signal)' : 'text-(--ink)', dropped.includes(c) && at('flow') ? 'vis-fold line-through' : '']"
                  >
                    {{ c }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in props.input.slice(0, ROWS)"
                :key="String(r.__id ?? i)"
                class="border-b border-dashed border-(--line) last:border-b-0"
                :class="[at('process') ? ROW[markOf(r)] ?? '' : '', at('flow') ? 'vis-sent' : '', markOf(r) === 'dropped' && at('process') ? 'line-through decoration-error/70' : '']"
                :style="{ '--i': i }"
              >
                <td class="w-1 p-0">
                  <span
                    class="block h-full min-h-6 w-1 transition-colors duration-300"
                    :class="at('process') ? TONE[markOf(r)] ?? '' : ''"
                  />
                </td>
                <td
                  v-for="c in inCols"
                  :key="c"
                  class="p-0 tabular-nums"
                  :class="r[c] === null || r[c] === undefined ? 'italic text-(--ink2)' : ''"
                >
                  <div
                    class="vis-cell truncate"
                    :class="[dropped.includes(c) && at('flow') ? 'vis-fold' : '', props.focus.includes(c) ? 'font-semibold' : '']"
                  >
                    {{ fmt(r[c] ?? null) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="props.input.length > ROWS"
            class="border-t border-dashed border-(--line) px-2 py-1 font-mono text-[10.5px] text-(--ink2)"
          >
            {{ t('vis.flow.more', { n: props.input.length - ROWS }) }}
          </p>
        </div>

        <div
          v-if="props.side?.length"
          class="mt-3 overflow-hidden border-[1.5px] border-dashed border-(--ink) bg-(--card)"
        >
          <p class="flex items-center gap-2 border-b border-dashed border-(--ink) bg-(--glow)/15 px-2 py-1 font-mono text-[10.5px] uppercase tracking-[.1em] text-(--ink2)">
            {{ t('vis.flow.lookup') }} · {{ props.sideLabel }}
            <span class="ms-auto tabular-nums">{{ t('vis.rowsIn', { n: props.side.length }) }}</span>
          </p>
          <table class="w-full border-collapse text-[11.5px]">
            <tr
              v-for="(r, i) in props.side.slice(0, 5)"
              :key="String(r.__id ?? i)"
              class="border-b border-dashed border-(--line) last:border-b-0"
              :class="at('flow') ? 'vis-sent' : ''"
              :style="{ '--i': i + 3 }"
            >
              <td
                v-for="c in sideCols"
                :key="c"
                class="p-0"
              >
                <div class="vis-cell truncate">
                  {{ fmt(r[c] ?? null) }}
                </div>
              </td>
            </tr>
          </table>
        </div>
      </template>
    </section>

    <!-- TRACK IN -->
    <div
      class="vis-track relative h-10 max-lg:hidden"
      aria-hidden="true"
    >
      <span class="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-(--ink2)" />
      <template v-if="phase === 'flow'">
        <span
          v-for="i in packetsIn"
          :key="i"
          class="vis-packet absolute top-1/2 size-2.5"
          :class="packetTone(i - 1)"
          :style="{ '--i': i - 1, '--y': `${((i - 1) % 3) - 1}` }"
        />
      </template>
    </div>

    <!-- NODE -->
    <section class="relative flex flex-col items-center">
      <div
        class="vis-node w-full max-w-[13rem] border-[2px] p-3 text-center shadow-[5px_5px_0_var(--ink)] transition-colors duration-300"
        :class="props.error ? 'border-error bg-error/10' : phase === 'process' ? 'vis-node--busy border-(--signal) bg-(--signal) text-white' : phase === 'out' ? 'border-(--ink) bg-(--card)' : 'border-(--ink) bg-(--card)'"
      >
        <UIcon
          :name="props.error ? 'i-lucide-octagon-x' : phase === 'process' ? 'i-lucide-loader-circle' : phase === 'out' ? 'i-lucide-circle-check' : props.icon"
          class="mx-auto size-8"
          :class="props.error ? 'text-error' : phase === 'process' ? 'animate-spin' : phase === 'out' ? 'text-(--signal)' : 'text-(--ink)'"
        />
        <p
          class="mt-1.5 font-mono text-[13px] font-black uppercase tracking-[.06em]"
          :class="phase === 'process' && !props.error ? 'text-white' : 'text-(--ink)'"
        >
          {{ props.op }}
        </p>
        <p
          v-if="props.detail"
          class="mt-0.5 break-words font-mono text-[10.5px] leading-snug"
          :class="phase === 'process' && !props.error ? 'text-white/85' : 'text-(--ink2)'"
        >
          {{ props.detail }}
        </p>
        <div
          class="mt-2.5 h-1.5 overflow-hidden border border-current/40"
          :class="phase === 'process' ? 'text-white' : 'text-(--ink2)'"
        >
          <div
            class="h-full bg-current transition-[width] duration-150"
            :style="{ width: `${phase === 'out' ? 100 : inCount ? (processed / inCount) * 100 : 0}%` }"
          />
        </div>
        <p
          class="mt-1 font-mono text-[10.5px] tabular-nums"
          :class="phase === 'process' && !props.error ? 'text-white' : 'text-(--ink2)'"
        >
          {{ props.error ? '✕' : phase === 'process' ? t('vis.flow.processing', { n: processed, total: inCount }) : phase === 'out' ? t('vis.flow.done') : phase === 'flow' ? t('vis.flow.waiting') : t('vis.flow.queued') }}
        </p>
      </div>

      <!-- The bin: what the node threw away -->
      <div
        v-if="(binCount || dropped.length) && at('process')"
        class="vis-bin mt-3 w-full max-w-[13rem] border-[1.5px] border-dashed border-error bg-error/5 px-2 py-1.5"
      >
        <div class="flex flex-wrap justify-center gap-1">
          <span
            v-for="(r, i) in droppedRows.slice(0, 8)"
            :key="String(r.__id)"
            class="vis-fall max-w-full truncate bg-error px-1.5 py-px font-mono text-[10px] text-white"
            :style="{ '--i': i }"
          >{{ titleOf(r) }}</span>
          <span
            v-for="(g, i) in droppedGroups.slice(0, 8)"
            :key="g.key"
            class="vis-fall bg-error px-1.5 py-px font-mono text-[10px] text-white"
            :style="{ '--i': i }"
          >{{ g.key }}</span>
          <span
            v-for="(c, i) in dropped"
            :key="c"
            class="vis-fall border border-error px-1.5 py-px font-mono text-[10px] text-error line-through"
            :style="{ '--i': i + droppedRows.length }"
          >{{ c }}</span>
        </div>
        <p class="mt-1 text-center font-mono text-[10px] uppercase tracking-[.1em] text-error">
          <template v-if="binCount">
            {{ t('vis.flow.droppedRows', { n: binCount }) }}
          </template>
          <template v-if="binCount && dropped.length">
            ·
          </template>
          <template v-if="dropped.length">
            {{ t('vis.flow.droppedCols', { n: dropped.length }) }}
          </template>
        </p>
      </div>
    </section>

    <!-- TRACK OUT -->
    <div
      class="vis-track relative h-10 max-lg:hidden"
      aria-hidden="true"
    >
      <span class="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-(--ink2)" />
      <template v-if="phase === 'out' && !props.error">
        <span
          v-for="i in outPackets"
          :key="i"
          class="vis-packet vis-packet--out absolute top-1/2 size-2.5 bg-(--signal)"
          :style="{ '--i': i - 1, '--y': `${((i - 1) % 3) - 1}` }"
        />
      </template>
    </div>

    <!-- OUTPUT -->
    <section class="min-w-0 self-start">
      <p class="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.12em] text-(--ink2)">
        <span class="bg-(--signal) px-1.5 py-px text-white">{{ t('vis.flow.output') }}</span>
        <span class="truncate">{{ props.outputLabel }}</span>
        <span
          v-if="phase === 'out' && lit.length"
          class="text-(--signal)"
        >{{ t('vis.flow.newCols', { n: lit.length }) }}</span>
        <span class="ms-auto tabular-nums text-(--signal)">{{ phase === 'out' ? (props.outputGroups ? t('vis.flow.groups', { n: outCount }) : t('vis.rowsOut', { n: outCount })) : '…' }}</span>
      </p>

      <div
        v-if="phase !== 'out' || props.error"
        class="flex min-h-40 flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-(--ink2) bg-(--card)/60 p-4 text-(--ink2)"
      >
        <div class="w-full space-y-1.5 opacity-40">
          <div
            v-for="i in 4"
            :key="i"
            class="vis-skel h-3 bg-(--line)"
            :style="{ 'width': `${90 - i * 12}%`, '--i': i }"
          />
        </div>
        <p class="font-mono text-[11px] uppercase tracking-[.12em]">
          {{ props.error ? '—' : t('vis.flow.waiting') }}
        </p>
      </div>

      <div
        v-else-if="props.outputGroups"
        class="space-y-1.5"
      >
        <div
          v-for="(g, gi) in props.outputGroups.filter(x => !x.dropped).slice(0, ROWS)"
          :key="g.key"
          class="vis-land border-[1.5px] border-(--ink) bg-(--card) px-2 py-1.5 shadow-[3px_3px_0_var(--ink)]"
          :style="{ '--i': gi }"
        >
          <p class="flex items-center gap-2 font-mono text-xs">
            <b class="truncate text-(--ink)">{{ g.key }}</b>
            <span class="ms-auto shrink-0 text-(--ink2)">{{ g.rows.length }}<template v-if="g.b"> · {{ g.b.length }}</template></span>
          </p>
          <div class="mt-1 flex flex-wrap gap-1">
            <span
              v-for="(r, ri) in [...g.rows, ...(g.b ?? [])].slice(0, 4)"
              :key="ri"
              class="max-w-[9rem] truncate bg-(--ice) px-1.5 py-px font-mono text-[10px] text-(--ink)"
            >{{ titleOf(r) }}</span>
          </div>
        </div>
        <p
          v-if="outCount > ROWS"
          class="font-mono text-[10.5px] text-(--ink2)"
        >
          {{ t('vis.flow.more', { n: outCount - ROWS }) }}
        </p>
      </div>

      <div
        v-else
        class="overflow-hidden border-[1.5px] border-(--signal) bg-(--card) shadow-[4px_4px_0_var(--signal)]"
      >
        <table class="w-full border-collapse text-[12.5px]">
          <thead>
            <tr class="border-b-[1.5px] border-(--ink) bg-(--ice)">
              <th
                v-for="c in outCols"
                :key="c"
                class="p-0 text-start font-mono text-[10.5px] font-semibold"
              >
                <div
                  class="vis-cell truncate"
                  :class="lit.includes(c) ? 'vis-glow text-(--signal)' : 'text-(--ink)'"
                >
                  {{ c }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in props.output.slice(0, ROWS)"
              :key="String(r.__id ?? i)"
              class="vis-land border-b border-dashed border-(--line) last:border-b-0"
              :style="{ '--i': i }"
            >
              <td
                v-for="c in outCols"
                :key="c"
                class="p-0 tabular-nums"
                :class="[lit.includes(c) ? 'bg-(--ice)/60 font-semibold' : '', r[c] === null || r[c] === undefined ? 'italic text-(--ink2)' : '']"
              >
                <div class="vis-cell truncate">
                  {{ fmt(r[c] ?? null) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!props.output.length"
          class="px-3 py-4 text-center text-sm text-(--ink2)"
        >
          {{ t('vis.noRows') }}
        </p>
        <p
          v-if="props.output.length > ROWS"
          class="border-t border-dashed border-(--line) px-2 py-1 font-mono text-[10.5px] text-(--ink2)"
        >
          {{ t('vis.flow.more', { n: props.output.length - ROWS }) }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vis-cell {
  max-width: 11rem;
  padding: 0.3rem 0.55rem;
  white-space: nowrap;
}
/* A dropped column folds away: narrower, then gone. */
.vis-fold {
  animation: fold 0.8s 0.25s cubic-bezier(0.6, 0, 0.4, 1) forwards;
}
@keyframes fold {
  40% { opacity: 0.5; max-width: 11rem; }
  to { opacity: 0; max-width: 0; padding-inline: 0; }
}
/* A row leaves the input: a flash as its packet sets off. */
.vis-sent {
  animation: sent 0.5s calc(var(--i, 0) * 70ms) ease-out both;
}
@keyframes sent {
  30% { background: color-mix(in srgb, var(--signal) 22%, transparent); }
}
.vis-packet {
  left: 0;
  margin-top: calc(-0.3125rem + var(--y, 0) * 9px);
  opacity: 0;
  animation: travel 0.85s calc(var(--i, 0) * 70ms) cubic-bezier(0.45, 0, 0.3, 1) forwards;
}
.vis-packet--out {
  animation-duration: 0.6s;
  animation-delay: calc(var(--i, 0) * 50ms);
}
@keyframes travel {
  0% { left: 0; opacity: 0; transform: scale(0.4); }
  15% { opacity: 1; transform: scale(1); }
  85% { opacity: 1; }
  100% { left: calc(100% - 0.625rem); opacity: 0; transform: scale(0.6); }
}
.vis-node--busy {
  animation: busy 0.9s ease-in-out infinite;
}
@keyframes busy {
  50% { box-shadow: 2px 2px 0 var(--ink); transform: translate(3px, 3px); }
}
.vis-bin {
  animation: bin 0.3s ease-out both;
}
@keyframes bin {
  from { opacity: 0; transform: translateY(-6px); }
}
.vis-fall {
  animation: fall 0.6s calc(var(--i, 0) * 90ms + 0.15s) cubic-bezier(0.5, 0, 0.75, 0.3) both;
}
@keyframes fall {
  from { opacity: 0; transform: translateY(-48px) rotate(-10deg); }
  70% { transform: translateY(3px) rotate(4deg); }
}
.vis-land {
  animation: land 0.45s calc(var(--i, 0) * 75ms + 0.35s) cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
@keyframes land {
  from { opacity: 0; transform: translateX(-18px); }
}
.vis-glow {
  animation: glow 1.4s 0.4s ease-out both;
}
@keyframes glow {
  from { background: var(--signal); color: white; }
}
.vis-skel {
  animation: skel 1.2s calc(var(--i, 0) * 120ms) ease-in-out infinite;
}
@keyframes skel {
  50% { opacity: 0.35; }
}
.vis-throb {
  animation: throb 0.6s ease-in-out infinite;
}
@keyframes throb {
  50% { transform: scale(1.12); }
}
@media (prefers-reduced-motion: reduce) {
  .vis-fold, .vis-sent, .vis-packet, .vis-node--busy, .vis-bin, .vis-fall, .vis-land, .vis-glow, .vis-skel, .vis-throb { animation: none; }
  .vis-fold { max-width: 0; opacity: 0; padding-inline: 0; }
}
</style>
