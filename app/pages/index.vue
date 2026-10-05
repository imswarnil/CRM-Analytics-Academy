<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The home page, kept to what a first-time visitor needs: what the course
 * is (hero), what is in it (the curriculum, plotted), real builds (a showcase
 * teaser), help when you need more than a course (the experts network), who
 * wrote it, and the common questions. Everything is prerendered per locale;
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

const lessonCount = computed(() =>
  (navigation.value ?? []).reduce((n, m) => n + ((m.children?.length ?? 0) || 1), 0)
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

// ---- Hero figure -------------------------------------------------------------

// The Academy's own closing ARR, last twelve months (October → September),
// from the course warehouse (public/sample-data/academy/arr_snapshots.csv):
// the chart the course ends up building, drawn on the page that sells it.
// Month initials and money are formatted for the reader's locale.
const arr = [1352, 1722, 2805, 3047, 3670, 4098, 5013, 5781, 6210, 6512, 7100, 6969]
const money = (thousands: number, digits = 2) =>
  new Intl.NumberFormat(bcp47.value, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: digits }).format(thousands * 1000)
const heroBars = computed(() => arr.map((v, i) => {
  const month = new Date(Date.UTC(2025, 9 + i, 15))
  return {
    label: new Intl.DateTimeFormat(bcp47.value, { month: 'narrow', timeZone: 'UTC' }).format(month),
    value: v,
    tone: (i < 4 ? 'frost' : i < 8 ? 'tide' : 'signal') as 'frost' | 'tide' | 'signal',
    title: `${new Intl.DateTimeFormat(bcp47.value, { month: 'long', timeZone: 'UTC' }).format(month)} · ${money(v)}`
  }
}))
const heroTicks = computed(() => [0, 2000, 4000, 6000].map(v => money(v, 0)))
const pct = (v: number) => new Intl.NumberFormat(bcp47.value, { style: 'percent', maximumFractionDigits: 1 }).format(v)
const heroKpis = computed(() => [
  { label: t('home.figure.arr'), value: money(6969), delta: t('home.figure.arrDelta', { n: pct(6.64) }) },
  { label: t('home.figure.winRate'), value: pct(0.404), delta: t('home.figure.winRateDelta') },
  { label: t('home.figure.nrr'), value: pct(1.395), delta: t('home.figure.nrrDelta', { n: pct(0.972) }) }
])

// ---- Curriculum, plotted ------------------------------------------------------

// One stacked bar per section: a segment per lesson, width proportional to
// its minutes, on a shared axis.
const axisMax = computed(() => Math.ceil(Math.max(15, ...modules.value.map(m => m.lessons.reduce((n, l) => n + l.minutes, 0))) / 15) * 15)
const axisTicks = computed(() => Array.from({ length: axisMax.value / 15 + 1 }, (_, i) => i * 15))

// ---- Showcase teaser ---------------------------------------------------------

// Read at build time like every other page here; the collection is not
// localized, so all twelve copies show the same three builds.
const { data: builds } = await useAsyncData('home-showcase', () =>
  queryCollection('showcase')
    .select('path', 'title', 'description', 'image', 'author', 'publishedAt')
    .order('publishedAt', 'DESC')
    .limit(3)
    .all()
)

const expertPoints = computed(() => (tm('home.experts.points') as string[]).map(p => rt(p)))
</script>

