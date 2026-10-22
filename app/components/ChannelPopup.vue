<script setup lang="ts">
/**
 * A timed "subscribe on YouTube" card: shown once, after a reader has spent
 * DELAY_MS on the site in their first session, never again in that session,
 * and not again for a month once closed. Deliberately not an ad: AdSense does
 * not allow its units inside pop-ups (Vignette ads in AdSense Auto ads are
 * Google's own interstitial for that).
 */
const DELAY_MS = 45_000
const SEEN_KEY = 'crma-channel-popup'
const { t } = useI18n()
const route = useRoute()
const open = ref(false)

onMounted(() => {
  if (/^(\/[a-z]{2})?\/(admin|sign-in|sign-up)/.test(route.path)) return
  try {
    const seen = Number(localStorage.getItem(SEEN_KEY) || 0)
    if (Date.now() - seen < 30 * 86_400_000 || sessionStorage.getItem(SEEN_KEY)) return
  } catch {
    return
  }
  setTimeout(() => {
    open.value = true
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch { /* ignore */ }
  }, DELAY_MS)
})

function dismiss(reason: 'close' | 'subscribe') {
  open.value = false
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()))
  } catch { /* ignore */ }
  useNuxtApp().$track?.(reason === 'subscribe' ? 'youtube_click' : 'popup_close', 'channel-popup')
}
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="open"
        class="fixed bottom-24 start-4 z-50 w-[min(24rem,calc(100vw-2rem))] border-[1.5px] border-(--ink) bg-(--navy) text-white shadow-[8px_8px_0_var(--signal)]"
        role="dialog"
        aria-labelledby="channel-popup-title"
      >
        <div class="graph-paper-navy p-5">
          <div class="flex items-start justify-between gap-3">
            <p class="font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">
              {{ t('channel.eyebrow') }}
            </p>
            <button
              type="button"
              class="text-white/70 hover:text-white"
              :aria-label="t('channel.close')"
              @click="dismiss('close')"
            >
              <UIcon
                name="i-lucide-x"
                class="size-4"
              />
            </button>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <span class="flex size-12 flex-none items-center justify-center border-[1.5px] border-white/60 bg-[#FF0000]">
              <UIcon
                name="i-simple-icons-youtube"
                class="size-6 text-white"
              />
            </span>
            <p
              id="channel-popup-title"
              class="text-xl font-extrabold tracking-[-0.02em]"
            >
              {{ t('channel.title') }}
            </p>
          </div>
          <p class="mt-3 text-sm text-white/80">
            {{ t('channel.body') }}
          </p>
          <div class="mt-5 flex flex-wrap gap-2">
            <UButton
              :to="`${SITE.youtube}?sub_confirmation=1`"
              target="_blank"
              color="secondary"
              icon="i-simple-icons-youtube"
              @click="dismiss('subscribe')"
            >
              {{ t('channel.subscribe') }}
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
              @click="dismiss('close')"
            >
              {{ t('channel.later') }}
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
