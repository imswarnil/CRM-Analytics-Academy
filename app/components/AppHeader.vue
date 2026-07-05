<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

// Icon actions on the right of the navbar — ghost icon links with a tooltip.
const actions = computed(() => [
  { icon: 'i-lucide-info', label: t('nav.about'), to: localePath('/about'), target: undefined as string | undefined },
  { icon: 'i-simple-icons-github', label: t('nav.github'), to: 'https://github.com/imswarnil/CRM-Analytics-Academy', target: '_blank' }
])

// Secondary links folded into a "More" dropdown to keep the icon row short.
// About/GitHub are duplicated here (as a `class` marking them mobile-only)
// since their icon buttons are hidden below lg to keep the navbar from
// overflowing on small screens.
const moreItems = computed(() => [
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') },
  { label: t('nav.roadmap'), icon: 'i-lucide-map', to: localePath('/roadmap') },
  { label: t('nav.changelog'), icon: 'i-lucide-history', to: localePath('/changelog') },
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.github'), icon: 'i-simple-icons-github', to: 'https://github.com/imswarnil/CRM-Analytics-Academy', target: '_blank', class: 'lg:hidden' },
  { label: t('nav.sponsor'), icon: 'i-lucide-heart', to: localePath('/sponsor') }
])

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
    <UContentSearchButton
      v-if="header?.search"
      :collapsed="false"
      class="w-full max-lg:hidden"
    />

    <template #left>
      <NuxtLink :to="localePath('/')">
        <AppLogo class="h-6 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        class="lg:hidden"
      />

      <UTooltip
        v-for="action in actions"
        :key="action.icon"
        :text="action.label"
        class="hidden lg:inline-flex"
      >
        <UButton
          :icon="action.icon"
          :to="action.to"
          :target="action.target"
          :aria-label="action.label"
          color="neutral"
          variant="ghost"
          :class="action.icon === 'i-lucide-heart' ? 'hover:text-primary' : ''"
        />
      </UTooltip>

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

      <AppUserMenu />

      <!-- "More" overflow menu — kept last so it reads as the catch-all,
           after language and theme controls. Carries the mobile-only about
           and GitHub links too, since those icons are hidden below lg. -->
      <UDropdownMenu
        :items="moreItems"
        :content="{ align: 'end' }"
      >
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          :aria-label="t('nav.more')"
        />
      </UDropdownMenu>
    </template>

    <template #body>
      <!-- min-h-0 lets this shrink below its content size so it actually
           scrolls instead of pushing the sponsor card off-screen; the card
           is a shrink-0 sibling, so it stays pinned to the bottom of the
           mobile menu regardless of nav length. -->
      <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
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
