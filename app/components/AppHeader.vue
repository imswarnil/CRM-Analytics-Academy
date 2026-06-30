<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

// Icon actions on the right of the navbar — ghost icon links with a tooltip.
const actions = computed(() => [
  { icon: 'i-lucide-info', label: t('nav.about'), to: localePath('/about'), target: undefined as string | undefined },
  { icon: 'i-simple-icons-github', label: t('nav.github'), to: 'https://github.com/crm-analytics-academy/crm-analytics-academy', target: '_blank' }
])

// Secondary links folded into a "More" dropdown to keep the icon row short.
const moreItems = computed(() => [
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
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
    :ui="{ center: 'flex-1' }"
    :to="localePath('/')"
  >
    <UContentSearchButton
      v-if="header?.search"
      :collapsed="false"
      class="w-full"
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

      <UDropdownMenu
        :items="localeItems"
        :content="{ align: 'end' }"
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
      >
        <UColorModeButton />
      </UTooltip>
    </template>

    <template #body>
      <UContentNavigation
        highlight
        type="single"
        :navigation="navigation"
      />
    </template>
  </UHeader>
</template>
