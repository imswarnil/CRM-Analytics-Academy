<script setup lang="ts">
/**
 * The course's warehouse: CRM Analytics Academy's own business data, one CSV
 * per table. Row counts come from the generator's manifest rather than being
 * typed here, so the page cannot drift from the files it links to.
 */
import manifest from '~~/public/sample-data/academy/manifest.json'

const { t } = useI18n()
const route = useRoute()

const title = computed(() => t('datasets.seo.title'))
const description = computed(() => t('datasets.seo.description'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

const BASE = '/sample-data/academy'

// Group titles live under `datasets.groups.<id>`; each file's grain and blurb
// under `datasets.files.<file name without .csv>`.
const groups: { id: string, icon: string, files: string[] }[] = [
  {
    id: 'dimensions',
    icon: 'i-lucide-boxes',
    files: ['accounts.csv', 'contacts.csv', 'products.csv', 'reps.csv', 'centers.csv']
  },
  {
    id: 'marketing',
    icon: 'i-lucide-megaphone',
    files: ['campaigns.csv', 'marketing_spend.csv', 'web_sessions.csv', 'seo_keywords.csv', 'llm_visibility.csv']
  },
  {
    id: 'pipeline',
    icon: 'i-lucide-filter',
    files: ['leads.csv', 'opportunities.csv', 'opportunity_products.csv', 'quotes.csv']
  },
  {
    id: 'customers',
    icon: 'i-lucide-repeat',
    files: ['usage_monthly.csv', 'arr_snapshots.csv', 'cases.csv', 'csat_surveys.csv', 'platform_health_daily.csv']
  },
  {
    id: 'classroom',
    icon: 'i-lucide-school',
    files: ['batches.csv', 'enrollments.csv']
  }
]

const fileKey = (file: string) => `datasets.files.${file.replace(/\.csv$/, '')}`

const files = manifest.files as Record<string, { rows: number, columns: number }>
const totalRows = Object.values(files).reduce((n, f) => n + f.rows, 0)
const fmt = (n: number) => n.toLocaleString('en-US')

const stats = computed(() => [
  { label: t('datasets.stats.files'), value: fmt(Object.keys(files).length) },
  { label: t('datasets.stats.rows'), value: fmt(totalRows) },
  { label: t('datasets.stats.window'), value: `${manifest.window.from.slice(0, 7)} → ${manifest.window.to.slice(0, 7)}` }
])

usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  extra: [{
    '@type': 'Dataset',
    'name': t('datasets.schemaName'),
    'description': description.value,
    'url': `${SITE.url}${route.path}`,
    'isAccessibleForFree': true,
    'license': 'https://opensource.org/licenses/MIT',
    'distribution': groups.flatMap(g => g.files).map(file => ({
      '@type': 'DataDownload',
      'encodingFormat': 'text/csv',
      'contentUrl': `${SITE.url}${BASE}/${file}`
    }))
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('datasets.header.sheet')"
      :title="t('datasets.header.title')"
      :lead="t('datasets.header.lead')"
    >
      <dl class="mt-8 inline-grid grid-cols-3 border-[1.5px] border-(--ink) bg-(--card)">
        <div
          v-for="(s, n) in stats"
          :key="n"
          class="flex flex-col-reverse px-5 py-3"
          :class="n ? 'border-s-[1.5px] border-(--ink)' : ''"
        >
          <dd class="text-2xl font-black tracking-[-0.03em] text-(--ink)">
            {{ s.value }}
          </dd>
          <dt class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
            {{ s.label }}
          </dt>
        </div>
      </dl>
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          :to="`${BASE}/README.md`"
          external
          target="_blank"
          icon="i-lucide-book-open"
          size="lg"
        >
          {{ t('datasets.guide') }}
        </UButton>
        <UButton
          :to="`${BASE}/manifest.json`"
          external
          target="_blank"
          icon="i-lucide-file-json"
          size="lg"
          color="neutral"
          variant="outline"
        >
          {{ t('datasets.manifest') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="space-y-14">
        <section
          v-for="(g, gi) in groups"
          :key="g.id"
        >
          <p class="eyebrow">
            {{ t('datasets.table', { n: `0${gi + 1}` }) }}
          </p>
          <h2 class="mt-2 flex items-center gap-3 text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
            <span class="bp-iconbox size-9!">
              <UIcon
                :name="g.icon"
                class="size-4"
              />
            </span>
            {{ t(`datasets.groups.${g.id}`) }}
          </h2>
          <div class="mt-5 border-[1.5px] border-(--ink) bg-(--card)">
            <div
              v-for="f in g.files"
              :key="f"
              class="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-dashed border-(--line) px-5 py-4 last:border-b-0 hover:bg-(--ice)/50"
            >
              <div class="min-w-0 flex-1 basis-72">
                <p class="font-mono text-sm font-semibold text-(--ink)">
                  {{ f }}
                </p>
                <p class="mt-0.5 text-sm text-(--ink2)">
                  {{ t(`${fileKey(f)}.desc`) }}
                </p>
              </div>
              <div class="w-44 shrink-0">
                <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                  {{ t('datasets.rowPer') }}
                </p>
                <p class="text-sm text-(--ink)">
                  {{ t(`${fileKey(f)}.grain`) }}
                </p>
              </div>
              <p class="w-28 shrink-0 font-mono text-sm text-(--ink)">
                {{ t('datasets.rows', { count: fmt(files[f]?.rows ?? 0) }) }}
              </p>
              <UButton
                :to="`${BASE}/${f}`"
                external
                download
                size="sm"
                color="neutral"
                variant="outline"
                icon="i-lucide-download"
              >
                CSV
              </UButton>
            </div>
          </div>
        </section>
      </div>

      <div class="graph-paper-navy mt-14 border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white">
        <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
          {{ t('datasets.procedure.title') }}
        </p>
        <ol class="mt-4 list-inside list-decimal space-y-2 text-sm text-white/80">
          <i18n-t
            keypath="datasets.procedure.step1"
            tag="li"
            scope="global"
          >
            <template #app>
              <strong class="text-white">Academy Analytics</strong>
            </template>
          </i18n-t>
          <i18n-t
            keypath="datasets.procedure.step2"
            tag="li"
            scope="global"
          >
            <template #path>
              <strong class="text-white">Data Manager → Create Dataset → CSV File</strong>
            </template>
          </i18n-t>
          <li>{{ t('datasets.procedure.step3') }}</li>
        </ol>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
