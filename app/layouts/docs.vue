<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
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
        <!-- Sticky, viewport-capped column. The nav scrolls in its own
             flex-1 area; the sponsor card is a shrink-0 sibling below it, so
             it stays pinned at the bottom of the sidebar instead of
             scrolling away with a long nav list. -->
        <div class="hidden lg:sticky lg:top-(--ui-header-height) lg:flex lg:h-[calc(100vh-var(--ui-header-height))] lg:flex-col lg:-ms-4 lg:ps-4 lg:pe-6.5">
          <div class="min-h-0 flex-1 overflow-y-auto py-8">
            <UContentNavigation
              highlight
              type="single"
              :navigation="navigation"
            />
          </div>

          <SponsorCard class="mb-6 shrink-0" />
        </div>
      </template>

      <slot />
    </UPage>

    <AdUnit
      placement="footer"
      class="mb-8"
    />
  </UContainer>
</template>
