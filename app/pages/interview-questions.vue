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
const level = ref(String(route.query.level ?? ''))
const company = ref(String(route.query.company ?? ''))
const q = ref(String(route.query.q ?? ''))
const filterQuery = computed(() => ({ type: type.value || undefined, level: level.value || undefined, company: company.value || undefined, q: q.value || undefined }))
watch(filterQuery, query => navigateTo({ query }, { replace: true }))
const linkTo = (r: InterviewRow) => ({ path: localePath(`/interview-questions/${slugOf(r.path)}`), query: filterQuery.value })

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (rows.value ?? []).filter(r =>
    (!type.value || r.type === type.value)
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
    .map(([key, items]) => ({ key, title: sectionTitle(key), items }))
})
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

const votes = ref<Record<string, number>>({})
onMounted(async () => {
  const res = await $fetch<{ counts: Record<string, number> }>('/api/interview/votes').catch(() => null)
  if (res) votes.value = res.counts
})
</script>

<template>
  <NuxtPage v-if="standalone" />
  <div v-else>
    <BpPageHeader
      :sheet="t('interview.sheet', { n: rows?.length ?? 0 })"
      :title="t('interview.title')"
      :lead="t('interview.lead')"
    >
      <div class="mt-6 flex flex-wrap items-center gap-3">
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
        <ShareBar
          :title="t('interview.title')"
          :text="t('interview.shareText')"
        />
      </div>
    </BpPageHeader>

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
              class="border-[1.5px] px-3 py-1.5 text-[15px] font-semibold"
              :class="group.model === k ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
              @click="group.set(group.model === k ? '' : k)"
            >
              {{ group.name(k) }} <span class="font-mono text-xs opacity-60">{{ n }}</span>
            </button>
          </div>
        </div>
        <PromoSlot unit="square250" />
      </aside>

      <!-- Questions, by section -->
      <div class="min-w-0 space-y-12">
        <p class="mono-label">
          {{ t('interview.results', { n: filtered.length }) }}
        </p>
        <section
          v-for="(g, gi) in groups"
          :id="`topic-${g.key}`"
          :key="g.key"
          class="scroll-mt-24"
        >
          <h2 class="bp-h3 flex items-baseline gap-3">
            {{ g.title }}<span class="font-mono text-sm text-(--ink2)">{{ g.items.length }}</span>
          </h2>
          <ol class="mt-4 space-y-3">
            <li
              v-for="r in g.items"
              :key="r.path"
              class="bp-card bp-card--hover"
            >
              <NuxtLink
                :to="linkTo(r)"
                class="group block p-5"
                :class="openSlug === slugOf(r.path) ? 'bg-(--ice)' : ''"
                :aria-current="openSlug === slugOf(r.path) ? 'page' : undefined"
              >
                <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.08em]">
                  <span class="border-[1.5px] border-(--signal) px-1.5 py-0.5 text-(--signal)">{{ t(`interview.types.${r.type}`) }}</span>
                  <span class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ t(`interview.levels.${r.level}`) }}</span>
                  <span
                    v-if="r.company"
                    class="border-[1.5px] border-(--ink) bg-(--ink) px-1.5 py-0.5 text-(--paper)"
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
                <h3 class="mt-3 text-xl font-bold leading-snug text-(--ink) group-hover:text-(--signal)">
                  {{ r.title }}
                </h3>
                <p class="mt-2 line-clamp-2 text-[17px] leading-relaxed text-(--ink2)">
                  {{ r.description }}
                </p>
              </NuxtLink>
            </li>
          </ol>
          <PromoSlot
            v-if="gi % 3 === 1"
            unit="horizontal"
          />
        </section>
        <p
          v-if="!filtered.length"
          class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-(--ink2)"
        >
          {{ t('interview.empty') }}
        </p>
      </div>
    </div>

    <!-- The open question (child route): a drawer over the list. -->
    <NuxtPage />
  </div>
</template>
