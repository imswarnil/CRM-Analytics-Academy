<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const title = computed(() => t('seo.showcaseTitle'))
const description = computed(() => t('seo.showcaseDesc'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

// The whole collection: these entries are small (frontmatter plus a write-up)
// and the page filters client-side, so one query at build time is enough.
const { data: entries } = await useAsyncData('showcase-list', () =>
  queryCollection('showcase').order('publishedAt', 'DESC').all()
)

const items = computed(() => entries.value ?? [])

type FilterKey = 'domain' | 'difficulty' | 'technique'

const selected = reactive<Record<FilterKey, string>>({
  domain: 'All',
  difficulty: 'All',
  technique: 'All'
})

/** Distinct values for a facet, in first-seen order, prefixed with "All". */
function facet(key: FilterKey): string[] {
  const seen = new Set<string>()
  for (const item of items.value) {
    if (key === 'technique') (item.techniques ?? []).forEach((v: string) => seen.add(v))
    else if (item[key]) seen.add(item[key] as string)
  }
  return ['All', ...[...seen].sort()]
}

const domains = computed(() => facet('domain'))
const difficulties = computed(() => facet('difficulty'))
const techniques = computed(() => facet('technique'))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matches(item: any, key: FilterKey, value: string): boolean {
  if (value === 'All') return true
  if (key === 'technique') return (item.techniques ?? []).includes(value)
  return item[key] === value
}

const filtered = computed(() =>
  items.value.filter(item =>
    (Object.keys(selected) as FilterKey[]).every(key => matches(item, key, selected[key]))
  )
)

const hasFilters = computed(() =>
  (Object.keys(selected) as FilterKey[]).some(key => selected[key] !== 'All')
)

function clearFilters() {
  selected.domain = 'All'
  selected.difficulty = 'All'
  selected.technique = 'All'
}

/** How many entries a facet value would leave, given the *other* filters. */
function countFor(key: FilterKey, value: string): number {
  return items.value.filter(item =>
    matches(item, key, value)
    && (Object.keys(selected) as FilterKey[]).every(k => k === key || matches(item, k, selected[k]))
  ).length
}

// Difficulty is a fixed vocabulary, so it can be translated; domains and
// techniques are contributor-supplied free text and stay as written.
// `difficulty` carries a zod default, but Nuxt Content still types it as
// optional, so both helpers accept undefined and fall back to the same
// "Intermediate" the schema would have applied.
const difficultyLabel = (value?: string) => {
  const key = (value || 'Intermediate').toLowerCase()
  return ['beginner', 'intermediate', 'advanced'].includes(key) ? t(`showcase.${key}`) : String(value)
}

const badgeColor = (difficulty?: string) =>
  difficulty === 'Beginner' ? 'success' : difficulty === 'Advanced' ? 'error' : 'warning'

const groups = computed(() => [
  { key: 'domain' as const, label: t('showcase.domain'), icon: 'i-lucide-briefcase', values: domains.value },
  { key: 'difficulty' as const, label: t('showcase.difficulty'), icon: 'i-lucide-signal', values: difficulties.value },
  { key: 'technique' as const, label: t('showcase.technique'), icon: 'i-lucide-wrench', values: techniques.value }
])

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/showcase`,
  'hasPart': items.value.map(item => ({
    '@type': 'CreativeWork',
    'name': item.title,
    'description': item.description,
    'url': `${SITE.url}${item.path}`,
    'author': { '@type': 'Person', 'name': item.author }
  }))
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b-[3px] border-(--nb-ink) bg-(--nb-hero)">
      <div
        class="absolute -top-20 -right-20 size-56 rounded-full border-4 border-(--nb-ink) bg-(--nb-hero-shape)"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-24 -left-24 size-64 rounded-full border-4 border-(--nb-ink) bg-(--nb-hero-shape-2)"
        aria-hidden="true"
      />
      <UContainer class="relative py-14 text-center sm:py-16">
        <UBadge
          size="lg"
          class="mb-5 rounded-full border-[3px] border-(--nb-ink) bg-brand-yellow px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-ink uppercase"
        >
          <UIcon
            name="i-lucide-layout-dashboard"
            class="mr-1 size-4"
          />
          {{ t('showcase.title') }}
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          {{ t('showcase.title') }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
          {{ t('showcase.subtitle') }}
        </p>
        <UButton
          to="https://github.com/imswarnil/CRM-Analytics-Academy/tree/main/content/showcase"
          target="_blank"
          icon="i-lucide-plus"
          color="primary"
          variant="subtle"
          class="mt-6 rounded-full font-medium"
        >
          {{ t('showcase.submit') }}
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-14">
      <div class="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <div
            v-for="group in groups"
            :key="group.key"
            class="mb-6"
          >
            <p class="mb-3 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-muted">
              <UIcon
                :name="group.icon"
                class="size-3.5"
              />
              {{ group.label }}
            </p>
            <ul class="space-y-1">
              <li
                v-for="value in group.values"
                :key="value"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition"
                  :class="selected[group.key] === value
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-toned hover:bg-muted/50 hover:text-highlighted'"
                  @click="selected[group.key] = value"
                >
                  <span class="grow text-left">
                    {{ value === 'All' ? t('showcase.all') : (group.key === 'difficulty' ? difficultyLabel(value) : value) }}
                  </span>
                  <span class="text-xs text-muted">{{ countFor(group.key, value) }}</span>
                </button>
              </li>
            </ul>
          </div>

          <UButton
            v-if="hasFilters"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            class="ml-1"
            @click="clearFilters"
          >
            {{ t('showcase.clearFilters') }}
          </UButton>
        </aside>

        <div>
          <p class="mb-6 text-sm text-muted">
            <span class="font-medium text-highlighted">{{ filtered.length }}</span> {{ t('showcase.results') }}
          </p>

          <div
            v-if="filtered.length"
            class="grid content-start gap-6 sm:grid-cols-2"
          >
            <NuxtLink
              v-for="item in filtered"
              :key="item.path"
              :to="localePath(item.path)"
              class="nb-card group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5"
            >
              <div class="aspect-video overflow-hidden border-b-[3px] border-(--nb-ink) bg-(--nb-subtle)">
                <NuxtImg
                  :src="item.image"
                  :alt="item.title"
                  loading="lazy"
                  width="600"
                  height="338"
                  class="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div class="flex grow flex-col p-5">
                <div class="mb-3 flex flex-wrap items-center gap-2">
                  <UBadge
                    v-if="item.domain"
                    :label="item.domain"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                    class="rounded-full"
                  />
                  <UBadge
                    :label="difficultyLabel(item.difficulty)"
                    :color="badgeColor(item.difficulty)"
                    variant="subtle"
                    size="sm"
                    class="rounded-full"
                  />
                </div>

                <h3 class="flex items-center gap-1 font-semibold text-highlighted">
                  {{ item.title }}
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-4 text-dimmed transition group-hover:text-primary"
                  />
                </h3>
                <p class="mt-2 grow text-sm text-muted">
                  {{ item.description }}
                </p>

                <p class="mt-4 text-xs text-dimmed">
                  {{ t('showcase.by') }} {{ item.author }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <div
            v-else
            class="rounded-2xl border-[3px] border-dashed border-(--nb-ink) p-12 text-center"
          >
            <UIcon
              name="i-lucide-search-x"
              class="mx-auto size-8 text-dimmed"
            />
            <p class="mt-3 text-sm text-muted">
              {{ t('showcase.noResults') }}
            </p>
            <UButton
              color="neutral"
              variant="subtle"
              size="sm"
              class="mt-4"
              @click="clearFilters"
            >
              {{ t('showcase.clearFilters') }}
            </UButton>
          </div>

          <div class="nb-card mt-10 bg-(--nb-subtle) p-6 text-center">
            <p class="font-semibold text-highlighted">
              {{ t('showcase.submit') }}
            </p>
            <p class="mx-auto mt-2 max-w-xl text-sm text-muted">
              {{ t('showcase.submitHint') }}
            </p>
            <UButton
              :to="localePath('/contribute')"
              icon="i-lucide-git-pull-request"
              color="primary"
              variant="subtle"
              size="sm"
              class="mt-4 rounded-full"
            >
              {{ t('nav.contribute') }}
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
