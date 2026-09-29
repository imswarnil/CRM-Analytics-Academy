<script setup lang="ts">
/**
 * The course's warehouse: CRM Analytics Academy's own business data, one CSV
 * per table. Row counts come from the generator's manifest rather than being
 * typed here, so the page cannot drift from the files it links to.
 */
import manifest from '~~/public/sample-data/academy/manifest.json'

const title = 'Datasets'
const description = 'The course warehouse: CRM Analytics Academy\'s own business data — accounts, pipeline, subscriptions, classroom batches and enrollments — as free CSVs to load into your CRM Analytics org.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const BASE = '/sample-data/academy'

interface FileInfo {
  file: string
  grain: string
  desc: string
}

const groups: { title: string, icon: string, files: FileInfo[] }[] = [
  {
    title: 'Dimensions',
    icon: 'i-lucide-boxes',
    files: [
      { file: 'accounts.csv', grain: 'account', desc: 'Customers from individual learners to global SIs: segment, region, ARR, health, support tier.' },
      { file: 'contacts.csv', grain: 'contact', desc: 'Personas from Individual Learner to L&D Manager, with economic buyer and champion flags.' },
      { file: 'products.csv', grain: 'offering', desc: 'Academy Pro, Team Plan, Enterprise Programme, seat-days, vouchers and services.' },
      { file: 'reps.csv', grain: 'rep', desc: 'AEs, SDRs, BDRs, solution consultants and CSMs, with quota and ramp.' },
      { file: 'centers.csv', grain: 'training center', desc: 'Six centers with seats, monthly fixed cost and region.' }
    ]
  },
  {
    title: 'Marketing and demand',
    icon: 'i-lucide-megaphone',
    files: [
      { file: 'campaigns.csv', grain: 'campaign', desc: 'Spend plus leads, pipeline and won revenue computed from the detail rows.' },
      { file: 'marketing_spend.csv', grain: 'month × channel × region', desc: 'Finance\'s view of spend, at a deliberately different grain.' },
      { file: 'web_sessions.csv', grain: 'day × channel × page', desc: 'GA4-shaped traffic with signups, course starts and quote requests.' },
      { file: 'seo_keywords.csv', grain: 'week × keyword', desc: 'Rank, CTR and whether an AI Overview took the click.' },
      { file: 'llm_visibility.csv', grain: 'month × engine × prompt × run', desc: 'Is the Academy named when someone asks an assistant how to learn CRM Analytics?' }
    ]
  },
  {
    title: 'Pipeline',
    icon: 'i-lucide-filter',
    files: [
      { file: 'leads.csv', grain: 'lead', desc: 'Every stage has its own date, so velocity is measurable. Free-course signals included.' },
      { file: 'opportunities.csv', grain: 'opportunity', desc: 'New business, expansion, upsell and renewal, with pilot and vendor-review gates.' },
      { file: 'opportunity_products.csv', grain: 'opportunity × offering', desc: 'Line items whose ARR sums exactly to the opportunity. The fan-out lesson lives here.' },
      { file: 'quotes.csv', grain: 'opportunity × version', desc: 'Every quote version, discount creep and approval chain.' }
    ]
  },
  {
    title: 'Customers and revenue',
    icon: 'i-lucide-repeat',
    files: [
      { file: 'usage_monthly.csv', grain: 'month × account × offering', desc: 'Seats and prepaid pools bought vs used — the leading indicator of renewal.' },
      { file: 'arr_snapshots.csv', grain: 'month × account', desc: 'The ARR waterfall: new, expansion, contraction and churn.' },
      { file: 'cases.csv', grain: 'case', desc: 'Support with SLA, root cause and Ask AI deflection.' },
      { file: 'csat_surveys.csv', grain: 'survey response', desc: 'CSAT and NPS, kept separate on purpose.' },
      { file: 'platform_health_daily.csv', grain: 'day × offering', desc: 'Errors, latency and incidents — the "was it us?" table.' }
    ]
  },
  {
    title: 'Classroom',
    icon: 'i-lucide-school',
    files: [
      { file: 'batches.csv', grain: 'batch', desc: 'Every classroom batch: center, programme, seats sold, utilisation and revenue.' },
      { file: 'enrollments.csv', grain: 'seat', desc: 'One row per learner seat: individual or corporate, price paid, completion, certification.' }
    ]
  }
]

const files = manifest.files as Record<string, { rows: number, columns: number }>
const totalRows = Object.values(files).reduce((n, f) => n + f.rows, 0)
const fmt = (n: number) => n.toLocaleString('en-US')

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  'name': 'CRM Analytics Academy teaching warehouse',
  description,
  'url': `${SITE.url}/datasets`,
  'isAccessibleForFree': true,
  'license': 'https://opensource.org/licenses/MIT',
  'distribution': groups.flatMap(g => g.files).map(f => ({
    '@type': 'DataDownload',
    'encodingFormat': 'text/csv',
    'contentUrl': `${SITE.url}${BASE}/${f.file}`
  }))
})
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 05 / The course warehouse"
      title="One company's data, every build in the course"
      lead="CRM Analytics Academy's own business: learners and team plans, a pipeline of corporate deals, six classroom centers and every seat sold in them. Load it into your org once and every lesson from the first dashboard to the executive board runs on it."
    >
      <dl class="mt-8 inline-grid grid-cols-3 border-[1.5px] border-(--ink) bg-(--card)">
        <div
          v-for="(s, n) in [
            { label: 'Files', value: fmt(Object.keys(files).length) },
            { label: 'Rows', value: fmt(totalRows) },
            { label: 'Window', value: `${manifest.window.from.slice(0, 7)} → ${manifest.window.to.slice(0, 7)}` }
          ]"
          :key="s.label"
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
          Read the data guide
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
          Manifest
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="space-y-14">
        <section
          v-for="(g, gi) in groups"
          :key="g.title"
        >
          <p class="eyebrow">
            Table 0{{ gi + 1 }}
          </p>
          <h2 class="mt-2 flex items-center gap-3 text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
            <span class="bp-iconbox size-9!">
              <UIcon
                :name="g.icon"
                class="size-4"
              />
            </span>
            {{ g.title }}
          </h2>
          <div class="mt-5 border-[1.5px] border-(--ink) bg-(--card)">
            <div
              v-for="f in g.files"
              :key="f.file"
              class="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-dashed border-(--line) px-5 py-4 last:border-b-0 hover:bg-(--ice)/50"
            >
              <div class="min-w-0 flex-1 basis-72">
                <p class="font-mono text-sm font-semibold text-(--ink)">
                  {{ f.file }}
                </p>
                <p class="mt-0.5 text-sm text-(--ink2)">
                  {{ f.desc }}
                </p>
              </div>
              <div class="w-44 shrink-0">
                <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                  one row per
                </p>
                <p class="text-sm text-(--ink)">
                  {{ f.grain }}
                </p>
              </div>
              <p class="w-28 shrink-0 font-mono text-sm text-(--ink)">
                {{ fmt(files[f.file]?.rows ?? 0) }} rows
              </p>
              <UButton
                :to="`${BASE}/${f.file}`"
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
          Procedure — loading it into your org
        </p>
        <ol class="mt-4 list-inside list-decimal space-y-2 text-sm text-white/80">
          <li>In Analytics Studio, create an app called <strong class="text-white">Academy Analytics</strong>.</li>
          <li>Open <strong class="text-white">Data Manager → Create Dataset → CSV File</strong> and upload one file at a time into that app.</li>
          <li>Check the row count against this page before building on it — a short count is almost always a delimiter or date-format problem.</li>
        </ol>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
