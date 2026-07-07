<script setup lang="ts">
// Site-styled YouTube player: native controls/branding are hidden and we drive
// playback with our own overlay. Playback is clamped to the [start, end] clip,
// and hitting the end shows a "Lesson completed" screen.
const props = withDefaults(defineProps<{
  id: string
  start?: number
  end?: number
}>(), {
  start: 0,
  end: undefined
})

const emit = defineEmits<{ completed: [] }>()

const { t } = useI18n()

const elId = `yt-${Math.random().toString(36).slice(2)}`
const ready = ref(false)
const started = ref(false)
const playing = ref(false)
const finished = ref(false)
const muted = ref(false)
const current = ref(0) // absolute seconds
const duration = ref(0) // absolute clip end

let player: YTPlayer | null = null
let raf: ReturnType<typeof setInterval> | null = null

const clipStart = computed(() => props.start ?? 0)
const clipLength = computed(() => Math.max(1, duration.value - clipStart.value))
const elapsed = computed(() => Math.max(0, current.value - clipStart.value))
const progress = computed(() => Math.min(100, (elapsed.value / clipLength.value) * 100))

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

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

function stopTicker() {
  if (raf) {
    clearInterval(raf)
    raf = null
  }
}

function startTicker() {
  stopTicker()
  raf = setInterval(() => {
    if (!player) return
    current.value = player.getCurrentTime()
    if (props.end != null && current.value >= props.end) {
      player.pauseVideo()
      if (!finished.value) emit('completed')
      finished.value = true
      playing.value = false
      stopTicker()
    }
  }, 200)
}

function togglePlay() {
  if (!player || !ready.value) return
  if (finished.value) return replay()
  if (playing.value) player.pauseVideo()
  else player.playVideo()
}

function replay() {
  finished.value = false
  started.value = true
  player?.seekTo(clipStart.value, true)
  player?.playVideo()
}

function toggleMute() {
  if (!player) return
  if (muted.value) player.unMute()
  else player.mute()
  muted.value = !muted.value
}

function scrub(event: MouseEvent) {
  if (!player || !ready.value) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const target = clipStart.value + ratio * clipLength.value
  finished.value = false
  player.seekTo(target, true)
  current.value = target
}

onMounted(async () => {
  await loadIframeApi()
  player = new window.YT!.Player(elId, {
    videoId: props.id,
    playerVars: {
      start: clipStart.value,
      ...(props.end ? { end: props.end } : {}),
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1
    },
    events: {
      onReady: (e) => {
        ready.value = true
        duration.value = props.end ?? e.target.getDuration()
        muted.value = e.target.isMuted()
      },
      onStateChange: (e) => {
        const state = e.data
        const YTS = window.YT!.PlayerState
        if (state === YTS.PLAYING) {
          started.value = true
          playing.value = true
          if (!duration.value) duration.value = props.end ?? e.target.getDuration()
          startTicker()
        } else {
          playing.value = false
          stopTicker()
          if (state === YTS.ENDED) {
            if (!finished.value) emit('completed')
            finished.value = true
          }
        }
      }
    }
  })
})

onBeforeUnmount(() => {
  stopTicker()
  player?.destroy()
})
</script>

<template>
  <div class="not-prose group relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-default bg-black">
    <div
      :id="elId"
      class="pointer-events-none size-full"
    />

    <!-- Click-to-toggle overlay (sits above the iframe, below the control bar) -->
    <button
      type="button"
      class="absolute inset-0 z-10 flex items-center justify-center"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="togglePlay"
    >
      <span
        v-if="!playing && !finished"
        class="flex size-16 items-center justify-center rounded-full bg-primary/90 text-inverted shadow-lg backdrop-blur transition group-hover:scale-105"
      >
        <UIcon
          name="i-lucide-play"
          class="ml-0.5 size-7"
        />
      </span>
    </button>

    <!-- Custom control bar -->
    <div
      v-show="started && !finished"
      class="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 opacity-0 transition group-hover:opacity-100"
      :class="{ '!opacity-100': !playing }"
    >
      <button
        type="button"
        class="shrink-0 text-white/90 hover:text-white"
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="togglePlay"
      >
        <UIcon
          :name="playing ? 'i-lucide-pause' : 'i-lucide-play'"
          class="size-5"
        />
      </button>

      <div
        class="relative h-1.5 grow cursor-pointer rounded-full bg-white/25"
        @click="scrub"
      >
        <div
          class="absolute inset-y-0 left-0 rounded-full bg-primary"
          :style="{ width: `${progress}%` }"
        />
        <div
          class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          :style="{ left: `${progress}%` }"
        />
      </div>

      <span class="shrink-0 font-mono text-xs tabular-nums text-white/80">
        {{ fmt(elapsed) }} / {{ fmt(clipLength) }}
      </span>

      <button
        type="button"
        class="shrink-0 text-white/90 hover:text-white"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <UIcon
          :name="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
          class="size-5"
        />
      </button>
    </div>

    <!-- Lesson-completed end screen -->
    <div
      v-if="finished"
      class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-default/95 backdrop-blur"
    >
      <UIcon
        name="i-lucide-circle-check"
        class="size-9 text-primary"
      />
      <p class="font-semibold text-highlighted">
        {{ t('video.lessonCompleted') }}
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
