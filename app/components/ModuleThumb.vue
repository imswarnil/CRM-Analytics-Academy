<script setup lang="ts">
/**
 * A drawn 16:9 thumbnail for a curriculum module card — one small SVG scene
 * per module instead of a stock screenshot, all strokes off the primary
 * ramp so the set reads as one illustration family.
 */
defineProps<{
  kind: 'foundations' | 'setup' | 'datasets' | 'lenses' | 'dashboards' | 'collaboration'
}>()
</script>

<template>
  <div class="aspect-video w-full overflow-hidden rounded-t-lg border-b border-default bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
    <svg
      viewBox="0 0 320 180"
      fill="none"
      class="size-full text-primary"
      aria-hidden="true"
    >
      <!-- shared window chrome -->
      <rect
        x="40"
        y="26"
        width="240"
        height="128"
        rx="10"
        class="fill-white/70 stroke-primary/30 dark:fill-white/5"
      />
      <circle
        cx="56"
        cy="40"
        r="3"
        class="fill-primary/40"
      />
      <circle
        cx="68"
        cy="40"
        r="3"
        class="fill-primary/25"
      />
      <circle
        cx="80"
        cy="40"
        r="3"
        class="fill-primary/25"
      />
      <line
        x1="40"
        y1="52"
        x2="280"
        y2="52"
        class="stroke-primary/20"
      />

      <!-- foundations: a compass rose over a horizon -->
      <g v-if="kind === 'foundations'">
        <circle
          cx="160"
          cy="100"
          r="34"
          class="stroke-primary/50"
          stroke-width="2"
        />
        <circle
          cx="160"
          cy="100"
          r="26"
          class="stroke-primary/20"
        />
        <path
          d="M160 100 L 174 82 L 166 104 L 146 118 Z"
          fill="currentColor"
          fill-opacity="0.7"
        />
        <circle
          cx="160"
          cy="100"
          r="4"
          fill="currentColor"
        />
        <path
          d="M64 138 H 256"
          class="stroke-primary/30"
          stroke-dasharray="4 6"
        />
      </g>

      <!-- setup: a gear beside provisioned user rows -->
      <g v-else-if="kind === 'setup'">
        <circle
          cx="104"
          cy="100"
          r="20"
          class="stroke-primary/60"
          stroke-width="6"
          stroke-dasharray="6 7"
        />
        <circle
          cx="104"
          cy="100"
          r="8"
          fill="currentColor"
          fill-opacity="0.6"
        />
        <g
          v-for="(y, i) in [76, 100, 124]"
          :key="y"
        >
          <circle
            :cx="156"
            :cy="y"
            r="8"
            class="fill-primary/30"
          />
          <rect
            x="172"
            :y="y - 5"
            :width="66 - i * 14"
            height="10"
            rx="5"
            class="fill-primary/20"
          />
          <rect
            x="248"
            :y="y - 6"
            width="20"
            height="12"
            rx="6"
            :class="i === 2 ? 'fill-primary/20' : 'fill-primary/70'"
          />
        </g>
      </g>

      <!-- datasets: a cylinder feeding a table -->
      <g v-else-if="kind === 'datasets'">
        <ellipse
          cx="98"
          cy="78"
          rx="24"
          ry="9"
          class="fill-primary/40"
        />
        <path
          d="M74 78 v 34 a 24 9 0 0 0 48 0 v -34"
          class="fill-primary/15 stroke-primary/40"
        />
        <path
          d="M130 100 H 152"
          class="stroke-primary/50"
          stroke-dasharray="4 5"
        />
        <g class="stroke-primary/40">
          <rect
            x="160"
            y="70"
            width="100"
            height="64"
            rx="6"
            class="fill-white/60 dark:fill-white/5"
          />
          <line
            x1="160"
            y1="92"
            x2="260"
            y2="92"
          />
          <line
            x1="160"
            y1="113"
            x2="260"
            y2="113"
          />
          <line
            x1="210"
            y1="70"
            x2="210"
            y2="134"
          />
        </g>
      </g>

      <!-- lenses: a magnifier over bars -->
      <g v-else-if="kind === 'lenses'">
        <g class="fill-primary/30">
          <rect
            x="84"
            y="106"
            width="18"
            height="32"
            rx="3"
          />
          <rect
            x="110"
            y="88"
            width="18"
            height="50"
            rx="3"
          />
          <rect
            x="136"
            y="98"
            width="18"
            height="40"
            rx="3"
          />
          <rect
            x="162"
            y="76"
            width="18"
            height="62"
            rx="3"
          />
        </g>
        <circle
          cx="196"
          cy="88"
          r="26"
          class="fill-primary/10 stroke-primary/70"
          stroke-width="3"
        />
        <path
          d="M215 107 L 236 128"
          class="stroke-primary/70"
          stroke-width="6"
          stroke-linecap="round"
        />
      </g>

      <!-- dashboards: a 2x2 of chart tiles -->
      <g v-else-if="kind === 'dashboards'">
        <rect
          x="62"
          y="64"
          width="92"
          height="42"
          rx="5"
          class="fill-primary/10 stroke-primary/30"
        />
        <path
          d="M70 96 L 90 82 L 108 90 L 128 72 L 146 78"
          class="stroke-primary/70"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <rect
          x="166"
          y="64"
          width="92"
          height="42"
          rx="5"
          class="fill-primary/10 stroke-primary/30"
        />
        <g class="fill-primary/50">
          <rect
            x="176"
            y="88"
            width="12"
            height="12"
          />
          <rect
            x="194"
            y="78"
            width="12"
            height="22"
          />
          <rect
            x="212"
            y="84"
            width="12"
            height="16"
          />
          <rect
            x="230"
            y="72"
            width="12"
            height="28"
          />
        </g>
        <rect
          x="62"
          y="114"
          width="92"
          height="28"
          rx="5"
          class="fill-primary/25"
        />
        <rect
          x="166"
          y="114"
          width="92"
          height="28"
          rx="5"
          class="fill-primary/10 stroke-primary/30"
        />
      </g>

      <!-- collaboration: people and a shared thread -->
      <g v-else>
        <g
          v-for="(p, i) in [{ x: 104, y: 86 }, { x: 160, y: 78 }, { x: 216, y: 86 }]"
          :key="i"
        >
          <circle
            :cx="p.x"
            :cy="p.y"
            r="12"
            :class="i === 1 ? 'fill-primary/70' : 'fill-primary/30'"
          />
          <path
            :d="`M${p.x - 18} ${p.y + 34} a 18 18 0 0 1 36 0`"
            :class="i === 1 ? 'fill-primary/40' : 'fill-primary/15'"
          />
        </g>
        <path
          d="M116 128 C 140 142, 180 142, 204 128"
          class="stroke-primary/50"
          stroke-width="2"
          stroke-dasharray="5 6"
        />
        <rect
          x="196"
          y="56"
          width="44"
          height="18"
          rx="9"
          class="fill-primary/60"
        />
        <circle
          cx="207"
          cy="65"
          r="2.5"
          fill="white"
        />
        <circle
          cx="217"
          cy="65"
          r="2.5"
          fill="white"
        />
        <circle
          cx="227"
          cy="65"
          r="2.5"
          fill="white"
        />
      </g>
    </svg>
  </div>
</template>
