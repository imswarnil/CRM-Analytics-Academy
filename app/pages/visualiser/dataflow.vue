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

const { t } = useI18n()
const localePath = useLocalePath()

const opts = reactive<DfOptions>({ ...DEFAULT_DF_OPTIONS })
const df = computed(() => buildDataflow(opts))
const results = computed(() => runDataflow(df.value))
const plan = computed(() => dataflowPlan(df.value))
const step = ref(0)
watch(df, () => (step.value = Math.min(step.value, results.value.length - 1)))
const current = computed(() => results.value[Math.min(step.value, results.value.length - 1)])
const showBefore = ref(true)

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
  <div>
    <BpPageHeader
      sheet="FIG. V3 / DATAFLOW"
      :title="t('vis.dataflow.title')"
      :lead="t('vis.dataflow.lead')"
    >
      <div class="mt-6 flex flex-wrap items-center gap-2">
        <button
          v-for="tg in TOGGLES"
          :key="tg.key"
          type="button"
          class="flex items-center gap-1.5 border-[1.5px] px-3 py-1.5 text-sm font-semibold"
          :class="opts[tg.key] ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          :aria-pressed="opts[tg.key]"
          @click="opts[tg.key] = !opts[tg.key]"
        >
          <UIcon :name="opts[tg.key] ? 'i-lucide-square-check' : 'i-lucide-square'" />{{ t(`vis.dataflow.opts.${tg.key}`) }}
        </button>
        <USelect
          v-model="opts.augmentOperation"
          :items="['LookupSingleValue', 'LookupMultiValue']"
        />
        <USelect
          v-model="opts.augmentFrom"
          :items="[{ label: t('vis.dataflow.leftOpps'), value: 'opportunities' }, { label: t('vis.dataflow.leftAccounts'), value: 'accounts' }]"
        />
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="min-w-0 space-y-3">
          <p class="eyebrow">
            {{ t('vis.dataflow.graph') }}
          </p>
          <VisDag
            :nodes="dag"
            :active="current?.name ?? null"
            :done-up-to="(current?.order ?? 1) - 1"
            @select="select"
          />
        </div>
        <!-- Waves -->
        <div class="space-y-3">
          <p class="eyebrow">
            {{ t('vis.dataflow.waves') }}
          </p>
          <ol class="border-[1.5px] border-(--ink) bg-(--card)">
            <li
              v-for="w in waves"
              :key="w.wave"
              class="border-b border-dashed border-(--line) px-4 py-2 last:border-b-0"
            >
              <p class="font-mono text-[11px] uppercase tracking-[.1em] text-(--signal)">
                {{ t('vis.dataflow.wave', { n: w.wave }) }}
              </p>
              <p class="mt-0.5 flex flex-wrap gap-1">
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
          <p class="text-sm leading-relaxed text-(--ink2)">
            {{ t('vis.dataflow.wavesNote') }}
          </p>
        </div>
      </div>

      <VisPlayer
        v-model="step"
        :count="results.length"
      />

      <div
        v-if="current"
        class="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]"
      >
        <!-- The JSON, the current node lit -->
        <div class="border-[1.5px] border-(--ink) bg-(--navy) graph-paper-navy lg:max-h-[38rem] lg:overflow-y-auto">
          <p class="sticky top-0 border-b-[1.5px] border-(--ink) bg-(--navy) px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">
            dataflow.json
          </p>
          <pre class="p-3 text-[11.5px] leading-relaxed text-white/50"><code>{<template
            v-for="(n, name, i) in df"
            :key="name"
          ><span
            class="block cursor-pointer whitespace-pre"
            :class="name === current.name ? 'bg-(--signal)/90 text-white' : results.find(r => r.name === name)!.order < current.order ? 'text-white/85' : ''"
            @click="select(String(name))"
          >  "{{ name }}": {{ json(n).replace(/\n/g, '\n  ') }}{{ i < Object.keys(df).length - 1 ? ',' : '' }}</span></template>}</code></pre>
        </div>

        <section class="min-w-0 space-y-4">
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-5">
            <p class="eyebrow">
              {{ t('vis.stepOf', { n: current.order, total: results.length }) }} · {{ current.action }} · {{ t('vis.dataflow.wave', { n: current.wave }) }}
            </p>
            <p class="mt-2 text-[17px] leading-relaxed text-(--ink)">
              {{ t(`vis.dataflow.explain.${current.explain}`, current.params) }}
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
              v-if="current.action === 'augment'"
              class="mt-3 flex flex-wrap gap-3 font-mono text-[11px] text-(--ink2)"
            >
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-(--signal)" />{{ t('vis.legend.matched') }}</span>
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-warning" />{{ t('vis.legend.unmatched') }}</span>
              <span class="flex items-center gap-1"><span class="inline-block size-3 bg-(--glow)" />{{ t('vis.legend.multi') }}</span>
            </p>
          </div>
          <VisTable
            :rows="current.before && showBefore ? current.before : current.rows"
            :marks="current.marks"
            :new-cols="current.newCols"
            :drop-cols="current.dropCols"
          />
        </section>
      </div>

      <div class="grid gap-4 border-[1.5px] border-(--ink) bg-(--ice) p-5 md:grid-cols-3">
        <div
          v-for="k in ['order', 'augment', 'recipes']"
          :key="k"
        >
          <p class="font-bold text-(--ink)">
            {{ t(`vis.dataflow.notes.${k}.title`) }}
          </p>
          <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
            {{ t(`vis.dataflow.notes.${k}.body`) }}
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
          :to="localePath('/visualiser/saql')"
          icon="i-lucide-terminal"
          variant="outline"
          color="neutral"
        >
          {{ t('vis.saql.title') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
