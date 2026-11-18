<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { ROADMAP } from '~/data/roadmap'
import { AUTHOR } from '~/data/author'

/**
 * The home page, kept to what a first-time visitor needs: what the course
 * is (hero), what is in it (the curriculum, plotted, once published), a free account, the Wall of Fame, who wrote it, and the common questions. Everything is prerendered per locale;
 * nothing here fetches at runtime.
 */
const { t, tm, rt, locale, locales } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

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

// Counted from the navigation tree rather than typed, because a hardcoded
// lesson count is wrong within a week of anybody adding a lesson.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

// Published lessons only: a section's "coming soon" page is not a lesson.
const lessonCount = computed(() =>
  (navigation.value ?? []).reduce((n, m) => n + ((m.children ?? []) as { comingSoon?: boolean }[]).filter(l => !l.comingSoon).length, 0)
)

/**
 * The curriculum rows, derived from the same navigation tree the sidebar and
 * /curriculum read, so title, route, lesson count and order cannot drift.
 * Only the one-line description per section is authored, in en.json
 * (`home.blurbs.<section slug>`), so it is translated with everything else.
 */
const blurbs = computed(() => (tm('home.blurbs') ?? {}) as Record<string, string>)
const blurb = (slug: string) => (blurbs.value[slug] ? rt(blurbs.value[slug]) : '')

function slugOf(path: string) {
  return String(path).split('/').filter(Boolean).pop() ?? ''
}

const { of: lessonMeta } = useLessonMeta()
// Every planned section (app/data/roadmap.ts); `live` counts its published
// lessons, not counting the section's own overview page.
const path = computed(() => ROADMAP.map((sec) => {
  const mod = (navigation.value ?? []).find(m => slugOf(String(m.path ?? '')) === sec.slug)
  const kids = (mod?.children ?? []) as { comingSoon?: boolean, path?: string }[]
  return { ...sec, live: kids.filter(l => !l.comingSoon && l.path !== mod?.path).length }
}))

const modules = computed(() =>
  (navigation.value ?? []).map((mod, i) => {
    const slug = slugOf(String(mod.path ?? ''))
    return {
      n: String(i).padStart(2, '0'),
      title: String(mod.title ?? ''),
      to: String(mod.path ?? ''),
      desc: blurb(slug),
      soon: ((mod.children ?? []) as { comingSoon?: boolean }[]).every(l => l.comingSoon),
      lessons: ((mod.children ?? []) as ContentNavigationItem[]).map(l => ({
        title: String(l.title ?? ''),
        to: String(l.path ?? ''),
        ...lessonMeta(String(l.path ?? ''))
      }))
    }
  })
)

// The localized home URL: SITE.url for English, SITE.url/es for Spanish …
const homeUrl = computed(() => `${SITE.url}${localePath('/') === '/' ? '' : localePath('/')}`)

