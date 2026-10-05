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

// The same twelve weeks, as bars for the Blueprint chart.
const activityBars = computed(() => weeks.value.map((w, i) => ({
  label: i === weeks.value.length - 1 ? 'Now' : i % 3 === 0 ? w.week.slice(5) : '',
  value: w.count,
  tone: i === weeks.value.length - 1 ? 'signal' as const : w.count ? 'tide' as const : 'ice' as const,
  title: `Week of ${w.week} · ${w.count}`
})))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('dashboard.kicker')"
      :title="firstName ? t('dashboard.welcomeNamed', { name: firstName }) : t('dashboard.welcome')"
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
      <!-- Tiles before the detail: the headline numbers first, the breakdown
           second. Two columns on a phone so labels do not wrap to three lines. -->
      <dl class="mb-8 grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) lg:grid-cols-4">
        <div
          v-for="(tile, n) in [
            { key: 'done', label: t('dashboard.statCompleted'), value: done, accent: true },
            { key: 'remaining', label: t('dashboard.statRemaining'), value: remaining, accent: false },
            { key: 'points', label: t('dashboard.statPoints'), value: points, accent: true },
            { key: 'rank', label: t('dashboard.statRank'), value: rank ? `#${rank}` : t('dashboard.unranked'), accent: false }
          ]"
          :key="tile.key"
          class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-5"
        >
          <dd
            class="mt-2 text-3xl font-black tabular-nums tracking-[-0.03em] sm:text-4xl"
            :class="tile.accent ? 'text-(--signal)' : 'text-(--ink)'"
          >
            {{ tile.value }}
          </dd>
          <dt class="truncate font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
            K.0{{ n + 1 }} — {{ tile.label }}
          </dt>
        </div>
      </dl>

      <div class="grid gap-6 lg:grid-cols-3">
        <section class="self-start border-[1.5px] border-(--ink) bg-(--card) lg:col-span-2">
          <header class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
            <p class="eyebrow">
              Fig. 01 — {{ t('dashboard.yourProgress') }}
            </p>
            <span class="font-mono text-xs font-semibold tabular-nums">{{ percent }}%</span>
          </header>
          <div class="p-5">
            <p class="mb-2 text-sm text-(--ink2)">
              {{ t('dashboard.lessonsDone', { done, total }) }}
            </p>
            <div
              class="relative h-4 border-[1.5px] border-(--ink) bg-(--paper)"
              role="progressbar"
              :aria-valuenow="percent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t('course.courseProgress')"
            >
              <div
                class="hatch-signal h-full border-e-[1.5px] border-(--ink) transition-[width] duration-700"
                :style="{ width: `${percent}%` }"
              />
              <span
                v-for="i in 9"
                :key="i"
                class="absolute inset-y-0 border-s border-(--ink)"
                :style="{ left: `${i * 10}%` }"
              />
            </div>

            <p
              v-if="loaded && !done"
              class="mt-6 text-sm text-(--ink2)"
            >
              {{ t('dashboard.nothingYet') }}
            </p>

            <!-- Recently completed, newest first. -->
            <p
              v-else-if="recent.length"
              class="mono-label mt-6"
            >
              {{ t('dashboard.recentlyCompleted') }}
            </p>
            <ul
              v-if="recent.length"
              class="mt-2 border-t border-dashed border-(--line)"
            >
              <li
                v-for="lesson in recent"
                :key="lesson.path"
                class="border-b border-dashed border-(--line)"
              >
                <NuxtLink
                  :to="localePath(lesson.path)"
                  class="flex items-center gap-3 px-1 py-2 text-sm transition-colors hover:bg-(--ice)"
                >
                  <span class="flex size-6 flex-none items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) text-white">
                    <UIcon
                      name="i-lucide-check"
                      class="size-3.5"
                    />
                  </span>
                  <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ lesson.title }}</span>
                  <span class="hidden shrink-0 truncate font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2) sm:block">{{ lesson.moduleTitle }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
          <footer
            v-if="resume"
            class="flex flex-wrap items-center gap-4 border-t-[1.5px] border-(--ink) px-5 py-4"
          >
            <UButton
              :to="localePath(resume.path)"
              trailing-icon="i-lucide-arrow-right"
              :label="done ? t('dashboard.continueCta') : t('dashboard.startFirst')"
            />
            <p class="min-w-0 truncate font-mono text-xs uppercase tracking-[.08em] text-(--ink2)">
              Next — {{ resume.title }}
            </p>
          </footer>
        </section>

        <!-- Plan: the navy panel -->
        <section class="graph-paper-navy flex flex-col border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white shadow-[8px_8px_0_var(--signal)]">
          <p class="font-mono text-[10px] uppercase tracking-[.12em] text-(--glow)">
            {{ t('dashboard.plan') }}
          </p>
          <div class="mt-3 flex items-center gap-3">
            <span class="flex size-10 flex-none items-center justify-center border-[1.5px] border-white/60">
              <UIcon
                :name="pro ? 'i-lucide-badge-check' : 'i-lucide-lock'"
                class="size-5"
                :class="pro ? 'text-(--glow)' : 'text-white/70'"
              />
            </span>
            <p class="text-2xl font-black tracking-[-0.02em]">
              {{ pro ? t('dashboard.planPro') : t('dashboard.planFree') }}
            </p>
          </div>
          <p class="mt-3 text-sm text-white/75">
            {{ pro ? t('dashboard.planProDesc') : t('dashboard.planFreeDesc') }}
          </p>

          <UAlert
            v-if="confirming"
            class="mt-4"
            color="info"
            variant="subtle"
            icon="i-lucide-loader-circle"
            title="Confirming your payment…"
            description="This usually takes a few seconds."
          />

          <div class="mt-auto flex flex-wrap gap-2 pt-6">
            <UButton
              v-if="!pro"
              to="/pricing"
              icon="i-lucide-sparkles"
              color="secondary"
              size="sm"
            >
              Upgrade to Pro
            </UButton>
            <UButton
              v-else
              icon="i-lucide-credit-card"
              color="secondary"
              size="sm"
              :loading="portalBusy"
              @click="manageBilling"
            >
              Manage billing
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

        <section class="self-start border-[1.5px] border-(--ink) bg-(--card) lg:col-span-2">
          <header class="flex items-center justify-between border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Fig. 02 — Activity, last 12 weeks
            </p>
            <span class="font-mono text-xs uppercase tracking-[.08em] text-(--ink2)">{{ thisWeek }} this week</span>
          </header>
          <div
            class="graph-paper-fine p-5"
            role="img"
            :aria-label="`Lessons completed per week, last 12 weeks: ${weeks.map(w => w.count).join(', ')}`"
          >
            <BpBarChart
              :bars="activityBars"
              :height="140"
              :format="v => `${v} lessons`"
            />
          </div>
        </section>

        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="border-b-[1.5px] border-(--ink) px-5 py-3">
            <p class="eyebrow">
              Fig. 03 — By section
            </p>
          </header>
          <ul class="max-h-80 overflow-y-auto">
            <li
              v-for="(sec, n) in bySection"
              :key="sec.title"
              class="flex items-center gap-3 border-b border-dashed border-(--line) px-5 py-2.5 last:border-b-0"
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
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
