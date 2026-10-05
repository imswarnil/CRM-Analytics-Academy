<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The whole course on one sheet — Blueprint "SHEET 01".
 *
 * Every section is a card: a big drawing number, its lesson count and length,
 * and a donut for the reader's progress through it. Every lesson is a row with
 * a type icon, a length bar proportional to its minutes, and a FREE / PRO /
 * OPEN tag. Lengths and kinds come from app/data/lesson-meta.json, generated
 * from the lessons themselves at build time.
 *
 * Progress is client-only and additive: the page prerenders for everyone and
 * a signed-in learner's ticks hydrate on top.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const localePath = useLocalePath()
const route = useRoute()
const { t, locale, locales } = useI18n()
const { total } = useCourse()
const { isDone, pro } = useProgress()
const { of: metaOf } = useLessonMeta()

const title = computed(() => t('curriculumPage.seo.title'))
const description = computed(() => t('curriculumPage.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

// BCP-47 tag of the page being rendered (en-US, de-DE …).
const lang = computed(() => locales.value.find(l => l.code === locale.value)?.language || locale.value)

interface Row {
  title: string
  path: string
  minutes: number
  type: 'video' | 'article'
  access: 'free' | 'pro'
}

const sections = computed(() =>
  (navigation.value ?? []).map((mod, index) => {
    const lessons: Row[] = ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map((l) => {
        const m = metaOf(String(l.path))
        return { title: String(l.title ?? ''), path: String(l.path), minutes: m.minutes, type: m.type, access: m.access }
      })
    return {
      n: String(index).padStart(2, '0'),
      index,
      title: String(mod.title ?? ''),
      path: String(mod.path ?? ''),
      lessons,
      minutes: lessons.reduce((s, l) => s + l.minutes, 0)
    }
  })
)

// The five phases, by position, as mono labels between groups of cards.
// Labels live under `curriculumPage.phases.<n>`.
const PHASES = [
  { from: 0, n: 1 },
  { from: 1, n: 2 },
  { from: 5, n: 3 },
  { from: 12, n: 4 },
  { from: 15, n: 5 }
]
const phaseAt = (i: number) => {
  const p = PHASES.find(p => p.from === i)
  return p ? t(`curriculumPage.phases.p${p.n}`) : undefined
}

const maxLesson = computed(() => Math.max(1, ...sections.value.flatMap(s => s.lessons.map(l => l.minutes))))
const totalHours = computed(() => Math.round(sections.value.reduce((n, s) => n + s.minutes, 0) / 60))

// The whole course as schema.org Course: one syllabus section per course
// section, timed from the lessons' real lengths.
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  extra: [{
    '@type': 'Course',
    'name': SITE.name,
    'description': description.value,
    'url': `${SITE.url}${route.path}`,
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'inLanguage': lang.value,
    'availableLanguage': ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh', 'hi', 'ar', 'ru', 'bn', 'ur'],
    'educationalLevel': t('curriculumPage.schema.level'),
    'teaches': t('curriculumPage.schema.teaches'),
    'isAccessibleForFree': true,
    'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': `PT${totalHours.value}H` },
    'syllabusSections': sections.value.map((s, i) => ({
      '@type': 'Syllabus',
      'name': s.title,
      'position': i + 1,
      'timeRequired': `PT${s.minutes}M`,
      'url': `${SITE.url}${localePath(s.path)}`
    }))
  }]
}))

const doneIn = (s: { lessons: Row[] }) => s.lessons.filter(l => isDone(l.path)).length
const doneTotal = computed(() => sections.value.reduce((n, s) => n + doneIn(s), 0))
const progressPct = computed(() => (total.value ? (doneTotal.value / total.value) * 100 : 0))

