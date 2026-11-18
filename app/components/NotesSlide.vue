<script setup lang="ts">
import type { NotesCollectionItem } from '@nuxt/content'

/**
 * One gallery slide on /notes. `cover` is a stack of sheets, `sheet` the real
 * notes sheet scaled into the frame, `formats` the PDF + Markdown pair.
 * `thumb` drops the moving parts for the thumbnail strip.
 */
defineProps<{
  slide: { kind: 'cover' } | { kind: 'sheet', sheet: NotesCollectionItem } | { kind: 'formats' }
  thumb?: boolean
}>()
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- A real sheet, scaled down to fit -->
    <div
      v-if="slide.kind === 'sheet'"
      class="slide-sheet pointer-events-none absolute inset-x-0 top-0"
      :class="thumb ? 'scale-[.12]' : 'scale-[.62]'"
      aria-hidden="true"
    >
      <NotesSheet
        :sheet="slide.sheet"
        :anchor="false"
      />
    </div>

    <!-- The cover: a stack of sheets -->
    <svg
      v-else-if="slide.kind === 'cover'"
      viewBox="0 0 400 300"
      class="size-full"
      aria-hidden="true"
    >
      <rect
        width="400"
        height="300"
        fill="var(--ice)"
      />
      <g
        v-for="k in [2, 1, 0]"
        :key="k"
        :transform="`rotate(${[-3, 4, -7][k]} 200 150) translate(${k * 10} ${k * 6})`"
      >
        <rect
          x="105"
          y="30"
          width="190"
          height="240"
          rx="3"
          fill="#fffdf7"
          stroke="#dddbda"
        />
        <g v-if="k === 0">
          <line
            v-for="l in 9"
            :key="l"
            x1="113"
            :y1="60 + l * 20"
            x2="287"
            :y2="60 + l * 20"
            stroke="#cfe0f3"
          />
          <line
            x1="128"
            y1="30"
            x2="128"
            y2="270"
            stroke="#f3b8b8"
          />
          <rect
            x="138"
            y="46"
            width="110"
            height="9"
            rx="4"
            fill="#0b3b78"
            opacity=".85"
          />
          <rect
            v-for="(h, b) in [24, 38, 30, 52, 62]"
            :key="b"
            :x="142 + b * 26"
            :y="150 - h"
            width="16"
            :height="h"
            fill="#1b96ff"
            opacity=".75"
            stroke="#0b3b78"
          />
          <path
            d="M138 152 H280"
            stroke="#23324a"
            stroke-width="1.5"
          />
          <rect
            x="138"
            y="176"
            width="60"
            height="10"
            fill="#fff1a8"
          />
          <rect
            x="138"
            y="196"
            width="120"
            height="6"
            rx="3"
            fill="#23324a"
            opacity=".35"
          />
          <rect
            x="138"
            y="216"
            width="96"
            height="6"
            rx="3"
            fill="#23324a"
            opacity=".35"
          />
        </g>
      </g>
    </svg>

    <!-- Formats -->
    <svg
      v-else
      viewBox="0 0 400 300"
      class="size-full"
      aria-hidden="true"
    >
      <rect
        width="400"
        height="300"
        fill="var(--ice)"
      />
      <g
        v-for="(f, k) in [{ x: 90, label: 'PDF', c: '#c23934' }, { x: 220, label: 'MD', c: '#0176D3' }]"
        :key="f.label"
        :transform="`rotate(${k ? 5 : -5} ${f.x + 45} 150)`"
      >
        <path
          :d="`M${f.x} 70 h66 l24 24 v136 h-90 z`"
          fill="#fff"
          stroke="#dddbda"
          stroke-width="1.5"
        />
        <path
          :d="`M${f.x + 66} 70 v24 h24`"
          fill="none"
          stroke="#dddbda"
          stroke-width="1.5"
        />
        <rect
          :x="f.x + 14"
          y="170"
          width="62"
          height="26"
          rx="3"
          :fill="f.c"
        />
        <text
          :x="f.x + 45"
          y="188"
          text-anchor="middle"
          font-size="14"
          font-weight="800"
          fill="#fff"
          font-family="Figtree, sans-serif"
        >{{ f.label }}</text>
        <rect
          v-for="l in 4"
          :key="l"
          :x="f.x + 14"
          :y="100 + l * 12"
          :width="l % 2 ? 62 : 46"
          height="5"
          rx="2.5"
          fill="#23324a"
          opacity=".25"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.slide-sheet { transform-origin: top center; width: 100%; }
.slide-sheet.scale-\[\.62\] { width: 161%; left: -30.5%; }
.slide-sheet.scale-\[\.12\] { width: 833%; left: -366.5%; }
</style>
