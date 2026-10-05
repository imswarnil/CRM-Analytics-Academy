<script setup lang="ts">
/**
 * A lesson's ONE video, for every language.
 *
 * There is a single Mux asset per lesson; languages are captions, not
 * recordings. Mux generates the English captions from the audio,
 * scripts/video/captions.mjs syncs them into content-transcripts/en/, the
 * translation pipeline makes the other eleven, and the build publishes them
 * (public files for a free lesson, /api/transcript for a Pro one).
 *
 * The player is Mux's own <mux-player> web component, loaded on the client
 * only. Its HLS stream already carries Mux's English captions; every other
 * language with a transcript is added as a subtitles track (cues loaded when
 * a track is first turned on), and the reader's language — when it is not
 * English — is switched on by default. Below the player sits the transcript
 * panel, wired to it: click a line to seek, the spoken line is highlighted.
 *
 * Free lessons play by playback id alone (public policy). A Pro video passes
 * the signed `tokens` /api/lesson minted after its entitlement check.
 */
import type { PlaybackTokens, TranscriptCue } from '#shared/utils/lessonVideo'

const props = withDefaults(defineProps<{
  playbackId: string
  title?: string
  tokens?: PlaybackTokens
  /** Languages this video has a transcript in (from lesson meta). */
  transcriptLangs?: string[]
  /** Locale-free lesson route the transcripts are filed under, e.g. /saql/functions. */
  route?: string
  /** 'public' → /transcripts/<l>/<route>.vtt ; 'pro' → /api/transcript/<l>/<route> */
  transcriptSource?: 'public' | 'pro'
  /** Cues prerendered by the page for `initialLang`, so the panel is in the HTML. */
  initialCues?: TranscriptCue[]
  initialLang?: string
}>(), {
  title: '',
  tokens: undefined,
  transcriptLangs: () => [],
  route: '',
  transcriptSource: 'public',
  initialCues: () => [],
  initialLang: ''
})

const { locale, locales } = useI18n()

const langs = computed(() => props.transcriptLangs)
const pick = (want: string) => (langs.value.includes(want) ? want : langs.value.includes('en') ? 'en' : langs.value[0] ?? 'en')
const lang = ref(props.initialLang || pick(locale.value))

// Transcript text per language, fetched once.
const cache = reactive<Record<string, TranscriptCue[]>>({})
if (props.initialCues.length) cache[lang.value] = props.initialCues
const loading = ref(false)
const failed = ref(false)

function vttUrl(l: string) {
  return props.transcriptSource === 'pro'
    ? `/api/transcript/${transcriptFile(l, props.route).replace(/\.vtt$/, '')}`
    : `/transcripts/${transcriptFile(l, props.route)}`
}

async function loadCues(l: string): Promise<TranscriptCue[]> {
  if (cache[l]) return cache[l]
  const text = await $fetch<string>(vttUrl(l), { responseType: 'text' })
  cache[l] = parseVttCues(String(text))
  return cache[l]
}

