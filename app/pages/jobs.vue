<script setup lang="ts">
/**
 * /jobs — CRM Analytics jobs posted this week, newest first. Grouped by the
 * day they were posted; "This week" shows everything (Sunday's digest).
 * Filters: remote only, level, and a text search. Every card links out to the
 * employer's own posting (careers site, its ATS, or LinkedIn) and says when
 * that link was last checked; closed ones stay a week as "No longer active".
 * "How these jobs get here" shows the daily run from the feed's `meta`.
 * Data: public/jobs.json (useJobs) — refreshed daily, no Worker work.
 */
import type { Job } from '~/composables/useJobs'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data: feed, status } = useJobs()

const view = ref<'today' | 'week'>('week')
const remoteOnly = ref(false)
const level = ref<'all' | 'junior' | 'mid' | 'senior' | 'lead'>('all')
const q = ref('')

const today = new Date().toISOString().slice(0, 10)
const filtered = computed(() => (feed.value?.jobs ?? [])
  .filter(j => view.value === 'week' || j.posted === today)
  .filter(j => !remoteOnly.value || j.remote)
  .filter(j => level.value === 'all' || j.level === level.value)
  .filter(j => !q.value || `${j.title} ${j.company} ${j.location} ${j.source ?? ''} ${(j.skills ?? []).join(' ')}`.toLowerCase().includes(q.value.toLowerCase()))
  // Newest day first; inside a day, open jobs before closed ones.
  .sort((a, b) => b.posted.localeCompare(a.posted) || Number(jobExpired(a)) - Number(jobExpired(b))))
