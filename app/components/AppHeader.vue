<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()

// Inject docs navigation from app.vue (you already provide('navigation', navigation))
const navigation = inject<Ref<ContentNavigationItem[]> | null>('navigation', null)

const items = computed(() => [
  {
    label: 'Docs',
    to: '/docs',
    icon: 'i-lucide-book-open',
    active: route.path.startsWith('/docs')
  },
  {
    label: 'Pricing',
    to: '/pricing',
    icon: 'i-lucide-credit-card'
  },
  {
    label: 'Blog',
    to: '/blog',
    icon: 'i-lucide-pencil'
  },
  {
    label: 'Changelog',
    to: '/changelog',
    icon: 'i-lucide-history'
  }
])

// Show full docs tree in mobile menu only when on /docs routes and navigation exists
const hasDocsNav = computed(() =>
  route.path.startsWith('/docs') &&
  navigation?.value &&
  navigation.value.length > 0
)
</script>

<template>
  <UHeader>
    <!-- LEFT: logo + template menu (unchanged) -->
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <!-- CENTER: desktop nav with icons -->
    <UNavigationMenu
      :items="items"
      variant="link"
      class="hidden lg:flex"
    />

    <!-- RIGHT: search + color-mode + auth -->
    <template #right>
      <!-- 🔍 Global search (mobile + desktop) -->
      <UContentSearchButton
        :collapsed="true"
        class="inline-flex mr-1"
      />

      <!-- 🌗 Dark / light toggle -->
      <UColorModeButton class="mr-1" />

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
        color="neutral"
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

        <!-- Otherwise → fallback to simple nav items -->
        <UNavigationMenu
          v-else
          :items="items"
          orientation="vertical"
        />

        <USeparator class="my-2" />

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
          color="neutral"
          to="/signup"
          block
        />
      </div>
    </template>
  </UHeader>
</template>
