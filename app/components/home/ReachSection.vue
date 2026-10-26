<script setup lang="ts">
/**
 * "The project, live": the Academy's own public numbers and its readers
 * ranked by region (GET /api/stats — aggregates only, cached ten minutes).
 * Fetched in the browser so the prerendered home page stays static; the
 * section waits quietly until the numbers arrive.
 */
interface Stats {
  learners: number
  lessonsCompleted: number
  quizzes: number
  readers30d: number
  views: number
  countryCount: number
  regions: { rank: number, key: string, name: string, readers: number }[]
  countries: { country: string, readers: number }[]
}

const { t, locale } = useI18n()
const { data } = useFetch<Stats>('/api/stats', { key: 'public-stats', server: false })

const fmt = (n: number) => new Intl.NumberFormat(locale.value).format(n)
const flag = (cc: string) => /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🌐'
const countryName = (cc: string) => {
  try {
    return new Intl.DisplayNames([locale.value], { type: 'region' }).of(cc) ?? cc
  } catch {
    return cc
  }
}
const topRegion = computed(() => Math.max(1, ...(data.value?.regions ?? []).map(r => r.readers)))
const tiles = computed(() => data.value
  ? [
      { label: t('home.reach.learners'), value: data.value.learners },
      { label: t('home.reach.lessons'), value: data.value.lessonsCompleted },
      { label: t('home.reach.readers'), value: data.value.readers30d },
      { label: t('home.reach.countries'), value: data.value.countryCount }
    ]
  : [])
</script>

<template>
  <section
    v-if="data"
    class="graph-paper border-y-[1.5px] border-(--ink)"
  >
    <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('home.reach.eyebrow') }}
      </p>
      <h2 class="bp-h2 mt-4 max-w-3xl">
        {{ t('home.reach.title') }}
      </h2>

      <dl class="mt-10 grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) lg:grid-cols-4">
        <div
          v-for="(tile, n) in tiles"
          :key="tile.label"
          class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-5"
        >
          <dd class="mt-2 text-4xl font-black tabular-nums tracking-[-0.03em] text-(--signal)">
            {{ fmt(tile.value) }}
          </dd>
          <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
            K.0{{ n + 1 }} — {{ tile.label }}
          </dt>
        </div>
      </dl>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div class="border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-5 py-3">
            {{ t('home.reach.byRegion') }}
          </p>
          <ol>
            <li
              v-for="r in data.regions"
              :key="r.key"
              class="relative flex items-center gap-3 border-b border-dashed border-(--line) px-5 py-2.5 last:border-b-0"
            >
              <span
                class="absolute inset-y-0 start-0 bg-(--ice)"
                :style="{ width: `${(r.readers / topRegion) * 100}%` }"
              />
              <span class="relative w-8 font-mono text-xs font-semibold text-(--signal)">#{{ r.rank }}</span>
              <span class="relative min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ r.name }}</span>
              <span class="relative font-mono text-xs tabular-nums text-(--ink2)">{{ fmt(r.readers) }}</span>
            </li>
          </ol>
        </div>
        <div class="border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-5 py-3">
            {{ t('home.reach.topCountries') }}
          </p>
          <ul class="grid grid-cols-2">
            <li
              v-for="c in data.countries"
              :key="c.country"
              class="flex items-center gap-2 border-b border-dashed border-(--line) px-5 py-2.5 text-sm"
            >
              <span>{{ flag(c.country) }}</span>
              <span class="min-w-0 flex-1 truncate">{{ countryName(c.country) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
