<script setup lang="ts">
/**
 * /visualiser/bindings — how one widget drives another in a CRM Analytics
 * dashboard, one stage at a time:
 *
 *   1 source     a selection on the chart (stage_1.selection), or the chart's
 *                whole result (stage_1.result) for a result binding
 *   2 data       column(…, ["StageName"]) or cell(…, 0, "StageName") pulls
 *                the values out of those rows
 *   3 serialise  .asObject() / .asString() / .asEquality('StageName') turns
 *                them into SAQL text
 *   4 inject     the {{ … }} in the second query is replaced by that text
 *   5 run        the second query runs again; its table changes
 *
 * Click bars (one, or several with multi-select), switch the serialisation,
 * and watch each stage resolve. Prerendered; runs on the sample data.
 */
import { DATASETS, aggregate, fmt } from '~/utils/vis/data'

definePageMeta({ focus: true })
const { t, locale } = useI18n()

const OPPS = DATASETS.opportunities!.rows
const STAGES = [...new Set(OPPS.map(r => String(r.StageName)))]
const bars = STAGES.map(s => ({ stage: s, sum: Number(aggregate(OPPS.filter(r => r.StageName === s), 'sum', 'Amount') ?? 0) })).sort((a, b) => b.sum - a.sum)
const max = Math.max(...bars.map(b => b.sum))

type Kind = 'selection' | 'result'
type Ser = 'asObject' | 'asString' | 'asEquality'
const kind = ref<Kind>('selection')
const ser = ref<Ser>('asEquality')
const multi = ref(false)
const picked = ref<string[]>(['Closed Won'])
function click(stage: string) {
  if (kind.value === 'result') return
  picked.value = multi.value ? (picked.value.includes(stage) ? picked.value.filter(s => s !== stage) : [...picked.value, stage]) : [stage]
  step.value = 0
}
watch([kind, ser, multi], () => {
  if (!multi.value && picked.value.length > 1) picked.value = picked.value.slice(0, 1)
  step.value = 0
})

const step = ref(0)

/* Each stage, resolved. */
const values = computed(() => (kind.value === 'result' ? [bars[0]!.stage] : picked.value))
const sourceRows = computed(() => (kind.value === 'result' ? bars : bars.filter(b => picked.value.includes(b.stage))))
const dataExpr = computed(() => (kind.value === 'result' ? 'cell(stage_1.result, 0, "StageName")' : 'column(stage_1.selection, ["StageName"])'))
const dataValue = computed(() => (kind.value === 'result' ? JSON.stringify(values.value[0]) : JSON.stringify([values.value])))
const binding = computed(() => `{{${dataExpr.value}.${ser.value}(${ser.value === 'asEquality' ? '\'StageName\'' : ''})}}`)
// column() always gives a list (so `in`); cell() gives one value (so `==`).
const list = computed(() => kind.value === 'selection')
const text = computed(() => {
  const v = values.value
  if (ser.value === 'asString') return v.join(', ')
  if (ser.value === 'asObject') return list.value ? JSON.stringify(v) : JSON.stringify(v[0] ?? '')
  return list.value ? `'StageName' in ${JSON.stringify(v)}` : `'StageName' == ${JSON.stringify(v[0] ?? '')}`
})
const op = computed(() => (list.value ? 'in' : '=='))
const filterLine = computed(() => (ser.value === 'asEquality' ? `q = filter q by ${binding.value};` : ser.value === 'asObject' ? `q = filter q by 'StageName' ${op.value} ${binding.value};` : `q = filter q by 'StageName' == "${binding.value}";`))
const resolvedLine = computed(() => (ser.value === 'asEquality' ? `q = filter q by ${text.value};` : ser.value === 'asObject' ? `q = filter q by 'StageName' ${op.value} ${text.value};` : `q = filter q by 'StageName' == "${text.value}";`))
// asString of several values makes one string no row equals: the classic mistake.
const broken = computed(() => ser.value === 'asString' && values.value.length > 1)
const rows = computed(() => (broken.value ? [] : OPPS.filter(r => values.value.includes(String(r.StageName)))))

