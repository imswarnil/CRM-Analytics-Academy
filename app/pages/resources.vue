<script setup lang="ts">
const { t, locale } = useI18n()
const title = computed(() => t('seo.resourcesTitle'))
const description = computed(() => t('seo.resourcesDesc'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

type Category = 'Docs' | 'Learning' | 'Books' | 'Blogs' | 'Tools' | 'Community'

interface Resource {
  title: string
  desc: string
  url: string
  category: Category
  icon: string
}

const resources: Resource[] = [
  { title: 'CRM Analytics Help', desc: 'Salesforce\'s official product documentation, end to end.', url: 'https://help.salesforce.com/s/articleView?id=sf.bi_get_started.htm', category: 'Docs', icon: 'i-simple-icons-salesforce' },
  { title: 'Developer Guide', desc: 'Dashboard JSON, bindings, and platform internals for builders.', url: 'https://developer.salesforce.com/docs/analytics/bindings/guide/bindings-intro.html', category: 'Docs', icon: 'i-lucide-book-open' },
  { title: 'SAQL Reference', desc: 'The complete Salesforce Analytics Query Language reference.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_saql.meta/bi_dev_guide_saql/', category: 'Docs', icon: 'i-lucide-terminal' },
  { title: 'Analytics REST API', desc: 'Query datasets and manage assets programmatically.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_rest.meta/bi_dev_guide_rest/', category: 'Docs', icon: 'i-lucide-plug' },
  { title: 'Trailhead: CRM Analytics', desc: 'Free, hands-on, gamified modules from Salesforce.', url: 'https://trailhead.salesforce.com/en/content/learn/trails/wave_analytics_basics', category: 'Learning', icon: 'i-lucide-graduation-cap' },
  { title: 'Trailhead: Einstein Discovery', desc: 'Build and interpret predictive models with guided projects.', url: 'https://trailhead.salesforce.com/en/content/learn/modules/einstein_discovery', category: 'Learning', icon: 'i-lucide-brain-circuit' },
  { title: 'Learning Tableau CRM (book)', desc: 'A practical book covering datasets, dashboards, and SAQL.', url: 'https://www.packtpub.com/en-us/search?q=tableau%20crm', category: 'Books', icon: 'i-lucide-book' },
  { title: 'Mastering Salesforce Analytics', desc: 'Deeper coverage of implementation and Einstein Discovery.', url: 'https://www.amazon.com/s?k=salesforce+crm+analytics', category: 'Books', icon: 'i-lucide-book-marked' },
  { title: 'Salesforce Analytics Blog', desc: 'Product news, tips, and release highlights from Salesforce.', url: 'https://www.salesforce.com/blog/category/analytics/', category: 'Blogs', icon: 'i-lucide-rss' },
  { title: 'Salesforce Ben — Analytics', desc: 'Community tutorials and opinion on the analytics ecosystem.', url: 'https://www.salesforceben.com/', category: 'Blogs', icon: 'i-lucide-newspaper' },
  { title: 'Salesforce CLI (sf)', desc: 'Script deployments and manage analytics assets from the terminal.', url: 'https://developer.salesforce.com/tools/salesforcecli', category: 'Tools', icon: 'i-lucide-square-terminal' },
  { title: 'Developer Edition Org', desc: 'A free Salesforce org to follow every lesson hands-on.', url: 'https://developer.salesforce.com/signup', category: 'Tools', icon: 'i-lucide-box' },
  { title: 'VS Code + SF Extensions', desc: 'Edit dashboards, dataflows, and metadata with full tooling.', url: 'https://developer.salesforce.com/tools/vscode', category: 'Tools', icon: 'i-simple-icons-visualstudiocode' },
  { title: 'Analytics Trailblazer Community', desc: 'Ask questions and connect with thousands of practitioners.', url: 'https://trailhead.salesforce.com/trailblazer-community/groups', category: 'Community', icon: 'i-lucide-users' },
  { title: 'Salesforce Stack Exchange', desc: 'Q&A for tough CRM Analytics and SAQL problems.', url: 'https://salesforce.stackexchange.com/questions/tagged/einstein-analytics', category: 'Community', icon: 'i-lucide-messages-square' },
  { title: 'r/salesforce', desc: 'Community discussion, tips, and career advice.', url: 'https://www.reddit.com/r/salesforce/', category: 'Community', icon: 'i-simple-icons-reddit' }
]

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

// One accent per category, per the design system's resource tags.
const categoryAccent: Record<Category, string> = {
  Docs: 'bg-salesforce-100 text-primary dark:bg-salesforce-900',
  Learning: 'bg-brand-yellow-soft text-yellow-700 dark:bg-yellow-950 dark:text-brand-yellow',
  Books: 'bg-brand-purple-soft text-purple-600 dark:bg-purple-950 dark:text-brand-purple',
  Blogs: 'bg-brand-pink-soft text-brand-pink dark:bg-pink-950',
  Tools: 'bg-brand-green-soft text-emerald-600 dark:bg-emerald-950 dark:text-brand-green',
  Community: 'bg-brand-sky-soft text-sky-600 dark:bg-sky-950 dark:text-brand-sky'
}

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/resources`,
  'inLanguage': locale.value
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
        class="absolute top-12 left-24 hidden size-4 rounded-full border-[3px] border-(--nb-ink) bg-brand-yellow lg:block"
        aria-hidden="true"
      />
      <UContainer class="relative py-14 text-center sm:py-16">
        <UBadge
          size="lg"
          class="mb-5 rounded-full border-[3px] border-(--nb-ink) bg-brand-yellow px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-ink uppercase"
        >
          <UIcon
            name="i-lucide-library-big"
            class="mr-1 size-4"
          />
          Resources
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
          The best <span class="text-primary">CRM Analytics</span> resources
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Docs, courses, books, blogs, tools, and communities — filter to find what you need.
        </p>
        <UButton
          to="https://github.com/imswarnil/CRM-Analytics-Academy/issues/new"
          target="_blank"
          icon="i-lucide-plus"
          class="mt-6"
        >
          Suggest a resource
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-14">
      <!-- The design system's filter row: bordered pills, the active one
           solid blue. -->
      <div class="mb-8 flex flex-wrap gap-2">
        <button
          v-for="c in categories"
          :key="c.key"
          type="button"
          class="nb-pill flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-colors"
          :class="selected === c.key
            ? 'bg-primary text-white'
            : 'bg-(--nb-surface) text-muted hover:text-highlighted'"
          @click="selected = c.key"
        >
          <UIcon
            :name="c.icon"
            class="size-3.5 shrink-0"
          />
          {{ c.key }}
          <span :class="selected === c.key ? 'text-white/70' : 'text-dimmed'">{{ countFor(c.key) }}</span>
        </button>
      </div>

      <div class="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="r in filtered"
          :key="r.title"
          :href="r.url"
          target="_blank"
          rel="noopener"
          class="nb-card group flex flex-col p-6 transition-transform hover:-translate-y-0.5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span
              class="nb-tag px-2.5 py-1 text-[0.625rem]"
              :class="categoryAccent[r.category]"
            >{{ r.category }}</span>
            <UIcon
              :name="r.icon"
              class="size-5 text-muted"
            />
          </div>
          <h3 class="font-display flex items-center gap-1 font-bold text-highlighted">
            {{ r.title }}
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 text-dimmed transition group-hover:text-primary"
            />
          </h3>
          <p class="mt-2 flex-1 text-sm text-muted">
            {{ r.desc }}
          </p>
          <span class="mt-4 text-xs font-semibold text-primary">View →</span>
        </a>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
