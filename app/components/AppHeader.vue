<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()

// Icon actions on the right of the navbar — all rendered as ghost icon links
// with a hover tooltip, matching the GitHub / theme-toggle treatment.
const actions = [
  {
    'icon': 'i-lucide-info',
    'label': 'About',
    'to': '/about',
    'aria-label': 'About this project'
  },
  {
    'icon': 'i-lucide-heart',
    'label': 'Sponsor this project',
    'to': 'https://github.com/sponsors/crm-analytics-academy',
    'target': '_blank',
    'aria-label': 'Sponsor this project'
  },
  {
    'icon': 'i-simple-icons-github',
    'label': 'View on GitHub',
    'to': 'https://github.com/crm-analytics-academy/crm-analytics-academy',
    'target': '_blank',
    'aria-label': 'GitHub'
  }
]
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :to="header?.to || '/'"
  >
    <UContentSearchButton
      v-if="header?.search"
      :collapsed="false"
      class="w-full"
    />

    <template
      v-if="header?.logo?.dark || header?.logo?.light || header?.title"
      #title
    >
      <UColorModeImage
        v-if="header?.logo?.dark || header?.logo?.light"
        :light="header?.logo?.light!"
        :dark="header?.logo?.dark!"
        :alt="header?.logo?.alt"
        class="h-6 w-auto shrink-0"
      />

      <span v-else-if="header?.title">
        {{ header.title }}
      </span>
    </template>

    <template
      v-else
      #left
    >
      <NuxtLink :to="header?.to || '/'">
        <AppLogo class="w-auto h-6 shrink-0" />
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
          :aria-label="action['aria-label']"
          color="neutral"
          variant="ghost"
          :class="action.icon === 'i-lucide-heart' ? 'hover:text-primary' : ''"
        />
      </UTooltip>

      <UTooltip
        v-if="header?.colorMode"
        text="Toggle theme"
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
