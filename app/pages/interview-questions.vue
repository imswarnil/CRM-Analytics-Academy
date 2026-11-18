<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The interview question bank — the parent of every /interview-questions/*
 * route. The list, grouped by course section (in course order) and filterable
 * by type, level, company and text, stays on screen; a question opens in a
 * drawer over it (the child route, interview-questions/[slug].vue) with its
 * own permalink, so a shared link opens the same question in the same
 * collection, filters and all. /interview-questions/new is a child too but
 * renders on its own.
 *
 * Prerendered in every locale; upvote counts load in the browser.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const { data: rows } = await useInterviewRows()
const slugOf = (p: string) => p.split('/').pop()!

const standalone = computed(() => String(route.name ?? '').startsWith('interview-questions-new'))
const openSlug = computed(() => (String(route.name ?? '').startsWith('interview-questions-slug') ? String(route.params.slug ?? '') : ''))

// Section order and titles from the course navigation.
const sections = computed(() => (navigation.value ?? []).map(m => ({
  key: String(m.path ?? '').replace(/^\/[a-z]{2}(?=\/)/, '').replace(/^\//, ''),
  title: String(m.title ?? '')
})))
const sectionTitle = (key: string) => sections.value.find(s => s.key === key)?.title ?? key.replace(/-/g, ' ')

// Filters live in the URL so a filtered view — and a question opened from
// it — can be shared.
const type = ref(String(route.query.type ?? ''))
const topic = ref(String(route.query.topic ?? ''))
// List or cards — remembered per browser, overridable by ?view=.
const view = ref<'list' | 'grid'>(route.query.view === 'grid' ? 'grid' : 'list')
onMounted(() => {
  if (!route.query.view) {
    try {
      if (localStorage.getItem('crma-iq-view') === 'grid') view.value = 'grid'
    } catch { /* storage blocked */ }
  }
})
watch(view, (v) => {
  try {
    localStorage.setItem('crma-iq-view', v)
  } catch { /* storage blocked */ }
})
const level = ref(String(route.query.level ?? ''))
const company = ref(String(route.query.company ?? ''))
const q = ref(String(route.query.q ?? ''))
const filterQuery = computed(() => ({ topic: topic.value || undefined, type: type.value || undefined, level: level.value || undefined, company: company.value || undefined, q: q.value || undefined }))
watch(filterQuery, query => navigateTo({ query }, { replace: true }))
const linkTo = (r: InterviewRow) => ({ path: localePath(`/interview-questions/${slugOf(r.path)}`), query: filterQuery.value })
// The open row's link closes it.
const rowTo = (r: InterviewRow) => (openSlug.value === slugOf(r.path) ? { path: localePath('/interview-questions'), query: filterQuery.value } : linkTo(r))

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (rows.value ?? []).filter(r =>
    (!topic.value || r.topic === topic.value)
    && (!type.value || r.type === type.value)
    && (!level.value || r.level === level.value)
    && (!company.value || r.company === company.value)
    && (!needle || `${r.title} ${r.description ?? ''}`.toLowerCase().includes(needle)))
})
const groups = computed(() => {
  const order = sections.value.map(s => s.key)
  const by = new Map<string, InterviewRow[]>()
  for (const r of filtered.value) by.set(r.topic, [...(by.get(r.topic) ?? []), r])
  return [...by.entries()]
    .sort((a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99))
    // Inside a section: junior → mid → senior, then by question.
    .map(([key, items]) => ({ key, title: sectionTitle(key), items: [...items].sort((a, b) => (LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)) || a.title.localeCompare(b.title)) }))
})
const LEVELS = ['junior', 'mid', 'senior']
// Topics in course order, for the filter.
const topics = computed(() => {
  const c = new Map<string, number>()
  for (const r of rows.value ?? []) c.set(r.topic, (c.get(r.topic) ?? 0) + 1)
  const order = sections.value.map(s => s.key)
  return [...c.entries()].sort((a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99))
})
// Every question's number in the current order (1, 2, 3 … across sections).
const numberOf = computed(() => new Map(groups.value.flatMap(g => g.items).map((r, i) => [r.path, i + 1])))
const facet = (key: 'type' | 'level' | 'company') => {
  const c = new Map<string, number>()
  for (const r of rows.value ?? []) if (r[key]) c.set(r[key]!, (c.get(r[key]!) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1])
}

