<script setup lang="ts">
/**
 * `::pro-locked{id="<locale>/<route>#<n>" …}` — what the build leaves where an
 * inline `::pro` block was. Never written by hand: scripts/gate-content.mjs
 * writes it, with counts of what the block holds (never its words).
 *
 * Everyone sees the locked card. A reader with Pro gets the block instead:
 * fetched from /api/lesson-block (which checks hasPro on the server, the real
 * boundary) and rendered with the same ContentRenderer as the rest of the
 * lesson, with signed playback for any video inside it.
 */
import type { PlaybackTokens } from '#shared/utils/lessonVideo'
import { MUX_PLAYBACK, parseGatedMarkdown } from '~/utils/proContent'

const props = defineProps<{
  id: string
  teaser?: string
  paragraphs?: string | number
  videos?: string | number
  code?: string | number
  tables?: string | number
  minutes?: string | number
}>()

const { t } = useI18n()
const { pro } = useProgress()

const inside = computed(() => ({
  paragraphs: Number(props.paragraphs) || 0,
  videos: Number(props.videos) || 0,
  code: Number(props.code) || 0,
  tables: Number(props.tables) || 0,
  minutes: Number(props.minutes) || 0
}))

const parsed = ref<{ body: unknown, toc?: unknown } | null>(null)
const playback = ref<Record<string, PlaybackTokens>>({})
provide(MUX_PLAYBACK, playback)
const loading = ref(false)
const failed = ref('')

async function load() {
  if (parsed.value || loading.value) return
  const [path, n] = props.id.split('#')
  if (!path || !n) return
  loading.value = true
  failed.value = ''
  try {
    const res = await $fetch<{ markdown: string, playback: Record<string, PlaybackTokens> }>(`/api/lesson-block/${path}`, { query: { n } })
    playback.value = res.playback ?? {}
    parsed.value = await parseGatedMarkdown(res.markdown)
  } catch (e) {
    // 403 = not Pro after all (an expired plan): the card is the answer.
    failed.value = (e as { statusCode?: number }).statusCode === 403 ? '' : t('pro.loadFailed')
  } finally {
    loading.value = false
  }
}

watch(pro, (isPro) => {
  if (isPro) load()
}, { immediate: true })
</script>

<template>
  <ClientOnly>
    <div
      v-if="pro && parsed"
      class="bp-paywalled bp-pro-block relative my-8 border-[1.5px] border-(--ink) bg-(--card) px-5 pb-2 pt-6"
    >
      <span class="absolute -top-3 start-4 flex items-center gap-1 border-[1.5px] border-(--ink) bg-(--ink) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-(--paper)">
        <UIcon
          name="i-lucide-sparkles"
          class="size-3"
        />
        {{ t('pro.badge') }}
      </span>
      <ContentRenderer :value="parsed" />
    </div>
    <div
      v-else-if="pro && loading"
      class="my-8 space-y-3 border-[1.5px] border-(--ink) bg-(--card) p-5"
      :aria-label="t('pro.loading')"
    >
      <USkeleton class="h-5 w-2/3" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-5/6" />
    </div>
    <CourseProLockedCard
      v-else
      kind="block"
      :teaser="teaser"
      :inside="inside"
      :error="failed"
    />
    <template #fallback>
      <CourseProLockedCard
        kind="block"
        :teaser="teaser"
        :inside="inside"
      />
    </template>
  </ClientOnly>
</template>
