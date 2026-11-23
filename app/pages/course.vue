<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { ROADMAP } from '~/data/roadmap'

/**
 * /course — "Start here" in the navbar. The course landing: what it is, one
 * next action (lesson 1, or where a signed-in learner left off), how a lesson
 * works, then the whole path — seven sections in order on one rail, every
 * lesson with its length, kind and quiz, published or coming. Lessons live
 * under it at /course/<section>/<lesson>; /start and /curriculum 301 here.
 *
 * The plan comes from app/data/roadmap.ts + i18n `roadmap.*`; what is
 * published comes from the content navigation, so a lesson appears here the
 * moment its file exists, and its minutes/video/quiz from lesson-meta.json.
 * Prerendered for every locale; progress hydrates on top for signed-in
 * learners. Emits Course + ItemList JSON-LD.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const localePath = useLocalePath()
const route = useRoute()
const { t, locale, locales } = useI18n()
const { isDone } = useProgress()
const { isSignedIn } = useAuth()
const { of: metaOf } = useLessonMeta()

const title = computed(() => t('curriculumPage.seo.title'))
const description = computed(() => t('curriculumPage.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('curriculumPage.hero.title'), description: t('curriculumPage.hero.lead'), headline: t('curriculumPage.hero.eyebrow'), spec: `${ROADMAP.length} SECTIONS · CRM ANALYTICS` })

// `soon`: the lesson is written but not published — its page shows "coming
// soon" to learners and the full draft to the admin.
interface Row { n: number, title: string, path: string | null, minutes: number, pro: boolean, video: boolean, quiz: boolean, soon: boolean }

const slugOf = (p: string) => p.replace(/\/+$/, '').split('/').pop() ?? ''
const sections = computed(() => ROADMAP.map((sec, i) => {
  const mod = (navigation.value ?? []).find(m => slugOf(String(m.path ?? '')) === sec.slug)
  const lessons = ((mod?.children ?? []) as ContentNavigationItem[])
    .filter(c => c.path && c.path !== mod?.path)
  const isSoon = (c: ContentNavigationItem) => Boolean((c as { comingSoon?: boolean }).comingSoon)
  const rows: Row[] = Array.from({ length: Math.max(sec.lessons, lessons.length) }, (_, k) => {
    const file = lessons[k]
    if (!file) return { n: k + 1, title: t(`roadmap.${sec.key}.l${k + 1}`), path: null, minutes: 0, pro: false, video: false, quiz: false, soon: true }
    const m = metaOf(String(file.path))
    return { n: k + 1, title: String(file.title ?? ''), path: String(file.path), minutes: m.minutes, pro: Boolean(m.pro), video: m.type === 'video', quiz: m.quiz, soon: isSoon(file) }
  })
  const published = rows.filter(r => r.path && !r.soon)
  return {
    ...sec,
    n: i + 1,
    title: t(`roadmap.${sec.key}.title`),
    blurb: t(`roadmap.${sec.key}.blurb`),
    overview: mod?.path ? String(mod.path) : null,
    rows,
    live: published.length,
    minutes: published.reduce((sum, r) => sum + r.minutes, 0)
  }
}))

const liveCount = computed(() => sections.value.reduce((n, s) => n + s.live, 0))
const liveMinutes = computed(() => sections.value.reduce((n, s) => n + s.minutes, 0))
const doneIn = (s: { rows: Row[] }) => s.rows.filter(r => r.path && !r.soon && isDone(r.path)).length
const doneTotal = computed(() => sections.value.reduce((n, s) => n + doneIn(s), 0))
const plannedCount = computed(() => sections.value.reduce((n, s) => n + s.rows.length, 0))
// The next lesson to open: the first published one not finished yet.
const nextUp = computed(() => {
  for (const s of sections.value) {
    for (const r of s.rows) if (r.path && !r.soon && !isDone(r.path)) return { ...r, section: s }
  }
  return null
})
const pct = computed(() => liveCount.value ? Math.round((doneTotal.value / liveCount.value) * 100) : 0)
const started = computed(() => isSignedIn.value && doneTotal.value > 0)
const sectionDone = (s: { live: number, rows: Row[] }) => s.live > 0 && doneIn(s) === s.live

const steps = [
  { key: '1', icon: 'i-lucide-circle-play' },
  { key: '2', icon: 'i-lucide-hammer' },
  { key: '3', icon: 'i-lucide-list-checks' },
  { key: '4', icon: 'i-lucide-notebook-pen' }
] as const

// Scroll-spy for the section index.
const active = ref('s01')
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) active.value = e.target.id
  }, { rootMargin: '-30% 0px -60% 0px' })
  for (const s of ROADMAP) {
    const el = document.getElementById(s.key)
    if (el) io.observe(el)
  }
  onBeforeUnmount(() => io.disconnect())
})

const lang = computed(() => locales.value.find(l => l.code === locale.value)?.language || locale.value)
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  extra: [{
    '@type': 'Course',
    'name': SITE.name,
    'description': description.value,
    'url': `${SITE.url}${route.path}`,
    'inLanguage': lang.value,
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'isAccessibleForFree': true,
    'educationalLevel': 'Beginner to advanced',
    'teaches': ['Salesforce data model', 'CRM Analytics data prep and recipes', 'CRM Analytics dashboards', 'SAQL', 'Bindings', 'Sharing and embedding', 'Einstein Discovery'],
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': 'PT20H' },
    'offers': [
      { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'category': 'Subscription', 'price': String(PRICES.monthly.usd), 'priceCurrency': 'USD' }
    ],
    'syllabusSections': sections.value.map((s, i) => ({ '@type': 'Syllabus', 'name': s.title, 'description': s.blurb, 'position': i + 1 }))
  }, {
    '@type': 'ItemList',
    'name': title.value,
    'itemListElement': sections.value.flatMap(s => s.rows.filter(r => r.path && !r.soon)).map((r, i) => ({
      '@type': 'ListItem', 'position': i + 1, 'name': r.title, 'url': `${SITE.url}${localePath(r.path!)}`
    }))
  }]
}))
</script>

<template>
  <div>
    <!-- Hero: what this is, and one next action -->
    <section class="course-hero relative overflow-hidden bg-(--navy) text-white">
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[.12em] text-blueprint-200">
            {{ t('curriculumPage.hero.eyebrow') }}
          </p>
          <h1 class="mt-2 text-4xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
            {{ t('curriculumPage.hero.title') }}
          </h1>
          <p class="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-white/75">
            {{ t('curriculumPage.hero.lead') }}
          </p>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <UButton
              v-if="nextUp"
              :to="localePath(nextUp.path!)"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              <ClientOnly>
                {{ started ? t('curriculumPage.continue') : t('curriculumPage.hero.first') }}
                <template #fallback>
                  {{ t('curriculumPage.hero.first') }}
                </template>
              </ClientOnly>
            </UButton>
            <UButton
              href="#how"
              size="xl"
              color="neutral"
              variant="ghost"
              class="text-white hover:bg-white/10"
              icon="i-lucide-info"
            >
              {{ t('curriculumPage.how.title') }}
            </UButton>
          </div>

          <!-- The numbers -->
          <dl class="mt-8 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-white/10 bg-white/10 sm:grid-cols-4">
            <div
              v-for="stat in [
                { n: sections.length, label: t('curriculumPage.stat.sections') },
                { n: plannedCount, label: t('curriculumPage.stat.lessons') },
                { n: liveCount, label: t('curriculumPage.stat.live') },
                { n: liveMinutes, label: t('curriculumPage.stat.minutes') }
              ]"
              :key="stat.label"
              class="bg-(--navy) px-4 py-3"
            >
              <dt class="sr-only">
                {{ stat.label }}
              </dt>
              <dd class="text-2xl font-bold tabular-nums">
                {{ stat.n }}
              </dd>
              <dd class="text-xs text-white/60">
                {{ stat.label }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Your place: progress and the next lesson -->
        <div class="rounded-[8px] border border-white/10 bg-(--card) p-5 text-(--ink) shadow-[0_20px_40px_-24px_rgb(0_0_0/.6)]">
          <ClientOnly>
            <div
              v-if="started"
              class="mb-4 flex items-center gap-4 border-b border-(--line) pb-4"
            >
              <svg
                viewBox="0 0 36 36"
                class="size-14 shrink-0 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--line)"
                  stroke-width="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--signal)"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  :stroke-dasharray="`${pct * 0.974} 100`"
                />
              </svg>
              <div>
                <p class="mono-label">
                  {{ t('curriculumPage.progress') }}
                </p>
                <p class="text-2xl font-bold tabular-nums text-(--ink)">
                  {{ doneTotal }}<span class="text-base font-medium text-(--ink2)"> / {{ liveCount }}</span>
                </p>
              </div>
            </div>
          </ClientOnly>

          <template v-if="nextUp">
            <p class="mono-label">
              <ClientOnly>
                {{ started ? t('curriculumPage.nextUp') : t('curriculumPage.firstUp') }}
                <template #fallback>
                  {{ t('curriculumPage.firstUp') }}
                </template>
              </ClientOnly>
            </p>
            <NuxtLink
              :to="localePath(nextUp.path!)"
              class="mt-1 block font-semibold leading-snug text-(--ink) hover:text-(--signal)"
            >
              {{ nextUp.title }}
            </NuxtLink>
            <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--ink2)">
              <span>{{ t('curriculumPage.section', { n: nextUp.section.n }) }} · {{ nextUp.section.title }}</span>
            </p>
            <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums text-(--ink2)">
              <span class="inline-flex items-center gap-1">
                <UIcon
                  :name="nextUp.video ? 'i-lucide-circle-play' : 'i-lucide-book-open'"
                  class="size-4"
                />{{ nextUp.video ? t('curriculumPage.kind.video') : t('curriculumPage.kind.article') }}
              </span>
              <span class="inline-flex items-center gap-1">
                <UIcon
                  name="i-lucide-clock"
                  class="size-4"
                />{{ t('curriculumPage.minutes', { n: nextUp.minutes }) }}
              </span>
              <span
                v-if="nextUp.quiz"
                class="inline-flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-list-checks"
                  class="size-4"
                />{{ t('curriculumPage.quiz') }}
              </span>
            </p>
            <UButton
              :to="localePath(nextUp.path!)"
              size="lg"
              block
              trailing-icon="i-lucide-arrow-right"
              class="mt-4"
            >
              <ClientOnly>
                {{ started ? t('curriculumPage.continue') : t('curriculumPage.hero.first') }}
                <template #fallback>
                  {{ t('curriculumPage.hero.first') }}
                </template>
              </ClientOnly>
            </UButton>
          </template>
          <p
            v-else-if="liveCount"
            class="flex items-center gap-2 text-sm font-semibold text-success"
          >
            <UIcon
              name="i-lucide-party-popper"
              class="size-4"
            />{{ t('curriculumPage.allDone') }}
          </p>
          <ClientOnly>
            <p
              v-if="!isSignedIn"
              class="mt-3 text-center text-xs text-(--ink2)"
            >
              {{ t('curriculumPage.progressNone') }}
            </p>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- How a lesson works -->
    <section
      id="how"
      class="scroll-mt-20 border-b border-(--line) bg-(--card)"
    >
      <div class="mx-auto max-w-(--ui-container) px-4 py-8 sm:px-6 lg:px-8">
        <p class="mono-label">
          {{ t('curriculumPage.how.title') }}
        </p>
        <ol class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(step, i) in steps"
            :key="step.key"
            class="flex items-center gap-3"
          >
            <span class="bp-iconbox">
              <UIcon
                :name="step.icon"
                class="size-5"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ i + 1 }}</span>
              <span class="block font-semibold leading-snug text-(--ink)">{{ t(`curriculumPage.how.${step.key}`) }}</span>
            </span>
          </li>
        </ol>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8">
      <!-- Left: the sections, sticky -->
      <aside class="hidden lg:block">
        <nav
          class="sticky top-24 rounded-[8px] border border-(--line) bg-(--card) p-3"
          :aria-label="t('curriculumPage.sidebar')"
        >
          <p class="mono-label mb-2 px-2 pt-1">
            {{ t('curriculumPage.sidebar') }}
          </p>
          <ol>
            <li
              v-for="s in sections"
              :key="s.key"
            >
              <a
                :href="`#${s.key}`"
                class="group flex items-center gap-3 rounded-[6px] px-2 py-2 transition-colors"
                :class="active === s.key ? 'bg-(--ice)' : 'hover:bg-(--paper)'"
                :aria-current="active === s.key ? 'step' : undefined"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-[6px] text-sm font-bold tabular-nums transition-colors"
                  :class="active === s.key ? 'bg-(--signal) text-white' : s.live ? 'bg-(--ice) text-(--signal)' : 'bg-(--paper) text-(--x)'"
                >{{ s.n }}</span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate text-sm leading-snug"
                    :class="active === s.key ? 'font-semibold text-(--ink)' : s.live ? 'text-(--ink)' : 'text-(--ink2)'"
                  >{{ s.title }}</span>
                  <ClientOnly v-if="s.live && isSignedIn">
                    <span class="mt-1 block h-1 overflow-hidden rounded-full bg-(--line)">
                      <span
                        class="block h-full rounded-full bg-(--signal)"
                        :style="{ width: `${(doneIn(s) / s.live) * 100}%` }"
                      />
                    </span>
                  </ClientOnly>
                </span>
                <UIcon
                  v-if="!s.live"
                  name="i-lucide-lock-keyhole"
                  class="size-3.5 shrink-0 text-(--x)"
                  :aria-label="t('curriculumPage.coming')"
                />
              </a>
            </li>
          </ol>
        </nav>
      </aside>

      <!-- The path: every section on one rail, in order -->
      <div class="min-w-0">
        <header class="mb-6">
          <h2 class="bp-h3">
            {{ t('curriculumPage.path') }}
          </h2>
          <p class="mt-1 text-(--ink2)">
            {{ t('curriculumPage.pathLead') }}
          </p>
          <!-- Phones and tablets: jump to a section -->
          <nav
            class="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
            :aria-label="t('curriculumPage.sidebar')"
          >
            <a
              v-for="s in sections"
              :key="s.key"
              :href="`#${s.key}`"
              class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
              :class="s.live ? 'border-(--signal) text-(--signal)' : 'border-(--line) text-(--ink2)'"
            >
              <span class="tabular-nums">{{ s.n }}</span>{{ s.title }}
            </a>
          </nav>
        </header>

        <ol class="course-rail space-y-5">
          <template
            v-for="(s, si) in sections"
            :key="s.key"
          >
            <li
              :id="s.key"
              class="relative scroll-mt-24 pl-12 sm:pl-14"
            >
              <!-- The node on the rail -->
              <ClientOnly>
                <span
                  class="rail-node"
                  :class="sectionDone(s) ? 'bg-success text-white border-success' : s.live ? 'bg-(--signal) text-white border-(--signal)' : 'bg-(--card) text-(--x) border-(--line)'"
                  aria-hidden="true"
                >
                  <UIcon
                    v-if="sectionDone(s)"
                    name="i-lucide-check"
                    class="size-4"
                  />
                  <template v-else>{{ s.n }}</template>
                </span>
                <template #fallback>
                  <span
                    class="rail-node"
                    :class="s.live ? 'bg-(--signal) text-white border-(--signal)' : 'bg-(--card) text-(--x) border-(--line)'"
                    aria-hidden="true"
                  >{{ s.n }}</span>
                </template>
              </ClientOnly>

              <!-- A published section: open, every lesson listed -->
              <section
                v-if="s.live"
                class="overflow-hidden rounded-[8px] border border-(--line) bg-(--card)"
              >
                <header class="flex items-start gap-5 border-b border-(--line) bg-gradient-to-r from-(--ice)/70 to-transparent px-5 py-5 sm:px-6">
                  <div class="min-w-0 flex-1">
                    <p class="mono-label">
                      {{ t('curriculumPage.section', { n: s.n }) }} · {{ lessonsLabel(t, s.rows.length) }} · {{ t('curriculumPage.minutes', { n: s.minutes }) }}
                    </p>
                    <h3 class="mt-1 text-xl font-bold tracking-tight text-(--ink)">
                      <NuxtLink
                        v-if="s.overview"
                        :to="localePath(s.overview)"
                        class="hover:text-(--signal)"
                      >{{ s.title }}</NuxtLink>
                      <template v-else>
                        {{ s.title }}
                      </template>
                    </h3>
                    <p class="mt-2 flex gap-2 text-[0.9375rem] text-(--ink2)">
                      <UIcon
                        name="i-lucide-target"
                        class="mt-0.5 size-4 shrink-0 text-(--signal)"
                      />{{ s.blurb }}
                    </p>
                    <ClientOnly>
                      <p
                        v-if="isSignedIn"
                        class="mt-3 flex items-center gap-2 text-xs font-semibold tabular-nums text-(--signal)"
                      >
                        <span class="h-1.5 w-28 overflow-hidden rounded-full bg-(--line)">
                          <span
                            class="block h-full rounded-full bg-(--signal)"
                            :style="{ width: `${(doneIn(s) / s.live) * 100}%` }"
                          />
                        </span>{{ doneIn(s) }}/{{ s.live }}
                      </p>
                    </ClientOnly>
                  </div>
                  <CourseSectionArt
                    :section="s.key"
                    class="hidden w-32 shrink-0 sm:block"
                  />
                </header>
                <ol class="divide-y divide-(--line)">
                  <li
                    v-for="r in s.rows"
                    :key="r.n"
                  >
                    <NuxtLink
                      v-if="r.path && !r.soon"
                      :to="localePath(r.path)"
                      class="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-(--ice)/50 sm:gap-4 sm:px-6"
                    >
                      <ClientOnly>
                        <span
                          class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums"
                          :class="isDone(r.path) ? 'bg-success text-white' : 'border border-(--signal) text-(--signal) group-hover:bg-(--signal) group-hover:text-white'"
                        >
                          <UIcon
                            v-if="isDone(r.path)"
                            name="i-lucide-check"
                            class="size-4"
                          />
                          <template v-else>{{ s.n }}.{{ r.n }}</template>
                        </span>
                        <template #fallback>
                          <span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-(--signal) text-xs font-bold tabular-nums text-(--signal)">{{ s.n }}.{{ r.n }}</span>
                        </template>
                      </ClientOnly>
                      <span class="min-w-0 flex-1">
                        <span class="block font-medium leading-snug text-(--ink) group-hover:text-(--signal)">{{ r.title }}</span>
                        <span class="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs tabular-nums text-(--ink2)">
                          <span class="inline-flex items-center gap-1">
                            <UIcon
                              :name="r.video ? 'i-lucide-circle-play' : 'i-lucide-book-open'"
                              class="size-3.5"
                            />{{ r.video ? t('curriculumPage.kind.video') : t('curriculumPage.kind.article') }}
                          </span>
                          <span>{{ t('curriculumPage.minutes', { n: r.minutes }) }}</span>
                          <span
                            v-if="r.quiz"
                            class="inline-flex items-center gap-1"
                          >
                            <UIcon
                              name="i-lucide-list-checks"
                              class="size-3.5"
                            />{{ t('curriculumPage.quiz') }}
                          </span>
                        </span>
                      </span>
                      <span
                        v-if="r.pro"
                        class="rounded-[4px] bg-(--navy) px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em] text-white"
                      >{{ t('pro.tag') }}</span>
                      <UIcon
                        name="i-lucide-arrow-right"
                        class="bp-arrow hidden size-4 shrink-0 text-(--ink2) sm:block"
                      />
                    </NuxtLink>
                    <NuxtLinkLocale
                      v-else-if="r.path"
                      :to="r.path"
                      class="flex items-center gap-3 px-5 py-3.5 hover:bg-(--paper) sm:gap-4 sm:px-6"
                    >
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-(--x) text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>
                      <span class="min-w-0 flex-1 text-(--ink2)">{{ r.title }}</span>
                      <span class="text-[10px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.coming') }}</span>
                    </NuxtLinkLocale>
                    <div
                      v-else
                      class="flex items-center gap-3 px-5 py-3.5 sm:gap-4 sm:px-6"
                    >
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-(--x) text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>
                      <span class="min-w-0 flex-1 text-(--ink2)">{{ r.title }}</span>
                      <span class="text-[10px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.coming') }}</span>
                    </div>
                  </li>
                </ol>
              </section>

              <!-- A planned section: one line, the lessons folded -->
              <details
                v-else
                class="group/plan rounded-[8px] border border-(--line) bg-(--card)"
              >
                <summary class="flex cursor-pointer list-none items-center gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span class="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-(--paper) text-(--ink2)">
                    <UIcon
                      :name="s.icon"
                      class="size-5"
                    />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.section', { n: s.n }) }} · {{ t('curriculumPage.coming') }}</span>
                    <span class="block font-semibold text-(--ink)">{{ s.title }}</span>
                    <span class="mt-0.5 block text-sm text-(--ink2)">{{ s.blurb }}</span>
                  </span>
                  <span class="hidden shrink-0 text-sm text-(--ink2) sm:block">{{ lessonsLabel(t, s.rows.length) }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-5 shrink-0 text-(--ink2) transition-transform group-open/plan:rotate-180"
                  />
                </summary>
                <ol class="border-t border-(--line) px-5 py-3 sm:px-6">
                  <li
                    v-for="r in s.rows"
                    :key="r.n"
                  >
                    <NuxtLinkLocale
                      v-if="r.path"
                      :to="r.path"
                      class="flex items-center gap-3 py-1.5 text-sm text-(--ink2) hover:text-(--signal)"
                    >
                      <span class="w-8 shrink-0 text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>{{ r.title }}
                    </NuxtLinkLocale>
                    <span
                      v-else
                      class="flex items-center gap-3 py-1.5 text-sm text-(--ink2)"
                    >
                      <span class="w-8 shrink-0 text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>{{ r.title }}
                    </span>
                  </li>
                </ol>
              </details>
            </li>

            <li
              v-if="si === 1"
              class="pl-12 sm:pl-14"
            >
              <PromoSlot unit="responsiveLeaderboard" />
            </li>
          </template>

          <!-- The finish line -->
          <li class="relative pl-12 sm:pl-14">
            <span
              class="rail-node border-(--navy) bg-(--navy) text-blueprint-200"
              aria-hidden="true"
            >
              <UIcon
                name="i-lucide-flag"
                class="size-4"
              />
            </span>
            <NuxtLink
              :to="localePath('/capstone')"
              class="group flex items-center gap-4 rounded-[8px] bg-(--navy) p-5 text-white"
            >
              <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-blueprint-200">
                <UIcon
                  name="i-lucide-award"
                  class="size-6"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-bold">{{ t('capstone.title') }}</span>
                <span class="block text-sm text-white/70">{{ t('capstone.lead') }}</span>
              </span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-5 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgb(124 190 255 / .08) 1px, transparent 1px), linear-gradient(90deg, rgb(124 190 255 / .08) 1px, transparent 1px);
  background-size: 48px 48px; mask-image: radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)
}
/* The rail: one line through every section's node, top to the finish. */
.course-rail { position: relative }
.course-rail::before {
  content: ''; position: absolute; left: 15px; top: 16px; bottom: 32px; width: 2px;
  background: var(--line)
}
.rail-node {
  position: absolute; left: 0; top: 14px; z-index: 1;
  display: flex; width: 32px; height: 32px; align-items: center; justify-content: center;
  border-radius: 9999px; border-width: 2px; font-size: 13px; font-weight: 700;
  font-variant-numeric: tabular-nums
}
@media (min-width: 640px) {
  .course-rail::before { left: 19px }
  .rail-node { width: 40px; height: 40px; top: 18px }
}
</style>
