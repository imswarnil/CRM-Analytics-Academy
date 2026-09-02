<script setup lang="ts">
const { t, tm, rt, locale, locales } = useI18n()
const localePath = useLocalePath()

// The BCP-47 tag of the locale this copy of the page is prerendered for —
// every language emits its own JSON-LD, so 'en' hardcoded here would tell
// search engines all twelve copies are English.
const bcp47 = computed(() => locales.value.find(l => l.code === locale.value)?.language || locale.value)

const title = computed(() => t('seo.homeTitle'))
const description = computed(() => t('seo.homeDesc'))

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title: title.value, description: description.value })

const stats = computed(() => [
  { icon: 'i-lucide-book-open', value: '18', label: t('home.stats.lessons') },
  { icon: 'i-lucide-clapperboard', value: '42m', label: t('home.stats.video') },
  { icon: 'i-lucide-badge-check', value: '100%', label: t('home.stats.free') }
])

// The course is currently one video-led track ("CRM Analytics Foundations").
// Each lesson pairs a clip of the Tableau CRM / CRM Analytics training video
// with an article; the section closes with interview prep.
const modules = computed(() => [
  {
    n: '01',
    title: 'CRM Analytics Foundations',
    to: '/foundations',
    icon: 'i-lucide-compass',
    desc: t('home.modules.foundations.desc'),
    lessons: [
      'Welcome + Your Free Dev Org',
      'What Is CRM Analytics?',
      'Architecture & Data Flow',
      'The Data Layer',
      'The Design Layer',
      'The Intelligence Layer',
      'Hands-On Tour',
      'Six Steps to Adoption',
      'Interview Questions',
      'Graded Quiz'
    ]
  },
  {
    n: '02',
    title: 'Setup & User Provisioning',
    to: '/setup',
    icon: 'i-lucide-settings-2',
    desc: 'Set up CRM Analytics the right way: provision users, assign licenses and permission sets, and configure the integration and security users.',
    lessons: [
      'Provisioning Users',
      'Licenses & Permission Sets',
      'The Integration User',
      'The Security User',
      'Analytics Settings',
      'Assigning Access',
      'Graded Quiz',
      'Interview Questions'
    ]
  },
  {
    n: '03',
    title: 'Creating Datasets',
    to: '/creating-datasets',
    icon: 'i-lucide-database',
    desc: 'Get data into CRM Analytics and shape it: upload CSVs, build datasets with Dataset Builder and recipes, master grain and lookups, and combine sources into a final dataset.',
    lessons: [
      'What Is a Dataset?',
      'The Data Landscape',
      'Upload a CSV',
      'Grain, Lookups & Joins',
      'Dataset Builder',
      'Run the Dataflow',
      'Build with a Recipe',
      'Combine Datasets',
      'Interview Questions',
      'Graded Quiz'
    ]
  },
  {
    n: '04',
    title: 'Lenses & Explorations',
    to: '/lenses-and-explorations',
    icon: 'i-lucide-search',
    desc: 'Explore a dataset without building a dashboard: work the lens/Explorer mode, switch between chart, table, and SAQL, and edit dataset field metadata so every chart inherits the right labels, colors, and formats.',
    lessons: [
      'What Is a Lens?',
      'Analytics Tab & Apps',
      'Explorer Mode Basics',
      'Chart, Table & SAQL',
      'Editing Fields',
      'Conversational Analytics',
      'Graded Quiz',
      'Interview Questions'
    ]
  },
  {
    n: '05',
    title: 'Designing Dashboards',
    to: '/designing-dashboards',
    icon: 'i-lucide-layout-dashboard',
    desc: 'Craft dashboards people actually use: conditional formatting, date toggles and faceting, image-rich tables, custom tooltips and chart markers, KPI micro charts, and links that carry filters between dashboards.',
    lessons: [
      'Designing Dashboards',
      'Conditional Formatting',
      'Date Toggles & Faceting',
      'Tables, Images & Themes',
      'Tooltips & Chart Markers',
      'KPI Micro Charts',
      'Linking Dashboards',
      'Graded Quiz',
      'Interview Questions'
    ]
  },
  {
    n: '06',
    title: 'Collaboration',
    to: '/collaboration',
    icon: 'i-lucide-users',
    desc: 'Drive adoption with what the license already gives you: sharing, threshold notifications, annotations, exports, self-service exploration, saved views, subscriptions and watchlists, and in-widget onboarding videos.',
    lessons: [
      'Why Collaboration Matters',
      'Sharing a Dashboard',
      'Notifications & Annotations',
      'Downloading Data',
      'Self-Service Explore',
      'Views',
      'Subscriptions & Watchlists',
      'Onboarding & Learn',
      'Graded Quiz',
      'Interview Questions'
    ]
  }
])

