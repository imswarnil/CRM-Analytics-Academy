<script setup lang="ts">
/**
 * A pipeline on an infinite canvas, filmed by a camera.
 *
 * Every node of the pipeline sits on a dark dotted board, in columns by depth
 * (sources as late as they can be, so they sit next to what reads them). Each
 * step the camera works like a motion graphic:
 *
 *   move     glides to frame the step's node and the nodes it reads
 *   flow     rows leave the inputs as glowing packets along the wires
 *   process  the node works (spinner, a row counter); rows it throws away go
 *            red in the input and fly off it, columns it removes fold away
 *   out      the camera pushes in on the node and its result lands under it
 *
 * Tables are small on purpose — ROWS rows, COLS columns, the ones the step is
 * about first. Drag to look around, scroll to zoom; the next step recentres.
 * The board keeps its own palette (it reads the same in light and dark).
 */
import { type Row, columnsOf, fmt } from '~/utils/vis/data'

export interface CanvasGroup {
  key: string
  rows: Row[]
  b?: Row[]
  dropped?: boolean
}
export interface CanvasNode {
  id: string
  /** The node's own name (recipe node id, dataflow node, dataset). */
  name: string
  /** The operation: Filter, Lookup join, group by… */
  label: string
  detail?: string
  icon: string
  /** Colours the node: source, filter, transform, join, append, aggregate, drop, sort, output. */
  kind: string
  inputs: string[]
  order: number
  rows?: Row[]
  groups?: CanvasGroup[]
  error?: boolean
}

const props = withDefaults(defineProps<{
  nodes: CanvasNode[]
  active: string
  stepKey: string
  marks?: Record<string, string>
  newCols?: string[]
  dropCols?: string[]
  focus?: string[]
}>(), { focus: () => [] })
const emit = defineEmits<{ select: [id: string] }>()
const { t } = useI18n()

const W = 250
const H = 96
const TW = 330
const GAP = 18
const COLW = 450
const ROWH = 370
const ROWS = 5
const COLS = 4
const TITLE = ['Name', 'Account', 'StageName', 'Region', 'AccountId', 'Id']
const KIND: Record<string, string> = {
  source: '#60a5fa', filter: '#fbbf24', transform: '#a78bfa', join: '#34d399', append: '#2dd4bf',
  aggregate: '#f472b6', drop: '#fb7185', sort: '#7dd3fc', output: '#22d3ee'
}
const colorOf = (n?: CanvasNode) => KIND[n?.kind ?? ''] ?? '#94a3b8'

/* --- Layout -------------------------------------------------------------------- */
const byId = computed(() => new Map(props.nodes.map(n => [n.id, n])))
const node = (id?: string) => (id ? byId.value.get(id) : undefined)
const pos = computed(() => {
  const depth: Record<string, number> = {}
  const d = (id: string, seen = new Set<string>()): number => {
    if (id in depth) return depth[id]!
    if (seen.has(id)) return 0
    seen.add(id)
    const n = node(id)
    const ins = (n?.inputs ?? []).filter(i => byId.value.has(i))
    return (depth[id] = ins.length ? Math.max(...ins.map(i => d(i, seen))) + 1 : 0)
  }
  props.nodes.forEach(n => d(n.id))
  // Sources as late as possible: right before the first node that reads them.
  for (const n of props.nodes) {
    if (n.inputs.length) continue
    const readers = props.nodes.filter(m => m.inputs.includes(n.id)).map(m => depth[m.id]!)
    if (readers.length) depth[n.id] = Math.min(...readers) - 1
  }
  const cols: Record<number, CanvasNode[]> = {}
  for (const n of [...props.nodes].sort((a, b) => a.order - b.order)) (cols[depth[n.id]!] ??= []).push(n)
  const out: Record<string, { x: number, y: number }> = {}
  for (const [c, list] of Object.entries(cols)) list.forEach((n, i) => (out[n.id] = { x: Number(c) * COLW, y: i * ROWH }))
  return out
})
const world = computed(() => {
  const ps = Object.values(pos.value)
  return { w: Math.max(...ps.map(p => p.x), 0) + TW + 120, h: Math.max(...ps.map(p => p.y), 0) + ROWH }
})

