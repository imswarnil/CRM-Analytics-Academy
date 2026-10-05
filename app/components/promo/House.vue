<script setup lang="ts">
/**
 * The house placeholder: what every slot shows in a month nobody has
 * sponsored. Same box as a creative, so swapping one for the other never
 * moves the page. Links to /sponsor, where the month can be booked.
 */
import type { PartnerFormat } from '#shared/utils/partner'

defineProps<{ format: PartnerFormat }>()

const { t } = useI18n()
const localePath = useLocalePath()
const price = `$${PARTNER_PRICE_USD}`
</script>

<template>
  <NuxtLink
    :to="localePath('/sponsor')"
    class="@container group relative flex h-full w-full overflow-hidden border-[1.5px] border-dashed border-(--ink2) bg-(--card) graph-paper-fine transition-colors hover:border-solid hover:border-(--signal)"
  >
    <!-- Leaderboard: one line across, stacked on a phone. -->
    <span
      v-if="format === 'leaderboard'"
      class="flex w-full items-center justify-between gap-3 px-3 @md:px-5"
    >
      <span class="min-w-0">
        <span class="block text-[15px] leading-tight font-black tracking-[-0.02em] text-(--ink) @md:text-[20px]">{{ t('sponsor.slot.title') }}</span>
        <span class="mt-0.5 block font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2) @md:text-[11px]">{{ t('sponsor.slot.terms', { price }) }}</span>
      </span>
      <span class="flex-none border-[1.5px] border-(--ink) bg-(--signal) px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-white @md:px-3 @md:text-[11px]">
        {{ t('sponsor.slot.cta') }} →
      </span>
    </span>

    <!-- Square: a small sheet. -->
    <span
      v-else-if="format === 'square'"
      class="flex w-full flex-col p-[6cqw]"
    >
      <span class="font-mono text-[3.8cqw] uppercase tracking-[.14em] text-(--signal)">{{ t('sponsor.slot.eyebrow') }}</span>
      <span class="mt-[3cqw] text-[8.5cqw] leading-[1.02] font-black tracking-[-0.03em] text-(--ink)">{{ t('sponsor.slot.title') }}</span>
      <span class="mt-[3cqw] text-[4.6cqw] leading-snug text-(--ink2)">{{ t('sponsor.slot.terms', { price }) }}</span>
      <span class="mt-auto self-start border-[1.5px] border-(--ink) bg-(--signal) px-[3.5cqw] py-[1.8cqw] font-mono text-[3.8cqw] font-semibold uppercase tracking-[.08em] text-white">
        {{ t('sponsor.slot.cta') }} →
      </span>
    </span>

    <!-- Text: a single entry. -->
    <span
      v-else
      class="flex w-full items-start gap-3 p-3 @md:gap-4 @md:p-4"
    >
      <span class="flex size-12 flex-none items-center justify-center border-[1.5px] border-dashed border-(--ink2) text-(--signal)">
        <UIcon
          name="i-lucide-megaphone"
          class="size-5"
        />
      </span>
      <span class="flex min-w-0 flex-1 flex-col self-stretch">
        <span class="line-clamp-1 text-[15px] font-black text-(--ink) @md:text-base">{{ t('sponsor.slot.title') }}</span>
        <span class="mt-0.5 line-clamp-2 text-[13px] leading-snug text-(--ink2)">{{ t('sponsor.slot.textBody', { price }) }}</span>
        <span class="mt-auto font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-(--signal) group-hover:underline">{{ t('sponsor.slot.cta') }} →</span>
      </span>
    </span>
  </NuxtLink>
</template>