const byDay = computed(() => {
  const groups = new Map<string, typeof filtered.value>()
  for (const j of filtered.value) groups.set(j.posted, [...(groups.get(j.posted) ?? []), j])
  return [...groups.entries()]
})
const dayLabel = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' })
const updated = computed(() => feed.value?.updated ? new Date(feed.value.updated).toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' }) : null)
const meta = computed(() => feed.value?.meta)

// "3 hours ago", in the reader's language. Read once on mount, so the server
// render and the first client render agree (the page fetches client-side anyway).
const nowMs = ref(0)
onMounted(() => {
  nowMs.value = Date.now()
})
function ago(iso?: string) {
  if (!iso || !nowMs.value) return ''
  const s = (new Date(iso).getTime() - nowMs.value) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  if (Math.abs(s) < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (Math.abs(s) < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86400), 'day')
}
const unverified = (j: Job) => jobUnverified(j, meta.value?.rules.unverifiedRuns)
const sourceName = (s: string) => s === 'Company site' ? t('jobs.sourceCompany') : s
const sourceIcon = (s?: string) => s === 'LinkedIn' ? 'i-simple-icons-linkedin' : s === 'Company site' ? 'i-lucide-building-2' : 'i-lucide-briefcase-business'

// The daily run, step by step, with this run's numbers.
const steps = computed(() => {
  const m = meta.value
  const found = (m?.found ?? []).reduce((n, f) => n + f.n, 0)
  return [
    { icon: 'i-lucide-radar', key: 'find', stat: m ? t('jobs.how.stat.found', { n: found }) : '' },
    { icon: 'i-lucide-filter', key: 'match', stat: '' },
    { icon: 'i-lucide-shield-check', key: 'owner', stat: m ? t('jobs.how.stat.dropped', { n: m.dropped.notOwner }) : '' },
    { icon: 'i-lucide-refresh-cw', key: 'check', stat: m ? t('jobs.how.stat.live', { n: m.counts.live }) : '' },
    { icon: 'i-lucide-archive-x', key: 'expire', stat: m ? t('jobs.how.stat.expired', { n: m.counts.expired }) : '' }
  ]
})

const title = computed(() => t('jobs.seoTitle'))
const description = computed(() => t('jobs.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
        <p class="eyebrow">
          {{ t('jobs.eyebrow') }}
        </p>
        <h1 class="bp-h1 mt-3 max-w-3xl">
          {{ t('jobs.title') }}
        </h1>
        <p class="bp-lead mt-4 max-w-2xl">
          {{ t('jobs.lead') }}
        </p>
        <p
          v-if="updated"
          class="mt-4 text-sm text-(--ink2)"
        >
          {{ t('jobs.updated', { date: updated }) }} · {{ feed?.week }}
        </p>
        <div
          v-if="meta"
          class="mt-4 flex flex-wrap items-center gap-2 text-sm"
        >
          <span class="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--card) px-3 py-1 font-semibold text-(--ink)">
            <span class="size-2 rounded-full bg-(--ui-success)" />
            {{ t('jobs.status.liveCount', { n: meta.counts.live }) }}
          </span>
          <span
            v-if="meta.counts.expired"
            class="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--card) px-3 py-1 text-(--ink2)"
          >
            <span class="size-2 rounded-full bg-(--ink2)" />
            {{ t('jobs.status.expiredCount', { n: meta.counts.expired }) }}
          </span>
          <a
            href="#how"
            class="inline-flex items-center gap-1 px-1 py-1 font-semibold text-(--signal) hover:underline"
          >
            {{ t('jobs.how.link') }}
            <UIcon
              name="i-lucide-arrow-down"
              class="size-4"
            />
          </a>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
      <!-- Filters -->
      <aside class="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div class="inline-flex w-full rounded-[4px] bg-(--paper2) p-1">
          <button
            v-for="v in (['week', 'today'] as const)"
            :key="v"
            type="button"
            class="flex-1 rounded-[4px] px-3 py-1.5 text-sm font-semibold transition-colors"
            :class="view === v ? 'bg-(--card) text-(--ink)' : 'text-(--ink2) hover:text-(--ink)'"
            @click="view = v"
          >
            {{ t(`jobs.view.${v}`) }}
          </button>
        </div>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          :placeholder="t('jobs.search')"
          class="w-full"
        />
        <UCheckbox
          v-model="remoteOnly"
          :label="t('jobs.remote')"
        />
        <div>
          <p class="mono-label mb-2">
            {{ t('jobs.level') }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="l in (['all', 'junior', 'mid', 'senior', 'lead'] as const)"
              :key="l"
              type="button"
              class="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
              :class="level === l ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
              @click="level = l"
            >
              {{ t(`jobs.levels.${l}`) }}
            </button>
          </div>
        </div>
        <SponsorInvite compact />
      </aside>

      <!-- Listings -->
      <div class="min-w-0">
        <div
          v-if="status === 'pending'"
          class="flex h-40 items-center justify-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-6 animate-spin text-(--ink2)"
          />
        </div>

        <div
          v-else-if="!(feed?.jobs ?? []).length"
          class="rounded-[6px] border border-dashed border-(--line) bg-(--card) p-10 text-center"
        >
          <UIcon
            name="i-lucide-briefcase-business"
            class="size-9 text-(--signal)"
          />
          <h2 class="mt-4 text-xl font-bold text-(--ink)">
            {{ t('jobs.emptyTitle') }}
          </h2>
          <p class="mx-auto mt-2 max-w-md text-(--ink2)">
            {{ t('jobs.emptyBody') }}
          </p>
          <UButton
            :to="localePath('/course')"
            class="mt-6"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('jobs.emptyCta') }}
          </UButton>
        </div>

        <p
          v-else-if="!filtered.length"
          class="rounded-[6px] border border-(--line) bg-(--card) p-8 text-center text-(--ink2)"
        >
          {{ t('jobs.noMatch') }}
        </p>

        <div
          v-else
          class="space-y-8"
        >
          <section
            v-for="[day, jobs] in byDay"
            :key="day"
          >
            <h2 class="mono-label mb-3">
              {{ dayLabel(day) }} · {{ t('jobs.count', { n: jobs.length }) }}
            </h2>
            <ul class="space-y-3">
              <li
                v-for="j in jobs"
                :key="j.id"
              >
                <component
                  :is="jobExpired(j) ? 'div' : 'a'"
                  v-bind="jobExpired(j) ? { 'aria-disabled': 'true' } : { href: j.url, target: '_blank', rel: 'noopener nofollow' }"
                  class="bp-card flex flex-wrap items-center gap-4 p-5"
                  :class="jobExpired(j) ? 'opacity-60' : 'bp-card--hover'"
                >
                  <span class="hidden sm:block">
                    <span class="bp-iconbox">
                      <UIcon
                        :name="sourceIcon(j.source)"
                        class="size-5"
                      />
                    </span>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p
                      class="text-lg font-bold text-(--ink)"
                      :class="{ 'line-through decoration-(--ink2)': jobExpired(j) }"
                    >
                      {{ j.title }}
                    </p>
                    <p class="text-(--ink2)">
                      {{ j.company }} · {{ j.location }}<template v-if="j.remote">
                        · {{ t('jobs.remoteTag') }}
                      </template>
                    </p>
                    <div
                      v-if="j.skills?.length"
                      class="mt-2 flex flex-wrap gap-1.5"
                    >
                      <span
                        v-for="s in j.skills"
                        :key="s"
                        class="rounded-full bg-(--paper) px-2 py-0.5 text-xs font-medium text-(--ink2)"
                      >{{ s }}</span>
                    </div>
                    <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--ink2)">
                      <span
                        v-if="j.source"
                        class="inline-flex items-center gap-1 rounded-[4px] border border-(--line) px-1.5 py-0.5 font-semibold"
                        :title="t('jobs.sourceTitle', { source: sourceName(j.source) })"
                      >
                        <UIcon
                          :name="sourceIcon(j.source)"
                          class="size-3"
                        />
                        {{ sourceName(j.source) }}
                      </span>
                      <span
                        v-if="jobExpired(j)"
                        class="inline-flex items-center gap-1 font-semibold text-(--ink)"
                      >
                        <UIcon
                          name="i-lucide-circle-off"
                          class="size-3.5"
                        />
                        {{ t('jobs.status.expired') }}<template v-if="j.expiredAt && nowMs"> · {{ t('jobs.status.expiredAgo', { ago: ago(j.expiredAt) }) }}</template>
                      </span>
                      <span
                        v-else-if="unverified(j)"
                        class="inline-flex items-center gap-1 font-semibold text-(--ui-warning)"
                        :title="t('jobs.status.unverifiedTitle')"
                      >
                        <UIcon
                          name="i-lucide-circle-help"
                          class="size-3.5"
                        />
                        {{ t('jobs.status.unverified') }}
                      </span>
                      <span
                        v-else-if="j.checkedAt && nowMs"
                        class="inline-flex items-center gap-1.5"
                      >
                        <span
                          class="size-1.5 rounded-full"
                          :class="j.status === 'live' ? 'bg-(--ui-success)' : 'bg-(--ink2)'"
                        />
                        {{ j.status === 'live' ? t('jobs.status.checked', { ago: ago(j.checkedAt) }) : j.verifiedAt ? t('jobs.status.confirmed', { ago: ago(j.verifiedAt) }) : t('jobs.status.notReached') }}
                      </span>
                    </p>
                  </div>
                  <span
                    v-if="jobExpired(j)"
                    class="flex w-full shrink-0 items-center justify-center sm:w-auto gap-1 rounded-[4px] bg-(--paper2) px-2.5 py-1 text-sm font-semibold text-(--ink2)"
                  >
                    {{ t('jobs.expiredCta') }}
                  </span>
                  <span
                    v-else
                    class="flex shrink-0 items-center max-sm:basis-full gap-1 text-sm font-semibold text-(--signal)"
                  >
                    {{ t('jobs.apply') }}
                    <UIcon
                      name="i-lucide-arrow-up-right"
                      class="size-4"
                    />
                  </span>
                </component>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>

    <!-- How these jobs get here: the daily run, with this run's numbers -->
    <section
      id="how"
      class="scroll-mt-20 border-t border-(--line) bg-(--card)"
    >
      <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
        <p class="eyebrow">
          {{ t('jobs.how.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-2">
          {{ t('jobs.how.title') }}
        </h2>
        <p class="mt-2 max-w-2xl text-(--ink2)">
          {{ t('jobs.how.lead') }}
        </p>
        <ol class="mt-8 grid gap-3 md:grid-cols-5">
          <li
            v-for="(s, i) in steps"
            :key="s.key"
            class="relative flex gap-4 rounded-[6px] border border-(--line) bg-(--paper) p-4 md:flex-col md:gap-3"
          >
            <span class="bp-iconbox shrink-0">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <div class="min-w-0">
              <p class="mono-label">
                {{ t('jobs.how.step', { n: i + 1 }) }}
              </p>
              <p class="mt-1 font-bold text-(--ink)">
                {{ t(`jobs.how.steps.${s.key}.title`) }}
              </p>
              <p class="mt-1 text-sm text-(--ink2)">
                {{ t(`jobs.how.steps.${s.key}.body`, { days: meta?.rules.expiredDays ?? 7 }) }}
              </p>
              <p
                v-if="s.stat"
                class="mt-2 text-sm font-semibold text-(--signal)"
              >
                {{ s.stat }}
              </p>
            </div>
            <span
              v-if="i < steps.length - 1"
              class="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-(--line) bg-(--card) text-(--ink2) md:flex"
            >
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4"
              />
            </span>
          </li>
        </ol>
        <div
          v-if="meta"
          class="mt-6 flex flex-col gap-3 text-sm text-(--ink2) sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6"
        >
          <p v-if="nowMs">
            {{ t('jobs.how.lastRun', { ago: ago(meta.checkedAt) }) }}
          </p>
          <div
            v-if="meta.sources.length"
            class="flex flex-wrap items-center gap-1.5"
          >
            <span class="mono-label mr-1">{{ t('jobs.how.linksGoTo') }}</span>
            <span
              v-for="src in meta.sources"
              :key="src.name"
              class="inline-flex items-center gap-1 rounded-[4px] border border-(--line) bg-(--paper) px-2 py-0.5 text-xs font-medium"
            >
              <UIcon
                :name="sourceIcon(src.name)"
                class="size-3"
              />
              {{ sourceName(src.name) }} · {{ src.n }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
