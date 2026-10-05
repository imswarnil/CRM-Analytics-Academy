<script setup lang="ts">
/**
 * The transcript panel under a lesson video: the cues of one language as
 * readable paragraphs, each with its timestamp. Click a line to play from
 * there; the line being spoken is highlighted; search, copy and language
 * switching are built in. Collapsible, remembered per reader.
 *
 * Rendered on the server too (the page passes the cues it prerendered), so
 * the words are in the HTML for readers without JavaScript and for search
 * engines — which is half of why a transcript exists.
 */
import type { TranscriptCue } from '#shared/utils/lessonVideo'

const props = withDefaults(defineProps<{
  cues: TranscriptCue[]
  langs: string[]
  currentTime?: number
  loading?: boolean
  failed?: boolean
  /** Public .vtt of the current language, for the download link (free lessons only). */
  downloadUrl?: string
}>(), {
  currentTime: -1,
  loading: false,
  failed: false,
  downloadUrl: ''
})

const lang = defineModel<string>('lang', { required: true })
const emit = defineEmits<{ seek: [seconds: number] }>()

const { t, locales } = useI18n()
const open = useCookie<boolean>('bp-transcript-open', { default: () => true, sameSite: 'lax' })
const query = ref('')
const copied = ref(false)
const scroller = ref<HTMLElement | null>(null)

const langName = (code: string) => locales.value.find(l => l.code === code)?.name ?? code

interface Para {
  start: number
  cues: { i: number, cue: TranscriptCue }[]
}

// Cues are subtitle-sized fragments; paragraphs are what a reader wants. A new
// paragraph starts at a pause, or at a sentence end once one is long enough.
const paragraphs = computed<Para[]>(() => {
  const out: Para[] = []
  let cur: Para | null = null
  props.cues.forEach((cue, i) => {
    const prev = props.cues[i - 1]
    const pause = prev ? cue.start - prev.end > 1.5 : true
    const sentenceDone = prev ? /[.!?。！？۔]["')\]]?$/.test(prev.text) : false
    if (!cur || pause || (sentenceDone && cur.cues.length >= 4) || cur.cues.length >= 10) {
      cur = { start: cue.start, cues: [] }
      out.push(cur)
    }
    cur.cues.push({ i, cue })
  })
  return out
})

const needle = computed(() => query.value.trim().toLocaleLowerCase())
const matches = (text: string) => needle.value && text.toLocaleLowerCase().includes(needle.value)
const matchCount = computed(() => (needle.value ? props.cues.filter(c => matches(c.text)).length : 0))
const visible = computed(() => (needle.value
  ? paragraphs.value.filter(p => p.cues.some(c => matches(c.cue.text)))
  : paragraphs.value))

/** Split a cue's text around the search term so matches can be marked. */
function pieces(text: string) {
  if (!needle.value) return [{ text, hit: false }]
  const out: { text: string, hit: boolean }[] = []
  const lower = text.toLocaleLowerCase()
  let at = 0
  for (let i = lower.indexOf(needle.value); i !== -1; i = lower.indexOf(needle.value, at)) {
    if (i > at) out.push({ text: text.slice(at, i), hit: false })
    out.push({ text: text.slice(i, i + needle.value.length), hit: true })
    at = i + needle.value.length
  }
  if (at < text.length) out.push({ text: text.slice(at), hit: false })
  return out
}

const active = computed(() => {
  const now = props.currentTime
  if (now < 0) return -1
  return props.cues.findIndex(c => now >= c.start && now < c.end)
})

// Keep the spoken line in view inside the panel — the panel scrolls, never the page.
watch(active, (i) => {
  const box = scroller.value
  if (i < 0 || !box || needle.value) return
  const el = box.querySelector<HTMLElement>(`[data-cue="${i}"]`)
  if (!el) return
  const top = el.offsetTop - box.offsetTop
  if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 40) {
    box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: 'smooth' })
  }
})

async function copy() {
  const text = paragraphs.value
    .map(p => `[${formatTimestamp(p.start)}] ${p.cues.map(c => c.cue.text).join(' ')}`)
    .join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    // Clipboard refused (insecure context, permissions): nothing to do.
  }
}
</script>

