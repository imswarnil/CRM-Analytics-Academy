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

useSeoMeta({
  title: 'Dashboard',
  robots: 'noindex, nofollow'
})

// The same store the rail and the course bar read. The dashboard used to run
// its own $fetch of /api/progress, which meant two copies of the learner's
// progress in one page and a window where they disagreed.
// AppHeader has already loaded this — it is on every page, including this
// one. Reading the shared store rather than fetching again is what keeps the
// navbar percentage and the numbers below identical.
const { completed, pro, points, rank, loaded, isDone } = useProgress()

// The denominator comes from the curriculum tree app.vue already provides,
// not from the API — the client can count it for free.
const { lessons } = useCourse()

const done = computed(() => completed.value.size)
const total = computed(() => lessons.value.length)
const remaining = computed(() => Math.max(0, total.value - done.value))
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0))

// Where to pick up: the first lesson in course order that is not ticked.
// "Continue" pointing at a fixed module is not resuming, it is restarting —
// this is the whole reason a learner opens the dashboard rather than the nav.
const resume = computed(() => lessons.value.find(l => !isDone(l.path)) ?? lessons.value[0])

// The API returns completed paths newest-first, and the Set preserves that
// order, so the first few are genuinely the most recent.
const recent = computed(() => {
  const byPath = new Map(lessons.value.map(l => [l.path, l]))
  return [...completed.value]
    .map(p => byPath.get(p))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .slice(0, 5)
})

const firstName = computed(() => user.value?.name?.split(' ')[0])
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8">
      <p class="text-xs font-semibold uppercase tracking-wide text-primary">
        {{ t('dashboard.kicker') }}
      </p>
      <h1 class="mt-1 text-3xl font-bold text-highlighted">
        {{ firstName ? t('dashboard.welcomeNamed', { name: firstName }) : t('dashboard.welcome') }}
      </h1>
    </header>

    <!-- Tiles before the detail: a learner opening this page wants the
         headline numbers first, the breakdown second.

         Two columns on a phone rather than four. At four, "Certification"
         style labels wrap to three lines and the row becomes taller than the
         card beneath it. -->
    <dl class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-6">
      <div
        v-for="tile in [
          { key: 'done', label: t('dashboard.statCompleted'), value: done, accent: true },
          { key: 'remaining', label: t('dashboard.statRemaining'), value: remaining, accent: false },
          { key: 'points', label: t('dashboard.statPoints'), value: points, accent: true },
          { key: 'rank', label: t('dashboard.statRank'), value: rank ? `#${rank}` : t('dashboard.unranked'), accent: false }
        ]"
        :key="tile.key"
        class="nb-card p-4"
      >
        <dd
          class="tabular font-display text-2xl font-bold sm:text-3xl"
          :class="tile.accent ? 'text-primary' : 'text-highlighted'"
        >
          {{ tile.value }}
        </dd>
        <dt class="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-dimmed">
          {{ tile.label }}
        </dt>
      </div>
    </dl>

    <div class="grid gap-6 lg:grid-cols-3">
      <UCard class="lg:col-span-2">
        <template #header>
          <p class="font-semibold text-highlighted">
            {{ t('dashboard.yourProgress') }}
          </p>
        </template>

        <div class="mb-2 flex items-baseline justify-between">
          <span class="text-sm text-muted">{{ t('dashboard.lessonsDone', { done, total }) }}</span>
          <span class="tabular text-sm font-bold text-highlighted">{{ percent }}%</span>
        </div>
        <UProgress
          :model-value="percent"
          :max="100"
          :aria-label="t('course.courseProgress')"
        />

        <div
          v-if="loaded && !done"
          class="mt-6 text-sm text-muted"
        >
          {{ t('dashboard.nothingYet') }}
        </div>

        <!-- Recently completed, newest first. Five is enough to recognise
             where you were without turning the card into a log. -->
        <p
          v-else-if="recent.length"
          class="mt-6 text-xs font-semibold uppercase tracking-wide text-dimmed"
        >
          {{ t('dashboard.recentlyCompleted') }}
        </p>
        <ul
          v-if="recent.length"
          class="mt-2 space-y-1"
        >
          <li
            v-for="lesson in recent"
            :key="lesson.path"
          >
            <NuxtLink
              :to="localePath(lesson.path)"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-highlighted"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="size-4 shrink-0 text-primary"
              />
              <span class="min-w-0 flex-1 truncate">{{ lesson.title }}</span>
              <span class="hidden shrink-0 truncate text-xs uppercase tracking-wide text-dimmed sm:block">{{ lesson.moduleTitle }}</span>
            </NuxtLink>
          </li>
        </ul>

        <template
          v-if="resume"
          #footer
        >
          <UButton
            :to="localePath(resume.path)"
            trailing-icon="i-lucide-arrow-right"
            :label="done ? t('dashboard.continueCta') : t('dashboard.startFirst')"
          />
          <p class="mt-2 truncate text-sm text-muted">
            {{ resume.title }}
          </p>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-semibold text-highlighted">
            {{ t('dashboard.plan') }}
          </p>
        </template>

        <div class="flex items-center gap-3">
          <UIcon
            :name="pro ? 'i-lucide-badge-check' : 'i-lucide-lock'"
            class="size-6"
            :class="pro ? 'text-primary' : 'text-muted'"
          />
          <div class="min-w-0">
            <p class="font-medium text-highlighted">
              {{ pro ? t('dashboard.planPro') : t('dashboard.planFree') }}
            </p>
            <p class="text-sm text-muted">
              {{ pro ? t('dashboard.planProDesc') : t('dashboard.planFreeDesc') }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 border-t border-default pt-4">
          <UButton
            :to="localePath('/leaderboard')"
            :label="t('dashboard.viewLeaderboard')"
            icon="i-lucide-trophy"
            color="neutral"
            variant="outline"
            size="sm"
          />
          <UButton
            :to="localePath('/submit')"
            :label="t('dashboard.contribute')"
            icon="i-lucide-circle-plus"
            variant="soft"
            size="sm"
          />
        </div>

        <!-- No upgrade CTA. The button that used to sit here pointed at /pro,
             which is not a page in this repo — it 404'd in all twelve locales
             and the prerender crawler reported it on every build. It comes
             back when there is something to link to. -->
      </UCard>
    </div>
  </UContainer>
</template>
