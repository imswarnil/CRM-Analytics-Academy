<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ADSENSE_CLIENT, type AdPlacementName } from '~/utils/adsense'

const props = defineProps<{
  /** Named placement from the central config. */
  placement: AdPlacementName
}>()

const { variant, showLabel } = useAdSlot(props.placement)

const dev = import.meta.dev

// The right-rail slot doubles as a sponsor box: when AdSense doesn't fill it,
// we show a "your brand here" placeholder instead of collapsing.
const isSponsorSlot = computed(() => props.placement === 'sidebarSquare')

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
  // maxWidth: 100% keeps fixed-size units (e.g. 300px) from overflowing a
  // container narrower than that, which is what let ads spill out on phones.
  return v.width && v.height
    ? { display: 'inline-block', width: `${v.width}px`, height: `${v.height}px`, maxWidth: '100%' }
    : { display: 'block', width: '100%', maxWidth: '100%' }
})
</script>

<template>
  <div
    v-if="variant && (!empty || isSponsorSlot)"
    ref="root"
    class="ad-unit relative mx-auto my-6 is-flex is-fullwidth max-w-full is-flex-direction-column is-align-items-center is-justify-content-center gap-1.5 overflow-hidden rounded-xl border border-default bg-muted/30 p-2"
    :class="isSponsorSlot ? 'min-h-72' : ''"
    :style="reserveStyle"
    role="complementary"
    aria-label="Advertisement"
  >
    <span
      v-if="showLabel && !(empty && isSponsorSlot)"
      class="select-none text-[10px] has-text-weight-medium is-uppercase has-text-grey"
    >
      Advertisement
    </span>

    <!-- Sponsor placeholder (shown when the sidebar slot doesn't fill) -->
    <div
      v-if="empty && isSponsorSlot"
      class="is-flex size-full is-flex-direction-column is-align-items-center is-justify-content-center gap-3 rounded-lg border border-dashed border-default has-background-light p-5 has-text-centered"
    >
      <span class="select-none text-[10px] has-text-weight-medium is-uppercase has-text-grey">
        Sponsored
      </span>
      <div class="is-flex size-14 is-align-items-center is-justify-content-center rounded-2xl bg-primary/10">
        <Icon
          name="i-lucide-sparkles"
          class="size-7 has-text-primary"
        />
      </div>
      <div>
        <p class="is-size-7 has-text-weight-semibold has-text-weight-semibold">
          Your brand here
        </p>
        <p class="mt-1 is-size-7 has-text-grey">
          Reach thousands of Salesforce analysts.
        </p>
      </div>
      <UiButton
        variant="quiet"
        to="https://github.com/sponsors/crm-analytics-academy"
        target="_blank"
        icon="i-lucide-heart"
        class="rounded-full"
        size="sm"
      >
        Sponsor this project
      </UiButton>
    </div>

    <ins
      v-else-if="show"
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
