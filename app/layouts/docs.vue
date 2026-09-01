<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The course player, per design page 02: the curriculum pane on the left —
 * progress at the top, the coloured section tiles under it, an ink line
 * down its edge — and the reading column beside it. Nothing sits between
 * the navbar and the lesson: progress lives in the pane, exactly as the
 * design draws it.
 *
 * Below lg the pane becomes a slide-over behind a slim curriculum strip —
 * an 18rem pane on a 375px screen would leave 5rem for the lesson.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const railOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => {
  railOpen.value = false
})

const { position, total, percent } = useCourse()
const { t } = useI18n()
</script>

<template>
  <div class="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
    <!-- The curriculum pane. Sticky under the 4rem navbar with its own
         scrollbar, so a learner deep in the lesson keeps their place in the
         course at hand. -->
    <aside
      class="border-e-[3px] border-(--nb-ink) bg-(--nb-surface) max-lg:hidden lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto"
      :aria-label="t('course.curriculum')"
    >
      <CourseRail
        v-if="navigation?.length"
        :items="navigation"
      />
    </aside>

    <USlideover
      v-model:open="railOpen"
      side="left"
      :title="t('course.curriculum')"
      :ui="{ content: 'max-w-80', body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <CourseRail
          v-if="navigation?.length"
          :items="navigation"
        />
      </template>
    </USlideover>

    <div class="min-w-0">
      <!-- Mobile only: the way into the curriculum pane, with the position
           beside it. On lg+ the pane is simply there. -->
      <button
        type="button"
        class="sticky top-16 z-10 flex w-full items-center gap-2.5 border-b-2 border-(--nb-ink) bg-(--nb-surface)/90 px-4 py-2.5 text-start backdrop-blur lg:hidden"
        @click="railOpen = true"
      >
        <UIcon
          name="i-lucide-list-tree"
          class="size-4.5 shrink-0 text-highlighted"
        />
        <span class="font-display text-[0.8125rem] font-bold text-highlighted">{{ t('course.curriculum') }}</span>
        <span class="tabular ms-auto text-xs font-semibold text-primary">{{ position }}/{{ total }}</span>
        <UProgress
          :model-value="percent"
          :max="100"
          size="sm"
          class="w-16"
          :aria-label="t('course.courseProgress')"
        />
      </button>

      <div class="px-4 sm:px-6">
        <AdUnit
          placement="headerBanner"
          class="mt-4 max-lg:hidden"
        />

        <slot />

        <AdUnit
          placement="footer"
          class="mb-8"
        />
      </div>
    </div>
  </div>
</template>
