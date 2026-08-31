<script setup lang="ts">
function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
}

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

const stats = computed(() => [
  { value: '18', label: t('home.stats.lessons') },
  { value: '42m', label: t('home.stats.video') },
  { value: '100%', label: t('home.stats.free') }
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
const personaIcons = ['i-lucide-line-chart', 'i-lucide-settings-2', 'i-lucide-briefcase', 'i-lucide-sprout']

const personas = computed(() =>
  (tm('home.personas') as { t: string, d: string }[]).map((p, i) => ({ icon: personaIcons[i % personaIcons.length]!, title: rt(p.t), desc: rt(p.d) }))
)
const faqs = computed(() =>
  (tm('home.faqs') as { q: string, a: string }[]).map(f => ({ q: rt(f.q), a: rt(f.a) }))
)

const featureIcons = ['i-lucide-workflow', 'i-lucide-chart-column', 'i-lucide-sparkles']
const features = computed(() =>
  (tm('home.features') as { t: string, d: string }[]).map((f, i) => ({
    title: rt(f.t),
    desc: rt(f.d),
    icon: featureIcons[i % featureIcons.length]!
  }))
)

const outcomes = computed(() =>
  (tm('home.outcomes') as { t: string, d: string }[]).map(o => ({ title: rt(o.t), desc: rt(o.d) }))
)

// Rotated across the module cards so the curriculum reads as a sequence of
// distinct stages rather than eight identical tiles.
const accents = ['brand', 'data', 'progress', 'caution', 'action', 'meta'] as const

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
    <!-- ── Hero ─────────────────────────────────────────────────────────── -->
    <section class="hero bg-grid">
      <div class="container  hero__grid">
        <div class="hero__copy">
          <UiBadge
            tone="brand"
            icon="i-lucide-sparkles"
          >
            {{ t('hero.badge') }}
          </UiBadge>

          <h1 class="hero__title">
            {{ t('hero.titleLead') }}
            <span class="hero__accent">{{ t('hero.titleAccent') }}</span>
          </h1>

          <p class="lead hero__sub">
            {{ t('hero.subtitle') }}
          </p>

          <div class="hero__actions">
            <UiButton
              variant="primary"
              size="lg"
              :to="localePath('/foundations')"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('hero.start') }}
            </UiButton>
            <UiButton
              size="lg"
              href="#curriculum"
              icon="i-lucide-graduation-cap"
            >
              {{ t('hero.browse') }}
            </UiButton>
            <UiButton
              size="lg"
              square
              icon="i-lucide-search"
              :aria-label="t('hero.search')"
              :title="t('hero.search')"
              @click="openSearch"
            />
          </div>

          <ul class="hero__facts">
            <li
              v-for="f in [t('hero.f1'), t('hero.f2'), t('hero.f3')]"
              :key="f"
            >
              <Icon
                name="i-lucide-check"
                class="hero__tick"
              />{{ f }}
            </li>
          </ul>
        </div>

        <div class="hero__demo">
          <HeroDemo />
        </div>
      </div>
    </section>

    <!-- ── Stats ────────────────────────────────────────────────────────── -->
    <section class="stats">
      <div class="container  stats__inner">
        <div
          v-for="s in stats"
          :key="s.label"
          class="stats__cell"
        >
          <p class="stats__value">
            {{ s.value }}
          </p>
          <p class="stats__label">
            {{ s.label }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Curriculum ───────────────────────────────────────────────────── -->
    <section
      id="curriculum"
      class="section"
    >
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">
            {{ t('home.curriculumEyebrow') }}
          </p>
          <h2>{{ t('home.curriculumTitle') }}</h2>
          <p class="lead">
            {{ t('home.curriculumSubtitle') }}
          </p>
        </header>

        <div
          class="grid-auto grid-min-20"
        >
          <UiCard
            v-for="(m, i) in modules"
            :key="m.to"
            :to="localePath(m.to)"
            :accent="accents[i % accents.length]"
            padding="lg"
            class="mod"
          >
            <div class="mod__top">
              <span class="mod__n">{{ m.n }}</span>
              <Icon
                :name="m.icon"
                class="mod__icon"
              />
            </div>

            <h3 class="mod__title">
              {{ m.title }}
            </h3>
            <p class="mod__desc">
              {{ m.desc }}
            </p>

            <p class="mod__meta">
              <Icon name="i-lucide-book-open" />
              {{ m.lessons.length }} {{ t('home.stats.lessons').toLowerCase() }}
            </p>
          </UiCard>
        </div>
      </div>
    </section>

    <!-- ── How it works ─────────────────────────────────────────────────── -->
    <section class="section section--sunken">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">
            {{ t('home.howEyebrow') }}
          </p>
          <h2>{{ t('home.howTitle') }}</h2>
        </header>

        <div
          class="grid-auto grid-min-16"
        >
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="step"
          >
            <span class="step__num">{{ i + 1 }}</span>
            <Icon
              :name="f.icon"
              class="step__icon"
            />
            <h3 class="step__title">
              {{ f.title }}
            </h3>
            <p class="step__desc">
              {{ f.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Outcomes ─────────────────────────────────────────────────────── -->
    <section class="section">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">
            {{ t('home.outcomesEyebrow') }}
          </p>
          <h2>{{ t('home.outcomesTitle') }}</h2>
          <p class="lead">
            {{ t('home.outcomesSubtitle') }}
          </p>
        </header>

        <ul
          class="grid-auto outcomes"
        >
          <li
            v-for="o in outcomes"
            :key="o.title"
            class="outcome"
          >
            <Icon
              name="i-lucide-circle-check"
              class="outcome__tick"
            />
            <div>
              <p class="outcome__title">
                {{ o.title }}
              </p>
              <p class="outcome__desc">
                {{ o.desc }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── Who it's for ─────────────────────────────────────────────────── -->
    <section class="section section--sunken">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">
            {{ t('home.whoEyebrow') }}
          </p>
          <h2>{{ t('home.whoTitle') }}</h2>
        </header>

        <div
          class="grid-auto grid-min-18"
        >
          <UiCard
            v-for="p in personas"
            :key="p.title"
            padding="md"
          >
            <Icon
              :name="p.icon"
              class="persona__icon"
            />
            <h3 class="persona__title">
              {{ p.title }}
            </h3>
            <p class="persona__desc">
              {{ p.desc }}
            </p>
          </UiCard>
        </div>
      </div>
    </section>

    <!-- ── FAQ ──────────────────────────────────────────────────────────── -->
    <section class="section">
      <div class="container is-max-widescreen">
        <header class="section__head">
          <h2>FAQ</h2>
        </header>

        <div class="faq">
          <details
            v-for="f in faqs"
            :key="f.q"
            class="faq__item"
          >
            <summary class="faq__q">
              <span>{{ f.q }}</span>
              <Icon
                name="i-lucide-plus"
                class="faq__sign"
              />
            </summary>
            <p class="faq__a">
              {{ f.a }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- ── Final CTA ────────────────────────────────────────────────────── -->
    <section class="section">
      <div class="container">
        <div class="cta">
          <h2 class="cta__title">
            {{ t('home.resourcesTitle') }}
          </h2>
          <p class="cta__desc">
            {{ t('home.getInvolved.blurb') }}
          </p>
          <div class="cta__actions">
            <UiButton
              variant="primary"
              size="lg"
              :to="localePath('/foundations')"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('hero.start') }}
            </UiButton>
            <UiButton
              size="lg"
              :to="localePath('/contribute')"
              icon="i-lucide-git-pull-request"
            >
              {{ t('home.getInvolved.contribute') }}
            </UiButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// ── Hero ───────────────────────────────────────────────────────────────────
.hero {
  padding-block: var(--s-8) var(--s-7);
  border-block-end: 1px solid var(--c-line);

  @media (min-width: 48rem) {
    padding-block: var(--s-8);
  }
}

// Two columns from lg: copy left, live demo right. Below that the demo drops
// under the copy rather than shrinking — at phone width it would be unreadable
// at any size that still left room for the headline.
.hero__grid {
  display: grid;
  gap: var(--s-6);
  align-items: center;

  @media (min-width: 64rem) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: var(--s-7);
  }
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  max-width: 34rem;
}

.hero__demo {
  // Keeps the demo from stretching to the full column on very wide screens,
  // where a 900px-wide dashboard mock stops reading as a product screenshot.
  max-width: 34rem;
  width: 100%;
  justify-self: center;
}

.hero__title {
  font-size: var(--t-h1);
  line-height: 1.05;
  margin: 0;

  @media (min-width: 64rem) {
    font-size: clamp(2.5rem, 1.2rem + 2.6vi, 3.75rem);
  }
}

// The accent phrase gets the brand, plus a rule under it that reads like a
// plotted baseline — the same axis-tick motif the prose headings use.
.hero__accent {
  position: relative;
  color: var(--c-brand);
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    inset-block-end: -0.08em;
    height: 0.09em;
    border-radius: var(--r-full);
    background: var(--aqua);
  }
}

.hero__sub {
  margin: 0;
  max-width: 44ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
  margin-block-start: var(--s-2);
}

.hero__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-5);
  list-style: none;
  margin: var(--s-2) 0 0;
  padding: 0;
  font-size: var(--t-small);
  color: var(--c-text-soft);

  li { display: inline-flex; align-items: center; gap: var(--s-1); }
}

