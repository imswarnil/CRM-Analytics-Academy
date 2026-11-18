<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { ROADMAP } from '~/data/roadmap'

/**
 * /start — the course, in order. Three columns on wide screens: the sections
 * (sticky, with your progress per section), the full plan (published lessons
 * link, planned ones show as "coming"), and how lessons work + the next step.
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
defineOgImage('Docs', { title: t('curriculumPage.hero.title'), description: description.value, headline: t('curriculumPage.hero.eyebrow') })

interface Row { n: number, title: string, path: string | null, minutes: number, pro: boolean, video: boolean }

const slugOf = (p: string) => p.replace(/\/+$/, '').split('/').pop() ?? ''
const sections = computed(() => ROADMAP.map((sec, i) => {
  const mod = (navigation.value ?? []).find(m => slugOf(String(m.path ?? '')) === sec.slug)
  const published = ((mod?.children ?? []) as ContentNavigationItem[])
    .filter(c => c.path && c.path !== mod?.path && !(c as { comingSoon?: boolean }).comingSoon)
  const rows: Row[] = Array.from({ length: Math.max(sec.lessons, published.length) }, (_, k) => {
    const live = published[k]
    if (!live) return { n: k + 1, title: t(`roadmap.${sec.key}.l${k + 1}`), path: null, minutes: 0, pro: false, video: false }
    const m = metaOf(String(live.path))
    return { n: k + 1, title: String(live.title ?? ''), path: String(live.path), minutes: m.minutes, pro: Boolean(m.pro), video: m.type === 'video' }
  })
  return { ...sec, n: i + 1, title: t(`roadmap.${sec.key}.title`), blurb: t(`roadmap.${sec.key}.blurb`), overview: mod?.path ? String(mod.path) : null, rows, live: published.length }
}))

const firstLesson = computed(() => sections.value.flatMap(s => s.rows).find(r => r.path)?.path ?? null)
const liveCount = computed(() => sections.value.reduce((n, s) => n + s.live, 0))
const doneIn = (s: { rows: Row[] }) => s.rows.filter(r => r.path && isDone(r.path)).length
const doneTotal = computed(() => sections.value.reduce((n, s) => n + doneIn(s), 0))

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
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto flex max-w-(--ui-container) flex-wrap items-end justify-between gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div class="max-w-2xl">
          <p class="eyebrow">
            {{ t('curriculumPage.hero.eyebrow') }}
          </p>
          <h1 class="bp-h1 mt-3">
            {{ t('curriculumPage.hero.title') }}
          </h1>
          <p class="bp-lead mt-4">
            {{ t('curriculumPage.hero.lead') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton
            v-if="firstLesson"
            :to="localePath(firstLesson)"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('curriculumPage.hero.first') }}
          </UButton>
          <UButton
            :to="localePath('/pro')"
            size="xl"
            color="neutral"
            variant="outline"
          >
            {{ t('curriculumPage.hero.pricing') }}
          </UButton>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 xl:grid-cols-[14rem_minmax(0,1fr)_17rem]">
      <!-- Left: the path — one tile per section on a connecting line -->
      <aside class="hidden lg:block">
        <nav
          class="sticky top-24"
          :aria-label="t('curriculumPage.sidebar')"
        >
          <p class="mono-label mb-4 px-1">
            {{ t('curriculumPage.sidebar') }}
          </p>
          <ol class="relative">
            <span
              class="absolute start-[1.1875rem] top-5 bottom-5 w-px bg-(--line)"
              aria-hidden="true"
            />
            <li
              v-for="s in sections"
              :key="s.key"
              class="relative"
            >
              <a
                :href="`#${s.key}`"
                class="group flex items-center gap-3 rounded-[6px] py-2 pe-2 transition-colors"
                :aria-current="active === s.key ? 'step' : undefined"
              >
                <span
                  class="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-[6px] border transition-colors"
                  :class="active === s.key
                    ? 'border-(--signal) bg-(--signal) text-white'
                    : s.live ? 'border-(--signal) bg-(--card) text-(--signal)' : 'border-(--line) bg-(--card) text-(--ink2) group-hover:border-(--signal)'"
                >
                  <UIcon
                    :name="s.icon"
                    class="size-[1.125rem]"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.section', { n: s.n }) }}</span>
                  <span
                    class="block truncate text-[0.9375rem] leading-snug"
                    :class="active === s.key ? 'font-semibold text-(--signal)' : 'text-(--ink) group-hover:text-(--signal)'"
                  >{{ s.title }}</span>
                  <span
                    v-if="!s.live"
                    class="block text-xs text-(--ink2)"
                  >{{ t('curriculumPage.coming') }}</span>
                  <ClientOnly v-else>
                    <span
                      v-if="isSignedIn"
                      class="mt-1 block h-1 overflow-hidden rounded-full bg-(--line)"
                    >
                      <span
                        class="block h-full rounded-full bg-(--signal)"
                        :style="{ width: `${(doneIn(s) / s.live) * 100}%` }"
                      />
                    </span>
                    <span
                      v-else
                      class="block text-xs text-(--signal)"
                    >{{ t('curriculumPage.lessons', { n: s.live }) }}</span>
                  </ClientOnly>
                </span>
              </a>
            </li>
          </ol>
        </nav>
      </aside>

      <!-- Middle: the plan -->
      <div class="min-w-0 space-y-6">
        <section
          v-for="s in sections"
          :id="s.key"
          :key="s.key"
          class="scroll-mt-24 overflow-hidden rounded-[6px] border border-(--line) bg-(--card)"
        >
          <header class="flex flex-wrap items-start gap-4 border-b border-(--line) px-6 py-5 sm:flex-nowrap">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p class="mono-label">
                {{ t('curriculumPage.section', { n: s.n }) }} · {{ t('curriculumPage.lessons', { n: s.rows.length }) }}
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
              <p class="mt-1 text-(--ink2)">
                {{ s.blurb }}
              </p>
            </div>
            <CourseSectionArt
              :section="s.key"
              class="hidden w-36 shrink-0 sm:block"
            />
            <ClientOnly>
              <span
                v-if="s.live && isSignedIn"
                class="text-sm font-semibold tabular-nums text-(--signal)"
              >{{ doneIn(s) }}/{{ s.live }}</span>
            </ClientOnly>
          </header>
          <ol class="divide-y divide-(--line)">
            <li
              v-for="r in s.rows"
              :key="r.n"
            >
              <NuxtLink
                v-if="r.path"
                :to="localePath(r.path)"
                class="group flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-(--ice)/60"
              >
                <ClientOnly>
                  <UIcon
                    :name="isDone(r.path) ? 'i-lucide-circle-check' : 'i-lucide-circle-play'"
                    class="size-5 shrink-0"
                    :class="isDone(r.path) ? 'text-success' : 'text-(--signal)'"
                  />
                  <template #fallback>
                    <UIcon
                      name="i-lucide-circle-play"
                      class="size-5 shrink-0 text-(--signal)"
                    />
                  </template>
                </ClientOnly>
                <span class="min-w-0 flex-1 font-medium text-(--ink) group-hover:text-(--signal)">{{ r.title }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
                  :class="r.pro ? 'bg-(--navy) text-white' : 'bg-success/10 text-success'"
                >{{ r.pro ? t('pro.tag') : t('pro.freeLesson') }}</span>
                <span class="w-14 shrink-0 text-end text-sm tabular-nums text-(--ink2)">{{ r.minutes }} min</span>
              </NuxtLink>
              <div
                v-else
                class="flex items-center gap-3 px-6 py-3.5"
              >
                <UIcon
                  name="i-lucide-circle-dashed"
                  class="size-5 shrink-0 text-(--x)"
                />
                <span class="min-w-0 flex-1 text-(--ink2)">{{ r.title }}</span>
                <span class="text-xs font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.coming') }}</span>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <!-- Right: how it works, progress, next step -->
      <aside class="hidden xl:block">
        <div class="sticky top-24 space-y-4">
          <section class="rounded-[6px] border border-(--line) bg-(--card) p-5">
            <p class="mono-label">
              {{ t('curriculumPage.progress') }}
            </p>
            <ClientOnly>
              <template v-if="isSignedIn">
                <p class="mt-2 text-2xl font-bold tabular-nums text-(--ink)">
                  {{ doneTotal }}<span class="text-base font-medium text-(--ink2)"> / {{ liveCount }}</span>
                </p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-(--line)">
                  <div
                    class="h-full rounded-full bg-(--signal)"
                    :style="{ width: `${liveCount ? (doneTotal / liveCount) * 100 : 0}%` }"
                  />
                </div>
              </template>
              <template v-else>
                <p class="mt-2 text-sm text-(--ink2)">
                  {{ t('curriculumPage.progressNone') }}
                </p>
                <TestRide
                  class="mt-3"
                  size="sm"
                  variant="outline"
                />
              </template>
            </ClientOnly>
          </section>
          <section class="rounded-[6px] border border-(--line) bg-(--card) p-5">
            <p class="mono-label">
              {{ t('curriculumPage.how.title') }}
            </p>
            <ul class="mt-3 space-y-2.5">
              <li
                v-for="i in 4"
                :key="i"
                class="flex gap-2 text-sm text-(--ink)"
              >
                <UIcon
                  :name="['i-lucide-circle-play', 'i-lucide-book-open', 'i-lucide-list-checks', 'i-lucide-file-down'][i - 1]!"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`curriculumPage.how.${i}`) }}
              </li>
            </ul>
            <UButton
              :to="localePath('/notes')"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-notebook-pen"
              class="mt-4"
            >
              {{ t('notes.title') }}
            </UButton>
          </section>
          <SponsorInvite compact />
          <PromoSlot unit="square300x250" />
        </div>
      </aside>
    </div>
  </div>
</template>
