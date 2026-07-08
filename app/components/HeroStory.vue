<script setup lang="ts">
// Animated Salesforce-style storyboard of the CRM Analytics workflow, shown
// inside a Lightning "Analytics Studio" window:
// recipe filter → dataset → explore/SAQL → run → bars → binding toggle → KPIs
// → line + trendline → pie → funnel → sales velocity → security → dashboard/export.

const C = {
  d: 'var(--color-salesforce-700)',
  m: 'var(--color-salesforce-500)',
  l: 'var(--color-salesforce-400)',
  xl: 'var(--color-salesforce-300)',
  xxl: 'var(--color-salesforce-200)'
}

interface Scene { key: string, tab: string, icon: string, action: 'run' | 'save' | 'download', title: string, caption: string, ms: number }
const SCENES: Scene[] = [
  { key: 'flow', tab: 'revenue.recipe', icon: 'i-lucide-workflow', action: 'run', title: 'Prep & filter in a recipe', caption: 'Filter → aggregate → dataset', ms: 4400 },
  { key: 'explore', tab: 'lens.saql', icon: 'i-lucide-search', action: 'run', title: 'Explore & write SAQL', caption: 'load · group · foreach → run', ms: 4600 },
  { key: 'binding', tab: 'lens.saql', icon: 'i-lucide-link', action: 'save', title: 'Bind a dynamic dimension', caption: 'Toggle Stage ⇄ Region', ms: 3800 },
  { key: 'kpis', tab: 'pipeline.dashboard', icon: 'i-lucide-badge-dollar-sign', action: 'save', title: 'KPIs, conditionally formatted', caption: 'Up / down arrows, RAG colors', ms: 3200 },
  { key: 'line', tab: 'lens.chart', icon: 'i-lucide-trending-up', action: 'save', title: 'Trend with a dashed trendline', caption: 'Clean line + regression', ms: 3000 },
  { key: 'pie', tab: 'lens.chart', icon: 'i-lucide-chart-pie', action: 'save', title: 'Pie breakdown by region', caption: 'Share of pipeline', ms: 2700 },
  { key: 'funnel', tab: 'lens.chart', icon: 'i-lucide-filter', action: 'save', title: 'Sales funnel', caption: 'Stage-to-stage conversion', ms: 3000 },
  { key: 'velocity', tab: 'metric.velocity', icon: 'i-lucide-gauge', action: 'save', title: 'Sales velocity', caption: '(Opps × Win% × Deal) ÷ Cycle', ms: 3200 },
  { key: 'security', tab: 'dataset.security', icon: 'i-lucide-shield-check', action: 'save', title: 'Row-level security predicate', caption: 'Each user sees their rows', ms: 3400 },
  { key: 'dashboard', tab: 'pipeline.dashboard', icon: 'i-lucide-layout-dashboard', action: 'download', title: 'Assemble & export to Excel', caption: 'Share · embed · download', ms: 4200 }
]

// ---- Scene data ------------------------------------------------------------
const recipeNodes = [
  { icon: 'i-lucide-database', label: 'Input' },
  { icon: 'i-lucide-filter', label: 'Filter' },
  { icon: 'i-lucide-sigma', label: 'Aggregate' },
  { icon: 'i-lucide-table-2', label: 'Output' }
]
const filterExpr = 'Amount > 0  &&  Stage != \'Closed Lost\''
// Held as a string so the literal braces don't confuse the template parser.
const bindingToken = '{{ Toggle.selection }}'

const kpis = [
  { label: 'Pipeline', value: '$9.0M', delta: '12%', dir: 'up', good: true },
  { label: 'Win rate', value: '38%', delta: '4 pts', dir: 'up', good: true },
  { label: 'Avg cycle', value: '21 d', delta: '3 d', dir: 'down', good: true },
  { label: 'At risk', value: '$0.6M', delta: '9%', dir: 'up', good: false }
]

const bars = [
  { label: 'Won', value: 100, color: C.d },
  { label: 'Negotiate', value: 74, color: C.m },
  { label: 'Proposal', value: 56, color: C.l },
  { label: 'Qualify', value: 35, color: C.xl },
  { label: 'Prospect', value: 22, color: C.xxl }
]
const colorsByIndex = [C.d, C.m, C.l, C.xl, C.xxl]
const stageVals = [100, 74, 56, 35, 22]
const regionVals = [92, 70, 58, 44, 30]
const stageLabels = ['Won', 'Negotiate', 'Proposal', 'Qualify', 'Prospect']
const regionLabels = ['Americas', 'EMEA', 'APAC', 'LATAM', 'India']

