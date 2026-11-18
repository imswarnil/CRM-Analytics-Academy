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
const { normalise, load: loadProgress } = useProgress()

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
    useNuxtApp().$track?.('quiz_submit', normalise(route.path))
    loadProgress()
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
  <section class="not-prose my-12 overflow-hidden rounded-[6px] border border-(--line) bg-(--card)">
    <header class="flex items-center gap-3 border-b border-(--line) px-6 py-4">
      <span class="flex size-10 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
        <UIcon
          name="i-lucide-clipboard-check"
          class="size-5"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-lg font-bold text-(--ink)">
          {{ t('quiz.title') }}
        </p>
        <p class="text-sm text-(--ink2)">
          {{ t('quiz.answered', { n: answeredCount, total }) }}
        </p>
      </div>
    </header>

    <ol class="divide-y divide-(--line)">
      <li
        v-for="(question, i) in questions"
        :key="i"
        class="relative p-6"
      >
        <p class="mono-label mb-2">
          {{ t('quiz.question', { n: i + 1, total }) }}
        </p>
        <p class="mb-4 text-lg font-semibold leading-snug text-(--ink)">
          {{ question.q }}
        </p>
        <div
          class="space-y-2.5"
          role="radiogroup"
        >
          <button
            v-for="(opt, oi) in question.options"
            :key="oi"
            type="button"
            role="radio"
            :aria-checked="selections[i] === oi"
            :disabled="submitted"
            class="flex w-full items-center gap-3 rounded-[6px] border p-3.5 text-start text-base leading-relaxed transition-colors"
            :class="[
              submitted && oi === question.answer ? 'border-success bg-success/10'
              : submitted && selections[i] === oi ? 'border-error bg-error/10'
                : selections[i] === oi ? 'border-(--signal) bg-(--ice)'
                  : 'border-(--line) hover:border-(--signal)/50 hover:bg-(--ice)/50'
            ]"
            @click="selections[i] = oi"
          >
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              :class="selections[i] === oi ? 'bg-(--signal) text-white' : 'bg-(--paper) text-(--ink2)'"
            >{{ String.fromCharCode(65 + oi) }}</span>
            <span class="text-(--ink)">{{ opt }}</span>
            <UIcon
              v-if="submitted && oi === question.answer"
              name="i-lucide-check"
              class="ms-auto size-5 shrink-0 text-success"
            />
          </button>
        </div>
      </li>
    </ol>

    <footer class="border-t border-(--line) p-6">
      <UButton
        v-if="!submitted"
        size="lg"
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
