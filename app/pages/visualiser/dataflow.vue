<script setup lang="ts">
/**
 * /visualiser/dataflow — a dataflow's JSON beside the graph it describes, and
 * a step-through of how it runs: dependency waves (nodes in one wave can run
 * in parallel), the serial order, and each node's rows. Options switch the
 * filter, the flatten and security predicate, computeRelative, and augment's
 * operation and direction — so the JSON, the graph and the data all change
 * together.
 *
 * Prerendered; runs in the browser on the sample data (app/utils/vis).
 */
import { type DfOptions, DEFAULT_DF_OPTIONS, buildDataflow, dataflowPlan, runDataflow, sourcesOf } from '~/utils/vis/dataflow'
import type { CanvasNode, Check } from '~/components/vis/Canvas.vue'
import { type Row, fmt } from '~/utils/vis/data'

definePageMeta({ focus: true })

const { t } = useI18n()

const opts = reactive<DfOptions>({ ...DEFAULT_DF_OPTIONS })
const df = computed(() => buildDataflow(opts))
const results = computed(() => runDataflow(df.value))
const plan = computed(() => dataflowPlan(df.value))
const step = ref(0)
watch(df, () => (step.value = Math.min(step.value, results.value.length - 1)))
const current = computed(() => results.value[Math.min(step.value, results.value.length - 1)])
const caption = computed(() => (current.value ? t(`vis.dataflow.explain.${current.value.explain}`, current.value.params) : ''))

const KIND: Record<string, string> = { sfdcDigest: 'source', edgemart: 'source', filter: 'filter', augment: 'join', computeExpression: 'transform', computeRelative: 'transform', flatten: 'transform', sliceDataset: 'drop', append: 'append', sfdcRegister: 'output' }
const canvas = computed<CanvasNode[]>(() => results.value.map(r => ({
  id: r.name,
  name: `${r.name} · W${r.wave}`,
  label: r.action,
  detail: detailOf(r.name),
  icon: ICON[r.action] ?? 'i-lucide-box',
  kind: KIND[r.action] ?? 'transform',
  inputs: sourcesOf(df.value[r.name]!),
  order: r.order,
  rows: r.rows
})))
const select = (id: string) => {
  const i = results.value.findIndex(r => r.name === id)
  if (i >= 0) step.value = i
}
const waves = computed(() => {
  const by: Record<number, string[]> = {}
  for (const [n, w] of Object.entries(plan.value.wave)) (by[w] ??= []).push(n)
  return Object.entries(by).map(([w, names]) => ({ wave: Number(w), names }))
})
const ICON: Record<string, string> = { sfdcDigest: 'i-lucide-cloud-download', edgemart: 'i-lucide-database', filter: 'i-lucide-filter', augment: 'i-lucide-merge', computeExpression: 'i-lucide-function-square', computeRelative: 'i-lucide-arrow-left-right', flatten: 'i-lucide-network', sliceDataset: 'i-lucide-columns-3', append: 'i-lucide-rows-3', sfdcRegister: 'i-lucide-hard-drive-upload' }
const detailOf = (name: string) => {
  const p = df.value[name]?.parameters ?? {}
  return String(p.filter ?? p.operation ?? p.object ?? p.alias ?? (Array.isArray(p.fields) ? (p.fields as { name: string }[]).map(f => f.name).join(', ') : ''))
}
/* Row by row, for the inspector. */
const label = (r: Row) => String(r.Name ?? r.Id ?? r.__id ?? '—')
const rowsOfNode = (name?: string) => (name ? results.value.find(r => r.name === name)?.rows ?? [] : [])
const checks = computed<Check[]>(() => {
  const c = current.value
  const n = c ? df.value[c.name] : undefined
  if (!c || !n) return []
  const p = n.parameters
  if (c.action === 'filter' && c.before) {
    const [field, op, value] = String(p.filter).split(':')
    const test = `${op === 'N' ? '!=' : '=='} ${value}`
    return c.before.map(r => ({ id: String(r.__id), label: label(r), test: `${field} = ${fmt(r[field!] ?? null)}`, ok: c.marks?.[String(r.__id)] !== 'dropped', note: c.marks?.[String(r.__id)] !== 'dropped' ? t('vis.check.kept', { test }) : t('vis.check.dropped', { test }) }))
  }
  if (c.action === 'augment') {
    const lk = (p.left_key as string[])[0]!
    return rowsOfNode(String(p.left)).map((r) => {
      const m = c.marks?.[String(r.__id)]
      return { id: String(r.__id), label: label(r), test: `${lk} = ${fmt(r[lk] ?? null)}`, ok: m !== 'unmatched', note: m === 'unmatched' ? t('vis.check.noMatchKept') : m === 'multi' ? t('vis.check.multi') : t('vis.check.match') }
    })
  }
  if (c.action === 'computeExpression' || c.action === 'computeRelative') {
    const newCol = c.newCols?.[0] ?? ''
    const part = c.action === 'computeRelative' ? (p.partitionBy as string[])[0]! : ''
    return rowsOfNode(String(p.source)).slice(0, 8).map((r) => {
      const out = c.rows.find(x => x.__id === r.__id)
      return { id: String(r.__id), label: label(r), test: part ? `${t('vis.check.partition')} ${part} = ${fmt(r[part] ?? null)}` : `Amount = ${fmt(r.Amount ?? null)}`, ok: true, note: `${newCol} → ${fmt(out?.[newCol] ?? null)}` }
    })
  }
  return []
})
const partition = computed(() => (current.value?.action === 'computeRelative' ? String((df.value[current.value.name]?.parameters.partitionBy as string[] | undefined)?.[0] ?? '') : ''))

const json = (v: unknown) => JSON.stringify(v, null, 2)

