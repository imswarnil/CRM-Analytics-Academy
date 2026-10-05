<script setup lang="ts">
/**
 * Live project analytics for the /sponsor pitch, from /api/partner/reach.
 * Fetched in the browser, so the prerendered page never carries stale
 * figures. A number the server could not count is not shown at all.
 */
interface Reach {
  learners: number | null
  active30d: number | null
  lessonsCompleted: number | null
  quizAttempts: number | null
  comments: number | null
  pageViews30d: number | null
  countries30d: number | null
  topCountries: { name: string, views: number }[]
  updatedAt: string
}

const { t, locale, locales } = useI18n()
const { data, status } = useLazyFetch<Reach>('/api/partner/reach', { server: false })

const fmt = (n: number) => new Intl.NumberFormat(locale.value, { notation: n >= 100_000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n)

const tiles = computed(() => {
  const r = data.value
  const list: { label: string, value: string, icon: string }[] = []
  const add = (label: string, v: number | null | undefined, icon: string) => {
    if (typeof v === 'number') list.push({ label, value: fmt(v), icon })
  }
  if (r) {
    add(t('sponsor.reach.pageViews'), r.pageViews30d, 'i-lucide-eye')
    add(t('sponsor.reach.countries'), r.countries30d, 'i-lucide-globe')
    add(t('sponsor.reach.learners'), r.learners, 'i-lucide-users')
    add(t('sponsor.reach.active'), r.active30d, 'i-lucide-activity')
    add(t('sponsor.reach.completed'), r.lessonsCompleted, 'i-lucide-circle-check')
    add(t('sponsor.reach.quizzes'), r.quizAttempts, 'i-lucide-list-checks')
    add(t('sponsor.reach.comments'), r.comments, 'i-lucide-messages-square')
  }
  // A fact of the build, not a measurement.
  list.push({ label: t('sponsor.reach.languages'), value: String(locales.value.length), icon: 'i-lucide-languages' })
  return list
})

const maxCountry = computed(() => Math.max(1, ...(data.value?.topCountries ?? []).map(c => c.views)))
const updated = computed(() => data.value
  ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.value.updatedAt))
  : '')
</script>

<template>
  <section>
    <p class="eyebrow">
      {{ t('sponsor.reach.eyebrow') }}
    </p>
    <h2 class="bp-h2 mt-3">
      {{ t('sponsor.reach.title') }}
    </h2>

    <div
      class="mt-8 grid grid-cols-2 border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-4"
      :aria-busy="status === 'pending'"
    >
      <template v-if="status === 'pending' || status === 'idle'">
        <div
          v-for="i in 8"
          :key="i"
          class="h-28 border-b-[1.5px] border-e-[1.5px] border-dashed border-(--line) p-4"
        >
          <p class="mono-label">
            {{ t('sponsor.reach.loading') }}
          </p>
        </div>
      </template>
      <div
        v-for="tile in tiles"
        v-else
        :key="tile.label"
        class="-mb-[1.5px] -me-[1.5px] border-b-[1.5px] border-e-[1.5px] border-(--ink) p-4"
      >
        <p class="mono-label flex items-center gap-1.5">
          <UIcon
            :name="tile.icon"
            class="size-3.5"
          />
          {{ tile.label }}
        </p>
        <p class="mt-2 text-3xl font-black tabular-nums tracking-[-0.03em] text-(--signal)">
          {{ tile.value }}
        </p>
      </div>
    </div>

    <div
      v-if="data?.topCountries.length"
      class="mt-4 border-[1.5px] border-(--ink) bg-(--card) p-4"
    >
      <p class="mono-label">
        {{ t('sponsor.reach.topCountries') }}
      </p>
      <ul class="mt-3 space-y-2">
        <li
          v-for="c in data.topCountries"
          :key="c.name"
          class="grid grid-cols-[8rem_minmax(0,1fr)_4rem] items-center gap-3 text-sm"
        >
          <span class="truncate">{{ c.name }}</span>
          <span class="h-2.5 bg-(--ice)">
            <span
              class="block h-full bg-(--signal)"
              :style="{ width: `${(c.views / maxCountry) * 100}%` }"
            />
          </span>
          <span class="text-end font-mono text-xs tabular-nums text-(--ink2)">{{ fmt(c.views) }}</span>
        </li>
      </ul>
    </div>

    <p class="mt-3 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
      <template v-if="status === 'error'">
        {{ t('sponsor.reach.unavailable') }}
      </template>
      <template v-else-if="data">
        {{ t('sponsor.reach.note', { time: updated }) }}
      </template>
    </p>
  </section>
</template>
