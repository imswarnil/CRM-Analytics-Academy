<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { ROADMAP } from '~/data/roadmap'

/**
 * The home page, five blocks and little text: the hero (one line, the course
 * as a moving diagram), the seven sections as icon tiles, how a lesson
 * works in three steps, the two prices, the FAQ, one closing action.
 * Prerendered per locale; nothing here fetches at runtime.
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
  ogDescription: description,
  ogImageAlt: () => t('home.hero.title'),
  twitterTitle: title,
  twitterDescription: description
})

// The share card leads with the outcome, not the brand (the logo is on it).
defineOgImage('Docs', { title: t('home.hero.title'), description: t('home.hero.lead'), headline: t('home.hero.eyebrow') })

// Counted from the navigation tree rather than typed, because a hardcoded
// lesson count is wrong within a week of anybody adding a lesson.
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))

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
  '@id': `${SITE.url}/#course`,
  'name': 'Salesforce CRM Analytics',
  'alternateName': SITE.name,
  'description': description.value,
  'url': homeUrl.value,
  'image': `${SITE.url}/icon-512.png`,
  'mainEntityOfPage': { '@type': 'WebPage', '@id': `${homeUrl.value}#webpage`, 'url': homeUrl.value, 'isPartOf': { '@id': WEBSITE_ID } },
  'inLanguage': bcp47.value,
  'isAccessibleForFree': true,
  'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
  'offers': [
    { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD', 'url': `${SITE.url}/course` },
    { '@type': 'Offer', 'category': 'Subscription', 'name': 'Pro Monthly', 'price': String(PRICES.monthly.usd), 'priceCurrency': 'USD', 'url': `${SITE.url}/pro` },
    { '@type': 'Offer', 'category': 'Subscription', 'name': 'Pro Yearly', 'price': String(PRICES.yearly.usd), 'priceCurrency': 'USD', 'url': `${SITE.url}/pro` },
    { '@type': 'Offer', 'category': 'Paid', 'name': 'Pro Lifetime', 'price': String(PRICES.lifetime.usd), 'priceCurrency': 'USD', 'url': `${SITE.url}/pro` }
  ],
  'sameAs': [SITE.youtube, SITE.github],
  'about': ['Salesforce CRM Analytics', 'Tableau CRM', 'SAQL', 'Data preparation', 'Einstein Discovery'],
  'educationalCredentialAwarded': 'CRM Analytics Academy practice certificate',
  'teaches': ['Data preparation with recipes', 'Datasets and data modelling', 'SAQL', 'Dashboard design', 'Bindings', 'Einstein Discovery'],
  'educationalLevel': 'Beginner to advanced',
  'coursePrerequisites': 'Basic Salesforce familiarity; a free CRM Analytics Developer Edition org',
  'audience': { '@type': 'Audience', 'audienceType': 'Salesforce admins, developers and analysts' },
  'availableLanguage': locales.value.map(l => l.language || l.code),
  'hasCourseInstance': {
    '@type': 'CourseInstance',
    'courseMode': 'online',
    'courseWorkload': 'PT12H',
    'instructor': { '@type': 'Person', 'name': SITE.author, 'url': `${SITE.url}/about` }
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
const steps = [
  { key: 'watch', icon: 'i-lucide-circle-play' },
  { key: 'build', icon: 'i-lucide-hammer' },
  { key: 'check', icon: 'i-lucide-list-checks' }
]
const usd = (n: number) => `$${n}`
const certFacts = [
  { key: 'certSets', icon: 'i-lucide-package-check', value: PAPERS.filter(p => p.kind === 'full').length },
  { key: 'certDrills', icon: 'i-lucide-target', value: PAPERS.filter(p => p.kind === 'drill').length },
  { key: 'certCapstone', icon: 'i-lucide-award', value: 1 }
]
const heroFacts = computed(() => [
  { icon: 'i-lucide-gift', label: t('home.v2.factFree') },
  { icon: 'i-lucide-cloud', label: t('home.v2.factOrg') },
  { icon: 'i-lucide-languages', label: t('home.v2.factLang') }
])
</script>

<template>
  <div>
    <!-- HERO: one line, two buttons, the whole course moving on the right -->
    <section class="relative overflow-hidden bg-(--navy) text-white">
      <div
        class="hero-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
        <div class="hero-in">
          <p class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-blueprint-200">
            <span class="live-dot size-1.5 rounded-full bg-blueprint-400" />{{ t('home.hero.eyebrow') }}
          </p>
          <h1 class="mt-5 text-4xl font-bold leading-[1.04] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            {{ t('home.hero.title') }}
          </h1>
          <p class="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
            {{ t('home.hero.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/course')"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('home.hero.start') }}
            </UButton>
            <UButton
              :to="SITE.youtube"
              target="_blank"
              size="xl"
              color="neutral"
              variant="ghost"
              icon="i-simple-icons-youtube"
              class="text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:text-white"
            >
              YouTube
            </UButton>
          </div>
          <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <li
              v-for="f in heroFacts"
              :key="f.icon"
              class="flex items-center gap-2"
            >
              <UIcon
                :name="f.icon"
                class="size-4 text-blueprint-200"
              />{{ f.label }}
            </li>
          </ul>
        </div>
        <HomeFlowArt class="mx-auto max-w-xl" />
      </div>
    </section>

    <!-- THE COURSE: seven tiles, icons first -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="reveal text-center">
        <p class="eyebrow">
          {{ t('home.v2.learnEyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('home.v2.learnTitle') }}
        </h2>
        <p class="bp-lead mx-auto mt-3 max-w-xl">
          {{ t('home.v2.learnLead') }}
        </p>
      </div>
      <ol class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(s, i) in path"
          :key="s.key"
          class="reveal"
          :class="i === 0 ? 'lg:col-span-2' : ''"
        >
          <NuxtLink
            :to="localePath(`/course#${s.key}`)"
            class="tile group relative flex h-full flex-col rounded-[8px] border border-(--line) bg-(--card) p-6"
          >
            <span class="flex items-center justify-between">
              <span class="tile-icon flex size-12 items-center justify-center rounded-[8px] bg-(--ice) text-(--signal)">
                <UIcon
                  :name="s.icon"
                  class="size-6"
                />
              </span>
              <span class="text-3xl font-bold tabular-nums text-(--x)">{{ String(i + 1).padStart(2, '0') }}</span>
            </span>
            <h3 class="mt-5 text-lg font-bold text-(--ink) group-hover:text-(--signal)">
              {{ t(`roadmap.${s.key}.title`) }}
            </h3>
            <p class="mt-1.5 flex-1 text-[0.9375rem] leading-relaxed text-(--ink2)">
              {{ t(`roadmap.${s.key}.blurb`) }}
            </p>
            <p class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-(--ink2)">
              <UIcon
                name="i-lucide-circle-play"
                class="size-3.5 text-(--signal)"
              />{{ t('home.v2.lessons', { n: s.lessons }) }}
              <span
                v-if="s.live"
                class="ms-auto rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.06em] text-success"
              >{{ t('home.v2.live', { n: s.live }) }}</span>
              <span
                v-else
                class="ms-auto rounded-full bg-(--paper) px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.06em] text-(--label)"
              >{{ t('curriculumPage.coming') }}</span>
            </p>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <!-- HOW IT WORKS: three steps -->
    <section class="border-y border-(--line) bg-(--card)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
        <h2 class="reveal text-center text-2xl font-bold tracking-tight text-(--ink)">
          {{ t('home.v2.howTitle') }}
        </h2>
        <div class="relative mt-10">
          <div
            class="steps-line max-sm:hidden"
            aria-hidden="true"
          >
            <span class="steps-fill" />
          </div>
          <ol class="relative grid gap-8 sm:grid-cols-3">
            <li
              v-for="(st, k) in steps"
              :key="st.key"
              class="reveal flex flex-col items-center text-center"
            >
              <span class="step-ring relative z-10 flex size-16 items-center justify-center rounded-full bg-(--navy) text-white">
                <UIcon
                  :name="st.icon"
                  class="size-7"
                  :class="`anim-${st.key}`"
                />
                <span class="absolute -end-1 -top-2 flex size-6 items-center justify-center rounded-full bg-(--signal) text-xs font-bold text-white">{{ k + 1 }}</span>
              </span>
              <h3 class="mt-4 text-lg font-bold text-(--ink)">
                {{ t(`home.v2.${st.key}`) }}
              </h3>
              <p class="mt-1 max-w-[16rem] text-(--ink2)">
                {{ t(`home.v2.${st.key}Text`) }}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- GET CERTIFIED: exams, drills, capstone, and the certificate -->
    <section class="mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div class="reveal">
        <p class="eyebrow">
          {{ t('home.v2.certEyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('home.v2.certTitle') }}
        </h2>
        <ul class="mt-8 grid gap-3 sm:grid-cols-3">
          <li
            v-for="c in certFacts"
            :key="c.key"
            class="rounded-[8px] border border-(--line) bg-(--card) p-4"
          >
            <UIcon
              :name="c.icon"
              class="size-6 text-(--signal)"
            />
            <p class="mt-3 text-2xl font-bold text-(--ink)">
              {{ c.value }}
            </p>
            <p class="text-sm text-(--ink2)">
              {{ t(`home.v2.${c.key}`) }}
            </p>
          </li>
        </ul>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            :to="localePath('/certification')"
            size="lg"
            icon="i-lucide-badge-check"
          >
            {{ t('home.v2.certCta') }}
          </UButton>
          <UButton
            :to="localePath('/capstone')"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-award"
          >
            {{ t('home.v2.capstone') }}
          </UButton>
        </div>
      </div>
      <div class="reveal">
        <CourseCertificate
          sample
          animate
          wide
        />
      </div>
    </section>

    <!-- INTERVIEW PREP: real questions, by company -->
    <section class="bg-(--navy) text-white">
      <div class="mx-auto flex max-w-(--ui-container) flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
        <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-blueprint-200">
          <UIcon
            name="i-lucide-messages-square"
            class="size-7"
          />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold tracking-tight">
            {{ t('home.v2.ivTitle') }}
          </h2>
          <p class="mt-1 text-white/75">
            {{ t('home.v2.ivLead') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton
            :to="localePath('/interview-questions')"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('home.v2.ivCta') }}
          </UButton>
          <UButton
            :to="localePath('/interview-questions/new')"
            size="lg"
            color="neutral"
            variant="ghost"
            icon="i-lucide-gift"
            class="text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 hover:text-white"
          >
            {{ t('interview.reward.short') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- THE PRICE STORY: classroom vs here, to scale -->
    <HomePriceBars />

    <!-- PRICE: two cards -->
    <section class="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h2 class="reveal text-center text-3xl font-bold tracking-tight text-(--ink)">
        {{ t('home.v2.priceTitle') }}
      </h2>
      <div class="mt-10 grid gap-4 sm:grid-cols-2">
        <div class="reveal rounded-[8px] border border-(--line) bg-(--card) p-6 sm:p-8">
          <p class="flex items-center gap-2 font-bold text-(--ink)">
            <UIcon
              name="i-lucide-gift"
              class="size-5 text-success"
            />{{ t('home.v2.free') }}
          </p>
          <p class="mt-4 text-4xl font-bold text-(--ink)">
            $0
          </p>
          <p class="mt-2 text-(--ink2)">
            {{ t('home.v2.freeText') }}
          </p>
          <UButton
            :to="localePath('/course')"
            block
            size="lg"
            color="neutral"
            variant="outline"
            class="mt-6"
          >
            {{ t('home.hero.start') }}
          </UButton>
        </div>
        <div class="reveal relative overflow-hidden rounded-[8px] bg-(--navy) p-6 text-white sm:p-8">
          <p class="flex items-center gap-2 font-bold">
            <UIcon
              name="i-lucide-crown"
              class="size-5 text-blueprint-200"
            />{{ t('home.v2.pro') }}
          </p>
          <p class="mt-4 text-4xl font-bold">
            {{ usd(PRICES.monthly.usd) }}<span class="text-base font-medium text-white/60"> {{ t('home.v2.perMonth') }}</span>
          </p>
          <p class="mt-1 text-sm text-white/60">
            {{ t('home.v2.orYear', { price: usd(PRICES.yearly.usd) }) }} · {{ t('home.v2.orLifetime', { price: usd(PRICES.lifetime.usd) }) }}
          </p>
          <p class="mt-2 text-white/80">
            {{ t('home.v2.proText') }}
          </p>
          <UButton
            :to="localePath('/pro')"
            block
            size="lg"
            class="mt-6"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('home.v2.compare') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section
      v-if="faqItems.length"
      class="mx-auto max-w-3xl px-4 pb-20 sm:px-6"
    >
      <h2 class="mb-4 text-xl font-semibold text-(--ink)">
        {{ t('home.faqTitle') }}
      </h2>
      <div class="rounded-[8px] border border-(--line) bg-(--card)">
        <UAccordion
          :items="faqItems"
          :ui="{ root: 'px-5' }"
        />
      </div>
    </section>

    <!-- CLOSE -->
    <section class="relative overflow-hidden bg-(--navy) text-white">
      <div
        class="hero-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div class="relative mx-auto flex max-w-(--ui-container) flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 class="max-w-2xl text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
          {{ t('home.v2.closeTitle') }}
        </h2>
        <p class="mt-3 text-white/70">
          {{ t('home.v2.closeLead') }}
        </p>
        <UButton
          :to="localePath('/course')"
          size="xl"
          trailing-icon="i-lucide-arrow-right"
          class="mt-8"
        >
          {{ t('home.hero.start') }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-grid {
  background-image: linear-gradient(rgb(124 190 255 / .08) 1px, transparent 1px), linear-gradient(90deg, rgb(124 190 255 / .08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 70% 40%, #000 30%, transparent 75%);
}
.hero-in > * { animation: up .7s cubic-bezier(.2, .8, .2, 1) both }
.hero-in > *:nth-child(2) { animation-delay: .08s }
.hero-in > *:nth-child(3) { animation-delay: .16s }
.hero-in > *:nth-child(4) { animation-delay: .24s }
.hero-in > *:nth-child(5) { animation-delay: .32s }
.live-dot { animation: pulse 2s ease-in-out infinite }
.tile { transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s, border-color .25s }
.tile:hover { transform: translateY(-4px); border-color: var(--signal); box-shadow: 0 12px 28px -16px rgb(3 45 96 / .45) }
.tile-icon { transition: transform .3s cubic-bezier(.2, .8, .2, 1), background-color .3s, color .3s }
.tile:hover .tile-icon { transform: rotate(-6deg) scale(1.08); background: var(--signal); color: #fff }
.step-ring::after { content: ''; position: absolute; inset: -6px; border-radius: 9999px; border: 2px dashed var(--line); animation: spin 18s linear infinite }
.steps-line { position: absolute; top: 32px; left: 16.66%; right: 16.66%; height: 3px; background: var(--line); border-radius: 3px; list-style: none }
.steps-fill { display: block; height: 100%; width: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--signal), #1b96ff); transform-origin: left; animation: fill 1.6s cubic-bezier(.2, .8, .2, 1) both; animation-timeline: view(); animation-range: entry 20% cover 50% }
.anim-watch { animation: watch 2.4s ease-in-out infinite }
.anim-build { transform-origin: 70% 70%; animation: build 2.4s ease-in-out infinite .4s }
.anim-check { animation: check 2.4s ease-in-out infinite .8s }
@keyframes fill { from { transform: scaleX(0) } }
@keyframes watch { 0%, 100% { transform: scale(1) } 15% { transform: scale(1.18) } 30% { transform: scale(1) } }
@keyframes build { 0%, 40%, 100% { transform: rotate(0) } 10% { transform: rotate(-24deg) } 20% { transform: rotate(8deg) } }
@keyframes check { 0%, 50%, 100% { transform: translateY(0) } 60% { transform: translateY(-5px) } 70% { transform: translateY(0) } }
@keyframes up { from { opacity: 0; transform: translateY(14px) } }
@keyframes pulse { 50% { opacity: .35 } }
@keyframes spin { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) {
  .hero-in > *, .live-dot, .step-ring::after, .steps-fill, .anim-watch, .anim-build, .anim-check { animation: none }
  .tile, .tile-icon { transition: none }
}
</style>
