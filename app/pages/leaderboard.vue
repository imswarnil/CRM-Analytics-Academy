<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Leaderboard',
  description: 'Learners ranked by lessons completed, quizzes passed and contributions accepted.'
})

interface Entry {
  rank: number
  name: string
  image: string | null
  points: number
  lessonsDone: number
  contributions: number
}

// `server: false` on purpose. The page prerenders as a shell and fills in on
// the client: baking a leaderboard into a static file would ship a snapshot
// of the rankings taken at build time and never update it.
const { data, pending } = await useLazyAsyncData('leaderboard', () =>
  $fetch<{ entries: Entry[] }>('/api/leaderboard'), {
  server: false,
  default: () => ({ entries: [] as Entry[] })
})

const entries = computed(() => data.value?.entries ?? [])

const howPoints = computed(() => [
  { icon: 'i-lucide-circle-check', text: t('leaderboard.howLesson') },
  { icon: 'i-lucide-file-question', text: t('leaderboard.howQuiz') },
  { icon: 'i-lucide-link', text: t('leaderboard.howResource') },
  { icon: 'i-lucide-chart-column', text: t('leaderboard.howShowcase') }
])

// Rank 1-3 get the brand; the rest stay quiet. A leaderboard where every row
// is emphasised has no leader.
function rankClass(rank: number) {
  return rank <= 3 ? 'text-primary font-bold' : 'text-muted'
}

// The design system's podium: the top three as cards, champion in the middle
// on the heavier frame, gold/silver/bronze medal circles.
const podium = computed(() => entries.value.slice(0, 3))
const podiumOrder = computed(() => {
  const [first, second, third] = podium.value
  return [second, first, third].filter(e => e !== undefined)
})
const rest = computed(() => entries.value.slice(podium.value.length))

const medal: Record<number, string> = {
  1: 'bg-brand-yellow text-ink',
  2: 'bg-[#C0C0C0] text-white',
  3: 'bg-[#CD7F32] text-white'
}
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <header class="mb-8 max-w-2xl">
      <p class="text-xs font-semibold uppercase tracking-wide text-primary">
        {{ t('leaderboard.kicker') }}
      </p>
      <h1 class="mt-1 text-3xl font-bold text-highlighted sm:text-4xl">
        {{ t('leaderboard.title') }}
      </h1>
      <p class="mt-3 text-muted">
        {{ t('leaderboard.subtitle') }}
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <!-- The podium. Champion in the middle on the heavier frame, the way
             the design draws it; below sm they stack in rank order. -->
        <div
          v-if="podium.length === 3"
          class="mb-8 flex flex-col justify-center gap-4 sm:flex-row sm:items-end"
        >
          <div
            v-for="e in podiumOrder"
            :key="e!.rank"
            class="text-center"
            :class="e!.rank === 1 ? 'nb-frame w-full rounded-2xl p-7 sm:w-56 sm:order-none order-first' : 'nb-card w-full p-5 sm:w-48'"
          >
            <span
              class="font-display mx-auto mb-2.5 flex items-center justify-center rounded-full border-2 border-(--nb-ink) font-bold"
              :class="[medal[e!.rank], e!.rank === 1 ? 'size-14 text-xl' : 'size-12 text-lg']"
            >{{ e!.rank }}</span>
            <p
              class="font-display truncate font-bold text-highlighted"
              :class="e!.rank === 1 ? 'text-lg' : 'text-[0.9375rem]'"
            >
              {{ e!.name }}
            </p>
            <p class="mt-0.5 text-xs text-muted">
              {{ e!.points }} {{ t('leaderboard.points').toLowerCase() }} · {{ e!.lessonsDone }} {{ t('leaderboard.lessons').toLowerCase() }}
            </p>
            <span
              v-if="e!.rank === 1"
              class="nb-tag mt-2 inline-block bg-brand-yellow px-3 py-1 text-[0.625rem] text-ink"
            >🏆 {{ t('leaderboard.champion') }}</span>
          </div>
        </div>

        <!-- Horizontal scroll on the table itself, not the page: a five-column
             table on a phone otherwise makes the whole document scroll
             sideways, including the header above it. -->
        <div class="nb-card overflow-x-auto">
          <table class="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr class="bg-(--nb-subtle)">
                <th class="font-display w-14 border-b-2 border-(--nb-ink) px-4 py-2.5 text-start text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">
                  #
                </th>
                <th class="font-display border-b-2 border-(--nb-ink) py-2.5 text-start text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">
                  {{ t('leaderboard.learner') }}
                </th>
                <th class="font-display border-b-2 border-(--nb-ink) py-2.5 pe-4 text-end text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase">
                  {{ t('leaderboard.points') }}
                </th>
                <th class="font-display border-b-2 border-(--nb-ink) py-2.5 pe-4 text-end text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase max-sm:hidden">
                  {{ t('leaderboard.lessons') }}
                </th>
                <th class="font-display border-b-2 border-(--nb-ink) py-2.5 pe-4 text-end text-[0.625rem] font-bold tracking-[0.08em] text-muted uppercase max-sm:hidden">
                  {{ t('leaderboard.contributions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in (podium.length === 3 ? rest : entries)"
                :key="e.rank"
                class="border-t border-default first:border-t-0"
              >
                <td
                  class="font-display px-4 py-2.5 font-bold"
                  :class="rankClass(e.rank)"
                >
                  {{ e.rank }}
                </td>
                <td class="py-2.5">
                  <span class="flex items-center gap-2">
                    <img
                      v-if="e.image"
                      :src="e.image"
                      alt=""
                      class="size-6 rounded-full"
                      loading="lazy"
                      width="24"
                      height="24"
                    >
                    <span
                      v-else
                      class="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                      aria-hidden="true"
                    >{{ e.name.slice(0, 1).toUpperCase() }}</span>
                    <span class="min-w-0 truncate font-medium text-highlighted">{{ e.name }}</span>
                  </span>
                </td>
                <td class="tabular py-2.5 pe-4 text-end font-semibold text-highlighted">
                  {{ e.points }}
                </td>
                <td class="tabular py-2.5 pe-4 text-end max-sm:hidden">
                  {{ e.lessonsDone }}
                </td>
                <td class="tabular py-2.5 pe-4 text-end max-sm:hidden">
                  {{ e.contributions }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          v-if="!pending && !entries.length"
          class="py-10 text-center text-sm text-muted"
        >
          {{ t('leaderboard.empty') }}
        </p>
        <p
          v-else-if="pending"
          class="py-10 text-center text-sm text-muted"
        >
          …
        </p>
      </div>

      <aside class="space-y-6">
        <div class="nb-card">
          <div class="p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
              {{ t('leaderboard.howKicker') }}
            </p>
            <ul class="mt-2 space-y-2 text-sm text-muted">
              <li
                v-for="row in howPoints"
                :key="row.text"
                class="flex items-start gap-2"
              >
                <UIcon
                  :name="row.icon"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>{{ row.text }}</span>
              </li>
            </ul>
          </div>
          <div class="border-t border-default p-4">
            <NuxtLink
              class="text-primary"
              :to="localePath('/submit')"
            >
              {{ t('nav.submit') }} →
            </NuxtLink>
          </div>
        </div>

        <AdUnit
          placement="sidebarSquare"
          class="w-full"
        />
      </aside>
    </div>
  </UContainer>
</template>
