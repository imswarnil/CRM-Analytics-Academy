<script setup lang="ts">
definePageMeta({
  // Auth-gated and personal: never prerendered, never cached, never indexed.
  // The real enforcement is server-side on every /api/progress call — this
  // only decides what the browser draws.
  middleware: 'auth'
})

const { user } = useAuth()
const localePath = useLocalePath()
const { t } = useI18n()
const { access } = useProgress()

useSeoMeta({
  title: 'Dashboard',
  robots: 'noindex, nofollow'
})

// The same store the rail and the course bar read (loaded once in app.vue),
// so the numbers here and in the navbar can never disagree.
const { completed, bookmarks, data, loaded, isDone, setSaved, normalise } = useProgress()
const { lessons } = useCourse()
const { of: metaOf } = useLessonMeta()

const firstName = computed(() => user.value?.name?.split(' ')[0])
const done = computed(() => completed.value.size)
const total = computed(() => lessons.value.length)
const remaining = computed(() => Math.max(0, total.value - done.value))
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0))
const byPath = computed(() => new Map(lessons.value.map(l => [normalise(l.path), l])))

// Where to pick up: the first unticked lesson in course order, then the two
// after it — resuming, not restarting.
const upNext = computed(() => lessons.value.filter(l => !isDone(l.path)).slice(0, 4))
const resume = computed(() => upNext.value[0] ?? lessons.value[0])

const recent = computed(() => [...completed.value]
  .map(p => byPath.value.get(p))
  .filter((l): l is NonNullable<typeof l> => Boolean(l))
  .slice(0, 6))

const saved = computed(() => [...bookmarks.value]
  .map(p => byPath.value.get(p))
  .filter((l): l is NonNullable<typeof l> => Boolean(l)))

// Progress per section, in course order.
const bySection = computed(() => {
  const map = new Map<string, { title: string, path: string, total: number, done: number }>()
  for (const l of lessons.value) {
    const row = map.get(l.moduleTitle) ?? { title: l.moduleTitle, path: l.path, total: 0, done: 0 }
    row.total += 1
    if (isDone(l.path)) row.done += 1
    map.set(l.moduleTitle, row)
  }
  return [...map.values()]
})
const sectionsDone = computed(() => bySection.value.filter(s => s.total && s.done === s.total).length)

// Quiz scores, worst first among the ones worth retaking.
const quizzes = computed(() => (data.value?.quizzes ?? [])
  .map(q => ({ ...q, pct: Math.round((q.best / q.total) * 100), lesson: byPath.value.get(q.path) }))
  .filter(q => q.lesson))
const quizAvg = computed(() => quizzes.value.length ? Math.round(quizzes.value.reduce((s, q) => s + q.pct, 0) / quizzes.value.length) : 0)
const perfectQuizzes = computed(() => quizzes.value.filter(q => q.pct === 100).length)

// --- Weekly goal ------------------------------------------------------------
// The learner picks it; it lives in this browser only. Counted against
// lessons completed since Monday.
const goal = ref(3)
onMounted(() => {
  try {
    goal.value = Number(localStorage.getItem('crma-goal')) || 3
  } catch { /* storage blocked: default goal */ }
})
watch(goal, (g) => {
  try {
    localStorage.setItem('crma-goal', String(g))
  } catch { /* ignore */ }
})
const monday = computed(() => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7))).toISOString().slice(0, 10)
})
const thisWeek = computed(() => Object.values(data.value?.completedAt ?? {}).filter(d => d.slice(0, 10) >= monday.value).length)
const goalPct = computed(() => Math.min(100, Math.round((thisWeek.value / goal.value) * 100)))

