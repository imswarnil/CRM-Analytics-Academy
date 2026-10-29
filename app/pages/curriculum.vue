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
const { isDone } = useProgress()
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
  quiz: boolean
  soon: boolean
  pro: boolean
}

const sections = computed(() =>
  (navigation.value ?? []).map((mod, index) => {
    const lessons: Row[] = ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map((l) => {
        const m = metaOf(String(l.path))
        return { title: String(l.title ?? ''), path: String(l.path), minutes: m.minutes, type: m.type, quiz: m.quiz, pro: Boolean(m.pro), soon: Boolean((l as { comingSoon?: boolean }).comingSoon) }
      })
    return {
      n: String(index).padStart(2, '0'),
      index,
      title: String(mod.title ?? ''),
      path: String(mod.path ?? ''),
      lessons,
      soon: lessons.length > 0 && lessons.every(l => l.soon),
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

// Coming-soon sections: "notify me" — a free account is the price of a seat
// on the list, and the count of who is already waiting is shown to everyone.
const { isSignedIn } = useAuth()
const { data: progressData } = useProgress()
const sectionKey = (path: string) => path.replace(/^\/[a-z]{2}(?=\/)/, '').split('/').filter(Boolean)[0] ?? ''
const { data: waiting, refresh: refreshWaiting } = useLazyAsyncData('waitlist-counts', () => $fetch<Record<string, number>>('/api/waitlist'), { server: false, default: () => ({}) as Record<string, number> })
const mine = ref<Set<string>>(new Set())
watch(() => progressData.value?.waitlist, w => (mine.value = new Set(w ?? [])), { immediate: true })
async function notifyMe(path: string) {
  const key = sectionKey(path)
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: route.fullPath, notify: key } })
    return
  }
  const res = await $fetch<{ waiting: boolean }>('/api/waitlist', { method: 'POST', body: { section: key } }).catch(() => null)
  if (!res) return
  const next = new Set(mine.value)
  if (res.waiting) next.add(key)
  else next.delete(key)
  mine.value = next
  if (res.waiting) useNuxtApp().$track?.('waitlist', key)
  refreshWaiting()
}

