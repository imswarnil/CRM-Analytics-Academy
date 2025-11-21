<script setup lang="ts">
import { onMounted, nextTick, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'GoogleAd' })

type Variant =
  | 'large-leaderboard' | 'leaderboard' | 'small-leaderboard'
  | 'wide-skyscraper'   | 'skyscraper'
  | 'rectangle'         | 'square-fixed'
  | 'horizontal'        | 'vertical'    | 'square'
  | 'in-article'        | 'in-feed'     | 'multiplex'

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

/* -------- Load AdSense once (script is also in app.vue) -------- */
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

/* -------- Variant → attributes (ONLY client + slot) -------- */
function attrsForVariant() {
  const a: Record<string, string> = { 'data-ad-client': props.adClient! }

  switch (props.variant) {
    // Horizontal / leaderboard family
    case 'horizontal':
    case 'large-leaderboard':
    case 'leaderboard':
    case 'small-leaderboard':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      break

    // Skyscraper family
    case 'vertical':
    case 'wide-skyscraper':
    case 'skyscraper':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      break

    // Rectangles / squares / content-style
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

/* -------- <ins> style – let ad define its own height -------- */
function insStyleForVariant() {
  return 'display:block;width:100%;height:auto;'
}

/* -------- Tailwind classes for outer frame (standard sizes) -------- */
function frameClassesForVariant(): string[] {
  const base = ['ad-frame']

  switch (props.variant) {
    // 728x90
    case 'horizontal':
    case 'leaderboard':
      return [...base, 'w-full', 'max-w-[728px]', 'min-h-[90px]']

    // 970x90
    case 'large-leaderboard':
      return [...base, 'w-full', 'max-w-[970px]', 'min-h-[90px]']

    // 320x50
    case 'small-leaderboard':
      return [...base, 'w-full', 'max-w-[320px]', 'min-h-[50px]']

    // 300x600
    case 'wide-skyscraper':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[600px]']

    // 160x600
    case 'skyscraper':
      return [...base, 'w-full', 'max-w-[160px]', 'min-h-[600px]']

    // 300x250
    case 'rectangle':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[250px]']

    // 250x250
    case 'square':
    case 'square-fixed':
      return [...base, 'w-full', 'max-w-[250px]', 'min-h-[250px]']

    // Content-style
    case 'in-article':
      return [...base, 'w-full', 'max-w-3xl', 'min-h-[200px]']
    case 'in-feed':
      return [...base, 'w-full', 'max-w-full', 'min-h-[180px]']
    case 'multiplex':
      return [...base, 'w-full', 'max-w-4xl', 'min-h-[220px]']
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
  <!-- Outer wrapper: centers the ad frame in the page -->
  <div class="w-full my-8 flex justify-center">
    <div :class="frameClassesForVariant()">
      <!-- Label on top border, only border (no bg) -->
      <span class="ad-frame__label">
        Advertisement
      </span>

      <!-- Host where AdSense injects <ins> -->
      <div
        ref="hostRef"
        class="w-full h-auto overflow-visible leading-none"
      />
    </div>
  </div>
</template>
