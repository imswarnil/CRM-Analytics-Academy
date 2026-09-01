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
        <!-- Horizontal scroll on the table itself, not the page: a five-column
             table on a phone otherwise makes the whole document scroll
             sideways, including the header above it. -->
        <div class="overflow-x-auto">
          <table class="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr>
                <th class="w-12 border-b border-default pb-2 text-start font-semibold text-dimmed">
                  #
                </th>
                <th class="border-b border-default pb-2 text-start font-semibold text-dimmed">
                  {{ t('leaderboard.learner') }}
                </th>
                <th class="border-b border-default pb-2 text-end font-semibold text-dimmed">
                  {{ t('leaderboard.points') }}
                </th>
                <th class="border-b border-default pb-2 text-end font-semibold text-dimmed max-sm:hidden">
                  {{ t('leaderboard.lessons') }}
                </th>
                <th class="border-b border-default pb-2 text-end font-semibold text-dimmed max-sm:hidden">
                  {{ t('leaderboard.contributions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in entries"
                :key="e.rank"
              >
                <td
                  class="border-t border-default py-2"
                  :class="rankClass(e.rank)"
                >
                  {{ e.rank }}
                </td>
                <td class="border-t border-default py-2">
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
                      class="flex size-6 items-center justify-center rounded-full bg-elevated text-xs font-semibold"
                      aria-hidden="true"
                    >{{ e.name.slice(0, 1).toUpperCase() }}</span>
                    <span class="min-w-0 truncate font-medium text-highlighted">{{ e.name }}</span>
                  </span>
                </td>
                <td class="tabular border-t border-default py-2 text-end font-semibold text-highlighted">
                  {{ e.points }}
                </td>
                <td class="tabular border-t border-default py-2 text-end max-sm:hidden">
                  {{ e.lessonsDone }}
                </td>
                <td class="tabular border-t border-default py-2 text-end max-sm:hidden">
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
        <div class="rounded-md border border-default">
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
