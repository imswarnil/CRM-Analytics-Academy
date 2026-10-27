<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The interview question bank. Server-rendered on the Worker from Neon (not
 * prerendered — the bank changes as the community submits), cached at the
 * edge. Filters are plain links with query strings, so every filtered view is
 * a crawlable URL.
 */
interface Item {
  slug: string
  question: string
  excerpt: string
  type: string
  topic: string
  level: string
  company: string | null
  role: string | null
  community: boolean
  upvotes: number
}
interface Facet { key: string, count: number }
interface List {
  page: number
  pageSize: number
  total: number
  items: Item[]
  facets: { types: Facet[], topics: Facet[], companies: Facet[], levels: Facet[] }
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const query = computed(() => ({
  type: route.query.type || undefined,
  level: route.query.level || undefined,
  topic: route.query.topic || undefined,
  company: route.query.company || undefined,
  q: route.query.q || undefined,
  page: route.query.page || undefined
}))
const { data } = await useFetch<List>('/api/interview', { query, key: 'interview-list', watch: [query] })

const search = ref(String(route.query.q ?? ''))
function submitSearch() {
  navigateTo({ query: { ...route.query, q: search.value || undefined, page: undefined } })
}

// Topic slug → section title, from the course navigation.
const topicTitle = (slug: string) => {
  const hit = (navigation.value ?? []).find(m => String(m.path ?? '').replace(/^\/[a-z]{2}(?=\/)/, '').replace(/^\//, '') === slug)
  return hit ? String(hit.title) : slug.replace(/-/g, ' ')
}
const filterLink = (key: string, value?: string) => ({ query: { ...route.query, [key]: route.query[key] === value ? undefined : value, page: undefined } })
const active = (key: string, value: string) => route.query[key] === value
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.pageSize ?? 24))))

const title = computed(() => t('interview.seoTitle'))
const description = computed(() => t('interview.seoDesc', { n: data.value?.facets.types.reduce((s, f) => s + f.count, 0) ?? 0 }))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value, headline: t('interview.eyebrow'), spec: 'Q&A · FREE' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  trail: [{ name: t('interview.eyebrow'), path: '/interview-questions' }],
  extra: [{
    '@type': 'ItemList',
    'itemListElement': (data.value?.items ?? []).map((it, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': `${SITE.url}${localePath(`/interview-questions/${it.slug}`)}`,
      'name': it.question
    }))
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('interview.sheet', { n: data?.total ?? 0 })"
      :title="t('interview.title')"
      :lead="t('interview.lead')"
    >
      <div class="mt-6 flex flex-wrap gap-3">
        <UButton
          :to="localePath('/interview-questions/new')"
          icon="i-lucide-square-pen"
        >
          {{ t('interview.submit') }}
        </UButton>
        <UButton
          :to="localePath('/certification')"
          color="neutral"
          variant="outline"
          icon="i-lucide-timer"
        >
          {{ t('interview.practiceExam') }}
        </UButton>
        <ShareBar
          :title="t('interview.title')"
          :text="t('interview.shareText')"
        />
      </div>
    </BpPageHeader>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
      <!-- Filters -->
      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <form
          class="flex gap-2"
          role="search"
          @submit.prevent="submitSearch"
        >
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('interview.search')"
            class="w-full"
          />
        </form>
        <div
          v-for="group in [
            { key: 'type', label: t('interview.filters.type'), items: data?.facets.types ?? [], name: (k: string) => t(`interview.types.${k}`) },
            { key: 'level', label: t('interview.filters.level'), items: data?.facets.levels ?? [], name: (k: string) => t(`interview.levels.${k}`) },
            { key: 'topic', label: t('interview.filters.topic'), items: data?.facets.topics ?? [], name: topicTitle },
            { key: 'company', label: t('interview.filters.company'), items: data?.facets.companies ?? [], name: (k: string) => k }
          ]"
          v-show="group.items.length"
          :key="group.key"
        >
          <p class="mono-label mb-2">
            {{ group.label }}
          </p>
          <ul class="border-[1.5px] border-(--ink) bg-(--card)">
            <li
              v-for="f in group.items"
              :key="f.key"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="filterLink(group.key, f.key)"
                class="flex items-center justify-between gap-2 px-3 py-1.5 text-sm"
                :class="active(group.key, f.key) ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
                rel="nofollow"
              >
                <span class="truncate capitalize">{{ group.name(f.key) }}</span>
                <span class="font-mono text-[10px]">{{ f.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        <PromoSlot unit="square250" />
      </aside>

      <!-- Results -->
      <section>
        <p class="mono-label mb-4">
          {{ t('interview.results', { n: data?.total ?? 0 }) }}
          <NuxtLink
            v-if="Object.keys(route.query).length"
            :to="{ query: {} }"
            class="ms-3 text-(--signal) hover:underline"
          >{{ t('interview.clear') }}</NuxtLink>
        </p>
        <ol class="space-y-4">
          <template
            v-for="(it, i) in data?.items ?? []"
            :key="it.slug"
          >
            <li class="bp-card bp-card--hover">
              <NuxtLink
                :to="localePath(`/interview-questions/${it.slug}`)"
                class="group block p-5"
              >
                <div class="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.08em]">
                  <span class="border-[1.5px] border-(--signal) px-1.5 py-0.5 text-(--signal)">{{ t(`interview.types.${it.type}`) }}</span>
                  <span class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ t(`interview.levels.${it.level}`) }}</span>
                  <span class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ topicTitle(it.topic) }}</span>
                  <span
                    v-if="it.company"
                    class="border-[1.5px] border-(--ink) bg-(--ink) px-1.5 py-0.5 text-(--paper)"
                  >{{ it.company }}</span>
                  <span
                    v-if="it.community"
                    class="text-(--ink2)"
                  >· {{ t('interview.community') }}</span>
                  <span class="ms-auto flex items-center gap-1 text-(--ink2)"><UIcon
                    name="i-lucide-arrow-big-up"
                    class="size-3.5"
                  />{{ it.upvotes }}</span>
                </div>
                <h2 class="mt-3 text-lg font-extrabold tracking-[-0.01em] text-(--ink) group-hover:text-(--signal)">
                  {{ it.question }}
                </h2>
                <p class="mt-2 line-clamp-2 text-sm text-(--ink2)">
                  {{ it.excerpt }}
                </p>
              </NuxtLink>
            </li>
            <li v-if="i === 7">
              <PromoSlot unit="horizontal" />
            </li>
          </template>
        </ol>
        <p
          v-if="!data?.items?.length"
          class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-(--ink2)"
        >
          {{ t('interview.empty') }}
        </p>

        <nav
          v-if="pages > 1"
          class="mt-8 flex flex-wrap gap-1.5"
          aria-label="Pages"
        >
          <NuxtLink
            v-for="p in pages"
            :key="p"
            :to="{ query: { ...route.query, page: p === 1 ? undefined : p } }"
            class="flex size-9 items-center justify-center border-[1.5px] font-mono text-xs"
            :class="(data?.page ?? 1) === p ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
          >
            {{ p }}
          </NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>