/* --- Who is who this step ------------------------------------------------------------ */
const act = computed(() => node(props.active))
const actOrder = computed(() => act.value?.order ?? 0)
const inputIds = computed(() => (act.value?.inputs ?? []).filter(i => byId.value.has(i)))
const stateOf = (n: CanvasNode) => (n.id === props.active ? 'active' : n.order < actOrder.value ? 'done' : 'pending')
const involved = (id: string) => id === props.active || inputIds.value.includes(id)

/* --- Timeline ------------------------------------------------------------------- */
type Phase = 'move' | 'flow' | 'process' | 'out'
const PHASES: Phase[] = ['move', 'flow', 'process', 'out']
const phase = ref<Phase>('out')
const at = (p: Phase) => PHASES.indexOf(phase.value) >= PHASES.indexOf(p)
const processed = ref(0)
let timers: ReturnType<typeof setTimeout>[] = []
let raf = 0
const stop = () => {
  timers.forEach(clearTimeout)
  timers = []
  cancelAnimationFrame(raf)
}
const count = (n?: CanvasNode) => n?.groups?.length ?? n?.rows?.length ?? 0
const inCount = computed(() => inputIds.value.reduce((s, i) => s + count(node(i)), 0) || count(act.value))

/* Packets: glowing rows along the wires into the active node. */
const DUR = 1050
const packets = computed(() => edges.value.filter(e => e.to === props.active).flatMap((e, ei) => {
  const n = Math.min(Math.max(count(node(e.from)), 1), 6)
  return Array.from({ length: n }, (_, i) => ({ key: `${e.id}-${i}`, e, delay: ei * 90 + i * 150, color: colorOf(node(e.from)) }))
}))
const flowMs = computed(() => (packets.value.length ? Math.max(...packets.value.map(p => p.delay)) + DUR : 400))
const packetEls = ref<(SVGCircleElement | null)[]>([])
const packetRef = (i: number) => (el: unknown) => {
  packetEls.value[i] = el as SVGCircleElement | null
}
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
const bez = (p: { x: number, y: number }[], u: number) => {
  const v = 1 - u
  return { x: v ** 3 * p[0]!.x + 3 * v * v * u * p[1]!.x + 3 * v * u * u * p[2]!.x + u ** 3 * p[3]!.x, y: v ** 3 * p[0]!.y + 3 * v * v * u * p[1]!.y + 3 * v * u * u * p[2]!.y + u ** 3 * p[3]!.y }
}
function runPackets(start: number) {
  const tick = (now: number) => {
    let live = false
    packets.value.forEach((p, i) => {
      const el = packetEls.value[i]
      if (!el) return
      const k = (now - start - p.delay) / DUR
      if (k < 1) live = true
      const pt = bez(p.e.pts, ease(Math.min(Math.max(k, 0), 1)))
      el.setAttribute('cx', String(pt.x))
      el.setAttribute('cy', String(pt.y))
      el.setAttribute('opacity', k <= 0 || k >= 1 ? '0' : String(Math.min(1, k * 6, (1 - k) * 6)))
    })
    if (live) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

const droppedRows = computed(() => inputIds.value.flatMap(i => node(i)?.rows ?? []).filter(r => props.marks?.[String(r.__id)] === 'dropped'))
const PROCESS_MS = computed(() => 1300 + (droppedRows.value.length || dropped.value.length ? 500 : 0))

function play() {
  stop()
  manual.value = null
  if (import.meta.server || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    phase.value = 'out'
    processed.value = inCount.value
    return
  }
  phase.value = 'move'
  processed.value = 0
  const MOVE = 1000
  timers.push(setTimeout(() => {
    phase.value = 'flow'
    nextTick(() => runPackets(performance.now()))
  }, MOVE))
  timers.push(setTimeout(() => {
    cancelAnimationFrame(raf)
    phase.value = 'process'
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / (PROCESS_MS.value - 200))
      const n = Math.round(k * inCount.value)
      if (n !== processed.value) processed.value = n
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }, MOVE + flowMs.value))
  timers.push(setTimeout(() => (phase.value = 'out'), MOVE + flowMs.value + PROCESS_MS.value))
}
watch(() => props.stepKey, play)
onBeforeUnmount(stop)

/* --- Columns and rows ---------------------------------------------------------------- */
const dropped = computed(() => {
  if (props.dropCols?.length) return props.dropCols
  const a = act.value
  const src = node(a?.inputs[0])
  if (!a?.rows?.length || !src?.rows?.length || a.groups) return []
  const ids = new Set(src.rows.map(r => String(r.__id)))
  if (!a.rows.every(r => ids.has(String(r.__id)))) return []
  const outCols = columnsOf(a.rows)
  return columnsOf(src.rows).filter(c => !outCols.includes(c))
})
const lit = computed(() => {
  const all = columnsOf(act.value?.rows ?? [])
  const n = (props.newCols ?? []).filter(c => all.includes(c))
  return n.length < all.length ? n : []
})
function colsOf(n: CanvasNode) {
  const all = columnsOf(n.rows ?? [])
  const first = n.id === props.active ? [...lit.value, ...props.focus] : inputIds.value.includes(n.id) ? [...dropped.value, ...props.focus] : []
  const wanted = first.filter(k => all.includes(k))
  const title = TITLE.find(k => all.includes(k))
  const order = [...new Set([...(title ? [title] : []), ...wanted, ...all])]
  return order.slice(0, Math.max(COLS, Math.min(wanted.length + 1, 6)))
}
const markOf = (r: Row) => props.marks?.[String(r.__id)] ?? ''
const titleOf = (r: Row) => {
  const k = TITLE.find(c => r[c] !== undefined && r[c] !== null) ?? Object.keys(r).find(c => !c.startsWith('__'))
  return k ? fmt(r[k] ?? null) : '—'
}
const showTable = (n: CanvasNode) => !n.error && (stateOf(n) === 'done' || (stateOf(n) === 'active' && phase.value === 'out'))
const tableH = (n: CanvasNode) => (n.groups ? 44 + Math.min(n.groups.length, ROWS) * 36 + 24 : 44 + Math.min(n.rows?.length ?? 0, ROWS) * 29 + 26)

/* --- Camera ------------------------------------------------------------------- */
const viewport = ref<HTMLElement | null>(null)
const vw = ref(1100)
const vh = ref(560)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([e]) => {
    vw.value = e!.contentRect.width
    vh.value = e!.contentRect.height
  })
  if (viewport.value) ro.observe(viewport.value)
  play()
})
onBeforeUnmount(() => ro?.disconnect())

