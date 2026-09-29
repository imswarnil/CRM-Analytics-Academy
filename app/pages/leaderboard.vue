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
  isMe?: boolean
}

// All-time rewards whoever started first; the 30-day board is the one a
// newcomer can climb this month. Both use the same point weights.
const period = ref<'all' | 'month'>('all')

// `server: false` on purpose. The page prerenders as a shell and fills in on
// the client: baking a leaderboard into a static file would ship a snapshot
// of the rankings taken at build time and never update it.
const { data, pending } = await useLazyAsyncData(() => `leaderboard-${period.value}`, () =>
  $fetch<{ entries: Entry[], me: Entry | null }>('/api/leaderboard', { query: { period: period.value } }), {
  server: false,
  watch: [period],
  default: () => ({ entries: [] as Entry[], me: null })
})

// The signed-in learner's own row, shown under the table when they are not
// already in the visible list.
const me = computed(() => data.value?.me ?? null)
const meOffBoard = computed(() => me.value && !entries.value.some(e => e.isMe))

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
  return rank <= 3 ? 'text-(--signal) font-bold' : 'text-(--ink2)'
}

// The podium: the top three as cards, champion in the middle, gold/silver/
// bronze in Blueprint tones, standing on plinths of 3/2/1 height.
const podium = computed(() => entries.value.slice(0, 3))
const podiumOrder = computed(() => {
  const [first, second, third] = podium.value
  return [second, first, third].filter(e => e !== undefined)
})
const rest = computed(() => entries.value.slice(podium.value.length))

