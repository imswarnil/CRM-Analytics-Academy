<script setup lang="ts">
/**
 * /admin → Leads: every product request from /pro. Each one is also a Lead in
 * Salesforce (the "SF" column says whether Web-to-Lead accepted it). Move a
 * lead through new → contacted → won/lost here; grant Pro in Users.
 */
interface Lead {
  id: number
  product: string
  firstName: string | null
  lastName: string
  email: string
  company: string | null
  title: string | null
  country: string | null
  phone: string | null
  teamSize: string | null
  message: string | null
  userId: string | null
  source: string | null
  landing: string | null
  lessonsDone: number
  points: number
  status: string
  sfStatus: string
  createdAt: string
}

const STATUSES = ['new', 'contacted', 'won', 'lost'] as const
const filter = ref<'' | typeof STATUSES[number]>('new')
const { data, refresh, status } = await useLazyAsyncData('admin-leads', () =>
  $fetch<{ leads: Lead[], totals: { product: string, status: string, count: number }[] }>('/api/admin/leads', { query: { status: filter.value } }),
{ server: false, watch: [filter] })

// Pipeline value at list price, for the products that have one.
const priceOf = (id: string) => Number(productById(id)?.price?.replace(/[^\d.]/g, '') ?? 0)
const pipeline = computed(() => (data.value?.totals ?? []).filter(t => t.status === 'new' || t.status === 'contacted').reduce((s, t) => s + t.count * priceOf(t.product), 0))
const won = computed(() => (data.value?.totals ?? []).filter(t => t.status === 'won').reduce((s, t) => s + t.count * priceOf(t.product), 0))
const count = (st: string) => (data.value?.totals ?? []).filter(t => t.status === st).reduce((s, t) => s + t.count, 0)

async function move(lead: Lead, to: string) {
  await $fetch('/api/admin/leads', { method: 'PATCH', body: { id: lead.id, status: to } })
  await refresh()
}
const date = (d: string) => new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <section class="space-y-6">
    <dl class="grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-4">
      <div
        v-for="tile in [
          { label: 'New leads', value: count('new') },
          { label: 'Contacted', value: count('contacted') },
          { label: 'Open pipeline · list price', value: `$${pipeline.toLocaleString()}` },
          { label: 'Won · list price', value: `$${won.toLocaleString()}` }
        ]"
        :key="tile.label"
        class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4"
      >
        <dd class="mt-1 text-3xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">
          {{ tile.value }}
        </dd>
        <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
          {{ tile.label }}
        </dt>
      </div>
    </dl>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="st in ['', ...STATUSES]"
        :key="st"
        :label="st || 'all'"
        :color="filter === st ? 'primary' : 'neutral'"
        :variant="filter === st ? 'solid' : 'outline'"
        size="xs"
        @click="filter = st as typeof filter"
      />
    </div>

    <p
      v-if="status !== 'pending' && !data?.leads.length"
      class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-(--ink2)"
    >
      No leads here yet. They arrive from /pro.
    </p>

    <ul class="space-y-3">
      <li
        v-for="l in data?.leads"
        :key="l.id"
        class="border-[1.5px] border-(--ink) bg-(--card) p-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="bg-(--ink) px-2 py-0.5 font-mono text-[11px] uppercase text-(--paper)">{{ l.product }}</span>
          <span class="font-bold text-(--ink)">{{ [l.firstName, l.lastName].filter(Boolean).join(' ') }}</span>
          <a
            :href="`mailto:${l.email}`"
            class="text-(--signal) hover:underline"
          >{{ l.email }}</a>
          <span
            v-if="l.company"
            class="text-(--ink2)"
          >· {{ l.company }}<template v-if="l.title">, {{ l.title }}</template></span>
          <span class="ms-auto font-mono text-xs text-(--ink2)">{{ date(l.createdAt) }}</span>
        </div>
        <p
          v-if="l.message"
          class="mt-2 whitespace-pre-line text-sm text-(--ink)"
        >
          {{ l.message }}
        </p>
        <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-(--ink2)">
          <span>{{ l.country ?? '—' }}</span>
          <span v-if="l.teamSize">team {{ l.teamSize }}</span>
          <span v-if="l.phone">{{ l.phone }}</span>
          <span>{{ l.userId ? `${l.lessonsDone} lessons · ${l.points} pts` : 'no account' }}</span>
          <span v-if="l.source">from {{ l.source }}</span>
          <span v-if="l.landing">via {{ l.landing }}</span>
          <span :class="l.sfStatus === 'sent' ? 'text-(--signal)' : 'text-error'">SF: {{ l.sfStatus }}</span>
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-for="st in STATUSES"
            :key="st"
            :label="st"
            size="xs"
            :color="l.status === st ? 'primary' : 'neutral'"
            :variant="l.status === st ? 'solid' : 'outline'"
            @click="move(l, st)"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