<template>
  <div>
    <!-- HERO ------------------------------------------------------------- -->
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <!-- faint area chart behind everything -->
      <svg
        class="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 360 L100 330 L200 340 L300 290 L400 300 L500 250 L600 262 L700 210 L800 220 L900 170 L1000 180 L1100 130 L1200 110 L1200 400 L0 400Z"
          fill="var(--ice)"
          fill-opacity=".55"
          stroke="var(--frost)"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M0 380 L150 370 L300 355 L450 350 L600 330 L750 318 L900 300 L1050 285 L1200 270"
          fill="none"
          stroke="var(--frost)"
          stroke-width="1.5"
          stroke-dasharray="6 6"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[repeat(auto-fit,minmax(440px,1fr))] lg:px-8">
        <div>
          <p class="eyebrow flex items-center gap-2">
            <span class="inline-block size-2 bg-(--glow)" />
            {{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="bp-h1 mt-5">
            {{ t('home.hero.title') }}
          </h1>
          <p class="bp-lead mt-6 max-w-xl">
            {{ t('home.hero.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
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

        <BpFigure
          :caption="t('home.figure.caption')"
          :spec="t('home.figure.spec')"
          shadow
          class="min-w-0"
        >
          <div class="p-4 sm:p-5">
            <div class="grid grid-cols-3 border-[1.5px] border-(--line)">
              <div
                v-for="(k, i) in heroKpis"
                :key="k.label"
                class="min-w-0 p-3"
                :class="i ? 'border-s-[1.5px] border-(--line)' : ''"
              >
                <p class="truncate font-mono text-[9px] uppercase tracking-[.12em] text-(--ink2)">
                  {{ k.label }}
                </p>
                <p class="mt-1 text-xl font-extrabold tracking-[-0.03em] text-(--ink) sm:text-2xl">
                  {{ k.value }}
                </p>
                <p class="mt-0.5 truncate font-mono text-[10px] text-(--signal)">
                  {{ k.delta }}
                </p>
              </div>
            </div>
            <div class="mt-6 ps-7">
              <BpBarChart
                :bars="heroBars"
                :height="150"
                :ticks="heroTicks"
              />
            </div>
          </div>
        </BpFigure>
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
            {{ t('home.plot.title', { sections: modules.length, lessons: lessonCount }) }}
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

    <!-- SHOWCASE TEASER --------------------------------------------------- -->
    <section
      v-if="builds?.length"
      class="graph-paper border-y-[1.5px] border-(--ink)"
    >
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl">
            <p class="eyebrow">
              {{ t('home.showcase.eyebrow') }}
            </p>
            <h2 class="bp-h2 mt-4">
              {{ t('home.showcase.title') }}
            </h2>
            <p class="bp-lead mt-4">
              {{ t('home.showcase.lead') }}
            </p>
          </div>
          <UButton
            :to="localePath('/showcase')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('home.showcase.all') }}
          </UButton>
        </div>
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="b in builds"
            :key="b.path"
            :to="localePath(b.path)"
            class="bp-card bp-card--hover group flex flex-col"
          >
            <BpShowcaseThumb
              :image="b.image"
              :alt="b.title"
              class="border-b-[1.5px] border-(--ink)"
            />
            <div class="flex grow flex-col p-5">
              <h3 class="font-extrabold tracking-[-0.01em] text-(--ink) group-hover:text-(--signal)">
                {{ b.title }}
              </h3>
              <p class="mt-2 line-clamp-2 grow text-sm text-(--ink2)">
                {{ b.description }}
              </p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-(--signal)">
                {{ t('showcase.viewBuild') }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- EXPERTS ----------------------------------------------------------- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="graph-paper-navy grid items-center gap-10 border-[1.5px] border-(--ink) bg-(--navy) p-8 text-white sm:p-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            {{ t('home.experts.eyebrow') }}
          </p>
          <h2 class="mt-4 text-4xl font-extrabold leading-none tracking-[-0.04em] text-white sm:text-5xl">
            {{ t('home.experts.title') }}
          </h2>
          <p class="mt-5 max-w-xl text-lg text-white/80">
            {{ t('home.experts.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/experts')"
              size="lg"
              color="secondary"
              icon="i-lucide-handshake"
            >
              {{ t('home.experts.hire') }}
            </UButton>
            <UButton
              :to="localePath('/experts/join')"
              size="lg"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-right"
              class="border-white/70 bg-transparent text-white hover:bg-white/10"
            >
              {{ t('home.experts.join') }}
            </UButton>
          </div>
        </div>
        <ul class="border-[1.5px] border-white/60">
          <li
            v-for="(p, i) in expertPoints"
            :key="p"
            class="flex items-start gap-3 p-4"
            :class="i ? 'border-t border-dashed border-white/30' : ''"
          >
            <span class="font-mono text-xs text-(--glow)">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="text-white/90">{{ p }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- AUTHOR ------------------------------------------------------------ -->
    <HomeAuthorSection />

    <!-- SPONSOR ----------------------------------------------------------- -->
    <div class="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
      <SponsorCard />
    </div>

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
  </div>
</template>
