<script setup lang="ts">
/**
 * /admin → Revenue & sponsors: MRR from Pro and teams, sponsorship income, and
 * every sponsorship with its next step — send the Stripe invoice, approve or
 * return the banner, mark paid, end. Views, clicks and CTR per sponsor.
 */
interface Sponsorship {
  id: number
  company: string
  email: string
  package: string
  status: string
  creative: Record<string, string>
  creativeStatus: string
  reviewNote: string | null
  invoiceUrl: string | null
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  views: number
  clicks: number
}
interface Revenue { configured: boolean, mrr: number, pro: { monthly: number, yearly: number, cancelling: number, mrr: number }, teams: { count: number, seats: number, mrr: number }, sponsors: { live: number, open: number, income: number } }

const { data: revenue } = await useLazyFetch<Revenue>('/api/admin/revenue', { server: false })
const { data, refresh } = await useLazyFetch<{ sponsors: Sponsorship[] }>('/api/admin/sponsors', { server: false })
const busy = ref(0)
const error = ref('')
const notes = reactive<Record<number, string>>({})
async function act(s: Sponsorship, action: string) {
  busy.value = s.id
  error.value = ''
  try {
    await $fetch('/api/admin/sponsors', { method: 'POST', body: { id: s.id, action, note: notes[s.id] } })
    await refresh()
  } catch (e) {
    error.value = apiError(e) || 'Could not do that.'
  } finally {
    busy.value = 0
  }
}
const usd = (n: number) => `$${n.toLocaleString()}`
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '—')
</script>

<template>
  <section class="space-y-6">
    <UAlert
      v-if="revenue && !revenue.configured"
      color="warning"
      variant="subtle"
      icon="i-lucide-key-round"
      title="Stripe is not connected yet"
      description="Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the Worker, then run pnpm stripe:setup. Until then checkout and invoices answer 'not set up'."
    />
    <dl
      v-if="revenue"
      class="grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-3 lg:grid-cols-6"
    >
      <div
        v-for="tile in [
          { label: 'MRR', value: usd(revenue.mrr) },
          { label: 'ARR', value: usd(revenue.mrr * 12) },
          { label: 'Pro · monthly / yearly', value: `${revenue.pro.monthly} / ${revenue.pro.yearly}` },
          { label: 'Teams · seats', value: `${revenue.teams.count} · ${revenue.teams.seats}` },
          { label: 'Cancelling at period end', value: revenue.pro.cancelling },
          { label: 'Sponsorship income', value: usd(revenue.sponsors.income) }
        ]"
        :key="tile.label"
        class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-4"
      >
        <dd class="mt-1 text-2xl font-black tabular-nums text-(--ink)">
          {{ tile.value }}
        </dd>
        <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
          {{ tile.label }}
        </dt>
      </div>
    </dl>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="error"
      :close="{ onClick: () => { error = '' } }"
    />

    <p
      v-if="!data?.sponsors.length"
      class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-(--ink2)"
    >
      No sponsorships yet. Requests arrive from /sponsor.
    </p>
    <ul class="space-y-4">
      <li
        v-for="s in data?.sponsors"
        :key="s.id"
        class="border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="flex flex-wrap items-center gap-3 border-b-[1.5px] border-(--ink) px-4 py-2.5">
          <span class="bg-(--ink) px-2 py-0.5 font-mono text-[11px] uppercase text-(--paper)">{{ s.status }}</span>
          <span class="font-bold text-(--ink)">{{ s.company }}</span>
          <a
            :href="`mailto:${s.email}`"
            class="text-sm text-(--signal) hover:underline"
          >{{ s.email }}</a>
          <span class="font-mono text-xs text-(--ink2)">{{ s.package }} · {{ date(s.startsAt) }} → {{ date(s.endsAt) }}</span>
          <span class="ms-auto font-mono text-xs tabular-nums text-(--ink2)">{{ s.views }} views · {{ s.clicks }} clicks · {{ s.views ? Math.round((s.clicks / s.views) * 1000) / 10 : 0 }}% CTR</span>
        </header>
        <div class="space-y-3 p-4">
          <div class="border-[1.5px] border-(--ink)">
            <SponsorCard
              :company="s.company"
              :creative="s.creative"
              preview
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-[11px] uppercase text-(--ink2)">banner: {{ s.creativeStatus }}</span>
            <UButton
              v-if="s.status === 'requested'"
              size="xs"
              icon="i-lucide-receipt"
              :loading="busy === s.id"
              @click="act(s, 'invoice')"
            >
              Send Stripe invoice
            </UButton>
            <UButton
              v-if="s.invoiceUrl"
              :to="s.invoiceUrl"
              target="_blank"
              size="xs"
              variant="link"
            >
              Invoice
            </UButton>
            <UButton
              v-if="s.creativeStatus === 'submitted'"
              size="xs"
              icon="i-lucide-check"
              :loading="busy === s.id"
              @click="act(s, 'approve')"
            >
              Approve banner
            </UButton>
            <template v-if="s.creativeStatus === 'submitted'">
              <UInput
                v-model="notes[s.id]"
                size="xs"
                placeholder="What to change"
                class="w-56"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                @click="act(s, 'changes')"
              >
                Ask for changes
              </UButton>
            </template>
            <UButton
              v-if="s.status === 'requested' || s.status === 'invoiced'"
              size="xs"
              color="neutral"
              variant="outline"
              @click="act(s, 'paid')"
            >
              Mark paid
            </UButton>
            <UButton
              v-if="s.status === 'live'"
              size="xs"
              color="error"
              variant="ghost"
              @click="act(s, 'end')"
            >
              End now
            </UButton>
            <UButton
              v-if="s.status === 'requested' || s.status === 'invoiced'"
              size="xs"
              color="neutral"
              variant="ghost"
              class="ms-auto"
              @click="act(s, 'cancel')"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
