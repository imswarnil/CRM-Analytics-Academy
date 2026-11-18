<script setup lang="ts">
/**
 * Home → "What it costs": this course next to the usual ways to learn CRM
 * Analytics. Prices are public list prices, with their sources linked, and a
 * date — re-check them when you edit this (COMPARED_ON below).
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const COMPARED_ON = 'November 2026'
const usd = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const ROWS = computed(() => [
  {
    key: 'ilt201',
    price: usd(600),
    unit: t('home.compare.perDay', { n: 1 }),
    source: 'https://www.newhorizons.com/course-outline/courseid/300201319/title/salesforce-building-lenses-dashboards-and-apps-in-crm-analytics-anc201',
    flags: [false, false, false, false]
  },
  {
    key: 'ilt301',
    price: usd(2700),
    unit: t('home.compare.perDays', { n: 3 }),
    source: 'https://newhorizons.com/course-outline/courseid/300200900/coursename/implement-and-manage-crm-analytics-anc301',
    flags: [false, false, false, false]
  },
  {
    key: 'trailhead',
    price: usd(0),
    unit: t('home.compare.selfPaced'),
    source: 'https://trailhead.salesforce.com/',
    flags: [true, false, false, true]
  },
  {
    key: 'academy',
    price: `${usd(0)} – ${usd(PRICES.lifetime.usd)}`,
    unit: t('home.compare.academyUnit', { monthly: usd(PRICES.monthly.usd) }),
    source: null,
    flags: [true, true, true, true],
    ours: true
  }
])
const COLS = ['anytime', 'gtm', 'practice', 'keep'] as const
</script>

<template>
  <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
    <div class="max-w-2xl">
      <p class="eyebrow">
        {{ t('home.compare.eyebrow') }}
      </p>
      <h2 class="bp-h2 mt-3">
        {{ t('home.compare.title') }}
      </h2>
      <p class="bp-lead mt-4">
        {{ t('home.compare.lead') }}
      </p>
    </div>

    <div class="mt-10 overflow-x-auto rounded-[6px] border border-(--line) bg-(--card)">
      <table class="w-full min-w-[44rem] text-start">
        <thead class="bg-(--paper)">
          <tr>
            <th class="px-5 py-3 text-start mono-label">
              {{ t('home.compare.option') }}
            </th>
            <th class="px-5 py-3 text-start mono-label">
              {{ t('home.compare.price') }}
            </th>
            <th
              v-for="c in COLS"
              :key="c"
              class="px-3 py-3 text-center mono-label"
            >
              {{ t(`home.compare.cols.${c}`) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--line)">
          <tr
            v-for="r in ROWS"
            :key="r.key"
            :class="r.ours ? 'bg-(--ice)/60' : ''"
          >
            <td class="px-5 py-4">
              <p
                class="font-semibold"
                :class="r.ours ? 'text-(--signal)' : 'text-(--ink)'"
              >
                {{ t(`home.compare.rows.${r.key}`) }}
              </p>
              <a
                v-if="r.source"
                :href="r.source"
                target="_blank"
                rel="noopener nofollow"
                class="text-xs text-(--ink2) hover:text-(--signal) hover:underline"
              >{{ t('home.compare.source') }} ↗</a>
            </td>
            <td class="px-5 py-4">
              <p class="text-lg font-bold tabular-nums text-(--ink)">
                {{ r.price }}
              </p>
              <p class="text-xs text-(--ink2)">
                {{ r.unit }}
              </p>
            </td>
            <td
              v-for="(on, ci) in r.flags"
              :key="ci"
              class="px-3 py-4 text-center"
            >
              <UIcon
                :name="on ? 'i-lucide-check' : 'i-lucide-minus'"
                class="size-5"
                :class="on ? 'text-success' : 'text-(--x)'"
                :aria-label="on ? t('home.compare.yes') : t('home.compare.no')"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-xs text-(--ink2)">
      {{ t('home.compare.note', { date: COMPARED_ON }) }}
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <UButton
        :to="localePath('/pro')"
        size="lg"
        icon="i-lucide-sparkles"
      >
        {{ t('home.compare.cta') }}
      </UButton>
      <UButton
        :to="localePath('/start')"
        size="lg"
        color="neutral"
        variant="outline"
      >
        {{ t('home.hero.start') }}
      </UButton>
    </div>
  </section>
</template>
