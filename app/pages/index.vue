<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The home page, kept to what a first-time visitor needs: what the course
 * is (hero), what is in it (the curriculum, plotted), the project live (reach
 * by region), a free account, the Wall of Fame, who wrote it, and the common questions. Everything is prerendered per locale;
 * nothing here fetches at runtime.
 */
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

// Counted from the navigation tree rather than typed, because a hardcoded
// lesson count is wrong within a week of anybody adding a lesson.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

// Published lessons only: a section's "coming soon" page is not a lesson.
const lessonCount = computed(() =>
  (navigation.value ?? []).reduce((n, m) => n + ((m.children ?? []) as { comingSoon?: boolean }[]).filter(l => !l.comingSoon).length, 0)
)
const liveSections = computed(() =>
  (navigation.value ?? []).filter(m => ((m.children ?? []) as { comingSoon?: boolean }[]).some(l => !l.comingSoon)).length
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

// ---- Hero: what is inside, each a link ------------------------------------------
const INSIDE = [
  { k: 'lessons', icon: 'i-lucide-graduation-cap', to: '/curriculum', bg: '#dbeafe', fg: '#1d4ed8' },
  { k: 'visualisers', icon: 'i-lucide-workflow', to: '/visualiser', bg: '#ede9fe', fg: '#6d28d9' },
  { k: 'exams', icon: 'i-lucide-timer', to: '/certification', bg: '#fef3c7', fg: '#b45309' },
  { k: 'interview', icon: 'i-lucide-messages-square', to: '/interview-questions', bg: '#d1fae5', fg: '#047857' }
]

// ---- Curriculum, plotted ------------------------------------------------------

// One stacked bar per section: a segment per lesson, width proportional to
// its minutes, on a shared axis.
const axisMax = computed(() => Math.ceil(Math.max(15, ...modules.value.map(m => m.lessons.reduce((n, l) => n + l.minutes, 0))) / 15) * 15)
const axisTicks = computed(() => Array.from({ length: axisMax.value / 15 + 1 }, (_, i) => i * 15))
</script>

<template>
  <div>
    <!-- HERO ------------------------------------------------------------- -->
    <section class="border-b border-(--line)">
      <div class="mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div>
          <p class="eyebrow">
            {{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.035em] text-(--ink) sm:text-5xl">
            {{ t('home.hero.title') }}
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-(--ink2)">
            {{ t('home.hero.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/introduction')"
              size="lg"
              icon="i-lucide-play"
            >
              {{ t('home.hero.start') }}
            </UButton>
            <UButton
              :to="localePath('/curriculum')"
              size="lg"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.hero.curriculum') }}
            </UButton>
          </div>
        </div>

        <!-- What is inside, plainly -->
        <ul class="divide-y divide-(--line) rounded-2xl border border-(--line) bg-(--card)">
          <li
            v-for="f in INSIDE"
            :key="f.k"
          >
            <NuxtLink
              :to="localePath(f.to)"
              class="group flex items-center gap-4 p-5 hover:bg-(--ice)/60"
            >
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-xl"
                :style="{ background: f.bg, color: f.fg }"
              >
                <UIcon
                  :name="f.icon"
                  class="size-6"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-bold text-(--ink) group-hover:text-(--signal)">{{ t(`home.inside.${f.k}.title`) }}</span>
                <span class="block text-sm text-(--ink2)">{{ t(`home.inside.${f.k}.body`) }}</span>
              </span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-(--ink2) transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- CURRICULUM, PLOTTED ---------------------------------------------- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">
            {{ t('home.plot.eyebrow') }}
          </p>
          <h2 class="bp-h2 mt-4">
            {{ t('home.plot.title', { sections: modules.length, live: liveSections, lessons: lessonCount }) }}
          </h2>
        </div>
        <UButton
          :to="localePath('/curriculum')"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.plot.full') }}
        </UButton>
      </div>

      <div class="crosshair mt-10 border-[1.5px] border-(--ink) bg-(--card)">
        <NuxtLink
          v-for="m in modules"
          :key="m.to"
          :to="localePath(m.to)"
          :title="m.desc || undefined"
          class="bp-row group grid items-center gap-3 border-b border-(--line) px-5 py-3.5 hover:bg-(--ice)/50 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_5rem]"
        >
          <span class="flex items-center gap-3">
            <span class="font-mono text-xs text-(--signal)">{{ m.n }}</span>
            <span class="truncate font-bold text-(--ink)">{{ m.title }}</span>
          </span>
          <span class="relative flex h-5 items-center">
            <span
              v-for="tk in axisTicks.slice(1, -1)"
              :key="tk"
              class="absolute inset-y-[-8px] border-s border-(--line)"
              :style="{ insetInlineStart: `${(tk / axisMax) * 100}%` }"
            />
            <span
              v-for="(l, li) in m.lessons"
              :key="li"
              class="relative h-full border-[1.5px] border-(--ink)"
              :class="l.type === 'video' ? 'bg-(--tide)' : 'bg-(--frost)'"
              :style="{ width: `${(l.minutes / axisMax) * 100}%`, marginInlineEnd: '-1.5px' }"
              :title="`${l.title} · ${t('home.plot.minutes', { n: l.minutes })}`"
            />
          </span>
          <span class="hidden items-center justify-end gap-1 font-mono text-xs text-(--ink2) md:flex">
            {{ t('home.plot.minutes', { n: m.lessons.reduce((n, l) => n + l.minutes, 0) }) }}
            <UIcon
              name="i-lucide-arrow-right"
              class="bp-arrow size-3.5 text-(--signal) rtl:rotate-180"
            />
          </span>
        </NuxtLink>
        <div class="hidden grid-cols-[minmax(0,17rem)_minmax(0,1fr)_5rem] gap-3 px-5 py-2 md:grid">
          <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ t('home.plot.section') }}</span>
          <span class="relative h-4">
            <span
              v-for="tk in axisTicks"
              :key="tk"
              class="absolute -translate-x-1/2 font-mono text-[10px] text-(--ink2) rtl:translate-x-1/2"
              :style="{ insetInlineStart: `${(tk / axisMax) * 100}%` }"
            >{{ tk === axisMax ? t('home.plot.minutes', { n: tk }) : tk }}</span>
          </span>
          <span />
        </div>
      </div>
      <div class="mt-4 flex gap-5 font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
        <span class="flex items-center gap-2"><span class="size-3 border-[1.5px] border-(--ink) bg-(--tide)" />{{ t('home.plot.video') }}</span>
        <span class="flex items-center gap-2"><span class="size-3 border-[1.5px] border-(--ink) bg-(--frost)" />{{ t('home.plot.article') }}</span>
      </div>
    </section>

    <!-- PROJECT, LIVE ------------------------------------------------- -->
    <HomeReachSection />

    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="horizontal" />
    </div>

    <!-- FREE ACCOUNT ----------------------------------------------------- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <div class="graph-paper-navy flex flex-col gap-6 border-[1.5px] border-(--ink) p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            {{ t('home.join.eyebrow') }}
          </p>
          <h2 class="mt-3 text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
            {{ t('home.join.title') }}
          </h2>
          <p class="mt-3 text-white/80">
            {{ t('home.join.lead') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton
            :to="localePath('/sign-up')"
            color="secondary"
            size="lg"
            icon="i-lucide-user-plus"
          >
            {{ t('nav.enrollFree') }}
          </UButton>
          <UButton
            :to="localePath('/curriculum')"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-graduation-cap"
            class="border-white/60 bg-transparent text-white hover:bg-white/10"
          >
            {{ t('home.join.browse') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- WALL OF FAME ---------------------------------------------------- -->
    <HomeWallSection />

    <!-- AUTHOR ------------------------------------------------------------ -->
    <HomeAuthorSection />

    <!-- FAQ --------------------------------------------------------------- -->
    <section
      v-if="faqItems.length"
      class="mx-auto max-w-3xl px-4 pb-20 sm:px-6"
    >
      <div class="border-[1.5px] border-(--ink) bg-(--card)">
        <div class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-4">
          <h2 class="text-xl font-extrabold text-(--ink)">
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
    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex justify-center">
        <ShareBar
          :title="t('seo.homeTitle')"
          :text="t('seo.homeDesc')"
        />
      </div>
      <PromoSlot unit="responsiveLeaderboard" />
    </div>
  </div>
</template>
