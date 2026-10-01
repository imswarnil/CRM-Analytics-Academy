<script setup lang="ts">
import { WALL_PEOPLE } from '~/data/wall-of-fame'
import type { ContentNavigationItem } from '@nuxt/content'

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
// lesson count is wrong within a week of anybody adding a lesson -- and it was:
// it read 49 while the course carried twice that.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

const lessonCount = computed(() =>
  (navigation.value ?? []).reduce((n, m) => n + ((m.children?.length ?? 0) || 1), 0)
)

/**
 * The curriculum cards, derived from the same navigation tree the sidebar and
 * /curriculum read. They used to be a hardcoded array of six modules with their
 * lesson titles typed out by hand, which described a curriculum that no longer
 * exists -- six sections where there are now nineteen, and lesson names that
 * were rewritten months ago.
 *
 * Only two things stay static: which of ModuleThumb's six drawings a section
 * gets, and a one-line description. Everything else -- title, route, lesson
 * count, order -- comes from the content itself and cannot drift again.
 */
const BLURBS: Record<string, string> = {
  'introduction': 'What the course is, who it is for, a free org, and the first dataset loaded.',
  'foundations': 'What CRM Analytics is, the three layers, the vocabulary, and when it is the wrong tool.',
  'setup': 'Licences, permission sets, the integration user, security predicates and sharing inheritance.',
  'data-preparation': 'Connections, sync, recipes, buckets, missing values and de-duplication.',
  'datasets-and-modelling': 'Grain, joins and fan-out, snapshots for history, and field metadata.',
  'data-visualization': 'Every chart type on its own terms, and which one the question actually needs.',
  'lenses-and-explorations': 'Exploring a dataset: groupings, measures, the three modes, and conversational queries.',
  'saql': 'The query language itself — syntax, functions, the patterns that matter, and debugging.',
  'designing-dashboards': 'Designing for a decision: hierarchy, formatting, widgets and performance.',
  'interactions': 'Faceting, filters and selection — what makes a dashboard a system rather than a page.',
  'bindings': 'One widget feeding another: selection, results, nesting, and where it turns unmaintainable.',
  'dashboard-json': 'Under the hood: reading and editing the JSON when the builder runs out.',
  'collaboration': 'Apps and sharing, subscriptions, annotations, embedding and governance.',
  'apis-and-automation': 'The REST API, Python, automated dataset loads, and CI for analytics.',
  'einstein-discovery': 'Stories, models, writing predictions back — and auditing a score before trusting it.',
  'gtm-engineering': 'The warehouse, metric contracts, and the metric tree the builds fill in.',
  'demand-analytics': 'AI search visibility, SEO, acquisition, campaigns, spend and attribution.',
  'pipeline-analytics': 'Leads through to signature: routing, scoring, conversion, velocity and CPQ.',
  'revops-analytics': 'Forecast, the ARR waterfall, consumption risk, service, and the executive board.'
}

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
      icon: String(mod.icon ?? 'i-lucide-book-open'),
      desc: BLURBS[slug] ?? '',
      lessons: ((mod.children ?? []) as ContentNavigationItem[]).map(l => ({
        title: String(l.title ?? ''),
        to: String(l.path ?? ''),
        ...lessonMeta(String(l.path ?? ''))
      }))
    }
  })
)

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

// ---- Blueprint page data ----------------------------------------------------

const wallPeople = WALL_PEOPLE.slice(0, 8)

const totalMinutes = computed(() => modules.value.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.minutes, 0), 0))
const hours = computed(() => Math.round(totalMinutes.value / 60))

