<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ADSENSE_CLIENT, type AdPlacementName } from '~/utils/adsense'

const props = defineProps<{
  /** Named placement from the central config. */
  placement: AdPlacementName
}>()

const { variant, showLabel } = useAdSlot(props.placement)

const dev = import.meta.dev

const root = ref<HTMLElement | null>(null)
const insEl = ref<HTMLElement | null>(null)
const show = ref(false) // render <ins> only once near the viewport
const pushed = ref(false) // duplicate-load guard
const empty = ref(false) // collapse on no-fill

// Lazy load: reveal when within 400px of the viewport, then stop observing.
const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (entry?.isIntersecting) {
      show.value = true
      stop()
    }
  },
  { rootMargin: '400px' }
)

let fillObserver: MutationObserver | null = null

function watchFill() {
  if (!insEl.value) return

  fillObserver = new MutationObserver(() => {
    const status = insEl.value?.getAttribute('data-ad-status')
    if (status === 'unfilled') {
      empty.value = true // graceful no-fill: remove reserved space + border
      fillObserver?.disconnect()
    } else if (status === 'filled') {
      fillObserver?.disconnect()
    }
  })
  fillObserver.observe(insEl.value, { attributes: true, attributeFilter: ['data-ad-status'] })

  // Fallback: collapse if nothing rendered after a few seconds.
  setTimeout(() => {
    if (insEl.value && insEl.value.getAttribute('data-ad-status') !== 'filled' && insEl.value.offsetHeight === 0) {
      empty.value = true
    }
  }, 4000)
}

function pushAd() {
  if (pushed.value || !insEl.value) return
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    pushed.value = true
    watchFill()
  } catch {
    // Script not ready yet — retry shortly.
    setTimeout(pushAd, 300)
  }
}

watch(show, async (visible) => {
  if (visible) {
    await nextTick()
    pushAd()
  }
})

// Reload the ad on every client-side navigation: tear down the old <ins>,
// recreate it, and push again so a fresh ad is requested per page.
const route = useRoute()
watch(() => route.fullPath, () => {
  fillObserver?.disconnect()
  pushed.value = false
  empty.value = false
  show.value = false
  nextTick(() => {
    show.value = true
  })
})

onBeforeUnmount(() => {
  stop()
  fillObserver?.disconnect()
})

const reserveStyle = computed(() => (variant.value ? { minHeight: `${variant.value.reserve}px` } : {}))

const insStyle = computed(() => {
  const v = variant.value
  if (!v) return {}
  return v.width && v.height
    ? { display: 'inline-block', width: `${v.width}px`, height: `${v.height}px` }
    : { display: 'block', width: '100%' }
})
</script>

<template>
  <div
    v-if="variant && !empty"
    ref="root"
    class="ad-unit relative mx-auto my-6 flex w-full max-w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-default bg-muted/30 p-2"
    :style="reserveStyle"
    role="complementary"
    aria-label="Advertisement"
  >
    <span
      v-if="showLabel"
      class="select-none text-[10px] font-medium uppercase tracking-widest text-muted"
    >
      Advertisement
    </span>

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
