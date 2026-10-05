<script setup lang="ts">
/**
 * /admin → Sponsors: the twelve-month booking calendar, refunds to make,
 * manual (invoice / complimentary) bookings, and every creative with pause /
 * reject / restore and its impressions and clicks.
 *
 * One sponsor per calendar month, $99, every placement. Paid months come
 * from the Dodo webhook; this screen never marks a checkout paid itself.
 */
import type { PartnerFormat, PartnerMode, PartnerTheme } from '#shared/utils/partner'

interface Booking {
  id: string
  month: string
  status: string
  source: string
  holdExpiresAt: string | null
  paidAt: string | null
  paymentId: string | null
  amountCents: number | null
  needsRefund: boolean
  note: string | null
  createdAt: string
  sponsorId: string
  sponsor: string
  email: string
}
interface Creative {
  id: string
  format: PartnerFormat
  mode: PartnerMode
  imageUrl: string | null
  imageMobileUrl: string | null
  logoUrl: string | null
  headline: string | null
  body: string | null
  cta: string | null
  theme: PartnerTheme
  clickUrl: string
  alt: string | null
  status: string
  reviewNote: string | null
  updatedAt: string
  publishedAt: string | null
  sponsor: string
  email: string
  impressions: number
  clicks: number
}
interface Payload {
  bookings: Booking[]
  creatives: Creative[]
  sponsors: { id: string, name: string, website: string | null, email: string, createdAt: string, paidMonths: number }[]
  window: string[]
  priceUsd: number
}