const auto = computed(() => {
  const out = phase.value === 'out'
  const ids = out && !act.value?.error ? [props.active] : [props.active, ...inputIds.value]
  const boxes = ids.map((id) => {
    const p = pos.value[id] ?? { x: 0, y: 0 }
    const n = node(id)!
    // Inputs are framed by their card plus the top of their table, so far-apart
    // inputs do not push the camera out to a speck.
    const table = n && (id !== props.active ? showTable(n) && inputIds.value.length < 2 : out && !n.error)
    return { x0: p.x, y0: p.y - 40, x1: p.x + (table ? TW : W), y1: p.y + H + (table ? GAP + tableH(n) : 30) }
  })
  const x0 = Math.min(...boxes.map(b => b.x0))
  const y0 = Math.min(...boxes.map(b => b.y0))
  const x1 = Math.max(...boxes.map(b => b.x1))
  const y1 = Math.max(...boxes.map(b => b.y1))
  const TOP = 64
  const pad = Math.min(80, vw.value * 0.06)
  const s = Math.min(1.12, Math.max(0.3, Math.min((vw.value - 2 * pad) / (x1 - x0), (vh.value - TOP - 2 * pad) / (y1 - y0))))
  return { tx: vw.value / 2 - ((x0 + x1) / 2) * s, ty: (vh.value + TOP) / 2 - ((y0 + y1) / 2) * s, s }
})
const manual = ref<{ tx: number, ty: number, s: number } | null>(null)
const cam = computed(() => manual.value ?? auto.value)
const dragging = ref(false)
let drag: { x: number, y: number, tx: number, ty: number, moved: number } | null = null
function down(e: PointerEvent) {
  if (e.button !== 0) return
  const c = cam.value
  drag = { x: e.clientX, y: e.clientY, tx: c.tx, ty: c.ty, moved: 0 }
}
function move(e: PointerEvent) {
  if (!drag) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy))
  if (drag.moved < 5) return
  if (!dragging.value) {
    dragging.value = true
    viewport.value?.setPointerCapture(e.pointerId)
  }
  manual.value = { tx: drag.tx + dx, ty: drag.ty + dy, s: cam.value.s }
}
function up() {
  setTimeout(() => (dragging.value = false))
  drag = null
}
function zoomAt(f: number, mx = vw.value / 2, my = vh.value / 2) {
  const c = cam.value
  const s = Math.min(2, Math.max(0.2, c.s * f))
  manual.value = { s, tx: mx - (mx - c.tx) * (s / c.s), ty: my - (my - c.ty) * (s / c.s) }
}
function wheel(e: WheelEvent) {
  const r = viewport.value!.getBoundingClientRect()
  zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top)
}
function pick(id: string) {
  if (!dragging.value) emit('select', id)
}

