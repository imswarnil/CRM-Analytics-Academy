<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const { header } = useAppConfig()

// Inject docs navigation from app.vue
const navigation = inject<Ref<ContentNavigationItem[]> | null>('navigation', null)

// Build nav items from app.config.ts → header.nav
const items = computed(() =>
  (header?.nav || []).map((item: any) => ({
    ...item,
    active: item.match
      ? route.path.startsWith(item.match)
      : route.path === item.to
  }))
)

// Show full docs tree in mobile menu only when on /docs and navigation exists
const hasDocsNav = computed(
  () =>
    route.path.startsWith('/docs') &&
    navigation?.value &&
    navigation.value.length > 0
)
</script>

<template>
  <UHeader>
    <!-- LEFT: logo + template menu (your original style) -->
    <template #left>
      <NuxtLink :to="header?.to || '/'">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <!-- CENTER: desktop nav with icons (from app.config.ts header.nav) -->
    <UNavigationMenu
      :items="items"
      variant="link"
      class="hidden lg:flex"
    />

    <!-- RIGHT: search + color-mode + social + auth -->
    <template #right>
      <!-- 🔍 Global search (mobile + desktop) -->
      <UContentSearchButton
        v-if="header?.search"
        :collapsed="true"
        class="inline-flex mr-1"
      />

      <!-- 🌗 Dark / light toggle -->
      <UColorModeButton
        v-if="header?.colorMode"
        class="mr-1"
      />

      <!-- Social / external links (GitHub, YouTube, etc.) -->
      <template v-if="header?.links?.length">
        <UButton
          v-for="(link, index) in header.links"
          :key="index"
          v-bind="{
            color: 'neutral',
            variant: 'ghost',
            size: 'sm',
            ...link
          }"
          class="hidden sm:inline-flex"
        />
      </template>

      <!-- Auth buttons -->
      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />

      <UButton
        label="Sign up"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/signup"
      />
    </template>

    <!-- MOBILE BODY: docs tree on docs pages, fallback nav otherwise -->
    <template #body>
      <div class="-mx-2.5 space-y-6 lg:hidden">
        <!-- 📚 When on /docs → show full docs navigation -->
        <UContentNavigation
          v-if="hasDocsNav"
          :navigation="navigation!"
          highlight
        />

        <!-- Else → fallback to simple nav items -->
        <UNavigationMenu
          v-else
          :items="items"
          orientation="vertical"
        />

        <USeparator class="my-2" />

        <!-- Social links (mobile) -->
        <div
          v-if="header?.links?.length"
          class="flex flex-wrap gap-2"
        >
          <UButton
            v-for="(link, index) in header.links"
            :key="`mobile-link-${index}`"
            v-bind="{
              color: 'neutral',
              variant: 'ghost',
              size: 'sm',
              ...link
            }"
            class="flex-1 justify-center"
          />
        </div>

        <!-- Auth buttons (mobile) -->
        <UButton
          label="Sign in"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          label="Sign up"
          color="primary"
          to="/signup"
          block
        />
      </div>
    </template>
  </UHeader>
</template>
