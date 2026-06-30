<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  start?: number
  end?: number
}>(), {
  start: 0,
  end: undefined
})

const { t } = useI18n()

const elId = `yt-${Math.random().toString(36).slice(2)}`
const finished = ref(false)

let player: YTPlayer | null = null
let poll: ReturnType<typeof setInterval> | null = null

function loadIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
}

function stopPolling() {
  if (poll) {
    clearInterval(poll)
    poll = null
  }
}

function startPolling() {
  stopPolling()
  if (!props.end) return
  poll = setInterval(() => {
    if (!player) return
    if (player.getCurrentTime() >= props.end!) {
      player.pauseVideo()
      finished.value = true
      stopPolling()
    }
  }, 250)
}

function replay() {
  finished.value = false
  player?.seekTo(props.start, true)
  player?.playVideo()
}

onMounted(async () => {
  await loadIframeApi()
  player = new window.YT!.Player(elId, {
    videoId: props.id,
    playerVars: {
      start: props.start,
      ...(props.end ? { end: props.end } : {}),
      rel: 0
    },
    events: {
      onStateChange: (event) => {
        if (event.data === window.YT!.PlayerState.PLAYING) startPolling()
        else stopPolling()
      }
    }
  })
})

onBeforeUnmount(() => {
  stopPolling()
  player?.destroy()
})
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden rounded-2xl border border-default">
    <div
      :id="elId"
      class="size-full"
    />

    <div
      v-if="finished"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-default/90 backdrop-blur"
    >
      <UIcon
        name="i-lucide-circle-check"
        class="size-8 text-primary"
      />
      <p class="font-semibold text-highlighted">
        {{ t('video.thanksForWatching') }}
      </p>
      <UButton
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="outline"
        class="rounded-full"
        @click="replay"
      >
        {{ t('video.replay') }}
      </UButton>
    </div>
  </div>
</template>
