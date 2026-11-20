<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { NuxtLinkLocale } from '#components'
import { ROADMAP } from '~/data/roadmap'

/**
 * /start — the course, in order. A hero with one next action (continue where
 * you left off, or lesson 1), then two columns: the sections (sticky, with
 * progress) and the plan. Published sections open in full; planned ones fold
 * to one line so the page stays short.
 *
 * The plan comes from app/data/roadmap.ts + i18n `roadmap.*`; what is
 * published comes from the content navigation, so a lesson appears here the
 * moment its file exists. Prerendered for every locale; progress hydrates on
 * top for signed-in learners. Emits Course + ItemList JSON-LD.
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
defineOgImage('Docs', { title: t('curriculumPage.hero.title'), description: t('curriculumPage.hero.lead'), headline: t('curriculumPage.hero.eyebrow'), spec: `${ROADMAP.length} SECTIONS · FREE TO START` })

// `soon`: the lesson is written but not published — its page shows "coming
// soon" to learners and the full draft to the admin.
interface Row { n: number, title: string, path: string | null, minutes: number, pro: boolean, video: boolean, soon: boolean }

const slugOf = (p: string) => p.replace(/\/+$/, '').split('/').pop() ?? ''
const sections = computed(() => ROADMAP.map((sec, i) => {
  const mod = (navigation.value ?? []).find(m => slugOf(String(m.path ?? '')) === sec.slug)
  const lessons = ((mod?.children ?? []) as ContentNavigationItem[])
    .filter(c => c.path && c.path !== mod?.path)
  const isSoon = (c: ContentNavigationItem) => Boolean((c as { comingSoon?: boolean }).comingSoon)
  const published = lessons.filter(c => !isSoon(c))
  const rows: Row[] = Array.from({ length: Math.max(sec.lessons, lessons.length) }, (_, k) => {
    const file = lessons[k]
    if (!file) return { n: k + 1, title: t(`roadmap.${sec.key}.l${k + 1}`), path: null, minutes: 0, pro: false, video: false, soon: true }
    const m = metaOf(String(file.path))
    return { n: k + 1, title: String(file.title ?? ''), path: String(file.path), minutes: m.minutes, pro: Boolean(m.pro), video: m.type === 'video', soon: isSoon(file) }
  })
  return { ...sec, n: i + 1, title: t(`roadmap.${sec.key}.title`), blurb: t(`roadmap.${sec.key}.blurb`), overview: mod?.path ? String(mod.path) : null, rows, live: published.length }
}))

const liveCount = computed(() => sections.value.reduce((n, s) => n + s.live, 0))
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
const steps = [
  { key: 1, icon: 'i-lucide-circle-play' },
  { key: 2, icon: 'i-lucide-book-open' },
  { key: 3, icon: 'i-lucide-list-checks' },
  { key: 4, icon: 'i-lucide-notebook-pen' }
]

// Scroll-spy for the sidebar.
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
    'teaches': ['Salesforce data model', 'GTM metrics', 'Data architecture', 'CRM Analytics dashboards', 'Bindings', 'Einstein Discovery'],
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': 'PT20H' },
    'offers': [
      { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'category': 'Subscription', 'price': String(PRICES.monthly.usd), 'priceCurrency': 'USD' }
    ],
    'syllabusSections': sections.value.map((s, i) => ({ '@type': 'Syllabus', 'name': s.title, 'description': s.blurb, 'position': i + 1 }))
  }, {
    '@type': 'ItemList',
    'name': title.value,
    'itemListElement': sections.value.flatMap(s => s.rows.filter(r => r.path)).map((r, i) => ({
      '@type': 'ListItem', 'position': i + 1, 'name': r.title, 'url': `${SITE.url}${localePath(r.path!)}`
    }))
  }]
}))
</script>

<template>
  <div>
    <!-- Hero: what this is, and one next action -->
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div>
          <p class="eyebrow">
            {{ t('curriculumPage.hero.eyebrow') }}
          </p>
          <h1 class="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-(--ink) sm:text-4xl">
            {{ t('curriculumPage.hero.title') }}
          </h1>
          <p class="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-(--ink2)">
            {{ t('curriculumPage.hero.lead') }}
          </p>
          <!-- How a lesson works, as four icons -->
          <ol
            class="mt-6 flex flex-wrap gap-2"
            :aria-label="t('curriculumPage.how.title')"
          >
            <li
              v-for="st in steps"
              :key="st.key"
              class="flex items-center gap-2 rounded-full border border-(--line) bg-(--paper) py-1.5 ps-1.5 pe-3 text-sm text-(--ink)"
            >
              <span class="flex size-6 items-center justify-center rounded-full bg-(--ice) text-(--signal)">
                <UIcon
                  :name="st.icon"
                  class="size-3.5"
                />
              </span>
              {{ t(`curriculumPage.how.${st.key}`) }}
            </li>
          </ol>
        </div>

        <!-- Your path: continue, or begin -->
        <div class="rounded-[8px] border border-(--line) bg-(--card) p-5 shadow-[0_4px_16px_-8px_rgb(3_45_96/.25)]">
          <ClientOnly>
            <template v-if="isSignedIn && doneTotal > 0">
              <div class="flex items-center gap-4">
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
            </template>
            <template v-else>
              <dl class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt class="sr-only">
                    {{ t('curriculumPage.sidebar') }}
                  </dt>
                  <dd class="text-2xl font-bold tabular-nums text-(--ink)">
                    {{ sections.length }}
                  </dd>
                  <dd class="text-xs text-(--ink2)">
                    {{ t('curriculumPage.stat.sections') }}
                  </dd>
                </div>
                <div>
                  <dt class="sr-only">
                    {{ t('curriculumPage.stat.lessons') }}
                  </dt>
                  <dd class="text-2xl font-bold tabular-nums text-(--ink)">
                    {{ plannedCount }}
                  </dd>
                  <dd class="text-xs text-(--ink2)">
                    {{ t('curriculumPage.stat.lessons') }}
                  </dd>
                </div>
                <div>
                  <dt class="sr-only">
                    {{ t('curriculumPage.stat.live') }}
                  </dt>
                  <dd class="text-2xl font-bold tabular-nums text-(--signal)">
                    {{ liveCount }}
                  </dd>
                  <dd class="text-xs text-(--ink2)">
                    {{ t('curriculumPage.stat.live') }}
                  </dd>
                </div>
              </dl>
            </template>
          </ClientOnly>

          <div
            v-if="nextUp"
            class="mt-4 border-t border-(--line) pt-4"
          >
            <p class="mono-label">
              {{ doneTotal > 0 ? t('curriculumPage.nextUp') : t('curriculumPage.firstUp') }}
            </p>
            <p class="mt-1 font-semibold leading-snug text-(--ink)">
              {{ nextUp.title }}
            </p>
            <p class="mt-0.5 text-sm text-(--ink2)">
              {{ t('curriculumPage.section', { n: nextUp.section.n }) }} · {{ nextUp.minutes }} min
            </p>
            <UButton
              :to="localePath(nextUp.path!)"
              size="lg"
              block
              trailing-icon="i-lucide-arrow-right"
              class="mt-4"
            >
              {{ doneTotal > 0 ? t('curriculumPage.continue') : t('curriculumPage.hero.first') }}
            </UButton>
          </div>
          <p
            v-else-if="liveCount"
            class="mt-4 flex items-center gap-2 border-t border-(--line) pt-4 text-sm font-semibold text-success"
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

      <!-- The plan -->
      <div class="min-w-0 space-y-4">
        <template
          v-for="(s, si) in sections"
          :key="s.key"
        >
          <!-- A published section: open, every lesson listed -->
          <section
            v-if="s.live"
            :id="s.key"
            class="scroll-mt-24 overflow-hidden rounded-[8px] border border-(--line) bg-(--card)"
          >
            <header class="flex items-center gap-5 border-b border-(--line) bg-gradient-to-r from-(--ice)/70 to-transparent px-6 py-5">
              <div class="min-w-0 flex-1">
                <p class="mono-label">
                  {{ t('curriculumPage.section', { n: s.n }) }} · {{ lessonsLabel(t, s.rows.length) }}
                </p>
                <h2 class="mt-1 text-xl font-bold tracking-tight text-(--ink)">
                  <NuxtLink
                    v-if="s.overview"
                    :to="localePath(s.overview)"
                    class="hover:text-(--signal)"
                  >{{ s.title }}</NuxtLink>
                  <template v-else>
                    {{ s.title }}
                  </template>
                </h2>
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
                  class="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-(--ice)/50"
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
                  <span class="min-w-0 flex-1 font-medium text-(--ink) group-hover:text-(--signal)">{{ r.title }}</span>
                  <span class="hidden items-center gap-1 text-sm tabular-nums text-(--ink2) sm:flex">
                    <UIcon
                      :name="r.video ? 'i-lucide-circle-play' : 'i-lucide-book-open'"
                      class="size-4"
                    />{{ r.minutes }} min
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
                    :class="r.pro ? 'bg-(--navy) text-white' : 'bg-success/10 text-success'"
                  >{{ r.pro ? t('pro.tag') : t('pro.freeLesson') }}</span>
                </NuxtLink>
                <component
                  :is="r.path ? NuxtLinkLocale : 'div'"
                  v-else
                  :to="r.path ?? undefined"
                  class="flex items-center gap-4 px-6 py-3.5"
                  :class="r.path ? 'hover:bg-(--paper)' : ''"
                >
                  <span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-(--x) text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>
                  <span class="min-w-0 flex-1 text-(--ink2)">{{ r.title }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.coming') }}</span>
                </component>
              </li>
            </ol>
          </section>

          <!-- A planned section: one line, the lessons folded -->
          <details
            v-else
            :id="s.key"
            class="group/plan scroll-mt-24 rounded-[8px] border border-(--line) bg-(--card)"
          >
            <summary class="flex cursor-pointer list-none items-center gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
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
            <ol class="border-t border-(--line) px-6 py-3">
              <li
                v-for="r in s.rows"
                :key="r.n"
              >
                <component
                  :is="r.path ? NuxtLinkLocale : 'span'"
                  :to="r.path ?? undefined"
                  class="flex items-center gap-3 py-1.5 text-sm text-(--ink2)"
                  :class="r.path ? 'hover:text-(--signal)' : ''"
                >
                  <span class="w-8 shrink-0 text-xs font-bold tabular-nums text-(--x)">{{ s.n }}.{{ r.n }}</span>{{ r.title }}
                </component>
              </li>
            </ol>
          </details>

          <PromoSlot
            v-if="si === 1"
            unit="responsiveLeaderboard"
          />
        </template>
      </div>
    </div>
  </div>
</template>
