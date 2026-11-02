<script setup lang="ts">
/**
 * /visualiser/functions — the function lab. Pick any formula function a Data
 * Prep transform offers (dates, text, numbers, logic, windows), point it at a
 * column, and watch it run one row at a time: the value it reads, the formula
 * as you would write it, the value it writes. Try your own value too (what
 * does to_date do with 2026-03-15?). Window functions show their partition
 * (rows striped by key) and their frame (the rows the current one can see).
 *
 * Prerendered; runs on the sample opportunities (app/utils/vis).
 */
import { type Row, DATASETS, columnsOf, fmt } from '~/utils/vis/data'
import { type FnId, type TransformFn, FN_IDS, FUNCTIONS } from '~/utils/vis/recipe'

definePageMeta({ focus: true })
const { t } = useI18n()
const route = useRoute()

const ROWS: Row[] = DATASETS.opportunities!.rows.slice(0, 7).map((r, i) => ({ __id: `o${i}`, ...r }))
const COLS = columnsOf(ROWS)
const CATS = ['date', 'text', 'number', 'logic', 'window'] as const
const DEFAULT_FIELD: Record<string, string> = { date: 'CloseDate', text: 'Name', number: 'Amount', logic: 'Amount', window: 'Amount' }
const ARG: Partial<Record<FnId, string>> = { add_months: '12', date_diff_days: '2026-01-01', concat: 'StageName', substr: '3', round: '-3', multiply: '1.18', coalesce: '0' }

const fnId = ref<FnId>(FN_IDS.includes(route.query.fn as FnId) ? route.query.fn as FnId : 'to_date')
const f = reactive<TransformFn>({ fn: fnId.value, field: '', as: 'result' })
function pick(id: FnId) {
  fnId.value = id
  const def = FUNCTIONS[id]
  Object.assign(f, {
    fn: id,
    field: id === 'case_won' ? 'StageName' : DEFAULT_FIELD[def.cat]!,
    as: 'result',
    arg: ARG[id],
    partition: def.cat === 'window' ? 'AccountId' : undefined,
    order: def.cat === 'window' ? 'CloseDate' : undefined
  })
  step.value = 0
}
const step = ref(0)
pick(fnId.value)

const def = computed(() => FUNCTIONS[f.fn])
const isWindow = computed(() => def.value.cat === 'window')
const outputs = computed(() => ROWS.map((r, i) => def.value.apply(r[f.field] ?? null, f, { rows: ROWS, i })))
const current = computed(() => ROWS[step.value]!)

/* The window: same-partition rows (striped), and the frame the current row sees. */
const PART = ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb923c']
const partOf = computed(() => {
  const m = new Map<string, string>()
  if (f.partition) for (const r of ROWS) if (!m.has(String(r[f.partition]))) m.set(String(r[f.partition]), PART[m.size % PART.length]!)
  return m
})
const inFrame = (r: Row) => {
  if (!isWindow.value) return false
  const c = current.value
  if (f.partition && r[f.partition] !== c[f.partition]) return false
  if (f.fn === 'running_total' || f.fn === 'lag') {
    const o = f.order ?? 'CloseDate'
    return String(r[o] ?? '') <= String(c[o] ?? '')
  }
  return true
}

/* Your own value. */
const custom = ref('')
watch(fnId, () => (custom.value = def.value.cat === 'date' ? '2026-03-15' : def.value.cat === 'text' ? 'Acme seats' : '42000'), { immediate: true })
const customOut = computed(() => {
  if (isWindow.value || custom.value === '') return null
  const v = custom.value !== '' && !Number.isNaN(Number(custom.value)) && def.value.cat !== 'date' && def.value.cat !== 'text' ? Number(custom.value) : custom.value
  const row: Row = { ...ROWS[0]!, [f.field]: v }
  try {
    return fmt(def.value.apply(v, f, { rows: [row], i: 0 }))
  } catch {
    return '—'
  }
})

const caption = computed(() => t('vis.functions.row', {
  name: String(current.value.Name),
  field: f.field,
  input: fmt(current.value[f.field] ?? null),
  output: fmt(outputs.value[step.value] ?? null)
}))

