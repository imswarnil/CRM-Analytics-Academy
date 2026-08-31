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
    <PageHero
      eyebrow="Resources"
      icon="i-lucide-library-big"
    >
      <template #title>
        The best <span class="text-marker">CRM Analytics</span> resources
      </template>
      <template #description>
        Docs, courses, books, blogs, tools, and communities — filter to find what you need.
      </template>
    </PageHero>

    <div class="container  py-12 sm:py-14">
      <div class="grid gap-8 lg:grid-cols-[210px_1fr]">
        <!-- Left filter -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <p class="mb-3 px-3 is-size-7 has-text-weight-semibold is-uppercase has-text-grey">
            Filter
          </p>
          <ul class="space-y-1">
            <li
              v-for="c in categories"
              :key="c.key"
            >
              <button
                type="button"
                class="is-flex is-fullwidth is-align-items-center gap-2.5 rounded-lg px-3 py-2 is-size-7 has-text-weight-medium transition"
                :class="selected === c.key ? 'bg-primary/10 has-text-primary ring-1 ring-primary/20' : 'text-toned hover:bg-muted/50 hover:text-highlighted'"
                @click="selected = c.key"
              >
                <Icon
                  :name="c.icon"
                  class="size-4 shrink-0"
                />
                <span class="grow has-text-left">{{ c.key }}</span>
                <span class="is-size-7 has-text-grey">{{ countFor(c.key) }}</span>
              </button>
            </li>
          </ul>
        </aside>

        <div>
          <p class="mb-6 is-size-7 has-text-grey">
            <span class="has-text-weight-medium has-text-weight-semibold">{{ filtered.length }}</span> resources
          </p>

          <div class="grid content-start gap-5 sm:grid-cols-2">
            <a
              v-for="r in filtered"
              :key="r.title"
              :href="r.url"
              target="_blank"
              rel="noopener"
              class="is-flex is-flex-direction-column rounded-2xl border border-default has-background-white p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div class="mb-4 is-flex is-align-items-center is-justify-content-space-between">
                <div class="is-flex size-11 is-align-items-center is-justify-content-center rounded-xl bg-primary/10 has-text-primary ring-1 ring-primary/20">
                  <Icon
                    :name="r.icon"
                    class="size-5"
                  />
                </div>
                <UiBadge
                  tone="neutral"
                  :label="r.category"
                  class="rounded-full"
                  size="sm"
                />
              </div>
              <h3 class="title is-5 is-flex is-align-items-center gap-1 has-text-weight-semibold ">
                {{ r.title }}
                <Icon
                  name="i-lucide-arrow-up-right"
                  class="size-4 has-text-grey-light transition group-hover:text-primary"
                />
              </h3>
              <p class="mt-2 is-size-7 has-text-grey">
                {{ r.desc }}
              </p>
            </a>
          </div>
        </div>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
