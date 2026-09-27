<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The whole course on one page: every section, every lesson, in order.
 *
 * The header's "Curriculum" link used to point at /foundations, which meant the
 * only way to see the shape of the course was to open its first lesson and read
 * a sidebar. Someone deciding whether to start, or returning after a fortnight
 * and trying to remember where they were, needs the map rather than a lesson.
 *
 * Three things beyond a list of links:
 *
 *   - The sections are grouped into the three PHASES the course actually has —
 *     orientation, the product, then the job. That grouping is the course's
 *     argument (you cannot build go-to-market analytics until the product is
 *     familiar) and it was previously only visible to someone who read all ten
 *     section introductions.
 *   - Each lesson is marked as hands-on or quizzed, so a learner can see where
 *     the work is before committing an evening to it.
 *   - Time estimates are derived from the lesson's own shape rather than
 *     guessed: a lesson carrying a walkthrough script is a build and costs
 *     roughly three times a reading lesson.
 *
 * Progress is additive and client-only: the page prerenders for everyone, and a
 * signed-in learner's ticks, per-section counts and Resume button hydrate on
 * top. Nothing here is gated behind signing in.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const localePath = useLocalePath()
const { locale } = useI18n()
const { lessons, total } = useCourse()
const { isDone } = useProgress()
const { isSignedIn } = useAuth()

const title = 'Curriculum'
const description = 'Every section and every lesson of the CRM Analytics Academy course, in order: orientation, the CRM Analytics product itself, and then the fourteen go-to-market dashboard builds.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

/**
 * Per-lesson shape, queried from the content collection rather than the
 * navigation tree, because the tree carries titles and paths and nothing about
 * what a lesson contains. Reduced to booleans in the transform so the payload
 * stays small — the page needs to know THAT a lesson is hands-on, not what its
 * script says.
 */
const { data: meta } = await useAsyncData(
  () => `curriculum-meta-${locale.value}`,
  () => queryCollection('docs')
    .where('path', 'LIKE', `/${locale.value}/%`)
    .select('path', 'walkthrough', 'quiz', 'interview')
    .all(),
  {
    watch: [locale],
    transform: rows => Object.fromEntries(
      (rows ?? []).map(r => [
        contentToRoutePath(String(r.path)),
        {
          handsOn: Boolean((r as { walkthrough?: { shots?: unknown[] } }).walkthrough?.shots?.length),
          quiz: Boolean((r as { quiz?: unknown[] }).quiz?.length),
          interview: Boolean((r as { interview?: unknown[] }).interview?.length)
        }
      ])
    )
  }
)

interface Lesson {
  title: string
  path: string
  handsOn: boolean
  quiz: boolean
  interview: boolean
}

interface Section {
  title: string
  icon: string
  path: string
  index: number
  lessons: Lesson[]
  minutes: number
}

// A reading lesson is about fifteen minutes; one carrying a walkthrough script
// is a build and realistically takes three quarters of an hour with an org
// open. Rounded to the nearest five so nobody mistakes it for a measurement.
const READ_MINUTES = 15
const BUILD_MINUTES = 45

const sections = computed<Section[]>(() =>
  (navigation.value ?? []).map((mod, index) => {
    const lessons: Lesson[] = ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map((l) => {
        const m = meta.value?.[String(l.path)]
        return {
          title: String(l.title ?? ''),
          path: String(l.path ?? ''),
          handsOn: Boolean(m?.handsOn),
          quiz: Boolean(m?.quiz),
          interview: Boolean(m?.interview)
        }
      })

    const minutes = lessons.reduce((sum, l) => sum + (l.handsOn ? BUILD_MINUTES : READ_MINUTES), 0)

    return {
      title: String(mod.title ?? ''),
      icon: String(mod.icon ?? 'i-lucide-book-open'),
      path: String(mod.path ?? ''),
      index,
      lessons,
      minutes: Math.round(minutes / 5) * 5
    }
  })
)

/**
 * The three phases. Sections are assigned by position rather than by slug so a
 * renamed section does not silently fall out of its phase — the course's order
 * is the thing that defines them.
 */
const phases = computed(() => [
  {
    key: 'orient',
    kicker: 'Phase 1',
    title: 'Get oriented',
    blurb: 'What the course is, who it is for, and a free org with the first dataset loaded. About an evening.',
    icon: 'i-lucide-compass',
    sections: sections.value.filter(s => s.index === 0)
  },
  {
    key: 'product',
    kicker: 'Phase 2',
    title: 'Learn CRM Analytics itself',
    blurb: 'The platform, end to end: access, datasets and grain, exploring, dashboard design, and shipping to people. Every build in phase 3 assumes all of it.',
    icon: 'i-lucide-boxes',
    sections: sections.value.filter(s => s.index >= 1 && s.index <= 6)
  },
  {
    key: 'build',
    kicker: 'Phase 3',
    title: 'Do the job',
    blurb: 'One fictional company, nineteen datasets, and fourteen dashboards built the way a go-to-market analytics team would build them.',
    icon: 'i-lucide-hammer',
    sections: sections.value.filter(s => s.index >= 7)
  }
].filter(p => p.sections.length))

const handsOnTotal = computed(() => lessons.value.length && sections.value.reduce(
  (n, s) => n + s.lessons.filter(l => l.handsOn).length, 0
))
const totalHours = computed(() => Math.round(sections.value.reduce((n, s) => n + s.minutes, 0) / 60))