// FIG. 01 — the Academy's own closing ARR, last twelve months, from the course
// warehouse (public/sample-data/academy/arr_snapshots.csv). The chart the
// course ends up building, drawn on the page that sells it.
const arr = [1352, 1722, 2805, 3047, 3670, 4098, 5013, 5781, 6210, 6512, 7100, 6969]
const months = ['O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S']
const heroBars = arr.map((v, i) => ({
  label: months[i]!,
  value: v,
  tone: (i < 4 ? 'frost' : i < 8 ? 'tide' : 'signal') as 'frost' | 'tide' | 'signal',
  title: `${months[i]} · $${(v / 1000).toFixed(2)}M ARR`
}))
const heroKpis = [
  { label: 'ARR', value: '$6.97M', delta: '▲ 664% YoY', up: true },
  { label: 'Win rate', value: '40.4%', delta: '▲ closed deals', up: true },
  { label: 'NRR', value: '139.5%', delta: '▲ GRR 97.2%', up: true }
]

const ticker = ['Recipes', 'SAQL', 'Datasets', 'Grain', 'Lenses', 'Dashboards', 'Bindings', 'Security predicates', 'Einstein Discovery', 'Dashboard JSON', 'REST API', 'Metric contracts', 'ARR waterfall', 'Pipeline analytics']

const method = [
  { n: '01', icon: 'i-lucide-crosshair', title: 'One technology, deep', text: 'Only CRM Analytics. Every lesson assumes a real Salesforce org and real data.', metric: 'Depth · 19 sections', path: 'M0 58 L40 52 L80 46 L120 40 L160 30 L200 22 L240 12' },
  { n: '02', icon: 'i-lucide-clapperboard', title: 'Video + article lessons', text: 'Walk through it on screen, then keep a written reference with copyable SAQL.', metric: `Length · ${hours.value}h total`, path: 'M0 50 L40 44 L80 48 L120 30 L160 34 L200 18 L240 20' },
  { n: '03', icon: 'i-lucide-package-open', title: 'One company’s data', text: 'Twenty-one CSVs describing one business. Every build reconciles with the last.', metric: 'Data · 32,000 rows', path: 'M0 60 L40 40 L80 42 L120 26 L160 28 L200 16 L240 8' },
  { n: '04', icon: 'i-lucide-refresh-cw', title: 'Release-current', text: 'Rewritten when Salesforce renames things. Free, open source, and it stays that way.', metric: 'Cost · $0 to learn', path: 'M0 40 L40 42 L80 36 L120 38 L160 30 L200 32 L240 24' }
]

// FIG. 03 — the curriculum as stacked bars: one segment per lesson, width
// proportional to its minutes, on a shared axis.
const axisMax = computed(() => Math.ceil(Math.max(15, ...modules.value.map(m => m.lessons.reduce((n, l) => n + l.minutes, 0))) / 15) * 15)
const axisTicks = computed(() => Array.from({ length: axisMax.value / 15 + 1 }, (_, i) => i * 15))

