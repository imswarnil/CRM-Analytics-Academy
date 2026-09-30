<script setup lang="ts">
/**
 * FIG. 02 — a CRM Analytics dataflow, drawn and running.
 *
 * Three sources feed a recipe: sfdcDigest pulls the objects, Augment joins the
 * CSV on, computeExpression derives the measures, and the result registers as
 * a dataset that a lens and a dashboard read. Packets travel each connector in
 * stage order on an 8-second loop and every node lights as one arrives.
 *
 * Pure SVG + CSS (offset-path for the packets), so nothing runs in JS and the
 * whole loop pauses with `active` — off-screen slides cost nothing. With
 * reduced motion it is a complete, static diagram.
 */
withDefaults(defineProps<{ active?: boolean }>(), { active: true })

const W = 100 // node width
const H = 44 // node height
const col = (c: number) => 8 + c * 130
const row = (r: number) => 22 + r * 92

interface FlowNode {
  id: string
  c: number
  r: number
  label: string
  sub: string
  stage: number
  icon?: 'db' | 'chart'
}

const nodes: FlowNode[] = [
  { id: 'opp', c: 0, r: 0, label: 'Opportunity', sub: 'sfdc object', stage: 0 },
  { id: 'acc', c: 0, r: 1, label: 'Account', sub: 'sfdc object', stage: 0 },
  { id: 'csv', c: 0, r: 2, label: 'users.csv', sub: 'csv upload', stage: 0 },
  { id: 'digest', c: 1, r: 1, label: 'sfdcDigest', sub: 'recipe · input', stage: 1 },
  { id: 'join', c: 2, r: 1, label: 'Augment', sub: 'join AccountId', stage: 2 },
  { id: 'compute', c: 3, r: 1, label: 'compute', sub: 'computeExpression', stage: 3 },
  { id: 'dataset', c: 4, r: 1, label: 'Dataset', sub: 'opportunities', stage: 4, icon: 'db' },
  { id: 'lens', c: 5, r: 0, label: 'Lens', sub: 'explore', stage: 5, icon: 'chart' },
  { id: 'dash', c: 5, r: 2, label: 'Dashboard', sub: 'pipeline board', stage: 5, icon: 'chart' }
]
const byId = Object.fromEntries(nodes.map(n => [n.id, n]))

// Each connector leaves the right edge of one node and enters the left edge of
// the next; `stage` is when its packet sets off (in 1s steps of the loop).
const edges = [
  ['opp', 'digest'], ['acc', 'digest'], ['csv', 'join'],
  ['digest', 'join'], ['join', 'compute'], ['compute', 'dataset'],
  ['dataset', 'lens'], ['dataset', 'dash']
].map(([a, b]) => {
  const from = byId[a!]!
  const to = byId[b!]!
  const x1 = col(from.c) + W
  const y1 = row(from.r) + H / 2
  const x2 = col(to.c)
  const y2 = row(to.r) + H / 2
  const mid = (x1 + x2) / 2
  return {
    key: `${a}-${b}`,
    d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
    stage: to.stage - 1
  }
})

const STEP = 1 // seconds per stage
const nodeDelay = (n: FlowNode) => `${n.stage * STEP}s`
const edgeDelay = (stage: number) => `${stage * STEP}s`
</script>

