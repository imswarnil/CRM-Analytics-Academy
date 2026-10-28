<script setup lang="ts">
/**
 * Cloudflare Turnstile — the invisible "are you human" check on sign-up and
 * sign-in. Renders nothing until NUXT_PUBLIC_TURNSTILE_SITE_KEY is set; the
 * script loads only when a form that needs it is on screen. The token goes
 * to the server, which verifies it (server/utils/guard.ts).
 */
const token = defineModel<string>({ default: '' })
const siteKey = useRuntimeConfig().public.turnstileSiteKey as string
const el = ref<HTMLElement | null>(null)
let widgetId: string | undefined

interface Turnstile {
  render: (el: HTMLElement, o: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id?: string) => void
}
const api = () => (window as unknown as { turnstile?: Turnstile }).turnstile

function load(): Promise<void> {
  if (api()) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  if (!siteKey || !el.value) return
  await load().catch(() => null)
  const t = api()
  if (!t || !el.value) return
  widgetId = t.render(el.value, {
    'sitekey': siteKey,
    'appearance': 'interaction-only',
    'callback': (v: string) => { token.value = v },
    'expired-callback': () => { token.value = '' },
    'error-callback': () => { token.value = '' }
  })
})
onBeforeUnmount(() => widgetId && api()?.remove(widgetId))

defineExpose({
  reset: () => {
    token.value = ''
    if (widgetId) api()?.reset(widgetId)
  }
})
</script>

<template>
  <div
    v-if="siteKey"
    ref="el"
  />
</template>
