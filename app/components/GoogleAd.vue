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
 * (This is manual ad unit, NOT Auto Ads.)
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
 * Manual **responsive** ad unit attributes.
 * This is NOT "Auto Ads" – it's the standard Google responsive display unit.
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

  // Default slots by variant family; override via adSlot if you want
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

    // Rectangles / squares / content
    case 'rectangle':
    case 'square':
    case 'square-fixed':
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      a['data-ad-slot'] = props.adSlot || '7663977887'
      break
  }

  // Manual responsive unit flags
  a['data-ad-format'] = 'auto'
  a['data-full-width-responsive'] = 'true'

  if (props.adTest) a['data-adtest'] = props.adTest

  return a
}

/**
 * Responsive style: let container control width, Google handles height.
 */
function insStyleForVariant() {
  return 'display:block;width:100%;height:auto;'
}

/**
 * Tailwind-only frame classes per variant.
 * These map to Google's top-performing sizes,
 * but scale down on mobile.
 */
function frameClassesForVariant(): string[] {
  // Base ad "card" – using your CSS variables via arbitrary values
  const base = [
    'relative',
    'flex', 'items-center', 'justify-center',
    'border', 'border-dashed',
    'rounded-[var(--ui-radius)]',
    'bg-[color:var(--ui-bg-muted)]',
    'dark:bg-[color:var(--ui-bg-elevated)]',
    'border-[color:var(--ui-border)]',
    'dark:border-[color:var(--ui-border)]',
    'px-4', 'pt-7', 'pb-4',  // extra top padding for label inside
    'overflow-hidden',
    'w-full'
  ]

  switch (props.variant) {
    /**
     * 728x90 leaderboard (desktop)
     * Responsive mapping:
     * - mobile: ~320px (320x50 / 300x50)
     * - small: 468x60
     * - large: 728x90
     */
    case 'horizontal':
    case 'leaderboard':
      return [
        ...base,
        'max-w-[320px]',               // phones → mobile banner 300x50 / 320x50
        'sm:max-w-[468px]',            // tablets → 468x60
        'lg:max-w-[728px]',            // desktop → 728x90
        'min-h-[60px]'
      ]

    /**
     * 970x90 large leaderboard
     * Responsive:
     * - mobile: 320x50
     * - sm: 728x90
     * - xl: 970x90
     */
    case 'large-leaderboard':
      return [
        ...base,
        'max-w-[320px]',
        'sm:max-w-[728px]',
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
     * We keep it narrow but tall; Google will pick appropriate vertical.
     */
    case 'wide-skyscraper':
      return [
        ...base,
        'max-w-[160px]',
        'min-h-[260px]'
      ]

    /**
     * 120x600 skyscraper (narrower)
     */
    case 'skyscraper':
      return [
        ...base,
        'max-w-[120px]',
        'min-h-[260px]'
      ]

    /**
     * 300x250 medium rectangle (top performer)
     * + 336x280 large rectangle on slightly wider screens
     */
    case 'rectangle':
      return [
        ...base,
        'max-w-[300px]',       // base → 300x250
        'sm:max-w-[336px]',    // a bit wider → 336x280
        'min-h-[220px]'
      ]

    /**
     * 250x250 square; can approximate 200x200 small square on mobile
     */
    case 'square':
    case 'square-fixed':
      return [
        ...base,
        'max-w-[220px]',
        'sm:max-w-[250px]',
        'min-h-[200px]'
      ]

    /**
     * Content / in-article / in-feed / multiplex:
     * use a medium container which comfortably fits 300x250 / 336x280
     * and can expand up to ~580x400 "netboard"-ish on wide layouts.
     */
    case 'in-article':
    case 'in-feed':
    case 'multiplex':
      return [
        ...base,
        'max-w-[300px]',
        'md:max-w-[580px]',
        'min-h-[220px]'
      ]

    /**
     * Generic vertical (fallback)
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
      <!-- Ads label: border-only, inside the frame -->
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
        class="w-full h-auto overflow-hidden leading-none flex items-center justify-center"
      />
    </div>
  </div>
</template>
