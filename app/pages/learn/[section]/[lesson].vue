<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()

const sectionSlug = computed(() => String(route.params.section))
const lessonSlug = computed(() => String(route.params.lesson))

const { data, error } = await useFetch(() => `/api/learn/${sectionSlug.value}/${lessonSlug.value}`)

if (error.value || !data.value?.lesson) {
  throw createError({ statusCode: 404, statusMessage: 'Lesson not found', fatal: true })
}

const section = computed(() => data.value!.section)
const lesson = computed(() => data.value!.lesson)
const prev = computed(() => data.value?.prev ?? null)
const next = computed(() => data.value?.next ?? null)

// Soft members-gate, same behaviour as markdown lessons: logged-out readers of
// an `access: members` lesson get a teaser plus a sign-in prompt.
const user = useSupabaseUser()
const locked = computed(() => lesson.value.access === 'members' && !user.value)

// Graded quizzes work here exactly as they do for markdown lessons: /api/quiz
// resolves this `/learn/...` path against the lessons table, so the answer key
// never leaves the server. quizId is keyed on the row id rather than the slug
// so renaming a lesson doesn't orphan a learner's attempt history.
const quizPath = computed(() => `/learn/${section.value.slug}/${lesson.value.slug}`)
const quizId = computed(() => `learn:${lesson.value.id}`)

useSeoMeta({
  title: () => `${lesson.value.title} — CRM Analytics Academy`,
  description: () => lesson.value.description ?? undefined,
  ogTitle: () => lesson.value.title,
  ogDescription: () => lesson.value.description ?? undefined
})
</script>

<template>
  <UContainer class="py-12">
    <article class="mx-auto max-w-3xl">
      <div class="flex flex-wrap items-center gap-2 text-sm text-dimmed">
        <UButton
          :to="localePath('/learn')"
          variant="link"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="-ml-2"
        >
          Learn
        </UButton>
        <span>/</span>
        <span class="inline-flex items-center gap-1.5 text-muted">
          <UIcon
            :name="section.icon || 'i-lucide-book-open'"
            class="size-4"
          />
          {{ section.title }}
        </span>
      </div>

      <h1 class="mt-3 text-3xl font-bold text-highlighted sm:text-4xl">
        {{ lesson.title }}
      </h1>

      <p
        v-if="lesson.description"
        class="mt-4 text-lg text-muted"
      >
        {{ lesson.description }}
      </p>

      <MembersGate :locked="locked">
        <YoutubeEmbed
          v-if="lesson.video_id && !locked"
          :id="lesson.video_id"
          :start="lesson.video_start ?? 0"
          :end="lesson.video_end ?? undefined"
          :title="lesson.title"
          class="mt-8"
        />

        <div
          v-if="lesson.body"
          class="prose prose-primary mt-8 max-w-none dark:prose-invert"
        >
          <MDC :value="lesson.body" />
        </div>
      </MembersGate>

      <!-- Same graded component the markdown curriculum uses. -->
      <LessonQuiz
        v-if="!locked && lesson.quizCount > 0"
        :path="quizPath"
        :quiz-id="quizId"
        class="mt-12"
      />

      <nav
        v-if="prev || next"
        class="mt-12 grid gap-4 border-t border-default pt-6 sm:grid-cols-2"
      >
        <NuxtLink
          v-if="prev"
          :to="localePath(`/learn/${section.slug}/${prev.slug}`)"
          class="group rounded-xl border border-default p-4 transition hover:border-primary/40"
        >
          <span class="flex items-center gap-1.5 text-xs text-dimmed">
            <UIcon
              name="i-lucide-arrow-left"
              class="size-3.5"
            />
            Previous
          </span>
          <span class="mt-1 block text-sm font-medium text-default group-hover:text-primary">
            {{ prev.title }}
          </span>
        </NuxtLink>
        <span
          v-else
          class="hidden sm:block"
        />

        <NuxtLink
          v-if="next"
          :to="localePath(`/learn/${section.slug}/${next.slug}`)"
          class="group rounded-xl border border-default p-4 text-right transition hover:border-primary/40 sm:col-start-2"
        >
          <span class="flex items-center justify-end gap-1.5 text-xs text-dimmed">
            Next
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5"
            />
          </span>
          <span class="mt-1 block text-sm font-medium text-default group-hover:text-primary">
            {{ next.title }}
          </span>
        </NuxtLink>
      </nav>
    </article>
  </UContainer>
</template>
