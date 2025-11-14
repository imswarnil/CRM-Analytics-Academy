<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'GoogleAd' })

type Variant =
  | 'large-leaderboard' | 'leaderboard' | 'small-leaderboard'
  | 'wide-skyscraper' | 'skyscraper' | 'rectangle' | 'square-fixed'
  | 'horizontal' | 'vertical' | 'square'
  | 'in-article' | 'in-feed' | 'multiplex'

interface Props {
  variant?: Variant
  adClient?: string
  adSlot?: string
  adLayout?: string
  adLayoutKey?: string
  adTest?: 'on' | 'off'
  className?: string
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
  adClient: 'ca-pub-1291242080282540',
  adTest: 'off',
  className: '',
  autoRefresh: true
})

const route = useRoute()
const hostRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const adInstance = ref<any>(null)

// Ad slot mapping for different variants
const adSlots: Record<Variant, string> = {
  'large-leaderboard': '8939839370',
  'leaderboard': '8939839370',
  'small-leaderboard': '8939839370',
  'wide-skyscraper': '3487917390',
  'skyscraper': '3487917390',
  'rectangle': '7663977887',
  'square-fixed': '7663977887',
  'horizontal': '8939839370',
  'vertical': '3487917390',
  'square': '7663977887',
  'in-article': '6501428979',
  'in-feed': '9130894804',
  'multiplex': '6808134701'
}

// Ad layout mapping
const adLayouts: Partial<Record<Variant, string>> = {
  'in-article': 'in-article'
}

// Ad layout key mapping
const adLayoutKeys: Partial<Record<Variant, string>> = {
  'in-feed': '-6v+f0-19-44+c6'
}

/* -------- Check if AdSense is loaded -------- */
function isAdSenseLoaded(): boolean {
  return !!(window as any).adsbygoogle
}

/* -------- Wait for AdSense to load -------- */
function waitForAdSense(): Promise<void> {
  return new Promise((resolve) => {
    if (isAdSenseLoaded()) {
      resolve()
      return
    }

    const checkInterval = setInterval(() => {
      if (isAdSenseLoaded()) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve()
    }, 5000)
  })
}

/* -------- Variant → attributes -------- */
function attrsForVariant() {
  const a: Record<string, string> = { 
    'data-ad-client': props.adClient!,
    'data-ad-format': 'auto'
  }

  // Use provided adSlot or fallback to default for variant
  a['data-ad-slot'] = props.adSlot || adSlots[props.variant]

  // Handle responsive variants
  if (['horizontal', 'vertical', 'square'].includes(props.variant)) {
    a['data-full-width-responsive'] = 'true'
  }

  // Handle fluid layouts
  if (props.variant === 'in-article') {
    a['data-ad-layout'] = props.adLayout || adLayouts[props.variant] || ''
    a['data-ad-format'] = 'fluid'
  }

  if (props.variant === 'in-feed') {
    a['data-ad-layout-key'] = props.adLayoutKey || adLayoutKeys[props.variant] || ''
    a['data-ad-format'] = 'fluid'
  }

  if (props.variant === 'multiplex') {
    a['data-ad-format'] = 'autorelaxed'
  }

  if (props.adTest) a['data-adtest'] = props.adTest
  return a
}

/* -------- Inline style for <ins> -------- */
function insStyleForVariant() {
  // For responsive ads, let Google handle sizing
  if (['horizontal', 'vertical', 'square', 'in-article', 'in-feed', 'multiplex'].includes(props.variant)) {
    return 'display:block;'
  }

  // Fixed sizes for non-responsive ads
  switch (props.variant) {
    case 'large-leaderboard': return 'display:inline-block;width:970px;height:90px'
    case 'leaderboard':       return 'display:inline-block;width:728px;height:90px'
    case 'small-leaderboard': return 'display:inline-block;width:320px;height:50px'
    case 'wide-skyscraper':   return 'display:inline-block;width:300px;height:600px'
    case 'skyscraper':        return 'display:inline-block;width:160px;height:600px'
    case 'rectangle':         return 'display:inline-block;width:300px;height:250px'
    case 'square-fixed':      return 'display:inline-block;width:250px;height:250px'
    default:                  return 'display:block'
  }
}

