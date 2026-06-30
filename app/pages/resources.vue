<script setup lang="ts">
const title = 'Resources — CRM Analytics Academy'
const description = 'A curated list of the best Salesforce CRM Analytics resources — official docs, Trailhead, SAQL references, community, and tools — filterable by category.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title, description })

interface Resource {
  title: string
  desc: string
  url: string
  category: 'Official' | 'Learning' | 'Reference' | 'Community' | 'Tools'
  icon: string
}

const resources: Resource[] = [
  { title: 'CRM Analytics Help', desc: 'Salesforce\'s official product documentation for CRM Analytics, end to end.', url: 'https://help.salesforce.com/s/articleView?id=sf.bi_get_started.htm', category: 'Official', icon: 'i-simple-icons-salesforce' },
  { title: 'CRM Analytics Developer Guide', desc: 'Dashboard JSON, bindings, and the platform internals for builders.', url: 'https://developer.salesforce.com/docs/analytics/bindings/guide/bindings-intro.html', category: 'Official', icon: 'i-lucide-book-open' },
  { title: 'Analytics REST API', desc: 'Query datasets and manage assets programmatically over REST.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_rest.meta/bi_dev_guide_rest/', category: 'Official', icon: 'i-lucide-plug' },
  { title: 'Trailhead: CRM Analytics', desc: 'Free, hands-on, gamified modules and trails from Salesforce.', url: 'https://trailhead.salesforce.com/en/content/learn/trails/wave_analytics_basics', category: 'Learning', icon: 'i-lucide-graduation-cap' },
  { title: 'Trailhead: Einstein Discovery', desc: 'Build and interpret predictive models with guided projects.', url: 'https://trailhead.salesforce.com/en/content/learn/modules/einstein_discovery', category: 'Learning', icon: 'i-lucide-brain-circuit' },
  { title: 'CRM Analytics Learning Days', desc: 'Salesforce-run live and recorded enablement sessions.', url: 'https://trailhead.salesforce.com/', category: 'Learning', icon: 'i-lucide-presentation' },
  { title: 'SAQL Reference', desc: 'The complete Salesforce Analytics Query Language function reference.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_saql.meta/bi_dev_guide_saql/', category: 'Reference', icon: 'i-lucide-terminal' },
  { title: 'SQL → SAQL Cheatsheet', desc: 'Map familiar SQL patterns to their SAQL equivalents.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_saql.meta/bi_dev_guide_saql/bi_saql_intro.htm', category: 'Reference', icon: 'i-lucide-file-code' },
  { title: 'Security Predicate Reference', desc: 'Row-level security expressions and patterns for datasets.', url: 'https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_elttools.meta/bi_dev_guide_elttools/bi_security_datasets_predicate.htm', category: 'Reference', icon: 'i-lucide-shield-check' },
  { title: 'Analytics Trailblazer Community', desc: 'Ask questions and connect with thousands of practitioners.', url: 'https://trailhead.salesforce.com/trailblazer-community/groups', category: 'Community', icon: 'i-lucide-users' },
  { title: 'Salesforce Stack Exchange', desc: 'Q&A for tough CRM Analytics and SAQL problems.', url: 'https://salesforce.stackexchange.com/questions/tagged/einstein-analytics', category: 'Community', icon: 'i-lucide-messages-square' },
  { title: 'r/salesforce', desc: 'Community discussion, tips, and career advice.', url: 'https://www.reddit.com/r/salesforce/', category: 'Community', icon: 'i-simple-icons-reddit' },
  { title: 'Salesforce CLI (sf)', desc: 'Script deployments and manage Analytics assets from the terminal.', url: 'https://developer.salesforce.com/tools/salesforcecli', category: 'Tools', icon: 'i-lucide-square-terminal' },
  { title: 'Developer Edition Org', desc: 'A free Salesforce org to follow every lesson hands-on.', url: 'https://developer.salesforce.com/signup', category: 'Tools', icon: 'i-lucide-box' },
  { title: 'VS Code + Salesforce Extensions', desc: 'Edit dashboards, dataflows, and metadata with full tooling.', url: 'https://developer.salesforce.com/tools/vscode', category: 'Tools', icon: 'i-simple-icons-visualstudiocode' }
]

const categories = ['All', 'Official', 'Learning', 'Reference', 'Community', 'Tools'] as const
const selected = ref<(typeof categories)[number]>('All')

const filtered = computed(() =>
  selected.value === 'All' ? resources : resources.filter(r => r.category === selected.value)
)

const counts = computed(() => {
  const map: Record<string, number> = { All: resources.length }
  for (const c of categories) {
    if (c !== 'All') map[c] = resources.filter(r => r.category === c).length
  }
  return map
})

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': title,
    'description': description,
    'url': `${SITE.url}/resources`,
    'inLanguage': 'en'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'CRM Analytics resources',
    'numberOfItems': resources.length,
    'itemListElement': resources.map((r, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': r.url,
      'name': r.title
    }))
  }
])
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <UContainer class="relative py-16 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-library-big"
            class="mr-1 size-4"
          />
          Resources
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          The best <span class="text-gradient">CRM Analytics</span> resources, in one place
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Hand-picked docs, courses, references, communities, and tools — filter to find exactly what you need.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <!-- Filter -->
      <div class="mb-10 flex flex-wrap justify-center gap-2">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition"
          :class="selected === c
            ? 'border-primary bg-primary text-inverted'
            : 'border-default bg-default text-toned hover:border-primary/40 hover:text-highlighted'"
          @click="selected = c"
        >
          {{ c }}
          <span
            class="rounded-full px-1.5 text-[11px]"
            :class="selected === c ? 'bg-white/20' : 'bg-muted text-muted'"
          >{{ counts[c] }}</span>
        </button>
      </div>

      <AdUnit
        placement="belowHero"
        class="mx-auto mb-10 max-w-3xl"
      />

      <!-- Grid -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <AdUnit
        placement="betweenSections"
        class="mx-auto mt-12 max-w-3xl"
      />
    </UContainer>

    <!-- CTA -->
    <section class="pb-20">
      <UContainer>
        <div class="relative overflow-hidden rounded-3xl border border-default bg-gradient-to-br from-salesforce-600 via-salesforce-700 to-salesforce-900 px-6 py-14 text-center sm:px-12">
          <div class="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div class="relative mx-auto max-w-2xl">
            <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Prefer a guided path?
            </h2>
            <p class="mt-3 text-white/80">
              Our free five-module curriculum turns these resources into a step-by-step journey.
            </p>
            <UButton
              to="/foundations"
              size="xl"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="mt-6 rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
            >
              Start the curriculum
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
