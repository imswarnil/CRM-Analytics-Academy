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

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  'name': title,
  'description': description,
  'url': `${SITE.url}/showcase/${slug.value}`,
  'image': `${SITE.url}${entry.value.image}`,
  'author': { '@type': 'Person', 'name': entry.value.author },
  'datePublished': entry.value.publishedAt,
  'isPartOf': { '@type': 'CollectionPage', 'name': t('showcase.title'), 'url': `${SITE.url}/showcase` }
})
</script>

<template>
  <div
    v-if="entry"
    class="container  py-10 sm:py-14"
  >
    <UiButton
      variant="ghost"
      :to="localePath('/showcase')"
      icon="i-lucide-arrow-left"
      class="mb-6"
      size="sm"
    >
      {{ t('showcase.back') }}
    </UiButton>

    <div class="mb-4 is-flex is-flex-wrap-wrap is-align-items-center gap-2">
      <UiBadge
        v-if="entry.domain"
        tone="neutral"
        :label="entry.domain"
        class="rounded-full"
      />
      <UiBadge
        tone="neutral"
        :label="difficultyLabel(entry.difficulty)"
        class="rounded-full"
      />
    </div>

    <h1 class="is-size-3 has-text-weight-bold has-text-weight-semibold is-size-2-tablet">
      {{ entry.title }}
    </h1>
    <p class="mt-3 max-w-3xl is-size-5 has-text-grey">
      {{ entry.description }}
    </p>

    <p class="mt-4 is-size-7 has-text-grey-light">
      {{ t('showcase.by') }}
      <NuxtLink
        v-if="entry.authorUrl"
        :to="entry.authorUrl"
        target="_blank"
        rel="noopener"
        class="has-text-weight-medium has-text-grey-dark hover:text-primary"
      >
        {{ entry.author }}
      </NuxtLink>
      <span
        v-else
        class="has-text-weight-medium has-text-grey-dark"
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
        class="is-fullwidth"
      />
    </div>

    <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
      <div class="min-w-0">
        <!-- KPIs: the table people actually come here for. -->
        <section v-if="entry.kpis?.length">
          <h2 class="title is-3 is-size-5  has-text-weight-semibold">
            {{ t('showcase.kpis') }}
          </h2>
          <div class="mt-4 overflow-x-auto rounded-xl border border-default">
            <table class="is-fullwidth min-w-[560px] has-text-left is-size-7">
              <thead class="bg-elevated/60 is-size-7 is-uppercase has-text-grey">
                <tr>
                  <th class="px-4 py-3 has-text-weight-semibold">
                    {{ t('showcase.kpiName') }}
                  </th>
                  <th class="px-4 py-3 has-text-weight-semibold">
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
                  <td class="px-4 py-3 has-text-weight-medium has-text-weight-semibold">
                    {{ kpi.name }}
                  </td>
                  <td class="px-4 py-3">
                    <code class="rounded bg-muted/60 px-1.5 py-0.5 is-family-monospace is-size-7 has-text-grey-dark">{{ kpi.formula }}</code>
                    <p
                      v-if="kpi.note"
                      class="mt-2 is-size-7 has-text-grey"
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
          <h2 class="title is-3 is-size-5  has-text-weight-semibold">
            {{ t('showcase.recipe') }}
          </h2>
          <ol class="mt-4 space-y-4">
            <li
              v-for="(item, index) in entry.recipe"
              :key="item.step"
              class="is-flex gap-4"
            >
              <span class="is-flex size-7 shrink-0 is-align-items-center is-justify-content-center rounded-full bg-primary/10 is-size-7 has-text-weight-semibold has-text-primary ring-1 ring-primary/20">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="has-text-weight-medium has-text-weight-semibold">
                  {{ item.step }}
                </p>
                <p
                  v-if="item.detail"
                  class="mt-1 is-size-7 has-text-grey"
                >
                  {{ item.detail }}
                </p>
              </div>
            </li>
          </ol>
        </section>

        <!-- The contributor's own write-up. -->
        <section class="mt-10">
          <div class="content prose-primary max-w-none dark:prose-invert">
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
          <p class="mb-3 is-size-7 has-text-weight-semibold is-uppercase has-text-grey">
            {{ t('showcase.datasets') }}
          </p>
          <div class="is-flex is-flex-wrap-wrap gap-1.5">
            <UiBadge
              v-for="dataset in entry.datasets"
              :key="dataset"
              tone="neutral"
              :label="dataset"
              class="rounded-full"
              size="sm"
            />
          </div>
        </div>

        <div
          v-if="entry.techniques?.length"
          class="rounded-xl border border-default p-4"
        >
          <p class="mb-3 is-size-7 has-text-weight-semibold is-uppercase has-text-grey">
            {{ t('showcase.techniques') }}
          </p>
          <div class="is-flex is-flex-wrap-wrap gap-1.5">
            <UiBadge
              v-for="technique in entry.techniques"
              :key="technique"
              tone="brand"
              :label="technique"
              class="rounded-full"
              size="sm"
            />
          </div>
        </div>

        <AdUnit
          placement="sidebarSquare"
          class="is-fullwidth"
        />
      </aside>
    </div>
  </div>
</template>
