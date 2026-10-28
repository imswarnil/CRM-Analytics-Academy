<script setup lang="ts">
/**
 * Share a page: LinkedIn (where this audience is), X, WhatsApp, the phone's
 * own share sheet, or copy the link. Every shared URL carries
 * `utm_source=share&utm_medium=<network>`, and every click is recorded as a
 * `share` event, so /admin → Analytics shows which pages people spread and
 * where from.
 */
const props = withDefaults(defineProps<{
  title: string
  /** Prefilled post text; defaults to the title. */
  text?: string
  /** Path to share; defaults to the current page. */
  path?: string
  compact?: boolean
}>(), { text: '', path: '', compact: false })

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const canNative = ref(false)
onMounted(() => {
  canNative.value = typeof navigator !== 'undefined' && 'share' in navigator
})

const link = (medium: string) => `${SITE.url}${props.path || route.path}?utm_source=${medium}&utm_medium=share`
const body = computed(() => props.text || props.title)

function open(network: 'linkedin' | 'x' | 'whatsapp') {
  const url = link(network)
  const href = network === 'linkedin'
    ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${body.value}\n\n${url}`)}`
    : network === 'x'
      ? `https://x.com/intent/post?text=${encodeURIComponent(body.value)}&url=${encodeURIComponent(url)}`
      : `https://wa.me/?text=${encodeURIComponent(`${body.value} ${url}`)}`
  window.open(href, '_blank', 'noopener,noreferrer,width=640,height=640')
  useNuxtApp().$track?.('share', network)
}

async function native() {
  try {
    await navigator.share({ title: props.title, text: body.value, url: link('native') })
    useNuxtApp().$track?.('share', 'native')
  } catch { /* dismissed */ }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(link('copy'))
    toast.add({ title: t('share.copied'), icon: 'i-lucide-check' })
    useNuxtApp().$track?.('share', 'copy')
  } catch { /* clipboard blocked */ }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <span
      v-if="!compact"
      class="me-1 font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)"
    >{{ t('share.label') }}</span>
    <UButton
      icon="i-simple-icons-linkedin"
      size="xs"
      color="neutral"
      variant="outline"
      square
      :aria-label="t('share.on', { network: 'LinkedIn' })"
      @click="open('linkedin')"
    />
    <UButton
      icon="i-simple-icons-x"
      size="xs"
      color="neutral"
      variant="outline"
      square
      :aria-label="t('share.on', { network: 'X' })"
      @click="open('x')"
    />
    <UButton
      icon="i-simple-icons-whatsapp"
      size="xs"
      color="neutral"
      variant="outline"
      square
      :aria-label="t('share.on', { network: 'WhatsApp' })"
      @click="open('whatsapp')"
    />
    <ClientOnly>
      <UButton
        v-if="canNative"
        icon="i-lucide-share-2"
        size="xs"
        color="neutral"
        variant="outline"
        square
        :aria-label="t('share.more')"
        @click="native"
      />
    </ClientOnly>
    <UButton
      icon="i-lucide-link"
      size="xs"
      color="neutral"
      variant="outline"
      square
      :aria-label="t('share.copy')"
      @click="copy"
    />
  </div>
</template>
