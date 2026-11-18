<script setup lang="ts">
/**
 * /jobs — CRM Analytics jobs posted this week, newest first. Grouped by the
 * day they were posted; "This week" shows everything (Sunday's digest).
 * Filters: remote only, level, and a text search. Every card links out to the
 * original posting. Data: public/jobs.json (useJobs) — refreshed daily.
 */
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
  .filter(j => !q.value || `${j.title} ${j.company} ${j.location} ${(j.skills ?? []).join(' ')}`.toLowerCase().includes(q.value.toLowerCase()))
  .sort((a, b) => b.posted.localeCompare(a.posted)))
const byDay = computed(() => {
  const groups = new Map<string, typeof filtered.value>()
  for (const j of filtered.value) groups.set(j.posted, [...(groups.get(j.posted) ?? []), j])
  return [...groups.entries()]
})
const dayLabel = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' })
const updated = computed(() => feed.value?.updated ? new Date(feed.value.updated).toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' }) : null)

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
            :to="localePath('/start')"
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
                <a
                  :href="j.url"
                  target="_blank"
                  rel="noopener nofollow"
                  class="bp-card bp-card--hover flex flex-wrap items-center gap-4 p-5"
                >
                  <span class="bp-iconbox">
                    <UIcon
                      name="i-lucide-building-2"
                      class="size-5"
                    />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-lg font-bold text-(--ink)">
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
                  </div>
                  <span class="flex shrink-0 items-center gap-1 text-sm font-semibold text-(--signal)">
                    {{ t('jobs.apply') }}
                    <UIcon
                      name="i-lucide-arrow-up-right"
                      class="size-4"
                    />
                  </span>
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
