<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const toast = useToast()
const url = useRequestURL()

const items = computed(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home',
    active: route.path === '/'
  },
  {
    label: 'Training',               // was: Docs
    to: '/docs',
    icon: 'i-lucide-book-open',
    active: route.path.startsWith('/docs')
  },
  {
    label: 'Subscription',           // was: Pricing
    to: '/pricing',
    icon: 'i-lucide-tags',
    active: route.path.startsWith('/pricing')
  },
  {
    label: 'Blog',
    to: '/blog',
    icon: 'i-lucide-newspaper',
    active: route.path.startsWith('/blog')
  },
  {
    label: 'Changelog',
    to: '/changelog',
    icon: 'i-lucide-history',
    active: route.path.startsWith('/changelog')
  }
])

/** 🔹 JSON-LD for navigation (SiteNavigationElement) */
const origin = computed(() => `${url.protocol}//${url.host}`)

const navJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': items.value.map(link => ({
    '@type': 'SiteNavigationElement',
    name: link.label,
    url: origin.value + link.to
  }))
}))

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(navJsonLd.value)
    }
  ]
}))

const userEmail = computed(() => user.value?.email ?? '')
const userName = computed(() => {
  const meta = user.value?.user_metadata as any
  return meta?.full_name || userEmail.value
})
const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()
})

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    toast.add({
      title: 'Logout failed',
      description: error.message,
      color: 'red'
    })
    return
  }

  toast.add({
    title: 'Signed out',
    color: 'green'
  })

  await navigateTo('/login')
}

// Nuxt UI v4 dropdown items
const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: userName.value || 'Account',
      type: 'label'
    },
    {
      label: userEmail.value || '',
      type: 'label'
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: handleLogout
    }
  ]
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <!-- Main navigation -->
    <UNavigationMenu
      :items="items"
      variant="link"
      class="app-main-nav"
    />

    <template #right>
      <UColorModeButton />

      <!-- Not logged in -->
      <template v-if="!user">
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

      <!-- Logged in -->
      <template v-else>
        <UButton
          label="Dashboard"
          color="neutral"
          variant="ghost"
          to="/dashboard"
          class="hidden lg:inline-flex"
        />

        <UDropdownMenu
          :items="userMenuItems"
          :content="{ align: 'end' }"
        >
          <UButton
            color="neutral"
            variant="outline"
            class="inline-flex items-center gap-2"
          >
            <UAvatar
              :alt="userName"
              size="xs"
              :text="userInitials"
            />
            <span class="hidden sm:inline">
              {{ userName || 'Account' }}
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="w-4 h-4"
            />
          </UButton>
        </UDropdownMenu>
      </template>
    </template>

    <!-- Mobile nav -->
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="app-main-nav -mx-2.5"
      />

      <USeparator class="my-6" />

      <template v-if="!user">
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

      <template v-else>
        <UButton
          label="Dashboard"
          color="neutral"
          to="/dashboard"
          block
          class="mb-3"
        />
        <UButton
          label="Sign out"
          color="neutral"
          variant="subtle"
          block
          @click="handleLogout"
        />
      </template>
    </template>
  </UHeader>
</template>