const title = computed(() => t('vis.functions.seoTitle'))
const description = computed(() => t('vis.functions.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.functions.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'TO_DATE · YEAR · CONCAT · RANK · OVER (PARTITION BY)' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.functions.title'), path: '/visualiser/functions' }],
  extra: [{ '@type': 'LearningResource', 'name': t('vis.functions.title'), 'learningResourceType': 'Interactive simulation', 'interactivityType': 'active', 'teaches': 'CRM Analytics Data Prep formula functions: date, text, number, logic and window functions', 'isAccessibleForFree': true }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V4 / FUNCTIONS"
    :title="t('vis.functions.title')"
    :count="ROWS.length"
    :caption="caption"
    :eyebrow="`${t(`vis.recipe.cats.${def.cat}`)} · ${f.fn}`"
    :edit-label="t('vis.functions.all')"
  >
    <!-- Rail: every function, by kind -->
    <template #rail>
      <div
        v-for="cat in CATS"
        :key="cat"
        class="border-b-[1.5px] border-(--ink) px-4 py-3"
      >
        <p class="mono-label mb-2">
          {{ t(`vis.recipe.cats.${cat}`) }}
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="id in FN_IDS.filter(x => FUNCTIONS[x].cat === cat)"
            :key="id"
            type="button"
            class="border-[1.5px] px-2 py-0.5 font-mono text-xs"
            :class="f.fn === id ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
            @click="pick(id)"
          >
            {{ id }}
          </button>
        </div>
      </div>
    </template>

    <!-- Stage: the formula, your value, and every row through it -->
    <template #stage>
      <div class="lab absolute inset-0 overflow-y-auto p-5 sm:p-7">
        <div class="mx-auto max-w-5xl space-y-6">
          <!-- The formula, as written in a transform -->
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[.16em] text-[#8b97b8]">
              {{ t('vis.functions.formula') }}
            </p>
            <p class="lab-formula mt-2 break-words font-mono text-lg sm:text-2xl">
              <span class="text-[#6ee7b7]">result</span> = {{ def.formula(f) }}
            </p>
            <p class="mt-3 max-w-3xl text-[15px] leading-relaxed text-[#cbd5e1]">
              {{ t(`vis.fn.${f.fn}`) }}
            </p>
          </div>

          <!-- Settings -->
          <div class="flex flex-wrap items-end gap-3">
            <label class="lab-field">
              <span>{{ t('vis.functions.column') }}</span>
              <select v-model="f.field">
                <option
                  v-for="c in COLS"
                  :key="c"
                  :value="c"
                >{{ c }}</option>
              </select>
            </label>
            <label
              v-if="f.arg !== undefined"
              class="lab-field"
            >
              <span>{{ t('vis.functions.argument') }}</span>
              <input
                v-model="f.arg"
                type="text"
              >
            </label>
            <template v-if="isWindow">
              <label class="lab-field">
                <span>partition by</span>
                <select v-model="f.partition">
                  <option :value="undefined">—</option>
                  <option
                    v-for="c in ['AccountId', 'OwnerId', 'StageName']"
                    :key="c"
                    :value="c"
                  >{{ c }}</option>
                </select>
              </label>
              <label
                v-if="f.fn === 'running_total' || f.fn === 'lag'"
                class="lab-field"
              >
                <span>order by</span>
                <select v-model="f.order">
                  <option
                    v-for="c in ['CloseDate', 'Amount']"
                    :key="c"
                    :value="c"
                  >{{ c }}</option>
                </select>
              </label>
            </template>
            <!-- Try your own -->
            <div
              v-if="!isWindow"
              class="lab-try ms-auto flex items-end gap-2"
            >
              <label class="lab-field">
                <span>{{ t('vis.functions.tryValue') }}</span>
                <input
                  v-model="custom"
                  type="text"
                >
              </label>
              <UIcon
                name="i-lucide-arrow-right"
                class="mb-2.5 size-5 text-[#8b97b8]"
              />
              <span class="lab-out mb-1 px-3 py-1.5 font-mono text-sm">{{ customOut ?? '—' }}</span>
            </div>
          </div>

          <!-- Row by row -->
          <div class="lab-table overflow-hidden">
            <div class="lab-head grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_2.5rem_minmax(0,1.2fr)] gap-3 px-4 py-2">
              <span>{{ t('vis.functions.rowHead') }}</span><span>{{ f.field }}</span><span /><span class="text-[#6ee7b7]">result</span>
            </div>
            <div
              v-for="(r, i) in ROWS"
              :key="String(r.__id)"
              class="lab-row grid cursor-pointer grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_2.5rem_minmax(0,1.2fr)] items-center gap-3 px-4 py-2.5"
              :class="[i === step ? 'lab-row--now' : '', inFrame(r) && i !== step ? 'lab-row--frame' : '']"
              :style="f.partition && isWindow ? { boxShadow: `inset 4px 0 0 ${partOf.get(String(r[f.partition]))}` } : undefined"
              @click="step = i"
            >
              <span class="truncate text-sm font-semibold text-[#e6ecff]">{{ r.Name }}<span
                v-if="isWindow && f.partition"
                class="ms-2 font-mono text-[11px] font-normal text-[#8b97b8]"
              >{{ f.partition }}={{ r[f.partition] }}</span></span>
              <span
                class="truncate font-mono text-sm"
                :class="r[f.field] === null ? 'italic text-[#5d6a8a]' : 'text-[#cbd5e1]'"
              >{{ fmt(r[f.field] ?? null) }}</span>
              <span class="text-center text-[#8b97b8]">
                <UIcon
                  :name="i === step ? 'i-lucide-cog' : 'i-lucide-arrow-right'"
                  class="size-4"
                  :class="i === step ? 'animate-spin text-[#a78bfa]' : ''"
                />
              </span>
              <span
                class="truncate font-mono text-sm"
                :class="i <= step ? 'lab-done text-[#6ee7b7]' : 'text-[#3b4766]'"
              >{{ i <= step ? fmt(outputs[i] ?? null) : '…' }}</span>
            </div>
          </div>
          <p
            v-if="isWindow"
            class="text-sm text-[#8b97b8]"
          >
            {{ t('vis.functions.windowNote') }}
          </p>
        </div>
      </div>
    </template>

    <template #edit>
      <ul class="space-y-3">
        <li
          v-for="id in FN_IDS"
          :key="id"
          class="border-b border-dashed border-(--line) pb-3"
        >
          <button
            type="button"
            class="text-start"
            @click="pick(id)"
          >
            <code class="font-mono text-sm font-bold text-(--signal)">{{ id }}</code>
            <span class="mt-1 block text-sm text-(--ink2)">{{ t(`vis.fn.${id}`) }}</span>
          </button>
        </li>
      </ul>
    </template>
  </VisShell>
</template>

<style scoped>
.lab { background: #0b1020; background-image: radial-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1.2px); background-size: 22px 22px; color: #cbd5e1; }
.lab-formula { color: #f1f5ff; text-shadow: 0 0 30px rgb(167 139 250 / 0.35); }
.lab-field { display: flex; flex-direction: column; gap: 4px; font: 600 10px ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #8b97b8; }
.lab-field select, .lab-field input { background: #121a2e; border: 1px solid #26324d; border-radius: 10px; color: #e6ecff; padding: 7px 10px; font: 13px ui-monospace, monospace; letter-spacing: 0; text-transform: none; min-width: 9rem; }
.lab-out { background: rgb(52 211 153 / 0.12); border: 1px solid rgb(52 211 153 / 0.4); color: #6ee7b7; border-radius: 10px; }
.lab-table { border-radius: 16px; background: #0f1628; border: 1px solid #222d47; }
.lab-head { font: 600 11px ui-monospace, monospace; color: #8b97b8; background: #131c33; border-bottom: 1px solid #222d47; }
.lab-row { border-bottom: 1px solid #18213a; transition: background 0.3s; }
.lab-row:last-child { border-bottom: 0; }
.lab-row--now { background: rgb(167 139 250 / 0.16); outline: 1px solid #a78bfa; outline-offset: -1px; }
.lab-row--frame { background: rgb(96 165 250 / 0.08); }
.lab-done { animation: done 0.5s ease-out; }
@keyframes done { from { background: #34d399; color: #052e1f; } }
@media (prefers-reduced-motion: reduce) { .lab-done { animation: none; } }
</style>
