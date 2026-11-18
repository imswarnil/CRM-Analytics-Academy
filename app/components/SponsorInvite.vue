<script setup lang="ts">
/**
 * The sponsor slot, unsold: an invitation to sponsor the Academy, in the spot
 * a sponsor's card will take. Hidden for Pro members (no promos for them).
 * Named "sponsor", never "ad" — filter lists block names containing "ad".
 */
const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { t } = useI18n()
const localePath = useLocalePath()
const promoFree = usePromoFree()
</script>

<template>
  <ClientOnly>
    <NuxtLink
      v-if="!promoFree"
      :to="localePath('/sponsor')"
      class="group block rounded-[6px] border border-dashed border-(--signal)/50 bg-(--ice)/40 transition-colors hover:border-(--signal) hover:bg-(--ice)"
      :class="props.compact ? 'p-4' : 'p-6'"
    >
      <p class="mono-label">
        {{ t('sponsor.slotLabel') }}
      </p>
      <p
        class="mt-2 font-bold text-(--ink) group-hover:text-(--signal)"
        :class="props.compact ? 'text-base' : 'text-lg'"
      >
        {{ t('sponsor.slotTitle') }}
      </p>
      <p class="mt-1 text-sm text-(--ink2)">
        {{ t('sponsor.slotBody') }}
      </p>
      <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-(--signal)">
        {{ t('sponsor.slotCta') }}
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </NuxtLink>
  </ClientOnly>
</template>
