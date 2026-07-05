import { useEventListener } from '@vueuse/core'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Captures the browser's install prompt once (Chrome/Edge/Android fire
// `beforeinstallprompt`; iOS Safari never does — there's no programmatic
// install there). Shared across the app via useState so only one listener
// is ever attached and any component can trigger the saved prompt.
export function usePwaInstall() {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>('pwa-install-prompt', () => null)
  const installed = useState('pwa-installed', () => false)

  if (import.meta.client && !window.matchMedia('(display-mode: standalone)').matches) {
    useEventListener(window, 'beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e as BeforeInstallPromptEvent
    })
    useEventListener(window, 'appinstalled', () => {
      installed.value = true
      deferredPrompt.value = null
    })
  }

  async function promptInstall() {
    const evt = deferredPrompt.value
    if (!evt) return
    await evt.prompt()
    const { outcome } = await evt.userChoice
    if (outcome === 'accepted') installed.value = true
    deferredPrompt.value = null
  }

  return { canInstall: computed(() => !!deferredPrompt.value), installed, promptInstall }
}
