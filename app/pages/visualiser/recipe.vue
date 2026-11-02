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
import type { CanvasNode } from '~/components/vis/Canvas.vue'

definePageMeta({ focus: true })

const { t } = useI18n()

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
const presetList = computed(() => RECIPE_PRESETS.map(p => ({ id: p.id, label: t(`vis.recipe.presets.${p.id}`) })))
const caption = computed(() => (current.value ? t(`vis.recipe.explain.${current.value.explain}`, current.value.params) : ''))

const ICON: Record<RecipeNode['type'], string> = { input: 'i-lucide-database', filter: 'i-lucide-filter', transform: 'i-lucide-function-square', join: 'i-lucide-merge', append: 'i-lucide-rows-3', aggregate: 'i-lucide-sigma', drop: 'i-lucide-columns-3', output: 'i-lucide-hard-drive-download' }
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
          : n.type === 'drop'
            ? `− ${n.fields.join(', ')}`
            : n.type === 'output' ? n.name : n.type
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

/* --- The canvas: every node with its output rows ------------------------------------ */
const KIND: Partial<Record<RecipeNode['type'], string>> = { input: 'source' }
const canvas = computed<CanvasNode[]>(() => results.value.map((r) => {
  const n = nodes.value.find(x => x.id === r.id)!
  return {
    id: n.id,
    name: n.type === 'input' ? n.dataset : n.id,
    label: n.type === 'join' ? `${n.join} join` : t(`vis.recipe.nodes.${n.type}`),
    detail: n.type === 'input' ? t('vis.rowsIn', { n: r.rows.length }) : detailOf(n),
    icon: ICON[n.type],
    kind: KIND[n.type] ?? n.type,
    inputs: inputsOf(n),
    order: r.order,
    rows: r.rows
  }
}))
const detailOf = (n: RecipeNode) => n.type === 'join'
  ? `${n.leftKey} = ${n.prefix}.${n.rightKey}`
  : n.type === 'transform'
    ? n.fns.map(f => `${f.fn}(${f.field})`).join(', ')
    : n.type === 'aggregate'
      ? `${n.measures.map(m => `${m.agg}(${m.field})`).join(', ')} by ${n.by.join(', ') || '—'}`
      : n.type === 'drop' ? n.fields.join(', ') : subOf(n)
const focusOf = (n: RecipeNode): string[] => n.type === 'filter'
  ? [n.field]
  : n.type === 'join'
    ? [n.leftKey, n.rightKey]
    : n.type === 'aggregate'
      ? [...n.by, ...n.measures.map(m => m.field)]
      : n.type === 'transform' ? n.fns.map(f => f.field) : []

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
  <VisShell
    v-model:step="step"
    sheet="FIG. V2 / RECIPE"
    :title="t('vis.recipe.title')"
    :count="results.length"
    :caption="caption"
    :eyebrow="current && node ? `${t('vis.stepOf', { n: current.order, total: results.length })} · ${t(`vis.recipe.nodes.${node.type}`)}` : ''"
    :presets="presetList"
    :preset="presetId"
    :edit-label="t('vis.recipe.editNodes')"
    :rail="false"
    @preset="usePreset"
  >
    <!-- Rail: the execution order -->
    <template #rail>
      <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
        {{ t('vis.recipe.order') }}
      </p>
      <ol class="divide-y divide-dashed divide-(--line)">
        <li
          v-for="(r, i) in results"
          :key="r.id"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-4 py-2 text-start text-sm"
            :class="i === step ? 'bg-(--ice) font-bold text-(--signal)' : 'text-(--ink) hover:bg-(--ice)/60'"
            @click="step = i"
          >
            <span
              class="flex size-5 shrink-0 items-center justify-center font-mono text-[11px]"
              :class="i <= step ? 'bg-(--ink) text-(--paper)' : 'border border-(--line) text-(--ink2)'"
            >{{ r.order }}</span>
            <UIcon
              :name="ICON[nodes.find(n => n.id === r.id)!.type]"
              class="size-4 shrink-0"
            />
            <span class="min-w-0 flex-1 truncate">{{ r.id }}</span>
            <span class="font-mono text-[11px] tabular-nums text-(--ink2)">{{ r.rowsIn }} → {{ r.rows.length }}</span>
          </button>
        </li>
      </ol>
      <div
        v-if="node?.type === 'join'"
        class="border-t-[1.5px] border-(--ink) px-4 py-3"
      >
        <p class="mono-label mb-2">
          {{ t('vis.recipe.compare') }}
        </p>
        <button
          v-for="c in joinCounts"
          :key="c.join"
          type="button"
          class="flex w-full items-center justify-between px-2 py-1 font-mono text-xs"
          :class="c.join === node.join ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="node.join = c.join"
        >
          <span>{{ c.join }}</span><span class="tabular-nums">{{ t('vis.rowsOut', { n: c.rows }) }}</span>
        </button>
      </div>
      <details class="border-t-[1.5px] border-(--ink) px-4 py-3 text-sm">
        <summary class="cursor-pointer font-bold text-(--ink)">
          {{ t('vis.howToRead') }}
        </summary>
        <div
          v-for="k in ['order', 'joins', 'grain']"
          :key="k"
          class="mt-3"
        >
          <p class="font-semibold text-(--ink)">
            {{ t(`vis.recipe.notes.${k}.title`) }}
          </p>
          <p class="mt-1 leading-relaxed text-(--ink2)">
            {{ t(`vis.recipe.notes.${k}.body`) }}
          </p>
        </div>
      </details>
    </template>

    <!-- Stage: the whole recipe on a canvas, the camera on this node -->
    <template #stage>
      <VisCanvas
        v-if="current && node"
        :nodes="canvas"
        :active="current.id"
        :step-key="`${presetId}-${current.id}-${step}`"
        :marks="current.marks"
        :new-cols="current.newCols"
        :drop-cols="current.dropCols"
        :focus="focusOf(node)"
        @select="select"
      />
    </template>

    <!-- Edit: the node, and every function -->
    <template #edit>
      <div class="space-y-5">
        <template v-if="current && node">
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
              <template v-else-if="node.type === 'drop'">
                <USelectMenu
                  v-model="node.fields"
                  :items="fieldsFor(node)"
                  multiple
                  class="w-full"
                  :placeholder="t('vis.recipe.nodes.drop')"
                />
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
        </template>
        <section class="space-y-4 border-t-[1.5px] border-(--ink) pt-5">
          <p class="eyebrow">
            {{ t('vis.recipe.catalogue') }}
          </p>
          <h2 class="bp-h3">
            {{ t('vis.recipe.catalogueTitle') }}
          </h2>
          <div class="grid gap-4">
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
      </div>
    </template>
  </VisShell>
</template>
