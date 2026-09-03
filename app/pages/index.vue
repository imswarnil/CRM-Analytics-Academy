<script setup lang="ts">
const { t, tm, rt, locale, locales, setLocale } = useI18n()
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
  { icon: 'i-lucide-book-open', value: '49', label: t('home.stats.lessons') },
  { icon: 'i-lucide-clapperboard', value: '42m', label: t('home.stats.video') },
  { icon: 'i-lucide-badge-check', value: '100%', label: t('home.stats.free') }
])

// The course is currently one video-led track ("CRM Analytics Foundations").
// Each lesson pairs a clip of the Tableau CRM / CRM Analytics training video
// with an article; the section closes with interview prep.
const modules = computed(() => [
  {
    n: '01',
    kind: 'foundations' as const,
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
    kind: 'setup' as const,
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
    kind: 'datasets' as const,
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
    kind: 'lenses' as const,
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
    kind: 'dashboards' as const,
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
    kind: 'collaboration' as const,
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

const faqs = computed(() =>
  (tm('home.faqs') as { q: string, a: string }[]).map(f => ({ q: rt(f.q), a: rt(f.a) }))
)

const faqItems = computed(() =>
  faqs.value.map(f => ({ label: f.q, content: f.a, icon: 'i-lucide-circle-help' }))
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

// The three value props, drawn as icon features by UPageSection.
const featureIcons = ['i-lucide-workflow', 'i-lucide-chart-column-big', 'i-lucide-sparkles']
const features = computed(() =>
  (tm('home.features') as { t: string, d: string }[]).map((f, i) => ({
    title: rt(f.t),
    description: rt(f.d),
    icon: featureIcons[i]
  }))
)

// Flags come from the locale's own BCP-47 region subtag (en-US → us,
// pt-BR → br, ar-SA → sa), so the map can never drift from nuxt.config.
type LocaleLike = { code: string, language?: string, name?: string }
const flagFor = (l?: LocaleLike) => {
  const region = (l?.language || '').split('-')[1]?.toLowerCase()
  return region ? `i-circle-flags-${region}` : 'i-lucide-globe'
}
const currentLocale = computed<LocaleLike | undefined>(() => locales.value.find(l => l.code === locale.value))
const otherLocales = computed(() => locales.value.filter(l => l.code !== locale.value))

// Hero social proof: initials avatars standing in for the community.
const communityAvatars = ['SS', 'RH', 'MC', 'CB', 'MT', 'BB']

// Exactly two calls to action: begin, or see what's inside first.
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
  }
])
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <section class="relative overflow-hidden">
      <div
        class="bg-grid animate-grid-pan absolute inset-0"
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

      <UPageHero
        orientation="horizontal"
        :description="t('hero.subtitle')"
        class="relative"
        :ui="{
          container: 'max-w-7xl px-6 lg:px-10 py-12 sm:py-16 lg:py-20 lg:gap-16',
          title: 'text-4xl sm:text-6xl'
        }"
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
          <div class="space-y-5">
            <!-- The action row lives here by hand: UPageHero renders its
                 `links` prop as the footer slot's DEFAULT content, so a
                 custom footer must re-render them or they vanish. -->
            <div class="flex flex-wrap gap-3">
              <UButton
                v-for="(link, li) in heroLinks"
                :key="li"
                v-bind="link"
              />
            </div>

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
          </div>
        </template>

        <div class="relative lg:me-4">
          <HeroVideo
            id="aPwndqsmaGk"
            :start="19"
            :title="t('hero.watch')"
          />

          <!-- Floating proof around the frame: two medium stats and the
               community faces, drifting slowly. Decorative duplicates of
               real page content, so hidden from assistive tech. -->
          <div
            class="animate-float absolute -top-5 -left-4 flex items-center gap-2.5 rounded-xl border border-default bg-default/90 px-4 py-2.5 shadow-lg backdrop-blur max-sm:hidden"
            style="animation-duration: 8s"
            aria-hidden="true"
          >
            <UIcon
              :name="stats[0]!.icon"
              class="size-5 text-primary"
            />
            <div>
              <p class="text-sm font-bold text-highlighted tabular-nums">
                {{ stats[0]!.value }}
              </p>
              <p class="text-xs text-muted">
                {{ stats[0]!.label }}
              </p>
            </div>
          </div>

          <div
            class="animate-float absolute -right-3 -bottom-5 flex items-center gap-2.5 rounded-xl border border-default bg-default/90 px-4 py-2.5 shadow-lg backdrop-blur max-sm:hidden"
            style="animation-duration: 9s; animation-delay: 0.8s"
            aria-hidden="true"
          >
            <UIcon
              :name="stats[1]!.icon"
              class="size-5 text-primary"
            />
            <div>
              <p class="text-sm font-bold text-highlighted tabular-nums">
                {{ stats[1]!.value }}
              </p>
              <p class="text-xs text-muted">
                {{ stats[1]!.label }}
              </p>
            </div>
          </div>

          <div
            class="animate-float absolute -top-5 -right-3 flex items-center gap-2 rounded-xl border border-default bg-default/90 px-3 py-2 shadow-lg backdrop-blur max-sm:hidden"
            style="animation-duration: 10s; animation-delay: 0.4s"
            aria-hidden="true"
          >
            <UAvatarGroup
              size="xs"
              :max="4"
            >
              <UAvatar
                v-for="a in communityAvatars"
                :key="a"
                :text="a"
                class="bg-primary/10 text-primary"
              />
            </UAvatarGroup>
          </div>
        </div>
      </UPageHero>
    </section>

    <!-- ============================ STATS ============================ -->
    <UContainer>
      <AdUnit
        placement="belowHero"
        class="max-w-4xl"
      />
    </UContainer>

    <!-- ========================= LANGUAGES ========================= -->
    <!-- The multilingual promise, made tangible: pick a language, keep
         studying. setLocale persists the choice and rewrites every URL. -->
    <section class="border-b border-default bg-muted/20">
      <UContainer class="max-w-7xl px-6 py-12 lg:px-10">
        <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <!-- The bento's feature tile: what you're reading right now. -->
          <div class="flex flex-col justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:col-span-2 sm:row-span-2">
            <div>
              <p class="flex items-center gap-2 text-lg font-bold text-highlighted">
                <UIcon
                  name="i-lucide-languages"
                  class="size-5 text-primary"
                />
                {{ t('home.langTitle') }}
              </p>
              <p class="mt-2 max-w-sm text-sm text-muted">
                {{ t('home.langSubtitle') }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <UIcon
                :name="flagFor(currentLocale)"
                class="size-12 shrink-0 rounded-full"
              />
              <div>
                <p class="text-xl font-bold text-highlighted">
                  {{ currentLocale?.name || locale }}
                </p>
                <p class="text-xs tracking-widest text-primary uppercase">
                  {{ currentLocale?.language }}
                </p>
              </div>
            </div>
          </div>

          <!-- Every other language, one tile each. -->
          <button
            v-for="l in otherLocales"
            :key="l.code"
            type="button"
            class="group flex items-center gap-3 rounded-xl border border-default bg-default p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            @click="setLocale(l.code)"
          >
            <UIcon
              :name="flagFor(l)"
              class="size-8 shrink-0 rounded-full"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-highlighted">{{ l.name || l.code }}</span>
              <span class="block text-xs text-dimmed uppercase">{{ l.code }}</span>
            </span>
          </button>
        </div>
      </UContainer>
    </section>

    <!-- ========================= CURRICULUM ========================= -->
    <UPageSection
      id="curriculum"
      :headline="t('home.curriculumEyebrow')"
      :title="t('home.curriculumTitle')"
      :description="t('home.curriculumSubtitle')"
      class="scroll-mt-24"
      :ui="{ container: 'max-w-7xl px-6 lg:px-10 py-12 sm:py-16 lg:py-20' }"
    >
      <UPageGrid>
        <ScrollReveal
          v-for="(m, mi) in modules"
          :key="m.n"
          :delay="(mi % 3) * 120"
        >
          <NuxtLink
            :to="localePath(m.to)"
            class="group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-default transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <ModuleThumb :kind="m.kind" />
            <div class="flex grow flex-col p-5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold tracking-widest text-primary uppercase">{{ t('home.curriculumEyebrow') }} {{ m.n }}</span>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  icon="i-lucide-book-open"
                  class="rounded-full"
                >
                  {{ m.lessons.length }}
                </UBadge>
              </div>
              <h3 class="mt-2 text-lg font-semibold text-highlighted">
                {{ m.title }}
              </h3>
              <p class="mt-2 line-clamp-3 grow text-sm text-muted">
                {{ m.desc }}
              </p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {{ t('home.startModule') }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </NuxtLink>
        </ScrollReveal>
      </UPageGrid>
    </UPageSection>

    <!-- ========================= WHY THIS COURSE ========================= -->
    <!-- The library's own section anatomy: headline, title, and its
         built-in three-up feature grid. -->
    <UPageSection
      :headline="t('home.featuresEyebrow')"
      :title="t('home.featuresTitle')"
      :features="features"
      :ui="{ container: 'max-w-7xl px-6 lg:px-10 py-12 sm:py-16 lg:py-20' }"
    />

    <!-- ========================= NEWSLETTER ========================= -->
    <NewsletterSection />

    <!-- ========================= ECOSYSTEM ========================= -->
    <UPageSection
      :headline="t('home.exploreEyebrow')"
      :title="t('home.exploreTitle')"
      :description="t('home.exploreSubtitle')"
      :ui="{ container: 'max-w-7xl px-6 lg:px-10 py-12 sm:py-16 lg:py-20' }"
    >
      <UPageGrid class="lg:grid-cols-3">
        <ScrollReveal
          v-for="(e, ei) in explore"
          :key="e.to"
          :delay="ei * 120"
          :class="ei === 0 ? 'lg:col-span-2' : ''"
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
      :ui="{ container: 'max-w-5xl px-6 py-12 sm:py-16 lg:py-20' }"
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
    <UPageSection :ui="{ container: 'max-w-7xl px-6 lg:px-10 py-12 sm:py-16 lg:py-20' }">
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
