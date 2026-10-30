<script setup lang="ts">
/**
 * /visualiser/recipe — a Data Prep recipe as a graph: pick a preset, change
 * any node (join type and keys, filter, the formula functions in a transform,
 * the aggregate) and step through the execution order, with every node's
 * output rows. Joins mark each left row matched, unmatched or fanned out, and
 * a side table runs the same join all five ways so the row counts can be
 * compared. The function catalogue shows every formula on a real row.
 *
 * Prerendered; runs in the browser on the sample data (app/utils/vis).
 */
import type { Agg, Cmp } from '~/utils/vis/data'
import { DATASETS, columnsOf, fmt } from '~/utils/vis/data'
import { type FnId, type JoinType, type RecipeNode, FN_IDS, FUNCTIONS, JOIN_TYPES, RECIPE_PRESETS, inputsOf, runRecipe } from '~/utils/vis/recipe'
import type { DagNode } from '~/components/vis/Dag.vue'

const { t } = useI18n()
const localePath = useLocalePath()

const presetId = ref(RECIPE_PRESETS[0]!.id)
const nodes = ref<RecipeNode[]>(structuredClone(RECIPE_PRESETS[0]!.nodes))
const step = ref(0)
function usePreset(id: string) {
  presetId.value = id
  nodes.value = structuredClone(RECIPE_PRESETS.find(p => p.id === id)!.nodes)
  step.value = 0
}

const results = computed(() => runRecipe(nodes.value))
const current = computed(() => results.value[Math.min(step.value, results.value.length - 1)])
const node = computed(() => nodes.value.find(n => n.id === current.value?.id))
const showBefore = ref(true)

const ICON: Record<RecipeNode['type'], string> = { input: 'i-lucide-database', filter: 'i-lucide-filter', transform: 'i-lucide-function-square', join: 'i-lucide-merge', append: 'i-lucide-rows-3', aggregate: 'i-lucide-sigma', output: 'i-lucide-hard-drive-download' }
const subOf = (n: RecipeNode) => n.type === 'input'
  ? n.dataset
  : n.type === 'join'
    ? `${n.join} join`
    : n.type === 'transform'
      ? `${n.fns.length} fn`
      : n.type === 'aggregate'
        ? `by ${n.by.join(', ') || '—'}`
        : n.type === 'filter'
          ? `${n.field} ${n.cmp} ${n.value}`
          : n.type === 'output' ? n.name : n.type
const dag = computed<DagNode[]>(() => nodes.value.map(n => ({
  id: n.id,
  label: `${t(`vis.recipe.nodes.${n.type}`)} · ${n.id}`,
  sub: subOf(n),
  inputs: inputsOf(n),
  order: results.value.find(r => r.id === n.id)?.order ?? 99
})))
const select = (id: string) => {
  const i = results.value.findIndex(r => r.id === id)
  if (i >= 0) step.value = i
}

// Columns a node can name: its first input's output.
const fieldsFor = (n: RecipeNode | undefined, which = 0) => {
  if (!n) return []
  const ref = inputsOf(n)[which]
  const res = results.value.find(r => r.id === ref)
  return res ? columnsOf(res.rows) : []
}

const joinLeftRows = computed(() => {
  const n = node.value
  return n?.type === 'join' ? results.value.find(r => r.id === n.left)?.rows ?? [] : []
})

/* --- Join comparison ------------------------------------------------------------ */
const joinCounts = computed(() => {
  const n = node.value
  if (n?.type !== 'join') return []
  return JOIN_TYPES.map((jt) => {
    const r = runRecipe(nodes.value.map(x => (x.id === n.id ? { ...x, join: jt } as RecipeNode : x))).find(x => x.id === n.id)!
    return { join: jt, rows: r.rows.length, unmatched: Number(r.params.unmatched), unmatchedRight: Number(r.params.unmatchedRight) }
  })
})