function tag(l: Row) {
  if (l.access === 'free') return 'free'
  return pro.value ? 'open' : 'pro'
}
function icon(l: Row) {
  if (isDone(l.path)) return 'i-lucide-check'
  if (l.access === 'pro' && !pro.value) return 'i-lucide-lock'
  return l.type === 'video' ? 'i-lucide-play' : 'i-lucide-file-text'
}
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('curriculumPage.sheet', { sections: sections.length, lessons: total, hours: totalHours })"
      :title="t('curriculumPage.title')"
    >
      <div class="mt-8 flex max-w-4xl items-center gap-4">
        <div class="relative h-4 flex-1 border-[1.5px] border-(--ink) bg-(--card)">
          <ClientOnly>
            <div
              class="hatch-signal h-full border-e-[1.5px] border-(--ink) transition-[width] duration-700"
              :style="{ width: `${progressPct}%` }"
            />
          </ClientOnly>
          <span
            v-for="i in 9"
            :key="i"
            class="absolute inset-y-0 border-s border-(--ink)"
            :style="{ left: `${i * 10}%` }"
          />
        </div>
        <ClientOnly>
          <span class="font-mono text-xs uppercase tracking-[.1em] text-(--ink)">{{ t('curriculumPage.complete', { done: doneTotal, total }) }}</span>
          <template #fallback>
            <span class="font-mono text-xs uppercase tracking-[.1em] text-(--ink)">{{ t('curriculumPage.complete', { done: 0, total }) }}</span>
          </template>
        </ClientOnly>
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          :to="localePath('/introduction')"
          icon="i-lucide-play"
        >
          {{ t('curriculumPage.start') }}
        </UButton>
        <UButton
          :to="localePath('/datasets')"
          color="neutral"
          variant="outline"
          icon="i-lucide-database"
        >
          {{ t('curriculumPage.datasets') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-[66rem] space-y-8 px-4 py-14 sm:px-6">
      <template
        v-for="s in sections"
        :key="s.path"
      >
        <p
          v-if="phaseAt(s.index)"
          class="eyebrow pt-4"
        >
          {{ phaseAt(s.index) }}
        </p>

        <section
          :id="`section-${s.index}`"
          class="scroll-mt-24 border-[1.5px] border-(--ink) bg-(--card)"
        >
          <NuxtLink
            :to="localePath(s.path)"
            class="group flex items-center gap-4 border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-4"
          >
            <span class="text-4xl font-black leading-none tracking-[-0.04em] text-(--signal)">{{ s.n }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xl font-extrabold tracking-[-0.02em] text-(--ink) group-hover:text-(--signal)">{{ s.title }}</span>
              <span class="mono-label">{{ t('curriculumPage.sectionMeta', { lessons: s.lessons.length, minutes: s.minutes }) }}</span>
            </span>
            <ClientOnly>
              <BpDonut :value="s.lessons.length ? doneIn(s) / s.lessons.length : 0" />
              <template #fallback>
                <BpDonut :value="0" />
              </template>
            </ClientOnly>
          </NuxtLink>

          <ol>
            <li
              v-for="l in s.lessons"
              :key="l.path"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(l.path)"
                class="bp-row flex items-center gap-4 px-5 py-3 hover:bg-(--ice)/50"
              >
                <ClientOnly>
                  <span
                    class="flex size-8 flex-none items-center justify-center border-[1.5px] border-(--ink)"
                    :class="isDone(l.path) ? 'bg-(--signal) text-white' : 'bg-(--card) text-(--signal)'"
                  >
                    <UIcon
                      :name="icon(l)"
                      class="size-4"
                    />
                  </span>
                  <template #fallback>
                    <span class="flex size-8 flex-none items-center justify-center border-[1.5px] border-(--ink) bg-(--card) text-(--signal)">
                      <UIcon
                        :name="l.type === 'video' ? 'i-lucide-play' : 'i-lucide-file-text'"
                        class="size-4"
                      />
                    </span>
                  </template>
                </ClientOnly>

                <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ l.title }}</span>

                <span class="hidden w-24 justify-end sm:flex">
                  <span
                    class="h-2.5 border-[1.5px] border-(--ink)"
                    :class="l.type === 'video' ? 'bg-(--signal)' : 'bg-(--frost)'"
                    :style="{ width: `${Math.max(8, (l.minutes / maxLesson) * 100)}%` }"
                  />
                </span>
                <span class="w-10 text-end font-mono text-xs text-(--ink2)">{{ l.minutes }}m</span>
                <ClientOnly>
                  <span
                    class="w-14 border-[1.5px] py-0.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
                    :class="tag(l) === 'pro' ? 'border-(--line) text-(--ink2)' : 'border-(--signal) text-(--signal)'"
                  >{{ t(`curriculumPage.tags.${tag(l)}`) }}</span>
                  <template #fallback>
                    <span class="w-14 border-[1.5px] border-(--signal) py-0.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-(--signal)">{{ t(`curriculumPage.tags.${l.access}`) }}</span>
                  </template>
                </ClientOnly>
              </NuxtLink>
            </li>
          </ol>
        </section>
      </template>

      <div class="flex flex-wrap gap-5 pt-2 font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
        <span class="flex items-center gap-2"><span class="h-2.5 w-6 border-[1.5px] border-(--ink) bg-(--signal)" />{{ t('curriculumPage.legend.video') }}</span>
        <span class="flex items-center gap-2"><span class="h-2.5 w-6 border-[1.5px] border-(--ink) bg-(--frost)" />{{ t('curriculumPage.legend.article') }}</span>
        <span class="flex items-center gap-2"><span class="border-[1.5px] border-(--signal) px-1 text-(--signal)">{{ t('curriculumPage.tags.free') }}</span>{{ t('curriculumPage.legend.free') }}</span>
        <span class="flex items-center gap-2"><span class="border-[1.5px] border-(--line) px-1">{{ t('curriculumPage.tags.pro') }}</span>{{ t('curriculumPage.legend.pro') }}</span>
      </div>
    </div>
  </div>
</template>
