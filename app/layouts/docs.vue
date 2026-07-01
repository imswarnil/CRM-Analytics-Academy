<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <UContainer>
    <AdUnit
      placement="headerBanner"
      class="mt-4"
    />

    <UPage>
      <template #left>
        <!-- One sticky, viewport-capped, scrollable box for nav + ad together —
             the ad rides along with the nav and stops sticking once you scroll
             past the bottom of this block, instead of floating forever. -->
        <div class="hidden lg:sticky lg:top-(--ui-header-height) lg:block lg:max-h-[calc(100vh-var(--ui-header-height))] lg:overflow-y-auto lg:-ms-4 lg:py-8 lg:ps-4 lg:pe-6.5">
          <UContentNavigation
            highlight
            type="single"
            :navigation="navigation"
          />

          <AdUnit
            placement="sidebarSquare"
            class="mt-6"
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
</template>
