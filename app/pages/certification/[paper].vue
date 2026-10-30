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
 * /certification opens papers in their own window (`?w=1`): the whole window
 * is in focus mode from the start, and the ✕ in the corner closes it (asking
 * first while the clock runs). Without a window it goes back to /certification.
 */
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

// Focus mode: no site chrome, promos or pop-ups while the clock runs; the
// browser goes full-screen when it allows, and leaving asks first.
const focus = useState('exam-focus', () => false)
const windowed = route.query.w === '1'
const leaveOpen = ref(false)
focus.value = windowed
function close(confirmed = false) {
  if (phase.value === 'running' && !confirmed) {
    leaveOpen.value = true
    return
  }
  leaveOpen.value = false
  if (phase.value === 'running') phase.value = 'intro'
  // window.close() only works on a window a script opened; otherwise go back.
  if (windowed && window.opener) window.close()
  else navigateTo(localePath('/certification'))
}
watch(phase, (p) => {
  focus.value = windowed || p === 'running'
  if (p === 'running') document.documentElement.requestFullscreen?.().catch(() => {})
  else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
})
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
const sectionPath = (topic: string) => localePath(`/${topic}`)
function retake() {
  try {
    localStorage.removeItem(KEY)
  } catch { /* ignore */ }
  start()
}
const shareText = computed(() => t('cert.shareResult', { pct: pct.value, paper: paper!.title }))
</script>