<template>
  <svg
    viewBox="0 0 760 250"
    class="bp-flow block h-auto w-full"
    :class="{ 'bp-flow--paused': !active }"
    role="img"
    aria-label="A CRM Analytics dataflow: Opportunity, Account and a CSV feed a recipe — sfdcDigest, Augment join, computeExpression — which registers a dataset read by a lens and a dashboard."
  >
    <!-- connectors: a faint rail, then a flowing dashed line on top -->
    <g fill="none">
      <path
        v-for="e in edges"
        :key="`rail-${e.key}`"
        :d="e.d"
        stroke="var(--frost)"
        stroke-width="1.5"
      />
      <path
        v-for="e in edges"
        :key="`flow-${e.key}`"
        :d="e.d"
        class="bp-flow-line"
        stroke="var(--signal)"
        stroke-width="1.5"
        stroke-dasharray="5 7"
      />
    </g>

    <!-- nodes -->
    <g
      v-for="n in nodes"
      :key="n.id"
      :transform="`translate(${col(n.c)} ${row(n.r)})`"
    >
      <rect
        :width="W"
        :height="H"
        fill="var(--ice)"
        stroke="var(--ink)"
        stroke-width="1.5"
        class="bp-flow-node"
        :style="{ animationDelay: nodeDelay(n) }"
      />
      <text
        x="8"
        y="18"
        font-family="var(--font-mono)"
        font-size="11"
        font-weight="600"
        fill="var(--ink)"
        class="bp-flow-text"
        :style="{ animationDelay: nodeDelay(n) }"
      >{{ n.label }}</text>
      <text
        x="8"
        y="33"
        font-family="var(--font-mono)"
        font-size="8"
        letter-spacing=".04em"
        fill="var(--ink2)"
        class="bp-flow-sub"
        :style="{ animationDelay: nodeDelay(n) }"
      >{{ n.sub }}</text>
      <!-- a small mark for storage and output nodes -->
      <g
        v-if="n.icon === 'db'"
        transform="translate(82 8)"
        fill="none"
        stroke="var(--ink)"
        stroke-width="1.2"
      >
        <ellipse
          cx="5"
          cy="2.5"
          rx="5"
          ry="2.5"
        />
        <path d="M0 2.5 V10 A5 2.5 0 0 0 10 10 V2.5" />
      </g>
      <g
        v-else-if="n.icon === 'chart'"
        transform="translate(80 8)"
        fill="var(--signal)"
      >
        <rect
          x="0"
          y="6"
          width="3"
          height="6"
        />
        <rect
          x="4.5"
          y="2"
          width="3"
          height="10"
        />
        <rect
          x="9"
          y="4"
          width="3"
          height="8"
        />
      </g>
      <!-- stage number, like a drawing's callout -->
      <text
        :x="W - 4"
        :y="H - 5"
        text-anchor="end"
        font-family="var(--font-mono)"
        font-size="7"
        fill="var(--ink2)"
        opacity=".7"
      >{{ String(n.stage).padStart(2, '0') }}</text>
    </g>

    <!-- packets travel every connector in stage order -->
    <circle
      v-for="e in edges"
      :key="`packet-${e.key}`"
      r="4"
      fill="var(--signal)"
      stroke="var(--card)"
      stroke-width="1.5"
      class="bp-flow-packet"
      :style="{ offsetPath: `path('${e.d}')`, animationDelay: edgeDelay(e.stage) }"
    />
  </svg>
</template>

<style scoped>
/* One 8s loop shared by everything: stage k runs from k·1s to (k+1)·1s. */
.bp-flow-line {
  animation: bp-flow-dash 1.2s linear infinite;
}
.bp-flow-packet {
  offset-rotate: 0deg;
  opacity: 0;
  animation: bp-flow-travel 8s linear infinite both;
}
.bp-flow-node {
  animation: bp-flow-light 8s ease-out infinite both;
}
.bp-flow-text {
  animation: bp-flow-text 8s ease-out infinite both;
}
.bp-flow-sub {
  animation: bp-flow-sub 8s ease-out infinite both;
}
.bp-flow--paused .bp-flow-line,
.bp-flow--paused .bp-flow-packet,
.bp-flow--paused .bp-flow-node,
.bp-flow--paused .bp-flow-text,
.bp-flow--paused .bp-flow-sub {
  animation-play-state: paused;
}

@keyframes bp-flow-dash {
  to {
    stroke-dashoffset: -24;
  }
}
/* A packet is visible only for its own 1s stage (12.5% of the loop). */
@keyframes bp-flow-travel {
  0% {
    offset-distance: 0%;
    opacity: 1;
  }
  12.5% {
    offset-distance: 100%;
    opacity: 1;
  }
  13%,
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}
/* A node lights when its packet lands, holds, then cools back to ice. */
@keyframes bp-flow-light {
  0%,
  1% {
    fill: var(--ice);
  }
  3%,
  16% {
    fill: var(--signal);
  }
  30%,
  100% {
    fill: var(--ice);
  }
}
@keyframes bp-flow-text {
  0%,
  1% {
    fill: var(--ink);
  }
  3%,
  16% {
    fill: var(--on);
  }
  30%,
  100% {
    fill: var(--ink);
  }
}

@keyframes bp-flow-sub {
  0%,
  1% {
    fill: var(--ink2);
  }
  3%,
  16% {
    fill: var(--on);
  }
  30%,
  100% {
    fill: var(--ink2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bp-flow-line,
  .bp-flow-node,
  .bp-flow-text,
  .bp-flow-sub {
    animation: none;
  }
  .bp-flow-packet {
    display: none;
  }
}
</style>