// --- Activity heatmap -------------------------------------------------------
// 26 weeks × 7 days, Monday first, today in the last column.
const heat = computed(() => {
  const counts = new Map((data.value?.days ?? []).map(d => [d.day, d.count]))
  const weeks: { day: string, n: number, future: boolean }[][] = []
  const today = new Date().toISOString().slice(0, 10)
  const start = Date.parse(monday.value) - 25 * 7 * 86_400_000
  for (let w = 0; w < 26; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start + (w * 7 + d) * 86_400_000).toISOString().slice(0, 10)
      col.push({ day, n: counts.get(day) ?? 0, future: day > today })
    }
    weeks.push(col)
  }
  return weeks
})
const heatTone = (n: number) => n === 0 ? 'bg-(--paper)' : n === 1 ? 'bg-(--frost)' : n === 2 ? 'bg-(--tide)' : 'bg-(--signal)'
const activeDays = computed(() => (data.value?.days ?? []).length)

// --- Achievements -----------------------------------------------------------
const achievements = computed(() => {
  const d = data.value
  const streakBest = d?.longestStreak ?? 0
  return [
    { key: 'first', icon: 'i-lucide-flag', got: done.value >= 1 },
    { key: 'ten', icon: 'i-lucide-layers', got: done.value >= 10 },
    { key: 'section', icon: 'i-lucide-square-check-big', got: sectionsDone.value >= 1 },
    { key: 'half', icon: 'i-lucide-gauge', got: percent.value >= 50 },
    { key: 'all', icon: 'i-lucide-graduation-cap', got: total.value > 0 && done.value >= total.value },
    { key: 'streak3', icon: 'i-lucide-flame', got: streakBest >= 3 },
    { key: 'streak7', icon: 'i-lucide-zap', got: streakBest >= 7 },
    { key: 'quiz', icon: 'i-lucide-list-checks', got: quizzes.value.length >= 1 },
    { key: 'perfect', icon: 'i-lucide-target', got: perfectQuizzes.value >= 1 },
    { key: 'quiz10', icon: 'i-lucide-brain', got: quizzes.value.length >= 10 },
    { key: 'saver', icon: 'i-lucide-bookmark', got: bookmarks.value.size >= 1 },
    { key: 'contributor', icon: 'i-lucide-git-pull-request', got: (d?.contributions ?? 0) >= 1 }
  ]
})
const earned = computed(() => achievements.value.filter(a => a.got).length)

// --- Share progress ----------------------------------------------------------------
// A ready-to-post line built from the learner's real numbers: the most
// shareable moment is a streak or a badge, so both are in it.
const progressText = computed(() => t('share.progressText', {
  done: done.value,
  streak: data.value?.streak ?? 0,
  badges: earned.value
}))
function shareProgress() {
  const url = `${SITE.url}/?utm_source=share&utm_medium=linkedin-progress`
  window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${progressText.value}\n\n${url}`)}`, '_blank', 'noopener,noreferrer,width=640,height=640')
  useNuxtApp().$track?.('share', 'linkedin-progress')
}

// --- Leaderboard by scope ------------------------------------------------------
interface Ranks {
  scope: string
  country: string | null
  regionName: string | null
  rows: { me: boolean, rank: number, name: string, image: string | null, country: string | null, points: number, lessons: number }[]
}
const { data: ranks } = useFetch<Ranks>('/api/leaderboard', { server: false })

const tiles = computed(() => [
  { key: 'done', label: t('dashboard.statCompleted'), value: String(done.value), hint: `${percent.value}%`, accent: true },
  { key: 'remaining', label: t('dashboard.statRemaining'), value: String(remaining.value), hint: t('dashboard.lessons'), accent: false },
  { key: 'streak', label: t('dashboard.statStreak'), value: String(data.value?.streak ?? 0), hint: t('dashboard.longest', { n: data.value?.longestStreak ?? 0 }), accent: true },
  { key: 'points', label: t('dashboard.statPoints'), value: String(data.value?.points ?? 0), hint: data.value?.rank ? t('dashboard.rankOf', { rank: data.value.rank, n: data.value.ranked }) : t('dashboard.unranked'), accent: false },
  { key: 'quiz', label: t('dashboard.statQuiz'), value: quizzes.value.length ? `${quizAvg.value}%` : '—', hint: t('dashboard.quizzesTaken', { n: quizzes.value.length }), accent: false },
  { key: 'badges', label: t('dashboard.statBadges'), value: `${earned.value}/${achievements.value.length}`, hint: t('dashboard.activeDays', { n: activeDays.value }), accent: true }
])

