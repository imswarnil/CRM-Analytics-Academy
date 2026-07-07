<script setup lang="ts">
// Exam-style graded quiz. Answers never reach the browser: we fetch an
// answer-free question set from /api/quiz and post the learner's choices back
// for server-side grading. A failed retry pulls a *new* set (rotated per
// attempt on the server).
const props = defineProps<{
  path: string
  quizId: string
}>()

const emit = defineEmits<{ passed: [boolean] }>()

const user = useSupabaseUser()
const localePath = useLocalePath()
const route = useRoute()

interface QuestionView { q: string, options: string[] }
interface SetResponse {
  token: string
  total: number
  poolSize: number
  passScore?: number
  alreadyPassed: boolean
  questions: QuestionView[]
}
interface GradeResponse {
  score: number
  total: number
  passed: boolean
  passScore: number
  results: boolean[]
  correctAnswers: number[]
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

const loading = ref(true)
const loadError = ref(false)
const questions = ref<QuestionView[]>([])
const token = ref('')
const passScore = ref(85)
const selected = ref<number[]>([])
const current = ref(0)
const submitting = ref(false)
const result = ref<GradeResponse | null>(null)

const total = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[current.value])
const answeredCount = computed(() => selected.value.filter(s => s >= 0).length)
const allAnswered = computed(() => total.value > 0 && answeredCount.value === total.value)
const answeredPct = computed(() => (total.value ? (answeredCount.value / total.value) * 100 : 0))
const scorePct = computed(() => (result.value ? Math.round((result.value.score / result.value.total) * 100) : 0))
// Circumference for the SVG score ring (r = 52).
const ring = computed(() => {
  const c = 2 * Math.PI * 52
  return { c, offset: c - (scorePct.value / 100) * c }
})

async function loadSet() {
  loading.value = true
  loadError.value = false
  result.value = null
  current.value = 0
  try {
    const data = await $fetch<SetResponse>('/api/quiz', {
      params: { path: props.path, quizId: props.quizId }
    })
    questions.value = data.questions
    token.value = data.token
    if (typeof data.passScore === 'number') passScore.value = data.passScore
    selected.value = data.questions.map(() => -1)
    if (data.alreadyPassed) emit('passed', true)
  } catch {
    loadError.value = true
  }
  loading.value = false
}

function choose(oi: number) {
  if (result.value) return
  selected.value[current.value] = oi
}

function go(i: number) {
  current.value = Math.min(Math.max(0, i), total.value - 1)
}

async function submit() {
  if (!allAnswered.value || submitting.value || !user.value) return
  submitting.value = true
  try {
    const res = await $fetch<GradeResponse>('/api/quiz', {
      method: 'POST',
      body: { path: props.path, quizId: props.quizId, token: token.value, answers: selected.value }
    })
    result.value = res
    passScore.value = res.passScore
    emit('passed', res.passed)
  } catch {
    loadError.value = true
  }
  submitting.value = false
}

function retry() {
  loadSet()
}

onMounted(loadSet)
</script>