/* --- Editing -------------------------------------------------------------------- */
const CMPS: Cmp[] = ['==', '!=', '>', '>=', '<', '<=', 'in', 'is null', 'is not null']
const AGGS: Agg[] = ['count', 'sum', 'avg', 'min', 'max', 'unique']
const CATS = ['date', 'text', 'number', 'logic', 'window'] as const
function addFn(fn: FnId) {
  let target = node.value?.type === 'transform' ? node.value : nodes.value.find(n => n.type === 'transform') as Extract<RecipeNode, { type: 'transform' }> | undefined
  if (!target) {
    // No transform yet: insert one straight after the first input.
    const first = nodes.value.find(n => n.type !== 'input' && n.type !== 'output') ?? nodes.value.find(n => n.type === 'output')
    const input = nodes.value.find(n => n.type === 'input')!
    target = { id: 'formulas', type: 'transform', input: input.id, fns: [] }
    if (first && 'input' in first) first.input = 'formulas'
    else if (first?.type === 'join') first.left = 'formulas'
    nodes.value.splice(1, 0, target)
  }
  const field = fn === 'case_won' || fn === 'concat' || fn === 'upper' || fn === 'lower' || fn === 'substr' || fn === 'length' || fn === 'replace' || fn === 'is_null'
    ? (fn === 'case_won' ? 'StageName' : 'Name')
    : FUNCTIONS[fn].cat === 'date' ? 'CloseDate' : 'Amount'
  target.fns.push({ fn, field, as: `${fn}_${field}`, ...(FUNCTIONS[fn].cat === 'window' ? { partition: 'AccountId', order: 'CloseDate' } : {}) })
  select(target.id)
}
const sample = DATASETS.opportunities!.rows
const example = (fn: FnId) => {
  const f = { fn, field: FUNCTIONS[fn].cat === 'date' ? 'CloseDate' : fn === 'case_won' ? 'StageName' : ['upper', 'lower', 'concat', 'substr', 'length', 'replace', 'is_null'].includes(fn) ? 'Name' : 'Amount', as: 'x', partition: 'AccountId', order: 'CloseDate' }
  return { formula: FUNCTIONS[fn].formula(f), input: fmt(sample[0]![f.field] ?? null), output: fmt(FUNCTIONS[fn].apply(sample[0]![f.field] ?? null, f, { rows: sample, i: 0 })) }
}

