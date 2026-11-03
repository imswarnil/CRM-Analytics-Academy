<script setup lang="ts">
/**
 * /visualiser/security — a security predicate, one row at a time. Pick who is
 * looking and which predicate the dataset has; the page puts their user id
 * into the predicate ($User.Id), then checks every row: who owns it, that
 * owner's managers (the hierarchy a flatten builds), and whether the viewer
 * may see it. The total at the end is what that person's dashboard shows.
 *
 * Prerendered; runs on the sample users and opportunities.
 */
import { type Row, DATASETS, fmt } from '~/utils/vis/data'

definePageMeta({ focus: true })
const { t, locale } = useI18n()

const USERS = DATASETS.users!.rows
const OPPS = DATASETS.opportunities!.rows
const nameOf = (id: unknown) => String(USERS.find(u => u.Id === id)?.Name ?? id)
/** The owner's managers, nearest first: what a flatten writes into the dataset. */
const chainOf = (id: unknown): string[] => {
  const out: string[] = []
  let cur = USERS.find(u => u.Id === id)
  while (cur?.ManagerId && !out.includes(String(cur.ManagerId))) {
    out.push(String(cur.ManagerId))
    cur = USERS.find(u => u.Id === cur!.ManagerId)
  }
  return out
}

type Pred = 'own' | 'team' | 'none'
const PREDS: { id: Pred, code: string }[] = [
  { id: 'own', code: `'OwnerId' == "$User.Id"` },
  { id: 'team', code: `'OwnerId' == "$User.Id" || 'ManagerChain' == "$User.Id"` },
  { id: 'none', code: '' }
]
const viewer = ref('U1')
const pred = ref<Pred>('team')
const step = ref(0)
watch([viewer, pred], () => (step.value = 0))

const code = computed(() => PREDS.find(p => p.id === pred.value)!.code)
const resolved = computed(() => code.value.replaceAll('$User.Id', viewer.value))
const checks = computed(() => OPPS.map((r) => {
  const chain = chainOf(r.OwnerId)
  const own = r.OwnerId === viewer.value
  const team = chain.includes(viewer.value)
  const ok = pred.value === 'none' || own || (pred.value === 'team' && team)
  return { r, chain, own, team, ok }
}))
// Step 0 is the login; steps 1…n check one row each.
const count = computed(() => OPPS.length + 1)
const seen = computed(() => checks.value.slice(0, step.value))
const visible = computed(() => seen.value.filter(c => c.ok))
const total = computed(() => visible.value.reduce((s, c) => s + Number(c.r.Amount ?? 0), 0))
const now = computed(() => (step.value > 0 ? checks.value[step.value - 1] : null))
const why = (c: { r: Row, own: boolean, team: boolean, ok: boolean }) =>
  pred.value === 'none'
    ? t('vis.security.why.none')
    : c.own
      ? t('vis.security.why.own')
      : c.team
        ? (pred.value === 'team' ? t('vis.security.why.team', { owner: nameOf(c.r.OwnerId) }) : t('vis.security.why.teamOff', { owner: nameOf(c.r.OwnerId) }))
        : t('vis.security.why.no', { owner: nameOf(c.r.OwnerId) })
const money = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const title = computed(() => t('vis.security.seoTitle'))
const description = computed(() => t('vis.security.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.security.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'ROW-LEVEL SECURITY · $USER.ID · FLATTEN' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }, { name: t('vis.security.title'), path: '/visualiser/security' }],
  extra: [{ '@type': 'LearningResource', 'name': t('vis.security.title'), 'learningResourceType': 'Interactive simulation', 'interactivityType': 'active', 'teaches': 'CRM Analytics security predicates and row-level security with $User.Id and a flattened role hierarchy', 'isAccessibleForFree': true }]
}))
</script>

