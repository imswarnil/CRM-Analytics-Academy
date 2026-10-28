<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The interview question bank, grouped by course section (in course order)
 * and filterable by type, level, company and text. Prerendered in every
 * locale from the `interview` collection, which the build translates from
 * English; upvote counts load in the browser.
 */
interface Row {
  path: string
  title: string
  description?: string
  type: string
  topic: string
  level: string
  company?: string
  role?: string
  source: string
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const { data: rows } = await useAsyncData(`interview-list-${locale.value}`, async () => {
  const pick = (loc: string) => queryCollection('interview')
    .where('path', 'LIKE', `/${loc}/interview-questions/%`)
    .select('path', 'title', 'description', 'type', 'topic', 'level', 'company', 'role', 'source')
    .all()
  const own = await pick(locale.value)
  if (locale.value === DEFAULT_LOCALE) return own as Row[]
  // Untranslated questions fall back to English, so the list is complete.
  const en = await pick(DEFAULT_LOCALE)
  const have = new Set(own.map(r => r.path.split('/').pop()))
  return [...own, ...en.filter(r => !have.has(r.path.split('/').pop()))] as Row[]
}, { default: () => [] })

const slugOf = (p: string) => p.split('/').pop()!

// Section order and titles from the course navigation.
const sections = computed(() => (navigation.value ?? []).map(m => ({
  key: String(m.path ?? '').replace(/^\/[a-z]{2}(?=\/)/, '').replace(/^\//, ''),
  title: String(m.title ?? '')
})))
const sectionTitle = (key: string) => sections.value.find(s => s.key === key)?.title ?? key.replace(/-/g, ' ')

// Filters live in the URL so a filtered view can be shared.
const type = ref(String(route.query.type ?? ''))
const level = ref(String(route.query.level ?? ''))
const company = ref(String(route.query.company ?? ''))
const q = ref(String(route.query.q ?? ''))
watch([type, level, company, q], () => {
  navigateTo({ query: { type: type.value || undefined, level: level.value || undefined, company: company.value || undefined, q: q.value || undefined } }, { replace: true })
})

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
  const by = new Map<string, Row[]>()
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

const votes = ref<Record<string, number>>({})
onMounted(async () => {
  const res = await $fetch<{ counts: Record<string, number> }>('/api/interview/votes').catch(() => null)
  if (res) votes.value = res.counts
})

const title = computed(() => t('interview.seoTitle'))
const description = computed(() => t('interview.seoDesc', { n: rows.value?.length ?? 0 }))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value, headline: t('interview.eyebrow'), spec: 'Q&A · FREE' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  trail: [{ name: t('interview.eyebrow'), path: '/interview-questions' }],
  extra: [{
    '@type': 'ItemList',
    'numberOfItems': rows.value?.length ?? 0,
    'itemListElement': (rows.value ?? []).map((r, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': `${SITE.url}${localePath(`/interview-questions/${slugOf(r.path)}`)}`,
      'name': r.title
    }))
  }]
}))
</script>

<template>
  <div>
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
                :to="localePath(`/interview-questions/${slugOf(r.path)}`)"
                class="group block p-5"
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
  </div>
</template>
