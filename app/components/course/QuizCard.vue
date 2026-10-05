<script setup lang="ts">
/**
 * The graded quiz at the foot of a lesson.
 *
 * Grading happens CLIENT-SIDE on purpose. The `answer` indexes ship in the
 * page payload no matter what — quiz content is public, open-source markdown —
 * so a server-graded flow would only pretend to keep a secret the repo already
 * publishes. This is a learning site, not an exam: what matters is that the
 * dashboard rank counts only the best attempt per quiz (app.user_points), so a
 * dishonest submit gains nothing a read of the markdown would not.
 *
 * Signed-in learners get their result POSTed to /api/quiz; signed-out learners
 * see the result and an invitation to sign in so the next attempt counts.
 */
interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

const props = defineProps<{
  questions: QuizQuestion[]
}>()

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const { isSignedIn } = useAuth()
const { normalise } = useProgress()

const total = computed(() => props.questions.length)
const selections = ref<(number | undefined)[]>(props.questions.map(() => undefined))
const submitted = ref(false)
const saving = ref(false)
const saved = ref(false)

const answeredCount = computed(() => selections.value.filter(s => s !== undefined).length)
const score = computed(() =>
  props.questions.reduce((n, q, i) => n + (selections.value[i] === q.answer ? 1 : 0), 0)
)
const passed = computed(() => score.value / total.value >= 0.7)

function itemsFor(question: QuizQuestion) {
  return question.options.map((label, value) => ({ label, value }))
}

async function submit() {
  if (answeredCount.value < total.value || submitted.value) return
  submitted.value = true

  if (!isSignedIn.value) return
  saving.value = true
  try {
    await $fetch('/api/quiz', {
      method: 'POST',
      body: {
        // Locale-stripped, like progress, so a learner who switches language
        // keeps one best score per quiz rather than one per translation.
        lessonPath: normalise(route.path),
        score: score.value,
        total: total.value
      }
    })
    saved.value = true
  } catch {
    // Saving is an enhancement; the learner still has their result on screen.
  } finally {
    saving.value = false
  }
}

function retry() {
  selections.value = props.questions.map(() => undefined)
  submitted.value = false
  saved.value = false
}
</script>

<template>
  <section class="not-prose my-12 border-[1.5px] border-(--ink) bg-(--card)">
    <header class="flex items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
      <span class="flex size-9 items-center justify-center border-[1.5px] border-(--ink) bg-(--card)">
        <UIcon
          name="i-lucide-clipboard-check"
          class="size-5 text-(--signal)"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="eyebrow">
          Check — {{ t('quiz.title') }}
        </p>
        <p class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
          {{ t('quiz.answered', { n: answeredCount, total }) }}
        </p>
      </div>
    </header>

    <ol class="divide-y divide-dashed divide-(--line)">
      <li
        v-for="(question, i) in questions"
        :key="i"
        class="relative p-5 transition-colors"
        :class="submitted
          ? (selections[i] === question.answer ? 'bg-success/5' : 'bg-error/5')
          : ''"
      >
        <span
          v-if="submitted"
          class="absolute inset-y-0 start-0 w-[3px]"
          :class="selections[i] === question.answer ? 'bg-success' : 'bg-error'"
        />
        <p class="mono-label mb-1">
          {{ t('quiz.question', { n: i + 1, total }) }}
        </p>
        <p class="mb-3 font-semibold text-(--ink)">
          {{ question.q }}
        </p>
        <URadioGroup
          v-model="selections[i]"
          :items="itemsFor(question)"
          :disabled="submitted"
        />
      </li>
    </ol>

    <footer class="border-t-[1.5px] border-(--ink) p-5">
      <UButton
        v-if="!submitted"
        :label="t('quiz.submit')"
        :disabled="answeredCount < total"
        @click="submit"
      />

      <UAlert
        v-else
        :color="passed ? 'success' : 'error'"
        variant="subtle"
        :icon="passed ? 'i-lucide-trophy' : 'i-lucide-rotate-ccw'"
        :title="t('quiz.score', { score, total })"
        :description="passed ? t('quiz.passed') : t('quiz.failed')"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              color="neutral"
              variant="outline"
              :label="t('quiz.retry')"
              icon="i-lucide-rotate-ccw"
              @click="retry"
            />
            <p
              v-if="isSignedIn && saved"
              class="text-sm text-(--ink2)"
            >
              {{ t('quiz.saved') }}
            </p>
            <ULink
              v-else-if="!isSignedIn"
              :to="{ path: localePath('/sign-in'), query: { redirect: $route.fullPath } }"
              class="text-sm"
            >
              {{ t('quiz.signInToSave') }}
            </ULink>
          </div>
        </template>
      </UAlert>
    </footer>
  </section>
</template>
