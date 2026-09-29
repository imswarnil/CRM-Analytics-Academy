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
    <BpPageHeader
      :sheet="`Sheet 05 / Showcase / ${items.length} dashboards`"
      :title="t('showcase.title')"
      :lead="t('showcase.subtitle')"
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="https://github.com/imswarnil/CRM-Analytics-Academy/tree/main/content/showcase"
          target="_blank"
          icon="i-lucide-plus"
        >
          {{ t('showcase.submit') }}
        </UButton>
        <UButton
          :to="localePath('/contribute')"
          icon="i-lucide-git-pull-request"
          color="neutral"
          variant="outline"
        >
          {{ t('nav.contribute') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside class="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <div
            v-for="group in groups"
            :key="group.key"
            class="mb-6 border-[1.5px] border-(--ink) bg-(--card)"
          >
            <p class="flex items-center gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink)">
              <UIcon
                :name="group.icon"
                class="size-3.5 text-(--signal)"
              />
              {{ group.label }}
            </p>
            <ul>
              <li
                v-for="value in group.values"
                :key="value"
                class="border-b border-dashed border-(--line) last:border-b-0"
              >
                <button
                  type="button"
                  class="relative flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                  :class="selected[group.key] === value
                    ? 'bg-(--ice) font-bold text-(--signal)'
                    : 'text-(--ink) hover:bg-(--ice)/50'"
                  @click="selected[group.key] = value"
                >
                  <span
                    v-if="selected[group.key] === value"
                    class="absolute inset-y-0 start-0 w-[3px] bg-(--signal)"
                  />
                  <span class="grow text-start">
                    {{ value === 'All' ? t('showcase.all') : (group.key === 'difficulty' ? difficultyLabel(value) : value) }}
                  </span>
                  <span class="font-mono text-[10px] text-(--ink2)">{{ countFor(group.key, value) }}</span>
                </button>
              </li>
            </ul>
          </div>

          <UButton
            v-if="hasFilters"
            icon="i-lucide-x"
            color="neutral"
            variant="outline"
            size="sm"
            @click="clearFilters"
          >
            {{ t('showcase.clearFilters') }}
          </UButton>
        </aside>

        <div>
          <p class="mono-label mb-6">
            {{ filtered.length }} {{ t('showcase.results') }}
          </p>

          <div
            v-if="filtered.length"
            class="grid content-start gap-6 sm:grid-cols-2"
          >
            <NuxtLink
              v-for="(item, n) in filtered"
              :key="item.path"
              :to="localePath(item.path)"
              class="bp-card bp-card--hover group flex flex-col"
            >
              <BpShowcaseThumb
                :image="item.image"
                :alt="item.title"
                :seed="item.path"
              />

              <div class="flex grow flex-col p-5">
                <p class="eyebrow">
                  Fig. {{ String(n + 1).padStart(2, '0') }} — {{ item.domain || 'Dashboard' }}
                </p>
                <h3 class="mt-2 flex items-start gap-1 text-lg font-extrabold tracking-[-0.02em] text-(--ink) group-hover:text-(--signal)">
                  {{ item.title }}
                </h3>
                <p class="mt-2 grow text-sm text-(--ink2)">
                  {{ item.description }}
                </p>

                <div class="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-(--line) pt-3">
                  <span class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">{{ t('showcase.by') }} {{ item.author }}</span>
                  <span
                    class="border-[1.5px] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
                    :class="item.difficulty === 'Advanced' ? 'border-(--ink) bg-(--ink) text-(--paper)' : item.difficulty === 'Beginner' ? 'border-(--signal) text-(--signal)' : 'border-(--ink) text-(--ink)'"
                  >{{ difficultyLabel(item.difficulty) }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div
            v-else
            class="border-[1.5px] border-dashed border-(--ink2) p-12 text-center"
          >
            <UIcon
              name="i-lucide-search-x"
              class="mx-auto size-8 text-(--ink2)"
            />
            <p class="mt-3 text-sm text-(--ink2)">
              {{ t('showcase.noResults') }}
            </p>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-4"
              @click="clearFilters"
            >
              {{ t('showcase.clearFilters') }}
            </UButton>
          </div>

          <div class="graph-paper-navy mt-12 border-[1.5px] border-(--ink) bg-(--navy) p-8 text-white">
            <p class="eyebrow text-(--glow)!">
              Submit
            </p>
            <p class="mt-2 text-2xl font-extrabold tracking-[-0.02em]">
              {{ t('showcase.submit') }}
            </p>
            <p class="mt-2 max-w-xl text-sm text-white/80">
              {{ t('showcase.submitHint') }}
            </p>
            <UButton
              :to="localePath('/contribute')"
              icon="i-lucide-git-pull-request"
              color="secondary"
              class="mt-5"
            >
              {{ t('nav.contribute') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
