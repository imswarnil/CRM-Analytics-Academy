import { useWindowSize } from '@vueuse/core'
import { AD_PLACEMENTS, type AdPlacementName, type AdVariant } from '~/utils/adsense'

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[]
  }
}

/**
 * Width assumed during SSR / first client render. Keeping the first client
 * render identical to the server avoids hydration mismatches; the real width
 * takes over after mount.
 */
const SSR_WIDTH = 1280

/**
 * Resolve the active ad variant for a placement based on the current viewport.
 * Returns `null` when no variant matches (e.g. a desktop-only rail on mobile),
 * which lets the component render nothing at all.
 */
export function useAdSlot(name: AdPlacementName) {
  const placement = AD_PLACEMENTS[name]
  const { width } = useWindowSize()
  const mounted = ref(false)

  onMounted(() => {
    mounted.value = true
  })

  const effectiveWidth = computed(() => (mounted.value ? width.value : SSR_WIDTH))

  const variant = computed<AdVariant | null>(() => {
    const w = effectiveWidth.value
    const matches = placement.variants.filter(
      v => w >= (v.min ?? 0) && w < (v.max ?? Number.POSITIVE_INFINITY)
    )
    return matches.at(-1) ?? null
  })

  return {
    variant,
    showLabel: placement.label !== false
  }
}

export type { AdPlacementName }
