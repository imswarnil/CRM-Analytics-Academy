<script setup lang="ts">
/**
 * Home → "New CRM Analytics jobs this week": the four newest postings from
 * public/jobs.json, and a link to /jobs. Renders nothing until the feed has
 * postings, so the home page never shows an empty block.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { data: feed } = useJobs()
const latest = computed(() => [...(feed.value?.jobs ?? [])].sort((a, b) => b.posted.localeCompare(a.posted)).slice(0, 4))
</script>

<template>
  <ClientOnly>
    <section
      v-if="latest.length"
      class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8"
    >
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">
            {{ t('jobs.eyebrow') }}
          </p>
          <h2 class="bp-h2 mt-3">
            {{ t('jobs.homeTitle') }}
          </h2>
        </div>
        <UButton
          :to="localePath('/jobs')"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('jobs.all') }}
        </UButton>
      </div>
      <ul class="mt-8 grid gap-3 md:grid-cols-2">
        <li
          v-for="j in latest"
          :key="j.id"
        >
          <a
            :href="j.url"
            target="_blank"
            rel="noopener nofollow"
            class="bp-card bp-card--hover flex items-center gap-4 p-5"
          >
            <span class="bp-iconbox">
              <UIcon
                name="i-lucide-briefcase-business"
                class="size-5"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-bold text-(--ink)">{{ j.title }}</span>
              <span class="block truncate text-sm text-(--ink2)">{{ j.company }} · {{ j.location }}</span>
            </span>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 shrink-0 text-(--signal)"
            />
          </a>
        </li>
      </ul>
    </section>
  </ClientOnly>
</template>
