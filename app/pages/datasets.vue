<script setup lang="ts">
const title = 'Sample Datasets — CRM Analytics Academy'
const description = 'Free sample CRM datasets (CSV) you can upload into Salesforce CRM Analytics to practice recipes, SAQL, and dashboards.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const datasets = [
  {
    name: 'Opportunities',
    file: '/sample-data/opportunities.csv',
    rows: 20,
    desc: 'Sales pipeline records with stage, amount, close date, region, and industry — perfect for pipeline and revenue dashboards.',
    fields: ['StageName', 'Amount', 'CloseDate', 'Region', 'Industry', 'IsWon'],
    icon: 'i-lucide-trending-up'
  },
  {
    name: 'Accounts',
    file: '/sample-data/accounts.csv',
    rows: 12,
    desc: 'Company records with industry, region, revenue, and tier — join it to Opportunities to enrich your analysis.',
    fields: ['Industry', 'Region', 'AnnualRevenue', 'Employees', 'Tier'],
    icon: 'i-lucide-building-2'
  }
]

useJsonLd(datasets.map(d => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  'name': `${d.name} sample dataset`,
  'description': d.desc,
  'url': `${SITE.url}/datasets`,
  'distribution': { '@type': 'DataDownload', 'encodingFormat': 'text/csv', 'contentUrl': `${SITE.url}${d.file}` },
  'isAccessibleForFree': true,
  'license': 'https://opensource.org/licenses/MIT'
})))
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-16 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-database"
            class="mr-1 size-4"
          />
          Sample datasets
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Practice on <span class="text-gradient">real-shaped</span> data
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Download these free CSVs and upload them into CRM Analytics to follow every lesson hands-on — build recipes, write SAQL, and design dashboards.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="grid gap-6 sm:grid-cols-2">
        <div
          v-for="d in datasets"
          :key="d.name"
          class="flex flex-col rounded-2xl border border-default bg-default p-6"
        >
          <div class="mb-4 flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <UIcon
                :name="d.icon"
                class="size-5"
              />
            </div>
            <div>
              <h2 class="font-semibold text-highlighted">
                {{ d.name }}
              </h2>
              <p class="text-xs text-muted">
                CSV · {{ d.rows }} rows
              </p>
            </div>
          </div>
          <p class="grow text-sm text-muted">
            {{ d.desc }}
          </p>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span
              v-for="field in d.fields"
              :key="field"
              class="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-toned"
            >{{ field }}</span>
          </div>
          <div class="mt-5 flex gap-2">
            <UButton
              :to="d.file"
              external
              download
              icon="i-lucide-download"
              class="rounded-full font-semibold"
            >
              Download CSV
            </UButton>
            <UButton
              :to="d.file"
              target="_blank"
              color="neutral"
              variant="outline"
              icon="i-lucide-eye"
              class="rounded-full"
            >
              Preview
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-10 rounded-2xl border border-default bg-muted/30 p-6">
        <h3 class="flex items-center gap-2 font-semibold text-highlighted">
          <UIcon
            name="i-lucide-info"
            class="size-4 text-primary"
          />
          How to use these
        </h3>
        <ol class="mt-3 list-inside list-decimal space-y-1.5 text-sm text-muted">
          <li>In CRM Analytics, open <strong class="text-toned">Data Manager → Create → CSV Upload</strong>.</li>
          <li>Upload the file and let it create a dataset.</li>
          <li>Open the dataset, click <strong class="text-toned">Explore</strong>, and follow the lessons.</li>
        </ol>
      </div>
    </UContainer>
  </div>
</template>