const MUSTACHE = '{' + '{ }' + '}'
const STAGE_KEYS = ['source', 'data', 'serialise', 'inject', 'run'] as const
const caption = computed(() => t(`vis.bindings.say.${STAGE_KEYS[step.value]}`, { kind: kind.value, values: values.value.join(', ') || '—', ser: ser.value, n: rows.value.length, mustache: '{{…}}' }))
const money = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const title = computed(() => t('vis.bindings.seoTitle'))
const description = computed(() => t('vis.bindings.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.bindings.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'SELECTION · RESULT · COLUMN · CELL · ASOBJECT · ASEQUALITY' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.bindings.title'), path: '/visualiser/bindings' }],
  extra: [{ '@type': 'LearningResource', 'name': t('vis.bindings.title'), 'learningResourceType': 'Interactive simulation', 'interactivityType': 'active', 'teaches': 'CRM Analytics dashboard bindings: selection and result bindings, column() and cell(), asObject, asString, asEquality, and how a binding rewrites a SAQL query', 'isAccessibleForFree': true }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V6 / BINDINGS"
    :title="t('vis.bindings.title')"
    :count="5"
    :caption="caption"
    :eyebrow="`${step + 1}. ${t(`vis.bindings.stage.${STAGE_KEYS[step]}`)}`"
    :error="broken && step >= 3"
    :rail="false"
    :edit-label="t('vis.bindings.about')"
  >
    <template #stage>
      <div class="bd absolute inset-0 overflow-y-auto p-5 sm:p-7">
        <div class="mx-auto max-w-6xl space-y-5">
          <!-- Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="bd-seg">
              <button
                v-for="k in (['selection', 'result'] as const)"
                :key="k"
                type="button"
                :class="kind === k ? 'on' : ''"
                @click="kind = k"
              >
                {{ t(`vis.bindings.kind.${k}`) }}
              </button>
            </div>
            <div class="bd-seg">
              <button
                v-for="s in (['asObject', 'asString', 'asEquality'] as const)"
                :key="s"
                type="button"
                class="font-mono"
                :class="ser === s ? 'on' : ''"
                @click="ser = s"
              >
                .{{ s }}()
              </button>
            </div>
            <label
              v-if="kind === 'selection'"
              class="bd-seg flex cursor-pointer items-center gap-2 px-3 text-sm"
            >
              <input
                v-model="multi"
                type="checkbox"
              >{{ t('vis.bindings.multi') }}
            </label>
          </div>

          <p class="bd-now">
            <span class="font-mono text-xs font-bold text-[#2563eb]">{{ step + 1 }}/5</span>
            {{ caption }}
          </p>

          <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <!-- Widget 1: the chart -->
            <div
              class="bd-card"
              :class="step === 0 ? 'bd-card--now' : ''"
            >
              <p class="bd-title">
                stage_1 · {{ t('vis.bindings.chart') }}
              </p>
              <div class="space-y-2 p-4">
                <button
                  v-for="b in bars"
                  :key="b.stage"
                  type="button"
                  class="group flex w-full items-center gap-3 text-start"
                  :disabled="kind === 'result'"
                  @click="click(b.stage)"
                >
                  <span class="w-28 shrink-0 truncate text-[13px] text-[#334155]">{{ b.stage }}</span>
                  <span class="relative h-7 flex-1 overflow-hidden rounded-md bg-[#eef1f6]">
                    <span
                      class="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                      :style="{ width: `${(b.sum / max) * 100}%`, background: values.includes(b.stage) ? '#60a5fa' : '#cbd5e1' }"
                    />
                    <span class="relative z-10 flex h-full items-center px-2 font-mono text-[11px] text-white">{{ money(b.sum) }}</span>
                  </span>
                </button>
                <p class="pt-1 text-xs text-[#64748b]">
                  {{ kind === 'result' ? t('vis.bindings.resultHint') : t('vis.bindings.clickHint') }}
                </p>
              </div>
            </div>

            <!-- The binding, resolving -->
            <div class="bd-card">
              <p class="bd-title">
                {{ t('vis.bindings.chain') }}
              </p>
              <ol class="divide-y divide-[#eef1f6]">
                <li
                  class="bd-stage"
                  :class="step === 0 ? 'now' : step > 0 ? 'done' : ''"
                >
                  <span class="bd-n">1</span>
                  <div class="min-w-0 flex-1">
                    <p class="bd-label">
                      {{ t('vis.bindings.stage.source') }}
                    </p>
                    <code>stage_1.{{ kind }}</code>
                    <p class="bd-val">
                      {{ JSON.stringify(sourceRows.map(r => ({ StageName: r.stage, sum_Amount: r.sum }))) }}
                    </p>
                  </div>
                </li>
                <li
                  class="bd-stage"
                  :class="step === 1 ? 'now' : step > 1 ? 'done' : 'wait'"
                >
                  <span class="bd-n">2</span>
                  <div class="min-w-0 flex-1">
                    <p class="bd-label">
                      {{ t('vis.bindings.stage.data') }}
                    </p>
                    <code>{{ dataExpr }}</code>
                    <p
                      v-if="step >= 1"
                      class="bd-val"
                    >
                      → {{ dataValue }}
                    </p>
                  </div>
                </li>
                <li
                  class="bd-stage"
                  :class="step === 2 ? 'now' : step > 2 ? 'done' : 'wait'"
                >
                  <span class="bd-n">3</span>
                  <div class="min-w-0 flex-1">
                    <p class="bd-label">
                      {{ t('vis.bindings.stage.serialise') }}
                    </p>
                    <code>.{{ ser }}({{ ser === 'asEquality' ? "'StageName'" : '' }})</code>
                    <p
                      v-if="step >= 2"
                      class="bd-val"
                    >
                      → {{ text || '""' }}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <!-- Widget 2: the query it rewrites, and its table -->
          <div class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div
              class="bd-card"
              :class="step === 3 ? 'bd-card--now' : ''"
            >
              <p class="bd-title">
                4 · {{ t('vis.bindings.stage.inject') }} · q_deals
              </p>
              <pre class="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#334155]"><code>q = load "opportunities";
<span :class="step >= 3 ? 'bd-inject' : 'bd-raw'">{{ step >= 3 ? resolvedLine : filterLine }}</span>
q = foreach q generate 'Name', 'StageName', 'Amount';</code></pre>
              <p
                v-if="broken && step >= 3"
                class="px-4 pb-4 text-sm text-[#be123c]"
              >
                {{ t('vis.bindings.brokenNote') }}
              </p>
            </div>
            <div
              class="bd-card"
              :class="step === 4 ? 'bd-card--now' : ''"
            >
              <p class="bd-title flex justify-between">
                <span>5 · q_deals · {{ t('vis.bindings.table') }}</span><span>{{ step >= 4 ? rows.length : '…' }}</span>
              </p>
              <TransitionGroup
                v-if="step >= 4"
                tag="div"
                name="bd-row"
              >
                <div
                  v-for="(r, i) in rows.slice(0, 6)"
                  :key="String(r.Id)"
                  class="flex items-center justify-between gap-3 border-b border-[#eef1f6] px-4 py-2 text-[13px]"
                  :style="{ transitionDelay: `${i * 70}ms` }"
                >
                  <span class="truncate text-[#0f172a]">{{ r.Name }}</span>
                  <span class="shrink-0 font-mono text-[#64748b]">{{ r.StageName }} · {{ fmt(r.Amount ?? null) }}</span>
                </div>
              </TransitionGroup>
              <p
                v-if="step >= 4 && !rows.length"
                class="px-4 py-3 text-sm text-[#be123c]"
              >
                {{ t('vis.noRows') }}
              </p>
              <p
                v-if="step < 4"
                class="px-4 py-6 text-center font-mono text-xs uppercase tracking-[.12em] text-[#94a3b8]"
              >
                {{ t('vis.flow.waiting') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #edit>
      <div class="space-y-4 text-sm">
        <div
          v-for="k in ['what', 'selection', 'result', 'asObject', 'asString', 'asEquality', 'faceting']"
          :key="k"
        >
          <p class="font-bold text-(--ink)">
            {{ t(`vis.bindings.notes.${k}.title`) }}
          </p>
          <p class="mt-1 leading-relaxed text-(--ink2)">
            {{ t(`vis.bindings.notes.${k}.body`, { mustache: MUSTACHE }) }}
          </p>
        </div>
      </div>
    </template>
  </VisShell>
</template>

<style scoped>
.bd { background: #f6f7fb; background-image: radial-gradient(rgb(15 23 42 / 0.09) 1px, transparent 1.2px); background-size: 22px 22px; color: #334155; }
.bd-now { display: flex; gap: 10px; align-items: baseline; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 14px; font-size: 15px; color: #1f2937; }
.bd-card { border-radius: 16px; background: #ffffff; border: 1px solid #e3e8f0; overflow: hidden; transition: border-color 0.4s, box-shadow 0.4s; }
.bd-card--now { border-color: #60a5fa; box-shadow: 0 0 0 4px rgb(96 165 250 / 0.15), 0 18px 50px -14px rgb(96 165 250 / 0.5); }
.bd-title { padding: 10px 16px; font: 600 11px ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; background: #f3f5f9; border-bottom: 1px solid #e3e8f0; }
.bd-seg { display: inline-flex; border-radius: 10px; border: 1px solid #dfe4ee; background: #ffffff; overflow: hidden; color: #334155; min-height: 34px; }
.bd-seg button { padding: 6px 12px; font-size: 13px; }
.bd-seg button.on { background: #60a5fa; color: #f6f7fb; font-weight: 700; }
.bd-stage { display: flex; gap: 12px; padding: 12px 16px; transition: background 0.4s, opacity 0.4s; }
.bd-stage.now { background: rgb(96 165 250 / 0.12); }
.bd-stage.wait { opacity: 0.4; }
.bd-stage code { display: block; margin-top: 2px; font: 13px ui-monospace, monospace; color: #0b1220; word-break: break-all; }
.bd-n { display: flex; width: 24px; height: 24px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 999px; background: #dfe4ee; color: #0f172a; font: 700 12px ui-monospace, monospace; }
.bd-stage.now .bd-n, .bd-stage.done .bd-n { background: #60a5fa; color: #f6f7fb; }
.bd-label { font: 600 10px ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
.bd-val { margin-top: 4px; font: 12.5px ui-monospace, monospace; color: #047857; word-break: break-all; animation: val 0.5s ease-out both; }
@keyframes val { from { opacity: 0; transform: translateY(-4px); } }
.bd-raw { color: #fbbf24; }
.bd-inject { color: #047857; background: rgb(52 211 153 / 0.12); animation: inject 0.8s ease-out both; }
@keyframes inject { from { background: #34d399; color: #052e1f; } }
.bd-row-enter-active { transition: opacity 0.35s, transform 0.35s cubic-bezier(0.3, 1.4, 0.5, 1); }
.bd-row-enter-from { opacity: 0; transform: translateX(-14px); }
@media (prefers-reduced-motion: reduce) { .bd-val, .bd-inject, .bd-row-enter-active { animation: none; transition: none; } }
</style>
