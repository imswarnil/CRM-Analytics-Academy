<script setup lang="ts">
/**
 * The two-column opener of a lesson: what you will learn on the left, an
 * animated conceptual figure on the right. Used in markdown:
 *
 *   ::lesson-hero{figure="data-model"}
 *   ---
 *   points:
 *     - "What an object, a record and a field are"
 *   ---
 *   ::
 *
 * Figures are pure SVG + CSS (no script, no request), so they prerender,
 * work offline and respect prefers-reduced-motion. Add a figure by adding a
 * branch below; keep it conceptual, on the Namaste palette.
 */
const props = withDefaults(defineProps<{
  figure?: 'data-model' | 'pipeline' | 'dashboard'
  points?: string[]
  label?: string
}>(), { figure: 'data-model', points: () => [], label: 'In this lesson' })

// The data model: Lead converts into Account + Contact + Opportunity.
const NODES = [
  { id: 'lead', x: 40, y: 110, w: 120, label: 'Lead', sub: 'a person, unqualified', tone: 'muted' },
  { id: 'account', x: 260, y: 30, w: 132, label: 'Account', sub: 'the company', tone: 'brand' },
  { id: 'contact', x: 260, y: 190, w: 132, label: 'Contact', sub: 'a person at it', tone: 'brand' },
  { id: 'opp', x: 470, y: 110, w: 140, label: 'Opportunity', sub: 'a deal, with an amount', tone: 'brand' }
] as const
const EDGES = [
  { d: 'M160 135 C 210 135, 210 55, 260 55', label: 'converts', delay: 0 },
  { d: 'M160 135 C 210 135, 210 215, 260 215', label: '', delay: 0.15 },
  { d: 'M392 55 C 430 55, 430 135, 470 135', label: 'AccountId', delay: 0.6 },
  { d: 'M392 215 C 430 215, 430 135, 470 135', label: 'Contact Role', delay: 0.75 }
]
</script>

<template>
  <section class="not-prose my-8 grid overflow-hidden rounded-[8px] border border-(--line) bg-(--card) lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <div class="p-6 sm:p-8">
      <p class="eyebrow">
        {{ props.label }}
      </p>
      <ul class="mt-4 space-y-3">
        <li
          v-for="(p, i) in props.points"
          :key="i"
          class="flex gap-3 text-[1.0625rem] leading-relaxed text-(--ink)"
        >
          <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-(--ice) text-xs font-bold text-(--signal)">{{ i + 1 }}</span>
          <span>{{ p }}</span>
        </li>
      </ul>
    </div>

    <div class="relative border-t border-(--line) bg-(--navy) lg:border-s lg:border-t-0">
      <svg
        v-if="props.figure === 'data-model'"
        class="lh-fig block h-auto w-full"
        viewBox="0 0 650 270"
        role="img"
        aria-label="A Lead converts into an Account, a Contact and an Opportunity, linked by their IDs."
      >
        <defs>
          <pattern
            id="lh-grid"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M26 0H0V26"
              fill="none"
              stroke="rgb(124 190 255 / .09)"
            />
          </pattern>
        </defs>
        <rect
          width="650"
          height="270"
          fill="url(#lh-grid)"
        />
        <g
          v-for="(e, i) in EDGES"
          :key="i"
        >
          <path
            :id="`lh-e${i}`"
            :d="e.d"
            class="lh-edge"
            :style="{ animationDelay: `${e.delay}s` }"
            fill="none"
            stroke="#1B96FF"
            stroke-width="2"
          />
          <!-- a record travelling the relationship -->
          <circle
            r="4"
            fill="#7CBEFF"
            class="lh-dot"
          >
            <animateMotion
              :dur="`${2.4 + i * 0.3}s`"
              :begin="`${1.2 + e.delay}s`"
              repeatCount="indefinite"
            >
              <mpath :href="`#lh-e${i}`" />
            </animateMotion>
          </circle>
          <text
            v-if="e.label"
            class="lh-label"
            :x="i < 2 ? 166 : 400"
            :y="i === 0 ? 92 : i === 2 ? 84 : i === 3 ? 196 : 0"
            :style="{ animationDelay: `${e.delay + 0.6}s` }"
          >{{ e.label }}</text>
        </g>
        <g
          v-for="(n, i) in NODES"
          :key="n.id"
          class="lh-node"
          :style="{ animationDelay: `${i * 0.18}s` }"
        >
          <rect
            :x="n.x"
            :y="n.y"
            :width="n.w"
            height="50"
            rx="6"
            :fill="n.tone === 'brand' ? '#0176D3' : '#032D60'"
            :stroke="n.tone === 'brand' ? '#1B96FF' : 'rgb(124 190 255 / .45)'"
          />
          <text
            :x="n.x + 14"
            :y="n.y + 22"
            class="lh-title"
          >{{ n.label }}</text>
          <text
            :x="n.x + 14"
            :y="n.y + 39"
            class="lh-sub"
          >{{ n.sub }}</text>
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.lh-title { font: 700 15px/1 var(--font-sans); fill: #fff; }
.lh-sub { font: 500 11px/1 var(--font-sans); fill: rgb(255 255 255 / .72); }
.lh-label { font: 700 10px/1 var(--font-sans); letter-spacing: .09em; text-transform: uppercase; fill: #7CBEFF; opacity: 0; animation: lh-fade .5s ease-out forwards; }
.lh-node { opacity: 0; transform: translateY(6px); animation: lh-in .5s cubic-bezier(.2, .8, .2, 1) forwards; }
.lh-edge { stroke-dasharray: 340; stroke-dashoffset: 340; animation: lh-draw 1s ease-out forwards; }
@keyframes lh-in { to { opacity: 1; transform: none; } }
@keyframes lh-draw { to { stroke-dashoffset: 0; } }
@keyframes lh-fade { to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .lh-node, .lh-label { animation: none; opacity: 1; transform: none; }
  .lh-edge { animation: none; stroke-dashoffset: 0; }
  .lh-dot { display: none; }
}
</style>
