<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
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
    <BpPageHeader
      :sheet="`Sheet 06 / Resources / ${resources.length} references`"
      title="The best CRM Analytics resources"
      lead="Docs, courses, books, blogs, tools, and communities — filter to find what you need."
    >
      <UButton
        :to="localePath('/submit?kind=resource')"
        icon="i-lucide-plus"
        class="mt-8"
      >
        Suggest a resource
      </UButton>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)]">
        <!-- Left filter -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              Filter
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
                  <span class="grow text-start">{{ c.key }}</span>
                  <span class="font-mono text-[10px] text-(--ink2)">{{ countFor(c.key) }}</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <div>
          <p class="mono-label mb-6">
            {{ filtered.length }} resources
          </p>

          <div class="grid content-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <a
              v-for="r in filtered"
              :key="r.title"
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
                {{ r.category }}
              </p>
              <h3 class="mt-3 pe-14 text-lg font-extrabold leading-tight tracking-[-0.02em] text-(--ink)">
                {{ r.title }}
              </h3>
              <p class="mt-2 grow text-sm text-(--ink2)">
                {{ r.desc }}
              </p>
              <span class="mt-5 border-t border-dashed border-(--line) pt-3 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-(--signal)">
                Open ↗
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
          Submit
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