<template>
  <section
    class="not-prose border-[1.5px] border-t-0 border-(--ink) bg-(--card)"
    :aria-label="t('transcript.title')"
  >
    <div class="flex flex-wrap items-center gap-2 border-b border-dashed border-(--line) px-3 py-2">
      <button
        type="button"
        class="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.1em] hover:text-(--signal)"
        :aria-expanded="open"
        @click="open = !open"
      >
        <UIcon
          name="i-lucide-captions"
          class="size-4 text-(--signal)"
        />
        {{ t('transcript.title') }}
        <UIcon
          name="i-lucide-chevron-down"
          class="size-3.5 transition-transform"
          :class="open ? 'rotate-180' : ''"
        />
        <span class="sr-only">{{ open ? t('transcript.hide') : t('transcript.show') }}</span>
      </button>

      <div
        v-show="open"
        class="ms-auto flex flex-wrap items-center gap-2"
      >
        <label
          v-if="langs.length > 1"
          class="flex items-center gap-1"
        >
          <span class="sr-only">{{ t('transcript.language') }}</span>
          <select
            v-model="lang"
            class="border-[1.5px] border-(--ink) bg-(--paper) px-2 py-1 font-mono text-[11px] uppercase tracking-[.06em]"
          >
            <option
              v-for="l in langs"
              :key="l"
              :value="l"
            >
              {{ langName(l) }}
            </option>
          </select>
        </label>
        <UInput
          v-model="query"
          size="xs"
          icon="i-lucide-search"
          :placeholder="t('transcript.search')"
          :aria-label="t('transcript.search')"
          class="w-44"
        />
        <span
          v-if="needle"
          class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)"
        >{{ t('transcript.matches', matchCount) }}</span>
        <UButton
          size="xs"
          color="neutral"
          variant="outline"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :label="copied ? t('transcript.copied') : t('transcript.copy')"
          :disabled="!cues.length"
          @click="copy"
        />
        <UButton
          v-if="downloadUrl"
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-download"
          :to="downloadUrl"
          :aria-label="t('transcript.download')"
          external
          download
        />
      </div>
    </div>

    <div
      v-show="open"
      ref="scroller"
      class="max-h-96 overflow-y-auto px-4 py-3"
    >
      <p
        v-if="loading && !cues.length"
        class="text-sm text-(--ink2)"
      >
        {{ t('transcript.loading') }}
      </p>
      <p
        v-else-if="failed && !cues.length"
        class="text-sm text-(--ink2)"
      >
        {{ t('transcript.unavailable') }}
      </p>
      <div
        v-for="p in visible"
        :key="p.start"
        class="flex gap-3 py-1.5"
      >
        <button
          type="button"
          class="mt-0.5 h-fit shrink-0 border border-(--ink) px-1.5 font-mono text-[10px] tabular-nums hover:bg-(--signal) hover:text-white"
          :aria-label="t('transcript.jumpTo', { time: formatTimestamp(p.start) })"
          @click="emit('seek', p.start)"
        >
          {{ formatTimestamp(p.start) }}
        </button>
        <p class="min-w-0 text-sm leading-relaxed text-(--ink)">
          <template
            v-for="c in p.cues"
            :key="c.i"
          >
            <span
              :data-cue="c.i"
              class="cursor-pointer decoration-(--signal) underline-offset-2 hover:underline"
              :class="c.i === active ? 'bg-(--ice) text-(--ink) shadow-[inset_0_-2px_0_var(--signal)]' : ''"
              @click="emit('seek', c.cue.start)"
            ><template
              v-for="(piece, k) in pieces(c.cue.text)"
              :key="k"
            ><mark
              v-if="piece.hit"
              class="bg-(--glow) text-(--ink)"
            >{{ piece.text }}</mark><template v-else>{{ piece.text }}</template></template></span>{{ ' ' }}
          </template>
        </p>
      </div>
      <p
        v-if="cues.length"
        class="mt-2 border-t border-dashed border-(--line) pt-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)"
      >
        {{ t('transcript.note') }}
      </p>
    </div>
  </section>
</template>
