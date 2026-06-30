<script setup lang="ts">
const { footer } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const pageLinks = computed(() => [
  { label: t('nav.resources'), to: localePath('/resources') },
  { label: t('nav.datasets'), to: localePath('/datasets') },
  { label: t('nav.contribute'), to: localePath('/contribute') },
  { label: t('nav.sponsor'), to: localePath('/sponsor') },
  { label: t('nav.about'), to: localePath('/about') }
])
</script>

<template>
  <UFooter>
    <template #left>
      {{ footer.credits }}
    </template>

    <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
      <NuxtLink
        v-for="l in pageLinks"
        :key="l.to"
        :to="l.to"
        class="text-muted transition hover:text-primary"
      >
        {{ l.label }}
      </NuxtLink>
    </nav>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