// Course rich-snippet: the site is one Course; each module is a sub-Course whose
// lessons are its syllabus sections. Free offer + online instance keep it valid
// for Google's Course rich result.
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Course',
  'name': SITE.name,
  'description': description.value,
  'url': homeUrl.value,
  'inLanguage': bcp47.value,
  'isAccessibleForFree': true,
  'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
  'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
  'sameAs': [SITE.youtube, SITE.github],
  'about': ['Salesforce CRM Analytics', 'Tableau CRM', 'SAQL', 'Go-to-market analytics', 'RevOps dashboards'],
  'teaches': ['Data preparation with recipes', 'Datasets and data modelling', 'SAQL', 'Dashboard design', 'Bindings', 'Einstein Discovery', 'Funnel, pipeline and RevOps dashboards'],
  'educationalLevel': 'Beginner to advanced',
  'coursePrerequisites': 'Basic Salesforce familiarity; a free CRM Analytics Developer Edition org',
  'audience': { '@type': 'Audience', 'audienceType': 'Salesforce admins, developers, analysts and GTM / RevOps teams' },
  'availableLanguage': locales.value.map(l => l.language || l.code),
  'hasCourseInstance': {
    '@type': 'CourseInstance',
    'courseMode': 'online',
    'courseWorkload': 'PT12H',
    'instructor': { '@type': 'Person', 'name': SITE.author }
  },
  'hasPart': modules.value.map(m => ({
    '@type': 'Course',
    'name': m.title,
    'url': `${SITE.url}${localePath(m.to)}`,
    'description': m.desc || m.title,
    'inLanguage': bcp47.value,
    'provider': { '@type': 'Organization', 'name': SITE.name },
    'isAccessibleForFree': true,
    'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': 'PT1H30M' },
    'creativeWorkStatus': m.soon ? 'Coming soon' : 'Published',
    'syllabusSections': m.lessons.map((l, li) => ({ '@type': 'Syllabus', 'name': l.title, 'position': li + 1 }))
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
const heroFacts = computed(() => [
  { icon: 'i-lucide-layers', value: String(ROADMAP.length), label: t('home.facts.sections') },
  { icon: 'i-lucide-timer', value: String(EXAM.questions), label: t('home.facts.exam') },
  { icon: 'i-lucide-languages', value: '7', label: t('home.facts.languages') },
  { icon: 'i-lucide-badge-dollar-sign', value: t('home.facts.freeValue'), label: t('home.facts.free') }
])
const howSteps = [
  { key: 'watch', icon: 'i-lucide-circle-play' },
  { key: 'read', icon: 'i-lucide-book-open' },
  { key: 'quiz', icon: 'i-lucide-list-checks' },
  { key: 'notes', icon: 'i-lucide-notebook-pen' }
]
</script>

<template>
  <div>
    <!-- HERO: the navy title band (Namaste Salesforce) ---------------------- -->
    <section class="relative overflow-hidden bg-(--navy) text-white">
      <!-- hairline grid on navy, the system's one texture -->
      <div
        class="pointer-events-none absolute inset-0 opacity-100"
        style="background-image: linear-gradient(rgb(124 190 255 / .08) 1px, transparent 1px), linear-gradient(90deg, rgb(124 190 255 / .08) 1px, transparent 1px); background-size: 48px 48px; mask-image: linear-gradient(to bottom, #000 40%, transparent)"
        aria-hidden="true"
      />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-blueprint-200">
            <span class="size-1.5 rounded-full bg-blueprint-400" />{{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="mt-5 text-4xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[3.5rem]">
            {{ t('home.hero.title') }}
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            {{ t('home.hero.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/start')"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.hero.start') }}
            </UButton>
            <UButton
              :to="localePath('/pro')"
              size="xl"
              color="neutral"
              variant="ghost"
              class="text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:text-white"
            >
              {{ t('home.hero.pricing') }}
            </UButton>
            <ClientOnly>
              <TestRide
                v-if="!isSignedIn"
                size="xl"
                variant="ghost"
                class="text-blueprint-200 hover:bg-white/10 hover:text-white"
              />
            </ClientOnly>
          </div>
        </div>

        <!-- The product, as a story: what you will build -->
        <HomeStory class="min-w-0" />
      </div>

      <!-- Key facts, one band -->
      <div class="relative border-t border-white/10">
        <dl class="mx-auto grid max-w-(--ui-container) grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div
            v-for="f in heroFacts"
            :key="f.label"
            class="flex items-center gap-3 py-5"
          >
            <span class="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-white/10 text-blueprint-200">
              <UIcon
                :name="f.icon"
                class="size-5"
              />
            </span>
            <div>
              <dd class="text-lg font-bold leading-tight text-white">
                {{ f.value }}
              </dd>
              <dt class="text-sm text-white/65">
                {{ f.label }}
              </dt>
            </div>
          </div>
        </dl>
      </div>
    </section>

    <!-- THE COURSE, SECTION BY SECTION (all planned; live ones link) ---- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="reveal">
          <p class="eyebrow">
            {{ t('home.plot.eyebrow') }}
          </p>
          <h2 class="bp-h2 mt-4 max-w-2xl">
            {{ t('home.path.title') }}
          </h2>
          <p class="bp-lead mt-3 max-w-2xl">
            {{ t('home.path.lead', { lessons: lessonCount }) }}
          </p>
        </div>
        <UButton
          :to="localePath('/start')"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.plot.full') }}
        </UButton>
      </div>

      <!-- How every lesson works, as four steps -->
      <ol class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <li
          v-for="(st, k) in howSteps"
          :key="st.key"
          class="flex items-center gap-3 rounded-[6px] border border-(--line) bg-(--card) px-4 py-3"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--ice) text-(--signal)">
            <UIcon
              :name="st.icon"
              class="size-[1.125rem]"
            />
          </span>
          <span class="min-w-0">
            <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ k + 1 }}</span>
            <span class="block truncate text-sm font-semibold text-(--ink)">{{ t(`home.how.${st.key}`) }}</span>
          </span>
        </li>
      </ol>

      <ol class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(s, i) in path"
          :key="s.key"
          class="reveal"
        >
          <NuxtLink
            :to="localePath(`/start#${s.key}`)"
            class="bp-card bp-card--hover group flex h-full flex-col overflow-hidden"
          >
            <CourseSectionArt
              :section="s.key"
              class="w-full border-b border-(--line)"
            />
            <div class="flex flex-1 flex-col p-5">
              <p class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">
                <UIcon
                  :name="s.icon"
                  class="size-4 text-(--signal)"
                />{{ t('curriculumPage.section', { n: i + 1 }) }}
                <span
                  class="ms-auto rounded-full px-2 py-0.5 text-[10px]"
                  :class="s.live ? 'bg-success/10 text-success' : 'bg-(--paper2) text-(--ink2)'"
                >{{ s.live ? lessonsLabel(t, s.live) : t('curriculumPage.coming') }}</span>
              </p>
              <h3 class="mt-2 text-lg font-bold leading-snug text-(--ink) group-hover:text-(--signal)">
                {{ t(`roadmap.${s.key}.title`) }}
              </h3>
              <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-(--ink2)">
                {{ t(`roadmap.${s.key}.blurb`) }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="horizontal" />
    </div>

    <!-- JOBS THIS WEEK (hidden until the feed has postings) ----------- -->
    <HomeJobs />

    <!-- WHAT IT COSTS ---------------------------------------------------- -->
    <HomeCompare />
    <!-- FAQ --------------------------------------------------------------- -->
    <section
      v-if="faqItems.length"
      class="mx-auto max-w-3xl px-4 pb-20 sm:px-6"
    >
      <div class="overflow-hidden rounded-[6px] border border-(--line) bg-(--card)">
        <div class="flex items-center justify-between border-b border-(--line) px-5 py-4">
          <h2 class="text-xl font-semibold text-(--ink)">
            {{ t('home.faqTitle') }}
          </h2>
          <UIcon
            name="i-lucide-message-circle-question"
            class="size-5 text-(--signal)"
          />
        </div>
        <UAccordion
          :items="faqItems"
          :ui="{ root: 'px-5' }"
        />
      </div>
    </section>
    <!-- ONE CLOSING ACTION -->
    <section class="relative overflow-hidden border-t border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto flex max-w-(--ui-container) flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 class="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-(--ink) sm:text-4xl">
          {{ t('home.close.title') }}
        </h2>
        <p class="mt-3 max-w-xl text-(--ink2)">
          {{ t('home.close.lead') }}
        </p>
        <UButton
          :to="localePath('/start')"
          size="xl"
          trailing-icon="i-lucide-arrow-right"
          class="mt-8"
        >
          {{ t('home.hero.start') }}
        </UButton>
        <NuxtLink
          :to="localePath('/about')"
          class="mt-8 flex items-center gap-3 text-sm text-(--ink2) hover:text-(--signal)"
        >
          <img
            :src="AUTHOR.avatar"
            alt=""
            class="size-8 rounded-full bg-(--ice) object-cover"
            loading="lazy"
          >
          {{ t('home.close.author') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
