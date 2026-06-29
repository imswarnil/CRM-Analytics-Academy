<script setup lang="ts">
// ---- Token colouring -------------------------------------------------------
type Token = [text: string, cls: 't' | 'k' | 's']
const KEYWORDS = new Set(['load', 'filter', 'group', 'foreach', 'generate', 'order', 'by', 'as', 'sum', 'count', 'avg', 'limit'])

function tokenize(line: string): Token[] {
  const out: Token[] = []
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

// ---- The three queries + their charts -------------------------------------
interface Bar { label: string, value: number, color: string }
interface ChartDef { type: 'bars' | 'hbars' | 'line', caption: string, status: string, data: Bar[] }
interface QueryDef { file: string, lines: string[], chart: ChartDef }

const C = {
  d: 'var(--color-salesforce-700)',
  m: 'var(--color-salesforce-500)',
  l: 'var(--color-salesforce-400)',
  xl: 'var(--color-salesforce-300)',
  xxl: 'var(--color-salesforce-200)'
}

const QUERIES: QueryDef[] = [
  {
    file: 'pipeline-by-stage.saql',
    lines: [
      'q = load "Opportunities";',
      'q = group q by \'StageName\';',
      'q = foreach q generate \'StageName\' as \'Stage\',',
      '      sum(\'Amount\') as \'Pipeline\';'
    ],
    chart: {
      type: 'bars',
      caption: 'Pipeline by stage',
      status: '5 stages returned',
      data: [
        { label: 'Won', value: 100, color: C.d },
        { label: 'Negotiate', value: 74, color: C.m },
        { label: 'Proposal', value: 56, color: C.l },
        { label: 'Qualify', value: 35, color: C.xl },
        { label: 'Prospect', value: 22, color: C.xxl }
      ]
    }
  },
  {
    file: 'revenue-by-region.saql',
    lines: [
      'q = load "Opportunities";',
      'q = filter q by \'IsWon\' == "true";',
      'q = group q by \'Region\';',
      'q = foreach q generate \'Region\' as \'Region\',',
      '      sum(\'Amount\') as \'Revenue\';'
    ],
    chart: {
      type: 'hbars',
      caption: 'Revenue by region',
      status: '4 regions returned',
      data: [
        { label: 'Americas', value: 100, color: C.d },
        { label: 'EMEA', value: 68, color: C.m },
        { label: 'APAC', value: 47, color: C.l },
        { label: 'LATAM', value: 25, color: C.xl }
      ]
    }
  },
  {
    file: 'deals-by-quarter.saql',
    lines: [
      'q = load "Opportunities";',
      'q = group q by \'CloseDate_Quarter\';',
      'q = foreach q generate \'Quarter\' as \'Quarter\',',
      '      count() as \'Deals\';'
    ],
    chart: {
      type: 'line',
      caption: 'Deals closed by quarter',
      status: '4 quarters returned',
      data: [
        { label: 'Q1', value: 40, color: C.m },
        { label: 'Q2', value: 62, color: C.m },
        { label: 'Q3', value: 55, color: C.m },
        { label: 'Q4', value: 85, color: C.m }
      ]
    }
  }
]

const clsMap = { t: 'text-muted', k: 'font-semibold text-primary', s: 'text-toned' }

// ---- State ----------------------------------------------------------------
type Phase = 'typing' | 'ready' | 'running' | 'chart'
const qi = ref(0)
const current = computed(() => QUERIES[qi.value]!)
const phase = ref<Phase>('ready')
const grow = ref(false)
const revealed = ref(Number.MAX_SAFE_INTEGER) // SSR/first render shows the full query

interface Ch { ch: string, cls: 't' | 'k' | 's' | 'nl' }
const chars = computed<Ch[]>(() => {
  const arr: Ch[] = []
  current.value.lines.forEach((line, li) => {
    tokenize(line).forEach(([text, cls]) => {
      for (const ch of text) arr.push({ ch, cls })
    })
    if (li < current.value.lines.length - 1) arr.push({ ch: '\n', cls: 'nl' })
  })
  return arr
})

const renderedLines = computed(() => {
  const lines: { text: string, cls: 't' | 'k' | 's' }[][] = [[]]
  const cs = chars.value
  const max = Math.min(revealed.value, cs.length)
  for (let i = 0; i < max; i++) {
    const c = cs[i]!
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

// ---- Chart geometry -------------------------------------------------------
const MAX_PX = 112
const maxVal = computed(() => Math.max(...current.value.chart.data.map(d => d.value)))
const barH = (v: number) => `${(v / maxVal.value) * MAX_PX}px`
const barPct = (v: number) => `${(v / maxVal.value) * 100}%`

const LW = 300
const LH = 140
const PAD = 14
const linePoints = computed(() => {
  const d = current.value.chart.data
  const n = d.length
  return d.map((b, i) => {
    const x = PAD + (i / (n - 1)) * (LW - PAD * 2)
    const y = LH - PAD - (b.value / maxVal.value) * (LH - PAD * 2)
    return { x, y, label: b.label, value: b.value }
  })
})
const linePolyline = computed(() => linePoints.value.map(p => `${p.x},${p.y}`).join(' '))
const lineArea = computed(() => {
  const pts = linePoints.value
  if (!pts.length) return ''
  return `${PAD},${LH - PAD} ${pts.map(p => `${p.x},${p.y}`).join(' ')} ${LW - PAD},${LH - PAD}`
})

// ---- Loop engine ----------------------------------------------------------
const timers: ReturnType<typeof setTimeout>[] = []
let typer: ReturnType<typeof setInterval> | null = null
const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

function stopTyper() {
  if (typer) {
    clearInterval(typer)
    typer = null
  }
}

function clearAll() {
  timers.splice(0).forEach(clearTimeout)
  stopTyper()
}

function startTyping() {
  clearAll()
  grow.value = false
  phase.value = 'typing'
  revealed.value = 0
  typer = setInterval(() => {
    revealed.value += 1
    if (revealed.value >= chars.value.length) {
      stopTyper()
      phase.value = 'ready'
      later(runQuery, 650)
    }
  }, 24)
}

function runQuery() {
  if (phase.value === 'running' || phase.value === 'chart') return
  clearAll()
  revealed.value = chars.value.length
  phase.value = 'running'
  later(() => {
    phase.value = 'chart'
    later(() => {
      grow.value = true
    }, 80)
    later(nextQuery, 3400)
  }, 600)
}

function nextQuery() {
  qi.value = (qi.value + 1) % QUERIES.length
  startTyping()
}

function onButton() {
  if (phase.value === 'chart') {
    nextQuery()
  } else {
    runQuery()
  }
}

onMounted(() => {
  const reduce = import.meta.client && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    phase.value = 'chart'
    grow.value = true
    return
  }
  startTyping()
})

onBeforeUnmount(clearAll)
</script>

<template>
  <div class="relative">
    <div class="absolute -inset-4 rounded-3xl bg-primary/20 blur-2xl" />

    <div class="animate-float relative overflow-hidden rounded-2xl border border-default bg-default shadow-2xl ring-1 ring-default/60">
      <!-- Title bar -->
      <div class="flex items-center gap-2 border-b border-default bg-muted/50 px-4 py-3">
        <span class="size-3 rounded-full bg-red-400" />
        <span class="size-3 rounded-full bg-amber-400" />
        <span class="size-3 rounded-full bg-green-400" />
        <span class="ml-2 flex items-center gap-1.5 text-xs text-muted">
          <UIcon
            name="i-lucide-file-code"
            class="size-3.5"
          />
          {{ current.file }}
        </span>
      </div>

      <!-- Body -->
      <div class="relative min-h-[236px] p-5">
        <Transition
          enter-active-class="transition duration-500"
          enter-from-class="opacity-0"
          leave-active-class="absolute inset-0 transition duration-200"
          leave-to-class="opacity-0"
        >
          <!-- Editor -->
          <div
            v-if="phase !== 'chart'"
            key="code"
            class="font-mono text-[13px] leading-relaxed"
          >
            <div
              v-for="(line, i) in renderedLines"
              :key="i"
              class="min-h-[1.45em] whitespace-pre"
            >
              <span
                v-for="(run, j) in line"
                :key="j"
                :class="clsMap[run.cls]"
              >{{ run.text }}</span><span
                v-if="phase === 'typing' && i === renderedLines.length - 1"
                class="ml-px inline-block w-1.5 animate-pulse bg-primary align-middle"
                style="height:1em"
              />
            </div>
          </div>

          <!-- Result chart -->
          <div
            v-else
            key="chart"
            class="flex h-[196px] flex-col"
          >
            <p class="mb-3 text-xs font-medium text-muted">
              {{ current.chart.caption }}
            </p>

            <!-- Vertical bars -->
            <div
              v-if="current.chart.type === 'bars'"
              class="flex flex-1 items-end justify-between gap-2"
            >
              <div
                v-for="(bar, i) in current.chart.data"
                :key="bar.label"
                class="flex flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span
                  class="text-[10px] font-semibold text-muted transition-opacity duration-500"
                  :class="grow ? 'opacity-100' : 'opacity-0'"
                >{{ bar.value }}</span>
                <div
                  class="w-full rounded-t-md ease-out"
                  :style="{
                    height: grow ? barH(bar.value) : '0px',
                    background: bar.color,
                    transitionProperty: 'height',
                    transitionDuration: '700ms',
                    transitionDelay: `${i * 90}ms`
                  }"
                />
                <span class="w-full truncate text-center text-[10px] text-dimmed">{{ bar.label }}</span>
              </div>
            </div>

            <!-- Horizontal bars -->
            <div
              v-else-if="current.chart.type === 'hbars'"
              class="flex flex-1 flex-col justify-center gap-3"
            >
              <div
                v-for="(bar, i) in current.chart.data"
                :key="bar.label"
                class="flex items-center gap-2"
              >
                <span class="w-16 shrink-0 text-right text-[10px] text-dimmed">{{ bar.label }}</span>
                <div class="h-3.5 flex-1 overflow-hidden rounded bg-muted/60">
                  <div
                    class="h-full rounded ease-out"
                    :style="{
                      width: grow ? barPct(bar.value) : '0%',
                      background: bar.color,
                      transitionProperty: 'width',
                      transitionDuration: '700ms',
                      transitionDelay: `${i * 90}ms`
                    }"
                  />
                </div>
                <span class="w-7 shrink-0 text-[10px] font-semibold text-muted">{{ bar.value }}</span>
              </div>
            </div>

            <!-- Line chart -->
            <div
              v-else
              class="flex flex-1 items-center"
            >
              <svg
                :viewBox="`0 0 ${LW} ${LH}`"
                class="h-full w-full"
                preserveAspectRatio="none"
              >
                <polygon
                  :points="lineArea"
                  fill="var(--ui-primary)"
                  :style="{ opacity: grow ? 0.12 : 0, transition: 'opacity 800ms ease' }"
                />
                <polyline
                  :points="linePolyline"
                  fill="none"
                  stroke="var(--ui-primary)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  pathLength="1"
                  :style="{
                    strokeDasharray: 1,
                    strokeDashoffset: grow ? 0 : 1,
                    transition: 'stroke-dashoffset 900ms ease-out'
                  }"
                />
                <g
                  v-for="(p, i) in linePoints"
                  :key="i"
                >
                  <circle
                    :cx="p.x"
                    :cy="p.y"
                    r="4"
                    fill="var(--ui-primary)"
                    :style="{ opacity: grow ? 1 : 0, transition: `opacity 300ms ease ${400 + i * 120}ms` }"
                  />
                </g>
              </svg>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Action bar -->
      <div class="flex items-center justify-between gap-3 border-t border-default bg-muted/30 px-4 py-3">
        <UButton
          :icon="phase === 'running' ? 'i-lucide-loader-circle' : (phase === 'chart' ? 'i-lucide-rotate-cw' : 'i-lucide-play')"
          :label="phase === 'running' ? 'Running…' : (phase === 'chart' ? 'Next query' : 'Run query')"
          size="xs"
          color="primary"
          variant="solid"
          class="rounded-full font-semibold"
          :ui="{ leadingIcon: phase === 'running' ? 'animate-spin' : '' }"
          :disabled="phase === 'running'"
          @click="onButton"
        />
        <div class="flex items-center gap-3">
          <div class="flex gap-1">
            <span
              v-for="(q, i) in QUERIES"
              :key="i"
              class="size-1.5 rounded-full transition-colors"
              :class="i === qi ? 'bg-primary' : 'bg-default/30'"
            />
          </div>
          <span class="flex items-center gap-1.5 text-[11px] text-dimmed">
            <span
              class="size-1.5 rounded-full"
              :class="phase === 'chart' ? 'bg-green-500' : 'bg-amber-400'"
            />
            {{ phase === 'chart' ? current.chart.status : 'Ready to run' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
