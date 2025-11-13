<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
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
  adLayout?: string
  adLayoutKey?: string
  adTest?: 'on' | 'off'
}>(), {
  variant: 'horizontal',
  adClient: 'ca-pub-1291242080282540'
})

const route = useRoute()
const hostRef = ref<HTMLDivElement | null>(null)

/* -------- Load AdSense once (non-async) -------- */
function ensureScript(): Promise<void> {
  return new Promise<void>((resolve) => {
    // @ts-ignore
    if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) return resolve()

    let s = document.getElementById('adsbygoogle-js') as HTMLScriptElement | null
    if (!s) {
      s = document.createElement('script')
      s.id = 'adsbygoogle-js'
      s.async = false
      s.crossOrigin = 'anonymous'
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.adClient}`
      document.head.appendChild(s)
      s.addEventListener('load', () => resolve())
      s.addEventListener('error', () => resolve())
    } else {
      resolve()
    }
  })
}

/* -------- Variant → attributes -------- */
function attrsForVariant() {
  const a: Record<string, string> = { 'data-ad-client': props.adClient! }

  switch (props.variant) {
    // Responsive (auto)
    case 'horizontal':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      a['data-ad-format'] = 'auto'
      a['data-full-width-responsive'] = 'true'
      break
    case 'vertical':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      a['data-ad-format'] = 'auto'
      a['data-full-width-responsive'] = 'true'
      break
    case 'square':
      a['data-ad-slot'] = props.adSlot || '7663977887'
      a['data-ad-format'] = 'auto'
      a['data-full-width-responsive'] = 'true'
      break

    // Fluid
    case 'in-article':
      a['data-ad-slot'] = props.adSlot || '6501428979'
      a['data-ad-layout'] = props.adLayout || 'in-article'
      a['data-ad-format'] = 'fluid'
      break
    case 'in-feed':
      a['data-ad-slot'] = props.adSlot || '9130894804'
      a['data-ad-format'] = 'fluid'
      a['data-ad-layout-key'] = props.adLayoutKey || '-6v+f0-19-44+c6'
      break
    case 'multiplex':
      a['data-ad-slot'] = props.adSlot || '6808134701'
      a['data-ad-format'] = 'autorelaxed'
      break

    // Fixed sizes
    case 'large-leaderboard':
    case 'leaderboard':
    case 'small-leaderboard':
      a['data-ad-slot'] = props.adSlot || '8939839370'
      break
    case 'wide-skyscraper':
    case 'skyscraper':
      a['data-ad-slot'] = props.adSlot || '3487917390'
      break
    case 'rectangle':
    case 'square-fixed':
      a['data-ad-slot'] = props.adSlot || '7663977887'
      break
  }

  if (props.adTest) a['data-adtest'] = props.adTest
  return a
}

/* -------- Inline style for <ins> (only fixed sizes need strict w/h) -------- */
function insStyleForVariant() {
  switch (props.variant) {
    case 'large-leaderboard': return 'display:inline-block;width:100%;height:90px'
    case 'leaderboard':       return 'display:inline-block;width:100%;height:90px'
    case 'small-leaderboard': return 'display:inline-block;width:100%;height:50px'
    case 'wide-skyscraper':   return 'display:inline-block;width:300px;height:600px'
    case 'skyscraper':        return 'display:inline-block;width:160px;height:600px'
    case 'rectangle':         return 'display:inline-block;width:300px;height:250px'
    case 'square-fixed':      return 'display:inline-block;width:250px;height:250px'
    default:                  return 'display:block' // responsive/fluid
  }
}

/* -------- Tailwind classes per-variant (frame box) -------- */
function frameClassesForVariant(): string[] {
  // Base frame styles (kept consistent with your previous look)
  const base = [
    // container look
    'border', 'border-dashed', 'rounded-xl', 'p-2',
    'bg-white', 'border-neutral-200',
    'dark:bg-neutral-900', 'dark:border-neutral-800',
    // layout
    'flex', 'justify-center', 'items-center',
    // prevent overflow + reserve some height so CLS is reduced
    'overflow-hidden'
  ]

  // Width clamps + min-h to hint layout (for responsive we use w-full)
  switch (props.variant) {
    // Responsive / fluid
    case 'horizontal':
      return [...base, 'w-full', 'max-w-full', 'min-h-[70px]', 'sm:min-h-[80px]']
    case 'vertical':
      return [...base, 'w-full', 'max-w-full', 'min-h-[200px]']
    case 'square':
      return [...base, 'w-full', 'max-w-[250px]', 'min-h-[200px]']

    case 'in-article':
      return [...base, 'w-full', 'max-w-full', 'min-h-[160px]']
    case 'in-feed':
      return [...base, 'w-full', 'max-w-full', 'min-h-[160px]']
    case 'multiplex':
      return [...base, 'w-full', 'max-w-full', 'min-h-[200px]']

    // Fixed sizes (clamp via max-w so they never overflow container)
    case 'large-leaderboard':
      return [...base, 'w-full', 'max-w-[970px]', 'min-h-[90px]']
    case 'leaderboard':
      return [...base, 'w-full', 'max-w-[728px]', 'min-h-[90px]']
    case 'small-leaderboard':
      return [...base, 'w-full', 'max-w-[320px]', 'min-h-[50px]']
    case 'wide-skyscraper':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[600px]']
    case 'skyscraper':
      return [...base, 'w-full', 'max-w-[160px]', 'min-h-[600px]']
    case 'rectangle':
      return [...base, 'w-full', 'max-w-[300px]', 'min-h-[250px]']
    case 'square-fixed':
      return [...base, 'w-full', 'max-w-[250px]', 'min-h-[250px]']
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
  try { q.push({}) } catch {}
}

onMounted(async () => {
  await nextTick()
  await ensureScript()
  await renderAd()
})

watch(
  () => [route.fullPath, props.variant, props.adSlot, props.adLayout, props.adLayoutKey],
  async () => {
    await nextTick()
    await renderAd()
  }
)
</script>

<template>
  <!-- Outer wrapper keeps ad centered and spaced -->
  <div class="w-full my-6 flex justify-center">
    <div :class="frameClassesForVariant()">
      <div ref="hostRef" class="w-full h-auto overflow-hidden leading-none" />
    </div>
  </div>
</template>