// Certification readiness: best score per practice paper.
const { data: exams } = useLazyAsyncData('my-exams', () =>
  $fetch<Record<string, { best: number, attempts: number }>>('/api/exam-attempt'), { server: false, default: () => ({}) as Record<string, { best: number, attempts: number }> })
const examRows = computed(() => PAPERS.map(p => ({ ...p, result: exams.value?.[p.id] })))
const examBest = computed(() => Math.max(0, ...Object.values(exams.value ?? {}).map(e => e.best)))
const examTaken = computed(() => Object.keys(exams.value ?? {}).length)
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('dashboard.kicker')"
      :title="firstName ? t('dashboard.welcomeNamed', { name: firstName }) : t('dashboard.welcome')"
      :lead="data?.streak ? t('dashboard.streakLead', { n: data.streak }) : t('dashboard.lead')"
    >
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UButton
          icon="i-simple-icons-linkedin"
          @click="shareProgress"
        >
          {{ t('share.progress') }}
        </UButton>
        <ShareBar
          :title="t('share.progressTitle')"
          :text="progressText"
          path="/"
          compact
        />
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      <!-- Plan: what this learner has, and the next step up -->
      <div class="flex flex-wrap items-center gap-4 rounded-[6px] border border-(--line) bg-(--card) px-6 py-5">
        <UIcon
          :name="access === 'pro' ? 'i-lucide-sparkles' : 'i-lucide-book-open'"
          class="size-6 text-(--signal)"
        />
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-(--ink)">
            {{ access === 'pro' ? t('plans.pro.name') : t('plans.free.name') }}
          </p>
          <p class="text-sm text-(--ink2)">
            {{ access === 'pro' ? t('plans.pro.tagline') : t('plans.free.tagline') }}
          </p>
        </div>
        <UButton
          v-if="access !== 'pro'"
          :to="localePath('/pro')"
          icon="i-lucide-sparkles"
        >
          {{ t('plans.goPro', { price: `$${PRICES.monthly.usd}` }) }}
        </UButton>
        <UButton
          :to="localePath('/account')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-settings"
        >
          {{ t('nav.billing') }}
        </UButton>
      </div>

      <!-- Stat tiles -->
      <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-(--line) bg-(--line) sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="tile in tiles"
          :key="tile.key"
          class="flex flex-col-reverse bg-(--card) p-4"
        >
          <dd>
            <span
              class="mt-2 block text-3xl font-bold tabular-nums tracking-tight"
              :class="tile.accent ? 'text-(--signal)' : 'text-(--ink)'"
            >{{ tile.value }}</span>
            <span class="font-medium text-[11px] text-(--ink2)">{{ tile.hint }}</span>
          </dd>
          <dt class="truncate font-medium text-[11px] text-(--ink2)">
            {{ tile.label }}
          </dt>
        </div>
      </dl>

      <!-- Practice: the interactive tools, one click away -->
      <nav
        class="flex gap-2 overflow-x-auto pb-1"
        :aria-label="t('dashboard.practice')"
      >
        <NuxtLink
          :to="localePath('/certification')"
          class="flex shrink-0 items-center gap-2 border border-(--line) bg-(--card) px-3 py-2 text-sm font-semibold text-(--ink) hover:bg-(--ice) rounded-2xl"
        >
          <UIcon
            name="i-lucide-timer"
            class="size-4 text-(--signal)"
          />{{ t('nav.certification') }}
        </NuxtLink>
      </nav>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Continue + up next -->
        <section class="border border-(--line) bg-(--card) lg:col-span-2 overflow-hidden rounded-2xl">
          <header class="flex items-center justify-between border-b border-(--line) bg-(--ice) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.continue') }}
            </p>
            <span class="font-mono text-xs font-semibold tabular-nums">{{ t('dashboard.lessonsDone', { done, total }) }}</span>
          </header>
          <div class="p-5">
            <div
              class="relative h-4 border border-(--line) bg-(--paper)"
              role="progressbar"
              :aria-valuenow="percent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t('course.courseProgress')"
            >
              <div
                class="hatch-signal h-full border-e border-(--line) transition-[width] duration-700"
                :style="{ width: `${percent}%` }"
              />
              <span
                v-for="i in 9"
                :key="i"
                class="absolute inset-y-0 border-s border-(--line)"
                :style="{ left: `${i * 10}%` }"
              />
            </div>

            <NuxtLink
              v-if="resume"
              :to="localePath(resume.path)"
              class="bp-card bp-card--hover group mt-5 flex items-center gap-4 p-5"
            >
              <span class="flex size-12 flex-none items-center justify-center border border-(--line) bg-(--signal) text-white">
                <UIcon
                  :name="metaOf(resume.path).type === 'video' ? 'i-lucide-play' : 'i-lucide-book-open'"
                  class="size-6"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="mono-label block">{{ resume.moduleTitle }} · {{ metaOf(resume.path).minutes }} min</span>
                <span class="block truncate text-xl font-semibold tracking-[-0.02em] text-(--ink) group-hover:text-(--signal)">{{ resume.title }}</span>
              </span>
              <span class="hidden font-bold text-(--signal) sm:block">{{ done ? t('dashboard.continueCta') : t('dashboard.startFirst') }} →</span>
            </NuxtLink>

            <template v-if="upNext.length > 1">
              <p class="mono-label mt-6">
                {{ t('dashboard.upNext') }}
              </p>
              <ol class="mt-2 border-t border-dashed border-(--line)">
                <li
                  v-for="(l, i) in upNext.slice(1)"
                  :key="l.path"
                  class="border-b border-dashed border-(--line)"
                >
                  <NuxtLink
                    :to="localePath(l.path)"
                    class="flex items-center gap-3 px-1 py-2 text-sm hover:bg-(--ice)"
                  >
                    <span class="w-6 font-mono text-[11px] text-(--signal)">{{ String(i + 2).padStart(2, '0') }}</span>
                    <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ l.title }}</span>
                    <span class="font-mono text-[10px] text-(--ink2)">{{ metaOf(l.path).minutes }}m</span>
                  </NuxtLink>
                </li>
              </ol>
            </template>
          </div>
        </section>

        <!-- Weekly goal -->
        <section class="graph-paper-navy flex flex-col border border-(--line) bg-(--navy) p-5 text-white">
          <p class="font-medium text-[11px] text-(--glow)">
            {{ t('dashboard.goal') }}
          </p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-5xl font-bold tabular-nums tracking-tight">{{ thisWeek }}</span>
            <span class="pb-2 font-mono text-sm text-white/70">/ {{ goal }} {{ t('dashboard.lessons') }}</span>
          </div>
          <div class="mt-4 h-3 border border-white/60">
            <div
              class="h-full bg-(--glow) transition-[width] duration-700"
              :style="{ width: `${goalPct}%` }"
            />
          </div>
          <p class="mt-3 text-sm text-white/75">
            {{ goalPct >= 100 ? t('dashboard.goalDone') : t('dashboard.goalLeft', { n: Math.max(0, goal - thisWeek) }) }}
          </p>
          <div class="mt-4 flex items-center gap-2">
            <span class="font-medium text-[11px] text-white/60">{{ t('dashboard.goalSet') }}</span>
            <button
              v-for="g in [2, 3, 5, 7, 10]"
              :key="g"
              type="button"
              class="size-8 border font-mono text-xs"
              :class="g === goal ? 'border-(--glow) bg-(--glow) text-(--navy)' : 'border-white/40 text-white hover:border-white'"
              @click="goal = g"
            >
              {{ g }}
            </button>
          </div>
          <div class="mt-auto flex flex-wrap gap-2 pt-6">
            <UButton
              :to="localePath('/start')"
              icon="i-lucide-graduation-cap"
              color="secondary"
              size="sm"
            >
              {{ t('dashboard.browse') }}
            </UButton>
            <UButton
              :to="localePath('/submit')"
              :label="t('dashboard.contribute')"
              icon="i-lucide-circle-plus"
              color="neutral"
              variant="outline"
              size="sm"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
            />
          </div>
        </section>
      </div>

      <!-- Pro: status for members, the next step for everyone else -->
      <NuxtLink
        :to="localePath('/pro')"
        class="graph-paper-navy flex flex-wrap items-center gap-4 border border-(--line) bg-(--navy) p-5 text-white"
      >
        <UIcon
          :name="data?.pro ? 'i-lucide-badge-check' : 'i-lucide-sparkles'"
          class="size-8 text-(--glow)"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-lg font-semibold">{{ data?.pro ? t('dash.proActive') : t('dash.proTitle') }}</span>
          <span class="block text-sm text-white/75">{{ data?.pro ? t('dash.proActiveBody') : t('dash.proBody') }}</span>
        </span>
        <span
          v-if="!data?.pro"
          class="border border-white bg-white px-4 py-2 font-bold text-(--navy)"
        >{{ t('pro.getPro') }} →</span>
      </NuxtLink>

      <!-- Certification readiness -->
      <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-(--line) px-5 py-3">
          <p class="eyebrow">
            {{ t('dash.examTitle') }}
          </p>
          <p class="font-mono text-xs text-(--ink2)">
            {{ t('dash.examSummary', { taken: examTaken, best: examBest, pass: EXAM.passPct }) }}
          </p>
        </header>
        <ul class="grid gap-px bg-(--line) sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="p in examRows"
            :key="p.id"
            class="bg-(--card)"
          >
            <NuxtLink
              :to="localePath(`/certification/${p.id}`)"
              class="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-(--ice)"
            >
              <span class="min-w-0">
                <span class="block truncate font-semibold text-(--ink)">{{ p.title }}</span>
                <span class="font-mono text-[11px] text-(--ink2)">{{ p.questions }} Q · {{ p.minutes }} min</span>
              </span>
              <span
                v-if="p.result"
                class="font-mono text-lg font-bold tabular-nums"
                :class="p.result.best >= EXAM.passPct ? 'text-(--signal)' : 'text-(--ink2)'"
              >{{ p.result.best }}%</span>
              <UIcon
                v-else
                name="i-lucide-play"
                class="size-5 text-(--ink2)"
              />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Activity heatmap -->
      <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
        <header class="flex flex-wrap items-center justify-between gap-2 border-b border-(--line) px-5 py-3">
          <p class="eyebrow">
            {{ t('dashboard.activity') }}
          </p>
          <span class="font-medium text-xs text-(--ink2)">{{ t('dashboard.activeDays', { n: activeDays }) }} · {{ t('dashboard.longest', { n: data?.longestStreak ?? 0 }) }}</span>
        </header>
        <div class="overflow-x-auto p-5">
          <div class="flex min-w-max gap-[3px]">
            <div
              v-for="(col, w) in heat"
              :key="w"
              class="flex flex-col gap-[3px]"
            >
              <span
                v-for="cell in col"
                :key="cell.day"
                class="size-3.5 border border-(--line)"
                :class="cell.future ? 'opacity-0' : heatTone(cell.n)"
                :title="`${cell.day} · ${cell.n}`"
              />
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2 font-medium text-[11px] text-(--ink2)">
            {{ t('dashboard.less') }}
            <span
              v-for="n in [0, 1, 2, 3]"
              :key="n"
              class="size-3 border border-(--line)"
              :class="heatTone(n)"
            />
            {{ t('dashboard.more') }}
          </div>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- By section -->
        <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
          <header class="flex items-center justify-between border-b border-(--line) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.bySection') }}
            </p>
            <span class="font-mono text-xs text-(--ink2)">{{ sectionsDone }}/{{ bySection.length }}</span>
          </header>
          <ul class="max-h-96 overflow-y-auto">
            <li
              v-for="(sec, n) in bySection"
              :key="sec.title"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(sec.path)"
                class="flex items-center gap-3 px-5 py-2.5 hover:bg-(--ice)"
              >
                <span class="w-6 font-mono text-[11px] font-semibold text-(--signal)">{{ String(n).padStart(2, '0') }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold text-(--ink)">{{ sec.title }}</span>
                  <span class="font-mono text-[10px] text-(--ink2)">{{ sec.done }}/{{ sec.total }}</span>
                </span>
                <BpDonut
                  :value="sec.total ? sec.done / sec.total : 0"
                  :size="28"
                />
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- Saved -->
        <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
          <header class="flex items-center justify-between border-b border-(--line) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.saved') }}
            </p>
            <span class="font-mono text-xs text-(--ink2)">{{ saved.length }}</span>
          </header>
          <p
            v-if="!saved.length"
            class="p-5 text-sm text-(--ink2)"
          >
            {{ t('dashboard.savedEmpty') }}
          </p>
          <ul
            v-else
            class="max-h-96 overflow-y-auto"
          >
            <li
              v-for="l in saved"
              :key="l.path"
              class="flex items-center gap-2 border-b border-dashed border-(--line) px-5 py-2.5 last:border-b-0"
            >
              <UIcon
                :name="isDone(l.path) ? 'i-lucide-circle-check' : 'i-lucide-bookmark'"
                class="size-4 flex-none text-(--signal)"
              />
              <NuxtLink
                :to="localePath(l.path)"
                class="min-w-0 flex-1 truncate text-sm font-semibold text-(--ink) hover:text-(--signal)"
              >
                {{ l.title }}
              </NuxtLink>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                :aria-label="t('dashboard.unsave')"
                @click="setSaved(l.path, false)"
              />
            </li>
          </ul>
        </section>

        <!-- Quizzes -->
        <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
          <header class="flex items-center justify-between border-b border-(--line) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.quizzes') }}
            </p>
            <span class="font-mono text-xs text-(--ink2)">{{ quizzes.length ? `${quizAvg}%` : '' }}</span>
          </header>
          <p
            v-if="!quizzes.length"
            class="p-5 text-sm text-(--ink2)"
          >
            {{ t('dashboard.quizzesEmpty') }}
          </p>
          <ul
            v-else
            class="max-h-96 overflow-y-auto"
          >
            <li
              v-for="q in quizzes"
              :key="q.path"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(q.lesson!.path)"
                class="flex items-center gap-3 px-5 py-2.5 hover:bg-(--ice)"
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold text-(--ink)">{{ q.lesson!.title }}</span>
                  <span class="font-mono text-[10px] text-(--ink2)">{{ q.best }}/{{ q.total }} · {{ t('dashboard.attempts', { n: q.attempts }) }}</span>
                </span>
                <span
                  class="border px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                  :class="q.pct >= 70 ? 'border-(--signal) text-(--signal)' : 'border-(--line) bg-(--ink) text-(--paper)'"
                >{{ q.pct >= 70 ? `${q.pct}%` : t('dashboard.retake') }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>

      <!-- Achievements -->
      <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
        <header class="flex items-center justify-between border-b border-(--line) px-5 py-3">
          <p class="eyebrow">
            {{ t('dashboard.badges') }}
          </p>
          <span class="font-mono text-xs text-(--ink2)">{{ earned }}/{{ achievements.length }}</span>
        </header>
        <ul class="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
          <li
            v-for="a in achievements"
            :key="a.key"
            class="flex flex-col items-center gap-2 border p-4 text-center"
            :class="a.got ? 'border-(--line) bg-(--ice)' : 'border-dashed border-(--line) opacity-60'"
          >
            <span
              class="flex size-10 items-center justify-center border"
              :class="a.got ? 'border-(--line) bg-(--signal) text-white' : 'border-(--line) text-(--ink2)'"
            >
              <UIcon
                :name="a.got ? a.icon : 'i-lucide-lock'"
                class="size-5"
              />
            </span>
            <span class="text-sm font-bold text-(--ink)">{{ t(`dashboard.badge.${a.key}.title`) }}</span>
            <span class="text-xs text-(--ink2)">{{ t(`dashboard.badge.${a.key}.desc`) }}</span>
          </li>
        </ul>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Leaderboard -->
        <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
          <header class="flex flex-wrap items-center justify-between gap-2 border-b border-(--line) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.leaderboard') }}
            </p>
          </header>
          <p
            v-if="!ranks?.rows?.length"
            class="p-5 text-sm text-(--ink2)"
          >
            {{ t('dashboard.leaderboardEmpty') }}
          </p>
          <ol v-else>
            <li
              v-for="p in ranks.rows"
              :key="`${p.rank}-${p.name}-${p.me}`"
              class="flex items-center gap-3 border-b border-dashed border-(--line) px-5 py-2.5 last:border-b-0"
              :class="p.me ? 'bg-(--ice)' : ''"
            >
              <span class="w-7 font-mono text-[11px] font-semibold text-(--signal)">#{{ p.rank }}</span>
              <span class="flex size-7 flex-none items-center justify-center overflow-hidden border border-(--line) bg-(--signal) text-xs font-bold text-white">
                <img
                  v-if="p.image"
                  :src="p.image"
                  alt=""
                  class="size-full object-cover"
                >
                <template v-else>{{ p.name.slice(0, 1) }}</template>
              </span>
              <span class="min-w-0 flex-1 truncate text-sm font-semibold text-(--ink)">
                {{ p.name }}<span
                  v-if="p.me"
                  class="ms-1 font-mono text-[10px] text-(--signal)"
                >({{ t('dashboard.you') }})</span>
              </span>
              <span class="font-mono text-xs text-(--ink2)">{{ p.lessons }} · {{ p.points }} pts</span>
            </li>
          </ol>
          <p class="border-t border-dashed border-(--line) px-5 py-3 text-xs text-(--ink2)">
            {{ t('dashboard.pointsRule') }}
          </p>
        </section>

        <!-- Recently completed -->
        <section class="border border-(--line) bg-(--card) overflow-hidden rounded-2xl">
          <header class="border-b border-(--line) px-5 py-3">
            <p class="eyebrow">
              {{ t('dashboard.recentlyCompleted') }}
            </p>
          </header>
          <p
            v-if="loaded && !recent.length"
            class="p-5 text-sm text-(--ink2)"
          >
            {{ t('dashboard.nothingYet') }}
          </p>
          <ul v-else>
            <li
              v-for="lesson in recent"
              :key="lesson.path"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(lesson.path)"
                class="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-(--ice)"
              >
                <span class="flex size-6 flex-none items-center justify-center border border-(--line) bg-(--signal) text-white">
                  <UIcon
                    name="i-lucide-check"
                    class="size-3.5"
                  />
                </span>
                <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ lesson.title }}</span>
                <span class="hidden shrink-0 truncate font-medium text-[11px] text-(--ink2) sm:block">{{ lesson.moduleTitle }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </div>
    <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <PromoSlot unit="responsiveLeaderboard" />
    </div>
  </div>
</template>
