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

const dateFormat = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))
const formatDate = (iso: string) => dateFormat.value.format(new Date(iso))
const updatedLine = computed(() => jobsData.updatedAt ? t('jobs.updated', { date: formatDate(jobsData.updatedAt) }) : '')

const search = ref('')
const remoteOnly = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return jobs.filter((job) => {
    if (remoteOnly.value && !job.remote) return false
    if (!q) return true
    return [job.title, job.company, job.location].some(field => field.toLowerCase().includes(q))
  })
})

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
</script>

<template>
  <UContainer class="py-12 sm:py-16">
    <div class="mx-auto max-w-3xl">
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
        class="mt-2 text-sm text-dimmed"
      >
        {{ updatedLine }}
      </p>

      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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

      <p class="mt-6 text-sm text-muted">
        {{ t('jobs.count', { count: filtered.length }) }}
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

      <p class="mt-10 text-xs text-dimmed">
        {{ t('jobs.disclaimer') }}
      </p>
    </div>
  </UContainer>
</template>
