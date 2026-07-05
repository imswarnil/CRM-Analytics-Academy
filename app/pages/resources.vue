<script setup lang="ts">
const { t } = useI18n()
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

// Community-submitted, admin-approved resources are merged in with the curated
// list above (RLS exposes only approved rows to the public).
const client = useDb()
const user = useSupabaseUser()
const localePath = useLocalePath()
const validCats: Category[] = ['Docs', 'Learning', 'Books', 'Blogs', 'Tools', 'Community']
const { data: community } = await useAsyncData('community-resources', async () => {
  const { data } = await client
    .from('resources')
    .select('title, description, url, category, icon')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .returns<{ title: string, description: string | null, url: string, category: string | null, icon: string | null }[]>()
  return data ?? []
})
const communityResources = computed<Resource[]>(() =>
  (community.value ?? []).map(r => ({
    title: r.title,
    desc: r.description || '',
    url: r.url,
    category: (validCats.includes(r.category as Category) ? r.category : 'Community') as Category,
    icon: r.icon || DEFAULT_RESOURCE_ICON
  }))
)
const allResources = computed(() => [...communityResources.value, ...resources])

const selected = ref<'All' | Category>('All')
const filtered = computed(() => selected.value === 'All' ? allResources.value : allResources.value.filter(r => r.category === selected.value))
const countFor = (key: 'All' | Category) => key === 'All' ? allResources.value.length : allResources.value.filter(r => r.category === key).length

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/resources`,
  'inLanguage': 'en'
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-16">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-5 rounded-full"
        >
          <UIcon
            name="i-lucide-library-big"
            class="mr-1 size-4"
          />
          Resources
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          The best <span class="text-gradient">CRM Analytics</span> resources
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Docs, courses, books, blogs, tools, and communities — filter to find what you need.
        </p>
        <UButton
          :to="user ? localePath('/submit/resource') : localePath('/login') + '?redirect=' + encodeURIComponent(localePath('/submit/resource'))"
          icon="i-lucide-plus"
          color="primary"
          variant="subtle"
          class="mt-6 rounded-full font-medium"
        >
          Submit a resource
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-14">
      <div class="grid gap-8 lg:grid-cols-[210px_1fr]">
        <!-- Left filter -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Filter
          </p>
          <ul class="space-y-1">
            <li
              v-for="c in categories"
              :key="c.key"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="selected === c.key
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'text-toned hover:bg-muted/50 hover:text-highlighted'"
                @click="selected = c.key"
              >
                <UIcon
                  :name="c.icon"
                  class="size-4 shrink-0"
                />
                <span class="grow text-left">{{ c.key }}</span>
                <span class="text-xs text-muted">{{ countFor(c.key) }}</span>
              </button>
            </li>
          </ul>
        </aside>

        <!-- Grid -->
        <div class="grid content-start gap-5 sm:grid-cols-2">
          <NuxtLink
            v-for="r in filtered"
            :key="r.title"
            :to="r.url"
            target="_blank"
            rel="noopener"
            class="group flex flex-col rounded-2xl border border-default bg-default p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <UIcon
                  :name="r.icon"
                  class="size-5"
                />
              </div>
              <UBadge
                :label="r.category"
                color="neutral"
                variant="subtle"
                size="sm"
                class="rounded-full"
              />
            </div>
            <h3 class="flex items-center gap-1 font-semibold text-highlighted">
              {{ r.title }}
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-4 text-dimmed transition group-hover:text-primary"
              />
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ r.desc }}
            </p>
          </NuxtLink>
        </div>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
