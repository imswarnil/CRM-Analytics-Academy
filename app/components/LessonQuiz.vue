<script setup lang="ts">
interface Question {
  q: string
  options: string[]
  answer: number
}

const props = defineProps<{
  questions: Question[]
  quizId: string
}>()

const user = useSupabaseUser()

// Selected option index per question (-1 = unanswered).
const selected = ref<number[]>(props.questions.map(() => -1))
const submitted = ref(false)

const score = computed(() =>
  props.questions.reduce((n, q, i) => n + (selected.value[i] === q.answer ? 1 : 0), 0)
)
const allAnswered = computed(() => selected.value.every(s => s >= 0))

async function submit() {
  if (!allAnswered.value || submitted.value) return
  submitted.value = true
  if (user.value) {
    // Saved via a server route (the browser client can arrive unauthenticated).
    await $fetch('/api/quiz', {
      method: 'POST',
      body: { quizId: props.quizId, score: score.value, total: props.questions.length }
    }).catch(() => {})
  }
}

function retry() {
  selected.value = props.questions.map(() => -1)
  submitted.value = false
}
</script>

<template>
  <section class="not-prose my-10 overflow-hidden rounded-xl border border-default">
    <div class="flex items-center gap-2.5 border-b border-default bg-elevated/40 px-4 py-3">
      <UIcon
        name="i-lucide-list-checks"
        class="size-5 text-primary"
      />
      <h2 class="text-sm font-semibold text-highlighted">
        Quick quiz
      </h2>
      <UBadge
        v-if="submitted"
        :color="score / questions.length >= 0.7 ? 'success' : 'warning'"
        variant="subtle"
        class="ml-auto"
      >
        {{ score }}/{{ questions.length }}
      </UBadge>
    </div>

    <div class="space-y-6 p-4">
      <div
        v-for="(question, qi) in questions"
        :key="qi"
      >
        <p class="mb-3 text-sm font-medium text-default">
          {{ qi + 1 }}. {{ question.q }}
        </p>
        <div class="space-y-2">
          <button
            v-for="(opt, oi) in question.options"
            :key="oi"
            type="button"
            :disabled="submitted"
            class="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition"
            :class="[
              selected[qi] === oi ? 'border-primary bg-primary/5' : 'border-default hover:bg-elevated',
              submitted && oi === question.answer ? 'border-success bg-success/10 text-success' : '',
              submitted && selected[qi] === oi && oi !== question.answer ? 'border-error bg-error/10 text-error' : ''
            ]"
            @click="selected[qi] = oi"
          >
            <UIcon
              :name="submitted && oi === question.answer ? 'i-lucide-check-circle-2'
                : submitted && selected[qi] === oi ? 'i-lucide-x-circle'
                  : selected[qi] === oi ? 'i-lucide-circle-dot' : 'i-lucide-circle'"
              class="size-4 shrink-0"
            />
            <span>{{ opt }}</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          v-if="!submitted"
          color="primary"
          :disabled="!allAnswered"
          @click="submit"
        >
          Submit answers
        </UButton>
        <template v-else>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-rotate-ccw"
            @click="retry"
          >
            Try again
          </UButton>
          <p class="text-sm text-muted">
            You scored <span class="font-semibold text-default">{{ score }}/{{ questions.length }}</span>.
            <span v-if="!user">Sign in to save your results.</span>
          </p>
        </template>
      </div>
    </div>
  </section>
</template>