// Course rich-snippet: the site is one Course; each module is a sub-Course whose
// lessons are its syllabus sections. Free offer + online instance keep it valid
// for Google's Course rich result.
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Course',
  'name': SITE.name,
  'description': SITE.description,
  'url': SITE.url,
  'inLanguage': bcp47.value,
  'isAccessibleForFree': true,
  'provider': { '@type': 'Organization', 'name': SITE.name, 'sameAs': SITE.url },
  'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
  'hasCourseInstance': {
    '@type': 'CourseInstance',
    'courseMode': 'online',
    'courseWorkload': 'PT12H',
    'instructor': { '@type': 'Person', 'name': SITE.author }
  },
  'hasPart': modules.value.map(m => ({
    '@type': 'Course',
    'name': m.title,
    'url': `${SITE.url}${m.to}`,
    'description': m.desc,
    'provider': { '@type': 'Organization', 'name': SITE.name },
    'isAccessibleForFree': true,
    'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': 'PT1H30M' },
    'syllabusSections': m.lessons.map((l, li) => ({ '@type': 'Syllabus', 'name': l, 'position': li + 1 }))
  }))
})

const personaIcons = ['i-lucide-line-chart', 'i-lucide-settings-2', 'i-lucide-briefcase', 'i-lucide-sprout']

const personas = computed(() =>
  (tm('home.personas') as { t: string, d: string }[]).map((p, i) => ({ icon: personaIcons[i], title: rt(p.t), description: rt(p.d) }))
)

const faqs = computed(() =>
  (tm('home.faqs') as { q: string, a: string }[]).map(f => ({ q: rt(f.q), a: rt(f.a) }))
)

const faqItems = computed(() =>
  faqs.value.map(f => ({ label: f.q, content: f.a, icon: 'i-lucide-circle-help' }))
)

// The three value props, rendered by UPageSection's features grid with an
// icon standing in for each illustration.
const featureIcons = ['i-lucide-workflow', 'i-lucide-chart-column-big', 'i-lucide-sparkles']
const features = computed(() =>
  (tm('home.features') as { t: string, d: string }[]).map((f, i) => ({
    title: rt(f.t),
    description: rt(f.d),
    icon: featureIcons[i]
  }))
)

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'inLanguage': bcp47.value,
  'mainEntity': faqs.value.map(f => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
  }))
})

// The ecosystem teasers: community, companies, careers.
const explore = computed(() => [
  { icon: 'i-lucide-heart-handshake', title: t('nav.wallOfFame'), description: t('home.exploreWall'), to: localePath('/wall-of-fame') },
  { icon: 'i-lucide-building-2', title: t('nav.companies'), description: t('home.exploreCompanies'), to: localePath('/companies') },
  { icon: 'i-lucide-briefcase', title: t('nav.jobs'), description: t('home.exploreJobs'), to: localePath('/jobs') }
])

// Decorative icon chips floating over the hero backdrop. Purely visual:
// hidden from assistive tech, pointer-transparent, stilled by the
// prefers-reduced-motion override on .animate-float.
const floatChips = [
  { icon: 'i-lucide-line-chart', style: { top: '16%', left: '44%', animationDuration: '7s' } },
  { icon: 'i-lucide-sparkles', style: { top: '9%', right: '5%', animationDuration: '9s', animationDelay: '1.2s' } },
  { icon: 'i-lucide-database', style: { bottom: '18%', left: '47%', animationDuration: '8s', animationDelay: '0.6s' } },
  { icon: 'i-lucide-trophy', style: { bottom: '10%', right: '3%', animationDuration: '10s', animationDelay: '2s' } }
]

