<script setup lang="ts">
/**
 * A drafting sketch that draws itself once when the page loads: construction
 * lines, a plotted curve, circles and dimension arrows, in the Blueprint ink.
 *
 * Every path is normalised to pathLength 1, so one CSS rule (.bp-sketch-line
 * in main.css) draws any of them regardless of its real length; `--i`
 * staggers them. The motif is chosen and shaped by `seed`, so each page gets
 * its own drawing but the same page always gets the same one (it is
 * prerendered). Purely decorative: aria-hidden, no pointer events, and static
 * under prefers-reduced-motion.
 */
const props = withDefaults(defineProps<{ seed?: string, variant?: 'sheet' | 'hero' }>(), { seed: 'blueprint', variant: 'sheet' })

function rng(text: string) {
  let h = 2166136261
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0
    return h / 4294967296
  }
}

interface Line { d: string, kind: 'ink' | 'soft' | 'signal' | 'dash' }
interface Label { x: number, y: number, text: string, anchor?: 'start' | 'middle' | 'end' }

const W = 420
const H = 300

const sketch = computed(() => {
  const r = rng(props.seed)
  const lines: Line[] = []
  const labels: Label[] = []
  const motifs = ['curve', 'compass', 'bars', 'funnel'] as const
  const motif = props.variant === 'hero' ? 'curve' : motifs[Math.floor(r() * motifs.length)]!

  // Construction grid lines common to every motif.
  lines.push({ d: `M40 ${H - 40} H${W - 20}`, kind: 'soft' })
  lines.push({ d: `M40 ${H - 40} V20`, kind: 'soft' })

  if (motif === 'curve') {
    const pts = Array.from({ length: 7 }, (_, i) => {
      const x = 60 + i * ((W - 100) / 6)
      const y = H - 70 - i * 22 - r() * 34 + (i === 0 ? 0 : 6)
      return [x, Math.max(36, y)] as const
    })
    const d = pts.map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`
      const [px, py] = pts[i - 1]!
      const cx = (px + x) / 2
      return `C${cx} ${py} ${cx} ${y} ${x} ${y}`
    }).join(' ')
    lines.push({ d, kind: 'signal' })
    for (const [x, y] of pts.slice(1, -1)) {
      lines.push({ d: `M${x} ${H - 40} V${y + 6}`, kind: 'dash' })
      lines.push({ d: `M${x - 4} ${y} a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0`, kind: 'ink' })
    }
    const [lx, ly] = pts[pts.length - 1]!
    lines.push({ d: `M${lx + 14} ${ly} H${lx + 34} M${lx + 14} ${H - 40} H${lx + 34} M${lx + 26} ${ly + 4} V${H - 44} M${lx + 22} ${ly + 10} L${lx + 26} ${ly + 4} L${lx + 30} ${ly + 10} M${lx + 22} ${H - 50} L${lx + 26} ${H - 44} L${lx + 30} ${H - 50}`, kind: 'ink' })
    labels.push({ x: lx + 36, y: (ly + H - 40) / 2, text: `Δ ${Math.round(40 + r() * 60)}%` })
    labels.push({ x: 44, y: 30, text: 'Y — ARR', anchor: 'start' })
    labels.push({ x: W - 20, y: H - 26, text: 'X — MONTHS', anchor: 'end' })
  } else if (motif === 'compass') {
    const cx = W / 2 + (r() - 0.5) * 60
    const cy = H / 2 - 10
    const R = 70 + r() * 30
    lines.push({ d: `M${cx - R} ${cy} a${R} ${R} 0 1 0 ${R * 2} 0 a${R} ${R} 0 1 0 ${-R * 2} 0`, kind: 'ink' })
    lines.push({ d: `M${cx - R * 0.55} ${cy} a${R * 0.55} ${R * 0.55} 0 1 0 ${R * 1.1} 0 a${R * 0.55} ${R * 0.55} 0 1 0 ${-R * 1.1} 0`, kind: 'dash' })
    lines.push({ d: `M${cx - R - 20} ${cy} H${cx + R + 20} M${cx} ${cy - R - 20} V${cy + R + 20}`, kind: 'soft' })
    const a = r() * Math.PI * 1.5
    lines.push({ d: `M${cx} ${cy} L${cx + R * Math.cos(a)} ${cy - R * Math.sin(a)}`, kind: 'signal' })
    lines.push({ d: `M${cx - 5} ${cy} a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0`, kind: 'signal' })
    labels.push({ x: cx + R * Math.cos(a) / 2 + 8, y: cy - R * Math.sin(a) / 2 - 6, text: `R ${Math.round(R)}` })
    labels.push({ x: cx + R + 24, y: cy - 6, text: 'Ø', anchor: 'start' })
  } else if (motif === 'bars') {
    const n = 6
    const bw = (W - 120) / n
    for (let i = 0; i < n; i++) {
      const h = 40 + r() * 150
      const x = 60 + i * bw
      lines.push({ d: `M${x + 6} ${H - 40} V${H - 40 - h} H${x + bw - 6} V${H - 40}`, kind: i === n - 1 ? 'signal' : 'ink' })
    }
    lines.push({ d: `M60 ${H - 18} H${W - 60} M60 ${H - 24} V${H - 12} M${W - 60} ${H - 24} V${H - 12}`, kind: 'ink' })
    labels.push({ x: W / 2, y: H - 4, text: `${n} × PERIOD`, anchor: 'middle' })
    lines.push({ d: `M40 ${H - 190} H${W - 30}`, kind: 'dash' })
    labels.push({ x: W - 30, y: H - 196, text: 'TARGET', anchor: 'end' })
  } else {
    const stages = [1, 0.72, 0.5, 0.32, 0.18]
    stages.forEach((s, i) => {
      const w = (W - 140) * (s + r() * 0.06)
      const y = 34 + i * 46
      lines.push({ d: `M${W / 2 - w / 2} ${y} H${W / 2 + w / 2} V${y + 30} H${W / 2 - w / 2} Z`, kind: i === stages.length - 1 ? 'signal' : 'ink' })
      if (i) lines.push({ d: `M${W / 2} ${y - 16} V${y - 2}`, kind: 'dash' })
      labels.push({ x: W / 2 + w / 2 + 10, y: y + 19, text: `${Math.round(s * 100)}%`, anchor: 'start' })
    })
  }
  return { lines, labels }
})

const stroke: Record<Line['kind'], string> = {
  ink: 'var(--ink2)',
  soft: 'var(--frost)',
  signal: 'var(--signal)',
  dash: 'var(--tide)'
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    class="bp-sketch pointer-events-none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(l, i) in sketch.lines"
      :key="i"
      :d="l.d"
      pathLength="1"
      fill="none"
      :stroke="stroke[l.kind]"
      :stroke-width="l.kind === 'signal' ? 2.25 : 1.25"
      stroke-linecap="square"
      stroke-linejoin="round"
      class="bp-sketch-line"
      :class="{ 'bp-sketch-line--dash': l.kind === 'dash' }"
      :style="{ '--i': i }"
    />
    <text
      v-for="(t, i) in sketch.labels"
      :key="`t${i}`"
      :x="t.x"
      :y="t.y"
      :text-anchor="t.anchor ?? 'start'"
      class="bp-sketch-label"
      :style="{ '--i': sketch.lines.length + i }"
    >{{ t.text }}</text>
  </svg>
</template>
