<script setup lang="ts">
const title = 'CRM Analytics Academy — Learn Salesforce CRM Analytics'
const description = 'A free, open-source curriculum for mastering Salesforce CRM Analytics — from data prep and SAQL to dashboards and Einstein Discovery, in five hands-on modules.'

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title, description })

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Course',
  'name': SITE.name,
  'description': SITE.description,
  'url': SITE.url,
  'inLanguage': 'en',
  'isAccessibleForFree': true,
  'provider': {
    '@type': 'Organization',
    'name': SITE.name,
    'sameAs': SITE.url
  },
  'hasPart': [
    { name: 'Foundations', url: `${SITE.url}/foundations` },
    { name: 'Data Integration & Prep', url: `${SITE.url}/data-integration` },
    { name: 'SAQL', url: `${SITE.url}/saql` },
    { name: 'Dashboards', url: `${SITE.url}/dashboards` },
    { name: 'Einstein Discovery', url: `${SITE.url}/einstein-discovery` }
  ].map(m => ({ '@type': 'Course', 'name': m.name, 'url': m.url, 'provider': { '@type': 'Organization', 'name': SITE.name } }))
})

const stats = [
  { value: '5', label: 'Modules' },
  { value: '15', label: 'Lessons' },
  { value: '100%', label: 'Free & open' },
  { value: 'AI', label: 'Assistant-ready' }
]

const modules = [
  {
    n: '01',
    title: 'Foundations',
    to: '/foundations',
    icon: 'i-lucide-compass',
    desc: 'What CRM Analytics is, licensing and access, and a guided tour of Analytics Studio so you know where everything lives.'
  },
  {
    n: '02',
    title: 'Data Integration & Prep',
    to: '/data-integration',
    icon: 'i-lucide-database',
    desc: 'Connect and sync data, build Data Prep recipes, and model secure, analysis-ready datasets with row-level security.'
  },
  {
    n: '03',
    title: 'SAQL',
    to: '/saql',
    icon: 'i-lucide-terminal',
    desc: 'The Salesforce Analytics Query Language — load, filter, group, windowing, and binding queries together for interactivity.'
  },
  {
    n: '04',
    title: 'Dashboards',
    to: '/dashboards',
    icon: 'i-lucide-layout-dashboard',
    desc: 'Explore with lenses, assemble responsive dashboards, and add drill-downs, actions, and conditional formatting.'
  },
  {
    n: '05',
    title: 'Einstein Discovery',
    to: '/einstein-discovery',
    icon: 'i-lucide-brain-circuit',
    desc: 'Build explainable models with stories, evaluate them, and deploy predictions and recommendations where users work.'
  }
]

const steps = [
  { icon: 'i-lucide-book-marked', title: 'Read the lesson', desc: 'Short, focused lessons explain one idea at a time with diagrams, callouts, and real examples.' },
  { icon: 'i-lucide-flask-conical', title: 'Try it live', desc: 'Every concept maps to a concrete action in Analytics Studio — follow along in a Developer org.' },
  { icon: 'i-lucide-blocks', title: 'Build a project', desc: 'Modules accumulate into a working pipeline: synced data, clean datasets, dashboards, a model.' },
  { icon: 'i-lucide-bot', title: 'Ask the AI', desc: 'Every page is available as Markdown and over MCP, so Claude or ChatGPT can tutor you from the source.' }
]

const outcomes = [
  { icon: 'i-lucide-plug', title: 'Integrate any data', desc: 'Connect Salesforce and external sources, schedule reliable syncs, and keep datasets fresh.' },
  { icon: 'i-lucide-wand-sparkles', title: 'Shape data with recipes', desc: 'Join, aggregate, and clean raw data into trustworthy, well-modeled datasets.' },
  { icon: 'i-lucide-terminal', title: 'Write real SAQL', desc: 'Author queries by hand for advanced metrics, windowing, and dashboard interactivity.' },
  { icon: 'i-lucide-layout-dashboard', title: 'Build dashboards', desc: 'Design responsive, faceted dashboards with drill-downs and embedded Salesforce actions.' },
  { icon: 'i-lucide-brain-circuit', title: 'Deploy predictions', desc: 'Train explainable Einstein Discovery models and surface predictions on records and in flows.' },
  { icon: 'i-lucide-badge-check', title: 'Prep for certification', desc: 'Cover the skills measured by the CRM Analytics & Einstein Discovery Consultant exam.' }
]

const personas = [
  { icon: 'i-lucide-line-chart', title: 'Analysts', desc: 'Go from drag-and-drop reports to building datasets, SAQL, and dashboards that scale.' },
  { icon: 'i-lucide-settings-2', title: 'Admins', desc: 'Set up the platform, manage security predicates, and roll analytics out safely.' },
  { icon: 'i-lucide-briefcase', title: 'Consultants', desc: 'Design end-to-end solutions and prep for the certification with confidence.' },
  { icon: 'i-lucide-sprout', title: 'Beginners', desc: 'Start from CRM basics — no prior analytics experience required.' }
]

