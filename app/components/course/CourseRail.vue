<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The curriculum, as a stepper.
 *
 * One line runs down the column and every lesson's marker sits on it, so the
 * rail reads as a single path with your position on it — which is what a
 * course stepper is for, and what a plain list of links is not.
 *
 * Flat, with module headings, rather than a collapsible tree. A stepper whose
 * steps are hidden inside accordions cannot show a path: you would only ever
 * see the module you were already in, which is the one thing you did not need
 * telling.
 *
 * Because it is flat and the course is 49 lessons long, the current row is
 * scrolled into view on mount — otherwise a learner on lesson 30 lands
 * looking at lesson 1.
 */
const props = defineProps<{
  items: ContentNavigationItem[]
}>()

const route = useRoute()
const localePath = useLocalePath()
const { isDone } = useProgress()
const { position, total, percent } = useCourse()
const { t } = useI18n()

function isCurrent(path?: string) {
  if (!path) return false
  return route.path === localePath(path) || route.path === path
}

/** Modules flattened to [heading, ...lessons], numbered across the course. */
const sections = computed(() => {
  let n = 0
  return props.items.map((mod) => {
    const children = (mod.children ?? []) as ContentNavigationItem[]
    const lessons = (children.length ? children : [mod]).map(lesson => ({
      path: lesson.path as string,
      title: String(lesson.title ?? ''),
      index: ++n
    }))
    return {
      title: String(mod.title ?? ''),
      lessons,
      done: lessons.filter(l => isDone(l.path)).length,
      total: lessons.length
    }
  })
})

const current = ref<HTMLElement | null>(null)
onMounted(() => {
  // `block: 'center'` rather than scrollIntoView's default 'nearest', which
  // leaves the current lesson flush against an edge of the pane with no
  // visible context on one side.
  current.value?.scrollIntoView({ block: 'center' })
})
</script>

<template>
  <div>
    <div class="px-2 pb-3">
      <div class="mb-1.5 flex items-baseline justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-dimmed">
          {{ t('course.curriculum') }}
        </span>
        <span class="tabular text-xs text-muted">{{ position }} / {{ total }}</span>
      </div>
      <UProgress
        :model-value="percent"
        :max="100"
        size="sm"
        :aria-label="t('course.courseProgress')"
      />
    </div>

    <nav :aria-label="t('course.curriculum')">
      <template
        v-for="section in sections"
        :key="section.title"
      >
        <p class="flex items-baseline gap-2 px-2 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-dimmed">
          <span class="min-w-0 truncate">{{ section.title }}</span>
          <span class="tabular ms-auto shrink-0">{{ section.done }}/{{ section.total }}</span>
        </p>

        <NuxtLink
          v-for="lesson in section.lessons"
          :key="lesson.path"
          :ref="(el) => { if (isCurrent(lesson.path)) current = (el as { $el?: HTMLElement })?.$el ?? (el as HTMLElement | null) }"
          :to="localePath(lesson.path)"
          :aria-current="isCurrent(lesson.path) ? 'page' : undefined"
          class="group relative flex items-center gap-2.5 py-1.5 pe-2 ps-2 text-sm transition-colors"
          :class="isCurrent(lesson.path)
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted hover:bg-elevated hover:text-highlighted'"
        >
          <!-- The connecting line. Drawn per-row behind the marker rather than
               as one element, so it cannot fall out of step with the list when
               a module is added. -->
          <span
            class="absolute inset-y-0 start-[1.25rem] w-px bg-accented"
            aria-hidden="true"
          />

          <!-- A tick once finished, the lesson's number until then, so the
               column reads as a sequence rather than identical bullets. -->
          <span
            class="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] tabular transition-colors"
            :class="isDone(lesson.path)
              ? 'border-primary bg-primary text-inverted'
              : isCurrent(lesson.path)
                ? 'border-primary bg-default text-primary'
                : 'border-default bg-default text-dimmed'"
          >
            <UIcon
              v-if="isDone(lesson.path)"
              name="i-lucide-check"
              class="size-3.5"
            />
            <template v-else>{{ lesson.index }}</template>
          </span>

          <span class="min-w-0 flex-1 truncate">{{ lesson.title }}</span>
        </NuxtLink>
      </template>
    </nav>

    <SponsorCard class="mt-4" />
  </div>
</template>