.hero__tick {
  width: 1rem;
  height: 1rem;
  color: var(--bulma-primary);
}

// ── Stats ──────────────────────────────────────────────────────────────────
.stats {
  background: var(--c-brand-strong);
  color: #fff;
}

.stats__inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-block: var(--s-5);
}

.stats__cell {
  text-align: center;

  & + & {
    border-inline-start: 1px solid rgb(255 255 255 / 0.18);
  }
}

.stats__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1rem + 2vi, 2.5rem);
  line-height: 1;
}

.stats__label {
  margin: var(--s-1) 0 0;
  font-size: var(--t-tiny);
  color: rgb(255 255 255 / 0.75);
}

// ── Module cards ───────────────────────────────────────────────────────────
.mod__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: var(--s-3);
}

.mod__n {
  font-family: var(--font-mono);
  font-size: var(--t-tiny);
  font-weight: 700;
  color: var(--c-text-faint);
}

.mod__icon {
  width: 1.4rem;
  height: 1.4rem;
  color: var(--c-brand);
}

.mod__title {
  margin: 0;
  font-size: var(--t-h4);
}

.mod__desc {
  margin: var(--s-2) 0 0;
  font-size: var(--t-small);
  color: var(--c-text-soft);
  // Keeps eight cards on a uniform grid when their copy differs in length.
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mod__meta {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  margin: var(--s-4) 0 0;
  font-size: var(--t-tiny);
  color: var(--c-text-faint);

  svg, span { width: 0.9rem; height: 0.9rem; }
}

// ── Steps ──────────────────────────────────────────────────────────────────
.step {
  position: relative;
  padding-block-start: var(--s-5);
  border-block-start: 2px solid var(--c-line);
}

.step__num {
  position: absolute;
  inset-block-start: calc(var(--s-4) * -1);
  inset-inline-start: 0;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--r-full);
  background: var(--c-brand);
  color: var(--c-on-brand);
  font-family: var(--font-display);
  font-size: var(--t-tiny);
}

