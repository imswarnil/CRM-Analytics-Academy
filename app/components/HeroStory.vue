<script setup lang="ts">
// Animated storyboard of the CRM Analytics pipeline:
// connect → recipe → dataset → query/binding → donut → line → table → dashboard.

const C = {
  d: 'var(--color-salesforce-700)',
  m: 'var(--color-salesforce-500)',
  l: 'var(--color-salesforce-400)',
  xl: 'var(--color-salesforce-300)',
  xxl: 'var(--color-salesforce-200)'
}

interface Scene { key: string, file: string, step: string, caption: string }
const SCENES: Scene[] = [
  { key: 'connect', file: 'data-manager', step: '1', caption: 'Connect Salesforce, Snowflake & more' },
  { key: 'recipe', file: 'revenue.recipe', step: '2', caption: 'Build a recipe, run it → dataset' },
  { key: 'query', file: 'lens.saql', step: '3', caption: 'Explore: query + dynamic grouping' },
  { key: 'donut', file: 'lens.saql', step: '4', caption: 'Faster query → donut chart' },
  { key: 'line', file: 'lens.saql', step: '5', caption: 'Fastest query → line chart' },
  { key: 'table', file: 'lens.saql', step: '6', caption: 'Switch to table mode' },
  { key: 'dashboard', file: 'pipeline.dashboard', step: '7', caption: 'Assemble · name · share · act' }
]

const sources = [
  { icon: 'i-simple-icons-salesforce', label: 'Salesforce', color: '#00A1E0' },
  { icon: 'i-simple-icons-snowflake', label: 'Snowflake', color: '#29B5E8' },
  { icon: 'i-lucide-database', label: '+ 12 more', color: 'var(--color-salesforce-500)' }
]
const recipeNodes = [
  { icon: 'i-lucide-file-input', label: 'Input' },
  { icon: 'i-lucide-merge', label: 'Join' },
  { icon: 'i-lucide-sigma', label: 'Aggregate' },
  { icon: 'i-lucide-table-2', label: 'Output' }
]
const bars = [
  { label: 'Won', value: 100, color: C.d },
  { label: 'Negotiate', value: 74, color: C.m },
  { label: 'Proposal', value: 56, color: C.l },
  { label: 'Qualify', value: 35, color: C.xl },
  { label: 'Prospect', value: 22, color: C.xxl }
]
const donutData = [
  { label: 'Americas', value: 42, color: C.d },
  { label: 'EMEA', value: 28, color: C.m },
  { label: 'APAC', value: 18, color: C.l },
  { label: 'LATAM', value: 12, color: C.xl }
]
const linePts = [40, 62, 55, 85]
const rows = [
  { a: 'Won', b: '1,204', c: '$3.4M' },
  { a: 'Negotiate', b: '892', c: '$2.5M' },
  { a: 'Proposal', b: '640', c: '$1.9M' },
  { a: 'Qualify', b: '410', c: '$1.1M' }
]
const actions = [
  { icon: 'i-lucide-pencil', label: 'Name' },
  { icon: 'i-lucide-share-2', label: 'Share' },
  { icon: 'i-lucide-download', label: 'Download' },
  { icon: 'i-lucide-code', label: 'Embed' },
  { icon: 'i-lucide-mouse-pointer-click', label: 'Drill' },
  { icon: 'i-lucide-zap', label: 'Action' }
]

const scene = ref(0)
const play = ref(false)
const current = computed(() => SCENES[scene.value]!)

