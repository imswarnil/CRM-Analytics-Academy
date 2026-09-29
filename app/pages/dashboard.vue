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
const { completed, pro, points, rank, loaded, isDone, activity, load: reloadProgress } = useProgress()

// Twelve Monday-start weeks ending this week, with gaps filled as zero, so a
// quiet fortnight shows as a gap rather than silently disappearing.
const weeks = computed(() => {
  const byWeek = new Map(activity.value.map(a => [a.week, a.count]))
  const out: { week: string, count: number }[] = []
  const now = new Date()
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((now.getUTCDay() + 6) % 7)))
  for (let i = 11; i >= 0; i--) {
    const d = new Date(monday.getTime() - i * 7 * 86400000)
    const key = d.toISOString().slice(0, 10)
    out.push({ week: key, count: byWeek.get(key) ?? 0 })
  }
  return out
})
const weekMax = computed(() => Math.max(1, ...weeks.value.map(w => w.count)))
const thisWeek = computed(() => weeks.value[weeks.value.length - 1]?.count ?? 0)

// Progress per section, in course order.
const bySection = computed(() => {
  const map = new Map<string, { title: string, total: number, done: number }>()
  for (const l of lessons.value) {
    const row = map.get(l.moduleTitle) ?? { title: l.moduleTitle, total: 0, done: 0 }
    row.total += 1
    if (isDone(l.path)) row.done += 1
    map.set(l.moduleTitle, row)
  }
  return [...map.values()]
})

// Back from checkout. Pro is granted by the payment webhook, which can land a
// few seconds after the redirect, so poll briefly rather than tell someone who
// just paid that they are on the free plan.
const route = useRoute()
const confirming = ref(false)
onMounted(async () => {
  if (route.query.checkout !== 'done' || pro.value) return
  confirming.value = true
  for (let i = 0; i < 10 && !pro.value; i++) {
    await new Promise(r => setTimeout(r, 2000))
    await reloadProgress()
  }
  confirming.value = false
})

const portalBusy = ref(false)
async function manageBilling() {
  portalBusy.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
    window.location.href = url
  } catch {
    portalBusy.value = false
  }
}

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
  <UContainer>
    <UPageHeader
      :headline="t('dashboard.kicker')"
      :title="firstName ? t('dashboard.welcomeNamed', { name: firstName }) : t('dashboard.welcome')"
    />

    <UPageBody>
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
          class="rounded-lg border border-default p-4"
        >
          <dd
            class="text-2xl font-bold tabular-nums sm:text-3xl"
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
            <span class="text-sm font-bold tabular-nums text-highlighted">{{ percent }}%</span>
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

        <UCard class="lg:col-span-2">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-semibold text-highlighted">
                Activity
              </p>
              <span class="text-sm text-muted">{{ thisWeek }} this week</span>
            </div>
          </template>
          <div
            class="flex items-end gap-1.5"
            style="height: 7rem"
            role="img"
            :aria-label="`Lessons completed per week, last 12 weeks: ${weeks.map(w => w.count).join(', ')}`"
          >
            <div
              v-for="w in weeks"
              :key="w.week"
              class="flex-1 rounded-sm"
              :class="w.count ? 'bg-primary' : 'bg-elevated'"
              :style="{ height: `${Math.max(6, (w.count / weekMax) * 100)}%` }"
              :title="`Week of ${w.week}: ${w.count}`"
            />
          </div>
          <div class="mt-2 flex justify-between text-xs text-muted">
            <span>12 weeks ago</span>
            <span>This week</span>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <p class="font-semibold text-highlighted">
              By section
            </p>
          </template>
          <ul class="max-h-72 space-y-2.5 overflow-y-auto pe-1">
            <li
              v-for="sec in bySection"
              :key="sec.title"
            >
              <div class="flex justify-between gap-2 text-xs">
                <span class="truncate text-toned">{{ sec.title }}</span>
                <span class="im-figure shrink-0 text-muted">{{ sec.done }}/{{ sec.total }}</span>
              </div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  class="h-full rounded-full bg-primary"
                  :style="{ width: `${sec.total ? (sec.done / sec.total) * 100 : 0}%` }"
                />
              </div>
            </li>
          </ul>
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

          <UAlert
            v-if="confirming"
            class="mt-4"
            color="info"
            variant="subtle"
            icon="i-lucide-loader-circle"
            title="Confirming your payment…"
            description="This usually takes a few seconds."
          />

          <div class="mt-3 flex flex-wrap gap-2">
            <UButton
              v-if="!pro"
              to="/pricing"
              icon="i-lucide-sparkles"
              size="sm"
            >
              Upgrade to Pro
            </UButton>
            <UButton
              v-else
              icon="i-lucide-credit-card"
              color="neutral"
              variant="ghost"
              size="sm"
              :loading="portalBusy"
              @click="manageBilling"
            >
              Manage billing
            </UButton>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UContainer>
</template>
