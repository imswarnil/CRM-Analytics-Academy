<script setup lang="ts">
/**
 * The hero's right column: a looping, slide-style walkthrough of what the
 * curriculum actually teaches — connect data, query it, build a dashboard,
 * predict on it.
 *
 * Drawn rather than recorded. A screen capture would be a multi-megabyte video
 * that cannot be themed, cannot be translated, and would be the largest asset
 * on a site whose whole point is being fast. This is SVG and CSS: it themes
 * with the palette, the labels run through i18n, and it costs nothing.
 *
 * The loop pauses when the tab is hidden and does not run at all under
 * prefers-reduced-motion, where it settles on the finished dashboard instead.
 */
const { t } = useI18n()

const SCENES = 4
const SCENE_MS = 3200

const scene = ref(0)
const reduced = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function start() {
  stop()
  if (reduced.value) return
  timer = setInterval(() => {
    scene.value = (scene.value + 1) % SCENES
  }, SCENE_MS)
}

function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function show(i: number) {
  scene.value = i
  start()
}

onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = mq.matches
  // Settle on the dashboard rather than the empty first frame.
  if (reduced.value) scene.value = 2
  start()

  const onMotion = (e: MediaQueryListEvent) => {
    reduced.value = e.matches
    start()
  }
  // A loop running in a background tab is wasted battery.
  const onVisibility = () => (document.hidden ? stop() : start())

  mq.addEventListener('change', onMotion)
  document.addEventListener('visibilitychange', onVisibility)

  onScopeDispose(() => {
    stop()
    mq.removeEventListener('change', onMotion)
    document.removeEventListener('visibilitychange', onVisibility)
  })
})

const steps = computed(() => [
  { label: t('demo.connect'), icon: 'i-lucide-plug' },
  { label: t('demo.query'), icon: 'i-lucide-terminal' },
  { label: t('demo.build'), icon: 'i-lucide-layout-dashboard' },
  { label: t('demo.predict'), icon: 'i-lucide-sparkles' }
])

// Deterministic bar heights — Math.random() would give a different result on
// the server and the client and trip a hydration mismatch.
const BARS = [46, 72, 38, 90, 61, 78, 52]
</script>

<template>
  <div class="demo">
    <!-- Window chrome. Reads as "this is the product", which a bare panel does
         not, and it costs three dots and a title bar. -->
    <div class="demo__chrome">
      <span class="demo__dot demo__dot--r" />
      <span class="demo__dot demo__dot--y" />
      <span class="demo__dot demo__dot--g" />
      <span class="demo__url">
        <Icon
          name="i-lucide-lock"
          class="demo__lock"
        />
        analytics.salesforce.com
      </span>
    </div>

    <div class="demo__stage">
      <!-- 1 ─ Connect -->
      <div
        class="demo__scene"
        :class="{ 'is-on': scene === 0 }"
      >
        <p class="demo__cap">
          {{ t('demo.connectCap') }}
        </p>
        <div class="pipe">
          <div class="pipe__srcs">
            <span
              v-for="(s, i) in ['Salesforce', 'Snowflake', 'CSV']"
              :key="s"
              class="pipe__src"
              :style="{ '--d': `${i * 140}ms` }"
            >{{ s }}</span>
          </div>
          <svg
            class="pipe__wires"
            viewBox="0 0 60 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 20 C40 20 20 60 60 60" />
            <path d="M0 60 H60" />
            <path d="M0 100 C40 100 20 60 60 60" />
          </svg>
          <div class="pipe__out">
            <Icon name="i-lucide-database" />
            <span>dataset</span>
          </div>
        </div>
      </div>

      <!-- 2 ─ SAQL -->
      <div
        class="demo__scene"
        :class="{ 'is-on': scene === 1 }"
      >
        <p class="demo__cap">
          {{ t('demo.queryCap') }}
        </p>
        <pre class="saql"><code><span class="saql__k">q</span> = load <span class="saql__s">"Opportunity"</span>;