.step__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--aqua);
}

.step__title {
  margin: var(--s-3) 0 0;
  font-size: var(--t-h4);
}

.step__desc {
  margin: var(--s-2) 0 0;
  font-size: var(--t-small);
  color: var(--c-text-soft);
}

// ── Outcomes ───────────────────────────────────────────────────────────────
.outcomes {
  list-style: none;
  margin: 0;
  padding: 0;
}

.outcome {
  display: flex;
  gap: var(--s-3);
}

.outcome__tick {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-block-start: 0.15rem;
  color: var(--bulma-primary);
}

.outcome__title {
  margin: 0;
  font-weight: 650;
}

.outcome__desc {
  margin: var(--s-1) 0 0;
  font-size: var(--t-small);
  color: var(--c-text-soft);
}

// ── Personas ───────────────────────────────────────────────────────────────
.persona__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--violet);
}

.persona__title {
  margin: var(--s-3) 0 0;
  font-size: var(--t-h4);
}

.persona__desc {
  margin: var(--s-2) 0 0;
  font-size: var(--t-small);
  color: var(--c-text-soft);
}

// ── FAQ ────────────────────────────────────────────────────────────────────
.faq {
  max-width: 48rem;
  border-block-start: 1px solid var(--c-line);
}

.faq__item {
  border-block-end: 1px solid var(--c-line);
}

.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding-block: var(--s-4);
  font-weight: 650;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker { display: none; }
  &:hover { color: var(--c-brand-text); }
}

.faq__sign {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
  color: var(--c-text-faint);
  transition: transform var(--dur-mid) var(--ease-spring);
}

.faq__item[open] .faq__sign {
  transform: rotate(45deg);
}

.faq__a {
  margin: 0;
  padding-block-end: var(--s-4);
  max-width: 62ch;
  font-size: var(--t-small);
  color: var(--c-text-soft);
}

// ── CTA ────────────────────────────────────────────────────────────────────
.cta {
  padding: var(--s-7) var(--s-5);
  border-radius: var(--r-xl);
  background: var(--c-brand-strong);
  color: #fff;
  text-align: center;
}

.cta__title {
  margin: 0;
  color: #fff;
  font-size: var(--t-h2);
}

.cta__desc {
  margin: var(--s-3) auto 0;
  max-width: 52ch;
  color: rgb(255 255 255 / 0.82);
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-3);
  margin-block-start: var(--s-5);
}
</style>
