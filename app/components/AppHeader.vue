<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// A flat navbar, no dropdowns: six direct destinations. Everything else
// (wall of fame, companies, leaderboard, project pages) lives in the footer
// columns and the mobile slideover's extras list.
const menuItems = computed(() => [
  { label: t('nav.curriculum'), icon: 'i-lucide-graduation-cap', to: localePath('/foundations'), active: route.path.startsWith(localePath('/foundations')) },
  { label: t('nav.ask'), icon: 'i-lucide-sparkles', to: localePath('/ask') },
  { label: t('nav.showcase'), icon: 'i-lucide-layout-dashboard', to: localePath('/showcase') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.jobs'), icon: 'i-lucide-briefcase', to: localePath('/jobs') },
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') }
])

// The rest of the site, for the mobile slideover only.
const extraItems = computed(() => [
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.wallOfFame'), icon: 'i-lucide-heart-handshake', to: localePath('/wall-of-fame') },
  { label: t('nav.companies'), icon: 'i-lucide-building-2', to: localePath('/companies') },
  { label: t('nav.leaderboard'), icon: 'i-lucide-trophy', to: localePath('/leaderboard') },
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.sponsor'), icon: 'i-lucide-heart', to: localePath('/sponsor') },
  { label: t('nav.github'), icon: 'i-simple-icons-github', to: 'https://github.com/imswarnil/CRM-Analytics-Academy', target: '_blank' }
])

// Account menu — the session itself is fetched once in app.vue.
const { user, isSignedIn, signOut } = useAuth()
const accountItems = computed(() => [[
  { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
  { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit') }
], [
  { label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: () => signOut() }
]])

// Language switcher — use setLocale so the choice is persisted (cookie) and
// the browser-language auto-redirect doesn't bounce the user back.
const localeItems = computed(() =>
  locales.value.map(l => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    onSelect: () => setLocale(l.code)
  }))
)
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1', body: 'flex flex-col h-full p-0 overflow-hidden' }"
    :to="localePath('/')"
  >
    <!-- Active state is a filled pill, not the underline: highlight is off
         and the pill's ::before surface carries the primary tint instead. -->
    <!-- Stock Nuxt UI navigation menu: `highlight` gives the active item the
         library's own indicator, no custom pill or underline of ours. -->
    <UNavigationMenu
      highlight
      :items="menuItems"
      class="max-lg:hidden"
    />

    <template #left>
      <NuxtLink :to="localePath('/')">
        <AppLogo class="h-6 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <!-- Search folds down to its icon form: the navbar centre now belongs
           to the navigation menu, and the palette opens on Cmd/Ctrl-K too.
           GitHub lives in the About dropdown and the footer. -->
      <UContentSearchButton v-if="header?.search" />

      <UDropdownMenu
        :items="localeItems"
        :content="{ align: 'end' }"
        class="max-lg:hidden"
      >
        <UButton
          icon="i-lucide-languages"
          color="neutral"
          variant="ghost"
          :aria-label="t('nav.chooseLanguage')"
        />
      </UDropdownMenu>

      <UTooltip
        v-if="header?.colorMode"
        :text="t('nav.theme')"
        class="max-lg:hidden"
      >
        <UColorModeButton />
      </UTooltip>

      <ClientOnly>
        <UDropdownMenu
          v-if="isSignedIn"
          :items="accountItems"
          :content="{ align: 'end' }"
        >
          <UButton
            icon="i-lucide-circle-user"
            color="neutral"
            variant="ghost"
            :aria-label="user?.name || user?.email || t('nav.account')"
          />
        </UDropdownMenu>
        <UButton
          v-else
          :to="localePath('/sign-in')"
          :label="t('nav.signIn')"
          color="primary"
          variant="subtle"
          class="max-sm:hidden"
        />
        <template #fallback>
          <div class="size-9" />
        </template>
      </ClientOnly>
    </template>

    <template #body>
      <!-- min-h-0 lets this shrink below its content size so it actually
           scrolls instead of pushing the sponsor card off-screen; the card
           is a shrink-0 sibling, so it stays pinned to the bottom of the
           mobile menu regardless of nav length. -->
      <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <!-- The navbar's menu items first — on mobile this slideover is the
             only place they exist — then the full curriculum tree. -->
        <UNavigationMenu
          orientation="vertical"
          :items="[...menuItems, ...extraItems]"
          class="mb-4"
        />

        <USeparator class="mb-4" />

        <UContentNavigation
          highlight
          type="single"
          :navigation="navigation"
        />
      </div>

      <!-- Language + theme controls (hidden from the crowded mobile navbar). -->
      <div class="flex items-center justify-between gap-2 border-t border-default px-4 py-3 sm:px-6 lg:hidden">
        <UDropdownMenu
          :items="localeItems"
          :content="{ align: 'start' }"
        >
          <UButton
            icon="i-lucide-languages"
            :label="t('nav.chooseLanguage')"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </UDropdownMenu>
        <UColorModeButton />
      </div>

      <SponsorCard class="m-4 mt-0 shrink-0 sm:mx-6 sm:mb-6" />
    </template>
  </UHeader>
</template>
