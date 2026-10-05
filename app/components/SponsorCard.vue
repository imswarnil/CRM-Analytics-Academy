<script setup lang="ts">
/**
 * "Sponsor the project" — a compact link to /sponsor for rails and footers.
 * Its second line is live: this month's sponsor when there is one, the price
 * when the month is open. It reads the same placement feed as the promo
 * slots, so it adds no request of its own.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { data, ensure } = usePlacementFeed()
onMounted(ensure)

const line = computed(() => data.value?.sponsor
  ? t('sponsor.card.current', { name: data.value.sponsor.name })
  : t('sponsor.card.open', { price: `$${PARTNER_PRICE_USD}` }))
</script>

<template>
  <NuxtLink
    :to="localePath('/sponsor')"
    class="group flex items-center gap-2.5 border-[1.5px] border-(--ink) bg-(--card) px-3 py-2.5 transition-colors hover:bg-(--ice)"
  >
    <UIcon
      name="i-lucide-heart"
      class="size-4 shrink-0 text-(--signal)"
    />

    <span class="min-w-0 flex-1">
      <span class="block truncate text-xs font-bold text-(--ink)">{{ t('sponsorCard.title') }}</span>
      <span class="block truncate font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)">{{ line }}</span>
    </span>

    <UIcon
      name="i-lucide-arrow-right"
      class="size-3.5 shrink-0 text-(--ink2) transition-transform group-hover:translate-x-0.5"
    />
  </NuxtLink>
</template>
