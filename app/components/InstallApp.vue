<script setup lang="ts">
/**
 * "Install app": the PWA install prompt where the browser offers one
 * (Chrome, Edge, Android), and a one-line how-to on iOS Safari, which has no
 * prompt. Hidden once installed (display-mode: standalone). Installing also
 * asks the service worker to save the course for offline use.
 */
const { t } = useI18n()
type Prompt = Event & { prompt: () => Promise<void>, userChoice: Promise<{ outcome: string }> }
const deferred = shallowRef<Prompt | null>(null)
const ios = ref(false)
const installed = ref(true)
const tip = ref(false)

onMounted(() => {
  installed.value = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  ios.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred.value = e as Prompt
  })
  window.addEventListener('appinstalled', () => (installed.value = true))
})

async function install() {
  if (deferred.value) {
    await deferred.value.prompt()
    deferred.value = null
  } else {
    tip.value = !tip.value
  }
  navigator.serviceWorker?.controller?.postMessage('save-course')
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="!installed && (deferred || ios)"
      class="flex flex-col items-start gap-2"
    >
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
        @click="install"
      >
        {{ t('pwa.install') }}
      </UButton>
      <p
        v-if="tip"
        class="max-w-xs text-xs text-current/80"
      >
        {{ t('pwa.iosTip') }}
      </p>
    </div>
  </ClientOnly>
</template>