function icon(l: Row) {
  if (l.soon) return 'i-lucide-hourglass'
  if (isDone(l.path)) return 'i-lucide-check'
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

    <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <div class="min-w-0 space-y-8">
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
                <span class="mono-label">{{ s.soon ? t('course.comingSoon') : t('curriculumPage.sectionMeta', { lessons: s.lessons.length, minutes: s.minutes }) }}</span>
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
                  <span
                    v-if="l.pro"
                    class="flex items-center gap-1 bg-(--ink) px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-(--glow)"
                  ><UIcon
                    name="i-lucide-lock-keyhole"
                    class="size-3"
                  />{{ t('pro.tag') }}</span>
                  <span
                    class="w-14 py-0.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
                    :class="l.soon ? 'border-[1.5px] border-(--line) text-(--ink2)' : l.quiz ? 'border-[1.5px] border-(--signal) text-(--signal)' : ''"
                  >{{ l.soon ? t('curriculumPage.tags.soon') : l.quiz ? t('curriculumPage.tags.quiz') : '' }}</span>
                </NuxtLink>
              </li>
            </ol>

            <!-- Coming soon: claim a seat on the list. -->
            <div
              v-if="s.soon"
              class="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-(--ink) bg-(--paper) px-5 py-3"
            >
              <p class="font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">
                <ClientOnly>{{ t('curriculumPage.waiting', { n: waiting[sectionKey(s.path)] ?? 0 }) }}</ClientOnly>
              </p>
              <UButton
                size="sm"
                :icon="mine.has(sectionKey(s.path)) ? 'i-lucide-bell-ring' : 'i-lucide-bell-plus'"
                :color="mine.has(sectionKey(s.path)) ? 'neutral' : 'primary'"
                :variant="mine.has(sectionKey(s.path)) ? 'outline' : 'solid'"
                @click="notifyMe(s.path)"
              >
                {{ mine.has(sectionKey(s.path)) ? t('curriculumPage.notifying') : t('curriculumPage.notifyMe') }}
              </UButton>
            </div>
          </section>

          <PromoSlot
            v-if="s.index % 4 === 3"
            :key="`promo-${s.index}`"
            unit="horizontal"
          />
        </template>

        <div class="flex flex-wrap gap-5 pt-2 font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
          <span class="flex items-center gap-2"><span class="h-2.5 w-6 border-[1.5px] border-(--ink) bg-(--signal)" />{{ t('curriculumPage.legend.video') }}</span>
          <span class="flex items-center gap-2"><span class="h-2.5 w-6 border-[1.5px] border-(--ink) bg-(--frost)" />{{ t('curriculumPage.legend.article') }}</span>
          <span class="flex items-center gap-2"><span class="border-[1.5px] border-(--signal) px-1 text-(--signal)">{{ t('curriculumPage.tags.quiz') }}</span>{{ t('curriculumPage.legend.quiz') }}</span>
        </div>
      </div>

      <!-- Sidebar: progress, practice, community, channel, promos -->
      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div class="border-[1.5px] border-(--ink) bg-(--card) p-5">
          <p class="eyebrow">
            {{ t('curriculumPage.side.progress') }}
          </p>
          <ClientOnly>
            <p class="mt-2 text-3xl font-black tabular-nums text-(--signal)">
              {{ doneTotal }}<span class="text-lg text-(--ink2)"> / {{ total }}</span>
            </p>
            <template #fallback>
              <p class="mt-2 text-3xl font-black text-(--signal)">
                0<span class="text-lg text-(--ink2)"> / {{ total }}</span>
              </p>
            </template>
          </ClientOnly>
          <div class="mt-3 h-2.5 border-[1.5px] border-(--ink) bg-(--paper)">
            <div
              class="hatch-signal h-full"
              :style="{ width: `${progressPct}%` }"
            />
          </div>
          <UButton
            :to="localePath('/dashboard')"
            size="sm"
            class="mt-4"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('curriculumPage.side.dashboard') }}
          </UButton>
        </div>

        <NuxtLink
          :to="localePath('/certification')"
          class="graph-paper-navy block border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white shadow-[6px_6px_0_var(--signal)]"
        >
          <p class="font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">{{ t('cert.eyebrow') }}</p>
          <p class="mt-2 text-lg font-extrabold">{{ t('cert.ctaTitle') }}</p>
          <p class="mt-1 text-sm text-white/75">{{ t('cert.ctaBody') }}</p>
        </NuxtLink>

        <NuxtLink
          :to="localePath('/interview-questions')"
          class="bp-card bp-card--hover block p-5"
        >
          <p class="eyebrow">{{ t('interview.eyebrow') }}</p>
          <p class="mt-2 text-lg font-extrabold text-(--ink)">{{ t('interview.ctaTitle') }}</p>
          <p class="mt-1 text-sm text-(--ink2)">{{ t('interview.ctaBody') }}</p>
        </NuxtLink>

        <a
          :href="`${SITE.youtube}?sub_confirmation=1`"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4 hover:bg-(--ice)"
        >
          <span class="flex size-10 flex-none items-center justify-center bg-[#FF0000]">
            <UIcon
              name="i-simple-icons-youtube"
              class="size-5 text-white"
            />
          </span>
          <span>
            <span class="block font-bold text-(--ink)">{{ t('channel.title') }}</span>
            <span class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">@crmanalyticsacademy</span>
          </span>
        </a>

        <ShareBar
          :title="t('curriculumPage.title')"
          :text="t('curriculumPage.side.shareText')"
        />

        <PromoSlot unit="square300x250" />
        <PromoSlot
          unit="skyscraper300x600"
          class="hidden lg:block"
        />
      </aside>
    </div>
    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="responsiveLeaderboard" />
    </div>
  </div>
</template>
