<script setup lang="ts">
/**
 * The right half of a lesson's hero: the lesson's own image when it has one
 * (frontmatter `image`), otherwise an illustration for its section — the
 * section icon on a navy panel with a small dashboard scene and floating
 * charts. Static SVG + CSS; prerenders and works offline.
 */
const props = defineProps<{
  image?: string
  icon?: string
  section?: string
  minutes?: number
  video?: boolean
}>()
const { t } = useI18n()
</script>

<template>
  <figure class="relative hidden aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-(--navy) lg:block">
    <NuxtImg
      v-if="props.image"
      :src="props.image"
      alt=""
      class="size-full object-cover"
      loading="eager"
    />
    <template v-else>
      <BpFloatCharts tone="dark" />
      <!-- a small dashboard: KPI tiles, a bar chart and a funnel -->
      <svg
        class="absolute inset-0 m-auto w-[78%]"
        viewBox="0 0 320 210"
        aria-hidden="true"
      >
        <rect
          x="0"
          y="0"
          width="320"
          height="210"
          rx="10"
          fill="#ffffff"
          fill-opacity=".06"
          stroke="#7CBEFF"
          stroke-opacity=".3"
        />
        <g
          v-for="(k, i) in [['#1B96FF', 64], ['#7CBEFF', 48], ['#ffffff', 72]]"
          :key="i"
        >
          <rect
            :x="14 + i * 100"
            y="14"
            width="92"
            height="46"
            rx="6"
            fill="#ffffff"
            fill-opacity=".08"
          />
          <rect
            :x="24 + i * 100"
            y="26"
            :width="k[1] as number / 2"
            height="6"
            rx="3"
            fill="#ffffff"
            fill-opacity=".35"
          />
          <rect
            :x="24 + i * 100"
            y="38"
            :width="k[1] as number"
            height="12"
            rx="3"
            :fill="k[0] as string"
          />
        </g>
        <g class="la-bars">
          <rect
            v-for="(h, i) in [52, 74, 60, 96, 82, 110, 92]"
            :key="i"
            :x="20 + i * 24"
            :y="190 - h"
            width="14"
            :height="h"
            rx="2"
            :fill="i === 5 ? '#ffffff' : '#1B96FF'"
            :fill-opacity="i === 5 ? 1 : 0.85"
            class="la-bar"
            :style="{ animationDelay: `${i * 0.08}s` }"
          />
        </g>
        <g>
          <path
            v-for="(w, i) in [96, 74, 52, 32]"
            :key="i"
            :d="`M${258 - w / 2} ${82 + i * 26} h${w} l-6 20 h${-w + 12} z`"
            :fill="['#1B96FF', '#7CBEFF', '#B0D7FF', '#ffffff'][i]"
            fill-opacity=".9"
          />
        </g>
      </svg>
      <span class="absolute start-5 top-5 flex size-12 items-center justify-center rounded-[8px] bg-white/10 text-white">
        <UIcon
          :name="props.icon || 'i-lucide-book-open'"
          class="size-6"
        />
      </span>
    </template>
    <figcaption class="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/50 to-transparent px-5 pb-4 pt-10 text-sm font-medium text-white">
      <span class="truncate">{{ props.section }}</span>
      <span
        v-if="props.minutes"
        class="ms-auto flex shrink-0 items-center gap-1.5"
      >
        <UIcon
          :name="props.video ? 'i-lucide-circle-play' : 'i-lucide-clock'"
          class="size-4"
        />{{ props.minutes }} min<template v-if="props.video">
          · {{ t('lesson.video') }}
        </template>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.la-bar { transform-box: fill-box; transform-origin: bottom; animation: la-grow .7s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes la-grow { from { transform: scaleY(0); } }
@media (prefers-reduced-motion: reduce) { .la-bar { animation: none; } }
</style>
