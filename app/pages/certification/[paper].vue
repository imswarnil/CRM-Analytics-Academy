<script setup lang="ts">
/**
 * The exam runner. Behaves like the real exam: a countdown that submits when
 * it hits zero, one question at a time, flag for review, a navigator, a
 * confirm-before-submit, then a scored report by domain and a full review.
 *
 * Progress is kept in localStorage (a refresh or a closed tab resumes where it
 * was, clock included); a signed-in learner's finished attempt is saved to
 * /api/exam-attempt. No promos while the clock runs.
 *
 * The paper stays in the site's window with the navbar, but nothing else: no
 * footer, promos or pop-ups (focus mode, the whole time the page is open), and
 * while the clock runs the paper fits the viewport — the question and the
 * navigator scroll inside it, the page never does. The ✕ goes back to the
 * exam page, asking first while the clock runs. Keyboard: A–D / 1–4, ← →, F.
 */
definePageMeta({ focus: true })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn } = useAuth()

const paper = PAPERS.find(p => p.id === route.params.paper)
if (!paper) throw createError({ statusCode: 404, statusMessage: 'Paper not found', fatal: true })

const title = `${paper.title} — ${EXAM.name}`
const description = t('cert.paperDesc', { q: paper.questions, m: paper.minutes, p: EXAM.passPct })
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Docs', { title: paper.title, description, headline: t('cert.eyebrow'), spec: `${paper.questions} Q · ${paper.minutes} MIN` })

type Phase = 'intro' | 'running' | 'done'
interface Saved { answers: (number | null)[], flags: boolean[], index: number, deadline: number, startedAt: number, finishedAt?: number }
const KEY = `crma-exam-${paper.id}`

const questions = ref<BankQuestion[]>([])
const phase = ref<Phase>('intro')
const answers = ref<(number | null)[]>([])
const flags = ref<boolean[]>([])
const index = ref(0)
const deadline = ref(0)
const startedAt = ref(0)
const finishedAt = ref(0)
const now = ref(Date.now())
const confirmOpen = ref(false)
const saved = ref(false)
const resumable = ref(false)
const reviewFilter = ref<'all' | 'wrong' | 'flagged'>('all')
let timer: ReturnType<typeof setInterval> | undefined

// Focus mode for the whole page: no footer, promos or pop-ups.
const focus = useState('exam-focus', () => false)
focus.value = true
const leaveOpen = ref(false)
function close(confirmed = false) {
  if (phase.value === 'running' && !confirmed) {
    leaveOpen.value = true
    return
  }
  leaveOpen.value = false
  if (phase.value === 'running') phase.value = 'intro'
  navigateTo(localePath('/certification'))
}
function guard(e: BeforeUnloadEvent) {
  if (phase.value === 'running') e.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', guard))
onBeforeUnmount(() => {
  focus.value = false
  window.removeEventListener('beforeunload', guard)
})

onMounted(async () => {
  // The bank in the reader's language, translated by the build from English
  // (content/<locale>/exam → public/exam/<locale>.json).
  const bank = await $fetch<BankQuestion[]>(`/exam/${locale.value}.json`)
    .catch(() => $fetch<BankQuestion[]>('/exam/en.json'))
  questions.value = buildPaper(bank, paper)
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null') as Saved | null
    if (s && s.answers.length === questions.value.length) {
      if (s.finishedAt) restore(s, 'done')
      else if (s.deadline > Date.now()) resumable.value = true
    }
  } catch { /* nothing saved */ }
})
onBeforeUnmount(() => clearInterval(timer))

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ answers: answers.value, flags: flags.value, index: index.value, deadline: deadline.value, startedAt: startedAt.value, finishedAt: finishedAt.value || undefined } satisfies Saved))
  } catch { /* storage blocked: the exam still runs */ }
}
function restore(s: Saved, to: Phase) {
  answers.value = s.answers
  flags.value = s.flags
  index.value = s.index
  deadline.value = s.deadline
  startedAt.value = s.startedAt
  finishedAt.value = s.finishedAt ?? 0
  phase.value = to
  if (to === 'running') tick()
}
function tick() {
  clearInterval(timer)
  timer = setInterval(() => {
    now.value = Date.now()
    if (now.value >= deadline.value) finish()
  }, 1000)
}
function start(resume = false) {
  if (resume) {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null') as Saved
    restore(s, 'running')
    return
  }
  answers.value = questions.value.map(() => null)
  flags.value = questions.value.map(() => false)
  index.value = 0
  startedAt.value = Date.now()
  deadline.value = startedAt.value + paper!.minutes * 60_000
  finishedAt.value = 0
  saved.value = false
  phase.value = 'running'
  persist()
  tick()
  useNuxtApp().$track?.('exam_start', paper!.id)
}
watch([answers, flags, index], persist, { deep: true })

