<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The whole course on one page: every section, every lesson, in order.
 *
 * The header's "Curriculum" link used to point at /foundations, which meant the
 * only way to see the shape of the course was to open the first lesson of it and
 * read a sidebar. A learner deciding whether to start, or returning after a
 * fortnight and trying to remember where they were, needs the map rather than a
 * lesson.
 *
 * It renders from the same navigation tree the sidebar uses, so it can never
 * disagree with it, and it is built from `useCourse` so lesson numbering here
 * matches the prev/next controls inside a lesson.
 *
 * Progress is additive and client-only: the page is prerendered for everyone,
 * and a signed-in learner's completion ticks and per-section bars hydrate on
 * top. Nothing about the curriculum is gated behind signing in.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const localePath = useLocalePath()
const { lessons, total } = useCourse()
const { isDone } = useProgress()
const { isSignedIn } = useAuth()

// The site name is appended by the title template in app.vue; adding it here
// too would render it twice in the tab.
const title = 'Curriculum'
const description = 'Every section and every lesson of the CRM Analytics Academy course, in order: foundations, access, datasets, exploration, dashboard design, collaboration, and the fourteen go-to-market builds.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

interface Section {
  title: string
  icon: string
  path: string
  lessons: { title: string, path: string }[]
}

const sections = computed<Section[]>(() =>
  (navigation.value ?? []).map(mod => ({
    title: String(mod.title ?? ''),
    icon: String(mod.icon ?? 'i-lucide-book-open'),
    path: String(mod.path ?? ''),
    lessons: ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map(l => ({ title: String(l.title ?? ''), path: String(l.path ?? '') }))
  }))
)

// Completion per section, for the signed-in case. Counted here rather than in
// the template so the bar and the "x of y" label cannot drift apart.
function doneIn(section: Section) {
  return section.lessons.filter(l => isDone(l.path)).length
}

const doneTotal = computed(() => lessons.value.filter(l => isDone(l.path)).length)

// Where a returning learner should land: the first lesson they have not ticked.
const resumeTo = computed(() => lessons.value.find(l => !isDone(l.path))?.path)
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto max-w-3xl text-center">
      <p class="im-meta text-primary">
        The course
      </p>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
        The whole curriculum
      </h1>
      <p class="mt-4 text-lg text-muted">
        {{ sections.length }} sections, {{ total }} lessons, one fictional company, and fourteen
        dashboards you will have built by the end. Everything here is free and nothing is gated.
      </p>

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
      </div>

      <!-- Overall progress, only once there is something to report. -->
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

    <!-- One card per section. The lesson list is always visible: the point of
         this page is the map, and a page of collapsed accordions is a map you
         have to excavate. -->
    <div class="mt-12 grid gap-5 lg:grid-cols-2">
      <section
        v-for="(section, index) in sections"
        :key="section.path"
        class="im-card-hover rounded-lg border border-default bg-elevated/30 p-5"
      >
        <div class="flex items-start gap-3">
          <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <UIcon
              :name="section.icon"
              class="size-5 text-primary"
            />
          </span>

          <div class="min-w-0 flex-1">
            <p class="im-meta text-dimmed">
              Section {{ index }}
            </p>
            <h2 class="mt-0.5 text-lg font-semibold tracking-tight text-highlighted">
              <NuxtLink
                :to="localePath(section.path)"
                class="hover:text-primary"
              >
                {{ section.title }}
              </NuxtLink>
            </h2>
          </div>

          <ClientOnly>
            <span
              v-if="isSignedIn"
              class="im-figure shrink-0 text-xs text-muted"
            >
              {{ doneIn(section) }}/{{ section.lessons.length }}
            </span>
            <template #fallback>
              <span class="im-figure shrink-0 text-xs text-dimmed">
                {{ section.lessons.length }}
              </span>
            </template>
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
            </NuxtLink>
          </li>
        </ol>
      </section>
    </div>

    <div class="mt-12 rounded-lg border border-default bg-elevated/30 p-6 text-center">
      <h2 class="text-lg font-semibold text-highlighted">
        The data behind every build
      </h2>
      <p class="mx-auto mt-2 max-w-2xl text-sm text-muted">
        Nineteen CSV files describing one fictional company, with the true totals published
        beside them so you can check your own work. Download once; every build in sections 7
        to 10 runs on them.
      </p>
      <UButton
        :to="localePath('/datasets')"
        icon="i-lucide-database"
        color="neutral"
        variant="outline"
        class="mt-4"
      >
        Get the datasets
      </UButton>
    </div>
  </UContainer>
</template>
