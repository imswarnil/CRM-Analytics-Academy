<script setup lang="ts">
/**
 * /visualiser/joins — one join, slowly. Two small tables side by side; each
 * step takes the next left row, draws a line to every right row with the same
 * key, and writes what that join type does with it into the output: joined,
 * kept with an empty right side, repeated once per match (fan-out), or
 * dropped. The last step adds the right rows nothing matched (right and outer
 * joins keep them). A Venn diagram shows which part each join keeps; "flip"
 * swaps the sides to show fan-out and why lookup never repeats a row.
 *
 * Prerendered; runs on the sample data (app/utils/vis).
 */
import { type Row, DATASETS, fmt } from '~/utils/vis/data'
import { type JoinType, JOIN_TYPES } from '~/utils/vis/recipe'

definePageMeta({ focus: true })
const { t } = useI18n()

const OPPS = DATASETS.opportunities!.rows.filter(r => ['O1', 'O2', 'O3', 'O5', 'O8'].includes(String(r.Id)))
const ACCS = DATASETS.accounts!.rows
const flip = ref(false)
const join = ref<JoinType>('left')
const L = computed(() => (flip.value ? ACCS : OPPS))
const R = computed(() => (flip.value ? OPPS : ACCS))
const lk = computed(() => (flip.value ? 'Id' : 'AccountId'))
const rk = computed(() => (flip.value ? 'AccountId' : 'Id'))
const lName = computed(() => (flip.value ? 'Account' : 'Opportunity'))
const rName = computed(() => (flip.value ? 'Opportunity' : 'Account'))

const step = ref(0)
watch([flip, join], () => (step.value = 0))
const count = computed(() => L.value.length + 1)

const matchesOf = (l: Row) => R.value.map((r, i) => ({ r, i })).filter(x => x.r[rk.value] !== null && x.r[rk.value] === l[lk.value])
interface Out { l: Row | null, r: Row | null, kind: 'joined' | 'leftOnly' | 'rightOnly' | 'fanout', from: number }
/** Everything each step adds to the output, and what happened to each left row. */
const plan = computed(() => {
  const outs: Out[][] = []
  const fate: string[] = []
  const used = new Set<number>()
  L.value.forEach((l, li) => {
    const m = matchesOf(l)
    m.forEach(x => used.add(x.i))
    const rows: Out[] = []
    if (!m.length) {
      if (join.value === 'inner' || join.value === 'right') fate.push('dropped')
      else {
        fate.push('leftOnly')
        rows.push({ l, r: null, kind: 'leftOnly', from: li })
      }
    } else if (join.value === 'lookup') {
      fate.push(m.length > 1 ? 'lookupFirst' : 'joined')
      rows.push({ l, r: m[0]!.r, kind: 'joined', from: li })
    } else {
      fate.push(m.length > 1 ? 'fanout' : 'joined')
      for (const x of m) rows.push({ l, r: x.r, kind: m.length > 1 ? 'fanout' : 'joined', from: li })
    }
    outs.push(rows)
  })
  const rightOnly = R.value.filter((_, i) => !used.has(i))
  outs.push(join.value === 'right' || join.value === 'outer' ? rightOnly.map(r => ({ l: null, r, kind: 'rightOnly' as const, from: L.value.length })) : [])
  return { outs, fate, rightOnly }
})
const output = computed(() => plan.value.outs.slice(0, step.value + 1).flat())
const total = computed(() => plan.value.outs.flat().length)

/* Lines from the current left row to its matches (row height is fixed). */
const ROW_H = 40
const HEAD = 36
const lines = computed(() => {
  if (step.value >= L.value.length) return []
  const l = L.value[step.value]!
  return matchesOf(l).map(x => ({ y1: HEAD + step.value * ROW_H + ROW_H / 2, y2: HEAD + x.i * ROW_H + ROW_H / 2, keep: !(join.value === 'lookup' && x !== matchesOf(l)[0]) }))
})
const rightLit = computed(() => (step.value < L.value.length ? new Set(matchesOf(L.value[step.value]!).map(x => x.i)) : new Set(R.value.map((r, i) => (plan.value.rightOnly.includes(r) ? i : -1)))))

const caption = computed(() => {
  if (step.value >= L.value.length) {
    const n = plan.value.rightOnly.length
    return join.value === 'right' || join.value === 'outer' ? t('vis.joins.rightKept', { n, side: rName.value }) : t('vis.joins.rightDropped', { n, side: rName.value, total: total.value })
  }
  const l = L.value[step.value]!
  return t(`vis.joins.fate.${plan.value.fate[step.value]}`, { row: String(l.Name), key: lk.value, value: fmt(l[lk.value] ?? null), n: matchesOf(l).length })
})

/* Venn: which regions the join keeps. */
const keeps = computed(() => ({ left: ['lookup', 'left', 'outer'].includes(join.value), both: true, right: ['right', 'outer'].includes(join.value) }))
const KIND_TONE: Record<Out['kind'], string> = { joined: '#34d399', fanout: '#a78bfa', leftOnly: '#fbbf24', rightOnly: '#60a5fa' }

