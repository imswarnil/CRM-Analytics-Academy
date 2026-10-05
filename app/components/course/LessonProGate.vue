<script setup lang="ts">
/**
 * What a Pro lesson shows after its public teaser.
 *
 * The page itself only ever holds the stub (title, teaser, navigation). For a
 * reader with Pro this fetches the real body from /api/lesson — which checks
 * entitlement on the server — and renders it, along with the quiz, interview
 * questions and the signed video with its transcript. Everyone else gets the
 * locked card — the same CourseProLockedCard an inline `::pro` block shows, so
 * "locked" has one look and one code path. Nothing here is the security
 * boundary; the API is. This is presentation.
 */
import type { PlaybackTokens } from '#shared/utils/lessonVideo'
import { MUX_PLAYBACK, parseGatedMarkdown } from '~/utils/proContent'

interface ProLesson {
  markdown: string
  quiz: { q: string, options: string[], answer: number }[] | null
  interview: { q: string, a: string }[] | null
  playback?: PlaybackTokens
  inlinePlayback?: Record<string, PlaybackTokens>
}

const emit = defineEmits<{ unlocked: [] }>()

const props = withDefaults(defineProps<{
  contentPath: string
  title: string
  /** Locale-free route, for the video's transcripts. */
  route?: string
  transcriptLangs?: string[]
}>(), {
  route: '',
  transcriptLangs: () => []
})

const { t } = useI18n()
const { pro, loaded } = useProgress()

const lesson = ref<ProLesson | null>(null)
const parsed = ref<{ body: unknown, toc?: unknown } | null>(null)
const inlinePlayback = ref<Record<string, PlaybackTokens>>({})
provide(MUX_PLAYBACK, inlinePlayback)
const failed = ref('')
const loading = ref(false)

async function load() {
  if (lesson.value || loading.value) return
  loading.value = true
  failed.value = ''
  try {
    const res = await $fetch<ProLesson>(`/api/lesson${props.contentPath}`)
    parsed.value = await parseGatedMarkdown(res.markdown)
    inlinePlayback.value = res.inlinePlayback ?? {}
    lesson.value = res
    emit('unlocked')
  } catch (e) {
    const err = e as { statusCode?: number }
    failed.value = err.statusCode === 403 ? '' : (apiError(e) || t('pro.lessonLoadFailed'))
  } finally {
    loading.value = false
  }
}

watch([pro, loaded], ([isPro]) => {
  if (isPro) load()
}, { immediate: true })
</script>

<template>
  <ClientOnly>
    <div
      v-if="pro && lesson"
      class="bp-paywalled"
    >
      <LessonPlayer
        v-if="lesson.playback"
        class="mb-8"
        :playback-id="lesson.playback.playbackId"
        :tokens="lesson.playback"
        :title="title"
        :route="route"
        :transcript-langs="transcriptLangs"
        transcript-source="pro"
      />
      <ContentRenderer
        v-if="parsed"
        :value="parsed"
      />
      <CourseQuizCard
        v-if="lesson.quiz?.length"
        :questions="lesson.quiz"
      />
      <LessonInterview
        v-if="lesson.interview?.length"
        :items="lesson.interview"
      />
    </div>

    <div
      v-else-if="pro && loading"
      class="my-10 space-y-3"
    >
      <USkeleton class="h-6 w-2/3" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-5/6" />
      <USkeleton class="h-4 w-4/6" />
    </div>

    <CourseProLockedCard
      v-else
      kind="lesson"
      :error="failed"
    />

    <template #fallback>
      <div class="bp-paywalled my-10 h-40 border-[1.5px] border-(--ink) bg-(--card)" />
    </template>
  </ClientOnly>
</template>