function doneIn(section: Section) {
  return section.lessons.filter(l => isDone(l.path)).length
}
const doneTotal = computed(() => lessons.value.filter(l => isDone(l.path)).length)
const resumeTo = computed(() => lessons.value.find(l => !isDone(l.path))?.path)
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <!-- Header -->
    <div class="mx-auto max-w-3xl text-center">
      <p class="im-meta text-primary">
        The course
      </p>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
        The whole curriculum
      </h1>
      <p class="mt-4 text-lg text-muted">
        Learn the platform first, then use it on a real go-to-market problem. Free, open source,
        and nothing is gated behind an account.
      </p>

      <div class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-default bg-border sm:grid-cols-4">
        <div
          v-for="stat in [
            { label: 'Sections', value: sections.length },
            { label: 'Lessons', value: total },
            { label: 'Hands-on builds', value: handsOnTotal },
            { label: 'Est. time', value: `~${totalHours} h` }
          ]"
          :key="stat.label"
          class="bg-default px-4 py-3"
        >
          <p class="im-figure text-xl font-semibold text-highlighted">
            {{ stat.value }}
          </p>
          <p class="im-meta mt-0.5 text-dimmed">
            {{ stat.label }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <UButton
          :to="localePath('/introduction')"
          icon="i-lucide-compass"
          size="lg"
        >
          Start at the beginning
        </UButton>

        <ClientOnly>
          <UButton
            v-if="isSignedIn && resumeTo"
            :to="localePath(resumeTo)"
            icon="i-lucide-play"
            color="neutral"
            variant="outline"
            size="lg"
          >
            Resume
          </UButton>
        </ClientOnly>

        <UButton
          :to="localePath('/datasets')"
          icon="i-lucide-database"
          color="neutral"
          variant="ghost"
          size="lg"
        >
          Get the datasets
        </UButton>
      </div>

      <ClientOnly>
        <div
          v-if="isSignedIn && doneTotal > 0"
          class="mx-auto mt-8 max-w-md"
        >
          <div class="mb-2 flex items-baseline justify-between text-sm">
            <span class="text-muted">Your progress</span>
            <span class="im-figure text-highlighted">{{ doneTotal }} / {{ total }}</span>
          </div>
          <UProgress
            :model-value="doneTotal"
            :max="total"
          />
        </div>
      </ClientOnly>
    </div>

    <!-- Phases -->
    <div class="mt-14 space-y-14">
      <section
        v-for="phase in phases"
        :key="phase.key"
      >
        <div class="flex items-start gap-3 border-b border-default pb-4">
          <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <UIcon
              :name="phase.icon"
              class="size-5 text-primary"
            />
          </span>
          <div class="min-w-0">
            <p class="im-meta text-dimmed">
              {{ phase.kicker }}
            </p>
            <h2 class="text-xl font-semibold tracking-tight text-highlighted">
              {{ phase.title }}
            </h2>
            <p class="mt-1 max-w-3xl text-sm text-muted">
              {{ phase.blurb }}
            </p>
          </div>
        </div>

        <div class="mt-5 grid gap-5 lg:grid-cols-2">
          <article
            v-for="section in phase.sections"
            :key="section.path"
            class="im-card-hover rounded-lg border border-default bg-elevated/30 p-5"
          >
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-default bg-default">
                <UIcon
                  :name="section.icon"
                  class="size-5 text-primary"
                />
              </span>

              <div class="min-w-0 flex-1">
                <p class="im-meta text-dimmed">
                  Section {{ section.index }} · {{ section.lessons.length }} lessons · ~{{ section.minutes }} min
                </p>
                <h3 class="mt-0.5 text-lg font-semibold tracking-tight text-highlighted">
                  <NuxtLink
                    :to="localePath(section.path)"
                    class="hover:text-primary"
                  >
                    {{ section.title }}
                  </NuxtLink>
                </h3>
              </div>

              <ClientOnly>
                <span
                  v-if="isSignedIn"
                  class="im-figure shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {{ doneIn(section) }}/{{ section.lessons.length }}
                </span>
              </ClientOnly>
            </div>

            <ol class="mt-4 space-y-0.5">
              <li
                v-for="lesson in section.lessons"
                :key="lesson.path"
              >
                <NuxtLink
                  :to="localePath(lesson.path)"
                  class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-toned hover:bg-elevated hover:text-highlighted"
                >
                  <ClientOnly>
                    <UIcon
                      :name="isDone(lesson.path) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
                      class="size-4 shrink-0"
                      :class="isDone(lesson.path) ? 'text-primary' : 'text-dimmed'"
                    />
                    <template #fallback>
                      <UIcon
                        name="i-lucide-circle"
                        class="size-4 shrink-0 text-dimmed"
                      />
                    </template>
                  </ClientOnly>

                  <span class="truncate">{{ lesson.title }}</span>

                  <!-- What kind of lesson it is, so an evening can be planned. -->
                  <span class="ms-auto flex shrink-0 items-center gap-1.5">
                    <UIcon
                      v-if="lesson.handsOn"
                      name="i-lucide-monitor-play"
                      class="size-3.5 text-primary"
                      title="Hands-on build, with a screen walkthrough"
                    />
                    <UIcon
                      v-if="lesson.quiz"
                      name="i-lucide-circle-help"
                      class="size-3.5 text-dimmed"
                      title="Graded quiz"
                    />
                    <UIcon
                      v-if="lesson.interview"
                      name="i-lucide-messages-square"
                      class="size-3.5 text-dimmed"
                      title="Interview questions"
                    />
                  </span>
                </NuxtLink>
              </li>
            </ol>
          </article>
        </div>
      </section>
    </div>

    <!-- Legend -->
    <div class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-default pt-6 text-xs text-muted">
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-monitor-play"
          class="size-3.5 text-primary"
        /> Hands-on build, with a screen walkthrough
      </span>
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-circle-help"
          class="size-3.5 text-dimmed"
        /> Graded quiz
      </span>
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-messages-square"
          class="size-3.5 text-dimmed"
        /> Interview questions
      </span>
    </div>
  </UContainer>
</template>
