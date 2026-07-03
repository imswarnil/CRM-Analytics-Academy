<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const { t, tm, rt } = useI18n()
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
    { name: 'Getting Started', url: `${SITE.url}/getting-started` },
    { name: 'Tour', url: `${SITE.url}/tour` },
    { name: 'Navigating Dashboards', url: `${SITE.url}/navigating` },
    { name: 'SAQL', url: `${SITE.url}/saql` },
    { name: 'Analytics & Einstein', url: `${SITE.url}/analytics` },
    { name: 'Bindings', url: `${SITE.url}/bindings` },
    { name: 'Chart Embedding', url: `${SITE.url}/chart-embedding` }
  ].map(m => ({ '@type': 'Course', 'name': m.name, 'url': m.url, 'provider': { '@type': 'Organization', 'name': SITE.name } }))
})

const stats = computed(() => [
  { value: '8', label: t('home.stats.modules') },
  { value: '24', label: t('home.stats.lessons') },
  { value: '100%', label: t('home.stats.free') },
  { value: 'AI', label: t('home.stats.ai') }
])

// The 6 new modules only have English content so far (see CLAUDE.md /
// memory: translation is a separate follow-up). `enOnly` keeps their links
// pointing at the unprefixed English route on every locale instead of a
// localized path that 404s and breaks prerendering.
const modules = computed(() => [
  { n: '01', title: t('home.modules.foundations.title'), to: '/foundations', icon: 'i-lucide-compass', desc: t('home.modules.foundations.desc'), lessons: ['What Is CRM Analytics?', 'Data & Datasets', 'Editions & Security'] },
  { n: '02', title: t('home.modules.gettingStarted.title'), to: '/getting-started', enOnly: true, icon: 'i-lucide-rocket', desc: t('home.modules.gettingStarted.desc'), lessons: ['Get Access', 'Your First App', 'Sample Apps & Data'] },
  { n: '03', title: t('home.modules.tour.title'), to: '/tour', enOnly: true, icon: 'i-lucide-map', desc: t('home.modules.tour.desc'), lessons: ['Analytics Studio Home', 'Data Manager', 'Explorer & Editors'] },
  { n: '04', title: t('home.modules.navigating.title'), to: '/navigating', enOnly: true, icon: 'i-lucide-navigation', desc: t('home.modules.navigating.desc'), lessons: ['Reading a Dashboard', 'Filtering & Faceting', 'Saved Views & Sharing'] },
  { n: '05', title: t('home.modules.saql.title'), to: '/saql', enOnly: true, icon: 'i-lucide-code', desc: t('home.modules.saql.desc'), lessons: ['SAQL Basics', 'Filter & Group', 'Functions & Aggregates', 'Debugging Queries'] },
  { n: '06', title: t('home.modules.analytics.title'), to: '/analytics', icon: 'i-lucide-terminal', desc: t('home.modules.analytics.desc'), lessons: ['Dashboards & Einstein'] },
  { n: '07', title: t('home.modules.bindings.title'), to: '/bindings', enOnly: true, icon: 'i-lucide-link', desc: t('home.modules.bindings.desc'), lessons: ['What Are Bindings?', 'Selection & Cell Bindings', 'Widget & URL Bindings'] },
  { n: '08', title: t('home.modules.chartEmbedding.title'), to: '/chart-embedding', enOnly: true, icon: 'i-lucide-frame', desc: t('home.modules.chartEmbedding.desc'), lessons: ['Ways to Embed', 'Lightning Record Pages', 'Custom Components & External'] }
])

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

const outcomeIcons = ['i-lucide-plug', 'i-lucide-wand-sparkles', 'i-lucide-terminal', 'i-lucide-layout-dashboard', 'i-lucide-brain-circuit', 'i-lucide-badge-check']
const personaIcons = ['i-lucide-line-chart', 'i-lucide-settings-2', 'i-lucide-briefcase', 'i-lucide-sprout']

const outcomes = computed(() =>
  (tm('home.outcomes') as { t: string, d: string }[]).map((o, i) => ({ icon: outcomeIcons[i], title: rt(o.t), desc: rt(o.d) }))
)
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

