<script setup lang="ts">
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
          <p class="mono-label mb-6">
            {{ t('resources.count', { count: filtered.length }) }}
          </p>

          <div class="grid content-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <a
              v-for="r in filtered"
              :key="r.id"
              :href="r.url"
              target="_blank"
              rel="noopener"
              class="bp-card bp-card--hover group flex flex-col p-5"
            >
              <span class="bp-iconbox absolute end-4 top-4 text-(--signal)">
                <UIcon
                  :name="r.icon"
                  class="size-5"
                />
              </span>
              <p class="eyebrow pe-14">
                {{ categoryLabel(r.category) }}
              </p>
              <h3 class="mt-3 pe-14 text-lg font-extrabold leading-tight tracking-[-0.02em] text-(--ink)">
                {{ t(`resources.items.${r.id}.title`) }}
              </h3>
              <p class="mt-2 grow text-sm text-(--ink2)">
                {{ t(`resources.items.${r.id}.desc`) }}
              </p>
              <span class="mt-5 border-t border-dashed border-(--line) pt-3 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-(--signal)">
                {{ t('resources.open') }} ↗
              </span>
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

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
