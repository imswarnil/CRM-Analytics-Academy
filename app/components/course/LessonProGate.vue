<script setup lang="ts">
/**
 * What a Pro lesson shows after its public teaser.
 *
 * The page itself only ever holds the stub (title, teaser, navigation). For a
 * reader with Pro this fetches the real body from /api/lesson — which checks
 * entitlement on the server — and renders it, along with the quiz, interview
 * questions and a signed video. Everyone else gets the paywall. Nothing here
 * is the security boundary; the API is. This is presentation.
 */
interface ProLesson {
  markdown: string
  quiz: { q: string, options: string[], answer: number }[] | null
  interview: { q: string, a: string }[] | null
  playback?: { playbackId: string, token: string }
}

const emit = defineEmits<{ unlocked: [] }>()

const props = defineProps<{
  contentPath: string
  title: string
  mux?: string | Record<string, string>
}>()

const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { pro, loaded } = useProgress()

const lesson = ref<ProLesson | null>(null)
// The parsed body, in the shape ContentRenderer takes. Parsed here rather
// than passed to <MDC> because <MDC> only resolves globally registered
// components, and the course's own blocks (field tables, lesson links, …) are
// registered for ContentRenderer — the same renderer free lessons use.
const parsed = ref<{ body: unknown, toc?: unknown } | null>(null)
const failed = ref('')
const loading = ref(false)

async function load() {
  if (lesson.value || loading.value) return
  loading.value = true
  failed.value = ''
  try {
    const res = await $fetch<ProLesson>(`/api/lesson${props.contentPath}`)
    const { parseMarkdown } = await import('@nuxtjs/mdc/runtime')
    parsed.value = await parseMarkdown(res.markdown, { toc: { depth: 2, searchDepth: 1 } }) as { body: unknown, toc?: unknown }
    lesson.value = res
    emit('unlocked')
  } catch (e) {
    const err = e as { statusCode?: number }
    failed.value = err.statusCode === 403 ? '' : (apiError(e) || 'Could not load this lesson.')
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
      <MuxVideo
        v-if="lesson.playback"
        :ids="lesson.playback.playbackId"
        :token="lesson.playback.token"
        :title="title"
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

    <div
      v-else
      class="bp-paywalled relative my-10"
    >
      <!-- Fade the teaser into the lock so it reads as "there is more". -->
      <div
        class="pointer-events-none absolute inset-x-0 -top-24 h-24"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <div class="crosshair hatch border-[1.5px] border-(--ink) p-2">
        <div class="bg-(--card) p-6 text-center sm:p-10">
          <span class="mx-auto flex size-12 items-center justify-center border-[1.5px] border-(--ink) bg-(--ink) text-(--paper)">
            <UIcon
              name="i-lucide-lock"
              class="size-5"
            />
          </span>
          <p class="eyebrow mt-5">
            Pro lesson — locked
          </p>
          <h3 class="bp-h3 mt-2 text-(--ink)">
            The rest of this lesson is part of Pro
          </h3>
          <p class="mx-auto mt-3 max-w-md text-(--ink2)">
            Pro unlocks every Pro lesson, its quiz and interview questions, and the lesson videos —
            and pays for the rest of the course to stay free.
          </p>
          <p
            v-if="failed"
            class="mt-3 text-sm text-error"
          >
            {{ failed }}
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <UButton
              :to="localePath('/pricing')"
              size="lg"
              icon="i-lucide-sparkles"
            >
              See Pro plans
            </UButton>
            <UButton
              v-if="!isSignedIn"
              :to="{ path: localePath('/sign-in'), query: { redirect: $route.fullPath } }"
              size="lg"
              color="neutral"
              variant="outline"
            >
              I already have Pro
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="bp-paywalled my-10 h-40 border-[1.5px] border-(--ink) bg-(--card)" />
    </template>
  </ClientOnly>
</template>
