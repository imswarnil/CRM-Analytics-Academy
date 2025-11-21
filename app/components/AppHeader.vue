<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  {
    label: 'Docs',
    to: '/docs',
    icon: 'i-lucide-book-open',       // ⬅️ icon for nav item
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
</script>

<template>
  <UHeader>
    <!-- LEFT: your logo stays exactly as it is -->
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <!-- CENTER: nav with (optional) icons -->
    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <!-- RIGHT: search + color mode + auth buttons -->
    <template #right>
      <!-- 🔍 This button opens the same global search panel you already wired in app.vue -->
      <UContentSearchButton
        class="hidden sm:inline-flex mr-1"
        :collapsed="true"
      />

      <UColorModeButton />

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

    <!-- MOBILE BODY: nav + auth (you already had this, unchanged) -->
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

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
    </template>
  </UHeader>
</template>
