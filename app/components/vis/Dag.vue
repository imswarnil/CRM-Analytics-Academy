<script setup lang="ts">
/**
 * A pipeline drawn as a graph: each node in a column by its depth (how many
 * nodes stand between it and an input), edges from every source, and a badge
 * with its place in the execution order. Done nodes are solid, the running
 * one is filled, the rest are dashed. Click a node to inspect it.
 */
export interface DagNode {
  id: string
  label: string
  sub?: string
  icon?: string
  inputs: string[]
  order: number
  /** A dataflow's parallel wave, shown beside the order. */
  wave?: number
}
const props = defineProps<{ nodes: DagNode[], active: string | null, doneUpTo: number }>()
const emit = defineEmits<{ select: [id: string] }>()

const W = 168
const H = 56
const GX = 56
const GY = 22

const layout = computed(() => {
  const depth: Record<string, number> = {}
  const d = (id: string, seen = new Set<string>()): number => {
    if (id in depth) return depth[id]!
    if (seen.has(id)) return 0
    seen.add(id)
    const n = props.nodes.find(x => x.id === id)
    const v = n && n.inputs.length ? Math.max(...n.inputs.map(i => d(i, seen))) + 1 : 0
    depth[id] = v
    return v
  }
  props.nodes.forEach(n => d(n.id))
  const cols: Record<number, string[]> = {}
  for (const n of props.nodes) (cols[depth[n.id]!] ??= []).push(n.id)
  const pos: Record<string, { x: number, y: number }> = {}
  for (const [c, ids] of Object.entries(cols)) ids.forEach((id, i) => (pos[id] = { x: Number(c) * (W + GX) + 4, y: i * (H + GY) + 4 }))
  const width = (Math.max(...Object.keys(cols).map(Number), 0) + 1) * (W + GX) - GX + 8
  const height = Math.max(...Object.values(cols).map(c => c.length), 1) * (H + GY) - GY + 8
  return { pos, width, height }
})
const edges = computed(() => props.nodes.flatMap(n => n.inputs.filter(i => layout.value.pos[i]).map((i) => {
  const a = layout.value.pos[i]!
  const b = layout.value.pos[n.id]!
  const x1 = a.x + W
  const y1 = a.y + H / 2
  const x2 = b.x
  const y2 = b.y + H / 2
  const done = (props.nodes.find(x => x.id === n.id)?.order ?? 99) <= props.doneUpTo
  return { id: `${i}>${n.id}`, d: `M${x1},${y1} C${x1 + GX / 2},${y1} ${x2 - GX / 2},${y2} ${x2},${y2}`, done }
})))
const state = (n: DagNode) => (n.id === props.active ? 'active' : n.order <= props.doneUpTo ? 'done' : 'pending')
</script>

<template>
  <div class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--paper) graph-paper p-3">
    <svg
      :width="layout.width"
      :height="layout.height"
      :viewBox="`0 0 ${layout.width} ${layout.height}`"
      role="img"
      class="block"
    >
      <defs>
        <marker
          id="vis-arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        ><path
          d="M0,0 L8,4 L0,8 z"
          fill="var(--ink)"
        /></marker>
      </defs>
      <path
        v-for="e in edges"
        :key="e.id"
        :d="e.d"
        fill="none"
        :stroke="e.done ? 'var(--signal)' : 'var(--ink2)'"
        stroke-width="1.5"
        :stroke-dasharray="e.done ? undefined : '4 3'"
        marker-end="url(#vis-arrow)"
      />
      <g
        v-for="n in props.nodes"
        :key="n.id"
        :transform="`translate(${layout.pos[n.id]?.x ?? 0},${layout.pos[n.id]?.y ?? 0})`"
        class="cursor-pointer"
        role="button"
        tabindex="0"
        :aria-label="`${n.order}. ${n.label}`"
        @click="emit('select', n.id)"
        @keydown.enter="emit('select', n.id)"
      >
        <rect
          :width="W"
          :height="H"
          :fill="state(n) === 'active' ? 'var(--signal)' : 'var(--card)'"
          stroke="var(--ink)"
          stroke-width="1.5"
          :stroke-dasharray="state(n) === 'pending' ? '4 3' : undefined"
        />
        <rect
          :width="22"
          :height="H"
          :fill="state(n) === 'pending' ? 'var(--paper)' : 'var(--ink)'"
        />
        <text
          x="11"
          :y="H / 2 + 4"
          text-anchor="middle"
          font-size="12"
          font-weight="700"
          font-family="var(--font-mono, monospace)"
          :fill="state(n) === 'pending' ? 'var(--ink2)' : 'var(--paper)'"
        >{{ n.order }}</text>
        <text
          x="30"
          y="22"
          font-size="12.5"
          font-weight="700"
          :fill="state(n) === 'active' ? 'white' : 'var(--ink)'"
        >{{ n.label.length > 18 ? `${n.label.slice(0, 17)}…` : n.label }}</text>
        <text
          x="30"
          y="40"
          font-size="10.5"
          font-family="var(--font-mono, monospace)"
          :fill="state(n) === 'active' ? 'white' : 'var(--ink2)'"
        >{{ (n.sub ?? '').length > 22 ? `${n.sub!.slice(0, 21)}…` : n.sub }}<template v-if="n.wave"> · W{{ n.wave }}</template></text>
      </g>
    </svg>
  </div>
</template>