/* -------- Container classes per-variant -------- */
function containerClasses(): string {
  const baseClasses = [
    'w-full', 'flex', 'justify-center', 'items-center',
    'border', 'border-dashed', 'rounded-xl', 'p-4',
    'bg-white', 'border-neutral-200',
    'dark:bg-neutral-900', 'dark:border-neutral-800',
    'overflow-hidden', props.className
  ].join(' ')

  // Responsive width constraints
  const widthClasses = {
    'large-leaderboard': 'max-w-[970px] min-h-[90px]',
    'leaderboard': 'max-w-[728px] min-h-[90px]',
    'small-leaderboard': 'max-w-[320px] min-h-[50px]',
    'wide-skyscraper': 'max-w-[300px] min-h-[600px]',
    'skyscraper': 'max-w-[160px] min-h-[600px]',
    'rectangle': 'max-w-[300px] min-h-[250px]',
    'square-fixed': 'max-w-[250px] min-h-[250px]',
    'horizontal': 'max-w-full min-h-[90px] md:min-h-[120px]',
    'vertical': 'max-w-full min-h-[250px] md:min-h-[300px]',
    'square': 'max-w-[336px] min-h-[280px]',
    'in-article': 'max-w-full min-h-[250px]',
    'in-feed': 'max-w-full min-h-[200px]',
    'multiplex': 'max-w-full min-h-[250px]'
  }

  return `${baseClasses} ${widthClasses[props.variant]}`
}

/* -------- Destroy existing ad -------- */
function destroyAd() {
  if (hostRef.value) {
    hostRef.value.innerHTML = ''
  }
  adInstance.value = null
}

/* -------- Mount / render -------- */
async function renderAd() {
  if (!hostRef.value) return
  
  // Destroy existing ad first
  destroyAd()
  
  isLoading.value = true
  error.value = null
  
  try {
    await waitForAdSense()
    
    const host = hostRef.value

    const ins = document.createElement('ins')
    ins.className = 'adsbygoogle'
    ins.setAttribute('style', insStyleForVariant())

    const attrs = attrsForVariant()
    Object.entries(attrs).forEach(([k, v]) => ins.setAttribute(k, v))

    host.appendChild(ins)

    // Push to adsbygoogle queue
    (window as any).adsbygoogle = (window as any).adsbygoogle || []
    const queue = (window as any).adsbygoogle
    
    adInstance.value = {}
    queue.push(adInstance.value)
    
    // Small delay to ensure ad is rendered
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } catch (err) {
    error.value = 'Failed to render advertisement'
    console.error('Ad rendering error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  await renderAd()
})

// Watch for route changes to refresh ads
watch(
  () => route.path,
  async (newPath, oldPath) => {
    if (props.autoRefresh && newPath !== oldPath) {
      await nextTick()
      // Small delay to ensure page transition is complete
      setTimeout(() => {
        renderAd()
      }, 500)
    }
  }
)

// Watch for prop changes
watch(
  () => [props.variant, props.adSlot, props.adLayout, props.adLayoutKey, props.adTest],
  async () => {
    await nextTick()
    await renderAd()
  }
)

// Cleanup on unmount
onUnmounted(() => {
  destroyAd()
})
</script>

<template>
  <div :class="containerClasses()">
    <div 
      ref="hostRef" 
      class="w-full h-full flex items-center justify-center"
      :class="{ 'min-h-[50px]': isLoading }"
    >
      <div v-if="isLoading" class="text-sm text-neutral-500 dark:text-neutral-400">
        Loading advertisement...
      </div>
      <div v-else-if="error" class="text-sm text-red-500 dark:text-red-400">
        {{ error }}
      </div>
    </div>
  </div>
</template>