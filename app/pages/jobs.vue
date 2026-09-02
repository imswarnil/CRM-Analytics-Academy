<script setup lang="ts">
import jobsData from '~/data/jobs.json'

interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  url: string
  postedAt: string
  source: string
}

const { t, locale, locales } = useI18n()

const title = computed(() => t('jobs.title'))
const description = computed(() => t('jobs.subtitle'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

const jobs = jobsData.jobs as Job[]

// Shown only while the live dataset is empty (the daily fetch workflow fills
// app/data/jobs.json once API keys are configured). Companies are deliberately
// generic placeholders; each apply link goes to a LinkedIn search for the title.
const linkedinSearch = (jobTitle: string) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`

const sampleJobs: Job[] = [
  { id: 'sample-1', title: 'CRM Analytics Consultant', company: 'Salesforce Consulting Partner', location: 'Remote', remote: true, url: linkedinSearch('CRM Analytics Consultant'), postedAt: '2026-08-31', source: 'LinkedIn Search' },
  { id: 'sample-2', title: 'Senior Tableau CRM Developer', company: 'Global SI Firm', location: 'New York, NY', remote: false, url: linkedinSearch('Senior Tableau CRM Developer'), postedAt: '2026-08-30', source: 'LinkedIn Search' },
  { id: 'sample-3', title: 'Einstein Analytics Architect', company: 'FinServ Enterprise', location: 'London, UK', remote: false, url: linkedinSearch('Einstein Analytics Architect'), postedAt: '2026-08-29', source: 'LinkedIn Search' },
  { id: 'sample-4', title: 'Salesforce Data Analyst (CRM Analytics)', company: 'Healthcare ISV', location: 'Toronto, Canada', remote: false, url: linkedinSearch('Salesforce Data Analyst CRM Analytics'), postedAt: '2026-08-28', source: 'LinkedIn Search' },
  { id: 'sample-5', title: 'CRM Analytics Trainer', company: 'Salesforce Training Provider', location: 'Remote', remote: true, url: linkedinSearch('CRM Analytics Trainer'), postedAt: '2026-08-27', source: 'LinkedIn Search' },
  { id: 'sample-6', title: 'CRM Analytics Dashboard Designer', company: 'Digital Consulting Agency', location: 'Sydney, Australia', remote: false, url: linkedinSearch('CRM Analytics Dashboard Designer'), postedAt: '2026-08-26', source: 'LinkedIn Search' },
  { id: 'sample-7', title: 'Salesforce BI Developer (CRM Analytics)', company: 'Retail Enterprise', location: 'Bengaluru, India', remote: false, url: linkedinSearch('Salesforce BI Developer CRM Analytics'), postedAt: '2026-08-25', source: 'LinkedIn Search' },
  { id: 'sample-8', title: 'Lead CRM Analytics Engineer', company: 'SaaS Scale-up', location: 'Remote', remote: true, url: linkedinSearch('Lead CRM Analytics Engineer'), postedAt: '2026-08-24', source: 'LinkedIn Search' },
  { id: 'sample-9', title: 'Einstein Discovery Data Scientist', company: 'Insurance Enterprise', location: 'Chicago, IL', remote: false, url: linkedinSearch('Einstein Discovery Data Scientist'), postedAt: '2026-08-23', source: 'LinkedIn Search' }
]

const showingSamples = jobs.length === 0
const displayJobs = showingSamples ? sampleJobs : jobs

const dateFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))
const formatDate = (iso: string) => dateFormat.value.format(new Date(iso))
const updatedLine = computed(() => jobsData.updatedAt ? t('jobs.updated', { date: formatDate(jobsData.updatedAt) }) : '')

const search = ref('')
const remoteOnly = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return displayJobs.filter((job) => {
    if (remoteOnly.value && !job.remote) return false
    if (!q) return true
    return [job.title, job.company, job.location].some(field => field.toLowerCase().includes(q))
  })
})

// Only real listings belong in structured data; sample jobs are excluded.
if (jobs.length) {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': title.value,
    'description': description.value,
    'url': `${SITE.url}/jobs`,
    'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
    'itemListElement': jobs.slice(0, 25).map((job, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': job.title
    }))
  })
}
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <aside class="hidden lg:sticky lg:top-(--ui-header-height) lg:block lg:max-h-[calc(100vh-var(--ui-header-height))] lg:overflow-y-auto lg:py-12 lg:pe-6">
          <p class="mb-4 text-sm font-semibold text-highlighted">
            {{ t('jobs.filters') }}
          </p>
          <div class="space-y-4">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              :placeholder="t('jobs.searchPlaceholder')"
              class="w-full"
            />
            <USwitch
              v-model="remoteOnly"
              :label="t('jobs.remoteOnly')"
            />
          </div>
          <p
            v-if="updatedLine"
            class="mt-6 text-sm text-dimmed"
          >
            {{ updatedLine }}
          </p>
          <p class="mt-3 text-xs text-dimmed">
            {{ t('jobs.disclaimer') }}
          </p>
        </aside>
      </template>

      <div class="py-12 sm:py-16">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-4 rounded-full"
        >
          <UIcon
            name="i-lucide-briefcase"
            class="mr-1 size-4"
          />
          {{ t('jobs.eyebrow') }}
        </UBadge>
        <h1 class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          {{ t('jobs.title') }}
        </h1>
        <p class="mt-4 text-lg text-muted">
          {{ t('jobs.subtitle') }}
        </p>
        <p
          v-if="updatedLine"
          class="mt-2 text-sm text-dimmed lg:hidden"
        >
          {{ updatedLine }}
        </p>

        <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:hidden">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('jobs.searchPlaceholder')"
            class="w-full sm:max-w-sm"
          />
          <USwitch
            v-model="remoteOnly"
            :label="t('jobs.remoteOnly')"
          />
        </div>

        <p class="mt-6 text-sm text-muted lg:mt-8">
          {{ t('jobs.count', { count: filtered.length }) }}
        </p>
        <p
          v-if="showingSamples"
          class="mt-1 text-sm text-dimmed"
        >
          {{ t('jobs.sampleNote') }}
        </p>

        <div
          v-if="filtered.length"
          class="mt-4 space-y-4"
        >
          <UPageCard
            v-for="job in filtered"
            :key="job.id"
            variant="outline"
          >
            <template #title>
              {{ job.title }}
            </template>
            <template #description>
              <span class="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span class="inline-flex items-center gap-1.5">
                  <UIcon
                    name="i-lucide-building-2"
                    class="size-4"
                  />
                  {{ job.company }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="size-4"
                  />
                  {{ job.location }}
                </span>
                <span class="text-dimmed">{{ formatDate(job.postedAt) }}</span>
              </span>
            </template>
            <template #footer>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  v-if="showingSamples"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  {{ t('jobs.sample') }}
                </UBadge>
                <UBadge
                  v-if="job.remote"
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ t('jobs.remoteOnly') }}
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  {{ t('jobs.source') }}: {{ job.source }}
                </UBadge>
                <UButton
                  :to="job.url"
                  target="_blank"
                  rel="noopener"
                  color="primary"
                  variant="subtle"
                  size="sm"
                  trailing-icon="i-lucide-arrow-up-right"
                  class="ml-auto"
                >
                  {{ t('jobs.apply') }}
                </UButton>
              </div>
            </template>
          </UPageCard>
        </div>

        <div
          v-else
          class="mt-10 flex flex-col items-center gap-3 rounded-lg border border-default py-16 text-center"
        >
          <UIcon
            name="i-lucide-briefcase"
            class="size-8 text-dimmed"
          />
          <p class="text-muted">
            {{ t('jobs.empty') }}
          </p>
        </div>

        <p class="mt-10 text-xs text-dimmed lg:hidden">
          {{ t('jobs.disclaimer') }}
        </p>
      </div>
    </UPage>
  </UContainer>
</template>