const projectIcons = ['i-lucide-trending-up', 'i-lucide-user-minus', 'i-lucide-headset', 'i-lucide-globe', 'i-lucide-trophy', 'i-lucide-megaphone']
const projects = computed(() =>
  (tm('home.projects') as { t: string, d: string }[]).map((p, i) => ({ title: rt(p.t), desc: rt(p.d), icon: projectIcons[i] }))
)
const submitUrl = 'https://github.com/crm-analytics-academy/crm-analytics-academy/discussions'

const topics = [
  'Data Manager', 'Connectors', 'Recipes', 'Dataflows', 'Datasets', 'Security Predicates',
  'SAQL', 'Bindings', 'Windowing', 'Lenses', 'Dashboards', 'Faceting', 'Drill-downs',
  'Einstein Discovery', 'Stories', 'Predictions', 'REST API', 'Embedding'
]
const topicsLoop = [...topics, ...topics]

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
              {{ t('hero.badge') }}
            </UBadge>

            <h1 class="text-4xl font-extrabold tracking-tight text-highlighted sm:text-6xl">
              {{ t('hero.titleLead') }}<br>
              <span class="text-gradient">{{ t('hero.titleAccent') }}</span>.
            </h1>

            <p class="mt-6 max-w-xl text-lg text-muted">
              {{ t('hero.subtitle') }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                :to="localePath('/foundations')"
                size="xl"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full font-semibold"
              >
                {{ t('hero.start') }}
              </UButton>
              <UButton
                to="#curriculum"
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-graduation-cap"
                class="rounded-full font-semibold"
              >
                {{ t('hero.browse') }}
              </UButton>
              <UTooltip :text="t('hero.search')">
                <UButton
                  icon="i-lucide-search"
                  size="xl"
                  color="neutral"
                  variant="outline"
                  square
                  class="rounded-full"
                  :aria-label="t('hero.search')"
                  @click="useContentSearch().open.value = true"
                />
              </UTooltip>
            </div>

            <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-dimmed">
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> {{ t('hero.f1') }}</span>
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> {{ t('hero.f2') }}</span>
              <span class="flex items-center gap-1.5"><UIcon
                name="i-lucide-check"
                class="size-4 text-primary"
              /> {{ t('hero.f3') }}</span>
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
            {{ t('home.curriculumEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.curriculumTitle') }}
          </h2>
          <p class="mt-4 text-lg text-muted">
            {{ t('home.curriculumSubtitle') }}
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="m in modules"
            :key="m.n"
            :to="m.enOnly ? m.to : localePath(m.to)"
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

            <!-- Lesson preview — revealed on hover -->
            <ul class="mt-4 max-h-0 space-y-1.5 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:opacity-100">
              <li
                v-for="lesson in m.lessons"
                :key="lesson"
                class="flex items-center gap-2 text-xs font-medium text-toned"
              >
                <UIcon
                  name="i-lucide-file-text"
                  class="size-3.5 shrink-0 text-primary"
                />
                {{ lesson }}
              </li>
            </ul>

            <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {{ t('home.startModule') }}
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
              {{ t('home.newHereTitle') }}
            </h3>
            <p class="mt-2 text-sm text-white/80">
              {{ t('home.newHereDesc') }}
            </p>
            <UButton
              :to="localePath('/foundations')"
              color="neutral"
              variant="solid"
              class="mt-5 w-fit rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.startHere') }}
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

    <!-- ===================== ALTERNATING FEATURES ===================== -->
    <section class="py-24 sm:py-32">
      <UContainer>
        <div class="mx-auto mb-16 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
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
                :ref="el => (featureRowEls[i] = el as HTMLElement)"
                class="relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-default bg-muted/30 p-8 sm:min-h-[380px]"
              >
                <div class="absolute -inset-8 bg-primary/10 blur-3xl" />

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

    <!-- ========================= OUTCOMES ========================= -->
    <section class="border-t border-default py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {{ t('home.outcomesEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.outcomesTitle') }}
          </h2>
          <p class="mt-4 text-lg text-muted">
            {{ t('home.outcomesSubtitle') }}
          </p>
        </div>

        <div class="relative mx-auto max-w-3xl">
          <div class="absolute top-0 bottom-0 left-5 w-px bg-default sm:left-1/2 sm:-translate-x-1/2" />

          <div class="space-y-8">
            <div
              v-for="(o, i) in outcomes"
              :key="o.title"
              class="relative pl-14 sm:pl-0"
            >
              <div class="absolute left-5 top-0 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-default text-primary sm:left-1/2 sm:size-11">
                <UIcon
                  :name="o.icon"
                  class="size-4 sm:size-5"
                />
              </div>

              <div
                class="sm:flex sm:items-center"
                :class="i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'"
              >
                <div
                  class="sm:w-1/2"
                  :class="i % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'"
                >
                  <div class="rounded-2xl border border-default bg-default p-5 transition hover:border-primary/40 hover:bg-muted/30">
                    <h3 class="font-semibold text-highlighted">
                      {{ o.title }}
                    </h3>
                    <p class="mt-1.5 text-sm text-muted">
                      {{ o.desc }}
                    </p>
                  </div>
                </div>
                <div class="hidden sm:block sm:w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ========================= WHO IT'S FOR ========================= -->
    <section class="border-t border-default bg-muted/30 py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
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
            {{ t('home.topicsEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.topicsTitle') }}
          </h2>
        </div>
      </UContainer>

      <div class="group relative mt-2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div class="animate-marquee flex w-max gap-2.5 py-2 group-hover:[animation-play-state:paused]">
          <span
            v-for="(topic, i) in topicsLoop"
            :key="`${topic}-${i}`"
            class="shrink-0 rounded-full border border-default bg-default px-4 py-2 text-sm font-medium text-toned transition hover:border-primary/40 hover:text-primary"
          >
            {{ topic }}
          </span>
        </div>
      </div>
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
              {{ t('home.resourcesEyebrow') }}
            </p>
            <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
              {{ t('home.resourcesTitle') }}
            </h2>
            <p class="mt-4 text-lg text-muted">
              {{ t('home.resourcesDesc') }}
            </p>
            <p class="mt-6 text-sm text-muted">
              {{ t('home.getInvolved.blurb') }}
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <UButton
                :to="localePath('/resources')"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full font-semibold"
              >
                {{ t('home.browseResources') }}
              </UButton>
              <UButton
                :to="localePath('/contribute')"
                size="lg"
                color="neutral"
                variant="outline"
                icon="i-lucide-git-pull-request"
                class="rounded-full font-semibold"
              >
                {{ t('home.getInvolved.contribute') }}
              </UButton>
              <UButton
                :to="localePath('/sponsor')"
                size="lg"
                color="neutral"
                variant="outline"
                icon="i-lucide-heart"
                class="rounded-full font-semibold"
              >
                {{ t('home.getInvolved.sponsor') }}
              </UButton>
            </div>
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

    <!-- ===================== PROJECTS SHOWCASE ===================== -->
    <section class="border-t border-default bg-muted/30 py-20 sm:py-24">
      <UContainer>
        <div class="mx-auto mb-14 max-w-2xl text-center">
          <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            {{ t('home.projectsEyebrow') }}
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
            {{ t('home.projectsTitle') }}
          </h2>
          <p class="mt-4 text-lg text-muted">
            {{ t('home.projectsSubtitle') }}
          </p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="p in projects"
            :key="p.title"
            class="group rounded-2xl border border-default bg-default p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <div class="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary group-hover:text-inverted">
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

          <!-- Submit-your-dashboard card -->
          <div class="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-salesforce-600 to-salesforce-800 p-6 text-white">
            <UIcon
              name="i-lucide-plus-circle"
              class="mb-4 size-8"
            />
            <h3 class="text-lg font-semibold">
              {{ t('home.submitTitle') }}
            </h3>
            <p class="mt-2 text-sm text-white/80">
              {{ t('home.submitDesc') }}
            </p>
            <UButton
              :to="submitUrl"
              target="_blank"
              color="neutral"
              class="mt-5 w-fit rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              trailing-icon="i-lucide-arrow-up-right"
            >
              {{ t('home.submitButton') }}
            </UButton>
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
                class="rounded-full bg-white font-semibold text-salesforce-700 hover:bg-white/90"
              >
                {{ t('cta.startFoundations') }}
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
                {{ t('cta.star') }}
              </UButton>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