const pieData = [
  { label: 'Americas', value: 42, color: C.d },
  { label: 'EMEA', value: 28, color: C.m },
  { label: 'APAC', value: 18, color: C.l },
  { label: 'LATAM', value: 12, color: C.xl }
]

const funnel = [
  { label: 'Leads', value: 100 },
  { label: 'Qualified', value: 72 },
  { label: 'Proposal', value: 48 },
  { label: 'Negotiation', value: 30 },
  { label: 'Won', value: 18 }
]

const velocity = {
  result: '$41k',
  unit: '/ day',
  parts: [
    { label: 'Opps', value: '1,204' },
    { label: 'Win %', value: '38%' },
    { label: 'Deal', value: '$34k' },
    { label: 'Cycle', value: '21 d' }
  ]
}

const secRows = [
  { rec: 'Acme Corp · $120k', mine: true },
  { rec: 'Globex · $84k', mine: false },
  { rec: 'Initech · $63k', mine: true },
  { rec: 'Umbrella · $41k', mine: false }
]

const dashActions = [
  { key: 'name', icon: 'i-lucide-pencil', label: 'Name' },
  { key: 'share', icon: 'i-lucide-share-2', label: 'Share' },
  { key: 'embed', icon: 'i-lucide-code', label: 'Embed' },
  { key: 'excel', icon: 'i-lucide-file-spreadsheet', label: 'Excel' }
]

const toolbarActions = [
  { k: 'run', icon: 'i-lucide-play', label: 'Run' },
  { k: 'save', icon: 'i-lucide-save', label: 'Save' },
  { k: 'download', icon: 'i-lucide-download', label: 'Excel' }
]

// ---- Typewriter (explore scene) -------------------------------------------
type Cls = 't' | 'k' | 's'
const KEYWORDS = new Set(['load', 'filter', 'group', 'foreach', 'generate', 'order', 'by', 'as', 'sum', 'count'])
function tokenize(line: string): [string, Cls][] {
  const out: [string, Cls][] = []
  const re = /([A-Za-z_]+)|([^A-Za-z_]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m[1]) {
      out.push([m[1], KEYWORDS.has(m[1]) ? 'k' : 't'])
    } else {
      out.push([m[2] as string, 's'])
    }
  }
  return out
}
const queryLines = [
  'q = load "Opportunities";',
  'q = group q by \'Stage\';',
  'q = foreach q generate \'Stage\',',
  '      sum(\'Amount\') as \'Pipeline\';'
]
const clsMap: Record<Cls, string> = { t: 'text-muted', k: 'font-semibold text-primary', s: 'text-toned' }
const queryChars: { ch: string, cls: Cls | 'nl' }[] = []
queryLines.forEach((line, li) => {
  tokenize(line).forEach(([text, cls]) => {
    for (const ch of text) queryChars.push({ ch, cls })
  })
  if (li < queryLines.length - 1) queryChars.push({ ch: '\n', cls: 'nl' })
})

// ---- State ----------------------------------------------------------------
const scene = ref(0)
const play = ref(false)
const typed = ref(0)
const queryRan = ref(false)
const flip = ref(false)
const secured = ref(false)
const current = computed(() => SCENES[scene.value]!)

const renderedQuery = computed(() => {
  const lines: { text: string, cls: Cls }[][] = [[]]
  const max = Math.min(typed.value, queryChars.length)
  for (let i = 0; i < max; i++) {
    const c = queryChars[i]!
    if (c.cls === 'nl') {
      lines.push([])
      continue
    }
    const line = lines[lines.length - 1]!
    const last = line[line.length - 1]
    if (last && last.cls === c.cls) {
      last.text += c.ch
    } else {
      line.push({ text: c.ch, cls: c.cls })
    }
  }
  return lines
})

const bindBars = computed(() => {
  const vals = flip.value ? regionVals : stageVals
  const labels = flip.value ? regionLabels : stageLabels
  return vals.map((v, i) => ({ value: v, label: labels[i]!, color: colorsByIndex[i]! }))
})

