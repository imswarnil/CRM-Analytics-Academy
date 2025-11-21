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
  /** Visual / layout variant */
  variant?: Variant
  /** AdSense client ID */
  adClient?: string
  /** Optional: override slot ID from AdSense UI */
  adSlot?: string
  /** 'on' for test ads; remove in production */
  adTest?: 'on' | 'off'
  /** Reload ad on every route change */
  autoRefresh?: boolean
}>(), {
  variant: 'horizontal',
  adClient: 'ca-pub-1291242080282540',
  autoRefresh: true
})

const route = useRoute()
const hostRef = ref<HTMLDivElement | null>(null)
const adRendered = ref(false)

/**
 * Ensure AdSense script is loaded once.
 * This is for **manual ad units**, NOT Google Auto Ads.
 */
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

/**
 * Attributes for a **manual responsive** unit.
 * This is NOT "Auto Ads", it's the standard responsive display ad:
 *
 * <ins class="adsbygoogle"
 *      style="display:block"
 *      data-ad-client="ca-pub-XXXX"
 *      data-ad-slot="YYYY"
 *      data-ad-format="auto"
 *      data-full-width-responsive="true"></ins>
 */
function attrsForVariant() {
  const a: Record<string, string> = {
    'data-ad-client': props.adClient!
  }

  // Default slots by family – override via :ad-slot if you want
  switch (props.variant) {
    // Horizontal / leaderboards
    case 'horizontal':
    case 'leaderboard':
    case 'large-leaderboard':
    case 'small-leaderboard':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      break

    // Vertical / skyscrapers
    case 'vertical':
    case 'wide-skyscraper':
    case 'skyscraper':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      break

    // Rectangles / squares / content-style
    case 'rectangle':
    case 'square':
    case 'square-fixed':
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      a['data-ad-slot'] = props.adSlot || '7663977887'
      break
  }

  // Responsive manual unit flags (still **manual placement**, not Auto Ads)
  a['data-full-width-responsive'] = 'true'

  if (props.adTest) a['data-adtest'] = props.adTest

  return a
}

/**
 * Let container control width, AdSense controls height.
 */
function insStyleForVariant() {
  return 'display:block;width:100%;'
}

/**
 * Tailwind-only layout for the ad frame.
 * Sizes are based on Google’s top-performing sizes:
 * - 728x90, 970x90, 320x50, 300x250, 336x280, 160x600, 250x250, etc.
 *
 * We give **hints** via max-widths:
 *  - mobile: ~320
 *  - sm: 468 / 336 / 250 etc.
 *  - md / lg / xl: 728 / 970 / 580 etc.
 */
function frameClassesForVariant(): string[] {
  const base = [
    'relative',
    'flex', 'items-center', 'justify-center',
    'border', 'border-dashed',
    'rounded-[var(--ui-radius)]',
    'bg-[color:var(--ui-bg-muted)]',
    'dark:bg-[color:var(--ui-bg-elevated)]',
    'border-[color:var(--ui-border)]',
    'dark:border-[color:var(--ui-border)]',
    'px-4', 'pt-7', 'pb-4',   // extra top padding for label inside
    'overflow-hidden',
    'w-full'
  ]

  switch (props.variant) {
    /**
     * 728x90 leaderboard (top performer)
     * - mobile: 320x50
     * - sm: 468x60
     * - md+: 728x90
     */
    case 'horizontal':
    case 'leaderboard':
      return [
        ...base,
        'max-w-[320px]',        // mobile → 300/320x50
        'sm:max-w-[468px]',     // tablet → 468x60
        'md:max-w-[728px]',     // desktop → 728x90
        'min-h-[60px]'
      ]

    /**
     * 970x90 large leaderboard
     * - mobile: 320x50
     * - md: 728x90
     * - xl: 970x90
     */
    case 'large-leaderboard':
      return [
        ...base,
        'max-w-[320px]',
        'sm:max-w-[468px]',
        'md:max-w-[728px]',
        'xl:max-w-[970px]',
        'min-h-[60px]'
      ]

    /**
     * 320x50 mobile leaderboard
     */
    case 'small-leaderboard':
      return [
        ...base,
        'max-w-[320px]',
        'min-h-[50px]'
      ]

    /**
     * 160x600 wide skyscraper (top performer)
     */
    case 'wide-skyscraper':
      return [
        ...base,
        'max-w-[160px]',
        'min-h-[260px]'
      ]

    /**
     * 120x600 skyscraper (narrow)
     */
    case 'skyscraper':
      return [
        ...base,
        'max-w-[120px]',
        'min-h-[260px]'
      ]

    /**
     * 300x250 medium rectangle + 336x280 on slightly wider screens
     */
    case 'rectangle':
      return [
        ...base,
        'max-w-[300px]',      // 300x250
        'sm:max-w-[336px]',   // 336x280
        'min-h-[220px]'
      ]

    /**
     * 250x250 square / small rectangles
     */
    case 'square':
    case 'square-fixed':
      return [
        ...base,
        'max-w-[220px]',      // ~200x200 small square
        'sm:max-w-[250px]',   // 250x250 square
        'min-h-[200px]'
      ]

    /**
     * Content / feed / multiplex:
     * - base: 300x250 / 336x280
     * - md+: up to ~580x400 "netboard"-ish
     */
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      return [
        ...base,
        'max-w-[300px]',
        'sm:max-w-[336px]',
        'md:max-w-[580px]',
        'min-h-[220px]'
      ]

    /**
     * Generic vertical fallback
     */
    case 'vertical':
      return [
        ...base,
        'max-w-[200px]',
        'min-h-[260px]'
      ]
  }
}

/**
 * Render a fresh ad:
 * - clear host
 * - create <ins class="adsbygoogle">
 * - set attrs + style
 * - push to adsbygoogle queue
 */
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

onMounted(async () => {
  await nextTick()
  await ensureScript()
  await renderAd()
})

/**
 * Always load a fresh ad on route change.
 */
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

/**
 * Reload if key props change.
 */
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
  <!-- Outer wrapper centers the ad frame in the page -->
  <div class="w-full my-8 flex justify-center">
    <div :class="frameClassesForVariant()">
      <!-- Ads label inside the border -->
      <span
        class="absolute top-2 left-1/2 -translate-x-1/2
               px-2 py-[2px]
               text-[0.625rem] tracking-[0.12em] uppercase
               border border-dashed rounded-full
               bg-transparent
               text-[color:var(--ui-text-muted)]
               border-[color:var(--ui-border)]
               pointer-events-none whitespace-nowrap z-10"
      >
        Advertisement
      </span>

      <!-- Host where AdSense injects the <ins> -->
      <div
        ref="hostRef"
        class="w-full overflow-hidden leading-none flex items-center justify-center"
      />
    </div>
  </div>
</template>
