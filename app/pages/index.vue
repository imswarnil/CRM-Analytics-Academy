<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()

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

// Derived, not typed. This read "18" while the hero beside it said 49 and
// the course rail said "of 49" — three numbers for one fact, two of them
// computed and the stale one hand-written. Counting the curriculum means it
// cannot drift again when a lesson is added.
const { lessons: allLessons } = useCourse()

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

// The design system gives each curriculum section its own accent: yellow,
// pink, blue, green, purple, sky — in that order. Ink text on the light
// accents, white on the saturated ones.
const moduleAccents = [
  { tile: 'bg-brand-yellow text-ink', deco: 'bg-brand-yellow-soft border-brand-yellow' },
  { tile: 'bg-brand-pink text-white', deco: 'bg-brand-pink-soft border-brand-pink' },
  { tile: 'bg-primary text-white', deco: 'bg-salesforce-100 border-primary' },
  { tile: 'bg-brand-green text-ink', deco: 'bg-brand-green-soft border-brand-green' },
  { tile: 'bg-brand-purple text-white', deco: 'bg-brand-purple-soft border-brand-purple' },
  { tile: 'bg-brand-sky text-ink', deco: 'bg-brand-sky-soft border-brand-sky' }
]

const stats = computed(() => [
  { value: String(modules.value.length), label: t('home.stats.modules') },
  { value: String(allLessons.value.length || 49), label: t('home.stats.lessons') },
  { value: '12', label: t('home.stats.languages') },
  { value: '100%', label: t('home.stats.free') }
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
  'inLanguage': locale.value,
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

// Scroll-triggered animation for the "From raw data to decisions" illustrations.
const featureRowEls = ref<(HTMLElement | null)[]>([])
const featuresPlayed = ref<boolean[]>([])
onMounted(() => {
  featuresPlayed.value = featureRowEls.value.map(() => false)
  featureRowEls.value.forEach((el, i) => {
    if (!el) return
    useIntersectionObserver(el, ([entry]) => {
      if (entry?.isIntersecting) featuresPlayed.value[i] = true
    }, { threshold: 0.35 })
  })
})

const personaIcons = ['i-lucide-line-chart', 'i-lucide-settings-2', 'i-lucide-briefcase', 'i-lucide-sprout']

const personas = computed(() =>
  (tm('home.personas') as { t: string, d: string }[]).map((p, i) => ({ icon: personaIcons[i], title: rt(p.t), desc: rt(p.d) }))
)
const faqs = computed(() =>
  (tm('home.faqs') as { q: string, a: string }[]).map(f => ({ q: rt(f.q), a: rt(f.a) }))
)

const featureKinds = ['pipeline', 'chart', 'predict']
const features = computed(() =>
  (tm('home.features') as { t: string, d: string }[]).map((f, i) => ({
    title: rt(f.t),
    desc: rt(f.d),
    kind: featureKinds[i]
  }))
)

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.value.map(f => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
  }))
})
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <!-- The design system's hero: a blue wash with big bordered circles
         breaking the corners and three candy dots floating in the space —
         decoration the neo-brutal way, drawn shapes rather than gradients. -->
    <section class="relative overflow-hidden bg-(--nb-hero)">
      <div
        class="absolute -top-24 -right-24 size-72 rounded-full border-4 border-(--nb-ink) bg-(--nb-hero-shape)"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-28 -left-28 size-80 rounded-full border-4 border-(--nb-ink) bg-(--nb-hero-shape-2)"
        aria-hidden="true"
      />
      <div
        class="absolute top-0 left-0 hidden size-32 rounded-br-full border-r-4 border-b-4 border-(--nb-ink) bg-(--nb-hero-shape-3) lg:block"
        aria-hidden="true"
      />
      <div
        class="absolute top-12 right-1/3 hidden size-5 rounded-full border-[3px] border-(--nb-ink) bg-brand-yellow lg:block"
        aria-hidden="true"
      />
      <div
        class="absolute right-40 bottom-16 hidden size-4 rotate-45 rounded border-[3px] border-(--nb-ink) bg-brand-pink lg:block"
        aria-hidden="true"
      />
      <div
        class="absolute top-32 left-52 hidden size-3.5 rounded-full border-2 border-(--nb-ink) bg-brand-green lg:block"
        aria-hidden="true"
      />

      <UContainer class="relative grid items-center gap-12 py-16 lg:grid-cols-2 sm:py-24">
        <div class="animate-fade-up">
          <UBadge
            :label="t('hero.badge')"
            icon="i-lucide-sparkles"
            size="lg"
            class="rounded-full border-[3px] border-(--nb-ink) bg-brand-yellow px-4 py-1.5 text-xs font-bold tracking-[0.06em] text-ink uppercase"
          />

          <h1 class="mt-6 text-4xl font-bold tracking-tight text-highlighted sm:text-5xl">
            {{ t('hero.titleLead') }}
            <span class="text-primary">{{ t('hero.titleAccent') }}</span>
          </h1>

          <p class="mt-5 max-w-xl text-lg text-muted">
            {{ t('hero.subtitle') }}
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              :to="localePath('/foundations')"
              :label="t('hero.start')"
              trailing-icon="i-lucide-arrow-right"
              size="xl"
            />
            <UButton
              to="#curriculum"
              :label="t('hero.browse')"
              icon="i-lucide-graduation-cap"
              color="neutral"
              variant="outline"
              size="xl"
            />
            <UButton
              icon="i-lucide-search"
              color="neutral"
              variant="ghost"
              size="xl"
              :aria-label="t('hero.search')"
              @click="useContentSearch().open.value = true"
            />
          </div>

          <!-- Three short claims, inline. Stacked they spent three lines and
               pushed the fold down; each keeps its own icon so they still read
               as three things rather than one run-on. -->
          <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li
              v-for="fact in [
                { icon: 'i-lucide-user-round-check', text: t('hero.f1') },
                { icon: 'i-lucide-book-open', text: t('hero.f2') },
                { icon: 'i-lucide-badge-check', text: t('hero.f3') }
              ]"
              :key="fact.text"
              class="flex items-center gap-1.5"
            >
              <UIcon
                :name="fact.icon"
                class="size-4 text-primary"
              />
              {{ fact.text }}
            </li>
          </ul>
        </div>

        <div class="animate-fade-up">
          <HeroStory />
        </div>
      </UContainer>
    </section>

    <!-- ============================ STATS ============================ -->
    <!-- The ink slab, pulled up over the hero's bottom edge the way the
         design draws it. Each label keeps its own accent so the row reads as
         four facts rather than one sentence. -->
    <section class="relative z-10 -mt-10">
      <UContainer>
        <dl class="grid grid-cols-2 overflow-hidden rounded-2xl border-[3px] border-(--nb-ink) bg-ink sm:grid-cols-4">
          <div
            v-for="(s, i) in stats"
            :key="s.label"
            class="border-slate-800 px-6 py-6 text-center not-last:sm:border-e max-sm:odd:border-e max-sm:[&:nth-child(-n+2)]:border-b"
          >
            <dt class="font-display text-3xl font-bold text-white">
              {{ s.value }}
            </dt>
            <dd
              class="mt-1 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
              :class="['text-brand-sky', 'text-brand-yellow', 'text-brand-green', 'text-brand-pink'][i % 4]"
            >
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
      <div
        class="absolute inset-x-0 bottom-0 h-64 bg-bars"
        aria-hidden="true"
      />
      <UContainer class="relative">
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="font-display mb-4 inline-flex items-center rounded-full border-2 border-primary bg-salesforce-100 px-3.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] text-primary uppercase dark:bg-salesforce-900">
            {{ t('home.curriculumEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.curriculumTitle') }}
          </h2>
          <p class="mt-4 text-lg text-muted">
            {{ t('home.curriculumSubtitle') }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- The design system's section cards: a coloured icon tile wearing
               the ink line, an eyebrow, and a tinted circle breaking the top
               corner. The whole card is one target via a stretched link. -->
          <article
            v-for="(m, i) in modules"
            :key="m.n"
            class="nb-card relative flex flex-col overflow-hidden p-6 transition-transform hover:-translate-y-0.5"
          >
            <div
              class="absolute -top-3 -right-3 size-12 rounded-full border-2"
              :class="moduleAccents[i % moduleAccents.length]!.deco"
              aria-hidden="true"
            />
            <div class="relative flex items-center gap-3">
              <span
                class="nb-tile size-11"
                :class="moduleAccents[i % moduleAccents.length]!.tile"
              >
                <UIcon
                  :name="m.icon"
                  class="size-5"
                />
              </span>
              <span>
                <span class="font-display block text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">{{ t('home.moduleWord') }} {{ m.n }}</span>
                <h3 class="font-display mt-0.5 text-base font-bold text-highlighted">
                  <NuxtLink
                    class="after:absolute after:inset-0"
                    :to="localePath(m.to)"
                  >{{ m.title }}</NuxtLink>
                </h3>
              </span>
            </div>

            <p class="mt-3 flex-1 text-sm text-muted">
              {{ m.desc }}
            </p>

            <div class="mt-4 flex items-center justify-between">
              <span class="text-xs font-semibold text-muted">{{ m.lessons.length }} {{ t('home.lessonsWord') }}</span>
              <span class="flex size-7 items-center justify-center rounded-full bg-ink dark:bg-slate-700">
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-white"
                />
              </span>
            </div>
          </article>

          <!-- Start-here card. Kept as the odd one out — it is the only
               card that is an instruction rather than a destination. -->
          <article class="nb-card relative flex flex-col bg-(--nb-subtle) p-6 transition-transform hover:-translate-y-0.5">
            <div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <UIcon
                name="i-lucide-flag"
                class="size-7 text-primary"
              />
              <h3 class="font-display font-bold text-highlighted">
                <NuxtLink
                  class="after:absolute after:inset-0"
                  :to="localePath('/foundations')"
                >{{ t('home.newHereTitle') }}</NuxtLink>
              </h3>
              <p class="text-sm text-muted">
                {{ t('home.newHereDesc') }}
              </p>
              <UButton
                :label="t('home.startHere')"
                trailing-icon="i-lucide-arrow-right"
                size="sm"
                class="pointer-events-none mt-2"
              />
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <UContainer>
      <AdUnit
        placement="betweenSections"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ===================== ALTERNATING FEATURES ===================== -->
    <section class="py-24 sm:py-32">
      <UContainer>
        <div class="mx-auto mb-16 max-w-2xl text-center">
          <p class="font-display mb-4 inline-flex items-center rounded-full border-2 border-primary bg-salesforce-100 px-3.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] text-primary uppercase dark:bg-salesforce-900">
            {{ t('home.featuresEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.featuresTitle') }}
          </h2>
        </div>

        <div class="space-y-16 sm:space-y-24">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <!-- Illustration — alternates side per row, animates in on scroll -->
            <div :class="i % 2 === 0 ? 'lg:order-1' : 'lg:order-2'">
              <div
                :ref="(el: unknown) => (featureRowEls[i] = el as HTMLElement)"
                class="nb-card relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden bg-(--nb-subtle) p-8 sm:min-h-[380px]"
              >
                <!-- pipeline -->
                <div
                  v-if="f.kind === 'pipeline'"
                  class="relative flex items-center justify-between gap-3"
                >
                  <div class="space-y-2.5">
                    <div
                      v-for="(s, j) in ['i-simple-icons-salesforce', 'i-simple-icons-snowflake', 'i-lucide-database']"
                      :key="j"
                      class="flex items-center gap-2 rounded-lg border border-default bg-default px-3 py-2 transition-all duration-500"
                      :class="featuresPlayed[i] ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'"
                      :style="{ transitionDelay: `${j * 120}ms` }"
                    >
                      <UIcon
                        :name="s"
                        class="size-4 text-primary"
                      />
                      <span class="h-1.5 w-12 rounded-full bg-default/40" />
                    </div>
                  </div>
                  <UIcon
                    name="i-lucide-chevrons-right"
                    class="size-6 shrink-0 text-primary/60 transition-opacity duration-700"
                    :class="featuresPlayed[i] ? 'animate-pulse opacity-100' : 'opacity-0'"
                  />
                  <div
                    class="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 transition-all duration-500"
                    :class="featuresPlayed[i] ? 'scale-100 opacity-100' : 'scale-75 opacity-0'"
                    style="transition-delay: 450ms"
                  >
                    <UIcon
                      name="i-lucide-table-2"
                      class="size-7 text-primary"
                    />
                    <span class="text-[11px] font-semibold text-primary">Dataset</span>
                  </div>
                </div>

                <!-- chart -->
                <div
                  v-else-if="f.kind === 'chart'"
                  class="relative"
                >
                  <div class="flex h-32 items-end justify-between gap-2">
                    <span
                      v-for="(h, j) in [40, 70, 55, 92, 64]"
                      :key="j"
                      class="flex-1 rounded-t-md transition-all ease-out"
                      :style="{
                        height: featuresPlayed[i] ? `${h}%` : '0%',
                        background: ['var(--color-salesforce-700)', 'var(--color-salesforce-500)', 'var(--color-salesforce-400)', 'var(--color-salesforce-300)', 'var(--color-salesforce-200)'][j],
                        transitionDuration: '650ms',
                        transitionDelay: `${j * 90}ms`
                      }"
                    />
                  </div>
                  <div class="mt-3 h-px w-full bg-default/40" />
                </div>

                <!-- predict -->
                <div
                  v-else
                  class="relative flex items-center justify-center"
                >
                  <div
                    class="relative flex size-32 items-center justify-center rounded-full transition-all duration-700 ease-out"
                    :class="featuresPlayed[i] ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'"
                    style="background: conic-gradient(var(--color-salesforce-500) 0 72%, var(--color-salesforce-200) 72% 100%)"
                  >
                    <div class="absolute inset-[18%] flex items-center justify-center rounded-full bg-muted/30 backdrop-blur">
                      <span class="text-xl font-bold text-highlighted">72%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div :class="i % 2 === 0 ? 'lg:order-2' : 'lg:order-1'">
              <h3 class="text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">
                {{ f.title }}
              </h3>
              <p class="mt-4 text-lg text-muted">
                {{ f.desc }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= WHO IT'S FOR ========================= -->
    <section class="border-t-[3px] border-(--nb-ink) bg-(--nb-hero) py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="font-display mb-4 inline-flex items-center rounded-full border-2 border-primary bg-salesforce-100 px-3.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] text-primary uppercase dark:bg-salesforce-900">
            {{ t('home.whoEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.whoTitle') }}
          </h2>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="p in personas"
            :key="p.title"
            class="nb-card p-6"
          >
            <div class="nb-tile mb-4 size-11 bg-salesforce-100 text-primary dark:bg-salesforce-900">
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

    <UContainer>
      <AdUnit
        placement="footer"
        class="max-w-3xl"
      />
    </UContainer>

    <!-- ========================= FAQ ========================= -->
    <section class="py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <p class="font-display mb-4 inline-flex items-center rounded-full border-2 border-primary bg-salesforce-100 px-3.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] text-primary uppercase dark:bg-salesforce-900">
            {{ t('home.faqEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.faqTitle') }}
          </h2>
        </div>
        <div class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          <div
            v-for="f in faqs"
            :key="f.q"
            class="nb-card p-6"
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
        <div class="relative overflow-hidden rounded-3xl border-[3px] border-(--nb-ink) bg-ink px-6 py-16 text-center sm:px-12">
          <div
            class="absolute -top-16 -left-16 size-48 rounded-full border-4 border-slate-800 bg-salesforce-900/60"
            aria-hidden="true"
          />
          <div
            class="absolute -right-12 -bottom-12 size-40 rounded-full border-4 border-slate-800 bg-salesforce-900/40"
            aria-hidden="true"
          />
          <div class="relative mx-auto max-w-2xl">
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {{ t('cta.title') }}
            </h2>
            <p class="mt-4 text-lg text-white/80">
              {{ t('cta.subtitle') }}
            </p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <UButton
                :to="localePath('/foundations')"
                size="xl"
                color="neutral"
                trailing-icon="i-lucide-arrow-right"
                class="bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              >
                {{ t('cta.startFoundations') }}
              </UButton>
              <UButton
                to="https://github.com/imswarnil/CRM-Analytics-Academy"
                target="_blank"
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-simple-icons-github"
                class="border-white bg-transparent font-semibold text-white shadow-[3px_3px_0_0_white] ring-white/30 hover:bg-white/10 hover:shadow-[5px_5px_0_0_white] active:bg-white/10 active:shadow-[1px_1px_0_0_white]"
              >
                {{ t('cta.star') }}
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