const heroLinks = computed(() => [
  {
    label: t('hero.start'),
    to: localePath('/foundations'),
    trailingIcon: 'i-lucide-arrow-right',
    size: 'xl' as const
  },
  {
    label: t('hero.browse'),
    to: '#curriculum',
    color: 'neutral' as const,
    variant: 'outline' as const,
    icon: 'i-lucide-graduation-cap',
    size: 'xl' as const
  },
  {
    'icon': 'i-lucide-search',
    'color': 'neutral' as const,
    'variant': 'outline' as const,
    'size': 'xl' as const,
    'aria-label': t('hero.search'),
    'onClick': () => {
      useContentSearch().open.value = true
    }
  }
])
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-grid"
        aria-hidden="true"
      />
      <div
        class="absolute -top-32 -left-32 size-96 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="absolute -top-20 right-0 size-80 rounded-full bg-salesforce-400/10 blur-3xl"
        aria-hidden="true"
      />

      <!-- Floating icon chips, drifting at different speeds over the grid. -->
      <div
        class="pointer-events-none absolute inset-0 hidden xl:block"
        aria-hidden="true"
      >
        <div
          v-for="chip in floatChips"
          :key="chip.icon"
          class="animate-float absolute flex size-12 items-center justify-center rounded-2xl border border-default bg-default/80 shadow-sm backdrop-blur"
          :style="chip.style"
        >
          <UIcon
            :name="chip.icon"
            class="size-6 text-primary"
          />
        </div>
      </div>

      <UPageHero
        orientation="horizontal"
        :description="t('hero.subtitle')"
        :links="heroLinks"
        class="relative"
        :ui="{ container: 'lg:gap-16' }"
      >
        <template #headline>
          <UBadge
            color="primary"
            variant="subtle"
            size="lg"
            icon="i-lucide-sparkles"
            class="rounded-full"
          >
            {{ t('hero.badge') }}
          </UBadge>
        </template>

        <template #title>
          {{ t('hero.titleLead') }}<br>
          <span class="text-primary">{{ t('hero.titleAccent') }}</span>.
        </template>

        <template #footer>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-dimmed">
            <span
              v-for="f in [t('hero.f1'), t('hero.f2'), t('hero.f3')]"
              :key="f"
              class="flex items-center gap-1.5"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              />
              {{ f }}
            </span>
          </div>
        </template>

        <!-- The hero's media: the six modules as icon thumbnails. This is the
           actual product, so it beats any illustration — and each tile is a
           real link into its module. -->
        <div class="grid grid-cols-2 gap-3">
          <UPageCard
            v-for="(m, i) in modules"
            :key="m.n"
            :icon="m.icon"
            :title="m.title"
            :description="`${m.lessons.length} ${t('home.stats.lessons')}`"
            :to="localePath(m.to)"
            variant="subtle"
            class="animate-fade-up"
            :style="{ animationDelay: `${i * 80}ms` }"
            :ui="{
              container: 'p-4 sm:p-4',
              leadingIcon: 'size-8 text-primary',
              title: 'text-sm',
              description: 'text-xs'
            }"
          />
        </div>
      </UPageHero>
    </section>

    <!-- ============================ STATS ============================ -->
    <UContainer>
      <UPageGrid class="lg:grid-cols-3">
        <ScrollReveal
          v-for="(s, i) in stats"
          :key="s.label"
          :delay="i * 120"
        >
          <UPageCard
            :icon="s.icon"
            variant="subtle"
            orientation="horizontal"
            class="h-full"
            :ui="{ leadingIcon: 'size-10 text-primary' }"
          >
            <template #title>
              <span class="text-3xl font-bold tabular-nums">{{ s.value }}</span>
            </template>
            <template #description>
              {{ s.label }}
            </template>
          </UPageCard>
        </ScrollReveal>
      </UPageGrid>

      <AdUnit
        placement="belowHero"
        class="max-w-4xl"
      />
    </UContainer>

    <!-- ========================= CURRICULUM ========================= -->
    <UPageSection
      id="curriculum"
      :headline="t('home.curriculumEyebrow')"
      :title="t('home.curriculumTitle')"
      :description="t('home.curriculumSubtitle')"
      class="scroll-mt-24"
    >
      <UPageGrid>
        <ScrollReveal
          v-for="(m, mi) in modules"
          :key="m.n"
          :delay="(mi % 3) * 120"
        >
          <UPageCard
            :icon="m.icon"
            :title="m.title"
            :description="m.desc"
            :to="localePath(m.to)"
            spotlight
            class="h-full"
            :ui="{ leadingIcon: 'size-10 text-primary' }"
          >
            <template #footer>
              <div class="flex items-center justify-between">
                <UBadge
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-book-open"
                >
                  {{ m.lessons.length }} {{ t('home.stats.lessons') }}
                </UBadge>
                <span class="flex items-center gap-1 text-sm font-medium text-primary">
                  {{ t('home.startModule') }}
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4"
                  />
                </span>
              </div>
            </template>
          </UPageCard>
        </ScrollReveal>

        <!-- Start-here call card -->
        <ScrollReveal>
          <UPageCard
            icon="i-lucide-flag"
            :title="t('home.newHereTitle')"
            :description="t('home.newHereDesc')"
            variant="solid"
            :ui="{ leadingIcon: 'size-8' }"
          >
            <template #footer>
              <UButton
                :to="localePath('/foundations')"
                color="neutral"
                variant="solid"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ t('home.startHere') }}
              </UButton>
            </template>
          </UPageCard>
        </ScrollReveal>
      </UPageGrid>
    </UPageSection>

    <UContainer>
      <AdUnit
        placement="betweenSections"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ========================= FEATURES ========================= -->
    <UPageSection
      :headline="t('home.featuresEyebrow')"
      :title="t('home.featuresTitle')"
      class="bg-dots"
    >
      <UPageGrid class="lg:grid-cols-3">
        <ScrollReveal
          v-for="(f, fi) in features"
          :key="f.title"
          :delay="fi * 120"
        >
          <UPageCard
            :title="f.title"
            :description="f.description"
            variant="naked"
            class="h-full text-center"
            :ui="{ container: 'items-center' }"
          >
            <template #leading>
              <div class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20">
                <UIcon
                  :name="f.icon"
                  class="size-10 text-primary"
                />
              </div>
            </template>
          </UPageCard>
        </ScrollReveal>
      </UPageGrid>
    </UPageSection>

    <!-- ========================= ECOSYSTEM ========================= -->
    <UPageSection
      :headline="t('home.exploreEyebrow')"
      :title="t('home.exploreTitle')"
      :description="t('home.exploreSubtitle')"
    >
      <UPageGrid class="lg:grid-cols-3">
        <ScrollReveal
          v-for="(e, ei) in explore"
          :key="e.to"
          :delay="ei * 120"
        >
          <UPageCard
            :title="e.title"
            :description="e.description"
            :to="e.to"
            spotlight
            class="h-full"
          >
            <template #leading>
              <div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <UIcon
                  :name="e.icon"
                  class="size-8 text-primary"
                />
              </div>
            </template>
            <template #footer>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-5 text-primary"
              />
            </template>
          </UPageCard>
        </ScrollReveal>
      </UPageGrid>
    </UPageSection>

    <!-- ========================= WHO IT'S FOR ========================= -->
    <UPageSection
      :headline="t('home.whoEyebrow')"
      :title="t('home.whoTitle')"
      class="bg-muted/30"
    >
      <UPageGrid class="lg:grid-cols-4">
        <ScrollReveal
          v-for="(p, pi) in personas"
          :key="p.title"
          :delay="pi * 100"
        >
          <UPageCard
            :title="p.title"
            :description="p.description"
            variant="outline"
            class="h-full"
          >
            <template #leading>
              <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <UIcon
                  :name="p.icon"
                  class="size-7 text-primary"
                />
              </div>
            </template>
          </UPageCard>
        </ScrollReveal>
      </UPageGrid>
    </UPageSection>

    <UContainer>
      <AdUnit
        placement="footer"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ========================= FAQ ========================= -->
    <UPageSection
      :headline="t('home.faqEyebrow')"
      :title="t('home.faqTitle')"
    >
      <ScrollReveal>
        <UAccordion
          :items="faqItems"
          type="multiple"
          class="mx-auto max-w-3xl"
        />
      </ScrollReveal>
    </UPageSection>

    <!-- ============================ CTA ============================ -->
    <UPageSection>
      <ScrollReveal>
        <UPageCTA
          :title="t('cta.title')"
          :description="t('cta.subtitle')"
          variant="solid"
          :links="[
            {
              label: t('cta.startFoundations'),
              to: localePath('/foundations'),
              color: 'neutral',
              size: 'xl',
              trailingIcon: 'i-lucide-arrow-right'
            },
            {
              label: t('cta.star'),
              to: 'https://github.com/imswarnil/CRM-Analytics-Academy',
              target: '_blank',
              color: 'neutral',
              variant: 'outline',
              size: 'xl',
              icon: 'i-simple-icons-github'
            }
          ]"
        />
      </ScrollReveal>
    </UPageSection>
  </div>
</template>
