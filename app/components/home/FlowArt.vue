<script setup lang="ts">
/**
 * The home hero's picture: the whole course in one moving diagram. Records
 * leave Salesforce, pass through a recipe, land in a dataset and light up a
 * dashboard — the four layers every lesson sits on. Pure SVG + CSS (no JS,
 * no images), so it is prerendered, crisp at any size, works offline, and
 * stands still for prefers-reduced-motion.
 */
const nodes = [
  { x: 24, y: 40, icon: 'cloud', label: 'Salesforce' },
  { x: 24, y: 236, icon: 'recipe', label: 'Recipe' },
  { x: 196, y: 138, icon: 'dataset', label: 'Dataset' }
]
</script>

<template>
  <div
    class="flow-art relative w-full"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 560 380"
      class="h-auto w-full"
      fill="none"
    >
      <!-- the wires -->
      <path
        id="w1"
        class="wire"
        d="M96 92 C 96 160, 96 180, 96 236"
      />
      <path
        class="wire"
        d="M168 270 C 200 270, 210 230, 230 205"
      />
      <path
        class="wire"
        d="M340 190 C 370 190, 370 190, 392 190"
      />
      <!-- the data, travelling -->
      <circle
        class="dot d1"
        r="5"
      />
      <circle
        class="dot d2"
        r="5"
      />
      <circle
        class="dot d3"
        r="5"
      />
      <circle
        class="dot d4"
        r="4"
      />

      <!-- source, recipe, dataset -->
      <g
        v-for="(n, i) in nodes"
        :key="n.label"
        :transform="`translate(${n.x} ${n.y})`"
      ><g
        class="node"
        :style="{ animationDelay: `${i * 0.15}s` }"
      >
        <rect
          width="144"
          height="68"
          rx="8"
          class="card"
        />
        <g transform="translate(16 18)">
          <rect
            width="32"
            height="32"
            rx="6"
            class="chip"
          />
          <!-- tiny glyphs, drawn rather than fetched -->
          <path
            v-if="n.icon === 'cloud'"
            d="M9 21h14a5 5 0 0 0 0-10 7 7 0 0 0-13 2 4 4 0 0 0-1 8Z"
            class="glyph"
          />
          <g v-else-if="n.icon === 'recipe'">
            <circle
              cx="10"
              cy="10"
              r="3"
              class="glyph"
            />
            <circle
              cx="22"
              cy="22"
              r="3"
              class="glyph"
            />
            <path
              d="M13 10h6v9"
              class="glyph"
            />
          </g>
          <g v-else>
            <ellipse
              cx="16"
              cy="9"
              rx="9"
              ry="3"
              class="glyph"
            />
            <path
              d="M7 9v14c0 1.7 4 3 9 3s9-1.3 9-3V9M7 16c0 1.7 4 3 9 3s9-1.3 9-3"
              class="glyph"
            />
          </g>
        </g>
        <text
          x="60"
          y="40"
          class="label"
        >{{ n.label }}</text>
      </g></g>

      <!-- the dashboard -->
      <g transform="translate(392 70)"><g
        class="node"
        style="animation-delay: .45s"
      >
        <rect
          width="148"
          height="240"
          rx="10"
          class="card"
        />
        <text
          x="16"
          y="30"
          class="label"
        >Dashboard</text>
        <text
          x="16"
          y="70"
          class="big"
        >$1.2M</text>
        <text
          x="16"
          y="88"
          class="small"
        >Won this quarter</text>
        <g transform="translate(16 110)">
          <rect
            v-for="(h, i) in [46, 70, 38, 88, 60]"
            :key="i"
            :x="i * 24"
            :y="96 - h"
            width="16"
            :height="h"
            rx="3"
            class="bar"
            :class="{ hot: i === 3 }"
            :style="{ animationDelay: `${0.6 + i * 0.12}s` }"
          />
          <line
            x1="0"
            x2="116"
            y1="96"
            y2="96"
            class="axis"
          />
        </g>
      </g></g>
    </svg>
  </div>
</template>

<style scoped>
.card { fill: rgb(255 255 255 / .06); stroke: rgb(124 190 255 / .35); stroke-width: 1 }
.chip { fill: rgb(124 190 255 / .16) }
.glyph { stroke: #7cbeff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; fill: none }
.label { fill: #fff; font: 600 14px var(--font-sans, system-ui) }
.big { fill: #fff; font: 700 28px var(--font-sans, system-ui); letter-spacing: -.02em }
.small { fill: rgb(255 255 255 / .6); font: 500 11px var(--font-sans, system-ui) }
.axis { stroke: rgb(255 255 255 / .25) }
.bar { fill: rgb(124 190 255 / .45); transform-box: fill-box; transform-origin: bottom; animation: grow .7s cubic-bezier(.2, .8, .2, 1) both }
.bar.hot { fill: #1b96ff }
.wire { stroke: rgb(124 190 255 / .35); stroke-width: 2; stroke-dasharray: 6 6; animation: flow 1.2s linear infinite }
.dot { fill: #1b96ff; filter: drop-shadow(0 0 6px #1b96ff); offset-rotate: 0deg; animation: travel 2.4s cubic-bezier(.5, 0, .5, 1) infinite }
.d1 { offset-path: path('M96 92 C 96 160, 96 180, 96 236') }
.d2 { offset-path: path('M168 270 C 200 270, 210 230, 230 205'); animation-delay: .8s }
.d3 { offset-path: path('M340 190 C 370 190, 370 190, 392 190'); animation-delay: 1.6s }
.d4 { offset-path: path('M96 92 C 96 160, 96 180, 96 236'); animation-delay: 1.2s }
.node { animation: rise .6s cubic-bezier(.2, .8, .2, 1) both }

@keyframes flow { to { stroke-dashoffset: -24 } }
@keyframes travel { 0% { offset-distance: 0%; opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { offset-distance: 100%; opacity: 0 } }
@keyframes grow { from { transform: scaleY(0) } }
@keyframes rise { from { opacity: 0; transform: translateY(8px) } }

@media (prefers-reduced-motion: reduce) {
  .wire, .dot, .bar, .node { animation: none }
  .dot { display: none }
}
</style>
