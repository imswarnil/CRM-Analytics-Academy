import type { PartnerCreative, PartnerFormat } from '#shared/utils/partner'
import { PROMO_PLACEMENTS, type PromoPlacementName } from '~/utils/promo'

interface PlacementFeed {
  month: string
  sponsor: { name: string } | null
  creatives: Partial<Record<PartnerFormat, PartnerCreative>>
}

/** Refetch on navigation once the copy is older than this. */
const STALE_MS = 5 * 60_000

let inflight: Promise<void> | null = null

/**
 * The month's sponsor, shared by every slot on the page: ONE request to
 * /api/placement/current per page view however many slots there are, made
 * from the browser after mount so it never blocks or alters the prerendered
 * HTML. The response is edge-cached; a client-side navigation reuses it
 * until it is five minutes old.
 */
export function usePlacementFeed() {
  const data = useState<PlacementFeed | null>('placement-feed', () => null)
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('placement-feed-status', () => 'idle')
  const fetchedAt = useState('placement-feed-at', () => 0)

  function ensure() {
    if (import.meta.server || inflight) return
    if (status.value === 'ready' && Date.now() - fetchedAt.value < STALE_MS) return
    if (status.value !== 'ready') status.value = 'loading'
    inflight = $fetch<PlacementFeed>('/api/placement/current')
      .then((res) => {
        data.value = res
        status.value = 'ready'
        fetchedAt.value = Date.now()
      })
      .catch(() => {
        // Keep the last good answer if there is one; otherwise the slots
        // fall back to the house placeholder.
        if (status.value !== 'ready') status.value = 'error'
      })
      .finally(() => {
        inflight = null
      })
  }

  return { data, status, ensure }
}

// Impressions are batched: every slot that comes into view adds its creative
// id, and one beacon carries them all shortly after (or when the page hides).
const queue: string[] = []
let timer: ReturnType<typeof setTimeout> | null = null
function flush() {
  if (timer) clearTimeout(timer)
  timer = null
  if (!queue.length) return
  const body = JSON.stringify({ ids: queue.splice(0, 20) })
  try {
    if (!navigator.sendBeacon?.('/api/placement/seen', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/placement/seen', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {})
    }
  } catch { /* counting is best effort */ }
  if (queue.length) flush()
}
let listening = false
export function trackPromoImpression(id: string) {
  if (import.meta.server) return
  queue.push(id)
  if (!listening) {
    listening = true
    addEventListener('pagehide', flush)
  }
  timer ??= setTimeout(flush, 1500)
}

/**
 * One placement's state: its format, and once the feed has answered, the
 * sponsor's creative for that format (or null → house placeholder).
 */
export function usePromoSlot(name: PromoPlacementName) {
  const format = PROMO_PLACEMENTS[name] as PartnerFormat
  const { data, status, ensure } = usePlacementFeed()

  onMounted(ensure)
  const route = useRoute()
  watch(() => route.path, ensure)

  return {
    format,
    creative: computed(() => data.value?.creatives[format] ?? null),
    ready: computed(() => status.value === 'ready' || status.value === 'error')
  }
}
