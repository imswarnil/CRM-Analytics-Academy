<script setup lang="ts">
// Clean, centered Mac-style window that plays the CRM Analytics journey:
// sync sources → dataflow → final dataset → open → write & run a query →
// bar chart → toggle Market/Region (→ donut) → number widgets → start-learning CTA.
const localePath = useLocalePath()

const C = {
  d: 'var(--color-salesforce-700)',
  m: 'var(--color-salesforce-500)',
  l: 'var(--color-salesforce-400)',
  xl: 'var(--color-salesforce-300)',
  xxl: 'var(--color-salesforce-200)'
}

interface Scene { key: string, file: string, icon: string, title: string, caption: string, ms: number }
const SCENES: Scene[] = [
  { key: 'sources', file: 'sync.connect', icon: 'i-lucide-cable', title: 'Combine & sync your sources', caption: 'Salesforce · Snowflake · CSV', ms: 3200 },
  { key: 'dataflow', file: 'opportunities.dataflow', icon: 'i-lucide-workflow', title: 'Run the dataflow', caption: 'Join objects → one dataset', ms: 3800 },
  { key: 'dataset', file: 'Opportunities.dataset', icon: 'i-lucide-database', title: 'Open the dataset', caption: 'Click to explore', ms: 2800 },
  { key: 'query', file: 'lens.saql', icon: 'i-lucide-terminal', title: 'Write & run a query', caption: 'SAQL → Run Query → chart', ms: 4800 },
  { key: 'toggle', file: 'lens.chart', icon: 'i-lucide-toggle-right', title: 'Toggle Market ⇄ Region', caption: 'Region → donut', ms: 4400 },
  { key: 'widgets', file: 'pipeline.dashboard', icon: 'i-lucide-layout-dashboard', title: 'Add number widgets & more', caption: 'KPIs, charts, actions', ms: 3600 },
  { key: 'cta', file: 'get-started', icon: 'i-lucide-rocket', title: 'Learn CRM Analytics from scratch', caption: 'Start free — no experience needed', ms: 4200 }
]

// ---- Scene data ------------------------------------------------------------
const sources = [
  { icon: 'i-simple-icons-salesforce', label: 'Salesforce', color: '#00A1E0' },
  { icon: 'i-simple-icons-snowflake', label: 'Snowflake', color: '#29B5E8' },
  { icon: 'i-lucide-file-spreadsheet', label: 'CSV', color: 'var(--color-salesforce-500)' }
]
const dataflowInputs = [
  { icon: 'i-lucide-building-2', label: 'Account' },
  { icon: 'i-lucide-target', label: 'Opportunity' },
  { icon: 'i-lucide-user', label: 'User' }
]
const marketBars = [
  { label: 'Enterprise', value: 100, color: C.d },
  { label: 'Commercial', value: 72, color: C.m },
  { label: 'SMB', value: 54, color: C.l },
  { label: 'Startup', value: 33, color: C.xl }
]
const regionData = [
  { label: 'Americas', value: 42, color: C.d },
  { label: 'EMEA', value: 28, color: C.m },
  { label: 'APAC', value: 18, color: C.l },
  { label: 'LATAM', value: 12, color: C.xl }
]
const kpis = [
  { label: 'Pipeline', value: '$9.0M', delta: '12%', up: true, good: true },
  { label: 'Win rate', value: '38%', delta: '4 pts', up: true, good: true }
]

// ---- Typewriter (query scene) ---------------------------------------------
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
  'q = group q by \'Market\';',
  'q = foreach q generate \'Market\',',
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
const flip = ref(false) // toggle scene: Market (bars) → Region (donut)
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
const typedDone = computed(() => typed.value >= queryChars.length)