// Donut as a conic-gradient (segments) + center hole.
const donutGradient = computed(() => {
  const total = donutData.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const stops = donutData.map((d) => {
    const start = (acc / total) * 100
    acc += d.value
    const end = (acc / total) * 100
    return `${d.color} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
})

// Line geometry.
const LW = 300
const LH = 120
const PAD = 12
const lineMax = Math.max(...linePts)
const linePoints = linePts.map((v, i) => {
  const x = PAD + (i / (linePts.length - 1)) * (LW - PAD * 2)
  const y = LH - PAD - (v / lineMax) * (LH - PAD * 2)
  return { x, y }
})
const linePolyline = linePoints.map(p => `${p.x},${p.y}`).join(' ')
const lineArea = `${PAD},${LH - PAD} ${linePolyline} ${LW - PAD},${LH - PAD}`

const barH = (v: number) => `${(v / 100) * 96}px`

// ---- Loop engine ----------------------------------------------------------
const timers: ReturnType<typeof setTimeout>[] = []
let auto: ReturnType<typeof setInterval> | null = null
const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

function clearTimers() {
  timers.splice(0).forEach(clearTimeout)
}

function show(i: number) {
  clearTimers()
  scene.value = i
  play.value = false
  later(() => {
    play.value = true
  }, 150)
}

function next() {
  show((scene.value + 1) % SCENES.length)
}

function stopAuto() {
  if (auto) {
    clearInterval(auto)
    auto = null
  }
}

function startAuto() {
  stopAuto()
  auto = setInterval(next, 3800)
}

function onNext() {
  next()
  startAuto()
}

onMounted(() => {
  const reduce = import.meta.client && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    scene.value = SCENES.length - 1
    play.value = true
    return
  }
  show(0)
  startAuto()
})

onBeforeUnmount(() => {
  stopAuto()
  clearTimers()
})
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

      <!-- Stage -->
      <div class="relative flex min-h-[260px] items-center justify-center p-6">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 translate-y-2"
          leave-active-class="transition duration-150"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <!-- 1 · CONNECT SOURCES -->
          <div
            v-if="current.key === 'connect'"
            key="connect"
            class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2"
          >
            <div class="space-y-3">
              <div
                v-for="(s, i) in sources"
                :key="s.label"
                class="flex items-center gap-2 rounded-lg border border-default bg-muted/40 px-3 py-2 transition-all duration-500"
                :class="play ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'"
                :style="{ transitionDelay: `${i * 120}ms` }"
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
              class="h-28 w-20"
            >
              <path
                v-for="(y, i) in [22, 60, 98]"
                :key="i"
                :d="`M2 ${y} C 40 ${y}, 40 60, 78 60`"
                fill="none"
                stroke="var(--ui-primary)"
                stroke-width="2"
                :class="play ? 'animate-dash' : ''"
                :style="{ opacity: play ? 0.7 : 0.15 }"
              />
            </svg>

            <div
              class="flex flex-col items-center gap-2 justify-self-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 transition-all duration-500"
              :class="play ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
              :style="{ transitionDelay: '400ms' }"
            >
              <div class="flex items-end gap-0.5">
                <span
                  class="w-1.5 rounded-sm bg-salesforce-700"
                  style="height:8px"
                />
                <span
                  class="w-1.5 rounded-sm bg-salesforce-500"
                  style="height:14px"
                />
                <span
                  class="w-1.5 rounded-sm bg-salesforce-300"
                  style="height:20px"
                />
              </div>
              <span class="text-[11px] font-semibold text-primary">CRM Analytics</span>
            </div>
          </div>

          <!-- 2 · RECIPE -->
          <div
            v-else-if="current.key === 'recipe'"
            key="recipe"
            class="w-full"
          >
            <div class="flex items-center justify-between">
              <div
                v-for="(n, i) in recipeNodes"
                :key="n.label"
                class="flex items-center"
              >
                <div
                  class="flex flex-col items-center gap-1.5 rounded-lg border bg-default px-3 py-2.5 transition-all duration-300"
                  :class="play ? 'border-primary/50 opacity-100' : 'border-default opacity-40'"
                  :style="{ transitionDelay: `${i * 220}ms` }"
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
                  class="mx-1 size-4 shrink-0 text-dimmed transition-opacity duration-300"
                  :class="play ? 'opacity-100' : 'opacity-20'"
                  :style="{ transitionDelay: `${i * 220 + 110}ms` }"
                />
              </div>
            </div>

            <!-- Run progress -->
            <div class="mt-6">
              <div class="mb-2 flex items-center gap-2 text-[11px] text-muted">
                <UIcon
                  name="i-lucide-play"
                  class="size-3.5 text-primary"
                />
                Running recipe…
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full bg-primary transition-all ease-out"
                  :style="{ width: play ? '100%' : '0%', transitionDuration: '1400ms' }"
                />
              </div>
            </div>

            <!-- Dataset chip -->
            <div
              class="mt-6 flex items-center gap-3 rounded-xl border border-default bg-muted/40 p-3 transition-all duration-500"
              :class="play ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
              :style="{ transitionDelay: '1300ms' }"
            >
              <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <UIcon
                  name="i-lucide-table-2"
                  class="size-5"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-highlighted">
                  Opportunities dataset
                </p>
                <p class="text-[11px] text-muted">
                  1.2M rows · ready to explore
                </p>
              </div>
              <UIcon
                name="i-lucide-check-circle"
                class="ml-auto size-4 text-green-500"
              />
            </div>
          </div>

          <!-- 3 · QUERY + BINDING -->
          <div
            v-else-if="current.key === 'query'"
            key="query"
            class="w-full"
          >
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 font-mono text-[11px] text-toned">
                <span class="font-semibold text-primary">group</span> q by
                <span class="rounded bg-primary/15 px-1.5 py-0.5 font-semibold text-primary">'Stage' ▾</span>
              </span>
              <span class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted">
                <UIcon
                  name="i-lucide-link"
                  class="size-3"
                /> binding
              </span>
            </div>
            <div class="flex h-[150px] items-end justify-between gap-2">
              <div
                v-for="(bar, i) in bars"
                :key="bar.label"
                class="flex flex-1 flex-col items-center justify-end gap-1.5"
              >
                <div
                  class="w-full rounded-t-md ease-out"
                  :style="{
                    height: play ? barH(bar.value) : '0px',
                    background: bar.color,
                    transitionProperty: 'height',
                    transitionDuration: '600ms',
                    transitionDelay: `${i * 80}ms`
                  }"
                />
                <span class="truncate text-[10px] text-dimmed">{{ bar.label }}</span>
              </div>
            </div>
          </div>

          <!-- 4 · DONUT -->
          <div
            v-else-if="current.key === 'donut'"
            key="donut"
            class="flex w-full items-center justify-center gap-6"
          >
            <div
              class="relative size-36 rounded-full transition-all duration-700"
              :class="play ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-90'"
              :style="{ background: donutGradient }"
            >
              <div class="absolute inset-[22%] rounded-full bg-default" />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-highlighted">$9.0M</span>
              </div>
            </div>
            <div class="space-y-2">
              <div
                v-for="(d, i) in donutData"
                :key="d.label"
                class="flex items-center gap-2 text-[11px] transition-opacity duration-500"
                :class="play ? 'opacity-100' : 'opacity-0'"
                :style="{ transitionDelay: `${300 + i * 100}ms` }"
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

          <!-- 5 · LINE -->
          <div
            v-else-if="current.key === 'line'"
            key="line"
            class="w-full"
          >
            <svg
              :viewBox="`0 0 ${LW} ${LH}`"
              class="h-[170px] w-full"
              preserveAspectRatio="none"
            >
              <polygon
                :points="lineArea"
                fill="var(--ui-primary)"
                :style="{ opacity: play ? 0.12 : 0, transition: 'opacity 800ms ease' }"
              />
              <polyline
                :points="linePolyline"
                fill="none"
                stroke="var(--ui-primary)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                pathLength="1"
                :style="{ strokeDasharray: 1, strokeDashoffset: play ? 0 : 1, transition: 'stroke-dashoffset 1000ms ease-out' }"
              />
              <circle
                v-for="(p, i) in linePoints"
                :key="i"
                :cx="p.x"
                :cy="p.y"
                r="4"
                fill="var(--ui-primary)"
                :style="{ opacity: play ? 1 : 0, transition: `opacity 300ms ease ${500 + i * 130}ms` }"
              />
            </svg>
          </div>

          <!-- 6 · TABLE -->
          <div
            v-else-if="current.key === 'table'"
            key="table"
            class="w-full overflow-hidden rounded-lg border border-default"
          >
            <div class="grid grid-cols-3 bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              <span>Stage</span>
              <span class="text-right">Deals</span>
              <span class="text-right">Amount</span>
            </div>
            <div
              v-for="(r, i) in rows"
              :key="r.a"
              class="grid grid-cols-3 border-t border-default px-3 py-2.5 text-xs transition-all duration-400"
              :class="play ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'"
              :style="{ transitionDelay: `${i * 120}ms` }"
            >
              <span class="font-medium text-toned">{{ r.a }}</span>
              <span class="text-right text-muted">{{ r.b }}</span>
              <span class="text-right font-semibold text-highlighted">{{ r.c }}</span>
            </div>
          </div>

          <!-- 7 · DASHBOARD -->
          <div
            v-else
            key="dashboard"
            class="w-full"
          >
            <!-- Action toolbar -->
            <div class="mb-3 flex items-center gap-1.5">
              <span class="mr-auto text-[11px] font-semibold text-highlighted">Pipeline Health</span>
              <UTooltip
                v-for="(a, i) in actions"
                :key="a.label"
                :text="a.label"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-md border border-default text-muted transition-all"
                  :class="play ? 'opacity-100' : 'opacity-0'"
                  :style="{ transitionDelay: `${i * 90}ms` }"
                >
                  <UIcon
                    :name="a.icon"
                    class="size-3.5"
                  />
                </span>
              </UTooltip>
            </div>

            <!-- Widget grid -->
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(k, i) in ['$9.0M', '1,204', '38%']"
                :key="k"
                class="rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-400"
                :class="play ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
                :style="{ transitionDelay: `${i * 90}ms` }"
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
                class="flex h-20 items-end gap-1 rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-500"
                :class="play ? 'opacity-100' : 'opacity-0'"
                :style="{ transitionDelay: '300ms' }"
              >
                <span
                  v-for="bar in bars"
                  :key="bar.label"
                  class="flex-1 rounded-t-sm"
                  :style="{ height: play ? barH(bar.value * 0.6) : '0px', background: bar.color, transition: 'height 600ms ease' }"
                />
              </div>
              <div
                class="flex h-20 items-center justify-center rounded-lg border border-default bg-muted/30 p-2.5 transition-all duration-500"
                :class="play ? 'opacity-100' : 'opacity-0'"
                :style="{ transitionDelay: '420ms' }"
              >
                <div
                  class="relative size-14 rounded-full"
                  :style="{ background: donutGradient }"
                >
                  <div class="absolute inset-[24%] rounded-full bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between gap-3 border-t border-default bg-muted/30 px-4 py-3">
        <div class="flex items-center gap-2.5">
          <span class="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-inverted">{{ current.step }}</span>
          <span class="text-[11px] text-muted">{{ current.caption }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden gap-1 sm:flex">
            <button
              v-for="(s, i) in SCENES"
              :key="s.key"
              type="button"
              :aria-label="`Go to step ${i + 1}`"
              class="size-1.5 rounded-full transition-colors"
              :class="i === scene ? 'bg-primary' : 'bg-default/30 hover:bg-default/50'"
              @click="show(i); startAuto()"
            />
          </div>
          <UButton
            icon="i-lucide-chevron-right"
            size="xs"
            color="primary"
            variant="soft"
            class="rounded-full"
            aria-label="Next step"
            @click="onNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>
