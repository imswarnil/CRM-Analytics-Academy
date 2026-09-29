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
const description = 'Every section and every lesson of the CRM Analytics Academy course, in order: orientation, the CRM Analytics product itself, and then the sixteen go-to-market dashboard builds.'
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
 * The five phases. Sections are assigned by position rather than by slug so a
 * renamed section does not silently fall out of its phase — the course's order
 * is the thing that defines them.
 */
const PHASES = [
  {
    key: 'orient',
    title: 'Get oriented',
    icon: 'i-lucide-compass',
    from: 0,
    to: 0,
    blurb: 'What the course is, who it is for, and how to study it. About an evening.'
  },
  {
    key: 'data',
    title: 'Data foundations',
    icon: 'i-lucide-database',
    from: 1,
    to: 4,
    blurb: 'The platform, your org and its security, then getting data in and shaping it at the right grain.'
  },
  {
    key: 'build',
    title: 'Explore and build',
    icon: 'i-lucide-layout-dashboard',
    from: 5,
    to: 11,
    blurb: 'Charts, lenses, SAQL, dashboard design, interactions, bindings and the JSON underneath.'
  },
  {
    key: 'ship',
    title: 'Ship and scale',
    icon: 'i-lucide-rocket',
    from: 12,
    to: 14,
    blurb: 'Get the work to people, automate it through the APIs, and add prediction with Einstein Discovery.'
  },
  {
    key: 'gtm',
    title: 'Go-to-market builds',
    icon: 'i-lucide-hammer',
    from: 15,
    to: 18,
    blurb: 'Sixteen dashboards for one training business, built the way a revenue analytics team would.'
  }
]

const phases = computed(() => PHASES
  .map((p, i) => ({
    ...p,
    kicker: `Phase ${i + 1}`,
    sections: sections.value.filter(s => s.index >= p.from && s.index <= p.to)
  }))
  .filter(p => p.sections.length)
)

