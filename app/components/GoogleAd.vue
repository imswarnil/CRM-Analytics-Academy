<script setup lang="ts">
import { onMounted, nextTick, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'GoogleAd' })

type Variant =
  | 'large-leaderboard' | 'leaderboard' | 'small-leaderboard'
  | 'wide-skyscraper' | 'skyscraper' | 'rectangle' | 'square-fixed'
  | 'horizontal' | 'vertical' | 'square'
  | 'in-article' | 'in-feed' | 'multiplex'

const props = withDefaults(defineProps<{
  variant?: Variant
  adClient?: string
  adSlot?: string
  adTest?: 'on' | 'off'
  autoRefresh?: boolean
}>(), {
  variant: 'horizontal',
  adClient: 'ca-pub-1291242080282540',
  autoRefresh: true
})

const route = useRoute()
const hostRef = ref<HTMLDivElement | null>(null)
const adRendered = ref(false)

/* -------- Load AdSense once (uses global script from app.vue) -------- */
function ensureScript(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined') return resolve()

    // @ts-ignore
    if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) return resolve()

    const existing = document.getElementById('adsbygoogle-js') as HTMLScriptElement | null
    if (existing) {
      if ((existing as any)._adsLoaded) return resolve()

      existing.addEventListener('load', () => {
        ;(existing as any)._adsLoaded = true
        resolve()
      })
      existing.addEventListener('error', () => resolve())
      return
    }

    // Fallback if somehow missing
    const s = document.createElement('script')
    s.id = 'adsbygoogle-js'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.adClient}`
    s.addEventListener('load', () => {
      ;(s as any)._adsLoaded = true
      resolve()
    })
    s.addEventListener('error', () => resolve())
    document.head.appendChild(s)
  })
}

/* -------- Variant → attributes (NO data-ad-format etc) -------- */
function attrsForVariant() {
  const a: Record<string, string> = { 'data-ad-client': props.adClient! }

  switch (props.variant) {
    case 'horizontal':
    case 'large-leaderboard':
    case 'leaderboard':
    case 'small-leaderboard':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      break

    case 'vertical':
    case 'wide-skyscraper':
    case 'skyscraper':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      break

    case 'square':
    case 'rectangle':
    case 'square-fixed':
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      a['data-ad-slot'] = props.adSlot || '7663977887'
      break
  }

  if (props.adTest) a['data-adtest'] = props.adTest
  return a
}

/* -------- Inline style for <ins> (let container control size) -------- */
function insStyleForVariant() {
  // We let Tailwind + .ad-frame handle min-height & width
  // Just make <ins> fill the available box.
  return 'display:block;width:100%;height:100%;'
}

/* -------- Tailwind classes per-variant (outer frame box) -------- */
function frameClassesForVariant(): string[] {
  const base = [
    'ad-frame',
    'w-full'
  ]

  switch (props.variant) {
    // Responsive-ish units: horizontal / article / feed / multiplex
    case 'horizontal':
      return [...base, 'max-w-5xl', 'min-h-[80px]', 'sm:min-h-[100px]']
    case 'in-article':
      return [...base, 'max-w-3xl', 'min-h-[180px]']
    case 'in-feed':
      return [...base, 'max-w-full', 'min-h-[160px]']
    case 'multiplex':
      return [...base, 'max-w-4xl', 'min-h-[220px]']

    // Vertical / side units
    case 'vertical':
      return [...base, 'max-w-xs', 'min-h-[220px]']
    case 'wide-skyscraper':
      return [...base, 'max-w-[300px]', 'min-h-[600px]']
    case 'skyscraper':
      return [...base, 'max-w-[160px]', 'min-h-[600px]']

    // Squares / rectangles
    case 'square':
      return [...base, 'max-w-[260px]', 'min-h-[220px]']
    case 'rectangle':
      return [...base, 'max-w-[300px]', 'min-h-[250px]']
    case 'square-fixed':
      return [...base, 'max-w-[250px]', 'min-h-[250px]']

    // Leaderboards
    case 'large-leaderboard':
      return [...base, 'max-w-[970px]', 'min-h-[90px]']
    case 'leaderboard':
      return [...base, 'max-w-[728px]', 'min-h-[90px]']
    case 'small-leaderboard':
      return [...base, 'max-w-[320px]', 'min-h-[50px]']
  }
}

/* -------- Mount / render -------- */
async function renderAd() {
  const host = hostRef.value
  if (!host) return

  host.innerHTML = ''

  const ins = document.createElement('ins')
  ins.className = 'adsbygoogle'
  ins.setAttribute('style', insStyleForVariant())

  const attrs = attrsForVariant()
  Object.entries(attrs).forEach(([k, v]) => ins.setAttribute(k, v))

  host.appendChild(ins)

  // @ts-ignore
  const q = (window.adsbygoogle = window.adsbygoogle || [])
  try {
    q.push({})
    adRendered.value = true
  } catch (e) {
    console.error('AdSense error:', e)
  }
}

/* -------- Refresh ad on route change -------- */
async function refreshAd() {
  if (!adRendered.value) return

  // @ts-ignore
  const q = window.adsbygoogle
  if (q && q.length) {
    try {
      q.push({})
    } catch (e) {
      console.error('AdSense refresh error:', e)
    }
  }
}

onMounted(async () => {
  await nextTick()
  await ensureScript()
  await renderAd()
})

watch(
  () => route.path,
  async (newPath, oldPath) => {
    if (props.autoRefresh && newPath !== oldPath) {
      await nextTick()
      setTimeout(() => {
        refreshAd()
      }, 100)
    }
  }
)

watch(
  () => [props.variant, props.adSlot, props.adTest],
  async () => {
    await nextTick()
    await renderAd()
  }
)

onUnmounted(() => {
  if (hostRef.value) {
    hostRef.value.innerHTML = ''
  }
})
</script>

<template>
  <!-- Outer wrapper keeps ad centered and spaced from content -->
  <div class="w-full my-8 flex justify-center">
    <div :class="frameClassesForVariant()">
      <!-- Label on dashed border, top-center -->
      <span class="ad-frame__label">
        Advertisement
      </span>

      <!-- Host where AdSense injects the <ins> -->
      <div
        ref="hostRef"
        class="w-full h-full overflow-hidden leading-none"
      />
    </div>
  </div>
</template>
