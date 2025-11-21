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

/* -------- Load AdSense once (script tag also in app.vue) -------- */
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

/* -------- Variant → attributes (Google manual unit style) -------- */
function attrsForVariant() {
  const a: Record<string, string> = { 'data-ad-client': props.adClient! }

  // Map variants to default slots; you can override with adSlot prop
  switch (props.variant) {
    // Horizontal / leaderboard family
    case 'horizontal':
    case 'large-leaderboard':
    case 'leaderboard':
    case 'small-leaderboard':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      break

    // Skyscraper / vertical family
    case 'vertical':
    case 'wide-skyscraper':
    case 'skyscraper':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      break

    // Rectangles / squares / content style
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

/* -------- Standard IAB sizes per variant (inline-block, fixed px) -------- */
function insStyleForVariant() {
  // Google manual unit style: display:inline-block; width/height in px.
  switch (props.variant) {
    // 728 x 90 – Leaderboard
    case 'horizontal':
    case 'leaderboard':
      return 'display:inline-block;width:728px;height:90px;'

    // 970 x 90 – Large Leaderboard
    case 'large-leaderboard':
      return 'display:inline-block;width:970px;height:90px;'

    // 320 x 50 – Mobile Leaderboard
    case 'small-leaderboard':
      return 'display:inline-block;width:320px;height:50px;'

    // 300 x 600 – Wide Skyscraper / Half Page
    case 'wide-skyscraper':
      return 'display:inline-block;width:300px;height:600px;'

    // 160 x 600 – Skyscraper
    case 'skyscraper':
      return 'display:inline-block;width:160px;height:600px;'

    // 300 x 250 – Medium Rectangle
    case 'rectangle':
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      return 'display:inline-block;width:300px;height:250px;'

    // 250 x 250 – Square
    case 'square':
    case 'square-fixed':
      return 'display:inline-block;width:250px;height:250px;'
  }
}

/* -------- Tailwind classes for outer frame (layout + centering) -------- */
function frameClassesForVariant(): string[] {
  const base = ['ad-frame'] // styled in main.css with SLDS theme

  switch (props.variant) {
    case 'horizontal':
    case 'leaderboard':
      return [...base, 'w-full', 'max-w-[728px]', 'min-h-[90px]']

    case 'large-leaderboard':
      return [...base, 'w-full', 'max-w-[970px]', 'min-h-[90px]']

    case 'small-leaderboard':
      return [...base, 'w-full', 'max-w-[320px]', 'min-h-[50px]']

    case 'wide-skyscraper':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[600px]']

    case 'skyscraper':
      return [...base, 'w-full', 'max-w-[160px]', 'min-h-[600px]']

    case 'rectangle':
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[250px]']

    case 'square':
    case 'square-fixed':
      return [...base, 'w-full', 'max-w-[250px]', 'min-h-[250px]']
  }
}

/* -------- Render ad (fresh each time) -------- */
async function renderAd() {
  const host = hostRef.value
  if (!host) return

  // Clear any previous ad
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

onMounted(async () => {
  await nextTick()
  await ensureScript()
  await renderAd()
})

/* -------- Always reload ad on route change -------- */
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (!props.autoRefresh) return
    if (newPath === oldPath) return

    await nextTick()
    await ensureScript()
    await renderAd()
  }
)

/* -------- Reload when important props change -------- */
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
  <!-- Outer wrapper centers the ad frame on the page -->
  <div class="w-full my-8 flex justify-center">
    <div :class="frameClassesForVariant()">
      <!-- Border-only label sitting on the top border -->
      <span class="ad-frame__label">
        Advertisement
      </span>

      <!-- Host where AdSense injects <ins> -->
      <div
        ref="hostRef"
        class="w-full h-auto overflow-visible leading-none flex items-center justify-center"
      />
    </div>
  </div>
</template>