<template>
  <section class="not-prose my-10 overflow-hidden rounded-2xl border border-default bg-default shadow-sm">
    <!-- Exam header -->
    <div class="flex flex-wrap items-center gap-3 border-b border-default bg-elevated/50 px-5 py-4">
      <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10">
        <UIcon
          name="i-lucide-graduation-cap"
          class="size-6 text-primary"
        />
      </div>
      <div class="min-w-0">
        <h2 class="text-base font-bold text-highlighted">
          Graded exam
        </h2>
        <p class="text-xs text-muted">
          {{ passScore }}% to pass · {{ total || '—' }} questions
        </p>
      </div>
      <UBadge
        v-if="result"
        :color="result.passed ? 'success' : 'error'"
        variant="subtle"
        size="lg"
        class="ml-auto"
      >
        {{ result.passed ? 'Passed' : 'Not passed' }} · {{ scorePct }}%
      </UBadge>
    </div>

    <!-- Loading / error -->
    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 py-16 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 animate-spin"
      />
      Preparing your exam…
    </div>
    <p
      v-else-if="loadError"
      class="py-16 text-center text-sm text-muted"
    >
      Couldn’t load the exam. Please refresh the page.
    </p>

    <!-- Sign-in gate -->
    <div
      v-else-if="!user"
      class="flex flex-col items-center gap-4 px-6 py-14 text-center"
    >
      <UIcon
        name="i-lucide-lock"
        class="size-8 text-muted"
      />
      <div>
        <p class="font-semibold text-highlighted">
          Sign in to take the graded exam
        </p>
        <p class="mt-1 text-sm text-muted">
          Your score is graded securely and tracked in your profile.
        </p>
      </div>
      <UButton
        :to="localePath('/login') + `?redirect=${encodeURIComponent(route.fullPath)}`"
        color="primary"
        icon="i-lucide-log-in"
      >
        Sign in
      </UButton>
    </div>

    <!-- Results -->
    <div
      v-else-if="result"
      class="p-5 sm:p-6"
    >
      <div class="flex flex-col items-center gap-4 rounded-xl border border-default bg-elevated/30 py-8">
        <div class="relative size-32">
          <svg
            class="size-32 -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              stroke-width="10"
              class="text-elevated"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="ring.c"
              :stroke-dashoffset="ring.offset"
              :class="result.passed ? 'text-success' : 'text-error'"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-3xl font-bold text-highlighted">{{ scorePct }}%</span>
            <span class="text-xs text-muted">{{ result.score }}/{{ result.total }}</span>
          </div>
        </div>
        <p
          class="flex items-center gap-2 text-lg font-semibold"
          :class="result.passed ? 'text-success' : 'text-error'"
        >
          <UIcon
            :name="result.passed ? 'i-lucide-party-popper' : 'i-lucide-circle-alert'"
            class="size-5"
          />
          {{ result.passed ? 'You passed!' : `You need ${passScore}% to pass` }}
        </p>
        <UButton
          v-if="!result.passed"
          color="primary"
          icon="i-lucide-rotate-ccw"
          @click="retry"
        >
          Try new questions
        </UButton>
      </div>

      <!-- Review -->
      <div class="mt-6 space-y-4">
        <h3 class="text-sm font-semibold text-highlighted">
          Review
        </h3>
        <div
          v-for="(question, qi) in questions"
          :key="qi"
          class="rounded-xl border border-default p-4"
        >
          <p class="mb-3 flex items-start gap-2 text-sm font-medium text-default">
            <UIcon
              :name="result.results[qi] ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
              class="mt-0.5 size-4 shrink-0"
              :class="result.results[qi] ? 'text-success' : 'text-error'"
            />
            <span>{{ qi + 1 }}. {{ question.q }}</span>
          </p>
          <div class="space-y-1.5 pl-6">
            <div
              v-for="(opt, oi) in question.options"
              :key="oi"
              class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm"
              :class="[
                oi === result.correctAnswers[qi] ? 'bg-success/10 text-success' : '',
                selected[qi] === oi && oi !== result.correctAnswers[qi] ? 'bg-error/10 text-error' : 'text-muted'
              ]"
            >
              <span class="font-mono text-xs">{{ LETTERS[oi] }}</span>
              <span>{{ opt }}</span>
              <UIcon
                v-if="oi === result.correctAnswers[qi]"
                name="i-lucide-check"
                class="ml-auto size-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam in progress -->
    <div
      v-else
      class="p-5 sm:p-6"
    >
      <!-- Progress -->
      <div class="mb-5">
        <div class="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Question {{ current + 1 }} of {{ total }}</span>
          <span>{{ answeredCount }}/{{ total }} answered</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-elevated">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${answeredPct}%` }"
          />
        </div>
      </div>

      <!-- Question navigator -->
      <div class="mb-5 flex flex-wrap gap-1.5">
        <button
          v-for="(q, i) in questions"
          :key="i"
          type="button"
          class="size-7 rounded-md border text-xs font-medium transition"
          :class="[
            i === current ? 'border-primary bg-primary text-inverted'
            : (selected[i] ?? -1) >= 0 ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-default text-muted hover:bg-elevated'
          ]"
          @click="go(i)"
        >
          {{ i + 1 }}
        </button>
      </div>

      <!-- Current question -->
      <div v-if="currentQuestion">
        <p class="mb-4 text-lg font-semibold leading-snug text-highlighted">
          {{ currentQuestion.q }}
        </p>
        <div class="space-y-2.5">
          <button
            v-for="(opt, oi) in currentQuestion.options"
            :key="oi"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition"
            :class="selected[current] === oi
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-default hover:border-primary/40 hover:bg-elevated'"
            @click="choose(oi)"
          >
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition"
              :class="selected[current] === oi ? 'bg-primary text-inverted' : 'bg-elevated text-muted'"
            >
              {{ LETTERS[oi] }}
            </span>
            <span class="text-default">{{ opt }}</span>
          </button>
        </div>
      </div>

      <!-- Nav / submit -->
      <div class="mt-6 flex items-center justify-between gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-left"
          :disabled="current === 0"
          @click="go(current - 1)"
        >
          Previous
        </UButton>

        <UButton
          v-if="current < total - 1"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-right"
          @click="go(current + 1)"
        >
          Next
        </UButton>
        <UButton
          v-else
          color="primary"
          icon="i-lucide-send"
          :loading="submitting"
          :disabled="!allAnswered"
          @click="submit"
        >
          {{ allAnswered ? 'Submit exam' : `Answer all ${total} to submit` }}
        </UButton>
      </div>
    </div>
  </section>
</template>