const { data, status, refresh, error: loadError } = await useFetch<Payload>('/api/admin/sponsors', { server: false })
const current = partnerMonthKey(new Date())
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number) as [number, number]
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))
}
const date = (s: string | null) => (s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')

const live = computed(() => (data.value?.bookings ?? []).filter(b => b.status === 'paid' || b.status === 'held'))
const byMonth = computed(() => new Map(live.value.map(b => [b.month, b])))
const refunds = computed(() => (data.value?.bookings ?? []).filter(b => b.needsRefund))

const totals = computed(() => {
  const paid = (data.value?.bookings ?? []).filter(b => b.status === 'paid')
  const cents = paid.reduce((n, b) => n + (b.amountCents ?? 0), 0)
  const cr = data.value?.creatives ?? []
  return {
    'This month': byMonth.value.get(current)?.status === 'paid' ? byMonth.value.get(current)!.sponsor : 'Open',
    'Months sold': String(paid.length),
    'Revenue': `$${(cents / 100).toLocaleString('en-US')}`,
    'Impressions': cr.reduce((n, c) => n + c.impressions, 0).toLocaleString('en-US'),
    'Clicks': cr.reduce((n, c) => n + c.clicks, 0).toLocaleString('en-US'),
    'Refunds due': String(refunds.value.length)
  }
})

const actionError = ref('')
async function call(url: string, method: 'PATCH' | 'POST', body: Record<string, unknown>) {
  actionError.value = ''
  try {
    await $fetch(url, { method, body })
    await refresh()
    return true
  } catch (e) {
    actionError.value = apiError(e) || 'The request failed.'
    return false
  }
}

function cancelBooking(b: Booking) {
  const note = prompt(`Cancel ${monthLabel(b.month)} for ${b.sponsor}? ${b.status === 'paid' && b.source === 'dodo' ? 'Refund it in the Dodo dashboard too. ' : ''}Optional note:`)
  if (note === null) return
  call('/api/admin/sponsors/bookings', 'PATCH', { id: b.id, action: 'cancel', note })
}
function markRefunded(b: Booking) {
  if (!confirm(`Mark ${monthLabel(b.month)} for ${b.sponsor} as refunded in Dodo?`)) return
  call('/api/admin/sponsors/bookings', 'PATCH', { id: b.id, action: 'refunded' })
}
function moderate(c: Creative, next: 'paused' | 'rejected' | 'published' | 'draft') {
  let note: string | null = ''
  if (next === 'rejected' || next === 'paused') {
    note = prompt(`${next === 'rejected' ? 'Reject' : 'Pause'} this creative. Note for the sponsor (shown in their studio):`)
    if (note === null) return
  }
  call('/api/admin/sponsors/creatives', 'PATCH', { id: c.id, status: next, note })
}

// ---- manual booking ---------------------------------------------------------
const manual = reactive({ email: '', name: '', website: '', source: 'invoice' as 'invoice' | 'comp', amountUsd: 99, note: '', months: [] as string[] })
const manualBusy = ref(false)
const manualMsg = ref('')
function toggleMonth(m: string) {
  manual.months = manual.months.includes(m) ? manual.months.filter(x => x !== m) : [...manual.months, m].sort()
}
async function book() {
  manualBusy.value = true
  manualMsg.value = ''
  const ok = await call('/api/admin/sponsors/bookings', 'POST', { ...manual })
  manualBusy.value = false
  if (ok) {
    manualMsg.value = 'Booked.'
    manual.months = []
  }
}

const filter = ref<'all' | 'published' | 'draft' | 'paused' | 'rejected'>('all')
const creatives = computed(() => (data.value?.creatives ?? []).filter(c => filter.value === 'all' || c.status === filter.value))
const ctr = (c: Creative) => (c.impressions ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : '—')
const statusTone = (s: string) => s === 'published'
  ? 'border-(--signal) text-(--signal)'
  : s === 'rejected' || s === 'paused' ? 'border-error text-error' : 'border-(--ink) text-(--ink2)'
const inputClass = 'mt-1 w-full border-[1.5px] border-(--ink) bg-(--card) px-3 py-2 text-sm outline-none focus:border-(--signal)'
</script>

<template>
  <div class="space-y-8">
    <p
      v-if="loadError"
      class="text-sm text-error"
    >
      Could not load sponsorships. Has server/db/010_sponsors.sql been applied?
    </p>

    <div class="grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-3 lg:grid-cols-6">
      <div
        v-for="(v, k) in totals"
        :key="k"
        class="-mb-[1.5px] -me-[1.5px] border-b-[1.5px] border-e-[1.5px] border-(--ink) p-4"
      >
        <p class="mono-label">
          {{ k }}
        </p>
        <p class="mt-1 truncate text-2xl font-black text-(--signal)">
          {{ v }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3">
      <p
        v-if="actionError"
        class="text-sm text-error"
        role="alert"
      >
        {{ actionError }}
      </p>
      <span v-else />
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

    <!-- Refunds -->
    <section
      v-if="refunds.length"
      class="border-[1.5px] border-error bg-(--card)"
    >
      <p class="border-b-[1.5px] border-error px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-error">
        Refunds to make — paid after the hold lapsed, month already taken
      </p>
      <ul class="divide-y divide-dashed divide-(--line)">
        <li
          v-for="b in refunds"
          :key="b.id"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm"
        >
          <span><strong>{{ b.sponsor }}</strong> · {{ monthLabel(b.month) }} · {{ b.email }} · payment {{ b.paymentId ?? '—' }}</span>
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            @click="markRefunded(b)"
          >
            Mark refunded
          </UButton>
        </li>
      </ul>
    </section>

    <!-- Calendar -->
    <section>
      <p class="eyebrow">
        Bookings · next twelve months
      </p>
      <ol class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <li
          v-for="m in data?.window ?? []"
          :key="m"
          class="flex min-h-32 flex-col border-[1.5px] p-3"
          :class="byMonth.get(m)?.status === 'paid' ? 'border-(--ink) bg-(--ice)' : byMonth.get(m) ? 'border-dashed border-(--ink2) bg-(--card)' : 'border-(--line) bg-(--card)'"
        >
          <span class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">{{ monthLabel(m) }}<template v-if="m === current"> · now</template></span>
          <template v-if="byMonth.get(m)">
            <span class="mt-1 truncate font-bold">{{ byMonth.get(m)!.sponsor }}</span>
            <span class="truncate text-xs text-(--ink2)">{{ byMonth.get(m)!.email }}</span>
            <span class="mt-1 font-mono text-[10px] uppercase">
              {{ byMonth.get(m)!.status }} · {{ byMonth.get(m)!.source }}
              <template v-if="byMonth.get(m)!.status === 'held'"> · until {{ date(byMonth.get(m)!.holdExpiresAt) }}</template>
            </span>
            <button
              type="button"
              class="mt-auto self-start pt-2 font-mono text-[10px] uppercase text-error hover:underline"
              @click="cancelBooking(byMonth.get(m)!)"
            >
              Cancel
            </button>
          </template>
          <span
            v-else
            class="mt-1 text-sm text-(--ink2)"
          >Open</span>
        </li>
      </ol>
    </section>

    <!-- Manual booking -->
    <section class="border-[1.5px] border-(--ink) bg-(--card) p-5">
      <p class="eyebrow">
        Manual booking — invoice or complimentary
      </p>
      <p class="mt-1 text-sm text-(--ink2)">
        The sponsor needs an account on the site (they build their creatives in /sponsor/studio). Months are marked paid at once.
      </p>
      <form
        class="mt-4 grid gap-3 md:grid-cols-3"
        @submit.prevent="book"
      >
        <label class="block">
          <span class="mono-label">Account email</span>
          <input
            v-model="manual.email"
            type="email"
            required
            :class="inputClass"
          >
        </label>
        <label class="block">
          <span class="mono-label">Brand name (new sponsors)</span>
          <input
            v-model="manual.name"
            maxlength="80"
            :class="inputClass"
          >
        </label>
        <label class="block">
          <span class="mono-label">Website</span>
          <input
            v-model="manual.website"
            type="url"
            :class="inputClass"
          >
        </label>
        <label class="block">
          <span class="mono-label">Source</span>
          <select
            v-model="manual.source"
            :class="inputClass"
          >
            <option value="invoice">Invoice</option>
            <option value="comp">Complimentary</option>
          </select>
        </label>
        <label
          v-if="manual.source === 'invoice'"
          class="block"
        >
          <span class="mono-label">Amount per month (USD)</span>
          <input
            v-model.number="manual.amountUsd"
            type="number"
            min="0"
            :class="inputClass"
          >
        </label>
        <label class="block">
          <span class="mono-label">Note</span>
          <input
            v-model="manual.note"
            maxlength="500"
            :class="inputClass"
          >
        </label>
        <div class="md:col-span-3">
          <span class="mono-label">Months</span>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <button
              v-for="m in data?.window ?? []"
              :key="m"
              type="button"
              class="border-[1.5px] px-2 py-1 font-mono text-[10px] uppercase disabled:opacity-40"
              :class="manual.months.includes(m) ? 'border-(--signal) bg-(--signal) text-white' : 'border-(--ink)'"
              :disabled="byMonth.has(m)"
              @click="toggleMonth(m)"
            >
              {{ monthLabel(m) }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3 md:col-span-3">
          <UButton
            type="submit"
            icon="i-lucide-calendar-plus"
            :loading="manualBusy"
            :disabled="!manual.months.length"
          >
            Book {{ manual.months.length || '' }} month{{ manual.months.length === 1 ? '' : 's' }}
          </UButton>
          <span class="text-xs text-(--ink2)">{{ manualMsg }}</span>
        </div>
      </form>
    </section>

    <!-- Creatives -->
    <section>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="eyebrow">
          Creatives
        </p>
        <div class="flex gap-1 border-[1.5px] border-(--ink) bg-(--card) p-1">
          <UButton
            v-for="f in (['all', 'published', 'draft', 'paused', 'rejected'] as const)"
            :key="f"
            size="xs"
            :color="filter === f ? 'primary' : 'neutral'"
            :variant="filter === f ? 'solid' : 'ghost'"
            @click="filter = f"
          >
            {{ f }}
          </UButton>
        </div>
      </div>
      <p
        v-if="!creatives.length"
        class="mt-3 border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
      >
        No creatives here.
      </p>
      <div class="mt-3 space-y-3">
        <div
          v-for="c in creatives"
          :key="c.id"
          class="grid gap-4 border-[1.5px] border-(--ink) bg-(--card) p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div class="min-w-0">
            <div :class="c.format === 'leaderboard' ? 'aspect-[728/90] w-full max-w-[728px]' : c.format === 'square' ? 'aspect-[300/250] w-[200px]' : 'h-32 w-full max-w-[680px]'">
              <PromoCreative
                :creative="c"
                variant="desktop"
              />
            </div>
            <p class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
              <span
                class="border-[1.5px] px-1.5 py-0.5"
                :class="statusTone(c.status)"
              >{{ c.status }}</span>
              <span class="font-bold text-(--ink)">{{ c.sponsor }}</span>
              <span>{{ c.format }}</span>
              <span>{{ c.impressions.toLocaleString('en-US') }} imp · {{ c.clicks.toLocaleString('en-US') }} clicks · CTR {{ ctr(c) }}</span>
              <a
                :href="c.clickUrl"
                target="_blank"
                rel="noopener nofollow"
                class="truncate normal-case text-(--signal) hover:underline"
              >{{ c.clickUrl }}</a>
            </p>
            <p
              v-if="c.reviewNote"
              class="mt-1 text-xs text-(--ink2)"
            >
              Note: {{ c.reviewNote }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="c.status === 'published'"
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-lucide-pause"
              @click="moderate(c, 'paused')"
            >
              Pause
            </UButton>
            <UButton
              v-if="c.status === 'paused' || c.status === 'rejected'"
              size="xs"
              icon="i-lucide-play"
              @click="moderate(c, 'published')"
            >
              Restore live
            </UButton>
            <UButton
              v-if="c.status !== 'rejected'"
              size="xs"
              color="error"
              variant="outline"
              icon="i-lucide-ban"
              @click="moderate(c, 'rejected')"
            >
              Reject
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Sponsors -->
    <section v-if="data?.sponsors.length">
      <p class="eyebrow">
        Sponsor accounts
      </p>
      <ul class="mt-3 divide-y divide-dashed divide-(--line) border-[1.5px] border-(--ink) bg-(--card)">
        <li
          v-for="s in data.sponsors"
          :key="s.id"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm"
        >
          <span><strong>{{ s.name }}</strong> · {{ s.email }}<template v-if="s.website"> · {{ s.website }}</template></span>
          <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ s.paidMonths }} paid month{{ s.paidMonths === 1 ? '' : 's' }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