/* --- Wires ---------------------------------------------------------------------- */
const edges = computed(() => props.nodes.flatMap(n => n.inputs.filter(i => pos.value[i]).map((i) => {
  const a = pos.value[i]!
  const b = pos.value[n.id]!
  const p0 = { x: a.x + W, y: a.y + H / 2 }
  const p3 = { x: b.x, y: b.y + H / 2 }
  const dx = Math.max(70, (p3.x - p0.x) / 2)
  const pts = [p0, { x: p0.x + dx, y: p0.y }, { x: p3.x - dx, y: p3.y }, p3]
  const st = n.id === props.active ? 'live' : n.order < actOrder.value ? 'done' : 'pending'
  return { id: `${i}>${n.id}`, from: i, to: n.id, pts, d: `M${p0.x},${p0.y} C${pts[1]!.x},${pts[1]!.y} ${pts[2]!.x},${pts[2]!.y} ${p3.x},${p3.y}`, st, color: colorOf(node(i)) }
})))

/* What the node threw away, flying off it while it works. */
const ejected = computed(() => [
  ...droppedRows.value.slice(0, 4).map(r => ({ k: `r${r.__id}`, text: titleOf(r), col: false })),
  ...dropped.value.slice(0, 4).map(c => ({ k: `c${c}`, text: c, col: true }))
])
const badges = computed(() => {
  const b: { text: string, tone: string }[] = []
  if (droppedRows.value.length) b.push({ text: t('vis.flow.droppedRows', { n: droppedRows.value.length }), tone: 'bad' })
  if (dropped.value.length) b.push({ text: t('vis.flow.droppedCols', { n: dropped.value.length }), tone: 'bad' })
  if (lit.value.length) b.push({ text: t('vis.flow.newCols', { n: lit.value.length }), tone: 'good' })
  return b
})
</script>