const remaining = computed(() => Math.max(0, deadline.value - now.value))
const clock = computed(() => {
  const s = Math.ceil(remaining.value / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const current = computed(() => questions.value[index.value])
const answered = computed(() => answers.value.filter(a => a !== null).length)
const flagged = computed(() => flags.value.filter(Boolean).length)

async function finish() {
  if (phase.value !== 'running') return
  clearInterval(timer)
  confirmOpen.value = false
  finishedAt.value = Date.now()
  phase.value = 'done'
  persist()
  window.scrollTo({ top: 0 })
  useNuxtApp().$track?.('exam_finish', `${paper!.id}:${pct.value}`)
  if (isSignedIn.value) {
    const res = await $fetch<{ saved: boolean }>('/api/exam-attempt', {
      method: 'POST',
      body: { paper: paper!.id, score: score.value, total: questions.value.length, seconds: Math.round((finishedAt.value - startedAt.value) / 1000), domains: byDomain.value }
    }).catch(() => null)
    saved.value = Boolean(res?.saved)
  }
}

const correct = (i: number) => answers.value[i] === questions.value[i]?.answer
const score = computed(() => questions.value.reduce((n, _, i) => n + (correct(i) ? 1 : 0), 0))
const pct = computed(() => questions.value.length ? Math.round((score.value / questions.value.length) * 100) : 0)
const passed = computed(() => pct.value >= EXAM.passPct)
const byDomain = computed(() => {
  const out: Record<string, { score: number, total: number }> = {}
  questions.value.forEach((q, i) => {
    const d = (out[q.domain] ??= { score: 0, total: 0 })
    d.total++
    if (correct(i)) d.score++
  })
  return out
})
const used = computed(() => {
  const s = Math.round((finishedAt.value - startedAt.value) / 1000)
  return `${Math.floor(s / 60)}m ${s % 60}s`
})
const reviewList = computed(() => questions.value
  .map((q, i) => ({ q, i }))
  .filter(({ i }) => reviewFilter.value === 'all' || (reviewFilter.value === 'wrong' ? !correct(i) : flags.value[i])))

const letter = (i: number) => String.fromCharCode(65 + i)
const facts = computed(() => [
  { icon: 'i-lucide-list-checks', value: paper!.questions, label: t('cert.facts.questions') },
  { icon: 'i-lucide-timer', value: paper!.minutes, label: t('cert.facts.minutes') },
  { icon: 'i-lucide-target', value: `${EXAM.passPct}%`, label: t('cert.facts.pass') }
])

// Keyboard: A–D or 1–4 answer, ← → move, F flags. Ignored while typing or in a dialog.
function onKey(e: KeyboardEvent) {
  if (phase.value !== 'running' || confirmOpen.value || leaveOpen.value || e.metaKey || e.ctrlKey || e.altKey) return
  if ((e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable]')) return
  const q = current.value
  if (!q) return
  const k = e.key.toLowerCase()
  const pick = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k)
  if (pick >= 0 && pick < q.options.length) answers.value[index.value] = pick
  else if (k === 'arrowright' && index.value < questions.value.length - 1) index.value++
  else if (k === 'arrowleft' && index.value > 0) index.value--
  else if (k === 'f') flags.value[index.value] = !flags.value[index.value]
  else return
  e.preventDefault()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
function retake() {
  try {
    localStorage.removeItem(KEY)
  } catch { /* ignore */ }
  start()
}
const shareText = computed(() => t('cert.shareResult', { pct: pct.value, paper: paper!.title }))
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--ui-header-height))] bg-(--paper)">
    <UModal
      v-model:open="leaveOpen"
      :title="t('cert.leaveTitle')"
      :description="t('cert.leaveBody')"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="leaveOpen = false"
          >
            {{ t('cert.keepGoing') }}
          </UButton>
          <UButton
            color="error"
            class="rounded-full"
            icon="i-lucide-log-out"
            @click="close(true)"
          >
            {{ t('cert.leave') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- INTRO ---------------------------------------------------------- -->
    <section
      v-if="phase === 'intro'"
      class="mx-auto max-w-2xl px-4 py-16 sm:py-24"
    >
      <NuxtLink
        :to="localePath('/certification')"
        class="inline-flex items-center gap-1 text-sm font-medium text-(--ink2) hover:text-(--ink)"
      >
        <UIcon
          name="i-lucide-chevron-left"
          class="size-4"
        />{{ t('cert.eyebrow') }}
      </NuxtLink>
      <h1 class="mt-4 text-4xl font-bold tracking-tight text-(--ink) sm:text-5xl">
        {{ paper!.title }}
      </h1>
      <p class="mt-3 text-lg text-(--ink2)">
        {{ EXAM.name }}
      </p>

      <dl class="mt-10 grid grid-cols-3 overflow-hidden rounded-3xl border border-(--line) bg-(--card)">
        <div
          v-for="f in facts"
          :key="f.label"
          class="flex flex-col items-center gap-1 border-e border-(--line) px-4 py-6 last:border-e-0"
        >
          <UIcon
            :name="f.icon"
            class="size-5 text-(--signal)"
          />
          <dd class="text-3xl font-semibold tabular-nums tracking-tight text-(--ink)">
            {{ f.value }}
          </dd>
          <dt class="text-xs font-medium text-(--ink2)">
            {{ f.label }}
          </dt>
        </div>
      </dl>

      <ul class="mt-8 space-y-3">
        <li
          v-for="i in 4"
          :key="i"
          class="flex gap-3 text-[15px] leading-relaxed text-(--ink2)"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-1 size-4 flex-none text-(--signal)"
          />{{ t(`cert.rules.${i}`) }}
        </li>
      </ul>

      <div class="mt-10 flex flex-wrap items-center gap-3">
        <UButton
          size="xl"
          class="rounded-full px-7"
          icon="i-lucide-play"
          :loading="!questions.length"
          @click="start()"
        >
          {{ t('cert.begin') }}
        </UButton>
        <UButton
          v-if="resumable"
          size="xl"
          color="neutral"
          variant="outline"
          class="rounded-full"
          icon="i-lucide-history"
          @click="start(true)"
        >
          {{ t('cert.resume') }}
        </UButton>
      </div>
      <p class="mt-5 flex items-center gap-2 text-sm text-(--ink2)">
        <UIcon
          name="i-lucide-keyboard"
          class="size-4"
        />{{ t('cert.keys') }}
      </p>
      <p
        v-if="!isSignedIn"
        class="mt-2 text-sm text-(--ink2)"
      >
        {{ t('cert.signInToSave') }}
      </p>
    </section>

    <!-- RUNNING -------------------------------------------------------- -->
    <div
      v-else-if="phase === 'running' && current"
      class="flex h-[calc(100dvh-var(--ui-header-height))] flex-col overflow-hidden"
    >
      <!-- Top bar: progress, clock, submit, close -->
      <div class="shrink-0 border-b border-(--line) bg-(--card)/80 backdrop-blur">
        <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            class="rounded-full"
            :aria-label="t('cert.close')"
            @click="close()"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-(--ink)">
              {{ t('cert.questionOf', { n: index + 1, total: questions.length }) }}
              <span class="text-(--ink2)">· {{ t('cert.answeredN', { n: answered }) }}<template v-if="flagged"> · {{ t('cert.flaggedN', { n: flagged }) }}</template></span>
            </p>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--line)">
              <div
                class="h-full rounded-full bg-(--signal) transition-[width] duration-300"
                :style="{ width: `${(answered / questions.length) * 100}%` }"
              />
            </div>
          </div>
          <span
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-semibold tabular-nums"
            :class="remaining < 600_000 ? 'bg-error/10 text-error' : 'bg-(--ice) text-(--ink)'"
            role="timer"
            :aria-label="t('cert.timeLeft')"
          >
            <UIcon
              name="i-lucide-timer"
              class="size-4"
            />{{ clock }}
          </span>
          <UButton
            class="rounded-full max-sm:hidden"
            @click="confirmOpen = true"
          >
            {{ t('cert.submit') }}
          </UButton>
        </div>
      </div>

      <div class="mx-auto grid min-h-0 w-full max-w-5xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <!-- The question -->
        <section class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-(--line) bg-(--card) shadow-[0_20px_60px_-40px_var(--navy)]">
          <div class="min-h-0 flex-1 overflow-y-auto p-6 sm:p-10">
            <div class="flex items-center justify-between gap-3">
              <span class="rounded-full bg-(--ice) px-3 py-1 text-xs font-medium text-(--ink2)">{{ DOMAINS[current.domain].label }}</span>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                :class="flags[index] ? 'bg-warning/15 text-warning' : 'text-(--ink2) hover:bg-(--ice) hover:text-(--ink)'"
                :aria-pressed="flags[index]"
                @click="flags[index] = !flags[index]"
              >
                <UIcon
                  :name="flags[index] ? 'i-lucide-flag' : 'i-lucide-flag'"
                  class="size-3.5"
                />{{ flags[index] ? t('cert.unflag') : t('cert.flag') }}
              </button>
            </div>
            <h1 class="mt-5 text-xl font-semibold leading-snug tracking-tight text-(--ink) sm:text-2xl">
              {{ current.q }}
            </h1>
            <div
              class="mt-8 space-y-3"
              role="radiogroup"
            >
              <button
                v-for="(opt, oi) in current.options"
                :key="oi"
                type="button"
                role="radio"
                :aria-checked="answers[index] === oi"
                class="group flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition-all duration-150"
                :class="answers[index] === oi ? 'border-(--signal) bg-(--signal)/8 ring-1 ring-(--signal)' : 'border-(--line) hover:border-(--ink2)/40 hover:bg-(--ice)/60'"
                @click="answers[index] = oi"
              >
                <span
                  class="flex size-8 flex-none items-center justify-center rounded-full text-sm font-semibold transition-colors"
                  :class="answers[index] === oi ? 'bg-(--signal) text-white' : 'bg-(--ice) text-(--ink2) group-hover:text-(--ink)'"
                >{{ letter(oi) }}</span>
                <span class="text-[15px] leading-relaxed text-(--ink)">{{ opt }}</span>
              </button>
            </div>
          </div>
          <footer class="flex shrink-0 items-center justify-between gap-3 border-t border-(--line) px-6 py-4">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              class="rounded-full"
              :disabled="index === 0"
              @click="index--"
            >
              {{ t('cert.prev') }}
            </UButton>
            <UButton
              v-if="index < questions.length - 1"
              trailing-icon="i-lucide-arrow-right"
              class="rounded-full"
              @click="index++"
            >
              {{ t('cert.next') }}
            </UButton>
            <UButton
              v-else
              icon="i-lucide-send"
              class="rounded-full"
              @click="confirmOpen = true"
            >
              {{ t('cert.submit') }}
            </UButton>
          </footer>
        </section>

        <!-- Navigator -->
        <aside class="min-h-0 overflow-y-auto max-lg:hidden">
          <p class="mb-3 text-xs font-medium text-(--ink2)">
            {{ t('cert.navigator') }}
          </p>
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="(_, qi) in questions"
              :key="qi"
              type="button"
              class="relative flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium tabular-nums transition-colors"
              :class="qi === index ? 'bg-(--ink) text-(--paper)' : answers[qi] !== null ? 'bg-(--signal)/15 text-(--signal) hover:bg-(--signal)/25' : 'bg-(--card) text-(--ink2) ring-1 ring-(--line) hover:ring-(--ink2)/40'"
              :aria-label="t('cert.goTo', { n: qi + 1 })"
              @click="index = qi"
            >
              {{ qi + 1 }}
              <span
                v-if="flags[qi]"
                class="absolute -end-0.5 -top-0.5 size-2 rounded-full bg-warning ring-2 ring-(--paper)"
              />
            </button>
          </div>
          <div class="mt-4 space-y-1.5 text-xs text-(--ink2)">
            <span class="flex items-center gap-2"><i class="inline-block size-2.5 rounded-sm bg-(--signal)/30" />{{ t('cert.legend.answered') }}</span>
            <span class="flex items-center gap-2"><i class="inline-block size-2.5 rounded-sm ring-1 ring-(--line)" />{{ t('cert.legend.open') }}</span>
            <span class="flex items-center gap-2"><i class="inline-block size-2.5 rounded-full bg-warning" />{{ t('cert.legend.flagged') }}</span>
          </div>
        </aside>
      </div>

      <UModal
        v-model:open="confirmOpen"
        :title="t('cert.confirmTitle')"
      >
        <template #body>
          <p class="text-(--ink2)">
            {{ t('cert.confirmBody', { open: questions.length - answered, flagged }) }}
          </p>
        </template>
        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              class="rounded-full"
              @click="confirmOpen = false"
            >
              {{ t('cert.keepGoing') }}
            </UButton>
            <UButton
              icon="i-lucide-send"
              class="rounded-full"
              @click="finish"
            >
              {{ t('cert.submitNow') }}
            </UButton>
          </div>
        </template>
      </UModal>
    </div>

    <!-- RESULTS -------------------------------------------------------- -->
    <div
      v-else-if="phase === 'done'"
      class="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6"
    >
      <section class="rounded-3xl border border-(--line) bg-(--card) p-8 text-center sm:p-12">
        <div class="relative mx-auto size-40">
          <svg
            viewBox="0 0 120 120"
            class="size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--line)"
              stroke-width="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              :stroke="passed ? 'var(--signal)' : 'var(--ui-warning)'"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="`${(pct / 100) * 326.7} 326.7`"
            />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-4xl font-semibold tabular-nums tracking-tight text-(--ink)">{{ pct }}%</span>
        </div>
        <p
          class="mt-6 text-2xl font-semibold tracking-tight"
          :class="passed ? 'text-(--signal)' : 'text-(--ink)'"
        >
          {{ passed ? t('cert.passed') : t('cert.failed', { p: EXAM.passPct }) }}
        </p>
        <p class="mt-1 text-(--ink2)">
          {{ t('cert.scoreLine', { score, total: questions.length }) }} · {{ t('cert.timeUsed', { t: used }) }}<span v-if="saved"> · {{ t('cert.saved') }}</span>
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <UButton
            icon="i-lucide-rotate-ccw"
            size="lg"
            class="rounded-full"
            @click="retake"
          >
            {{ t('cert.retake') }}
          </UButton>
          <ShareBar
            :title="paper!.title"
            :text="shareText"
            path="/certification"
            compact
          />
        </div>
      </section>

      <section class="rounded-3xl border border-(--line) bg-(--card) p-6 sm:p-8">
        <h2 class="text-lg font-semibold text-(--ink)">
          {{ t('cert.byDomain') }}
        </h2>
        <ul class="mt-5 space-y-4">
          <li
            v-for="(d, key) in byDomain"
            :key="key"
          >
            <div class="flex justify-between text-sm">
              <span class="font-medium text-(--ink)">{{ DOMAINS[key as ExamDomain].label }}</span>
              <span class="tabular-nums text-(--ink2)">{{ d.score }}/{{ d.total }} · {{ Math.round((d.score / d.total) * 100) }}%</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-(--line)">
              <div
                class="h-full rounded-full"
                :class="d.score / d.total >= EXAM.passPct / 100 ? 'bg-(--signal)' : 'bg-warning'"
                :style="{ width: `${(d.score / d.total) * 100}%` }"
              />
            </div>
          </li>
        </ul>
      </section>

      <PromoSlot unit="horizontal" />

      <section>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-(--ink)">
            {{ t('cert.review') }}
          </h2>
          <div class="inline-flex rounded-full bg-(--ice) p-1">
            <button
              v-for="f in (['all', 'wrong', 'flagged'] as const)"
              :key="f"
              type="button"
              class="rounded-full px-3.5 py-1 text-sm font-medium transition-colors"
              :class="reviewFilter === f ? 'bg-(--card) text-(--ink) shadow-sm' : 'text-(--ink2) hover:text-(--ink)'"
              @click="reviewFilter = f"
            >
              {{ t(`cert.filter.${f}`) }}
            </button>
          </div>
        </div>
        <ol class="mt-5 space-y-4">
          <li
            v-for="{ q, i } in reviewList"
            :key="q.id"
            class="rounded-3xl border border-(--line) bg-(--card) p-6"
          >
            <p class="flex flex-wrap items-center gap-2 text-xs font-medium text-(--ink2)">
              <span>{{ t('cert.questionOf', { n: i + 1, total: questions.length }) }}</span>
              <span>·</span>
              <span>{{ DOMAINS[q.domain].label }}</span>
              <span
                class="ms-auto rounded-full px-2.5 py-0.5"
                :class="correct(i) ? 'bg-(--signal)/12 text-(--signal)' : 'bg-warning/15 text-warning'"
              >{{ correct(i) ? t('cert.correct') : answers[i] === null ? t('cert.unanswered') : t('cert.incorrect') }}</span>
            </p>
            <p class="mt-3 font-semibold leading-snug text-(--ink)">
              {{ q.q }}
            </p>
            <ul class="mt-4 space-y-2 text-sm">
              <li
                v-for="(opt, oi) in q.options"
                :key="oi"
                class="flex items-start gap-3 rounded-xl px-3 py-2"
                :class="oi === q.answer ? 'bg-(--signal)/10 font-medium text-(--ink)' : oi === answers[i] ? 'bg-warning/10 text-(--ink2) line-through' : 'text-(--ink2)'"
              >
                <span class="w-4 font-semibold">{{ letter(oi) }}</span>{{ opt }}
                <UIcon
                  v-if="oi === q.answer"
                  name="i-lucide-check"
                  class="ms-auto mt-0.5 size-4 flex-none text-(--signal)"
                />
              </li>
            </ul>
          </li>
        </ol>
      </section>
    </div>

    <div
      v-else
      class="flex h-[60vh] items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin text-(--ink2)"
        :aria-label="t('cert.loading')"
      />
    </div>
  </div>
</template>
