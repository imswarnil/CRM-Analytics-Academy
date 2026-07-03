<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath('/sponsor')"
    class="group flex items-center gap-2.5 rounded-lg border border-default bg-primary/5 px-3 py-2.5 transition-colors hover:bg-primary/10"
  >
    <UIcon
      name="i-lucide-heart"
      class="size-4 shrink-0 text-primary"
    />

    <span class="min-w-0 flex-1">
      <span class="block truncate text-xs font-medium text-highlighted">{{ t('sponsorCard.title') }}</span>
      <span class="block truncate text-[11px] text-muted">{{ t('sponsorCard.desc') }}</span>
    </span>

    <UIcon
      name="i-lucide-arrow-right"
      class="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
    />
  </NuxtLink>
</template>