<template>
  <div
    ref="viewport"
    class="cv absolute inset-0 select-none overflow-hidden"
    :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
    :data-phase="phase"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
    @wheel.prevent="wheel"
  >
    <!-- The world, moved by the camera -->
    <div
      class="cv-world absolute left-0 top-0 origin-top-left"
      :class="dragging || manual ? '' : 'cv-world--glide'"
      :style="{ width: `${world.w}px`, height: `${world.h}px`, transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }"
    >
      <svg
        class="pointer-events-none absolute left-0 top-0 overflow-visible"
        :width="world.w"
        :height="world.h"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="cv-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g
          v-for="e in edges"
          :key="e.id"
        >
          <path
            v-if="e.st === 'live'"
            :d="e.d"
            fill="none"
            :stroke="e.color"
            stroke-width="8"
            opacity="0.18"
            filter="url(#cv-glow)"
          />
          <path
            :d="e.d"
            fill="none"
            :stroke="e.st === 'pending' ? '#2a3550' : e.color"
            :stroke-width="e.st === 'live' ? 3 : 2"
            :stroke-dasharray="e.st === 'pending' ? '6 7' : e.st === 'live' && phase === 'flow' ? '2 10' : undefined"
            :class="e.st === 'live' && phase === 'flow' ? 'cv-march' : ''"
            :opacity="e.st === 'done' ? 0.55 : 1"
            stroke-linecap="round"
          />
        </g>
        <template v-if="phase === 'flow'">
          <circle
            v-for="(p, i) in packets"
            :key="p.key"
            :ref="packetRef(i)"
            r="7"
            :fill="p.color"
            opacity="0"
            style="filter: drop-shadow(0 0 6px currentColor)"
            :color="p.color"
          />
        </template>
      </svg>

      <div
        v-for="n in props.nodes"
        :key="n.id"
        class="absolute"
        :style="{ 'left': `${pos[n.id]?.x ?? 0}px`, 'top': `${pos[n.id]?.y ?? 0}px`, '--c': colorOf(n) }"
      >
        <!-- The node -->
        <button
          type="button"
          class="cv-node relative flex text-start"
          :class="[`cv-node--${stateOf(n)}`, stateOf(n) === 'active' && phase === 'process' ? 'cv-node--busy' : '', n.error && stateOf(n) === 'active' ? 'cv-node--error' : '', !involved(n.id) && stateOf(n) === 'done' ? 'opacity-60' : '']"
          :style="{ width: `${W}px`, height: `${H}px` }"
          @click="pick(n.id)"
        >
          <span class="cv-node__icon">
            <UIcon
              :name="stateOf(n) === 'active' && phase === 'process' ? 'i-lucide-loader-circle' : n.error && stateOf(n) === 'active' ? 'i-lucide-octagon-x' : n.icon"
              class="size-6"
              :class="stateOf(n) === 'active' && phase === 'process' ? 'animate-spin' : ''"
            />
          </span>
          <span class="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3">
            <span class="cv-node__label truncate">{{ n.label }}</span>
            <span class="truncate font-mono text-[11px] text-[#8b97b8]">{{ n.name }}</span>
            <span
              v-if="n.detail"
              class="truncate font-mono text-[11px] text-[#b6c2e2]"
              :title="n.detail"
            >{{ n.detail }}</span>
          </span>
          <span class="cv-node__order">{{ n.order }}</span>
          <!-- Progress, while it works -->
          <span
            v-if="stateOf(n) === 'active' && at('process') && !n.error"
            class="absolute inset-x-3 bottom-1.5 h-[3px] overflow-hidden rounded-full bg-white/10"
          >
            <span
              class="block h-full rounded-full bg-(--c) transition-[width] duration-150"
              :style="{ width: `${phase === 'out' ? 100 : inCount ? (processed / inCount) * 100 : 0}%` }"
            />
          </span>
        </button>

        <!-- Status line above the active node -->
        <p
          v-if="stateOf(n) === 'active'"
          class="cv-status absolute -top-8 left-0 whitespace-nowrap font-mono text-[12px]"
        >
          <span class="cv-dot" />
          {{ n.error ? '✕' : phase === 'process' ? t('vis.flow.processing', { n: processed, total: inCount }) : phase === 'out' ? t('vis.flow.done') : phase === 'flow' ? t('vis.flow.waiting') : t('vis.flow.queued') }}
        </p>

        <!-- Thrown away, flying off -->
        <template v-if="stateOf(n) === 'active' && phase === 'process'">
          <span
            v-for="(x, i) in ejected"
            :key="x.k"
            class="cv-eject absolute whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px]"
            :class="x.col ? 'border border-[#fb7185] text-[#fb7185] line-through' : 'bg-[#fb7185] text-[#1a0b10]'"
            :style="{ 'left': `${W - 30}px`, 'top': `${10 + i * 6}px`, '--i': i }"
          >{{ x.text }}</span>
        </template>

        <!-- Badges once it is done -->
        <div
          v-if="stateOf(n) === 'active' && phase === 'out' && badges.length"
          class="absolute -top-8 right-0 flex gap-1.5"
        >
          <span
            v-for="b in badges"
            :key="b.text"
            class="cv-badge rounded-full px-2 py-0.5 font-mono text-[11px]"
            :class="b.tone === 'bad' ? 'bg-[#fb7185]/15 text-[#fda4af]' : 'bg-[#34d399]/15 text-[#6ee7b7]'"
          >{{ b.text }}</span>
        </div>

        <!-- The node's rows -->
        <div
          v-if="showTable(n)"
          class="cv-table absolute overflow-hidden"
          :class="[stateOf(n) === 'active' ? 'cv-table--new' : '', !involved(n.id) ? 'opacity-50' : '']"
          :style="{ top: `${H + GAP}px`, width: `${TW}px` }"
        >
          <template v-if="n.groups">
            <p class="cv-table__head">
              {{ t('vis.flow.groups', { n: n.groups.filter(g => !g.dropped).length }) }}
            </p>
            <div
              v-for="(g, gi) in n.groups.filter(x => !x.dropped).slice(0, ROWS)"
              :key="g.key"
              class="cv-row flex items-center gap-2 px-3 py-1.5"
              :style="{ '--i': gi }"
            >
              <b class="max-w-[9rem] truncate text-[#e6ecff]">{{ g.key }}</b>
              <span class="flex min-w-0 flex-1 gap-1 overflow-hidden">
                <span
                  v-for="(r, ri) in [...g.rows, ...(g.b ?? [])].slice(0, 3)"
                  :key="ri"
                  class="h-2.5 w-2.5 shrink-0 rounded-full bg-(--c)"
                  :style="{ opacity: 0.45 + ri * 0.2 }"
                />
              </span>
              <span class="shrink-0 font-mono text-[11px] text-[#8b97b8]">{{ g.rows.length }}<template v-if="g.b"> · {{ g.b.length }}</template></span>
            </div>
          </template>
          <table
            v-else
            class="w-full border-collapse"
          >
            <thead>
              <tr>
                <th
                  v-for="c in colsOf(n)"
                  :key="c"
                  class="cv-th"
                >
                  <div
                    class="cv-cell truncate"
                    :class="[
                      n.id === props.active && lit.includes(c) ? 'cv-lit text-[#6ee7b7]' : '',
                      inputIds.includes(n.id) && dropped.includes(c) && at('flow') ? 'text-[#fb7185] line-through' : '',
                      inputIds.includes(n.id) && dropped.includes(c) && at('process') ? 'cv-fold' : '',
                      props.focus.includes(c) && involved(n.id) ? 'text-(--c)' : ''
                    ]"
                  >
                    {{ c }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in (n.rows ?? []).slice(0, ROWS)"
                :key="String(r.__id ?? i)"
                class="cv-row"
                :class="[
                  inputIds.includes(n.id) && at('process') && markOf(r) === 'dropped' ? 'cv-row--dropped' : '',
                  inputIds.includes(n.id) && at('process') && markOf(r) === 'unmatched' ? 'cv-row--warn' : '',
                  inputIds.includes(n.id) && at('process') && (markOf(r) === 'fanout' || markOf(r) === 'multi') ? 'cv-row--multi' : ''
                ]"
                :style="{ '--i': i }"
              >
                <td
                  v-for="c in colsOf(n)"
                  :key="c"
                  class="p-0"
                >
                  <div
                    class="cv-cell truncate"
                    :class="[
                      n.id === props.active && lit.includes(c) ? 'bg-[#34d399]/10 text-[#d1fae5]' : '',
                      inputIds.includes(n.id) && dropped.includes(c) && at('process') ? 'cv-fold' : '',
                      r[c] === null || r[c] === undefined ? 'italic text-[#5d6a8a]' : ''
                    ]"
                  >
                    {{ fmt(r[c] ?? null) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="!n.groups && !(n.rows ?? []).length"
            class="px-3 py-3 text-center text-[12px] text-[#8b97b8]"
          >
            {{ t('vis.noRows') }}
          </p>
          <p
            v-if="(n.groups?.filter(g => !g.dropped).length ?? n.rows?.length ?? 0) > ROWS"
            class="cv-more"
          >
            {{ t('vis.flow.more', { n: (n.groups?.filter(g => !g.dropped).length ?? n.rows?.length ?? 0) - ROWS }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Title card for the step -->
    <div
      v-if="act"
      :key="`title-${props.stepKey}`"
      class="cv-title pointer-events-none absolute left-5 top-4 flex items-center gap-3"
      :style="{ '--c': colorOf(act) }"
    >
      <span class="cv-title__num">{{ String(act.order).padStart(2, '0') }}</span>
      <span class="flex flex-col leading-tight">
        <span class="text-[18px] font-bold text-[#f1f5ff]">{{ act.label }}</span>
        <span class="font-mono text-[12px] text-[#8b97b8]">{{ act.name }}</span>
      </span>
    </div>

    <!-- Legend and camera controls -->
    <div class="pointer-events-none absolute bottom-3 left-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-[#8b97b8]">
      <span class="flex items-center gap-1.5"><i class="inline-block size-2 rounded-full bg-[#fb7185]" />{{ t('vis.dropped') }}</span>
      <span class="flex items-center gap-1.5"><i class="inline-block size-2 rounded-full bg-[#34d399]" />{{ t('vis.canvas.newCol') }}</span>
      <span class="flex items-center gap-1.5"><i class="inline-block size-2 rounded-full bg-[#fbbf24]" />{{ t('vis.legend.unmatched') }}</span>
      <span class="max-sm:hidden">· {{ t('vis.canvas.hint') }}</span>
    </div>
    <div
      class="absolute bottom-3 right-3 flex gap-1"
      @pointerdown.stop
    >
      <button
        v-for="b in [{ i: 'i-lucide-minus', a: () => zoomAt(1 / 1.25), l: t('vis.canvas.zoomOut') }, { i: 'i-lucide-plus', a: () => zoomAt(1.25), l: t('vis.canvas.zoomIn') }, { i: 'i-lucide-scan', a: () => (manual = null), l: t('vis.canvas.recenter') }]"
        :key="b.i"
        type="button"
        class="cv-ctrl"
        :aria-label="b.l"
        :title="b.l"
        @click="b.a()"
      >
        <UIcon
          :name="b.i"
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.cv {
  background-color: #0b1020;
  background-image: radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1.2px), radial-gradient(ellipse at 30% 20%, rgb(96 165 250 / 0.08), transparent 60%);
  background-size: 22px 22px, 100% 100%;
  touch-action: none;
  color: #cbd5e1;
}
.cv-world--glide {
  transition: transform 1.05s cubic-bezier(0.65, 0, 0.35, 1);
}
.cv-node {
  border-radius: 16px;
  background: #121a2e;
  border: 1.5px solid #26324d;
  overflow: hidden;
  transition: box-shadow 0.4s, border-color 0.4s, transform 0.4s, opacity 0.4s;
}
.cv-node__icon {
  display: flex;
  width: 60px;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--c);
}
.cv-node__label {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5ff;
  letter-spacing: -0.01em;
}
.cv-node__order {
  position: absolute;
  right: 10px;
  top: 8px;
  font: 600 11px/1 ui-monospace, monospace;
  color: #5d6a8a;
}
.cv-node--pending {
  background: transparent;
  border-style: dashed;
  opacity: 0.45;
}
.cv-node--pending .cv-node__icon { background: transparent; color: #5d6a8a; }
.cv-node--active {
  border-color: var(--c);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 18%, transparent), 0 18px 50px -12px color-mix(in srgb, var(--c) 55%, transparent);
  transform: scale(1.04);
}
.cv-node--busy {
  animation: busy 1s ease-in-out infinite;
}
.cv-node--error { border-color: #fb7185; }
@keyframes busy {
  50% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--c) 10%, transparent), 0 18px 60px -10px color-mix(in srgb, var(--c) 70%, transparent); }
}
.cv-status { color: var(--c); display: flex; align-items: center; gap: 8px; }
.cv-dot {
  width: 8px; height: 8px; border-radius: 99px; background: var(--c);
  box-shadow: 0 0 10px var(--c);
  animation: blink 1s ease-in-out infinite;
}
@keyframes blink { 50% { opacity: 0.3; } }
.cv-table {
  border-radius: 14px;
  background: #0f1628;
  border: 1px solid #222d47;
  box-shadow: 0 16px 40px -18px rgb(0 0 0 / 0.8);
  transition: opacity 0.4s;
}
.cv-table--new {
  border-color: color-mix(in srgb, var(--c) 55%, #222d47);
  animation: unfold 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
  transform-origin: top center;
}
@keyframes unfold {
  from { opacity: 0; transform: translateY(-16px) scaleY(0.6); }
}
.cv-table--new .cv-row {
  animation: land 0.4s calc(var(--i) * 90ms + 0.2s) cubic-bezier(0.3, 1.4, 0.5, 1) both;
}
@keyframes land {
  from { opacity: 0; transform: translateX(-14px); }
}
.cv-table__head {
  padding: 8px 12px;
  font: 600 11px ui-monospace, monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8b97b8;
  border-bottom: 1px solid #222d47;
}
.cv-th {
  padding: 0;
  text-align: start;
  font: 600 11px ui-monospace, monospace;
  color: #8b97b8;
  background: #131c33;
  border-bottom: 1px solid #222d47;
}
.cv-cell {
  max-width: 140px;
  padding: 6px 10px;
  white-space: nowrap;
}
.cv-row { font-size: 12.5px; color: #cbd5e1; border-bottom: 1px solid #18213a; transition: background 0.3s, color 0.3s; }
.cv-row:last-child { border-bottom: 0; }
.cv-row--dropped { background: rgb(251 113 133 / 0.14); color: #fda4af; text-decoration: line-through; }
.cv-row--warn { background: rgb(251 191 36 / 0.12); }
.cv-row--multi { background: rgb(167 139 250 / 0.14); }
.cv-more { padding: 5px 12px; font: 11px ui-monospace, monospace; color: #5d6a8a; border-top: 1px solid #18213a; }
.cv-fold { animation: fold 0.8s cubic-bezier(0.6, 0, 0.4, 1) forwards; }
@keyframes fold {
  35% { opacity: 0.5; max-width: 140px; }
  to { opacity: 0; max-width: 0; padding-inline: 0; }
}
.cv-lit { animation: lit 1.6s 0.3s ease-out both; }
@keyframes lit { from { background: #34d399; color: #052e1f; } }
.cv-eject {
  animation: eject 1.1s calc(var(--i) * 140ms + 0.15s) cubic-bezier(0.3, 0, 0.6, 1) both;
}
@keyframes eject {
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  20% { opacity: 1; transform: translate(24px, -12px) scale(1); }
  100% { opacity: 0; transform: translate(130px, -90px) rotate(14deg) scale(0.85); }
}
.cv-badge { animation: pop 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) both; }
@keyframes pop { from { opacity: 0; transform: scale(0.6); } }
.cv-march { animation: march 0.6s linear infinite; }
@keyframes march { to { stroke-dashoffset: -12; } }
.cv-title { animation: title 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
.cv-title__num {
  font: 800 30px/1 ui-monospace, monospace;
  color: var(--c);
  text-shadow: 0 0 24px color-mix(in srgb, var(--c) 60%, transparent);
}
@keyframes title { from { opacity: 0; transform: translateY(-10px); } }
.cv-ctrl {
  display: flex; width: 32px; height: 32px; align-items: center; justify-content: center;
  border-radius: 10px; background: #121a2e; border: 1px solid #26324d; color: #cbd5e1;
}
.cv-ctrl:hover { border-color: #60a5fa; color: #fff; }
@media (prefers-reduced-motion: reduce) {
  .cv-world--glide, .cv-node { transition: none; }
  .cv-node--busy, .cv-dot, .cv-table--new, .cv-table--new .cv-row, .cv-fold, .cv-lit, .cv-eject, .cv-badge, .cv-march, .cv-title { animation: none; }
  .cv-fold { max-width: 0; opacity: 0; padding-inline: 0; }
}
</style>
