<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ADSENSE_CLIENT, loadPromoScript, rememberPro, type AdPlacementName } from '~/utils/promo'

const props = defineProps<{
  /** Named placement from the central config. */
  placement: AdPlacementName
}>()

const { variant, showLabel } = usePromoSlot(props.placement)

const dev = import.meta.dev

// No promos for Pro. A signed-in reader is held back until their progress
// (which carries the Pro flag) has loaded, so a Pro reader is never shown one
// for the half-second before the answer arrives. Anonymous readers are never
// Pro and are not held.
const { pro, loaded } = useProgress()
const { isSignedIn } = useAuth()
const blocked = computed(() => pro.value || (isSignedIn.value && !loaded.value))
watch([pro, loaded], ([isPro, isLoaded]) => {
  if (isLoaded || isPro) rememberPro(isPro)
}, { immediate: true })

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

async function pushAd() {
  if (pushed.value || !insEl.value || blocked.value) return
  try {
    await loadPromoScript()
  } catch {
    // Blocked by an extension or offline: collapse the slot instead of
    // leaving an empty frame behind.
    empty.value = true
    return
  }
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    pushed.value = true
    watchFill()
  } catch {
    // Script not ready yet — retry shortly.
    setTimeout(pushAd, 300)
  }
}

watch([show, blocked], async ([visible, isBlocked]) => {
  if (visible && !isBlocked) {
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
  // maxWidth: 100% keeps fixed-size units (e.g. 300px) from overflowing a
  // container narrower than that, which is what let ads spill out on phones.
  // marginInline: auto centres the unit itself; the CSS below centres the
  // iframe AdSense writes inside it, which is the part that actually drifts.
  return v.width && v.height
    ? { display: 'block', width: `${v.width}px`, height: `${v.height}px`, maxWidth: '100%', marginInline: 'auto' }
    : { display: 'block', width: '100%', maxWidth: '100%', marginInline: 'auto' }
})
</script>

<template>
  <div
    v-if="variant && !empty && !pro"
    ref="root"
    class="promo-slot relative mx-auto my-6 flex w-full max-w-full flex-col items-center justify-center gap-1.5 overflow-hidden border-[1.5px] border-dashed border-(--line) bg-(--card)/60 p-2"
    :style="reserveStyle"
    role="complementary"
    aria-label="Advertisement"
  >
    <span
      v-if="showLabel"
      class="select-none font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)"
    >
      Advertisement
    </span>

    <ins
      v-if="show && !blocked"
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