const pad = (n: number) => String(n).padStart(2, '0')

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
  <UContainer class="py-8 sm:py-12">
    <!-- Header: one brand panel carrying the pitch, the numbers and the CTAs -->
    <header class="bg-brand-panel relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
      <div class="curriculum-hero relative">
        <div>
          <p class="im-meta text-white/70">
            The course
          </p>
          <h1 class="mt-3 text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            The whole curriculum
          </h1>
          <p class="mt-4 max-w-xl text-lg text-white/80 text-pretty">
            Learn the platform first, then use it on a real go-to-market problem. Free, open source,
            and nothing is gated behind an account.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <UButton
              :to="localePath('/introduction')"
              icon="i-lucide-compass"
              size="lg"
              color="neutral"
              variant="solid"
              class="curriculum-cta"
            >
              Start at the beginning
            </UButton>

            <ClientOnly>
              <UButton
                v-if="isSignedIn && resumeTo"
                :to="localePath(resumeTo)"
                icon="i-lucide-play"
                size="lg"
                variant="outline"
                class="text-white ring-white/40 hover:bg-white/10"
              >
                Resume
              </UButton>
            </ClientOnly>

            <UButton
              :to="localePath('/datasets')"
              icon="i-lucide-database"
              size="lg"
              variant="ghost"
              class="text-white hover:bg-white/10"
            >
              Get the datasets
            </UButton>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in [
              { label: 'Sections', value: sections.length, icon: 'i-lucide-layers' },
              { label: 'Lessons', value: total, icon: 'i-lucide-book-open' },
              { label: 'Hands-on builds', value: handsOnTotal, icon: 'i-lucide-monitor-play' },
              { label: 'Est. time', value: `~${totalHours} h`, icon: 'i-lucide-clock' }
            ]"
            :key="stat.label"
            class="rounded-xl bg-white/10 px-4 py-4 ring-1 ring-white/15 backdrop-blur-sm"
          >
            <UIcon
              :name="stat.icon"
              class="size-4 text-white/70"
            />
            <dd class="im-figure mt-2 text-2xl font-semibold text-white">
              {{ stat.value }}
            </dd>
            <dt class="im-meta mt-0.5 text-white/65">
              {{ stat.label }}
            </dt>
          </div>
        </dl>
      </div>

      <ClientOnly>
        <div
          v-if="isSignedIn && doneTotal > 0"
          class="relative mt-8 max-w-xl"
        >
          <div class="mb-2 flex items-baseline justify-between text-sm">
            <span class="text-white/75">Your progress</span>
            <span class="im-figure text-white">{{ doneTotal }} / {{ total }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              class="h-full rounded-full bg-white"
              :style="{ width: `${Math.round(doneTotal / total * 100)}%` }"
            />
          </div>
        </div>
      </ClientOnly>
    </header>

    <div class="curriculum-grid mt-10">
      <!-- Index: every section, grouped by phase, sticky on desktop -->
      <nav
        class="curriculum-index hidden lg:block"
        aria-label="Sections"
      >
        <div
          v-for="phase in phases"
          :key="phase.key"
          class="mb-5"
        >
          <p class="im-meta mb-1.5 px-2 text-dimmed">
            {{ phase.kicker }} · {{ phase.title }}
          </p>
          <a
            v-for="section in phase.sections"
            :key="section.path"
            :href="`#section-${section.index}`"
            class="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-toned hover:bg-default hover:text-highlighted"
          >
            <span class="im-figure w-5 shrink-0 text-xs text-dimmed">{{ pad(section.index) }}</span>
            <span class="truncate">{{ section.title }}</span>
            <ClientOnly>
              <UIcon
                v-if="isSignedIn && section.lessons.length && doneIn(section) === section.lessons.length"
                name="i-lucide-circle-check"
                class="ms-auto size-3.5 shrink-0 text-primary"
              />
            </ClientOnly>
          </a>
        </div>
      </nav>

      <!-- Phases on a timeline -->
      <div class="min-w-0 space-y-12">
        <section
          v-for="(phase, pi) in phases"
          :key="phase.key"
          class="curriculum-phase"
        >
          <div class="flex items-start gap-4">
            <span class="curriculum-phase-dot">
              <UIcon
                :name="phase.icon"
                class="size-5"
              />
            </span>
            <div class="min-w-0 pt-0.5">
              <p class="im-meta text-primary">
                {{ phase.kicker }} of {{ phases.length }}
              </p>
              <h2 class="mt-0.5 text-2xl font-bold tracking-tight text-highlighted">
                {{ phase.title }}
              </h2>
              <p class="mt-1 max-w-2xl text-muted">
                {{ phase.blurb }}
              </p>
            </div>
          </div>

          <div
            class="mt-6 space-y-4 ps-0 sm:ps-14"
            :class="{ 'pb-2': pi < phases.length - 1 }"
          >
            <article
              v-for="section in phase.sections"
              :id="`section-${section.index}`"
              :key="section.path"
              class="scroll-mt-24 overflow-hidden rounded-xl border border-default bg-default"
            >
              <div class="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-default px-5 py-4">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UIcon
                    :name="section.icon"
                    class="size-5"
                  />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="im-meta text-dimmed">
                    Section {{ pad(section.index) }}
                  </p>
                  <h3 class="text-lg font-semibold tracking-tight text-highlighted">
                    <NuxtLink
                      :to="localePath(section.path)"
                      class="hover:text-primary"
                    >
                      {{ section.title }}
                    </NuxtLink>
                  </h3>
                </div>

                <div class="flex flex-wrap items-center gap-1.5">
                  <UBadge
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-book-open"
                  >
                    {{ section.lessons.length }} lessons
                  </UBadge>
                  <UBadge
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-clock"
                  >
                    ~{{ section.minutes }} min
                  </UBadge>
                  <UBadge
                    v-if="section.lessons.some(l => l.handsOn)"
                    color="primary"
                    variant="soft"
                    icon="i-lucide-monitor-play"
                  >
                    {{ section.lessons.filter(l => l.handsOn).length }} builds
                  </UBadge>
                  <ClientOnly>
                    <UBadge
                      v-if="isSignedIn"
                      color="primary"
                      variant="solid"
                      class="im-figure"
                    >
                      {{ doneIn(section) }}/{{ section.lessons.length }}
                    </UBadge>
                  </ClientOnly>
                </div>
              </div>

              <ol class="grid gap-x-4 px-3 py-3 sm:grid-cols-2">
                <li
                  v-for="(lesson, li) in section.lessons"
                  :key="lesson.path"
                >
                  <NuxtLink
                    :to="localePath(lesson.path)"
                    class="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-toned hover:bg-elevated hover:text-highlighted"
                  >
                    <ClientOnly>
                      <UIcon
                        v-if="isDone(lesson.path)"
                        name="i-lucide-circle-check"
                        class="size-4 shrink-0 text-primary"
                      />
                      <span
                        v-else
                        class="im-figure w-4 shrink-0 text-center text-[11px] text-dimmed group-hover:text-primary"
                      >{{ li + 1 }}</span>
                      <template #fallback>
                        <span class="im-figure w-4 shrink-0 text-center text-[11px] text-dimmed">{{ li + 1 }}</span>
                      </template>
                    </ClientOnly>

                    <span class="truncate">{{ lesson.title }}</span>

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

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-dashed border-default px-5 py-4 text-xs text-muted sm:ms-14">
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
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
.curriculum-hero {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .curriculum-hero {
    grid-template-columns: minmax(0, 1fr) 24rem;
  }
}
.curriculum-cta {
  background-color: #fff;
  color: var(--color-cobalt-700);
}
.curriculum-cta:hover {
  background-color: var(--color-cobalt-50);
}
@media (min-width: 1024px) {
  .curriculum-grid {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    column-gap: 2.5rem;
    align-items: start;
  }
  .curriculum-index {
    position: sticky;
    top: calc(var(--ui-header-height) + 1.5rem);
  }
}

/* The timeline: a hairline running down from each phase's marker. */
.curriculum-phase {
  position: relative;
}
@media (min-width: 640px) {
  .curriculum-phase::before {
    content: "";
    position: absolute;
    left: 1.25rem;
    top: 2.75rem;
    bottom: -3rem;
    width: 1px;
    background: linear-gradient(var(--ui-border-accented), var(--ui-border-accented) 70%, transparent);
  }
  .curriculum-phase:last-of-type::before {
    bottom: 0;
  }
}
.curriculum-phase-dot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: var(--ui-primary);
  color: #fff;
  box-shadow: 0 0 0 4px var(--app-page);
}
</style>
