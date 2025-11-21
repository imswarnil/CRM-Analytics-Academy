<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <div>
    <AppHeader />
<GoogleAd variant="leaderboard" />
    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <template #top>
                <UContentSearchButton :collapsed="false" />
                  <GoogleAd variant="square-fixed" />
              </template>

              <UContentNavigation
                :navigation="navigation"
                highlight
              />
              <GoogleAd variant="rectangle" />

            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>

<GoogleAd variant="large-leaderboard" />

    <AppFooter />
  </div>
</template>