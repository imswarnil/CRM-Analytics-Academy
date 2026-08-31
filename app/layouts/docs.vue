<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

// Progress is loaded once here rather than in each of the rail, the bar and
// the completion control, so the three cannot show different states.
const { load } = useProgress()
const { isSignedIn } = useAuth()
watch(isSignedIn, signedIn => signedIn && load(), { immediate: true })
</script>

<template>
  <div>
    <CourseBar />

    <UContainer>
      <!-- Hidden on mobile: the right rail (table of contents) renders first
         there, and should sit directly under the navbar with nothing between
         them. Desktop still gets the top banner above the two-column page. -->
      <AdUnit
        placement="headerBanner"
        class="mt-4 hidden lg:block"
      />

      <UPage>
        <template #left>
          <!-- Sticky and viewport-capped. CourseRail does its own internal
             scrolling, so this only sets the frame; the 3rem is the course
             bar docked above, which the rail must sit below rather than
             under. -->
          <div class="hidden lg:sticky lg:top-[calc(var(--ui-header-height)+3rem)] lg:flex lg:h-[calc(100vh-var(--ui-header-height)-3rem)] lg:flex-col lg:-ms-4 lg:ps-4 lg:pe-6.5 lg:py-6">
            <CourseRail
              v-if="navigation?.length"
              :items="navigation"
            />
          </div>
        </template>

        <slot />
      </UPage>

      <AdUnit
        placement="footer"
        class="mb-8"
      />
    </UContainer>
  </div>
</template>
