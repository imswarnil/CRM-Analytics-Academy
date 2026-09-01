<script setup lang="ts">
/**
 * The lesson transport, docked at the top of the content pane.
 *
 * Answers the three questions a learner asks repeatedly while scrolling —
 * where am I, how far through, what is next — which is why it is sticky
 * rather than sitting at the top of the article.
 *
 * It carries no site navigation: the rail beside it is the way out of a
 * lesson, and a link row here would be an invitation to leave in the middle
 * of one.
 */
const { current, previous, next, position, total, percent } = useCourse()
const { completed } = useProgress()
const { isSignedIn } = useAuth()
const localePath = useLocalePath()
const { t } = useI18n()

// Completed across the whole curriculum — the same number the dashboard
// reports, so the two cannot disagree.
const doneCount = computed(() => completed.value.size)
</script>

<template>
  <div
    v-if="current"
    class="sticky top-0 z-10 border-b border-default bg-default/85 backdrop-blur"
  >
    <div class="flex h-12 items-center gap-3 px-4 sm:gap-4 sm:px-6">
      <p class="hidden min-w-0 max-w-56 truncate text-sm font-medium text-highlighted sm:block">
        {{ current.title }}
      </p>

      <span class="tabular shrink-0 text-xs text-muted">
        <span class="font-semibold text-primary">{{ position }}</span>
        <span class="opacity-40"> / </span>{{ total }}
      </span>

      <UProgress
        :model-value="percent"
        :max="100"
        size="sm"
        class="min-w-0 flex-1"
        :aria-label="t('course.courseProgress')"
      />

      <!-- Completed count, distinct from the position counter beside it: one
           is where you are, the other is what you have finished, and a learner
           who jumps around needs both. -->
      <ClientOnly>
        <UTooltip
          v-if="isSignedIn && doneCount"
          :text="t('course.moduleProgress', { done: doneCount, total })"
        >
          <span class="tabular hidden shrink-0 items-center gap-1 text-xs text-muted sm:inline-flex">
            <UIcon
              name="i-lucide-circle-check"
              class="size-3.5 text-primary"
            />
            {{ doneCount }}
          </span>
        </UTooltip>
      </ClientOnly>

      <div class="flex shrink-0 items-center gap-1">
        <UButton
          :to="previous ? localePath(previous.path) : undefined"
          :disabled="!previous"
          :title="previous?.title"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="t('course.previous')"
        />
        <UButton
          :to="next ? localePath(next.path) : undefined"
          :disabled="!next"
          :title="next?.title"
          trailing-icon="i-lucide-chevron-right"
          :label="next ? t('course.next') : t('course.finish')"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
