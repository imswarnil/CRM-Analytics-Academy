<script setup lang="ts">
const { footer } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const columns = computed(() => [
  {
    label: t('footer.curriculum'),
    children: [
      { label: t('home.modules.foundations.title'), to: localePath('/foundations') },
      { label: t('home.modules.analytics.title'), to: localePath('/analytics') },
      { label: t('nav.resources'), to: localePath('/resources') },
      { label: t('nav.datasets'), to: localePath('/datasets') }
    ]
  },
  {
    label: t('footer.project'),
    children: [
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.contribute'), to: localePath('/contribute') },
      { label: t('nav.sponsor'), to: localePath('/sponsor') },
      { label: t('nav.github'), to: 'https://github.com/crm-analytics-academy/crm-analytics-academy', target: '_blank' }
    ]
  },
  {
    label: t('footer.legal'),
    children: [
      { label: t('nav.privacy'), to: localePath('/privacy') },
      { label: t('nav.terms'), to: localePath('/terms') }
    ]
  }
])
</script>

<template>
  <UFooter>
    <template #top>
      <UFooterColumns :columns="columns">
        <template #left>
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center gap-2"
          >
            <AppLogo class="h-6 w-auto shrink-0" />
          </NuxtLink>
          <p class="mt-4 max-w-xs text-sm text-muted">
            {{ t('footer.tagline') }}
          </p>
          <div class="mt-5 flex items-center gap-1">
            <UColorModeButton v-if="footer?.colorMode" />
            <template v-if="footer?.links">
              <UButton
                v-for="(link, index) of footer?.links"
                :key="index"
                v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
              />
            </template>
          </div>
        </template>
      </UFooterColumns>
    </template>

    <template #left>
      {{ footer.credits }}
    </template>
  </UFooter>
</template>
