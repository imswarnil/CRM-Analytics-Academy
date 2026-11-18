<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

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

// ---- Curriculum, plotted ------------------------------------------------------

// One stacked bar per section: a segment per lesson, width proportional to
// its minutes, on a shared axis.
const axisMax = computed(() => Math.ceil(Math.max(15, ...modules.value.map(m => m.lessons.reduce((n, l) => n + l.minutes, 0))) / 15) * 15)
const axisTicks = computed(() => Array.from({ length: axisMax.value / 15 + 1 }, (_, i) => i * 15))
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
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-blueprint-200">
            <span class="size-1.5 rounded-full bg-blueprint-400" />{{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="mt-5 text-4xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
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
          <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <li
              v-for="p in ['free', 'languages', 'ai']"
              :key="p"
              class="flex items-center gap-1.5"
            >
              <UIcon
                :name="p === 'ai' ? 'i-lucide-sparkles' : 'i-lucide-check'"
                class="size-4 text-blueprint-300"
              />{{ t(`home.hero.proof.${p}`) }}
            </li>
          </ul>
        </div>

        <!-- The product, as a story: what you will build -->
        <HomeStory class="min-w-0" />
      </div>
    </section>

    <!-- HOW YOU WILL LEARN IT ------------------------------------------- -->
    <HomeApproach />

    <!-- CURRICULUM, PLOTTED (only once lessons are published) ------------ -->
    <section
      v-if="lessonCount"
      class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8"
    >
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
          :to="localePath('/start')"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.plot.full') }}
        </UButton>
      </div>

      <div class="crosshair mt-10 border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
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
              class="relative h-full border border-(--line)"
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
      <div class="mt-4 flex gap-5 font-medium text-[11px] text-(--ink2)">
        <span class="flex items-center gap-2"><span class="size-3 border border-(--line) bg-(--tide)" />{{ t('home.plot.video') }}</span>
        <span class="flex items-center gap-2"><span class="size-3 border border-(--line) bg-(--frost)" />{{ t('home.plot.article') }}</span>
      </div>
    </section>

    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="horizontal" />
    </div>

    <!-- JOBS THIS WEEK (hidden until the feed has postings) ----------- -->
    <HomeJobs />

    <!-- WHAT IT COSTS ---------------------------------------------------- -->
    <HomeCompare />
    <div class="mx-auto max-w-(--ui-container) px-4 pb-6 sm:px-6 lg:px-8">
      <SponsorInvite />
    </div>

    <!-- FREE ACCOUNT ----------------------------------------------------- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <div class="graph-paper-navy flex flex-col gap-6 border border-(--line) p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-2xl">
          <p class="font-medium text-[11px] text-(--glow)">
            {{ t('home.join.eyebrow') }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
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
            :to="localePath('/start')"
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
      <div class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
        <div class="flex items-center justify-between border-b border-(--line) bg-(--ice) px-5 py-4">
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
