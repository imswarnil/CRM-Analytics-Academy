<script setup lang="ts">
/**
 * A promo slot. Shows, in order of preference:
 *
 *   1. this month's sponsor creative for the slot's format (labelled
 *      "Sponsored", rel="sponsored", clicks through a counting redirect,
 *      an impression is counted once it is half in view);
 *   2. the AdSense unit — ONLY if NUXT_PUBLIC_PROMO_NETWORK=adsense (off);
 *   3. the house placeholder, "Promote your brand here", linking to /sponsor.
 *
 * The box for the slot's format is reserved from the first server render
 * (PROMO_BOX), and all three fill exactly that box, so nothing shifts when
 * the sponsor data arrives. Nothing is shown to Pro readers.
 */
import { useIntersectionObserver } from '@vueuse/core'
import { PROMO_BOX, rememberPro, type PromoPlacementName } from '~/utils/promo'

const props = defineProps<{
  /** Named placement — see PROMO_PLACEMENTS in app/utils/promo.ts. */
  placement: PromoPlacementName
}>()

const { t } = useI18n()
const { format, creative, ready } = usePromoSlot(props.placement)
const network = useRuntimeConfig().public.promoNetwork === 'adsense'

// No promos for Pro. A signed-in reader is held back until their progress
// (which carries the Pro flag) has loaded, so a Pro reader is never shown
// one for the half-second before the answer arrives.
const { pro, loaded } = useProgress()
const { isSignedIn } = useAuth()
const held = computed(() => isSignedIn.value && !loaded.value)
watch([pro, loaded], ([isPro, isLoaded]) => {
  if (isLoaded || isPro) rememberPro(isPro)
}, { immediate: true })

const showing = computed<'skeleton' | 'creative' | 'network' | 'house'>(() => {
  if (!ready.value || held.value) return 'skeleton'
  if (creative.value) return 'creative'
  return network ? 'network' : 'house'
})

// One impression per creative per page (path) per slot, when half visible.
const box = ref<HTMLElement | null>(null)
const route = useRoute()
const counted = new Set<string>()
useIntersectionObserver(box, ([entry]) => {
  const c = creative.value
  if (!entry?.isIntersecting || showing.value !== 'creative' || !c) return
  const key = `${c.id}|${route.path}`
  if (counted.has(key)) return
  counted.add(key)
  trackPromoImpression(c.id)
}, { threshold: 0.5 })
</script>

<template>
  <aside
    v-if="!pro"
    class="promo-slot my-6 w-full"
    :aria-label="t('sponsor.slot.aria')"
  >
    <p class="mb-1 flex h-4 items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)">
      <span>{{ showing === 'creative' ? t('sponsor.slot.label') : t('sponsor.slot.labelOpen') }}</span>
      <span
        v-if="showing === 'creative' && creative"
        class="truncate"
      >{{ creative.sponsor }}</span>
    </p>
    <div
      v-if="showing === 'network'"
      class="w-full"
    >
      <LazyPromoNetwork :placement="placement" />
    </div>
    <div
      v-else
      ref="box"
      :class="PROMO_BOX[format]"
    >
      <PromoCreative
        v-if="showing === 'creative' && creative"
        :creative="creative"
        :href="`/api/placement/go/${creative.id}`"
      />
      <PromoHouse
        v-else-if="showing === 'house'"
        :format="format"
      />
      <div
        v-else
        class="h-full w-full border-[1.5px] border-dashed border-(--line) bg-(--card)/60"
        aria-hidden="true"
      />
    </div>
  </aside>
</template>
