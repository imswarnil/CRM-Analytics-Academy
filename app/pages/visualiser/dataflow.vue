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
import type { DagNode } from '~/components/vis/Dag.vue'

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

const dag = computed<DagNode[]>(() => Object.entries(df.value).map(([name, n]) => ({
  id: name,
  label: name.replace(/_/g, ' '),
  sub: n.action,
  inputs: sourcesOf(n),
  order: results.value.find(r => r.name === name)?.order ?? 99,
  wave: plan.value.wave[name]
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
const srcs = computed(() => (current.value ? sourcesOf(df.value[current.value.name]!) : []))
const rowsOf = (name?: string) => (name ? results.value.find(r => r.name === name)?.rows ?? [] : [])
const ICON: Record<string, string> = { sfdcDigest: 'i-lucide-cloud-download', edgemart: 'i-lucide-database', filter: 'i-lucide-filter', augment: 'i-lucide-merge', computeExpression: 'i-lucide-function-square', computeRelative: 'i-lucide-arrow-left-right', flatten: 'i-lucide-network', sliceDataset: 'i-lucide-columns-3', append: 'i-lucide-rows-3', sfdcRegister: 'i-lucide-hard-drive-upload' }
const detailOf = (name: string) => {
  const p = df.value[name]?.parameters ?? {}
  return String(p.filter ?? p.operation ?? p.object ?? p.alias ?? (Array.isArray(p.fields) ? (p.fields as { name: string }[]).map(f => f.name).join(', ') : ''))
}
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
      <VisDag
        :nodes="dag"
        :active="current?.name ?? null"
        :done-up-to="(current?.order ?? 1) - 1"
        max-height="7.5rem"
        @select="select"
      />
      <VisFlow
        v-if="current"
        class="mt-5"
        :step-key="`${current.name}-${step}-${JSON.stringify(opts)}`"
        :op="current.action"
        :icon="ICON[current.action] ?? 'i-lucide-box'"
        :detail="detailOf(current.name)"
        :source="srcs.length ? '' : current.name"
        :input="current.before ?? rowsOf(srcs[0])"
        :input-label="current.action === 'augment' ? srcs[0] : srcs.join(' + ')"
        :side="current.action === 'augment' ? rowsOf(srcs[1]) : current.action === 'append' ? undefined : undefined"
        :side-label="srcs[1] ?? ''"
        :output="current.rows"
        :output-label="current.name"
        :marks="current.marks"
        :new-cols="current.newCols"
        :drop-cols="current.dropCols"
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
