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

      <!--
        Read-only quiz preview. Grading for builder (DB-authored) lessons isn't
        wired up yet — /api/quiz only knows about the markdown curriculum — so we
        show the questions without scoring rather than faking a result.
      -->
      <section
        v-if="!locked && lesson.quizCount > 0"
        class="mt-12 rounded-2xl border border-default bg-elevated/40 p-6"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-clipboard-list"
            class="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div>
            <h2 class="font-semibold text-highlighted">
              Quiz preview ({{ lesson.quizCount }} {{ lesson.quizCount === 1 ? 'question' : 'questions' }})
            </h2>
            <p class="mt-1 text-sm text-muted">
              Preview only — graded quizzes for these lessons aren't available yet, so
              answers aren't checked or saved.
            </p>
          </div>
        </div>

        <ol class="mt-6 space-y-6">
          <li
            v-for="(question, qIndex) in lesson.quiz ?? []"
            :key="qIndex"
          >
            <p class="text-sm font-medium text-highlighted">
              {{ qIndex + 1 }}. {{ question.q }}
            </p>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="(option, oIndex) in question.options ?? []"
                :key="oIndex"
                class="flex items-start gap-2 text-sm text-muted"
              >
                <span class="mt-0.5 font-mono text-xs text-dimmed">
                  {{ String.fromCharCode(65 + oIndex) }}.
                </span>
                <span>{{ option }}</span>
              </li>
            </ul>
          </li>
        </ol>
      </section>

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