// Pie as a conic-gradient (no hole).
const pieGradient = (() => {
  const total = pieData.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const stops = pieData.map((d) => {
    const start = (acc / total) * 100
    acc += d.value
    const end = (acc / total) * 100
    return `${d.color} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})()

// Mini pie for the dashboard scene.
const miniPie = pieGradient

// Line geometry + least-squares trendline.
const LW = 300
const LH = 120
const PAD = 12
const linePts = [40, 62, 55, 85]
const lineMax = Math.max(...linePts)
const toPoint = (v: number, i: number) => ({
  x: PAD + (i / (linePts.length - 1)) * (LW - PAD * 2),
  y: LH - PAD - (v / lineMax) * (LH - PAD * 2)
})
const linePoints = linePts.map(toPoint)
const linePolyline = linePoints.map(p => `${p.x},${p.y}`).join(' ')
const lineArea = `${PAD},${LH - PAD} ${linePolyline} ${LW - PAD},${LH - PAD}`
const meanX = (linePts.length - 1) / 2
const meanY = linePts.reduce((a, b) => a + b, 0) / linePts.length
let sxy = 0
let sxx = 0
linePts.forEach((y, i) => {
  sxy += (i - meanX) * (y - meanY)
  sxx += (i - meanX) ** 2
})
const slope = sxy / sxx
const intercept = meanY - slope * meanX
const trendPolyline = linePts.map((_, i) => toPoint(intercept + slope * i, i)).map(p => `${p.x},${p.y}`).join(' ')

const barH = (v: number) => `${(v / 100) * 92}px`

// ---- Loop engine ----------------------------------------------------------
const timers: ReturnType<typeof setTimeout>[] = []
let typer: ReturnType<typeof setInterval> | null = null
let auto: ReturnType<typeof setTimeout> | null = null
const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

function clearTimers() {
  timers.splice(0).forEach(clearTimeout)
}
function stopTyper() {
  if (typer) {
    clearInterval(typer)
    typer = null
  }
}
function startTyping() {
  stopTyper()
  typed.value = 0
  typer = setInterval(() => {
    typed.value += 1
    if (typed.value >= queryChars.length) {
      stopTyper()
      later(() => {
        queryRan.value = true
      }, 260)
    }
  }, 14)
}
function stopAuto() {
  if (auto) {
    clearTimeout(auto)
    auto = null
  }
}

function show(i: number) {
  clearTimers()
  stopTyper()
  scene.value = i
  play.value = false
  typed.value = 0
  queryRan.value = false
  flip.value = false
  secured.value = false

  later(() => {
    play.value = true
  }, 110)

  const key = SCENES[i]!.key
  if (key === 'explore') later(startTyping, 300)
  if (key === 'binding') later(() => {
    flip.value = true
  }, 1300)
  if (key === 'security') later(() => {
    secured.value = true
  }, 900)

  stopAuto()
  auto = setTimeout(() => show((i + 1) % SCENES.length), SCENES[i]!.ms)
}

onMounted(() => {
  const reduce = import.meta.client && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    scene.value = SCENES.length - 1
    play.value = true
    return
  }
  show(0)
})

onBeforeUnmount(() => {
  stopAuto()
  stopTyper()
  clearTimers()
})
</script>

<template>
  <div>
    <div class="relative">
      <!-- Soft ambient glow behind the window -->
      <div class="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/15 blur-2xl" />

      <div class="animate-float relative flex aspect-[4/3] flex-col overflow-hidden rounded-xl border border-default bg-default shadow-2xl ring-1 ring-default/60">
        <!-- Salesforce Lightning global header -->
        <div class="flex shrink-0 items-center gap-2 bg-gradient-to-r from-[#032D60] via-[#04396f] to-[#0b5cab] px-3 py-2 text-white">
          <UIcon
            name="i-lucide-grip"
            class="size-4 opacity-80"
          />
          <UIcon
            name="i-simple-icons-salesforce"
            class="size-4 shrink-0"
          />
          <span class="text-xs font-semibold">Analytics Studio</span>
          <div class="ml-auto hidden items-center gap-1.5 rounded bg-white/15 px-2 py-1 text-[10px] text-white/80 sm:flex">
            <UIcon
              name="i-lucide-search"
              class="size-3"
            />
            Search…
          </div>
          <span class="flex size-5 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">CA</span>
        </div>

        <!-- Object / action toolbar -->
        <div class="flex shrink-0 items-center gap-1.5 border-b border-default bg-muted/40 px-3 py-1.5 text-[11px]">
          <UIcon
            :name="current.icon"
            class="size-3.5 shrink-0 text-primary"
          />
          <span class="truncate font-medium text-toned">{{ current.tab }}</span>
          <div class="ml-auto flex items-center gap-1">
            <span
              v-for="a in toolbarActions"
              :key="a.k"
              class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
              :class="current.action === a.k ? 'bg-primary text-inverted' : 'text-dimmed'"
            >
              <UIcon
                :name="a.icon"
                class="size-3"
              />
              <span class="hidden sm:inline">{{ a.label }}</span>
            </span>
          </div>
        </div>

        <!-- Stage -->
        <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-3">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-250"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-100"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <!-- 1 · RECIPE FLOW + FILTER -->
            <div
              v-if="current.key === 'flow'"
              key="flow"
              class="w-full"
            >
              <div class="flex items-center justify-between">
                <template
                  v-for="(n, i) in recipeNodes"
                  :key="n.label"
                >
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg border px-2.5 py-2 transition-all duration-300"
                    :class="play ? (n.label === 'Filter' ? 'border-primary bg-primary/10' : 'border-primary/50 bg-default') + ' opacity-100' : 'border-default bg-default opacity-40'"
                    :style="{ transitionDelay: `${i * 140}ms` }"
                  >
                    <UIcon
                      :name="n.icon"
                      class="size-4 text-primary"
                    />
                    <span class="text-[10px] font-medium text-toned">{{ n.label }}</span>
                  </div>
                  <UIcon
                    v-if="i < recipeNodes.length - 1"
                    name="i-lucide-chevron-right"
                    class="size-4 shrink-0 text-dimmed transition-opacity duration-300"
                    :class="play ? 'opacity-100' : 'opacity-20'"
                  />
                </template>
              </div>

              <div
                class="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-[11px] transition-all duration-400"
                :class="play ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
                :style="{ transitionDelay: '500ms' }"
              >
                <UIcon
                  name="i-lucide-filter"
                  class="size-3.5 shrink-0 text-primary"
                />
                <span class="truncate text-toned">{{ filterExpr }}</span>
              </div>

              <div class="mt-4">
                <div class="mb-1.5 flex items-center gap-2 text-[11px] text-muted">
                  <UIcon
                    name="i-lucide-play"
                    class="size-3 text-primary"
                  />
                  Running recipe…
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{ width: play ? '100%' : '0%', transition: 'width 1200ms ease-out' }"
                  />
                </div>
              </div>

              <div
                class="mt-4 flex items-center gap-3 rounded-xl border border-default bg-muted/40 p-2.5 transition-all duration-400"
                :class="play ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
                :style="{ transitionDelay: '1050ms' }"
              >
                <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <UIcon
                    name="i-lucide-table-2"
                    class="size-4"
                  />
                </div>
                <div>
                  <p class="text-xs font-semibold text-highlighted">
                    Opportunities dataset
                  </p>
                  <p class="text-[10px] text-muted">
                    1.2M rows · filtered · ready
                  </p>
                </div>
                <UIcon
                  name="i-lucide-circle-check"
                  class="ml-auto size-4 text-green-500"
                />
              </div>
            </div>

            <!-- 2 · EXPLORE / SAQL → RUN → BARS -->
            <div
              v-else-if="current.key === 'explore'"
              key="explore"
              class="w-full"
            >
              <div class="mb-2 font-mono text-[12px] leading-relaxed">
                <div
                  v-for="(line, i) in renderedQuery"
                  :key="i"
                  class="min-h-[1.4em] whitespace-pre"
                >
                  <span
                    v-for="(run, j) in line"
                    :key="j"
                    :class="clsMap[run.cls]"
                  >{{ run.text }}</span><span
                    v-if="!queryRan && i === renderedQuery.length - 1"
                    class="ml-px inline-block w-1.5 animate-pulse bg-primary align-middle"
                    style="height:1em"
                  />
                </div>
              </div>
              <div class="mb-2 flex items-center gap-2">
                <span
                  class="flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-inverted transition-opacity"
                  :class="queryRan ? 'opacity-100' : 'opacity-40'"
                >
                  <UIcon
                    name="i-lucide-play"
                    class="size-3"
                  />Run
                </span>
                <span
                  v-if="queryRan"
                  class="text-[10px] font-medium text-green-600"
                >✓ 0.4s · 1,204 rows</span>
              </div>
              <div class="flex h-[76px] items-end justify-between gap-2">
                <div
                  v-for="(bar, i) in bars"
                  :key="bar.label"
                  class="flex-1 rounded-t-md ease-out"
                  :style="{
                    height: queryRan ? barH(bar.value) : '0px',
                    background: bar.color,
                    transitionProperty: 'height',
                    transitionDuration: '450ms',
                    transitionDelay: `${i * 60}ms`
                  }"
                />
              </div>
            </div>

            <!-- 3 · BINDING (dynamic grouping) -->
            <div
              v-else-if="current.key === 'binding'"
              key="binding"
              class="w-full"
            >
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span class="text-[11px] text-muted">group by</span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-all duration-300"
                >
                  <UIcon
                    name="i-lucide-link"
                    class="size-3"
                  />
                  <span>{{ flip ? 'Region' : 'Stage' }}</span>
                  <UIcon
                    name="i-lucide-chevrons-up-down"
                    class="size-3"
                  />
                </button>
                <span
                  class="text-[10px] text-dimmed transition-opacity duration-300"
                  :class="flip ? 'opacity-100' : 'opacity-0'"
                >↺ result re-binds</span>
              </div>
              <div class="mb-3 rounded-md border border-default bg-muted/40 px-2 py-1 font-mono text-[10px] text-toned">
                q = group q by <span class="font-semibold text-primary">{{ bindingToken }}</span>;
              </div>
              <div class="flex h-[118px] items-end justify-between gap-2">
                <div
                  v-for="(bar, i) in bindBars"
                  :key="i"
                  class="flex flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    class="w-full rounded-t-md"
                    :style="{
                      height: play ? barH(bar.value) : '0px',
                      background: bar.color,
                      transition: 'height 500ms ease'
                    }"
                  />
                  <span class="w-full truncate text-center text-[9px] text-dimmed">{{ bar.label }}</span>
                </div>
              </div>
            </div>

            <!-- 4 · KPIS (conditional formatting) -->
            <div
              v-else-if="current.key === 'kpis'"
              key="kpis"
              class="grid w-full grid-cols-2 gap-2.5"
            >
              <div
                v-for="(k, i) in kpis"
                :key="k.label"
                class="rounded-xl border border-default bg-default p-3 transition-all duration-300"
                :class="play ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
                :style="{ transitionDelay: `${i * 90}ms` }"
              >
                <p class="text-[10px] uppercase tracking-wide text-muted">
                  {{ k.label }}
                </p>
                <div class="mt-0.5 flex items-baseline gap-1.5">
                  <span class="text-lg font-bold text-highlighted">{{ k.value }}</span>
                  <span
                    class="flex items-center gap-0.5 text-[11px] font-semibold"
                    :class="k.good ? 'text-green-600' : 'text-red-500'"
                  >
                    <UIcon
                      :name="k.dir === 'up' ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
                      class="size-3"
                    />{{ k.delta }}
                  </span>
                </div>
                <div
                  class="mt-2 h-1 rounded-full"
                  :class="k.good ? 'bg-green-500/20' : 'bg-red-500/20'"
                >
                  <div
                    class="h-full rounded-full"
                    :class="k.good ? 'bg-green-500' : 'bg-red-500'"
                    :style="{ width: play ? '70%' : '0%', transition: 'width 600ms ease' }"
                  />
                </div>
              </div>
            </div>

            <!-- 5 · LINE + DASHED TRENDLINE -->
            <div
              v-else-if="current.key === 'line'"
              key="line"
              class="w-full"
            >
              <svg
                :viewBox="`0 0 ${LW} ${LH}`"
                class="h-[140px] w-full"
                preserveAspectRatio="none"
              >
                <polygon
                  :points="lineArea"
                  fill="var(--ui-primary)"
                  :style="{ opacity: play ? 0.1 : 0, transition: 'opacity 600ms ease' }"
                />
                <polyline
                  :points="trendPolyline"
                  fill="none"
                  stroke="var(--color-salesforce-400)"
                  stroke-width="2"
                  stroke-dasharray="6 5"
                  stroke-linecap="round"
                  :style="{ opacity: play ? 0.9 : 0, transition: 'opacity 600ms ease 300ms' }"
                />
                <polyline
                  :points="linePolyline"
                  fill="none"
                  stroke="var(--ui-primary)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  pathLength="1"
                  :style="{ strokeDasharray: 1, strokeDashoffset: play ? 0 : 1, transition: 'stroke-dashoffset 800ms ease-out' }"
                />
                <circle
                  v-for="(p, i) in linePoints"
                  :key="i"
                  :cx="p.x"
                  :cy="p.y"
                  r="4"
                  fill="var(--ui-primary)"
                  :style="{ opacity: play ? 1 : 0, transition: `opacity 250ms ease ${350 + i * 110}ms` }"
                />
              </svg>
              <div class="mt-2 flex items-center gap-4 text-[10px] text-muted">
                <span class="flex items-center gap-1.5"><span class="h-0.5 w-4 rounded bg-primary" />Pipeline</span>
                <span class="flex items-center gap-1.5"><span class="w-4 border-t-2 border-dashed border-salesforce-400" />Trendline</span>
              </div>
            </div>

            <!-- 6 · PIE -->
            <div
              v-else-if="current.key === 'pie'"
              key="pie"
              class="flex w-full items-center justify-center gap-6"
            >
              <div
                class="size-32 rounded-full shadow-sm transition-all duration-500"
                :class="play ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-90 opacity-0'"
                :style="{ background: pieGradient }"
              />
              <div class="space-y-1.5">
                <div
                  v-for="(d, i) in pieData"
                  :key="d.label"
                  class="flex items-center gap-2 text-[11px] transition-opacity duration-400"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: `${150 + i * 80}ms` }"
                >
                  <span
                    class="size-2.5 rounded-sm"
                    :style="{ background: d.color }"
                  />
                  <span class="text-toned">{{ d.label }}</span>
                  <span class="ml-auto font-semibold text-muted">{{ d.value }}%</span>
                </div>
              </div>
            </div>

            <!-- 7 · FUNNEL -->
            <div
              v-else-if="current.key === 'funnel'"
              key="funnel"
              class="w-full space-y-1.5"
            >
              <div
                v-for="(f, i) in funnel"
                :key="f.label"
                class="flex items-center gap-2"
              >
                <span class="w-16 shrink-0 text-right text-[10px] text-muted">{{ f.label }}</span>
                <div class="flex h-6 flex-1 items-center justify-center">
                  <div
                    class="flex h-full items-center justify-center rounded text-[10px] font-semibold text-inverted transition-all duration-500"
                    :style="{ width: play ? f.value + '%' : '0%', background: colorsByIndex[i], transitionDelay: `${i * 90}ms` }"
                  >
                    <span v-if="play">{{ f.value }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 8 · SALES VELOCITY -->
            <div
              v-else-if="current.key === 'velocity'"
              key="velocity"
              class="w-full"
            >
              <div
                class="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-all duration-400"
                :class="play ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
              >
                <div class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <UIcon
                    name="i-lucide-gauge"
                    class="size-6"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide text-muted">
                    Sales velocity
                  </p>
                  <p class="text-2xl font-bold text-highlighted">
                    {{ velocity.result }} <span class="text-sm font-medium text-muted">{{ velocity.unit }}</span>
                  </p>
                </div>
                <span class="ml-auto flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-3"
                  />15%
                </span>
              </div>
              <div class="mt-3 grid grid-cols-4 gap-2">
                <div
                  v-for="(p, i) in velocity.parts"
                  :key="p.label"
                  class="rounded-lg border border-default bg-muted/30 p-2 text-center transition-all duration-300"
                  :class="play ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
                  :style="{ transitionDelay: `${150 + i * 80}ms` }"
                >
                  <p class="text-xs font-bold text-highlighted">
                    {{ p.value }}
                  </p>
                  <p class="text-[9px] text-muted">
                    {{ p.label }}
                  </p>
                </div>
              </div>
              <p class="mt-2 text-center font-mono text-[10px] text-dimmed">
                (Opps × Win% × Deal) ÷ Cycle
              </p>
            </div>

            <!-- 9 · SECURITY PREDICATE -->
            <div
              v-else-if="current.key === 'security'"
              key="security"
              class="w-full"
            >
              <div class="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-[12px]">
                <UIcon
                  name="i-lucide-shield-check"
                  class="size-4 shrink-0 text-primary"
                />
                <span class="text-toned"><span class="text-muted">'OwnerId'</span> == <span class="font-semibold text-primary">"$User.Id"</span></span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(r, i) in secRows"
                  :key="r.rec"
                  class="flex items-center gap-2 rounded-lg border border-default px-3 py-2 text-xs transition-all duration-400"
                  :class="secured && !r.mine ? 'bg-muted/30 opacity-40 blur-[1px]' : 'bg-default opacity-100'"
                  :style="{ transitionDelay: `${i * 70}ms` }"
                >
                  <UIcon
                    :name="secured && !r.mine ? 'i-lucide-lock' : 'i-lucide-circle-user-round'"
                    class="size-4 shrink-0"
                    :class="secured && !r.mine ? 'text-dimmed' : 'text-primary'"
                  />
                  <span class="text-toned">{{ r.rec }}</span>
                  <span
                    v-if="!r.mine"
                    class="ml-auto text-[10px] font-medium"
                    :class="secured ? 'text-dimmed' : 'text-muted'"
                  >{{ secured ? 'hidden' : '' }}</span>
                  <UIcon
                    v-else
                    name="i-lucide-eye"
                    class="ml-auto size-3.5 text-green-500"
                  />
                </div>
              </div>
              <p class="mt-3 text-[11px] text-muted">
                Each user sees only the rows they're allowed to.
              </p>
            </div>

            <!-- 10 · DASHBOARD + EXPORT -->
            <div
              v-else
              key="dashboard"
              class="w-full"
            >
              <div class="mb-3 flex items-center gap-1.5">
                <span class="mr-auto text-[11px] font-semibold text-highlighted">Pipeline Health</span>
                <UTooltip
                  v-for="(a, i) in dashActions"
                  :key="a.key"
                  :text="a.label"
                >
                  <span
                    class="flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] font-medium transition-all duration-300"
                    :class="[
                      play ? 'opacity-100' : 'opacity-0',
                      a.key === 'excel' ? 'border-green-500/40 bg-green-500/10 text-green-600' : 'border-default text-muted'
                    ]"
                    :style="{ transitionDelay: `${i * 70}ms` }"
                  >
                    <UIcon
                      :name="a.icon"
                      class="size-3.5"
                    />
                    <span
                      v-if="a.key === 'excel'"
                      class="hidden sm:inline"
                    >Excel</span>
                  </span>
                </UTooltip>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(k, i) in ['$9.0M', '1,204', '38%']"
                  :key="k"
                  class="rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-300"
                  :class="play ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
                  :style="{ transitionDelay: `${i * 70}ms` }"
                >
                  <p class="text-sm font-bold text-highlighted">
                    {{ k }}
                  </p>
                  <p class="text-[9px] text-muted">
                    {{ ['Pipeline', 'Deals', 'Win rate'][i] }}
                  </p>
                </div>
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div
                  class="flex h-20 items-end gap-1 rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-400"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: '250ms' }"
                >
                  <span
                    v-for="bar in bars"
                    :key="bar.label"
                    class="flex-1 rounded-t-sm"
                    :style="{ height: play ? barH(bar.value * 0.55) : '0px', background: bar.color, transition: 'height 500ms ease' }"
                  />
                </div>
                <div
                  class="flex h-20 items-center justify-center rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-400"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: '350ms' }"
                >
                  <div
                    class="size-14 rounded-full"
                    :style="{ background: miniPie }"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Footer: step progress + caption -->
        <div class="flex shrink-0 items-center gap-2 border-t border-default bg-muted/30 px-3 py-1.5">
          <div class="flex items-center gap-1">
            <span
              v-for="(s, i) in SCENES"
              :key="s.key"
              class="h-1 rounded-full transition-all duration-300"
              :class="i === scene ? 'w-4 bg-primary' : 'w-1 bg-primary/25'"
            />
          </div>
          <span class="ml-1.5 truncate text-[11px] font-medium text-toned">{{ current.title }}</span>
          <span class="ml-auto hidden shrink-0 text-[11px] text-muted sm:block">{{ current.caption }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