const teamBars = [
  [30, 22, 18], [34, 26, 22], [38, 32, 20], [40, 30, 26], [42, 34, 26], [44, 36, 30]
]
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
      <div class="pointer-events-none absolute inset-x-0 bottom-3 mx-auto flex max-w-(--ui-container) justify-around px-8 font-mono text-[10px] text-(--x)">
        <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
      </div>
      <!-- A drafting sketch that draws itself once on load, behind the copy. -->
      <BpDrawing
        seed="home-hero"
        variant="hero"
        class="absolute bottom-4 start-[30%] hidden w-[26rem] opacity-35 lg:block"
      />

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

        <BpHeroSlides>
          <template #arr>
            <div class="p-4 sm:p-5">
              <div class="grid grid-cols-3 border-[1.5px] border-(--line)">
                <div
                  v-for="(k, i) in heroKpis"
                  :key="k.label"
                  class="p-3"
                  :class="i ? 'border-s-[1.5px] border-(--line)' : ''"
                >
                  <p class="font-mono text-[9px] uppercase tracking-[.12em] text-(--ink2)">
                    {{ k.label }}
                  </p>
                  <p class="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-(--ink)">
                    {{ k.value }}
                  </p>
                  <p class="mt-0.5 font-mono text-[10px] text-(--signal)">
                    {{ k.delta }}
                  </p>
                </div>
              </div>
              <div class="mt-6 ps-7">
                <BpBarChart
                  :bars="heroBars"
                  :height="150"
                  :ticks="['0', '2M', '4M', '6M']"
                />
              </div>
            </div>
          </template>
        </BpHeroSlides>
      </div>
    </section>

    <!-- TICKER ------------------------------------------------------------ -->
    <div class="graph-paper-navy overflow-hidden border-b-[1.5px] border-(--ink) text-white">
      <div class="ruler text-white/60" />
      <div class="bp-marquee flex w-max gap-6 py-4 font-mono text-sm uppercase tracking-[.14em]">
        <template
          v-for="copy in 2"
          :key="copy"
        >
          <span
            v-for="w in ticker"
            :key="`${copy}-${w}`"
            class="flex items-center gap-6 whitespace-nowrap"
          >
            {{ w }}<span class="text-(--glow)">+</span>
          </span>
        </template>
      </div>
    </div>

    <!-- METHOD ------------------------------------------------------------ -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p class="eyebrow">
            Fig. 02 — Method
          </p>
          <h2 class="bp-h2 mt-4">
            {{ t('home.method.title') }}
          </h2>
        </div>
        <p class="bp-lead">
          {{ t('home.method.lead') }}
        </p>
      </div>

      <div class="mt-12 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))]">
        <article
          v-for="m in method"
          :key="m.n"
          class="bp-card bp-card--hover flex min-h-72 flex-col p-6"
        >
          <div class="flex items-start justify-between">
            <span class="font-mono text-xs text-(--ink2)">{{ m.n }}</span>
            <span class="bp-iconbox"><UIcon
              :name="m.icon"
              class="size-5"
            /></span>
          </div>
          <h3 class="bp-h3 mt-5">
            {{ m.title }}
          </h3>
          <p class="mt-2 text-[15px] leading-relaxed text-(--ink2)">
            {{ m.text }}
          </p>
          <div class="mt-auto pt-6">
            <svg
              viewBox="0 0 240 64"
              class="h-16 w-full"
              aria-hidden="true"
            >
              <path
                :d="`${m.path} L240 64 L0 64Z`"
                fill="var(--ice)"
                class="bp-fade"
              />
              <path
                :d="m.path"
                fill="none"
                stroke="var(--signal)"
                stroke-width="2"
                class="bp-draw"
              />
            </svg>
            <p class="bp-fade mt-1 font-mono text-[10px] uppercase tracking-[.12em] text-(--signal)">
              {{ m.metric }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <!-- CURRICULUM, PLOTTED ---------------------------------------------- -->
    <section class="graph-paper border-y-[1.5px] border-(--ink)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow">
              Fig. 03 — Curriculum, plotted
            </p>
            <h2 class="bp-h2 mt-4">
              {{ modules.length }} sections, {{ lessonCount }} lessons
            </h2>
          </div>
          <UButton
            :to="localePath('/curriculum')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            Full curriculum
          </UButton>
        </div>

        <div class="crosshair mt-10 border-[1.5px] border-(--ink) bg-(--card)">
          <NuxtLink
            v-for="m in modules"
            :key="m.to"
            :to="localePath(m.to)"
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
                :style="{ left: `${(tk / axisMax) * 100}%` }"
              />
              <span
                v-for="(l, li) in m.lessons"
                :key="li"
                class="relative h-full border-[1.5px] border-(--ink) transition-colors"
                :class="l.type === 'video' ? 'bg-(--tide)' : 'bg-(--frost)'"
                :style="{ width: `${(l.minutes / axisMax) * 100}%`, marginRight: '-1.5px' }"
                :title="`${l.title} · ${l.minutes} min`"
              />
            </span>
            <span class="hidden items-center justify-end gap-1 font-mono text-xs text-(--ink2) md:flex">
              {{ m.lessons.reduce((n, l) => n + l.minutes, 0) }} min
              <UIcon
                name="i-lucide-arrow-right"
                class="bp-arrow size-3.5 text-(--signal)"
              />
            </span>
          </NuxtLink>
          <div class="hidden grid-cols-[minmax(0,17rem)_minmax(0,1fr)_5rem] gap-3 px-5 py-2 md:grid">
            <span class="font-mono text-[10px] uppercase text-(--ink2)">Section</span>
            <span class="relative h-4">
              <span
                v-for="tk in axisTicks"
                :key="tk"
                class="absolute -translate-x-1/2 font-mono text-[10px] text-(--ink2)"
                :style="{ left: `${(tk / axisMax) * 100}%` }"
              >{{ tk }}{{ tk === axisMax ? ' min' : '' }}</span>
            </span>
            <span />
          </div>
        </div>
        <div class="mt-4 flex gap-5 font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
          <span class="flex items-center gap-2"><span class="size-3 border-[1.5px] border-(--ink) bg-(--tide)" />Video walkthrough</span>
          <span class="flex items-center gap-2"><span class="size-3 border-[1.5px] border-(--ink) bg-(--frost)" />Article</span>
        </div>
      </div>
    </section>

    <!-- AUTHOR ------------------------------------------------------------ -->
    <HomeAuthorSection />

    <!-- WALL OF FAME -------------------------------------------------------- -->
    <section class="border-y-[1.5px] border-(--ink) bg-(--paper2)/60">
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-2xl">
            <p class="eyebrow">
              {{ t('home.wall.eyebrow') }}
            </p>
            <h2 class="bp-h2 mt-4">
              {{ t('home.wall.title') }}
            </h2>
            <p class="bp-lead mt-4">
              {{ t('home.wall.lead') }}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <UButton
              :to="localePath('/wall-of-fame')"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.wall.see') }}
            </UButton>
            <UButton
              to="/nominate"
              icon="i-lucide-heart-handshake"
            >
              {{ t('wall.nominate') }}
            </UButton>
          </div>
        </div>
        <BpPolaroidWall
          :people="wallPeople"
          :min-slots="8"
          :label="t('home.wall.board')"
          class="mt-12"
        />
      </div>
    </section>

    <!-- TEAMS ------------------------------------------------------------- -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="graph-paper-navy grid items-center gap-10 border-[1.5px] border-(--ink) p-8 text-white sm:p-12 lg:grid-cols-2">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            Fig. 04 — Teams
          </p>
          <h2 class="mt-4 text-4xl font-extrabold leading-none tracking-[-0.04em] text-white sm:text-5xl">
            {{ t('home.teams.title') }}
          </h2>
          <p class="mt-5 max-w-md text-lg text-white/75">
            {{ t('home.teams.lead') }}
          </p>
          <NuxtLink
            to="/teams"
            class="mt-8 inline-flex items-center gap-2 border-[1.5px] border-white bg-(--glow) px-6 py-3 font-bold text-(--navy) shadow-[5px_5px_0_rgba(255,255,255,.85)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(255,255,255,.85)]"
          >
            <UIcon
              name="i-lucide-users"
              class="size-5"
            />
            {{ t('home.teams.cta') }}
          </NuxtLink>
        </div>
        <div>
          <div class="flex h-56 items-end gap-3 border-s-[1.5px] border-b-[1.5px] border-white/70 px-3">
            <div
              v-for="(stack, i) in teamBars"
              :key="i"
              class="flex flex-1 flex-col-reverse"
            >
              <span
                v-for="(v, j) in stack"
                :key="j"
                class="border border-(--navy)"
                :style="{ height: `${v * 1.1}px`, background: ['var(--signal)', 'var(--tide)', 'var(--glow)'][j] }"
              />
            </div>
          </div>
          <div class="mt-2 flex justify-between px-3 font-mono text-[10px] uppercase text-white/60">
            <span>Wk 1</span><span>Seats completing sections</span><span>Wk 6</span>
          </div>
        </div>
      </div>
    </section>

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