const title = computed(() => t('vis.recipe.seoTitle'))
const description = computed(() => t('vis.recipe.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.recipe.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'JOIN · TRANSFORM · AGGREGATE · ORDER OF EXECUTION' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.recipe.title'), path: '/visualiser/recipe' }],
  extra: [{
    '@type': 'LearningResource',
    'name': t('vis.recipe.title'),
    'learningResourceType': 'Interactive simulation',
    'interactivityType': 'active',
    'teaches': 'CRM Analytics Data Prep recipes: lookup, left, right, inner and outer joins, formula and date functions, window functions, append, aggregate, execution order',
    'isAccessibleForFree': true
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      sheet="FIG. V2 / RECIPE"
      :title="t('vis.recipe.title')"
      :lead="t('vis.recipe.lead')"
    >
      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="p in RECIPE_PRESETS"
          :key="p.id"
          type="button"
          class="border-[1.5px] px-3 py-1.5 text-sm font-semibold"
          :class="presetId === p.id ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          @click="usePreset(p.id)"
        >
          {{ t(`vis.recipe.presets.${p.id}`) }}
        </button>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('vis.recipe.graph') }}
      </p>
      <VisDag
        :nodes="dag"
        :active="current?.id ?? null"
        :done-up-to="(current?.order ?? 1) - 1"
        @select="select"
      />
      <VisPlayer
        v-model="step"
        :count="results.length"
      />

      <div
        v-if="current && node"
        class="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"
      >
        <!-- The node: what it does, editable -->
        <aside class="space-y-4">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="flex items-center gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2">
              <UIcon
                :name="ICON[node.type]"
                class="size-5 text-(--signal)"
              />
              <span class="font-bold text-(--ink)">{{ current.order }}. {{ t(`vis.recipe.nodes.${node.type}`) }}</span>
              <code class="ms-auto font-mono text-xs text-(--ink2)">{{ node.id }}</code>
            </p>
            <div class="space-y-3 p-4 text-sm">
              <template v-if="node.type === 'input'">
                <USelect
                  v-model="node.dataset"
                  :items="[...Object.keys(DATASETS), 'archive']"
                  class="w-full"
                />
              </template>
              <template v-else-if="node.type === 'filter'">
                <USelect
                  v-model="node.field"
                  :items="fieldsFor(node)"
                  class="w-full"
                />
                <USelect
                  v-model="node.cmp"
                  :items="CMPS"
                  class="w-full"
                />
                <UInput
                  v-if="node.cmp !== 'is null' && node.cmp !== 'is not null'"
                  v-model="node.value"
                  class="w-full"
                  :placeholder="t('vis.value')"
                />
              </template>
              <template v-else-if="node.type === 'join'">
                <UFormField :label="t('vis.recipe.joinType')">
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="jt in JOIN_TYPES"
                      :key="jt"
                      type="button"
                      class="border-[1.5px] px-2 py-1 font-mono text-xs"
                      :class="node.join === jt ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
                      @click="node.join = jt as JoinType"
                    >
                      {{ jt }}
                    </button>
                  </div>
                </UFormField>
                <UFormField :label="t('vis.recipe.leftKey')">
                  <USelect
                    v-model="node.leftKey"
                    :items="fieldsFor(node, 0)"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('vis.recipe.rightKey')">
                  <USelect
                    v-model="node.rightKey"
                    :items="fieldsFor(node, 1)"
                    class="w-full"
                  />
                </UFormField>
                <table class="w-full border-[1.5px] border-(--ink) font-mono text-xs">
                  <caption class="pb-1 text-start text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                    {{ t('vis.recipe.compare') }}
                  </caption>
                  <tr
                    v-for="c in joinCounts"
                    :key="c.join"
                    class="border-b border-dashed border-(--line)"
                    :class="c.join === node.join ? 'bg-(--ice) font-bold' : ''"
                  >
                    <td class="px-2 py-1">
                      {{ c.join }}
                    </td>
                    <td class="px-2 py-1 text-end tabular-nums">
                      {{ t('vis.rowsOut', { n: c.rows }) }}
                    </td>
                  </tr>
                </table>
              </template>
              <template v-else-if="node.type === 'transform'">
                <div
                  v-for="(f, fi) in node.fns"
                  :key="fi"
                  class="space-y-1 border-b border-dashed border-(--line) pb-2"
                >
                  <div class="flex items-center gap-1">
                    <USelect
                      v-model="f.fn"
                      :items="FN_IDS"
                      size="xs"
                      class="flex-1"
                    />
                    <USelect
                      v-model="f.field"
                      :items="fieldsFor(node)"
                      size="xs"
                      class="flex-1"
                    />
                    <UButton
                      icon="i-lucide-x"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      square
                      :aria-label="t('vis.remove')"
                      @click="node.fns.splice(fi, 1)"
                    />
                  </div>
                  <code class="block break-all font-mono text-[11px] text-(--ink2)">{{ FUNCTIONS[f.fn].formula(f) }} → {{ f.as }}</code>
                </div>
                <p class="text-xs text-(--ink2)">
                  {{ t('vis.recipe.addFromCatalogue') }}
                </p>
              </template>
              <template v-else-if="node.type === 'aggregate'">
                <USelectMenu
                  v-model="node.by"
                  :items="fieldsFor(node)"
                  multiple
                  class="w-full"
                  :placeholder="t('vis.recipe.groupBy')"
                />
                <div
                  v-for="(m, mi) in node.measures"
                  :key="mi"
                  class="flex items-center gap-1"
                >
                  <USelect
                    v-model="m.agg"
                    :items="AGGS"
                    size="xs"
                  />
                  <USelect
                    v-model="m.field"
                    :items="fieldsFor(node)"
                    size="xs"
                    class="flex-1"
                  />
                  <UInput
                    v-model="m.as"
                    size="xs"
                    class="w-24"
                  />
                </div>
                <UButton
                  size="xs"
                  variant="link"
                  icon="i-lucide-plus"
                  @click="node.measures.push({ field: 'Amount', agg: 'sum', as: `m${node.measures.length + 1}` })"
                >
                  {{ t('vis.recipe.addMeasure') }}
                </UButton>
              </template>
              <template v-else-if="node.type === 'output'">
                <UInput
                  v-model="node.name"
                  class="w-full"
                />
              </template>
              <p
                v-else
                class="text-(--ink2)"
              >
                {{ inputsOf(node).join(' + ') }}
              </p>
            </div>
          </div>
        </aside>

        <!-- What it produced -->
        <section class="min-w-0 space-y-4">
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-5">
            <p class="eyebrow">
              {{ t('vis.stepOf', { n: current.order, total: results.length }) }} · {{ t(`vis.recipe.nodes.${node.type}`) }}
            </p>
            <p class="mt-2 text-[17px] leading-relaxed text-(--ink)">
              {{ t(`vis.recipe.explain.${current.explain}`, current.params) }}
            </p>
            <p class="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-(--ink2)">
              <span class="border-[1.5px] border-(--ink) px-2 py-0.5 tabular-nums">{{ t('vis.rowsIn', { n: current.rowsIn }) }}</span>
              <UIcon name="i-lucide-arrow-right" />
              <span class="border-[1.5px] border-(--signal) px-2 py-0.5 tabular-nums text-(--signal)">{{ t('vis.rowsOut', { n: current.rows.length }) }}</span>
              <UButton
                v-if="current.before"
                size="xs"
                color="neutral"
                variant="outline"
                class="ms-auto"
                @click="showBefore = !showBefore"
              >
                {{ showBefore ? t('vis.showAfter') : t('vis.showBefore') }}
              </UButton>
            </p>
            <p
              v-if="node.type === 'join'"
              class="mt-3 flex flex-wrap gap-3 font-mono text-[11px] text-(--ink2)"
            >
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-(--signal)" />{{ t('vis.legend.matched') }}</span>
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-warning" />{{ t('vis.legend.unmatched') }}</span>
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-(--glow)" />{{ t('vis.legend.fanout') }}</span>
            </p>
          </div>

          <!-- A join shows its left input marked, then the output -->
          <template v-if="node.type === 'join'">
            <VisTable
              :rows="joinLeftRows"
              :marks="current.marks"
              :caption="`${t('vis.recipe.left')} · ${node.left}`"
            />
            <VisTable
              :rows="current.rows"
              :new-cols="current.newCols"
              :caption="t('vis.recipe.output')"
            />
          </template>
          <VisTable
            v-else
            :rows="current.before && showBefore ? current.before : current.rows"
            :marks="current.before && showBefore ? current.marks : undefined"
            :new-cols="current.newCols"
          />
        </section>
      </div>

      <!-- Function catalogue -->
      <section class="space-y-4 pt-6">
        <p class="eyebrow">
          {{ t('vis.recipe.catalogue') }}
        </p>
        <h2 class="bp-h3">
          {{ t('vis.recipe.catalogueTitle') }}
        </h2>
        <div class="grid gap-6 lg:grid-cols-2">
          <div
            v-for="cat in CATS"
            :key="cat"
            class="border-[1.5px] border-(--ink) bg-(--card)"
          >
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-bold text-(--ink)">
              {{ t(`vis.recipe.cats.${cat}`) }}
            </p>
            <ul>
              <li
                v-for="fn in FN_IDS.filter(f => FUNCTIONS[f].cat === cat)"
                :key="fn"
                class="flex items-start gap-3 border-b border-dashed border-(--line) px-4 py-2 last:border-b-0"
              >
                <div class="min-w-0 flex-1">
                  <code class="block break-all font-mono text-xs text-(--ink)">{{ example(fn).formula }}</code>
                  <span class="font-mono text-[11px] text-(--ink2)">{{ example(fn).input }} → <b class="text-(--signal)">{{ example(fn).output }}</b></span>
                </div>
                <UButton
                  size="xs"
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-plus"
                  :aria-label="t('vis.recipe.addFn', { fn })"
                  @click="addFn(fn)"
                />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="grid gap-4 border-[1.5px] border-(--ink) bg-(--ice) p-5 md:grid-cols-3">
        <div
          v-for="k in ['order', 'joins', 'grain']"
          :key="k"
        >
          <p class="font-bold text-(--ink)">
            {{ t(`vis.recipe.notes.${k}.title`) }}
          </p>
          <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
            {{ t(`vis.recipe.notes.${k}.body`) }}
          </p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <UButton
          :to="localePath('/visualiser/saql')"
          icon="i-lucide-terminal"
          variant="outline"
          color="neutral"
        >
          {{ t('vis.saql.title') }}
        </UButton>
        <UButton
          :to="localePath('/visualiser/dataflow')"
          icon="i-lucide-git-fork"
          variant="outline"
          color="neutral"
        >
          {{ t('vis.dataflow.title') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