const topics = [
  'Data Manager', 'Connectors', 'Recipes', 'Dataflows', 'Datasets', 'Security Predicates',
  'SAQL', 'Bindings', 'Windowing', 'Lenses', 'Dashboards', 'Faceting', 'Drill-downs',
  'Einstein Discovery', 'Stories', 'Predictions', 'REST API', 'Embedding'
]

const faqs = [
  { q: 'Is it really free?', a: 'Yes — every lesson is free and open source, with no sign-up required.' },
  { q: 'Do I need a Salesforce org?', a: 'A free Developer Edition org is enough to follow along with every lesson.' },
  { q: 'Do I need coding experience?', a: 'No. We start from CRM basics and introduce SAQL gradually, step by step.' },
  { q: 'Will this help me get certified?', a: 'The curriculum maps to the CRM Analytics & Einstein Discovery Consultant exam topics.' }
]

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(f => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
  }))
})
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div class="absolute -top-20 right-0 size-80 rounded-full bg-salesforce-400/15 blur-3xl" />

      <UContainer class="relative py-20 sm:py-28">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <!-- Copy -->
          <div class="animate-fade-up">
            <UBadge
              color="primary"
              variant="subtle"
              size="lg"
              class="mb-6 rounded-full"
            >
              <UIcon
                name="i-lucide-sparkles"
                class="mr-1 size-4"
              />
              Free & open-source curriculum
            </UBadge>

            <h1 class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-6xl">
              Master Salesforce<br>
              <span class="text-gradient">CRM Analytics</span>.
            </h1>

            <p class="mt-6 max-w-xl text-lg text-muted">
              From your first dataset to deploying explainable predictions — learn the entire
              platform across five hands-on modules, with real SAQL and copy-paste examples.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                to="/foundations"
                size="xl"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full font-semibold"
              >
                Start learning
              </UButton>
              <UButton
                to="#curriculum"
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-graduation-cap"
                class="rounded-full font-semibold"
              >
                Browse curriculum
              </UButton>
            </div>

            <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-dimmed">
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> No sign-up</span>
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> 15 lessons</span>
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> Certification-aligned</span>
            </div>
          </div>

          <!-- Animated pipeline storyboard -->
          <div class="animate-fade-up">
            <HeroStory />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============================ STATS ============================ -->
    <section class="border-b border-default bg-gradient-to-r from-salesforce-600 to-salesforce-800">
      <UContainer class="py-10">
        <dl class="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div
            v-for="s in stats"
            :key="s.label"
            class="text-center"
          >
            <dt class="text-4xl font-extrabold text-white">
              {{ s.value }}
            </dt>
            <dd class="mt-1 text-sm font-medium text-white/70">
              {{ s.label }}
            </dd>
          </div>
        </dl>
      </UContainer>
    </section>

    <UContainer>
      <AdUnit
        placement="belowHero"
        class="max-w-4xl"
      />
    </UContainer>

    <!-- ========================= CURRICULUM ========================= -->
    <section
      id="curriculum"
      class="relative scroll-mt-24 py-20 sm:py-24"
    >
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            The Curriculum
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Five modules, one complete path
          </h2>
          <p class="mt-4 text-lg text-muted">
            Start at the top and work down — together they cover the whole pipeline, from raw data to a deployed prediction.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="m in modules"
            :key="m.n"
            :to="m.to"
            class="group relative flex flex-col overflow-hidden rounded-2xl border border-default bg-default p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
          >
            <div class="absolute inset-x-0 top-0 h-1 scale-x-0 bg-gradient-to-r from-salesforce-400 to-salesforce-600 transition-transform duration-300 group-hover:scale-x-100" />
            <div class="mb-5 flex items-center justify-between">
              <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary group-hover:text-inverted">
                <UIcon
                  :name="m.icon"
                  class="size-6"
                />
              </div>
              <span class="text-2xl font-extrabold text-default/15 group-hover:text-primary/30">{{ m.n }}</span>
            </div>
            <h3 class="text-lg font-semibold text-highlighted">{{ m.title }}</h3>
            <p class="mt-2 grow text-sm text-muted">{{ m.desc }}</p>
            <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Start module
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </NuxtLink>

          <!-- Start-here call card -->
          <div class="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-salesforce-600 to-salesforce-800 p-6 text-white">
            <UIcon
              name="i-lucide-flag"
              class="mb-4 size-8"
            />
            <h3 class="text-lg font-semibold">
              New here?
            </h3>
            <p class="mt-2 text-sm text-white/80">
              Begin with Foundations and follow the modules in order for a complete, guided learning path.
            </p>
            <UButton
              to="/foundations"
              color="neutral"
              variant="solid"
              class="mt-5 w-fit rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              trailing-icon="i-lucide-arrow-right"
            >
              Start here
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer>
      <AdUnit
        placement="betweenSections"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ========================= HOW IT WORKS ========================= -->
    <section class="relative border-y border-default bg-muted/30 py-20 sm:py-24">
      <div class="absolute inset-0 bg-dots opacity-60" />
      <UContainer class="relative">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Learn it, try it, build it
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(step, i) in steps"
            :key="step.title"
            class="relative rounded-2xl border border-default bg-default p-6"
          >
            <div class="mb-4 flex size-11 items-center justify-center rounded-full bg-primary text-inverted shadow-lg shadow-primary/30">
              <UIcon
                :name="step.icon"
                class="size-5"
              />
            </div>
            <span class="absolute right-5 top-5 text-sm font-bold text-muted">{{ i + 1 }}</span>
            <h3 class="font-semibold text-highlighted">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ step.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= OUTCOMES ========================= -->
    <section class="py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Outcomes
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            What you will be able to do
          </h2>
          <p class="mt-4 text-lg text-muted">
            By the end you can deliver an end-to-end CRM Analytics solution — and prove it.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="o in outcomes"
            :key="o.title"
            class="group rounded-2xl border border-default bg-default p-6 transition hover:border-primary/40 hover:bg-muted/30"
          >
            <div class="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <UIcon
                :name="o.icon"
                class="size-5"
              />
            </div>
            <h3 class="font-semibold text-highlighted">
              {{ o.title }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ o.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= WHO IT'S FOR ========================= -->
    <section class="border-t border-default bg-muted/30 py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Who it's for
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Built for every role on the team
          </h2>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="p in personas"
            :key="p.title"
            class="rounded-2xl border border-default bg-default p-6"
          >
            <div class="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <UIcon
                :name="p.icon"
                class="size-5"
              />
            </div>
            <h3 class="font-semibold text-highlighted">
              {{ p.title }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ p.desc }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= TOPICS ========================= -->
    <section class="py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Everything you'll master
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            One curriculum, the whole platform
          </h2>
        </div>
        <div class="mx-auto flex max-w-3xl flex-wrap justify-center gap-2.5">
          <span
            v-for="t in topics"
            :key="t"
            class="rounded-full border border-default bg-default px-4 py-2 text-sm font-medium text-toned transition hover:border-primary/40 hover:text-primary"
          >
            {{ t }}
          </span>
        </div>
      </UContainer>
    </section>

    <UContainer>
      <AdUnit
        placement="footer"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ========================= RESOURCES TEASER ========================= -->
    <section class="border-y border-default bg-muted/30 py-20 sm:py-24">
      <UContainer>
        <div class="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Resources
            </p>
            <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
              The best links, curated for you
            </h2>
            <p class="mt-4 text-lg text-muted">
              Beyond the curriculum, we maintain a filterable library of official docs, Trailhead,
              SAQL references, communities, and tools — so you never have to hunt for a good source again.
            </p>
            <UButton
              to="/resources"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
              class="mt-6 rounded-full font-semibold"
            >
              Browse resources
            </UButton>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="c in ['Official docs', 'Trailhead', 'SAQL reference', 'Community & tools']"
              :key="c"
              class="flex items-center gap-2 rounded-xl border border-default bg-default p-4 text-sm font-medium text-toned"
            >
              <UIcon
                name="i-lucide-bookmark"
                class="size-4 text-primary"
              />
              {{ c }}
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= FAQ ========================= -->
    <section class="py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            Questions, answered
          </h2>
        </div>
        <div class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          <div
            v-for="f in faqs"
            :key="f.q"
            class="rounded-2xl border border-default bg-default p-6"
          >
            <h3 class="flex items-start gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-help-circle"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              {{ f.q }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ f.a }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============================ CTA ============================ -->
    <section class="pb-24">
      <UContainer>
        <div class="relative overflow-hidden rounded-3xl border border-default bg-gradient-to-br from-salesforce-600 via-salesforce-700 to-salesforce-900 px-6 py-16 text-center sm:px-12">
          <div class="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div class="relative mx-auto max-w-2xl">
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to become a CRM Analytics pro?
            </h2>
            <p class="mt-4 text-lg text-white/80">
              Begin the curriculum today — it is free, open, and built to take you all the way to certified.
            </p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <UButton
                to="/foundations"
                size="xl"
                color="neutral"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              >
                Start with Foundations
              </UButton>
              <UButton
                to="https://github.com/crm-analytics-academy/crm-analytics-academy"
                target="_blank"
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-simple-icons-github"
                class="rounded-full font-semibold text-white ring-white/30 hover:bg-white/10"
              >
                Star on GitHub
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
