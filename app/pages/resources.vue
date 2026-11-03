<script setup lang="ts">
/**
 * /resources — the best links for learning CRM Analytics, by category, as
 * cards or a list. Thumbnails are each page's own preview image, fetched once
 * at build time (scripts/resource-previews.mjs → app/data/resource-previews.json);
 * a link without one gets its icon on a colour tile and the site's favicon.
 * Nothing on this page calls the Worker.
 */
import previews from '~/data/resource-previews.json'

const { t } = useI18n()
const localePath = useLocalePath()
const title = computed(() => t('seo.resourcesTitle'))
const description = computed(() => t('seo.resourcesDesc'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

type Category = 'Docs' | 'Learning' | 'Books' | 'Blogs' | 'Tools' | 'Community'

interface Resource {
  /** Key under `resources.items` in i18n/locales — holds the translatable title and blurb. */
  id: string
  url: string
  category: Category
  icon: string
}

const resources: Resource[] = [
  { id: 'crmaHelp', url: 'https://help.salesforce.com/s/articleView?id=sf.bi_get_started.htm', category: 'Docs', icon: 'i-simple-icons-salesforce' },
  { id: 'devGuide', url: 'https://developer.salesforce.com/docs/analytics/bindings/guide/bindings-intro.html', category: 'Docs', icon: 'i-lucide-book-open' },
  { id: 'saqlReference', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_saql.meta/bi_dev_guide_saql/', category: 'Docs', icon: 'i-lucide-terminal' },
  { id: 'restApi', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_rest.meta/bi_dev_guide_rest/', category: 'Docs', icon: 'i-lucide-plug' },
  { id: 'trailheadCrma', url: 'https://trailhead.salesforce.com/en/content/learn/trails/wave_analytics_basics', category: 'Learning', icon: 'i-lucide-graduation-cap' },
  { id: 'trailheadDiscovery', url: 'https://trailhead.salesforce.com/en/content/learn/modules/einstein_discovery', category: 'Learning', icon: 'i-lucide-brain-circuit' },
  { id: 'learningTableauCrm', url: 'https://www.packtpub.com/en-us/search?q=tableau%20crm', category: 'Books', icon: 'i-lucide-book' },
  { id: 'masteringAnalytics', url: 'https://www.amazon.com/s?k=salesforce+crm+analytics', category: 'Books', icon: 'i-lucide-book-marked' },
  { id: 'analyticsBlog', url: 'https://www.salesforce.com/blog/category/analytics/', category: 'Blogs', icon: 'i-lucide-rss' },
  { id: 'salesforceBen', url: 'https://www.salesforceben.com/', category: 'Blogs', icon: 'i-lucide-newspaper' },
  { id: 'sfCli', url: 'https://developer.salesforce.com/tools/salesforcecli', category: 'Tools', icon: 'i-lucide-square-terminal' },
  { id: 'devOrg', url: 'https://developer.salesforce.com/signup', category: 'Tools', icon: 'i-lucide-box' },
  { id: 'vscode', url: 'https://developer.salesforce.com/tools/vscode', category: 'Tools', icon: 'i-simple-icons-visualstudiocode' },
  { id: 'trailblazerCommunity', url: 'https://trailhead.salesforce.com/trailblazer-community/groups', category: 'Community', icon: 'i-lucide-users' },
  { id: 'stackExchange', url: 'https://salesforce.stackexchange.com/questions/tagged/einstein-analytics', category: 'Community', icon: 'i-lucide-messages-square' },
  { id: 'reddit', url: 'https://www.reddit.com/r/salesforce/', category: 'Community', icon: 'i-simple-icons-reddit' }
]

const categoryLabel = (key: 'All' | Category) => t(`resources.categories.${key.toLowerCase()}`)

const categories: { key: 'All' | Category, icon: string }[] = [
  { key: 'All', icon: 'i-lucide-layout-grid' },
  { key: 'Docs', icon: 'i-lucide-book-open' },
  { key: 'Learning', icon: 'i-lucide-graduation-cap' },
  { key: 'Books', icon: 'i-lucide-book' },
  { key: 'Blogs', icon: 'i-lucide-rss' },
  { key: 'Tools', icon: 'i-lucide-wrench' },
  { key: 'Community', icon: 'i-lucide-users' }
]

const selected = ref<'All' | Category>('All')
const view = ref<'grid' | 'list'>('grid')
onMounted(() => {
  try {
    if (localStorage.getItem('crma-res-view') === 'list') view.value = 'list'
  } catch { /* storage blocked */ }
})
watch(view, (v) => {
  try {
    localStorage.setItem('crma-res-view', v)
  } catch { /* storage blocked */ }
})
const imageOf = (url: string) => (previews as Record<string, string>)[url] ?? ''
const TILE: Record<Category, { bg: string, fg: string }> = {
  Docs: { bg: '#dbeafe', fg: '#1d4ed8' }, Learning: { bg: '#d1fae5', fg: '#047857' }, Books: { bg: '#fef3c7', fg: '#b45309' },
  Blogs: { bg: '#fce7f3', fg: '#be185d' }, Tools: { bg: '#ede9fe', fg: '#6d28d9' }, Community: { bg: '#e0f2fe', fg: '#0369a1' }
}
const filtered = computed(() => selected.value === 'All' ? resources : resources.filter(r => r.category === selected.value))
const countFor = (key: 'All' | Category) => key === 'All' ? resources.length : resources.filter(r => r.category === key).length

usePageSchema(() => ({ name: title.value, description: description.value, type: 'CollectionPage' }))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('resources.header.sheet', { count: resources.length })"
      :title="t('resources.header.title')"
      :lead="t('resources.header.lead')"
    >
      <UButton
        :to="localePath('/submit?kind=resource')"
        icon="i-lucide-plus"
        class="mt-8"
      >
        {{ t('resources.header.suggest') }}
      </UButton>
      <ShareBar
        class="mt-6"
        :title="t('resources.header.title')"
        :text="t('resources.header.lead')"
      />
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)]">
        <!-- Left filter -->
        <aside class="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              {{ t('resources.filter') }}
            </p>
            <ul>
              <li
                v-for="c in categories"
                :key="c.key"
                class="border-b border-dashed border-(--line) last:border-b-0"
              >
                <button
                  type="button"
                  class="relative flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                  :class="selected === c.key
                    ? 'bg-(--ice) font-bold text-(--signal)'
                    : 'text-(--ink) hover:bg-(--ice)/50'"
                  @click="selected = c.key"
                >
                  <span
                    v-if="selected === c.key"
                    class="absolute inset-y-0 start-0 w-[3px] bg-(--signal)"
                  />
                  <UIcon
                    :name="c.icon"
                    class="size-4 shrink-0"
                  />
                  <span class="grow text-start">{{ categoryLabel(c.key) }}</span>
                  <span class="font-mono text-[10px] text-(--ink2)">{{ countFor(c.key) }}</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <div>
          <div class="mb-6 flex items-center justify-between gap-3">
            <p class="mono-label">
              {{ t('resources.count', { count: filtered.length }) }}
            </p>
            <div class="flex border-[1.5px] border-(--ink)">
              <button
                v-for="v in (['grid', 'list'] as const)"
                :key="v"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold"
                :class="view === v ? 'bg-(--ink) text-(--paper)' : 'text-(--ink) hover:bg-(--ice)'"
                :aria-pressed="view === v"
                @click="view = v"
              >
                <UIcon
                  :name="v === 'grid' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
                  class="size-4"
                />{{ t(`interview.view.${v === 'grid' ? 'grid' : 'list'}`) }}
              </button>
            </div>
          </div>

          <div :class="view === 'grid' ? 'grid content-start gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'">
            <a
              v-for="r in filtered"
              :key="r.id"
              :href="r.url"
              target="_blank"
              rel="noopener"
              class="bp-card bp-card--hover group overflow-hidden"
              :class="view === 'grid' ? 'flex flex-col' : 'flex items-center gap-4 p-3'"
            >
              <!-- Thumbnail: the page's own image, or its icon on a colour tile -->
              <span
                class="relative flex shrink-0 items-center justify-center overflow-hidden"
                :class="view === 'grid' ? 'aspect-[16/8] w-full border-b-[1.5px] border-(--ink)' : 'size-16'"
                :style="imageOf(r.url) ? undefined : { background: TILE[r.category].bg, color: TILE[r.category].fg }"
              >
                <img
                  v-if="imageOf(r.url)"
                  :src="imageOf(r.url)"
                  :alt="t(`resources.items.${r.id}.title`)"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                >
                <UIcon
                  v-else
                  :name="r.icon"
                  :class="view === 'grid' ? 'size-12' : 'size-7'"
                />
                <img
                  v-if="view === 'grid'"
                  :src="fallbackIcon(r.url)"
                  alt=""
                  loading="lazy"
                  class="absolute bottom-2 start-2 size-6 rounded bg-white p-0.5 shadow"
                >
              </span>
              <span :class="view === 'grid' ? 'flex grow flex-col p-5' : 'min-w-0 flex-1'">
                <span class="eyebrow">{{ categoryLabel(r.category) }} · {{ hostOf(r.url) }}</span>
                <span
                  class="mt-1.5 block font-extrabold leading-tight tracking-[-0.02em] text-(--ink) group-hover:text-(--signal)"
                  :class="view === 'grid' ? 'text-lg' : 'text-base'"
                >
                  {{ t(`resources.items.${r.id}.title`) }}
                </span>
                <span
                  class="mt-1.5 block text-sm text-(--ink2)"
                  :class="view === 'grid' ? 'grow' : 'line-clamp-1'"
                >{{ t(`resources.items.${r.id}.desc`) }}</span>
              </span>
              <UIcon
                v-if="view === 'list'"
                name="i-lucide-arrow-up-right"
                class="size-5 shrink-0 text-(--ink2)"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Submitting a resource used to mean opening a GitHub issue, which is
           a real barrier for the people most likely to know a good link. There
           is a database and a moderated form now, so the page that lists
           resources should be the page that invites one. -->
      <div class="graph-paper-navy mx-auto mt-16 max-w-3xl border-[1.5px] border-(--ink) bg-(--navy) p-8 text-center text-white shadow-[10px_10px_0_var(--signal)]">
        <p class="eyebrow text-(--glow)!">
          {{ t('resources.submitEyebrow') }}
        </p>
        <h2 class="mt-2 text-2xl font-extrabold tracking-[-0.02em]">
          {{ t('resources.submitTitle') }}
        </h2>
        <p class="mx-auto mt-2 max-w-xl text-sm text-white/80">
          {{ t('resources.submitBody') }}
        </p>
        <UButton
          :to="localePath('/submit')"
          icon="i-lucide-circle-plus"
          color="secondary"
          class="mt-5"
        >
          {{ t('resources.submitCta') }}
        </UButton>
      </div>
    </div>
    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="horizontal" />
    </div>
    <div class="mx-auto max-w-(--ui-container) px-4 pb-12 sm:px-6 lg:px-8">
      <PromoSlot unit="multiplexHorizontal" />
    </div>
  </div>
</template>
