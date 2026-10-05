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
  'isPartOf': { '@type': 'CollectionPage', 'name': t('showcase.title'), 'url': `${SITE.url}/showcase` },
  'keywords': (entry.value.techniques ?? []).join(', ')
})
</script>

<template>
  <div v-if="entry">
    <header class="graph-paper border-b-[1.5px] border-(--ink)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <NuxtLink
          :to="localePath('/showcase')"
          class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2) hover:text-(--signal)"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-3.5 rtl:rotate-180"
          />
          {{ t('showcase.back') }}
        </NuxtLink>

        <!-- The screenshot is the point of the page, so it leads. -->
        <div class="mt-6 border-[1.5px] border-(--ink) bg-(--card) shadow-[6px_6px_0_var(--ink)]">
          <BpShowcaseThumb
            :image="entry.image"
            :alt="entry.title"
            :width="1200"
            eager
          />
        </div>

        <p class="eyebrow mt-10">
          {{ entry.domain || t('showcase.dashboard') }} · {{ difficultyLabel(entry.difficulty) }}
        </p>
        <h1 class="bp-h2 mt-3 max-w-4xl text-(--ink)">
          {{ entry.title }}
        </h1>
        <p class="bp-lead mt-4 max-w-3xl">
          {{ entry.description }}
        </p>

        <p class="mt-5 font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">
          {{ t('showcase.by') }}
          <NuxtLink
            v-if="entry.authorUrl"
            :to="entry.authorUrl"
            target="_blank"
            rel="noopener"
            class="font-semibold text-(--ink) hover:text-(--signal)"
          >
            {{ entry.author }}
          </NuxtLink>
          <span
            v-else
            class="font-semibold text-(--ink)"
          >{{ entry.author }}</span>
          <span v-if="entry.publishedAt"> · {{ t('showcase.published') }} {{ entry.publishedAt }}</span>
        </p>
      </div>
    </header>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div class="min-w-0">
          <!-- KPIs: the table people actually come here for. -->
          <section v-if="entry.kpis?.length">
            <p class="eyebrow">
              § 1
            </p>
            <h2 class="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
              {{ t('showcase.kpis') }}
            </h2>
            <div class="mt-5 overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)">
              <table class="w-full min-w-[560px] text-start text-sm">
                <thead class="border-b-[1.5px] border-(--ink) bg-(--ice) font-mono text-[10px] uppercase tracking-[.1em] text-(--ink)">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">
                      {{ t('showcase.kpiName') }}
                    </th>
                    <th class="px-4 py-3 text-start font-semibold">
                      {{ t('showcase.kpiFormula') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="kpi in entry.kpis"
                    :key="kpi.name"
                    class="border-t border-dashed border-(--line) align-top first:border-t-0"
                  >
                    <td class="px-4 py-3 font-semibold text-(--ink)">
                      {{ kpi.name }}
                    </td>
                    <td class="px-4 py-3">
                      <code class="border border-(--line) bg-(--paper) px-1.5 py-0.5 font-mono text-xs text-(--ink)">{{ kpi.formula }}</code>
                      <p
                        v-if="kpi.note"
                        class="mt-2 text-xs text-(--ink2)"
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
            class="mt-12"
          >
            <p class="eyebrow">
              § 2
            </p>
            <h2 class="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
              {{ t('showcase.recipe') }}
            </h2>
            <ol class="mt-5 border-s-[1.5px] border-(--ink)">
              <li
                v-for="(item, index) in entry.recipe"
                :key="item.step"
                class="relative flex gap-4 py-3 ps-6"
              >
                <span class="absolute -start-[15px] top-3 flex size-7 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) font-mono text-[11px] font-semibold text-white">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <div class="min-w-0 ps-2">
                  <p class="font-semibold text-(--ink)">
                    {{ item.step }}
                  </p>
                  <p
                    v-if="item.detail"
                    class="mt-1 text-sm text-(--ink2)"
                  >
                    {{ item.detail }}
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <!-- The contributor's own write-up. -->
          <section class="bp-prose mt-12">
            <ContentRenderer :value="entry" />
          </section>

          <PromoSlot placement="endOfArticle" />
        </div>

        <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div
            v-if="entry.datasets?.length"
            class="border-[1.5px] border-(--ink) bg-(--card)"
          >
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              {{ t('showcase.datasets') }}
            </p>
            <ul class="p-2">
              <li
                v-for="dataset in entry.datasets"
                :key="dataset"
                class="flex items-center gap-2 px-2 py-1.5 font-mono text-xs text-(--ink)"
              >
                <UIcon
                  name="i-lucide-database"
                  class="size-3.5 text-(--signal)"
                />
                {{ dataset }}
              </li>
            </ul>
          </div>

          <div
            v-if="entry.techniques?.length"
            class="border-[1.5px] border-(--ink) bg-(--card)"
          >
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              {{ t('showcase.techniques') }}
            </p>
            <div class="flex flex-wrap gap-1.5 p-3">
              <span
                v-for="technique in entry.techniques"
                :key="technique"
                class="border-[1.5px] border-(--signal) px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-(--signal)"
              >{{ technique }}</span>
            </div>
          </div>

          <PromoSlot
            placement="sidebarSquare"
            class="w-full"
          />
        </aside>
      </div>
    </div>
  </div>
</template>
