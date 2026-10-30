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

const { t } = useI18n()
const localePath = useLocalePath()

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
const showBefore = ref(true)
const shown = computed<View | undefined>(() => (snap.value?.before && showBefore.value ? snap.value.before : snap.value?.view))

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
  <div>
    <BpPageHeader
      sheet="FIG. V1 / SAQL"
      :title="t('vis.saql.title')"
      :lead="t('vis.saql.lead')"
    >
      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="p in SAQL_PRESETS"
          :key="p.id"
          type="button"
          class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
          :class="presetId === p.id ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          @click="usePreset(p.id)"
        >
          {{ t(`vis.saql.presets.${p.id}`) }}
        </button>
      </div>
    </BpPageHeader>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[26rem_minmax(0,1fr)] lg:px-8">
      <!-- The query: statements, editable -->
      <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <p class="eyebrow">
          {{ t('vis.saql.query') }}
        </p>
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

        <!-- The generated SAQL, the current line lit -->
        <div class="border-[1.5px] border-(--ink) bg-(--navy) graph-paper-navy">
          <p class="border-b-[1.5px] border-(--ink) px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">
            SAQL
          </p>
          <pre class="overflow-x-auto p-3 text-[12.5px] leading-relaxed text-white"><code><span
            v-for="(l, i) in lines"
            :key="i"
            class="block cursor-pointer whitespace-pre px-1"
            :class="i === step ? 'bg-(--signal) text-white' : i < step ? 'text-white' : 'text-white/45'"
            @click="step = i"
          >{{ l }}</span></code></pre>
        </div>
      </aside>

      <!-- Execution -->
      <section class="min-w-0 space-y-5">
        <VisPlayer
          v-model="step"
          :count="snapshots.length"
        />

        <div
          v-if="snap"
          class="border-[1.5px] bg-(--card) p-5"
          :class="snap.error ? 'border-error' : 'border-(--ink)'"
        >
          <p class="eyebrow">
            {{ t('vis.lineOf', { n: snap.line + 1 }) }} · {{ steps[snap.line]?.op }}
          </p>
          <p class="mt-2 text-[17px] leading-relaxed text-(--ink)">
            {{ t(`vis.saql.explain.${snap.explain}`, snap.params) }}
          </p>
          <p class="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-(--ink2)">
            <span class="border-[1.5px] border-(--ink) px-2 py-0.5 tabular-nums">{{ t('vis.rowsIn', { n: snap.rowsIn }) }}</span>
            <UIcon name="i-lucide-arrow-right" />
            <span class="border-[1.5px] border-(--signal) px-2 py-0.5 tabular-nums text-(--signal)">{{ snap.view.kind === 'rows' ? t('vis.rowsOut', { n: snap.rowsOut }) : snap.view.kind === 'groups' ? t('vis.groupsOut', { n: snap.view.groups.length }) : t('vis.keysOut', { n: snap.view.groups.length }) }}</span>
            <UButton
              v-if="snap.before"
              size="xs"
              color="neutral"
              variant="outline"
              class="ms-auto"
              :icon="showBefore ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              @click="showBefore = !showBefore"
            >
              {{ showBefore ? t('vis.showAfter') : t('vis.showBefore') }}
            </UButton>
          </p>
        </div>

        <template v-if="shown">
          <!-- Rows -->
          <VisTable
            v-if="shown.kind === 'rows'"
            :key="`r${step}`"
            :rows="shown.rows"
            :marks="shown.marks"
            :new-cols="shown.newCols"
          />
          <!-- Groups: one bucket per key -->
          <div
            v-else-if="shown.kind === 'groups'"
            :key="`g${step}`"
            class="grid gap-4 md:grid-cols-2"
          >
            <VisTable
              v-for="g in shown.groups"
              :key="g.key"
              :rows="g.rows"
              :caption="`${shown.by.join(', ') || 'all'} = ${g.key} · ${g.rows.length}`"
            />
          </div>
          <!-- Cogroup: each key's rows from both sides -->
          <div
            v-else
            :key="`p${step}`"
            class="space-y-3"
          >
            <div
              v-for="g in shown.groups"
              :key="g.key"
              class="border-[1.5px] bg-(--card)"
              :class="g.kept ? 'border-(--ink)' : 'border-dashed border-error opacity-60'"
            >
              <p class="flex items-center gap-2 border-b-[1.5px] border-(--ink) px-3 py-1.5 font-mono text-xs">
                <span class="font-bold text-(--ink)">{{ g.key }}</span>
                <span class="text-(--ink2)">a: {{ g.a.length }} · b: {{ g.b.length }}</span>
                <span
                  class="ms-auto uppercase tracking-[.08em]"
                  :class="g.kept ? 'text-(--signal)' : 'text-error'"
                >{{ g.kept ? t('vis.kept') : t('vis.dropped') }}</span>
              </p>
              <div class="grid gap-2 p-2 md:grid-cols-2">
                <VisTable
                  :rows="g.a"
                  :caption="`a · ${shown.left}`"
                />
                <VisTable
                  :rows="g.b"
                  :caption="`b · ${shown.right}`"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- How to read it -->
        <div class="grid gap-4 border-[1.5px] border-(--ink) bg-(--ice) p-5 md:grid-cols-3">
          <div
            v-for="k in ['order', 'group', 'cogroup']"
            :key="k"
          >
            <p class="font-bold text-(--ink)">
              {{ t(`vis.saql.notes.${k}.title`) }}
            </p>
            <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
              {{ t(`vis.saql.notes.${k}.body`) }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton
            :to="localePath('/visualiser/recipe')"
            icon="i-lucide-workflow"
            variant="outline"
            color="neutral"
          >
            {{ t('vis.recipe.title') }}
          </UButton>
          <UButton
            :to="localePath('/visualiser/dataflow')"
            icon="i-lucide-git-fork"
            variant="outline"
            color="neutral"
          >
            {{ t('vis.dataflow.title') }}
          </UButton>
          <UButton
            :to="localePath('/curriculum')"
            icon="i-lucide-book-open"
            variant="ghost"
            color="neutral"
          >
            {{ t('vis.toCourse') }}
          </UButton>
        </div>
      </section>
    </div>
  </div>
</template>
