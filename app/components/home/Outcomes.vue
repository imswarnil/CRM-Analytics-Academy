<script setup lang="ts">
/**
 * The home page's "what you will build": the dashboards a business runs on,
 * each drawn as a small moving chart — conversion (a funnel), adoption (a
 * rising line), snapshots (a trend built week by week) and AI (a prediction
 * with its top factors). Pure SVG + CSS from the design tokens: prerendered,
 * no images, no requests, still for prefers-reduced-motion.
 */
const { t } = useI18n()
const CARDS = [
  { key: 'conversion', icon: 'i-lucide-filter' },
  { key: 'adoption', icon: 'i-lucide-users' },
  { key: 'snapshots', icon: 'i-lucide-calendar-range' },
  { key: 'ai', icon: 'i-lucide-sparkles' }
] as const
const FUNNEL = [100, 72, 46, 28]
const WEEKS = [34, 42, 38, 51, 47, 58, 63, 70]
const FACTORS = [82, 61, 44]
</script>

<template>
  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <li
      v-for="(c, i) in CARDS"
      :key="c.key"
      class="reveal outcome group flex flex-col overflow-hidden rounded-[8px] border border-(--line) bg-(--card)"
      :style="{ '--i': i }"
    >
      <!-- the chart -->
      <div
        class="relative h-36 border-b border-(--line) bg-(--paper) px-5 pt-5"
        aria-hidden="true"
      >
        <svg
          v-if="c.key === 'conversion'"
          viewBox="0 0 200 100"
          class="size-full"
        >
          <rect
            v-for="(w, k) in FUNNEL"
            :key="k"
            class="grow-x"
            :x="100 - w"
            :y="k * 24 + 4"
            :width="w * 2"
            height="18"
            rx="2"
            :fill="k === FUNNEL.length - 1 ? 'var(--signal)' : 'var(--tide)'"
            :opacity="1 - k * 0.15"
            :style="{ animationDelay: `${k * 0.12}s` }"
          />
          <text
            x="196"
            y="94"
            text-anchor="end"
            class="lbl"
          >28%</text>
        </svg>

        <svg
          v-else-if="c.key === 'adoption'"
          viewBox="0 0 200 100"
          class="size-full"
        >
          <path
            d="M0 96 H200"
            stroke="var(--line)"
          />
          <path
            class="draw"
            d="M4 86 C 30 82, 44 74, 64 70 S 100 52, 120 44 S 160 22, 196 12"
            fill="none"
            stroke="var(--signal)"
            stroke-width="3"
            stroke-linecap="round"
            pathLength="1"
          />
          <circle
            class="pop"
            cx="196"
            cy="12"
            r="5"
            fill="var(--signal)"
          />
          <g fill="var(--tide)">
            <circle
              v-for="k in 6"
              :key="k"
              class="pop"
              :cx="k * 14"
              cy="40"
              r="4"
              :style="{ animationDelay: `${0.3 + k * 0.08}s` }"
            />
          </g>
          <text
            x="4"
            y="22"
            class="lbl"
          >+38%</text>
        </svg>

        <svg
          v-else-if="c.key === 'snapshots'"
          viewBox="0 0 200 100"
          class="size-full"
        >
          <rect
            v-for="(h, k) in WEEKS"
            :key="k"
            class="grow-y"
            :x="k * 25 + 2"
            :y="96 - h"
            width="18"
            :height="h"
            rx="2"
            :fill="k === WEEKS.length - 1 ? 'var(--signal)' : 'var(--tide)'"
            :opacity="k === WEEKS.length - 1 ? 1 : 0.55"
            :style="{ animationDelay: `${k * 0.07}s` }"
          />
        </svg>

        <svg
          v-else
          viewBox="0 0 200 100"
          class="size-full"
        >
          <text
            x="0"
            y="26"
            class="big"
          >0.84</text>
          <text
            x="70"
            y="26"
            class="lbl"
          >{{ t('home.v3.ai.metric') }}</text>
          <g
            v-for="(w, k) in FACTORS"
            :key="k"
          >
            <rect
              x="0"
              :y="44 + k * 18"
              width="200"
              height="10"
              rx="5"
              fill="var(--line)"
            />
            <rect
              class="grow-x"
              x="0"
              :y="44 + k * 18"
              :width="w * 2"
              height="10"
              rx="5"
              fill="var(--signal)"
              :opacity="1 - k * 0.25"
              :style="{ animationDelay: `${k * 0.15}s` }"
            />
          </g>
        </svg>
      </div>

      <!-- the words -->
      <div class="flex flex-1 flex-col p-5">
        <p class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.09em] text-(--signal)">
          <UIcon
            :name="c.icon"
            class="size-4"
          />{{ t(`home.v3.${c.key}.tag`) }}
        </p>
        <h3 class="mt-2 text-lg font-bold leading-snug text-(--ink)">
          {{ t(`home.v3.${c.key}.title`) }}
        </h3>
        <p class="mt-1 text-[0.9375rem] leading-relaxed text-(--ink2)">
          {{ t(`home.v3.${c.key}.text`) }}
        </p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.outcome { transition: transform .25s cubic-bezier(.2, .8, .2, 1), border-color .25s, box-shadow .25s }
.outcome:hover { transform: translateY(-3px); border-color: var(--signal); box-shadow: 0 12px 28px -16px rgb(3 45 96 / .45) }
.lbl { font: 700 11px/1 var(--font-sans, sans-serif); fill: var(--ink2); letter-spacing: .04em }
.big { font: 700 26px/1 var(--font-sans, sans-serif); fill: var(--ink) }
.grow-x { transform-box: fill-box; transform-origin: left center; animation: gx 1s cubic-bezier(.2, .8, .2, 1) both }
.grow-y { transform-box: fill-box; transform-origin: center bottom; animation: gy .8s cubic-bezier(.2, .8, .2, 1) both }
.draw { stroke-dasharray: 1; animation: draw 1.6s cubic-bezier(.4, 0, .2, 1) both }
.pop { transform-box: fill-box; transform-origin: center; animation: pop .5s cubic-bezier(.2, .8, .2, 1) both 1.2s }
/* Start when the card scrolls in, where the browser can tell. */
@supports (animation-timeline: view()) {
  .grow-x, .grow-y, .draw, .pop { animation-timeline: view(); animation-range: entry 10% cover 40% }
}
@keyframes gx { from { transform: scaleX(0) } }
@keyframes gy { from { transform: scaleY(0) } }
@keyframes draw { from { stroke-dashoffset: 1 } }
@keyframes pop { from { transform: scale(0); opacity: 0 } }
@media (prefers-reduced-motion: reduce) {
  .grow-x, .grow-y, .draw, .pop { animation: none }
  .outcome { transition: none }
}
</style>