// Region donut as a conic-gradient with a center hole.
const regionGradient = (() => {
  const total = regionData.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const stops = regionData.map((d) => {
    const start = (acc / total) * 100
    acc += d.value
    const end = (acc / total) * 100
    return `${d.color} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})()

const barH = (v: number) => `${(v / 100) * 90}px`

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
      }, 700)
    }
  }, 13)
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

  later(() => {
    play.value = true
  }, 110)

  const key = SCENES[i]!.key
  if (key === 'query') later(startTyping, 320)
  if (key === 'toggle') later(() => {
    flip.value = true
  }, 1900)

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

      <div class="animate-float relative mx-auto flex aspect-[4/3] w-full flex-col overflow-hidden rounded-2xl border border-default bg-default shadow-2xl ring-1 ring-default/60">
        <!-- Mac title bar -->
        <div class="flex shrink-0 items-center gap-2 border-b border-default bg-muted/50 px-4 py-2.5">
          <span class="size-3 rounded-full bg-red-400" />
          <span class="size-3 rounded-full bg-amber-400" />
          <span class="size-3 rounded-full bg-green-400" />
          <span class="ml-2 flex items-center gap-1.5 text-xs text-muted">
            <UIcon
              :name="current.icon"
              class="size-3.5"
            />
            {{ current.file }}
          </span>
        </div>

        <!-- Stage -->
        <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-4">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-250"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-100"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <!-- 1 · SYNC SOURCES -->
            <div
              v-if="current.key === 'sources'"
              key="sources"
              class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3"
            >
              <div class="space-y-2.5">
                <div
                  v-for="(s, i) in sources"
                  :key="s.label"
                  class="flex items-center gap-2 rounded-lg border border-default bg-muted/40 px-3 py-2 transition-all duration-400"
                  :class="play ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'"
                  :style="{ transitionDelay: `${i * 110}ms` }"
                >
                  <UIcon
                    :name="s.icon"
                    class="size-4 shrink-0"
                    :style="{ color: s.color }"
                  />
                  <span class="truncate text-xs font-medium text-toned">{{ s.label }}</span>
                </div>
              </div>

              <svg
                viewBox="0 0 80 120"
                class="h-24 w-16"
              >
                <path
                  v-for="(y, i) in [22, 60, 98]"
                  :key="i"
                  :d="`M2 ${y} C 40 ${y}, 40 60, 78 60`"
                  fill="none"
                  stroke="var(--ui-primary)"
                  stroke-width="2"
                  :style="{ opacity: play ? 0.7 : 0.15, transition: 'opacity 500ms ease' }"
                />
              </svg>

              <div
                class="flex flex-col items-center gap-1.5 justify-self-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 transition-all duration-400"
                :class="play ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
                :style="{ transitionDelay: '350ms' }"
              >
                <UIcon
                  name="i-lucide-refresh-cw"
                  class="size-5 text-primary"
                />
                <span class="text-[11px] font-semibold text-primary">Synced</span>
              </div>
            </div>

            <!-- 2 · DATAFLOW → FINAL DATASET -->
            <div
              v-else-if="current.key === 'dataflow'"
              key="dataflow"
              class="flex w-full flex-col items-center"
            >
              <div class="flex items-center justify-center gap-2">
                <div
                  v-for="(n, i) in dataflowInputs"
                  :key="n.label"
                  class="flex flex-col items-center gap-1 rounded-lg border bg-default px-2.5 py-2 transition-all duration-300"
                  :class="play ? 'border-primary/50 opacity-100' : 'border-default opacity-30'"
                  :style="{ transitionDelay: `${i * 130}ms` }"
                >
                  <UIcon
                    :name="n.icon"
                    class="size-4 text-primary"
                  />
                  <span class="text-[9px] font-medium text-toned">{{ n.label }}</span>
                </div>
              </div>

              <UIcon
                name="i-lucide-chevron-down"
                class="my-1 size-4 text-dimmed transition-opacity duration-300"
                :class="play ? 'opacity-100' : 'opacity-20'"
                :style="{ transitionDelay: '450ms' }"
              />
              <div
                class="flex items-center gap-1.5 rounded-md border border-default bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-toned transition-all duration-300"
                :class="play ? 'opacity-100' : 'opacity-0'"
                :style="{ transitionDelay: '550ms' }"
              >
                <UIcon
                  name="i-lucide-merge"
                  class="size-3.5 text-primary"
                />Join
              </div>
              <UIcon
                name="i-lucide-chevron-down"
                class="my-1 size-4 text-dimmed transition-opacity duration-300"
                :class="play ? 'opacity-100' : 'opacity-20'"
                :style="{ transitionDelay: '700ms' }"
              />

              <div
                class="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 shadow-sm transition-all duration-400"
                :class="play ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
                :style="{ transitionDelay: '850ms' }"
              >
                <div class="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                  <UIcon
                    name="i-lucide-database"
                    class="size-4"
                  />
                </div>
                <div>
                  <p class="text-xs font-bold text-highlighted">
                    Opportunities
                  </p>
                  <p class="text-[10px] text-muted">
                    final dataset · 1.2M rows
                  </p>
                </div>
                <UIcon
                  name="i-lucide-circle-check"
                  class="size-4 text-green-500"
                />
              </div>
            </div>

            <!-- 3 · OPEN DATASET (click) -->
            <div
              v-else-if="current.key === 'dataset'"
              key="dataset"
              class="relative flex w-full flex-col items-center justify-center"
            >
              <div
                class="flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 px-5 py-4 transition-all duration-500"
                :class="play ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
              >
                <div class="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <UIcon
                    name="i-lucide-database"
                    class="size-6"
                  />
                </div>
                <div>
                  <p class="text-sm font-bold text-highlighted">
                    Opportunities
                  </p>
                  <p class="text-[11px] text-muted">
                    1.2M rows · updated today
                  </p>
                </div>
              </div>
              <div
                class="mt-4 flex items-center gap-1.5 rounded-full bg-highlighted/90 px-3 py-1 text-[11px] font-medium text-inverted transition-all duration-300"
                :class="play ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
                :style="{ transitionDelay: '600ms' }"
              >
                <UIcon
                  name="i-lucide-mouse-pointer-click"
                  class="size-3.5 animate-pulse"
                />
                Click to explore
              </div>
            </div>

            <!-- 4 · WRITE & RUN QUERY → BAR CHART -->
            <div
              v-else-if="current.key === 'query'"
              key="query"
              class="w-full"
            >
              <div class="mb-2 rounded-lg border border-default bg-muted/30 p-2.5 font-mono text-[11.5px] leading-relaxed">
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
                    v-if="!typedDone && i === renderedQuery.length - 1"
                    class="ml-px inline-block w-1.5 animate-pulse bg-primary align-middle"
                    style="height:1em"
                  />
                </div>
              </div>
              <div class="mb-3 flex items-center gap-2">
                <span
                  class="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-300"
                  :class="typedDone ? 'bg-primary text-inverted shadow-sm' : 'bg-muted text-dimmed'"
                >
                  <UIcon
                    :name="queryRan ? 'i-lucide-loader-circle' : 'i-lucide-play'"
                    class="size-3"
                    :class="queryRan ? 'animate-spin' : ''"
                  />
                  Run Query
                </span>
                <span
                  v-if="queryRan"
                  class="text-[10px] font-medium text-green-600"
                >✓ 1,204 rows</span>
              </div>
              <div class="flex h-[80px] items-end justify-between gap-2">
                <div
                  v-for="(bar, i) in marketBars"
                  :key="bar.label"
                  class="flex-1 rounded-t-md ease-out"
                  :style="{
                    height: queryRan ? barH(bar.value) : '0px',
                    background: bar.color,
                    transitionProperty: 'height',
                    transitionDuration: '500ms',
                    transitionDelay: `${i * 70}ms`
                  }"
                />
              </div>
            </div>

            <!-- 5 · TOGGLE MARKET / REGION → DONUT -->
            <div
              v-else-if="current.key === 'toggle'"
              key="toggle"
              class="w-full"
            >
              <div class="mb-4 flex justify-center">
                <div class="inline-flex rounded-full border border-default bg-muted/40 p-0.5 text-[11px] font-medium">
                  <span
                    class="rounded-full px-3 py-1 transition-all duration-300"
                    :class="!flip ? 'bg-primary text-inverted shadow-sm' : 'text-muted'"
                  >Market</span>
                  <span
                    class="rounded-full px-3 py-1 transition-all duration-300"
                    :class="flip ? 'bg-primary text-inverted shadow-sm' : 'text-muted'"
                  >Region</span>
                </div>
              </div>

              <Transition
                mode="out-in"
                enter-active-class="transition duration-300"
                enter-from-class="opacity-0 scale-95"
                leave-active-class="transition duration-150"
                leave-to-class="opacity-0 scale-95"
              >
                <!-- Market → bar chart -->
                <div
                  v-if="!flip"
                  key="bars"
                  class="flex h-[130px] items-end justify-between gap-3 px-2"
                >
                  <div
                    v-for="bar in marketBars"
                    :key="bar.label"
                    class="flex flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <div
                      class="w-full rounded-t-md"
                      :style="{ height: barH(bar.value), background: bar.color, transition: 'height 500ms ease' }"
                    />
                    <span class="w-full truncate text-center text-[9px] text-dimmed">{{ bar.label }}</span>
                  </div>
                </div>

                <!-- Region → donut -->
                <div
                  v-else
                  key="donut"
                  class="flex h-[130px] items-center justify-center gap-5"
                >
                  <div
                    class="relative size-28 rounded-full"
                    :style="{ background: regionGradient }"
                  >
                    <div class="absolute inset-[24%] rounded-full bg-default" />
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xs font-bold text-highlighted">$9.0M</span>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <div
                      v-for="d in regionData"
                      :key="d.label"
                      class="flex items-center gap-2 text-[11px]"
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
              </Transition>
            </div>

            <!-- 6 · NUMBER WIDGETS & MORE -->
            <div
              v-else-if="current.key === 'widgets'"
              key="widgets"
              class="w-full space-y-2.5"
            >
              <div class="grid grid-cols-2 gap-2.5">
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
                    <span class="flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
                      <UIcon
                        name="i-lucide-arrow-up-right"
                        class="size-3"
                      />{{ k.delta }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div
                  class="flex h-20 items-end gap-1 rounded-xl border border-default bg-muted/30 p-2.5 transition-all duration-400"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: '220ms' }"
                >
                  <span
                    v-for="bar in marketBars"
                    :key="bar.label"
                    class="flex-1 rounded-t-sm"
                    :style="{ height: play ? barH(bar.value * 0.6) : '0px', background: bar.color, transition: 'height 500ms ease' }"
                  />
                </div>
                <div
                  class="flex h-20 items-center justify-center rounded-xl border border-default bg-muted/30 p-2.5 transition-all duration-400"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: '320ms' }"
                >
                  <div
                    class="relative size-14 rounded-full"
                    :style="{ background: regionGradient }"
                  >
                    <div class="absolute inset-[26%] rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 7 · START-LEARNING CTA -->
            <div
              v-else
              key="cta"
              class="flex w-full flex-col items-center justify-center text-center transition-all duration-500"
              :class="play ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
            >
              <div class="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <span class="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
                <UIcon
                  name="i-lucide-rocket"
                  class="relative size-7"
                />
              </div>
              <p class="text-base font-bold text-highlighted">
                Learn CRM Analytics
              </p>
              <p class="text-sm font-semibold text-primary">
                from scratch
              </p>
              <p class="mt-1.5 max-w-[16rem] text-[11px] text-muted">
                Datasets, SAQL, dashboards & Einstein Discovery — free, hands-on, no experience needed.
              </p>
              <NuxtLink
                :to="localePath('/foundations')"
                class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-inverted shadow-sm transition hover:scale-105"
              >
                Start the free course
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3.5"
                />
              </NuxtLink>
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
        </div>
      </div>
    </div>
  </div>
</template>