<span class="saql__k">q</span> = filter q by <span class="saql__s">'Stage'</span> == <span class="saql__s">"Won"</span>;
<span class="saql__k">q</span> = group q by <span class="saql__s">'Region'</span>;
<span class="saql__k">q</span> = foreach q generate
      <span class="saql__s">'Region'</span> as <span class="saql__s">'Region'</span>,
      sum(<span class="saql__s">'Amount'</span>) as <span class="saql__s">'Revenue'</span>;<span class="saql__caret" /></code></pre>
      </div>

      <!-- 3 ─ Dashboard -->
      <div
        class="demo__scene"
        :class="{ 'is-on': scene === 2 }"
      >
        <div class="kpis">
          <div
            v-for="(k, i) in [
              { v: '$4.2M', l: t('demo.kpiRevenue'), t: 'up' },
              { v: '38%', l: t('demo.kpiWin'), t: 'up' },
              { v: '21d', l: t('demo.kpiCycle'), t: 'down' }
            ]"
            :key="k.l"
            class="kpi"
            :style="{ '--d': `${i * 90}ms` }"
          >
            <p class="kpi__v">
              {{ k.v }}
            </p>
            <p class="kpi__l">
              {{ k.l }}
            </p>
            <Icon
              :name="k.t === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
              class="kpi__t"
              :class="`kpi__t--${k.t}`"
            />
          </div>
        </div>

        <div class="charts">
          <div class="chart chart--bars">
            <span
              v-for="(h, i) in BARS"
              :key="i"
              class="bar"
              :style="{ '--h': `${h}%`, '--d': `${i * 70}ms` }"
            />
          </div>
          <div class="chart chart--donut">
            <svg
              viewBox="0 0 42 42"
              aria-hidden="true"
            >
              <circle
                class="donut__track"
                cx="21"
                cy="21"
                r="16"
              />
              <circle
                class="donut__fill"
                cx="21"
                cy="21"
                r="16"
              />
            </svg>
            <span class="donut__label">72<small>%</small></span>
          </div>
        </div>
      </div>

      <!-- 4 ─ Predict -->
      <div
        class="demo__scene"
        :class="{ 'is-on': scene === 3 }"
      >
        <p class="demo__cap">
          {{ t('demo.predictCap') }}
        </p>
        <div class="predict">
          <div class="predict__score">
            <svg
              viewBox="0 0 42 42"
              aria-hidden="true"
            >
              <circle
                class="donut__track"
                cx="21"
                cy="21"
                r="16"
              />
              <circle
                class="donut__fill donut__fill--done"
                cx="21"
                cy="21"
                r="16"
              />
            </svg>
            <span class="predict__pct">84<small>%</small></span>
          </div>
          <ul class="predict__why">
            <li
              v-for="(r, i) in [t('demo.why1'), t('demo.why2'), t('demo.why3')]"
              :key="r"
              :style="{ '--d': `${i * 120}ms` }"
            >
              <Icon name="i-lucide-circle-check" />{{ r }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Step rail. Also the control: these are real buttons, so the loop is
         steerable by keyboard and does not trap someone who wants scene 3. -->
    <div
      class="demo__rail"
      role="tablist"
      :aria-label="t('demo.steps')"
    >
      <button
        v-for="(s, i) in steps"
        :key="s.label"
        class="demo__step"
        :class="{ 'is-on': scene === i }"
        type="button"
        role="tab"
        :aria-selected="scene === i"
        @click="show(i)"
      >
        <Icon
          :name="s.icon"
          class="demo__step-icon"
        />
        <span class="demo__step-label">{{ s.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo {
  position: relative;
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  background: var(--c-bg-raised);
  box-shadow: var(--shadow-4);
  overflow: hidden;
}

.demo__chrome {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  padding: var(--s-2) var(--s-3);
  background: var(--c-bg-sunken);
  border-block-end: 1px solid var(--c-line);
}

.demo__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: var(--r-full);
}

.demo__dot--r { background: #FF5F57; }
.demo__dot--y { background: #FEBC2E; }
.demo__dot--g { background: #28C840; }

.demo__url {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  margin-inline: auto;
  padding: 0.1rem 0.6rem;
  border-radius: var(--r-full);
  background: var(--c-bg);
  font-size: var(--t-micro);
  color: var(--c-text-faint);
}

.demo__lock { width: 0.65rem; height: 0.65rem; }

// Fixed height so the card does not resize as scenes swap — a jumping hero is
// the fastest way to make a page feel broken.
.demo__stage {
  position: relative;
  height: 19rem;
  padding: var(--s-4);
}

.demo__scene {
  position: absolute;
  inset: var(--s-4);
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  opacity: 0;
  transform: translateY(0.5rem);
  pointer-events: none;
  transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-spring);

  &.is-on {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
}

.demo__cap {
  margin: 0;
  font-size: var(--t-tiny);
  font-weight: 600;
  color: var(--c-text-faint);
}

// ── scene 1: pipeline
.pipe {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-2);
}

.pipe__srcs {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.pipe__src {
  padding: var(--s-2) var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-sm);
  background: var(--c-bg);
  font-size: var(--t-micro);
  font-weight: 600;
  white-space: nowrap;
  animation: pop var(--dur-slow) var(--ease-spring) both;
  animation-delay: var(--d);
}

.pipe__wires {
  height: 8rem;

  path {
    fill: none;
    stroke: var(--aqua);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
    animation: flow 1s linear infinite;
  }
}

@keyframes flow { to { stroke-dashoffset: -16; } }

.pipe__out {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-1);
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--c-brand);
  color: var(--c-on-brand);
  font-size: var(--t-micro);
  font-weight: 700;

  svg, span:first-child { width: 1.25rem; height: 1.25rem; }
}

// ── scene 2: SAQL
.saql {
  flex: 1;
  margin: 0;
  padding: var(--s-3);
  border-radius: var(--r-sm);
  background: var(--ink-95);
  color: var(--ink-20);
  font-size: 0.72rem;
  line-height: 1.75;
  overflow: hidden;
}

.saql__k { color: var(--aqua); }
.saql__s { color: #FFD08A; }

.saql__caret {
  display: inline-block;
  width: 0.5em;
  height: 1em;
  margin-inline-start: 2px;
  background: var(--bulma-primary);
  vertical-align: -0.15em;
  animation: blink 1s steps(2) infinite;
}

@keyframes blink { 50% { opacity: 0; } }

// ── scene 3: dashboard
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-2);
}

.kpi {
  position: relative;
  padding: var(--s-2) var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-sm);
  background: var(--c-bg);
  animation: pop var(--dur-slow) var(--ease-spring) both;
  animation-delay: var(--d);
}

