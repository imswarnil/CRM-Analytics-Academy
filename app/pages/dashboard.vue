<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, displayName } = useProfile()
const localePath = useLocalePath()

useSeoMeta({ title: 'Your dashboard — CRM Analytics Academy', robots: 'noindex' })

interface Section { slug: string, title: string, total: number, completed: number, pct: number }
interface Skill { skill: string, correct: number, total: number, pct: number }

interface DashboardData {
  progress: { lesson_path: string, completed_at: string }[]
  resources: { id: string, title: string, status: string, created_at: string }[]
  quizzes: { quiz_id: string, score: number, total: number, passed: boolean, created_at: string }[]
  avgScore: number | null
  quizzesTaken: number
  quizzesPassed: number
  sections: Section[]
  skills: Skill[]
  certificateEligible: boolean
  certMinScore: number
}

// Fetched via a server route so RLS sees the authenticated user (the browser
// client can arrive anonymous).
const { data, pending, refresh } = await useAsyncData<DashboardData | null>(
  'dashboard',
  () => $fetch('/api/dashboard'),
  { server: false, watch: [user] }
)

// useAsyncData caches by key across navigations, so re-fetch every time the
// dashboard is opened — otherwise a lesson just marked complete won't show.
onMounted(() => refresh())

const statusColor = (s: string) => (s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning')

function lessonTitle(path: string) {
  const seg = path.split('/').filter(Boolean).pop() || path
  return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Overall course completion across all sections (lessons done / total lessons).
const overall = computed(() => {
  const s = data.value?.sections ?? []
  const total = s.reduce((n, x) => n + x.total, 0)
  const done = s.reduce((n, x) => n + x.completed, 0)
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
})
const sectionsComplete = computed(() => (data.value?.sections ?? []).filter(s => s.completed >= s.total).length)

// A skill's tone reflects mastery so the bars read at a glance.
const skillTone = (pct: number) =>
  pct >= 85 ? 'bg-success' : pct >= 60 ? 'bg-primary' : pct >= 40 ? 'bg-warning' : 'bg-error'
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted sm:text-3xl">
          Welcome back, {{ displayName }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Your learning progress and contributions.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          :to="localePath('/feedback')"
          icon="i-lucide-message-square-heart"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Feedback
        </UButton>
        <UButton
          :to="localePath('/submit/resource')"
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Submit resource
        </UButton>
      </div>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-16"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary"
      />
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Stat tiles -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-default bg-default p-5">
          <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <UIcon
              name="i-lucide-circle-check-big"
              class="size-4 text-primary"
            />
            Course progress
          </div>
          <p class="mt-2 text-3xl font-bold text-highlighted">
            {{ overall.pct }}<span class="text-base font-medium text-muted">%</span>
          </p>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: `${overall.pct}%` }"
            />
          </div>
          <p class="mt-1.5 text-xs text-dimmed">
            {{ overall.done }} of {{ overall.total }} lessons
          </p>
        </div>

        <div class="rounded-2xl border border-default bg-default p-5">
          <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <UIcon
              name="i-lucide-gauge"
              class="size-4 text-primary"
            />
            Average score
          </div>
          <p class="mt-2 text-3xl font-bold text-highlighted">
            {{ data?.avgScore ?? '—' }}<span
              v-if="data?.avgScore != null"
              class="text-base font-medium text-muted"
            >/100</span>
          </p>
          <p class="mt-1.5 text-xs text-dimmed">
            {{ data?.quizzesPassed || 0 }} of {{ data?.quizzesTaken || 0 }} exams passed
          </p>
        </div>

        <div class="rounded-2xl border border-default bg-default p-5">
          <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <UIcon
              name="i-lucide-layers"
              class="size-4 text-primary"
            />
            Sections done
          </div>
          <p class="mt-2 text-3xl font-bold text-highlighted">
            {{ sectionsComplete }}<span class="text-base font-medium text-muted">/{{ data?.sections.length || 0 }}</span>
          </p>
          <p class="mt-1.5 text-xs text-dimmed">
            Fully completed tracks
          </p>
        </div>

        <NuxtLink
          :to="localePath('/certificate')"
          class="group rounded-2xl border p-5 transition"
          :class="data?.certificateEligible
            ? 'border-success/40 bg-success/5 hover:border-success'
            : 'border-default bg-default hover:border-primary/40'"
        >
          <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <UIcon
              name="i-lucide-award"
              class="size-4"
              :class="data?.certificateEligible ? 'text-success' : 'text-primary'"
            />
            Certificate
          </div>
          <p
            class="mt-2 text-lg font-bold"
            :class="data?.certificateEligible ? 'text-success' : 'text-highlighted'"
          >
            {{ data?.certificateEligible ? 'Unlocked 🎉' : 'Locked' }}
          </p>
          <p class="mt-1.5 flex items-center gap-1 text-xs text-dimmed">
            {{ data?.certificateEligible ? 'View & download' : `Finish all tracks · ${data?.certMinScore ?? 75}% avg` }}
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3 transition group-hover:translate-x-0.5"
            />
          </p>
        </NuxtLink>
      </div>

      <!-- Section progress + skills -->
      <div class="grid gap-6 lg:grid-cols-3">
        <UPageCard
          class="lg:col-span-2"
          :ui="{ body: 'space-y-5' }"
        >
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-chart-no-axes-column"
              class="size-5 text-primary"
            />
            Progress by section
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <NuxtLink
              v-for="s in data?.sections"
              :key="s.slug"
              :to="localePath(`/${s.slug}`)"
              class="group flex items-center gap-4 rounded-xl border border-default bg-elevated/30 p-4 transition hover:border-primary/40"
            >
              <div class="relative size-16 shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  class="size-16 -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke-width="3.5"
                    class="stroke-default"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke-width="3.5"
                    stroke-linecap="round"
                    path-length="100"
                    :stroke-dasharray="`${s.pct}, 100`"
                    class="stroke-primary transition-all duration-700"
                  />
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-highlighted">{{ s.pct }}%</span>
              </div>
              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted group-hover:text-primary">
                  {{ s.title }}
                </p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ s.completed }} / {{ s.total }} lessons
                </p>
              </div>
            </NuxtLink>
          </div>
        </UPageCard>

        <UPageCard :ui="{ body: 'space-y-4' }">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-radar"
              class="size-5 text-primary"
            />
            Skills
          </h2>
          <div
            v-if="data?.skills.length"
            class="space-y-3"
          >
            <div
              v-for="sk in data.skills"
              :key="sk.skill"
            >
              <div class="mb-1 flex items-center justify-between text-sm">
                <span class="text-default">{{ sk.skill }}</span>
                <span class="font-medium text-muted">{{ sk.pct }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-elevated">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="skillTone(sk.pct)"
                  :style="{ width: `${sk.pct}%` }"
                />
              </div>
            </div>
          </div>
          <p
            v-else
            class="py-6 text-center text-sm text-muted"
          >
            Take an exam to see your skill breakdown.
          </p>
        </UPageCard>
      </div>

      <!-- Lessons + quizzes + resources -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Completed lessons -->
        <UPageCard
          class="lg:col-span-2"
          :ui="{ body: 'space-y-4' }"
        >
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-circle-check-big"
                class="size-5 text-primary"
              />
              Lessons completed
            </h2>
            <UBadge
              color="primary"
              variant="subtle"
            >
              {{ data?.progress.length || 0 }}
            </UBadge>
          </div>

          <ul
            v-if="data?.progress.length"
            class="grid gap-x-6 sm:grid-cols-2"
          >
            <li
              v-for="p in data.progress.slice(0, 12)"
              :key="p.lesson_path"
              class="flex items-center justify-between gap-3 border-b border-default py-2.5"
            >
              <NuxtLink
                :to="p.lesson_path"
                class="truncate text-sm text-default hover:text-primary"
              >
                {{ lessonTitle(p.lesson_path) }}
              </NuxtLink>
              <UIcon
                name="i-lucide-check"
                class="size-4 shrink-0 text-success"
              />
            </li>
          </ul>
          <p
            v-else
            class="py-6 text-center text-sm text-muted"
          >
            No lessons marked complete yet.
            <NuxtLink
              :to="localePath('/')"
              class="text-primary hover:underline"
            >Start learning →</NuxtLink>
          </p>
        </UPageCard>

        <div class="space-y-6">
          <!-- Quiz results -->
          <UPageCard :ui="{ body: 'space-y-3' }">
            <div class="flex items-center justify-between">
              <h2 class="flex items-center gap-2 font-semibold text-highlighted">
                <UIcon
                  name="i-lucide-list-checks"
                  class="size-5 text-primary"
                />
                Recent exams
              </h2>
            </div>
            <ul
              v-if="data?.quizzes.length"
              class="space-y-2"
            >
              <li
                v-for="(q, i) in data.quizzes"
                :key="i"
                class="flex items-center justify-between text-sm"
              >
                <span class="truncate text-muted">{{ lessonTitle(q.quiz_id) }}</span>
                <UBadge
                  :color="q.passed ? 'success' : 'warning'"
                  variant="subtle"
                >
                  {{ Math.round((q.score / q.total) * 100) }}%
                </UBadge>
              </li>
            </ul>
            <p
              v-else
              class="py-6 text-center text-sm text-muted"
            >
              No quiz attempts yet.
            </p>
          </UPageCard>

          <!-- My resources -->
          <UPageCard :ui="{ body: 'space-y-3' }">
            <div class="flex items-center justify-between">
              <h2 class="flex items-center gap-2 font-semibold text-highlighted">
                <UIcon
                  name="i-lucide-library-big"
                  class="size-5 text-primary"
                />
                My resources
              </h2>
              <UButton
                :to="localePath('/submit/resource')"
                icon="i-lucide-plus"
                color="neutral"
                variant="ghost"
                size="xs"
              />
            </div>
            <ul
              v-if="data?.resources.length"
              class="space-y-2"
            >
              <li
                v-for="r in data.resources"
                :key="r.id"
                class="flex items-center justify-between gap-2 text-sm"
              >
                <span class="truncate text-default">{{ r.title }}</span>
                <UBadge
                  :color="statusColor(r.status)"
                  variant="subtle"
                  class="shrink-0 capitalize"
                >
                  {{ r.status }}
                </UBadge>
              </li>
            </ul>
            <p
              v-else
              class="py-6 text-center text-sm text-muted"
            >
              You haven't submitted any resources.
            </p>
          </UPageCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>