// The open question's neighbours, in the order the list shows them.
const ordered = computed(() => groups.value.flatMap(g => g.items))
const neighbours = computed(() => {
  const i = ordered.value.findIndex(r => slugOf(r.path) === openSlug.value)
  return {
    prev: i > 0 ? ordered.value[i - 1] : null,
    next: i >= 0 && i < ordered.value.length - 1 ? ordered.value[i + 1] : null,
    position: i + 1,
    total: ordered.value.length
  }
})
const close = () => navigateTo({ path: localePath('/interview-questions'), query: filterQuery.value })
provide('interview-drawer', { neighbours, linkTo, close, sectionTitle })

function onKey(e: KeyboardEvent) {
  if (!openSlug.value || (e.target as HTMLElement | null)?.closest?.('input, textarea')) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight' && neighbours.value.next) navigateTo(linkTo(neighbours.value.next))
  else if (e.key === 'ArrowLeft' && neighbours.value.prev) navigateTo(linkTo(neighbours.value.prev))
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const { counts: votes, load: loadVotes } = useInterviewVotes()
onMounted(loadVotes)
const promoFree = usePromoFree()
const heroStats = computed(() => [
  { label: t('interview.statQuestions'), value: rows.value?.length ?? 0 },
  { label: t('interview.statTopics'), value: topics.value.length }
])
</script>

<template>
  <NuxtPage v-if="standalone" />
  <div v-else>
    <!-- Hero: the pitch on the left, one square unit on the right -->
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div class="max-w-2xl">
          <p class="eyebrow">
            {{ t('interview.sheet', { n: rows?.length ?? 0 }) }}
          </p>
          <h1 class="bp-h1 mt-3">
            {{ t('interview.title') }}
          </h1>
          <p class="bp-lead mt-4">
            {{ t('interview.lead') }}
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <UButton
              :to="localePath('/interview-questions/new')"
              icon="i-lucide-square-pen"
              size="lg"
            >
              {{ t('interview.submit') }}
            </UButton>
            <UButton
              :to="localePath('/certification')"
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-timer"
            >
              {{ t('interview.practiceExam') }}
            </UButton>
          </div>
        </div>
        <div class="hidden justify-center lg:flex">
          <ClientOnly>
            <PromoSlot
              v-if="!promoFree"
              unit="square300x250"
              class="!my-0"
            />
            <div
              v-else
              class="grid w-full grid-cols-2 gap-3"
            >
              <div
                v-for="st in heroStats"
                :key="st.label"
                class="rounded-[6px] border border-(--line) bg-(--paper) p-4"
              >
                <p class="text-2xl font-bold tabular-nums text-(--ink)">
                  {{ st.value }}
                </p>
                <p class="text-xs text-(--ink2)">
                  {{ st.label }}
                </p>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
      <!-- Filters -->
      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <UInput
          v-model="q"
          icon="i-lucide-search"
          size="lg"
          :placeholder="t('interview.search')"
          class="w-full"
        />
        <div class="flex rounded-[4px] bg-(--paper2) p-1">
          <button
            v-for="v in (['list', 'grid'] as const)"
            :key="v"
            type="button"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-[4px] py-1.5 text-sm font-semibold transition-colors"
            :class="view === v ? 'bg-(--card) text-(--ink)' : 'text-(--ink2) hover:text-(--ink)'"
            :aria-pressed="view === v"
            @click="view = v"
          >
            <UIcon
              :name="v === 'list' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
              class="size-4"
            />{{ t(`interview.view.${v}`) }}
          </button>
        </div>
        <div v-if="topics.length">
          <p class="mono-label mb-2">
            {{ t('interview.filters.topic') }}
          </p>
          <div class="flex flex-col gap-1">
            <button
              v-for="[k, n] in topics"
              :key="k"
              type="button"
              class="flex items-center justify-between gap-2 rounded-[4px] px-2.5 py-1.5 text-start text-[14px] transition-colors"
              :class="topic === k ? 'bg-(--ice) font-semibold text-(--signal)' : 'text-(--ink) hover:bg-(--paper2)'"
              @click="topic = topic === k ? '' : k"
            >
              <span class="truncate">{{ sectionTitle(k) }}</span><span class="font-mono text-xs opacity-60">{{ n }}</span>
            </button>
          </div>
        </div>
        <div
          v-for="group in [
            { key: 'type' as const, model: type, set: (v: string) => type = v, label: t('interview.filters.type'), name: (k: string) => t(`interview.types.${k}`) },
            { key: 'level' as const, model: level, set: (v: string) => level = v, label: t('interview.filters.level'), name: (k: string) => t(`interview.levels.${k}`) },
            { key: 'company' as const, model: company, set: (v: string) => company = v, label: t('interview.filters.company'), name: (k: string) => k }
          ]"
          v-show="facet(group.key).length"
          :key="group.key"
        >
          <p class="mono-label mb-2">
            {{ group.label }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="[k, n] in facet(group.key)"
              :key="k"
              type="button"
              class="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
              :class="group.model === k ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) bg-(--card) text-(--ink2) hover:border-(--signal)'"
              @click="group.set(group.model === k ? '' : k)"
            >
              {{ group.name(k) }} <span class="font-mono text-xs opacity-60">{{ n }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Questions, by section -->
      <div class="min-w-0 space-y-12">
        <p class="mono-label">
          {{ t('interview.results', { n: filtered.length }) }}
        </p>
        <!-- No question open: the index child, which only sets the list's SEO. -->
        <NuxtPage v-if="!openSlug" />
        <!-- An open question the filters hide still shows, above the list. -->
        <NuxtPage v-if="openSlug && !ordered.some(r => slugOf(r.path) === openSlug)" />
        <section
          v-for="(g, gi) in groups"
          :id="`topic-${g.key}`"
          :key="g.key"
          class="scroll-mt-24"
        >
          <h2 class="bp-h3 flex items-baseline gap-3">
            {{ g.title }}<span class="font-mono text-sm text-(--ink2)">{{ g.items.length }}</span>
          </h2>
          <ol
            class="mt-4"
            :class="view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'"
          >
            <li
              v-for="r in g.items"
              :key="r.path"
              class="bp-card bp-card--hover"
              :class="view === 'grid' && openSlug === slugOf(r.path) ? 'sm:col-span-2 xl:col-span-3' : ''"
            >
              <NuxtLink
                :to="rowTo(r)"
                class="group block p-5"
                :class="openSlug === slugOf(r.path) ? 'bg-(--ice)' : ''"
                :aria-current="openSlug === slugOf(r.path) ? 'page' : undefined"
                :aria-expanded="openSlug === slugOf(r.path)"
              >
                <div class="flex flex-wrap items-center gap-1.5 font-medium text-[11px]">
                  <span class="me-1 font-bold text-(--ink2)">#{{ numberOf.get(r.path) }}</span>
                  <span class="border border-(--signal) px-1.5 py-0.5 text-(--signal)">{{ t(`interview.types.${r.type}`) }}</span>
                  <span class="border border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ t(`interview.levels.${r.level}`) }}</span>
                  <span
                    v-if="r.company"
                    class="border border-(--line) bg-(--ink) px-1.5 py-0.5 text-(--paper)"
                  >{{ r.company }}</span>
                  <span
                    v-if="r.source === 'community'"
                    class="text-(--ink2)"
                  >· {{ t('interview.community') }}</span>
                  <span class="ms-auto flex items-center gap-1 text-(--ink2)"><UIcon
                    name="i-lucide-arrow-big-up"
                    class="size-4"
                  />{{ votes[slugOf(r.path)] ?? 0 }}</span>
                </div>
                <h3
                  class="mt-3 font-bold leading-snug text-(--ink) group-hover:text-(--signal)"
                  :class="view === 'grid' ? 'text-lg' : 'text-xl'"
                >
                  {{ r.title }}
                </h3>
                <p
                  class="mt-2 leading-relaxed text-(--ink2)"
                  :class="view === 'grid' ? 'line-clamp-3 text-[15px]' : 'line-clamp-2 text-[17px]'"
                >
                  {{ r.description }}
                </p>
              </NuxtLink>
              <!-- The open question expands here, under its own row. -->
              <NuxtPage v-if="openSlug === slugOf(r.path)" />
            </li>
          </ol>
          <PromoSlot
            v-if="gi % 3 === 1"
            unit="horizontal"
          />
        </section>
        <p
          v-if="!filtered.length"
          class="border border-dashed border-(--line) p-8 text-center text-(--ink2)"
        >
          {{ t('interview.empty') }}
        </p>
        <!-- Share, after the content -->
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-(--line) bg-(--card) px-5 py-4">
          <p class="font-semibold text-(--ink)">
            {{ t('interview.shareTitle') }}
          </p>
          <ShareBar
            :title="t('interview.title')"
            :text="t('interview.shareText')"
            compact
          />
        </div>
      </div>
    </div>
  </div>
</template>
