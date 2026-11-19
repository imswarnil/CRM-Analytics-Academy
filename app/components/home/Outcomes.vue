<script setup lang="ts">
/**
 * What you will be able to build — three dashboards, drawn (no images), each
 * with one line of outcome. The home page's "why": results, not topics.
 */
const { t } = useI18n()
const items = ['pipeline', 'funnel', 'revenue'] as const
</script>

<template>
  <section class="border-b border-(--line) bg-(--card)">
    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('home.outcomes.eyebrow') }}
      </p>
      <h2 class="mt-2 max-w-2xl text-2xl font-bold tracking-[-0.02em] text-(--ink) sm:text-3xl">
        {{ t('home.outcomes.title') }}
      </h2>
      <ul class="mt-8 grid gap-4 md:grid-cols-3">
        <li
          v-for="(k, i) in items"
          :key="k"
          class="reveal overflow-hidden rounded-[8px] border border-(--line) bg-(--paper)"
        >
          <svg
            viewBox="0 0 320 150"
            class="block w-full border-b border-(--line) bg-(--card)"
            aria-hidden="true"
          >
            <!-- a dashboard tile header -->
            <rect
              x="16"
              y="14"
              width="90"
              height="7"
              rx="3.5"
              fill="var(--ink)"
              opacity=".7"
            />
            <rect
              x="16"
              y="27"
              width="54"
              height="5"
              rx="2.5"
              fill="var(--ink2)"
              opacity=".35"
            />
            <text
              x="304"
              y="28"
              text-anchor="end"
              font-size="18"
              font-weight="800"
              fill="var(--signal)"
            >{{ ['$4.2M', '31%', '+18%'][i] }}</text>
            <!-- pipeline: stacked bars by stage -->
            <g v-if="k === 'pipeline'">
              <g
                v-for="(h, b) in [52, 78, 64, 96, 84, 110]"
                :key="b"
              >
                <rect
                  :x="22 + b * 48"
                  :y="138 - h"
                  width="30"
                  :height="h"
                  rx="3"
                  fill="var(--signal)"
                  :opacity="0.35 + b * 0.11"
                  class="grow"
                  :style="{ animationDelay: `${b * 70}ms` }"
                />
              </g>
            </g>
            <!-- funnel: narrowing stages -->
            <g v-else-if="k === 'funnel'">
              <rect
                v-for="(w, b) in [280, 210, 140, 76]"
                :key="b"
                :x="160 - w / 2"
                :y="46 + b * 24"
                :width="w"
                height="18"
                rx="3"
                fill="var(--signal)"
                :opacity="1 - b * 0.18"
                class="grow-x"
                :style="{ animationDelay: `${b * 90}ms` }"
              />
            </g>
            <!-- revenue: a rising line with its area -->
            <g v-else>
              <path
                d="M16 128 L66 112 L116 118 L166 92 L216 80 L266 60 L304 48 L304 140 L16 140 Z"
                fill="var(--signal)"
                opacity=".12"
              />
              <path
                d="M16 128 L66 112 L116 118 L166 92 L216 80 L266 60 L304 48"
                fill="none"
                stroke="var(--signal)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="draw"
              />
              <circle
                cx="304"
                cy="48"
                r="5"
                fill="var(--signal)"
              />
            </g>
          </svg>
          <div class="p-5">
            <p class="font-bold text-(--ink)">
              {{ t(`home.outcomes.${k}.title`) }}
            </p>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ t(`home.outcomes.${k}.text`) }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .grow { transform-box: fill-box; transform-origin: bottom; animation: grow .7s cubic-bezier(.2, .8, .2, 1) both; }
  .grow-x { transform-box: fill-box; transform-origin: center; animation: grow-x .7s cubic-bezier(.2, .8, .2, 1) both; }
  .draw { stroke-dasharray: 400; animation: draw 1.4s ease-out both; }
}
@keyframes grow { from { transform: scaleY(0); } }
@keyframes grow-x { from { transform: scaleX(0); } }
@keyframes draw { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
</style>