.kpi__v {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 750;
}

.kpi__l {
  margin: 0;
  font-size: 0.6rem;
  color: var(--c-text-faint);
}

.kpi__t {
  position: absolute;
  inset-block-start: var(--s-2);
  inset-inline-end: var(--s-2);
  width: 0.75rem;
  height: 0.75rem;
}

.kpi__t--up { color: var(--bulma-primary); }
.kpi__t--down { color: var(--aqua); }

.charts {
  flex: 1;
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: var(--s-3);
  min-height: 0;
}

.chart {
  padding: var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-sm);
  background: var(--c-bg);
}

.chart--bars {
  display: flex;
  align-items: flex-end;
  gap: var(--s-2);
}

.bar {
  flex: 1;
  height: var(--h);
  border-radius: var(--r-xs) var(--r-xs) 0 0;
  background: var(--bulma-primary);
  transform-origin: bottom;
  animation: grow var(--dur-slow) var(--ease-spring) both;
  animation-delay: var(--d);
}

@keyframes grow { from { transform: scaleY(0); } }

.chart--donut {
  position: relative;
  display: grid;
  place-items: center;

  svg { width: 100%; max-width: 6rem; transform: rotate(-90deg); }
}

.donut__track,
.donut__fill {
  fill: none;
  stroke-width: 5;
}

.donut__track { stroke: var(--c-bg-inset); }

.donut__fill {
  stroke: var(--aqua);
  stroke-linecap: round;
  stroke-dasharray: 100.5;
  animation: sweep 1.1s var(--ease-spring) both;
}

.donut__fill--done { stroke: var(--bulma-primary); }

@keyframes sweep {
  from { stroke-dashoffset: 100.5; }
  to { stroke-dashoffset: 28; }
}

.donut__label,
.predict__pct {
  position: absolute;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 750;

  small { font-size: 0.6em; color: var(--c-text-faint); }
}

// ── scene 4: prediction
.predict {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--s-4);
}

.predict__score {
  position: relative;
  display: grid;
  place-items: center;
  width: 7rem;

  svg { width: 100%; transform: rotate(-90deg); }
}

.predict__why {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);

  li {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    font-size: var(--t-tiny);
    color: var(--c-text-soft);
    animation: pop var(--dur-slow) var(--ease-spring) both;
    animation-delay: var(--d);
  }

  svg { width: 0.9rem; height: 0.9rem; color: var(--bulma-primary); flex-shrink: 0; }
}

@keyframes pop {
  from { opacity: 0; transform: translateY(0.4rem) scale(0.96); }
}

// ── rail
.demo__rail {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block-start: 1px solid var(--c-line);
  background: var(--c-bg-sunken);
}

.demo__step {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-1);
  font-size: var(--t-micro);
  font-weight: 600;
  color: var(--c-text-faint);
  transition: color var(--dur-fast) var(--ease-out);

  &.is-on { color: var(--c-brand-text); }

  // The active step's underline doubles as the loop's progress indicator.
  &.is-on::after {
    content: "";
    position: absolute;
    inset-block-start: -1px;
    inset-inline: 0;
    height: 2px;
    background: var(--c-brand);
  }

  & + & { border-inline-start: 1px solid var(--c-line); }
}

.demo__step-icon { width: 0.9rem; height: 0.9rem; }

.demo__step-label {
  @media (max-width: 30rem) { display: none; }
}
</style>
