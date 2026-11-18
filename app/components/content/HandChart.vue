<script setup lang="ts">
/**
 * A hand-drawn figure for the notes sheets: wobbly ink strokes, a highlighter
 * fill, handwritten labels. Deterministic — the wobble is seeded by the data,
 * so a sheet prerenders and prints the same every time. In markdown:
 *
 *   ::hand-chart{type="bar" title="Pipeline by stage"}
 *   ---
 *   labels: ["Prospect", "Qualify", "Propose", "Won"]
 *   values: [40, 28, 16, 9]
 *   ---
 *   ::
 *
 *   type="line"  the same props, drawn as a line over time
 *   type="flow"  labels become boxes joined by arrows (values ignored)
 */
const props = withDefaults(defineProps<{
  type?: 'bar' | 'line' | 'flow'
  title?: string
  labels?: string[]
  values?: number[]
}>(), { type: 'bar', title: '', labels: () => [], values: () => [] })

const W = 560
const H = 250
const PAD = { l: 40, r: 20, t: 34, b: 44 }

/** mulberry32, seeded by the figure's content. */
function rng(seed: string) {
  let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 1779033703)
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(`${props.type}|${props.title}|${props.labels.join()}|${props.values.join()}`)
const j = (n = 1.6) => (rand() - 0.5) * 2 * n

/** A slightly wobbly straight line from a to b, as a quadratic curve. */
const stroke = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1 + j()} ${y1 + j()} Q${(x1 + x2) / 2 + j(2.4)} ${(y1 + y2) / 2 + j(2.4)} ${x2 + j()} ${y2 + j()}`
const box = (x: number, y: number, w: number, h: number) =>
  [stroke(x, y, x + w, y), stroke(x + w, y, x + w, y + h), stroke(x + w, y + h, x, y + h), stroke(x, y + h, x, y)].join(' ')

const max = computed(() => Math.max(1, ...props.values))
const plotW = W - PAD.l - PAD.r
const plotH = H - PAD.t - PAD.b
const bars = computed(() => {
  const n = Math.max(1, props.labels.length)
  const slot = plotW / n
  return props.labels.map((label, i) => {
    const v = props.values[i] ?? 0
    const h = (v / max.value) * plotH
    const x = PAD.l + i * slot + slot * 0.2
    const w = slot * 0.6
    return { label, v, x, w, y: PAD.t + plotH - h, h, cx: PAD.l + i * slot + slot / 2 }
  })
})
const linePath = computed(() => bars.value.map((b, i) => `${i ? 'L' : 'M'}${b.cx + j()} ${b.y + j()}`).join(' '))
const flow = computed(() => {
  const n = Math.max(1, props.labels.length)
  const gap = 26
  const w = (W - 20 - gap * (n - 1)) / n
  return props.labels.map((label, i) => ({ label, x: 10 + i * (w + gap), w }))
})
</script>

<template>
  <figure class="hand-chart not-prose my-6">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="block h-auto w-full"
      role="img"
      :aria-label="props.title || props.labels.join(', ')"
    >
      <text
        v-if="props.title"
        x="10"
        y="22"
        class="hc-title"
      >{{ props.title }}</text>

      <template v-if="props.type === 'flow'">
        <g
          v-for="(b, i) in flow"
          :key="i"
        >
          <rect
            :x="b.x + 4"
            :y="H / 2 - 30 + 4"
            :width="b.w"
            height="60"
            class="hc-hl"
          />
          <path
            :d="box(b.x, H / 2 - 30, b.w, 60)"
            class="hc-ink"
          />
          <text
            :x="b.x + b.w / 2"
            :y="H / 2 + 7"
            text-anchor="middle"
            class="hc-label"
          >{{ b.label }}</text>
          <path
            v-if="i < flow.length - 1"
            :d="`${stroke(b.x + b.w + 3, H / 2, b.x + b.w + 23, H / 2)} M${b.x + b.w + 16} ${H / 2 - 6} L${b.x + b.w + 23} ${H / 2} L${b.x + b.w + 16} ${H / 2 + 6}`"
            class="hc-ink"
          />
        </g>
      </template>

      <template v-else>
        <!-- axes -->
        <path
          :d="`${stroke(PAD.l, PAD.t - 6, PAD.l, PAD.t + plotH)} ${stroke(PAD.l, PAD.t + plotH, W - PAD.r, PAD.t + plotH)}`"
          class="hc-ink"
        />
        <template v-if="props.type === 'bar'">
          <g
            v-for="(b, i) in bars"
            :key="i"
          >
            <rect
              :x="b.x + 3"
              :y="b.y + 3"
              :width="b.w"
              :height="b.h"
              class="hc-hl"
            />
            <path
              :d="box(b.x, b.y, b.w, b.h)"
              class="hc-ink"
            />
            <text
              :x="b.cx"
              :y="b.y - 6"
              text-anchor="middle"
              class="hc-num"
            >{{ b.v }}</text>
          </g>
        </template>
        <template v-else>
          <path
            :d="linePath"
            class="hc-ink hc-line"
          />
          <circle
            v-for="(b, i) in bars"
            :key="i"
            :cx="b.cx"
            :cy="b.y"
            r="4"
            class="hc-dot"
          />
        </template>
        <text
          v-for="(b, i) in bars"
          :key="`l${i}`"
          :x="b.cx"
          :y="H - 14"
          text-anchor="middle"
          class="hc-label"
        >{{ b.label }}</text>
      </template>
    </svg>
  </figure>
</template>

<style scoped>
.hc-ink { fill: none; stroke: #1b3a6b; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.hc-line { stroke: #0176d3; stroke-width: 3; }
.hc-hl { fill: #fde68a; opacity: .75; }
.hc-dot { fill: #0176d3; }
.hc-title { font: 700 22px 'Caveat', cursive; fill: #0176d3; }
.hc-label { font: 400 18px 'Caveat', cursive; fill: #1b3a6b; }
.hc-num { font: 700 17px 'Caveat', cursive; fill: #1b3a6b; }
:global(.dark) .hc-ink { stroke: #cfe3ff; }
:global(.dark) .hc-label, :global(.dark) .hc-num { fill: #cfe3ff; }
:global(.dark) .hc-hl { fill: #b45309; opacity: .45; }
</style>
