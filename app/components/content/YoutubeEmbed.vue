<script setup lang="ts">
// Fully custom, site-styled player. The YouTube iframe is created only when the
// learner clicks our poster, so the YouTube title/branding never shows and the
// video never preloads (important for gated lessons). Native controls are
// hidden; we drive play/scrub/mute with our own overlay and show a
// "Lesson completed" end screen at the clip's end time.
const props = withDefaults(defineProps<{
  id: string
  start?: number
  end?: number
  title?: string
}>(), {
  start: 0,
  end: undefined,
  title: ''
})

const emit = defineEmits<{ completed: [] }>()

const { t } = useI18n()

const elId = `yt-${Math.random().toString(36).slice(2)}`
const activated = ref(false)
const ready = ref(false)
const playing = ref(false)
const finished = ref(false)
const muted = ref(false)
const current = ref(0)
const duration = ref(0)

let player: YTPlayer | null = null
let raf: ReturnType<typeof setInterval> | null = null

const poster = computed(() => `https://i.ytimg.com/vi/${props.id}/hqdefault.jpg`)
const clipStart = computed(() => props.start ?? 0)
const clipLength = computed(() => {
  const end = duration.value || props.end || 0
  return Math.max(1, end - clipStart.value)
})
const elapsed = computed(() => Math.max(0, current.value - clipStart.value))
const progress = computed(() => Math.min(100, (elapsed.value / clipLength.value) * 100))

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function loadIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve()
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

async function activate() {
  activated.value = true
  await loadIframeApi()
  await nextTick()
  player = new window.YT!.Player(elId, {
    videoId: props.id,
    playerVars: {
      start: clipStart.value,
      ...(props.end ? { end: props.end } : {}),
      autoplay: 1,
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
        const YTS = window.YT!.PlayerState
        if (e.data === YTS.PLAYING) {
          playing.value = true
          if (!duration.value) duration.value = props.end ?? e.target.getDuration()
          startTicker()
        } else {
          playing.value = false
          stopTicker()
          if (e.data === YTS.ENDED) {
            if (!finished.value) emit('completed')
            finished.value = true
          }
        }
      }
    }
  })
}

function togglePlay() {
  if (!player || !ready.value) return
  if (finished.value) return replay()
  if (playing.value) player.pauseVideo()
  else player.playVideo()
}

function replay() {
  finished.value = false
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
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const target = clipStart.value + ratio * clipLength.value
  finished.value = false
  player.seekTo(target, true)
  current.value = target
}

onBeforeUnmount(() => {
  stopTicker()
  player?.destroy()
})
</script>

<template>
  <div class="not-prose group relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-default bg-black shadow-lg">
    <!-- Custom poster / thumbnail (before activation) -->
    <button
      v-if="!activated"
      type="button"
      class="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
      :aria-label="`Play${title ? ': ' + title : ' lesson video'}`"
      @click="activate"
    >
      <img
        :src="poster"
        alt=""
        class="absolute inset-0 size-full scale-105 object-cover blur-[1px]"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

      <span class="relative flex size-20 items-center justify-center rounded-full bg-primary text-inverted shadow-2xl transition group-hover:scale-110">
        <span class="absolute inset-0 animate-ping rounded-full bg-primary/40" />
        <UIcon
          name="i-lucide-play"
          class="relative ml-1 size-9"
        />
      </span>

      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-left">
        <div class="min-w-0">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-inverted">
            <UIcon
              name="i-lucide-graduation-cap"
              class="size-3.5"
            />
            Lesson video
          </span>
          <p
            v-if="title"
            class="mt-2 line-clamp-2 max-w-lg text-lg font-bold text-white drop-shadow"
          >
            {{ title }}
          </p>
        </div>
        <span
          v-if="props.end"
          class="shrink-0 rounded-md bg-black/60 px-2 py-1 font-mono text-xs text-white/90"
        >
          {{ fmt(clipLength) }}
        </span>
      </div>
    </button>

    <!-- Player -->
    <div
      :id="elId"
      class="pointer-events-none size-full"
    />

    <!-- Click-to-toggle overlay -->
    <button
      v-if="activated && !finished"
      type="button"
      class="absolute inset-0 z-10 flex items-center justify-center"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="togglePlay"
    >
      <span
        v-if="!playing"
        class="flex size-16 items-center justify-center rounded-full bg-primary/90 text-inverted shadow-lg backdrop-blur"
      >
        <UIcon
          name="i-lucide-play"
          class="ml-0.5 size-7"
        />
      </span>
    </button>

    <!-- Custom control bar -->
    <div
      v-show="activated && !finished"
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
      class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-default/95 backdrop-blur"
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
