<script setup lang="ts">
/**
 * /admin → Leads: seat requests from /pro and interests raised elsewhere
 * (Salesforce set-up, consulting, mentoring). Each one is also a Lead in
 * Salesforce (the "SF" tag says whether Web-to-Lead accepted it). Move a lead
 * through new → contacted → won/lost; a seats lead becomes an organisation
 * with one click ("Create org"), which marks it won.
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
  seats: number | null
  orgKind: string | null
  firstLanding: string | null
  viewsBefore: number | null
}

const STATUSES = ['new', 'contacted', 'won', 'lost'] as const
const filter = ref<'' | typeof STATUSES[number]>('new')
const { data, refresh, status } = await useLazyAsyncData('admin-leads', () =>
  $fetch<{ leads: Lead[], totals: { product: string, status: string, count: number, seats: number }[] }>('/api/admin/leads', { query: { status: filter.value } }),
{ server: false, watch: [filter] })

// Pipeline at list price per year: seats × the seat price × 12; other
// interests are quoted, so they count as leads, not money.
const seatPrice = Number(productById('seats')?.price?.replace(/[^\d.]/g, '') ?? 0)
const value = (t: { seats: number }) => t.seats * seatPrice * 12
const pipeline = computed(() => (data.value?.totals ?? []).filter(t => t.status === 'new' || t.status === 'contacted').reduce((s, t) => s + value(t), 0))
const won = computed(() => (data.value?.totals ?? []).filter(t => t.status === 'won').reduce((s, t) => s + value(t), 0))
const emit = defineEmits<{ orgCreated: [] }>()
const orgError = ref('')
async function createOrg(lead: Lead) {
  orgError.value = ''
  const body = { name: lead.company ?? lead.lastName, kind: lead.orgKind ?? 'company', seats: lead.seats ?? 5, months: 12, leadId: lead.id, adminEmail: lead.email }
  try {
    await $fetch('/api/admin/orgs', { method: 'POST', body }).catch(async (e) => {
      // Not signed up yet: create the org without an admin; add one later in Seats.
      if ((e as { statusCode?: number }).statusCode === 404) return $fetch('/api/admin/orgs', { method: 'POST', body: { ...body, adminEmail: undefined } })
      throw e
    })
    await refresh()
    emit('orgCreated')
  } catch (e) {
    orgError.value = apiError(e) || 'Could not create the organisation.'
  }
}
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
          { label: 'Open seat pipeline · $/yr', value: `$${pipeline.toLocaleString()}` },
          { label: 'Won seats · $/yr', value: `$${won.toLocaleString()}` }
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
    <UAlert
      v-if="orgError"
      color="error"
      variant="subtle"
      :description="orgError"
    />

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
          <span v-if="l.seats">{{ l.seats }} seats<template v-if="l.orgKind"> · {{ l.orgKind }}</template></span>
          <span v-if="l.phone">{{ l.phone }}</span>
          <span>{{ l.userId ? `${l.lessonsDone} lessons · ${l.points} pts` : 'no account' }}</span>
          <span v-if="l.source">from {{ l.source }}</span>
          <span v-if="l.firstLanding">first page {{ l.firstLanding }}</span>
          <span v-if="l.landing">asked on {{ l.landing }}</span>
          <span v-if="l.viewsBefore">{{ l.viewsBefore }} pages read</span>
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
          <UButton
            v-if="l.product === 'seats' && l.status !== 'won'"
            label="Create org"
            icon="i-lucide-building-2"
            size="xs"
            class="ms-auto"
            @click="createOrg(l)"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