const TOGGLES: { key: 'filter' | 'flatten' | 'computeRelative' | 'security' }[] = [{ key: 'filter' }, { key: 'flatten' }, { key: 'computeRelative' }, { key: 'security' }]

const title = computed(() => t('vis.dataflow.seoTitle'))
const description = computed(() => t('vis.dataflow.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.dataflow.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'DIGEST · AUGMENT · COMPUTE · REGISTER' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.dataflow.title'), path: '/visualiser/dataflow' }],
  extra: [{
    '@type': 'LearningResource',
    'name': t('vis.dataflow.title'),
    'learningResourceType': 'Interactive simulation',
    'interactivityType': 'active',
    'teaches': 'CRM Analytics dataflow JSON: sfdcDigest, filter, augment LookupSingleValue and LookupMultiValue, computeExpression, computeRelative, flatten, sliceDataset, sfdcRegister with a security predicate, and the order nodes run in',
    'isAccessibleForFree': true
  }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V3 / DATAFLOW"
    :title="t('vis.dataflow.title')"
    :count="results.length"
    :caption="caption"
    :eyebrow="current ? `${t('vis.stepOf', { n: current.order, total: results.length })} · ${current.action} · ${t('vis.dataflow.wave', { n: current.wave })}` : ''"
    :edit-label="t('vis.dataflow.editJson')"
  >
    <!-- Rail: options and the waves -->
    <template #rail>
      <div class="space-y-2 border-b-[1.5px] border-(--ink) p-4">
        <p class="mono-label">
          {{ t('vis.dataflow.build') }}
        </p>
        <button
          v-for="tg in TOGGLES"
          :key="tg.key"
          type="button"
          class="flex w-full items-center gap-2 border-[1.5px] px-2.5 py-1.5 text-sm font-semibold"
          :class="opts[tg.key] ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--paper) hover:border-(--ink)'"
          :aria-pressed="opts[tg.key]"
          @click="opts[tg.key] = !opts[tg.key]"
        >
          <UIcon :name="opts[tg.key] ? 'i-lucide-square-check' : 'i-lucide-square'" />{{ t(`vis.dataflow.opts.${tg.key}`) }}
        </button>
        <USelect
          v-model="opts.augmentOperation"
          :items="['LookupSingleValue', 'LookupMultiValue']"
          size="sm"
          class="w-full"
        />
        <USelect
          v-model="opts.augmentFrom"
          :items="[{ label: t('vis.dataflow.leftOpps'), value: 'opportunities' }, { label: t('vis.dataflow.leftAccounts'), value: 'accounts' }]"
          size="sm"
          class="w-full"
        />
      </div>
      <p class="bg-(--ice) px-4 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
        {{ t('vis.dataflow.waves') }}
      </p>
      <ol>
        <li
          v-for="w in waves"
          :key="w.wave"
          class="border-b border-dashed border-(--line) px-4 py-2"
        >
          <p class="font-mono text-[11px] uppercase tracking-[.1em] text-(--signal)">
            {{ t('vis.dataflow.wave', { n: w.wave }) }}
          </p>
          <p class="mt-1 flex flex-wrap gap-1">
            <button
              v-for="n in w.names"
              :key="n"
              type="button"
              class="border px-1.5 font-mono text-[11px]"
              :class="current?.name === n ? 'border-(--signal) bg-(--signal) text-white' : 'border-(--line) hover:border-(--ink)'"
              @click="select(n)"
            >
              {{ n }}
            </button>
          </p>
        </li>
      </ol>
      <details class="px-4 py-3 text-sm">
        <summary class="cursor-pointer font-bold text-(--ink)">
          {{ t('vis.howToRead') }}
        </summary>
        <p class="mt-2 leading-relaxed text-(--ink2)">
          {{ t('vis.dataflow.wavesNote') }}
        </p>
        <div
          v-for="k in ['order', 'augment', 'recipes']"
          :key="k"
          class="mt-3"
        >
          <p class="font-semibold text-(--ink)">
            {{ t(`vis.dataflow.notes.${k}.title`) }}
          </p>
          <p class="mt-1 leading-relaxed text-(--ink2)">
            {{ t(`vis.dataflow.notes.${k}.body`) }}
          </p>
        </div>
      </details>
    </template>

    <!-- Stage: the graph, then this node's rows -->
    <template #stage>
      <VisCanvas
        v-if="current"
        :say="caption"
        :nodes="canvas"
        :active="current.name"
        :step-key="`${current.name}-${step}-${JSON.stringify(opts)}`"
        :marks="current.marks"
        :new-cols="current.newCols"
        :drop-cols="current.dropCols"
        :checks="checks"
        :partition="partition"
        @select="select"
      />
    </template>

    <!-- Edit: the JSON, the running node lit -->
    <template #edit>
      <div class="border-[1.5px] border-(--ink) bg-(--navy) graph-paper-navy">
        <p class="sticky top-0 border-b-[1.5px] border-(--ink) bg-(--navy) px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">
          dataflow.json
        </p>
        <pre class="p-3 text-[11.5px] leading-relaxed text-white/50"><code>{<template
          v-for="(n, name, i) in df"
          :key="name"
        ><span
          class="block cursor-pointer whitespace-pre"
          :class="name === current?.name ? 'bg-(--signal)/90 text-white' : results.find(r => r.name === name)!.order < (current?.order ?? 0) ? 'text-white/85' : ''"
          @click="select(String(name))"
        >  "{{ name }}": {{ json(n).replace(/\n/g, '\n  ') }}{{ i < Object.keys(df).length - 1 ? ',' : '' }}</span></template>}</code></pre>
      </div>
    </template>
  </VisShell>
</template>
