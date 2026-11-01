<script setup lang="ts">
/**
 * /visualiser/saql — build a SAQL query from statements (or start from a
 * preset) and step through it: the stream after every line, rows a filter
 * drops struck through, groups as buckets, cogroup as matched pairs, and why
 * SAQL refuses a statement where it would. The query lives in the URL hash, so
 * a link opens the same query at the same step.
 *
 * Prerendered; everything runs in the browser on the sample data
 * (app/utils/vis).
 */
import type { Cmp } from '~/utils/vis/data'
import { DATASETS, columnsOf } from '~/utils/vis/data'
import { type Gen, type GenAgg, type Join, type SaqlStep, type View, SAQL_PRESETS, runSaql, saqlLines } from '~/utils/vis/saql'

definePageMeta({ focus: true })

const { t } = useI18n()

const presetId = ref('pipelineByStage')
const steps = ref<SaqlStep[]>(structuredClone(SAQL_PRESETS[0]!.steps))
const step = ref(0)
function usePreset(id: string) {
  presetId.value = id
  steps.value = structuredClone(SAQL_PRESETS.find(p => p.id === id)!.steps)
  step.value = 0
}

const snapshots = computed(() => runSaql(steps.value))
const lines = computed(() => saqlLines(steps.value))
const snap = computed(() => snapshots.value[Math.min(step.value, snapshots.value.length - 1)])
const presetList = computed(() => SAQL_PRESETS.map(p => ({ id: p.id, label: t(`vis.saql.presets.${p.id}`) })))
const caption = computed(() => (snap.value ? t(`vis.saql.explain.${snap.value.explain}`, snap.value.params) : ''))
const shownFor = (beat: 'before' | 'after'): View | undefined => (beat === 'before' && snap.value?.before ? snap.value.before : snap.value?.view)

// Fields a statement can name: whatever the stream held before it.
function fieldsOfView(v?: View): string[] {
  if (!v) return []
  if (v.kind === 'rows') return columnsOf(v.rows)
  if (v.kind === 'groups') return columnsOf(v.groups.flatMap(g => g.rows))
  return columnsOf(v.groups.flatMap(g => g.a))
}
const allFields = [...new Set(Object.values(DATASETS).flatMap(d => columnsOf(d.rows)))]
const fieldsAt = (i: number) => {
  const prev = snapshots.value[i - 1]
  const f = prev ? fieldsOfView(prev.view) : []
  return f.length ? f : allFields
}
const rightFields = (ds: string) => columnsOf(DATASETS[ds]?.rows ?? [])
const afterCogroup = (i: number) => steps.value.slice(0, i).some(s => s.op === 'cogroup')

/* --- Editing ------------------------------------------------------------------ */
const OPS: SaqlStep['op'][] = ['filter', 'group', 'cogroup', 'foreach', 'order', 'limit']
const CMPS: Cmp[] = ['==', '!=', '>', '>=', '<', '<=', 'in', 'is null', 'is not null']
const AGGS: (GenAgg | '')[] = ['', 'count', 'sum', 'avg', 'min', 'max', 'unique', 'first']
const JOINS: Join[] = ['inner', 'left', 'right', 'full']

function blank(op: SaqlStep['op'], at: number): SaqlStep {
  const f = fieldsAt(at)
  switch (op) {
    case 'load': return { op, dataset: 'opportunities' }
    case 'filter': return { op, field: f[0] ?? 'Amount', cmp: '==', value: '' }
    case 'group': return { op, by: [f.includes('StageName') ? 'StageName' : f[0]!] }
    case 'cogroup': return { op, by: 'AccountId', with: 'accounts', withBy: 'Id', join: 'inner' }
    case 'foreach': return { op, gen: [{ field: f[0]!, as: f[0]! }] }
    case 'order': return { op, field: f[0]!, dir: 'desc' }
    case 'limit': return { op, n: 5 }
  }
}
function add(op: SaqlStep['op']) {
  steps.value.push(blank(op, steps.value.length))
  step.value = steps.value.length - 1
}
function remove(i: number) {
  steps.value.splice(i, 1)
  step.value = Math.min(step.value, steps.value.length - 1)
}
function move(i: number, d: -1 | 1) {
  const j = i + d
  if (j < 1 || j >= steps.value.length) return
  const s = steps.value
  ;[s[i], s[j]] = [s[j]!, s[i]!]
}
function addGen(s: Extract<SaqlStep, { op: 'foreach' }>, i: number) {
  const f = fieldsAt(i)[0] ?? 'Id'
  s.gen.push({ field: f, as: `${f}_${s.gen.length}`, ...(afterCogroup(i) ? { side: 'a' as const } : {}) })
}
const setAgg = (g: Gen, v: string) => {
  if (v) g.agg = v as GenAgg
  else delete g.agg
}

