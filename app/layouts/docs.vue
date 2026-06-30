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
        <UPageAside>
          <UContentNavigation
            highlight
            type="single"
            :navigation="navigation"
          />
        </UPageAside>

        <AdUnit
          placement="sidebarSquare"
          class="mt-6 hidden lg:block"
        />
      </template>

      <slot />
    </UPage>

    <AdUnit
      placement="footer"
      class="mb-8"
    />
  </UContainer>
</template>
