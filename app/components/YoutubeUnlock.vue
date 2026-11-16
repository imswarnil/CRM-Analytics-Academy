<script setup lang="ts">
/**
 * "Unlock with YouTube": checks, with Google, that the signed-in learner
 * subscribes to the channel — or subscribes them from here (mode="subscribe").
 * Google's consent opens in a popup, so this page never navigates away; the
 * popup reports back by postMessage (server/utils/youtube.ts) and progress
 * reloads with the new access level. Signed out, it asks for an account first.
 */
const props = withDefaults(defineProps<{ size?: 'md' | 'lg' | 'xl', block?: boolean }>(), { size: 'lg', block: false })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn } = useAuth()
const { access, load } = useProgress()
const busy = ref(false)
const result = ref<'' | 'verified' | 'not-subscribed' | 'error' | 'linked-elsewhere'>('')

const unlocked = computed(() => access.value === 'youtube' || access.value === 'pro')

function open(subscribe: boolean) {
  result.value = ''
  busy.value = true
  const w = 520
  const h = 640
  const popup = window.open(`/api/youtube/connect${subscribe ? '?subscribe=1' : ''}`, 'crma-youtube',
    `width=${w},height=${h},left=${Math.round(screenX + (outerWidth - w) / 2)},top=${Math.round(screenY + (outerHeight - h) / 2)}`)
  if (!popup) {
    // Popups blocked: do it in this tab; the callback lands on the dashboard.
    location.href = `/api/youtube/connect${subscribe ? '?subscribe=1' : ''}`
    return
  }
  const timer = setInterval(() => {
    if (popup.closed) {
      clearInterval(timer)
      busy.value = false
    }
  }, 500)
}

function onMessage(e: MessageEvent) {
  if (e.origin !== location.origin || (e.data as { type?: string })?.type !== 'crma-youtube') return
  const d = e.data as { ok: boolean, subscribed?: boolean, error?: string }
  busy.value = false
  result.value = d.ok ? (d.subscribed ? 'verified' : 'not-subscribed') : d.error === 'linked-elsewhere' ? 'linked-elsewhere' : 'error'
  if (d.ok && d.subscribed) useNuxtApp().$track?.('youtube_verified')
  load()
}
onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <div
    class="flex flex-col gap-2"
    :class="props.block ? 'w-full' : ''"
  >
    <ClientOnly>
      <p
        v-if="unlocked"
        class="flex items-center gap-2 text-sm font-semibold text-(--signal)"
      >
        <UIcon
          name="i-lucide-badge-check"
          class="size-5"
        />{{ t('youtube.unlocked') }}
      </p>
      <UButton
        v-else-if="!isSignedIn"
        :to="{ path: localePath('/sign-up'), query: { redirect: route.fullPath } }"
        :size="props.size"
        :block="props.block"
        icon="i-lucide-user-plus"
      >
        {{ t('youtube.signInFirst') }}
      </UButton>
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <UButton
          :size="props.size"
          :block="props.block"
          :loading="busy"
          icon="i-simple-icons-youtube"
          class="bg-[#FF0000] text-white hover:bg-[#d90000]"
          @click="open(true)"
        >
          {{ t('youtube.subscribe') }}
        </UButton>
        <UButton
          :size="props.size"
          :block="props.block"
          :disabled="busy"
          color="neutral"
          variant="outline"
          icon="i-lucide-badge-check"
          @click="open(false)"
        >
          {{ t('youtube.verify') }}
        </UButton>
      </div>
      <p
        v-if="result && result !== 'verified'"
        class="text-sm"
        :class="result === 'error' || result === 'linked-elsewhere' ? 'text-error' : 'text-(--ink2)'"
      >
        {{ t(`youtube.result.${result}`) }}
      </p>
    </ClientOnly>
  </div>
</template>