<template>
  <VisShell
    v-model:step="step"
    sheet="FIG. V7 / SECURITY"
    :title="t('vis.security.title')"
    :count="count"
    caption=""
    :rail="false"
    :edit-label="t('vis.security.about')"
  >
    <template #stage>
      <div class="sc absolute inset-0 overflow-y-auto p-5 sm:p-7">
        <div class="mx-auto max-w-5xl space-y-5">
          <!-- Who is looking, and the predicate -->
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="sc-label">
                {{ t('vis.security.whoLooks') }}
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                  v-for="u in USERS"
                  :key="String(u.Id)"
                  type="button"
                  class="sc-user"
                  :class="viewer === u.Id ? 'on' : ''"
                  @click="viewer = String(u.Id)"
                >
                  <span class="sc-avatar">{{ String(u.Name).slice(0, 1) }}</span>
                  <span class="min-w-0 text-start">
                    <span class="block truncate text-sm font-bold">{{ u.Name }}</span>
                    <span class="block truncate text-xs text-[#64748b]">{{ u.Id }} · {{ u.ManagerId ? t('vis.security.reportsTo', { name: nameOf(u.ManagerId) }) : t('vis.security.topBoss') }}</span>
                  </span>
                </button>
              </div>
            </div>
            <div>
              <p class="sc-label">
                {{ t('vis.security.predicate') }}
              </p>
              <div class="mt-2 space-y-2">
                <button
                  v-for="p in PREDS"
                  :key="p.id"
                  type="button"
                  class="sc-pred"
                  :class="pred === p.id ? 'on' : ''"
                  @click="pred = p.id"
                >
                  <span class="block text-sm font-bold">{{ t(`vis.security.preds.${p.id}`) }}</span>
                  <code class="block truncate text-xs">{{ p.code || t('vis.security.noPredicate') }}</code>
                </button>
              </div>
            </div>
          </div>

          <!-- Login: the predicate with the viewer's id in it -->
          <div
            class="sc-card p-4"
            :class="step === 0 ? 'sc-card--now' : ''"
          >
            <p class="sc-label">
              {{ t('vis.security.atQuery') }}
            </p>
            <p class="mt-1.5 font-mono text-sm text-[#0f172a]">
              {{ code || t('vis.security.noPredicate') }}
            </p>
            <p
              v-if="code"
              class="mt-1 font-mono text-sm text-[#047857]"
            >
              → {{ resolved }}
            </p>
            <p class="mt-2 text-sm text-[#475569]">
              {{ step === 0 ? t('vis.security.step0', { name: nameOf(viewer) }) : now ? `${now.r.Name}: ${why(now)}` : '' }}
            </p>
          </div>

          <!-- Every row, checked -->
          <div class="sc-card overflow-hidden">
            <div class="sc-head grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_2rem] gap-3 px-4 py-2">
              <span>{{ t('vis.security.row') }}</span><span>OwnerId</span><span>ManagerChain</span><span>Amount</span><span />
            </div>
            <div
              v-for="(c, i) in checks"
              :key="String(c.r.Id)"
              class="sc-row grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_2rem] items-center gap-3 px-4 py-2"
              :class="[i + 1 === step ? 'now' : '', i < step ? (c.ok ? 'ok' : 'no') : 'wait']"
              @click="step = i + 1"
            >
              <span class="truncate text-sm font-semibold">{{ c.r.Name }}</span>
              <span
                class="truncate font-mono text-xs"
                :class="c.own && i < step ? 'font-bold text-[#047857]' : ''"
              >{{ c.r.OwnerId }} · {{ nameOf(c.r.OwnerId) }}</span>
              <span class="flex flex-wrap gap-1">
                <span
                  v-for="m in c.chain"
                  :key="m"
                  class="rounded px-1.5 font-mono text-[11px]"
                  :class="m === viewer && pred === 'team' && i < step ? 'bg-[#d1fae5] font-bold text-[#047857]' : 'bg-[#f1f5f9] text-[#475569]'"
                >{{ m }}</span>
                <span
                  v-if="!c.chain.length"
                  class="text-xs text-[#94a3b8]"
                >—</span>
              </span>
              <span class="font-mono text-xs">{{ fmt(c.r.Amount ?? null) }}</span>
              <span class="text-center">
                <UIcon
                  v-if="i < step"
                  :name="c.ok ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                  class="size-4"
                  :class="c.ok ? 'text-[#059669]' : 'text-[#e11d48]'"
                />
              </span>
            </div>
          </div>

          <!-- What they see -->
          <div class="sc-card flex flex-wrap items-center gap-6 p-4">
            <div>
              <p class="sc-label">
                {{ t('vis.security.sees', { name: nameOf(viewer) }) }}
              </p>
              <p class="mt-1 text-2xl font-black tabular-nums text-[#0f172a]">
                {{ visible.length }} / {{ seen.length }} {{ t('vis.security.rows') }}
              </p>
            </div>
            <div>
              <p class="sc-label">
                {{ t('vis.security.pipeline') }}
              </p>
              <p class="mt-1 text-2xl font-black tabular-nums text-[#2563eb]">
                {{ money(total) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #edit>
      <div class="space-y-4 text-sm">
        <div
          v-for="k in ['what', 'user', 'flatten', 'sharing']"
          :key="k"
        >
          <p class="font-bold text-(--ink)">
            {{ t(`vis.security.notes.${k}.title`) }}
          </p>
          <p class="mt-1 leading-relaxed text-(--ink2)">
            {{ t(`vis.security.notes.${k}.body`) }}
          </p>
        </div>
      </div>
    </template>
  </VisShell>
</template>

<style scoped>
.sc { background: #f6f7fb; background-image: radial-gradient(rgb(15 23 42 / 0.09) 1px, transparent 1.2px); background-size: 22px 22px; color: #334155; }
.sc-label { font: 600 11px ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
.sc-card { border-radius: 14px; background: #fff; border: 1px solid #e3e8f0; transition: border-color 0.3s, box-shadow 0.3s; }
.sc-card--now { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
.sc-user, .sc-pred { display: flex; gap: 10px; align-items: center; width: 100%; border-radius: 12px; border: 1.5px solid #e3e8f0; background: #fff; padding: 8px 10px; text-align: start; transition: border-color 0.2s, box-shadow 0.2s; }
.sc-pred { display: block; }
.sc-user.on, .sc-pred.on { border-color: #2563eb; box-shadow: 0 0 0 3px rgb(37 99 235 / 0.15); }
.sc-pred code { color: #475569; font-family: ui-monospace, monospace; }
.sc-avatar { display: flex; width: 32px; height: 32px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-weight: 800; }
.sc-head { font: 600 11px ui-monospace, monospace; color: #64748b; background: #f3f5f9; border-bottom: 1px solid #e3e8f0; }
.sc-row { border-bottom: 1px solid #eef1f6; cursor: pointer; transition: background 0.3s, opacity 0.3s; color: #0f172a; }
.sc-row:last-child { border-bottom: 0; }
.sc-row.wait { opacity: 0.45; }
.sc-row.ok { background: rgb(16 185 129 / 0.06); }
.sc-row.no { background: rgb(225 29 72 / 0.06); color: #94a3b8; text-decoration: line-through; }
.sc-row.now { outline: 2px solid #2563eb; outline-offset: -2px; }
</style>