watch(lang, async (l) => {
  if (cache[l] || !props.route) return
  loading.value = true
  failed.value = false
  try {
    await loadCues(l)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}, { immediate: import.meta.client })

const cues = computed(() => cache[lang.value] ?? [])
const downloadUrl = computed(() => (props.transcriptSource === 'public' && props.route ? vttUrl(lang.value) : ''))

// ---------------------------------------------------------------------------
// The player
// ---------------------------------------------------------------------------

interface MuxPlayerElement extends HTMLElement {
  currentTime: number
  play: () => Promise<void>
  textTracks?: TextTrackList
  media?: { nativeEl?: HTMLVideoElement }
}

const host = ref<HTMLElement | null>(null)
const currentTime = ref(-1)
let player: MuxPlayerElement | null = null
const added = new Map<TextTrack, string>()

const langName = (code: string) => locales.value.find(l => l.code === code)?.name ?? code

async function fillTrack(track: TextTrack, l: string) {
  if (track.cues?.length) return
  try {
    for (const c of await loadCues(l)) track.addCue(new VTTCue(c.start, c.end, c.text))
  } catch {
    // No transcript for this language right now; the track stays empty.
  }
}

function addCaptionTracks() {
  // The inner <video>'s own addTextTrack, not a <track> element: a <track>
  // with no src runs the browser's track-loading model when switched on,
  // fails to load, and drops cues added to it. A script-created track keeps them.
  const video = player?.media?.nativeEl
  if (!player || !video) return
  // Already there (and not torn down with a previous source)?
  const live = player.textTracks ? Array.from(player.textTracks) : []
  if (added.size && [...added.keys()].every(t => live.includes(t))) return
  added.clear()
  // English is already in the stream as Mux's own generated track.
  for (const l of langs.value.filter(x => x !== 'en')) {
    const track = video.addTextTrack('subtitles', langName(l), l)
    added.set(track, l)
    if (l === locale.value) {
      track.mode = 'showing'
      fillTrack(track, l)
    } else {
      track.mode = 'disabled'
    }
  }
}

// A track switched on from the captions menu loads its cues then.
function onTrackChange() {
  for (const [track, l] of added) if (track.mode === 'showing') fillTrack(track, l)
}

async function mount() {
  if (!host.value || !props.playbackId) return
  await import('@mux/mux-player')
  const el = document.createElement('mux-player') as MuxPlayerElement
  el.setAttribute('playback-id', props.playbackId)
  el.setAttribute('stream-type', 'on-demand')
  el.setAttribute('accent-color', '#2f5bea')
  // English captions from the stream stay off until asked for; the reader's
  // own language (added above) is the one switched on.
  el.setAttribute('default-hidden-captions', '')
  if (props.title) el.setAttribute('metadata-video-title', props.title)
  if (props.tokens?.token) el.setAttribute('playback-token', props.tokens.token)
  if (props.tokens?.thumbnailToken) el.setAttribute('thumbnail-token', props.tokens.thumbnailToken)
  if (props.tokens?.storyboardToken) el.setAttribute('storyboard-token', props.tokens.storyboardToken)
  el.style.cssText = 'display:block;width:100%;height:100%;--media-object-fit:contain'
  el.addEventListener('timeupdate', () => (currentTime.value = el.currentTime))
  // The tracks go on the inner <video>, which exists once the element has
  // rendered — not only after metadata loads (preload="metadata" may never
  // get there before the reader presses play).
  el.addEventListener('loadstart', addCaptionTracks)
  el.addEventListener('loadedmetadata', addCaptionTracks)
  // The stream setup can clear cues from text tracks it does not own; refill
  // the one being shown whenever playback (re)starts.
  for (const ev of ['loadedmetadata', 'play', 'seeked']) el.addEventListener(ev, onTrackChange)
  host.value.replaceChildren(el)
  player = el
  await customElements.whenDefined('mux-player')
  requestAnimationFrame(() => {
    addCaptionTracks()
    el.textTracks?.addEventListener('change', onTrackChange)
  })
}

function unmount() {
  player?.remove()
  player = null
  added.clear()
}

onMounted(mount)
onBeforeUnmount(unmount)
watch(() => [props.playbackId, props.tokens?.token], () => {
  unmount()
  mount()
})

function seek(t: number) {
  if (!player) return
  player.currentTime = t
  player.play().catch(() => {})
}
</script>

<template>
  <div class="not-prose">
    <div
      ref="host"
      class="aspect-video w-full border-[1.5px] border-(--ink) bg-(--ink)"
      :aria-label="title"
    />
    <LessonTranscript
      v-if="langs.length && route"
      v-model:lang="lang"
      :cues="cues"
      :langs="langs"
      :current-time="currentTime"
      :loading="loading"
      :failed="failed"
      :download-url="downloadUrl"
      @seek="seek"
    />
  </div>
</template>
