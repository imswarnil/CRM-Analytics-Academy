<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

// The collection is not localized, so the slug maps straight to the content
// path regardless of which locale prefix the visitor arrived under.
const slug = computed(() => String(route.params.slug))

const { data: entry } = await useAsyncData(`showcase-${slug.value}`, () =>
  queryCollection('showcase').path(`/showcase/${slug.value}`).first()
)

if (!entry.value) {
  throw createError({ statusCode: 404, statusMessage: 'Dashboard not found', fatal: true })
}

const title = entry.value.title
const description = entry.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: () => `${SITE.url}${entry.value?.image}`
})
defineOgImage('Docs', { title, description, headline: t('showcase.title') })

// `difficulty` carries a zod default, but Nuxt Content still types it as
// optional, so both helpers accept undefined and fall back to the same
// "Intermediate" the schema would have applied.
const difficultyLabel = (value?: string) => {
  const key = (value || 'Intermediate').toLowerCase()
  return ['beginner', 'intermediate', 'advanced'].includes(key) ? t(`showcase.${key}`) : String(value)
}

const badgeColor = (difficulty?: string) =>
  difficulty === 'Beginner' ? 'success' : difficulty === 'Advanced' ? 'error' : 'warning'

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  'name': title,
  'description': description,
  'url': `${SITE.url}/showcase/${slug.value}`,
  'image': `${SITE.url}${entry.value.image}`,
  'author': { '@type': 'Person', 'name': entry.value.author },
  'datePublished': entry.value.publishedAt,
  'isPartOf': { '@type': 'CollectionPage', 'name': t('showcase.title'), 'url': `${SITE.url}/showcase` },
  'keywords': (entry.value.techniques ?? []).join(', ')
})
</script>

<template>
  <UContainer
    v-if="entry"
    class="py-10 sm:py-14"
  >
    <UButton
      :to="localePath('/showcase')"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      size="sm"
      class="mb-6"
    >
      {{ t('showcase.back') }}
    </UButton>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <UBadge
        v-if="entry.domain"
        :label="entry.domain"
        color="neutral"
        variant="subtle"
        class="rounded-full"
      />
      <UBadge
        :label="difficultyLabel(entry.difficulty)"
        :color="badgeColor(entry.difficulty)"
        variant="subtle"
        class="rounded-full"
      />
    </div>

    <h1 class="text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
      {{ entry.title }}
    </h1>
    <p class="mt-3 max-w-3xl text-lg text-muted">
      {{ entry.description }}
    </p>

    <p class="mt-4 text-sm text-dimmed">
      {{ t('showcase.by') }}
      <NuxtLink
        v-if="entry.authorUrl"
        :to="entry.authorUrl"
        target="_blank"
        rel="noopener"
        class="font-medium text-toned hover:text-primary"
      >
        {{ entry.author }}
      </NuxtLink>
      <span
        v-else
        class="font-medium text-toned"
      >{{ entry.author }}</span>
      <span v-if="entry.publishedAt"> · {{ t('showcase.published') }} {{ entry.publishedAt }}</span>
    </p>

    <!-- The screenshot is the point of the page, so it leads. -->
    <div class="mt-8 overflow-hidden rounded-2xl border border-default bg-muted/40">
      <NuxtImg
        :src="entry.image"
        :alt="entry.title"
        width="1200"
        height="675"
        class="w-full"
      />
    </div>

    <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
      <div class="min-w-0">
        <!-- KPIs: the table people actually come here for. -->
        <section v-if="entry.kpis?.length">
          <h2 class="text-xl font-bold text-highlighted">
            {{ t('showcase.kpis') }}
          </h2>
          <div class="mt-4 overflow-x-auto rounded-xl border border-default">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="bg-elevated/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th class="px-4 py-3 font-semibold">
                    {{ t('showcase.kpiName') }}
                  </th>
                  <th class="px-4 py-3 font-semibold">
                    {{ t('showcase.kpiFormula') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="kpi in entry.kpis"
                  :key="kpi.name"
                  class="border-t border-default align-top"
                >
                  <td class="px-4 py-3 font-medium text-highlighted">
                    {{ kpi.name }}
                  </td>
                  <td class="px-4 py-3">
                    <code class="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-toned">{{ kpi.formula }}</code>
                    <p
                      v-if="kpi.note"
                      class="mt-2 text-xs text-muted"
                    >
                      {{ kpi.note }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Build steps. -->
        <section
          v-if="entry.recipe?.length"
          class="mt-10"
        >
          <h2 class="text-xl font-bold text-highlighted">
            {{ t('showcase.recipe') }}
          </h2>
          <ol class="mt-4 space-y-4">
            <li
              v-for="(item, index) in entry.recipe"
              :key="item.step"
              class="flex gap-4"
            >
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="font-medium text-highlighted">
                  {{ item.step }}
                </p>
                <p
                  v-if="item.detail"
                  class="mt-1 text-sm text-muted"
                >
                  {{ item.detail }}
                </p>
              </div>
            </li>
          </ol>
        </section>

        <!-- The contributor's own write-up. -->
        <section class="mt-10">
          <div class="prose prose-primary max-w-none dark:prose-invert">
            <ContentRenderer :value="entry" />
          </div>
        </section>

        <AdUnit placement="endOfArticle" />
      </div>

      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div
          v-if="entry.datasets?.length"
          class="rounded-xl border border-default p-4"
        >
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            {{ t('showcase.datasets') }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="dataset in entry.datasets"
              :key="dataset"
              :label="dataset"
              color="neutral"
              variant="subtle"
              size="sm"
              class="rounded-full"
            />
          </div>
        </div>

        <div
          v-if="entry.techniques?.length"
          class="rounded-xl border border-default p-4"
        >
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            {{ t('showcase.techniques') }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="technique in entry.techniques"
              :key="technique"
              :label="technique"
              color="primary"
              variant="subtle"
              size="sm"
              class="rounded-full"
            />
          </div>
        </div>

        <AdUnit
          placement="sidebarSquare"
          class="w-full"
        />
      </aside>
    </div>
  </UContainer>
</template>
