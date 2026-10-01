<script setup lang="ts">
/**
 * /admin → Teams: every self-serve team, its seats, owner and roster.
 * Read-only — seats change through Dodo billing, members through the team's
 * own console.
 */
interface AdminTeam {
  id: string
  name: string
  domain: string
  extraDomains: string[]
  seats: number
  members: number
  pending: number
  status: string
  periodEnd: string | null
  createdAt: string
  subscription: string | null
  ownerEmail: string | null
  roster: { email: string, role: string, joinedAt: string }[]
}

const { data, status, refresh } = await useFetch<{ teams: AdminTeam[] }>('/api/admin/teams', { server: false, default: () => ({ teams: [] }) })
const open = ref<string | null>(null)
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

const totals = computed(() => {
  const t = data.value?.teams ?? []
  const active = t.filter(x => x.status === 'active')
  return {
    teams: t.length,
    active: active.length,
    seats: active.reduce((n, x) => n + x.seats, 0),
    used: active.reduce((n, x) => n + x.members, 0),
    arr: active.reduce((n, x) => n + x.seats * 180, 0)
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-5">
      <div
        v-for="(v, k) in { 'Teams': totals.teams, 'Active': totals.active, 'Seats sold': totals.seats, 'Seats used': totals.used, 'Seat ARR': `$${totals.arr.toLocaleString('en-US')}` }"
        :key="k"
        class="border-b-[1.5px] border-(--ink) p-4 last:border-b-0 sm:border-e-[1.5px] sm:border-b-0 sm:last:border-e-0"
      >
        <p class="mono-label">
          {{ k }}
        </p>
        <p class="mt-1 text-2xl font-black text-(--signal)">
          {{ v }}
        </p>
      </div>
    </div>

    <div class="flex justify-end">
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="status === 'pending'"
        @click="refresh()"
      >
        Refresh
      </UButton>
    </div>

    <p
      v-if="status !== 'pending' && !data?.teams.length"
      class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
    >
      No teams yet. They appear here when someone buys seats on /teams.
    </p>

    <div
      v-for="t in data?.teams"
      :key="t.id"
      class="border-[1.5px] border-(--ink) bg-(--card)"
    >
      <button
        type="button"
        class="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-start hover:bg-(--ice)/50"
        @click="open = open === t.id ? null : t.id"
      >
        <span class="min-w-0 flex-1">
          <span class="block font-extrabold">{{ t.name }}</span>
          <span class="font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)">@{{ t.domain }}<template v-if="t.extraDomains.length"> +{{ t.extraDomains.length }}</template> · owner {{ t.ownerEmail ?? '—' }}</span>
        </span>
        <span class="font-mono text-sm">{{ t.members }}/{{ t.seats }} <span class="text-(--ink2)">(+{{ t.pending }})</span></span>
        <span
          class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase"
          :class="t.status === 'active' ? 'border-(--signal) text-(--signal)' : 'border-(--ink) text-(--ink2)'"
        >{{ t.status }}</span>
        <span class="font-mono text-[10px] uppercase text-(--ink2)">renews {{ date(t.periodEnd) }}</span>
        <UIcon
          :name="open === t.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4"
        />
      </button>
      <ul
        v-if="open === t.id"
        class="border-t-[1.5px] border-(--ink)"
      >
        <li
          v-for="m in t.roster"
          :key="m.email"
          class="flex items-center justify-between border-b border-dashed border-(--line) px-5 py-2 text-sm last:border-b-0"
        >
          <span>{{ m.email }}</span>
          <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ m.role }} · {{ date(m.joinedAt) }}</span>
        </li>
        <li class="px-5 py-2 font-mono text-[10px] text-(--ink2)">
          subscription {{ t.subscription ?? '—' }} · created {{ date(t.createdAt) }}
        </li>
      </ul>
    </div>
  </div>
</template>