<template>
  <div>
    <!-- Close: the exam window, or back to every paper -->
    <UButton
      icon="i-lucide-x"
      color="neutral"
      variant="outline"
      size="lg"
      square
      class="fixed end-3 top-3 z-50 bg-(--card)"
      :aria-label="t('cert.close')"
      @click="close()"
    />
    <UModal
      v-model:open="leaveOpen"
      :title="t('cert.leaveTitle')"
      :description="t('cert.leaveBody')"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="leaveOpen = false"
          >
            {{ t('cert.keepGoing') }}
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-log-out"
            @click="close(true)"
          >
            {{ t('cert.leave') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- INTRO -->
    <template v-if="phase === 'intro'">
      <BpPageHeader
        :sheet="t('cert.eyebrow')"
        :title="paper!.title"
        :lead="description"
      />
      <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div class="crosshair border-[1.5px] border-(--ink) bg-(--card) p-6 shadow-[10px_10px_0_var(--ice)] sm:p-8">
          <dl class="grid grid-cols-3 gap-4">
            <div>
              <dt class="mono-label">
                {{ t('cert.facts.questions') }}
              </dt><dd class="text-3xl font-black text-(--signal)">
                {{ paper!.questions }}
              </dd>
            </div>
            <div>
              <dt class="mono-label">
                {{ t('cert.facts.minutes') }}
              </dt><dd class="text-3xl font-black text-(--signal)">
                {{ paper!.minutes }}
              </dd>
            </div>
            <div>
              <dt class="mono-label">
                {{ t('cert.facts.pass') }}
              </dt><dd class="text-3xl font-black text-(--signal)">
                {{ EXAM.passPct }}%
              </dd>
            </div>
          </dl>
          <ul class="mt-6 space-y-2 text-sm text-(--ink2)">
            <li
              v-for="i in 4"
              :key="i"
              class="flex gap-2"
            >
              <UIcon
                name="i-lucide-dot"
                class="mt-0.5 size-4 flex-none"
              />{{ t(`cert.rules.${i}`) }}
            </li>
          </ul>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              size="lg"
              icon="i-lucide-play"
              :disabled="!questions.length"
              @click="start()"
            >
              {{ t('cert.begin') }}
            </UButton>
            <UButton
              v-if="resumable"
              size="lg"
              color="neutral"
              variant="outline"
              icon="i-lucide-history"
              @click="start(true)"
            >
              {{ t('cert.resume') }}
            </UButton>
            <UButton
              :to="localePath('/certification')"
              size="lg"
              color="neutral"
              variant="ghost"
            >
              {{ t('cert.allPapers') }}
            </UButton>
          </div>
          <p
            v-if="!isSignedIn"
            class="mt-4 text-xs text-(--ink2)"
          >
            {{ t('cert.signInToSave') }}
          </p>
        </div>
      </div>
    </template>

    <!-- RUNNING -->
    <template v-else-if="phase === 'running' && current">
      <div class="sticky top-0 z-30 border-b-[1.5px] border-(--ink) bg-(--paper)">
        <div class="mx-auto flex max-w-(--ui-container) flex-wrap items-center gap-4 py-3 ps-4 pe-16 sm:ps-6 lg:ps-8">
          <span class="font-bold text-(--ink)">{{ paper!.title }}</span>
          <span class="mono-label">{{ t('cert.questionOf', { n: index + 1, total: questions.length }) }} · {{ t('cert.answeredN', { n: answered }) }} · {{ t('cert.flaggedN', { n: flagged }) }}</span>
          <span
            class="ms-auto flex items-center gap-2 border-[1.5px] px-3 py-1 font-mono text-lg font-bold tabular-nums"
            :class="remaining < 600_000 ? 'border-error bg-error text-white' : 'border-(--ink) bg-(--card) text-(--ink)'"
            role="timer"
            :aria-label="t('cert.timeLeft')"
          >
            <UIcon
              name="i-lucide-timer"
              class="size-4"
            />{{ clock }}
          </span>
          <UButton
            icon="i-lucide-send"
            @click="confirmOpen = true"
          >
            {{ t('cert.submit') }}
          </UButton>
        </div>
      </div>

      <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8">
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
            <p class="eyebrow">
              Q.{{ String(index + 1).padStart(2, '0') }} — {{ DOMAINS[current.domain].label }}
            </p>
            <UButton
              :icon="flags[index] ? 'i-lucide-flag-off' : 'i-lucide-flag'"
              size="xs"
              :color="flags[index] ? 'warning' : 'neutral'"
              :variant="flags[index] ? 'solid' : 'outline'"
              @click="flags[index] = !flags[index]"
            >
              {{ flags[index] ? t('cert.unflag') : t('cert.flag') }}
            </UButton>
          </header>
          <div class="p-5 sm:p-8">
            <h1 class="text-xl font-bold leading-snug text-(--ink)">
              {{ current.q }}
            </h1>
            <div
              class="mt-6 space-y-3"
              role="radiogroup"
            >
              <button
                v-for="(opt, oi) in current.options"
                :key="oi"
                type="button"
                role="radio"
                :aria-checked="answers[index] === oi"
                class="flex w-full items-start gap-3 border-[1.5px] p-4 text-start transition-colors"
                :class="answers[index] === oi ? 'border-(--signal) bg-(--ice) shadow-[3px_3px_0_var(--signal)]' : 'border-(--ink) hover:bg-(--ice)/60'"
                @click="answers[index] = oi"
              >
                <span
                  class="flex size-7 flex-none items-center justify-center border-[1.5px] font-mono text-xs font-bold"
                  :class="answers[index] === oi ? 'border-(--signal) bg-(--signal) text-white' : 'border-(--ink)'"
                >{{ letter(oi) }}</span>
                <span class="pt-0.5 text-(--ink)">{{ opt }}</span>
              </button>
            </div>
          </div>
          <footer class="flex items-center justify-between gap-3 border-t-[1.5px] border-(--ink) px-5 py-4">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="outline"
              :disabled="index === 0"
              @click="index--"
            >
              {{ t('cert.prev') }}
            </UButton>
            <UButton
              v-if="index < questions.length - 1"
              trailing-icon="i-lucide-arrow-right"
              @click="index++"
            >
              {{ t('cert.next') }}
            </UButton>
            <UButton
              v-else
              icon="i-lucide-send"
              @click="confirmOpen = true"
            >
              {{ t('cert.submit') }}
            </UButton>
          </footer>
        </section>

        <aside class="lg:sticky lg:top-24 lg:self-start">
          <p class="mono-label mb-2">
            {{ t('cert.navigator') }}
          </p>
          <div class="grid grid-cols-8 gap-1.5 lg:grid-cols-6">
            <button
              v-for="(_, qi) in questions"
              :key="qi"
              type="button"
              class="relative flex aspect-square items-center justify-center border-[1.5px] font-mono text-[11px]"
              :class="[
                qi === index ? 'border-(--signal) bg-(--signal) text-white' : answers[qi] !== null ? 'border-(--ink) bg-(--tide) text-white' : 'border-(--line) bg-(--card) text-(--ink2)'
              ]"
              :aria-label="t('cert.goTo', { n: qi + 1 })"
              @click="index = qi"
            >
              {{ qi + 1 }}
              <span
                v-if="flags[qi]"
                class="absolute -end-1 -top-1 size-2.5 border border-(--ink) bg-warning"
              />
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 bg-(--tide)" />{{ t('cert.legend.answered') }}</span>
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 border border-(--line)" />{{ t('cert.legend.open') }}</span>
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 bg-warning" />{{ t('cert.legend.flagged') }}</span>
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
              variant="outline"
              @click="confirmOpen = false"
            >
              {{ t('cert.keepGoing') }}
            </UButton>
            <UButton
              icon="i-lucide-send"
              @click="finish"
            >
              {{ t('cert.submitNow') }}
            </UButton>
          </div>
        </template>
      </UModal>
    </template>

    <!-- RESULTS -->
    <template v-else-if="phase === 'done'">
      <div class="mx-auto max-w-(--ui-container) space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <section
          class="border-[1.5px] border-(--ink) p-8 text-white shadow-[10px_10px_0_var(--ink)]"
          :class="passed ? 'graph-paper-navy bg-(--navy)' : 'bg-(--ink)'"
        >
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            {{ paper!.title }} · {{ t('cert.timeUsed', { t: used }) }}
          </p>
          <div class="mt-3 flex flex-wrap items-end gap-6">
            <span class="text-7xl font-black tabular-nums tracking-[-0.04em]">{{ pct }}%</span>
            <span class="pb-3 text-2xl font-extrabold">{{ passed ? t('cert.passed') : t('cert.failed', { p: EXAM.passPct }) }}</span>
          </div>
          <p class="mt-2 text-white/75">
            {{ t('cert.scoreLine', { score, total: questions.length }) }}
            <span v-if="saved"> · {{ t('cert.saved') }}</span>
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <UButton
              icon="i-lucide-rotate-ccw"
              color="secondary"
              @click="retake"
            >
              {{ t('cert.retake') }}
            </UButton>
            <UButton
              :to="localePath('/certification')"
              color="neutral"
              variant="outline"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              {{ t('cert.allPapers') }}
            </UButton>
            <ShareBar
              :title="paper!.title"
              :text="shareText"
              path="/certification"
              compact
              class="[&_button]:bg-white"
            />
          </div>
        </section>

        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-5 py-3">
            {{ t('cert.byDomain') }}
          </p>
          <ul class="p-5">
            <li
              v-for="(d, key) in byDomain"
              :key="key"
              class="py-2"
            >
              <div class="flex justify-between text-sm">
                <span class="font-semibold">{{ DOMAINS[key as ExamDomain].label }}</span>
                <span class="font-mono text-xs">{{ d.score }}/{{ d.total }} · {{ Math.round((d.score / d.total) * 100) }}%</span>
              </div>
              <div class="mt-1 h-2.5 border-[1.5px] border-(--ink) bg-(--paper)">
                <div
                  class="h-full"
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
            <h2 class="bp-h3">
              {{ t('cert.review') }}
            </h2>
            <div class="flex border-[1.5px] border-(--ink)">
              <button
                v-for="f in (['all', 'wrong', 'flagged'] as const)"
                :key="f"
                type="button"
                class="border-e-[1.5px] border-(--ink) px-3 py-1 font-mono text-[11px] uppercase last:border-e-0"
                :class="reviewFilter === f ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
                @click="reviewFilter = f"
              >
                {{ t(`cert.filter.${f}`) }}
              </button>
            </div>
          </div>
          <ol class="mt-4 space-y-4">
            <li
              v-for="{ q, i } in reviewList"
              :key="q.id"
              class="border-[1.5px] bg-(--card) p-5"
              :class="correct(i) ? 'border-(--ink)' : 'border-warning'"
            >
              <p class="mono-label">
                Q.{{ i + 1 }} · {{ DOMAINS[q.domain].label }} ·
                <span :class="correct(i) ? 'text-(--signal)' : 'text-warning'">{{ correct(i) ? t('cert.correct') : answers[i] === null ? t('cert.unanswered') : t('cert.incorrect') }}</span>
              </p>
              <p class="mt-2 font-semibold text-(--ink)">
                {{ q.q }}
              </p>
              <ul class="mt-3 space-y-1.5 text-sm">
                <li
                  v-for="(opt, oi) in q.options"
                  :key="oi"
                  class="flex gap-2 border px-3 py-1.5"
                  :class="oi === q.answer ? 'border-(--signal) bg-(--ice) font-semibold' : oi === answers[i] ? 'border-warning line-through' : 'border-transparent text-(--ink2)'"
                >
                  <span class="font-mono">{{ letter(oi) }}.</span>{{ opt }}
                </li>
              </ul>
              <NuxtLink
                :to="sectionPath(q.topic)"
                class="mt-3 inline-block font-mono text-[11px] uppercase tracking-[.08em] text-(--signal) hover:underline"
              >{{ t('cert.study', { topic: q.topicTitle }) }} →</NuxtLink>
            </li>
          </ol>
        </section>
      </div>
    </template>

    <div
      v-else
      class="py-32 text-center font-mono text-xs uppercase tracking-[.12em] text-(--ink2)"
    >
      {{ t('cert.loading') }}
    </div>
  </div>
</template>
