<script setup lang="ts">
/**
 * The AdSense unit for a placement — the network fallback, OFF by default
 * (see app/utils/promoNetwork.ts). <PromoSlot> only renders this when
 * NUXT_PUBLIC_PROMO_NETWORK=adsense, the month has no sponsor, and the reader
 * is not on Pro, so none of those checks are repeated here.
 */
import { useIntersectionObserver, useWindowSize } from '@vueuse/core'
import { ADSENSE_CLIENT, AD_PLACEMENTS, loadPromoScript, type AdPlacement, type AdPlacementName, type AdVariant } from '~/utils/promoNetwork'

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[]
  }
}

const props = defineProps<{
  placement: AdPlacementName
}>()

const dev = import.meta.dev

// The viewport picks the variant. Rendered client-side only (the slot waits
// for the placement feed), so there is no SSR width to agree with.
const { width } = useWindowSize()
const variant = computed<AdVariant | null>(() => {
  const placement = AD_PLACEMENTS[props.placement] as AdPlacement
  const w = width.value
  return placement.variants.filter(v => w >= (v.min ?? 0) && w < (v.max ?? Number.POSITIVE_INFINITY)).at(-1) ?? null
})

const root = ref<HTMLElement | null>(null)
const insEl = ref<HTMLElement | null>(null)
const show = ref(false)
const pushed = ref(false)
const empty = ref(false)

const { stop } = useIntersectionObserver(root, ([entry]) => {
  if (entry?.isIntersecting) {
    show.value = true
    stop()
  }
}, { rootMargin: '400px' })

let fillObserver: MutationObserver | null = null
function watchFill() {
  if (!insEl.value) return
  fillObserver = new MutationObserver(() => {
    const status = insEl.value?.getAttribute('data-ad-status')
    if (status === 'unfilled') {
      empty.value = true
      fillObserver?.disconnect()
    } else if (status === 'filled') {
      fillObserver?.disconnect()
    }
  })
  fillObserver.observe(insEl.value, { attributes: true, attributeFilter: ['data-ad-status'] })
}

async function push() {
  if (pushed.value || !insEl.value) return
  try {
    await loadPromoScript()
  } catch {
    empty.value = true
    return
  }
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    pushed.value = true
    watchFill()
  } catch {
    setTimeout(push, 300)
  }
}

watch(show, async (visible) => {
  if (visible) {
    await nextTick()
    push()
  }
})

onBeforeUnmount(() => {
  stop()
  fillObserver?.disconnect()
})

const insStyle = computed(() => {
  const v = variant.value
  if (!v) return {}
  return v.width && v.height
    ? { display: 'block', width: `${v.width}px`, height: `${v.height}px`, maxWidth: '100%', marginInline: 'auto' }
    : { display: 'block', width: '100%', maxWidth: '100%', marginInline: 'auto' }
})
</script>

<template>
  <div
    v-if="variant && !empty"
    ref="root"
    class="flex w-full justify-center"
    :style="{ minHeight: `${variant.reserve}px` }"
  >
    <ins
      v-if="show"
      ref="insEl"
      class="adsbygoogle"
      :style="insStyle"
      :data-ad-client="ADSENSE_CLIENT"
      :data-ad-slot="variant.slot"
      :data-ad-format="variant.format"
      :data-ad-layout="variant.layout"
      :data-ad-layout-key="variant.layoutKey || undefined"
      :data-full-width-responsive="variant.fullWidthResponsive ? 'true' : undefined"
      :data-adtest="dev ? 'on' : undefined"
    />
  </div>
</template>