const medal: Record<number, string> = {
  1: 'bg-(--signal) text-white',
  2: 'bg-(--tide) text-white',
  3: 'bg-(--frost) text-(--ink)'
}
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('leaderboard.kicker')"
      :title="t('leaderboard.title')"
      :lead="t('leaderboard.subtitle')"
    >
      <div class="mt-8 inline-flex border-[1.5px] border-(--ink) bg-(--card)">
        <button
          v-for="p in [{ key: 'all', label: 'All time', icon: 'i-lucide-infinity' }, { key: 'month', label: 'Last 30 days', icon: 'i-lucide-calendar-days' }] as const"
          :key="p.key"
          type="button"
          class="flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[.1em] transition-colors"
          :class="period === p.key ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="period = p.key"
        >
          <UIcon
            :name="p.icon"
            class="size-4"
          />
          {{ p.label }}
        </button>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <!-- The podium: champion in the middle on the tallest plinth; below
               sm they stack in rank order. -->
          <div
            v-if="podium.length === 3"
            class="graph-paper-fine mb-8 flex flex-col justify-center gap-0 border-[1.5px] border-(--ink) px-6 pt-8 sm:flex-row sm:items-end"
          >
            <div
              v-for="e in podiumOrder"
              :key="e!.rank"
              class="flex w-full flex-col items-center text-center sm:w-52"
              :class="e!.rank === 1 ? 'order-first sm:order-none' : ''"
            >
              <span
                class="mb-2.5 flex items-center justify-center border-[1.5px] border-(--ink) font-black"
                :class="[medal[e!.rank], e!.rank === 1 ? 'size-14 text-2xl' : 'size-11 text-lg']"
              >{{ e!.rank }}</span>
              <p
                class="max-w-full truncate font-extrabold text-(--ink)"
                :class="e!.rank === 1 ? 'text-lg' : 'text-[0.9375rem]'"
              >
                {{ e!.name }}
              </p>
              <p class="mt-0.5 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
                {{ e!.points }} {{ t('leaderboard.points').toLowerCase() }} · {{ e!.lessonsDone }} {{ t('leaderboard.lessons').toLowerCase() }}
              </p>
              <span
                v-if="e!.rank === 1"
                class="mt-2 bg-(--glow) px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-(--ink)"
              >{{ t('leaderboard.champion') }}</span>
              <div
                class="mt-4 w-full border-[1.5px] border-b-0 border-(--ink)"
                :class="e!.rank === 1 ? 'hatch-signal h-28' : e!.rank === 2 ? 'hatch h-20 bg-(--card)' : 'hatch h-12 bg-(--card)'"
              />
            </div>
          </div>

          <!-- Horizontal scroll on the table itself, not the page. -->
          <div class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)">
            <table class="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr class="bg-(--ice)">
                  <th class="w-14 border-b-[1.5px] border-(--ink) px-4 py-2.5 text-start font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink)">
                    #
                  </th>
                  <th class="border-b-[1.5px] border-(--ink) py-2.5 text-start font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink)">
                    {{ t('leaderboard.learner') }}
                  </th>
                  <th class="border-b-[1.5px] border-(--ink) py-2.5 pe-4 text-end font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink)">
                    {{ t('leaderboard.points') }}
                  </th>
                  <th class="border-b-[1.5px] border-(--ink) py-2.5 pe-4 text-end font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink) max-sm:hidden">
                    {{ t('leaderboard.lessons') }}
                  </th>
                  <th class="border-b-[1.5px] border-(--ink) py-2.5 pe-4 text-end font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink) max-sm:hidden">
                    {{ t('leaderboard.contributions') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="e in (podium.length === 3 ? rest : entries)"
                  :key="e.rank"
                  class="border-t border-dashed border-(--line) first:border-t-0"
                  :class="e.isMe ? 'bg-(--ice)' : ''"
                >
                  <td
                    class="px-4 py-2.5 font-mono"
                    :class="rankClass(e.rank)"
                  >
                    {{ String(e.rank).padStart(2, '0') }}
                  </td>
                  <td class="py-2.5">
                    <span class="flex items-center gap-2">
                      <img
                        v-if="e.image"
                        :src="e.image"
                        alt=""
                        class="size-6 border-[1.5px] border-(--ink)"
                        loading="lazy"
                        width="24"
                        height="24"
                      >
                      <span
                        v-else
                        class="flex size-6 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) text-xs font-bold text-white"
                        aria-hidden="true"
                      >{{ e.name.slice(0, 1).toUpperCase() }}</span>
                      <span class="min-w-0 truncate font-semibold text-(--ink)">{{ e.name }}</span>
                      <span
                        v-if="e.isMe"
                        class="border-[1.5px] border-(--signal) px-1 font-mono text-[10px] uppercase text-(--signal)"
                      >You</span>
                    </span>
                  </td>
                  <td class="py-2.5 pe-4 text-end font-bold tabular-nums text-(--ink)">
                    {{ e.points }}
                  </td>
                  <td class="py-2.5 pe-4 text-end font-mono tabular-nums text-(--ink2) max-sm:hidden">
                    {{ e.lessonsDone }}
                  </td>
                  <td class="py-2.5 pe-4 text-end font-mono tabular-nums text-(--ink2) max-sm:hidden">
                    {{ e.contributions }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="meOffBoard && me"
            class="mt-4 flex items-center justify-between border-[1.5px] border-(--ink) bg-(--ice) px-4 py-3 text-sm"
          >
            <span class="font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">Your position</span>
            <span class="font-bold text-(--ink)">
              #{{ me.rank }} · {{ me.points }} points
            </span>
          </div>

          <p
            v-if="!pending && !entries.length"
            class="py-10 text-center text-sm text-(--ink2)"
          >
            {{ t('leaderboard.empty') }}
          </p>
          <p
            v-else-if="pending"
            class="py-10 text-center font-mono text-sm text-(--ink2)"
          >
            …
          </p>
        </div>

        <aside class="space-y-6">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <div class="p-4">
              <p class="eyebrow">
                {{ t('leaderboard.howKicker') }}
              </p>
              <ul class="mt-3 space-y-2.5 text-sm text-(--ink2)">
                <li
                  v-for="row in howPoints"
                  :key="row.text"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    :name="row.icon"
                    class="mt-0.5 size-4 shrink-0 text-(--signal)"
                  />
                  <span>{{ row.text }}</span>
                </li>
              </ul>
            </div>
            <div class="border-t-[1.5px] border-(--ink) p-4">
              <NuxtLink
                class="font-mono text-xs font-semibold uppercase tracking-[.1em] text-(--signal)"
                :to="localePath('/submit')"
              >
                {{ t('nav.submit') }} →
              </NuxtLink>
            </div>
          </div>

          <PromoSlot
            placement="sidebarSquare"
            class="w-full"
          />
        </aside>
      </div>
    </div>
  </div>
</template>
