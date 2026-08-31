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
    <PageHero
      eyebrow="Sample datasets"
      icon="i-lucide-database"
    >
      <template #title>
        Practice on <span class="text-marker">real-shaped</span> data
      </template>
      <template #description>
        Download these free CSVs and upload them into CRM Analytics to follow every lesson hands-on — build recipes, write SAQL, and design dashboards.
      </template>
    </PageHero>

    <div class="container  py-12 sm:py-16">
      <div class="grid gap-6 sm:grid-cols-2">
        <div
          v-for="d in datasets"
          :key="d.name"
          class="is-flex is-flex-direction-column rounded-2xl border border-default has-background-white p-6"
        >
          <div class="mb-4 is-flex is-align-items-center gap-3">
            <div class="is-flex size-11 is-align-items-center is-justify-content-center rounded-xl bg-primary/10 has-text-primary ring-1 ring-primary/20">
              <Icon
                :name="d.icon"
                class="size-5"
              />
            </div>
            <div>
              <h2 class="has-text-weight-semibold has-text-weight-semibold">
                {{ d.name }}
              </h2>
              <p class="is-size-7 has-text-grey">
                CSV · {{ d.rows }} rows
              </p>
            </div>
          </div>
          <p class="grow is-size-7 has-text-grey">
            {{ d.desc }}
          </p>
          <div class="mt-4 is-flex is-flex-wrap-wrap gap-1.5">
            <span
              v-for="field in d.fields"
              :key="field"
              class="rounded-md has-background-light px-2 py-0.5 is-family-monospace has-text-grey-dark"
            >{{ field }}</span>
          </div>
          <div class="mt-5 is-flex gap-2">
            <UiButton
              variant="secondary"
              :to="d.file"
              external
              download
              icon="i-lucide-download"
              class="rounded-full has-text-weight-semibold"
            >
              Download CSV
            </UiButton>
            <UiButton
              variant="secondary"
              :to="d.file"
              target="_blank"
              icon="i-lucide-eye"
              class="rounded-full"
            >
              Preview
            </UiButton>
          </div>
        </div>
      </div>

      <div class="mt-10 rounded-2xl border border-default bg-muted/30 p-6">
        <h3 class="title is-5 is-flex is-align-items-center gap-2 has-text-weight-semibold ">
          <Icon
            name="i-lucide-info"
            class="size-4 has-text-primary"
          />
          How to use these
        </h3>
        <ol class="mt-3 list-inside list-decimal space-y-1.5 is-size-7 has-text-grey">
          <li>In CRM Analytics, open <strong class="has-text-grey-dark">Data Manager → Create → CSV Upload</strong>.</li>
          <li>Upload the file and let it create a dataset.</li>
          <li>Open the dataset, click <strong class="has-text-grey-dark">Explore</strong>, and follow the lessons.</li>
        </ol>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