/* --- Share by URL ----------------------------------------------------------------- */
onMounted(() => {
  try {
    const m = location.hash.match(/^#q=(.+)$/)
    if (m) {
      const parsed = JSON.parse(decodeURIComponent(m[1]!)) as { steps: SaqlStep[], step?: number }
      if (Array.isArray(parsed.steps) && parsed.steps[0]?.op === 'load') {
        steps.value = parsed.steps
        presetId.value = ''
        step.value = parsed.step ?? 0
      }
    }
  } catch { /* a broken link opens the default */ }
})
watch([steps, step], () => {
  history.replaceState(history.state, '', `#q=${encodeURIComponent(JSON.stringify({ steps: steps.value, step: step.value }))}`)
}, { deep: true })

const title = computed(() => t('vis.saql.seoTitle'))
const description = computed(() => t('vis.saql.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.saql.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'LOAD · FILTER · GROUP · COGROUP · FOREACH' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.saql.title'), path: '/visualiser/saql' }],
  extra: [{
    '@type': 'LearningResource',
    'name': t('vis.saql.title'),
    'learningResourceType': 'Interactive simulation',
    'interactivityType': 'active',
    'educationalLevel': 'Beginner',
    'teaches': 'SAQL execution order: load, filter, group, cogroup, foreach, order, limit',
    'isAccessibleForFree': true
  }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V1 / SAQL"
    :title="t('vis.saql.title')"
    :count="snapshots.length"
    :caption="caption"
    :eyebrow="snap ? `${t('vis.lineOf', { n: snap.line + 1 })} · ${steps[snap.line]?.op}` : ''"
    :error="Boolean(snap?.error)"
    :presets="presetList"
    :preset="presetId"
    :edit-label="t('vis.saql.query')"
    :stamp="snap ? (steps[snap.line]?.op === 'cogroup' ? `cogroup ${(steps[snap.line] as { join: string }).join}` : steps[snap.line]?.op === 'group' ? 'group by' : steps[snap.line]?.op) : ''"
    @preset="usePreset"
  >
    <!-- Rail: the query itself, the running line lit -->
    <template #rail>
      <div class="bg-(--navy) graph-paper-navy">
        <p class="border-b border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">
          SAQL
        </p>
        <pre class="overflow-x-auto py-2 text-[12px] leading-relaxed text-white"><code><span
          v-for="(l, i) in lines"
          :key="i"
          class="block cursor-pointer whitespace-pre px-4 py-0.5 transition-colors"
          :class="i === step ? 'bg-(--signal) text-white' : i < step ? 'text-white' : 'text-white/40'"
          @click="step = i"
        >{{ l }}</span></code></pre>
      </div>
      <ol class="divide-y divide-dashed divide-(--line)">
        <li
          v-for="(sn, i) in snapshots"
          :key="i"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-2 text-start text-sm"
            :class="i === step ? 'bg-(--ice) font-bold text-(--signal)' : 'text-(--ink) hover:bg-(--ice)/60'"
            @click="step = i"
          >
            <span class="w-5 font-mono text-xs">{{ i + 1 }}</span>
            <span class="font-mono text-xs uppercase">{{ steps[i]?.op }}</span>
            <span
              class="ms-auto font-mono text-[11px] tabular-nums"
              :class="sn.error ? 'text-error' : 'text-(--ink2)'"
            >{{ sn.error ? '✕' : `${sn.rowsIn} → ${sn.rowsOut}` }}</span>
          </button>
        </li>
      </ol>
      <details class="border-t-[1.5px] border-(--ink) px-4 py-3 text-sm">
        <summary class="cursor-pointer font-bold text-(--ink)">
          {{ t('vis.howToRead') }}
        </summary>
        <div
          v-for="k in ['order', 'group', 'cogroup']"
          :key="k"
          class="mt-3"
        >
          <p class="font-semibold text-(--ink)">
            {{ t(`vis.saql.notes.${k}.title`) }}
          </p>
          <p class="mt-1 leading-relaxed text-(--ink2)">
            {{ t(`vis.saql.notes.${k}.body`) }}
          </p>
        </div>
      </details>
    </template>

    <!-- Stage: the stream after this line, animated -->
    <template #stage="{ beat }">
      <template
        v-for="v in [shownFor(beat)]"
        :key="`stage-${v?.kind}`"
      >
        <template v-if="v && snap">
          <div class="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span class="border-[1.5px] border-(--ink) bg-(--card) px-2 py-0.5 tabular-nums">{{ t('vis.rowsIn', { n: snap.rowsIn }) }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="text-(--ink2)"
            />
            <span class="border-[1.5px] border-(--signal) bg-(--card) px-2 py-0.5 tabular-nums text-(--signal)">{{ v.kind === 'rows' ? t('vis.rowsOut', { n: snap.rowsOut }) : v.kind === 'groups' ? t('vis.groupsOut', { n: v.groups.length }) : t('vis.keysOut', { n: v.groups.length }) }}</span>
            <span
              v-if="snap.before"
              class="ms-2 uppercase tracking-[.1em] text-(--ink2)"
            >{{ beat === 'before' ? t('vis.beatBefore') : t('vis.beatAfter') }}</span>
          </div>
          <VisCards
            v-if="v.kind === 'rows'"
            :rows="v.rows"
            :marks="v.marks"
            :new-cols="v.newCols"
          />
          <!-- Groups: a lane per key -->
          <div
            v-else-if="v.kind === 'groups'"
            class="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]"
          >
            <div
              v-for="(g, gi) in v.groups"
              :key="g.key"
              class="vis-lane border-[1.5px] border-(--ink) bg-(--card)"
              :style="{ '--i': gi }"
            >
              <p class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-2.5 py-1 font-mono text-xs">
                <span class="truncate font-bold text-(--ink)">{{ g.key }}</span>
                <span class="text-(--ink2)">{{ g.rows.length }}</span>
              </p>
              <VisCards
                :rows="g.rows"
                :max="3"
                dense
                class="p-2"
              />
            </div>
          </div>
          <!-- Cogroup: each key, both sides -->
          <div
            v-else
            class="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(19rem,1fr))]"
          >
            <div
              v-for="(g, gi) in v.groups"
              :key="g.key"
              class="vis-lane border-[1.5px] bg-(--card)"
              :class="g.kept ? 'border-(--ink)' : 'border-dashed border-error opacity-60'"
              :style="{ '--i': gi }"
            >
              <p class="flex items-center gap-2 border-b-[1.5px] border-(--ink) px-2.5 py-1 font-mono text-xs">
                <span class="font-bold text-(--ink)">{{ g.key }}</span>
                <span class="text-(--ink2)">a {{ g.a.length }} · b {{ g.b.length }}</span>
                <span
                  class="ms-auto uppercase"
                  :class="g.kept ? 'text-(--signal)' : 'text-error'"
                >{{ g.kept ? t('vis.kept') : t('vis.dropped') }}</span>
              </p>
              <div class="grid grid-cols-2 gap-2 p-2">
                <VisCards
                  :rows="g.a"
                  :max="2"
                  dense
                />
                <VisCards
                  :rows="g.b"
                  :max="2"
                  dense
                />
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>

    <!-- Edit: the statements -->
    <template #edit>
      <div class="space-y-4">
        <ol class="space-y-2">
          <li
            v-for="(s, i) in steps"
            :key="i"
            class="border-[1.5px] bg-(--card)"
            :class="i === step ? 'border-(--signal) shadow-[4px_4px_0_var(--signal)]' : snapshots[i]?.error ? 'border-error' : 'border-(--ink)'"
          >
            <div
              class="flex cursor-pointer items-center gap-2 border-b border-dashed border-(--line) px-3 py-1.5"
              @click="step = i"
            >
              <span class="w-5 font-mono text-xs font-bold text-(--signal)">{{ i + 1 }}</span>
              <span class="font-mono text-xs font-semibold uppercase tracking-[.08em] text-(--ink)">{{ s.op }}</span>
              <span
                v-if="snapshots[i]"
                class="font-mono text-[11px] tabular-nums text-(--ink2)"
              >{{ snapshots[i]!.rowsIn }} → {{ snapshots[i]!.rowsOut }}</span>
              <span class="ms-auto flex items-center">
                <UButton
                  v-if="i > 0"
                  icon="i-lucide-arrow-up"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  square
                  :aria-label="t('vis.moveUp')"
                  @click.stop="move(i, -1)"
                />
                <UButton
                  v-if="i > 0"
                  icon="i-lucide-arrow-down"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  square
                  :aria-label="t('vis.moveDown')"
                  @click.stop="move(i, 1)"
                />
                <UButton
                  v-if="i > 0"
                  icon="i-lucide-x"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  square
                  :aria-label="t('vis.remove')"
                  @click.stop="remove(i)"
                />
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 p-2.5 text-sm">
              <template v-if="s.op === 'load'">
                <USelect
                  v-model="s.dataset"
                  :items="Object.keys(DATASETS).filter(d => d !== 'targets')"
                  size="sm"
                  class="col-span-2"
                />
              </template>
              <template v-else-if="s.op === 'filter'">
                <USelect
                  v-model="s.field"
                  :items="fieldsAt(i)"
                  size="sm"
                />
                <USelect
                  v-model="s.cmp"
                  :items="CMPS"
                  size="sm"
                />
                <UInput
                  v-if="s.cmp !== 'is null' && s.cmp !== 'is not null'"
                  v-model="s.value"
                  size="sm"
                  class="col-span-2"
                  :placeholder="t('vis.value')"
                />
              </template>
              <template v-else-if="s.op === 'group'">
                <USelectMenu
                  v-model="s.by"
                  :items="fieldsAt(i)"
                  multiple
                  size="sm"
                  class="col-span-2"
                  :placeholder="t('vis.saql.groupAll')"
                />
              </template>
              <template v-else-if="s.op === 'cogroup'">
                <USelect
                  v-model="s.by"
                  :items="fieldsAt(i)"
                  size="sm"
                />
                <USelect
                  v-model="s.join"
                  :items="JOINS"
                  size="sm"
                />
                <USelect
                  v-model="s.with"
                  :items="Object.keys(DATASETS)"
                  size="sm"
                />
                <USelect
                  v-model="s.withBy"
                  :items="rightFields(s.with)"
                  size="sm"
                />
              </template>
              <template v-else-if="s.op === 'foreach'">
                <div
                  v-for="(g, gi) in s.gen"
                  :key="gi"
                  class="col-span-2 grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-1"
                >
                  <USelect
                    v-if="afterCogroup(i)"
                    :model-value="g.side ?? 'a'"
                    :items="['a', 'b']"
                    size="xs"
                    @update:model-value="g.side = $event as 'a' | 'b'"
                  />
                  <span v-else />
                  <USelect
                    :model-value="g.agg ?? ''"
                    :items="AGGS.map(a => ({ label: a || '—', value: a }))"
                    size="xs"
                    @update:model-value="setAgg(g, String($event))"
                  />
                  <USelect
                    v-model="g.field"
                    :items="afterCogroup(i) && g.side === 'b' ? rightFields((steps.find(x => x.op === 'cogroup') as { with: string }).with) : fieldsAt(i)"
                    size="xs"
                  />
                  <UInput
                    v-model="g.as"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    square
                    :aria-label="t('vis.remove')"
                    @click="s.gen.splice(gi, 1)"
                  />
                </div>
                <UButton
                  size="xs"
                  variant="link"
                  icon="i-lucide-plus"
                  class="col-span-2 justify-self-start"
                  @click="addGen(s, i)"
                >
                  {{ t('vis.saql.addField') }}
                </UButton>
              </template>
              <template v-else-if="s.op === 'order'">
                <USelect
                  v-model="s.field"
                  :items="fieldsAt(i)"
                  size="sm"
                />
                <USelect
                  v-model="s.dir"
                  :items="['asc', 'desc']"
                  size="sm"
                />
              </template>
              <template v-else-if="s.op === 'limit'">
                <UInput
                  v-model.number="s.n"
                  type="number"
                  min="1"
                  size="sm"
                />
              </template>
            </div>
          </li>
        </ol>

        <div class="flex flex-wrap gap-1.5">
          <UButton
            v-for="op in OPS"
            :key="op"
            size="xs"
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
            @click="add(op)"
          >
            {{ op }}
          </UButton>
        </div>
        <p class="text-sm text-(--ink2)">
          {{ t('vis.saql.shareHint') }}
        </p>
      </div>
    </template>
  </VisShell>
</template>

<style scoped>
.vis-lane {
  animation: lane-in 0.45s cubic-bezier(0.3, 1.4, 0.5, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms);
}
@keyframes lane-in {
  from { opacity: 0; transform: translateY(14px) scale(0.96); }
}
@media (prefers-reduced-motion: reduce) {
  .vis-lane { animation: none; }
}
</style>