const title = computed(() => t('vis.joins.seoTitle'))
const description = computed(() => t('vis.joins.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.joins.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'LOOKUP · LEFT · RIGHT · INNER · OUTER' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.joins.title'), path: '/visualiser/joins' }],
  extra: [{ '@type': 'LearningResource', 'name': t('vis.joins.title'), 'learningResourceType': 'Interactive simulation', 'interactivityType': 'active', 'teaches': 'CRM Analytics recipe joins: lookup, left, right, inner and outer; unmatched rows and fan-out', 'isAccessibleForFree': true }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V5 / JOINS"
    :title="t('vis.joins.title')"
    :count="count"
    :caption="caption"
    :eyebrow="`${join} join · ${lName}.${lk} = ${rName}.${rk}`"
    :presets="JOIN_TYPES.map(j => ({ id: j, label: `${j} join` }))"
    :preset="join"
    :rail="false"
    :edit-label="t('vis.joins.about')"
    @preset="(id: string) => (join = id as JoinType)"
  >
    <template #stage>
      <div class="jn absolute inset-0 overflow-y-auto p-5 sm:p-7">
        <div class="mx-auto max-w-6xl space-y-6">
          <div class="flex flex-wrap items-center gap-6">
            <!-- Venn -->
            <svg
              viewBox="0 0 180 100"
              class="h-24 w-44 shrink-0"
              role="img"
              :aria-label="`${join} join`"
            >
              <defs>
                <clipPath id="jn-l"><circle
                  cx="65"
                  cy="50"
                  r="40"
                /></clipPath>
                <clipPath id="jn-r"><circle
                  cx="115"
                  cy="50"
                  r="40"
                /></clipPath>
              </defs>
              <circle
                cx="65"
                cy="50"
                r="40"
                :fill="keeps.left ? '#fbbf24' : 'transparent'"
                :fill-opacity="keeps.left ? 0.55 : 0"
              />
              <circle
                cx="115"
                cy="50"
                r="40"
                :fill="keeps.right ? '#60a5fa' : 'transparent'"
                :fill-opacity="keeps.right ? 0.55 : 0"
              />
              <circle
                cx="115"
                cy="50"
                r="40"
                clip-path="url(#jn-l)"
                fill="#34d399"
                fill-opacity="0.9"
              />
              <circle
                cx="65"
                cy="50"
                r="40"
                fill="none"
                stroke="#cbd5e1"
                stroke-width="1.5"
              />
              <circle
                cx="115"
                cy="50"
                r="40"
                fill="none"
                stroke="#cbd5e1"
                stroke-width="1.5"
              />
              <text
                x="38"
                y="54"
                font-size="10"
                fill="#0b1020"
                font-weight="700"
              >{{ keeps.left ? 'L' : '' }}</text>
              <text
                x="136"
                y="54"
                font-size="10"
                fill="#0b1020"
                font-weight="700"
              >{{ keeps.right ? 'R' : '' }}</text>
            </svg>
            <div class="min-w-0 flex-1">
              <p class="text-xl font-bold text-[#f1f5ff]">
                {{ t(`vis.joins.what.${join}`) }}
              </p>
              <p class="mt-1 font-mono text-sm text-[#8b97b8]">
                {{ lName }}.{{ lk }} = {{ rName }}.{{ rk }} · {{ t('vis.joins.rowsOut', { n: total }) }}
              </p>
            </div>
            <button
              type="button"
              class="jn-btn"
              @click="flip = !flip"
            >
              <UIcon
                name="i-lucide-arrow-left-right"
                class="size-4"
              />{{ t('vis.joins.flip') }}
            </button>
          </div>

          <!-- Left · lines · right -->
          <div class="grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] items-start">
            <div class="jn-table">
              <p class="jn-head">
                {{ t('vis.joins.left') }} · {{ lName }}
              </p>
              <div
                v-for="(r, i) in L"
                :key="String(r.Id)"
                class="jn-row"
                :class="[i === step ? 'jn-row--now' : '', i < step ? 'opacity-55' : '', i < step && plan.fate[i] === 'dropped' ? 'line-through text-[#fda4af]' : '']"
              >
                <span class="truncate font-semibold">{{ r.Name }}</span><span class="font-mono text-[#fbbf24]">{{ fmt(r[lk] ?? null) }}</span>
              </div>
            </div>
            <svg
              class="h-full w-full overflow-visible"
              :style="{ height: `${HEAD + Math.max(L.length, R.length) * ROW_H}px` }"
              :viewBox="`0 0 80 ${HEAD + Math.max(L.length, R.length) * ROW_H}`"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                v-for="(ln, i) in lines"
                :key="`${step}-${i}`"
                :d="`M0,${ln.y1} C40,${ln.y1} 40,${ln.y2} 80,${ln.y2}`"
                fill="none"
                :stroke="ln.keep ? '#34d399' : '#5d6a8a'"
                stroke-width="2.5"
                :stroke-dasharray="ln.keep ? '200' : '4 4'"
                class="jn-line"
              />
              <g v-if="step < L.length && !lines.length">
                <text
                  x="40"
                  :y="HEAD + step * ROW_H + ROW_H / 2 + 4"
                  text-anchor="middle"
                  font-size="16"
                  fill="#fb7185"
                >✕</text>
              </g>
            </svg>
            <div class="jn-table">
              <p class="jn-head">
                {{ t('vis.joins.right') }} · {{ rName }}
              </p>
              <div
                v-for="(r, i) in R"
                :key="String(r.Id)"
                class="jn-row"
                :class="rightLit.has(i) ? (step >= L.length ? 'jn-row--right' : 'jn-row--hit') : ''"
              >
                <span class="font-mono text-[#fbbf24]">{{ fmt(r[rk] ?? null) }}</span><span class="truncate font-semibold">{{ r.Name }}</span>
              </div>
            </div>
          </div>

          <!-- Output -->
          <div class="jn-table">
            <p class="jn-head flex justify-between">
              <span>{{ t('vis.joins.output') }}</span><span>{{ output.length }} / {{ total }}</span>
            </p>
            <TransitionGroup
              tag="div"
              name="jn-out"
            >
              <div
                v-for="(o, i) in output"
                :key="`${o.l?.Id ?? '∅'}-${o.r?.Id ?? '∅'}-${i}`"
                class="jn-orow"
              >
                <span
                  class="size-2.5 rounded-full"
                  :style="{ background: KIND_TONE[o.kind] }"
                />
                <span
                  class="truncate"
                  :class="o.l ? '' : 'italic text-[#5d6a8a]'"
                >{{ o.l ? `${o.l.Name} · ${fmt(o.l[lk] ?? null)}` : 'null' }}</span>
                <span
                  class="truncate"
                  :class="o.r ? '' : 'italic text-[#5d6a8a]'"
                >{{ o.r ? `${fmt(o.r[rk] ?? null)} · ${o.r.Name}` : 'null' }}</span>
              </div>
            </TransitionGroup>
            <p
              v-if="!output.length"
              class="px-4 py-3 text-sm text-[#5d6a8a]"
            >
              {{ t('vis.joins.empty') }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4 font-mono text-[11px] text-[#8b97b8]">
            <span
              v-for="(c, k) in KIND_TONE"
              :key="k"
              class="flex items-center gap-1.5"
            ><i
              class="inline-block size-2.5 rounded-full"
              :style="{ background: c }"
            />{{ t(`vis.joins.kind.${k}`) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #edit>
      <div class="space-y-4 text-sm">
        <div
          v-for="j in JOIN_TYPES"
          :key="j"
        >
          <p class="font-bold text-(--ink)">
            {{ j }} join
          </p>
          <p class="mt-1 text-(--ink2)">
            {{ t(`vis.joins.what.${j}`) }}
          </p>
        </div>
      </div>
    </template>
  </VisShell>
</template>

<style scoped>
.jn { background: #0b1020; background-image: radial-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1.2px); background-size: 22px 22px; color: #cbd5e1; }
.jn-table { border-radius: 14px; background: #0f1628; border: 1px solid #222d47; overflow: hidden; }
.jn-head { height: 36px; display: flex; align-items: center; padding: 0 14px; font: 600 11px ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #8b97b8; background: #131c33; border-bottom: 1px solid #222d47; }
.jn-row { height: 40px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 14px; font-size: 13px; color: #e6ecff; border-bottom: 1px solid #18213a; transition: background 0.3s, opacity 0.3s; }
.jn-row:last-child { border-bottom: 0; }
.jn-orow { display: grid; grid-template-columns: 1rem minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: center; height: 40px; padding: 0 14px; font-size: 13px; color: #e6ecff; border-bottom: 1px solid #18213a; }
.jn-row--now { background: rgb(251 191 36 / 0.16); outline: 1px solid #fbbf24; outline-offset: -1px; }
.jn-row--hit { background: rgb(52 211 153 / 0.16); }
.jn-row--right { background: rgb(96 165 250 / 0.16); }
.jn-line { animation: draw 0.6s ease-out both; stroke-dashoffset: 0; }
@keyframes draw { from { stroke-dashoffset: 200; } }
.jn-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; background: #121a2e; border: 1px solid #26324d; color: #e6ecff; font-size: 13px; font-weight: 600; }
.jn-btn:hover { border-color: #60a5fa; }
.jn-out-enter-active { transition: opacity 0.35s, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1); }
.jn-out-enter-from { opacity: 0; transform: translateX(-16px); }
@media (prefers-reduced-motion: reduce) { .jn-line, .jn-out-enter-active { animation: none; transition: none; } }
</style>
