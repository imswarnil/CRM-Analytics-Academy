<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

// Icon actions on the right of the navbar — ghost icon links with a tooltip.
const actions = computed(() => [
  { icon: 'i-lucide-library-big', label: t('nav.resources'), to: localePath('/resources'), target: undefined as string | undefined },
  { icon: 'i-lucide-info', label: t('nav.about'), to: localePath('/about'), target: undefined as string | undefined },
  { icon: 'i-lucide-heart', label: t('nav.sponsor'), to: 'https://github.com/sponsors/crm-analytics-academy', target: '_blank' },
  { icon: 'i-simple-icons-github', label: t('nav.github'), to: 'https://github.com/crm-analytics-academy/crm-analytics-academy', target: '_blank' }
])

// Language switcher items — each links to the current route in that locale.
const localeItems = computed(() =>
  locales.value.map(l => ({
    label: l.name || l.code,
    to: switchLocalePath(l.code),
    icon: l.code === locale.value ? 'i-lucide-check' : undefined
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
