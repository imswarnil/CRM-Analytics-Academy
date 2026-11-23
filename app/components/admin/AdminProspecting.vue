<script setup lang="ts">
/**
 * /admin → Prospecting: find companies and people, find and verify emails,
 * lists, sequences sent from the owner's own Gmail, suppression, GDPR.
 * Providers (Apollo, Hunter, …) are switched on by their env vars; without a
 * key the matching tools say "connect a provider". English-only, admin-only.
 */
interface Status {
  providers: { id: string, label: string, env: string, capabilities: string[], configured: boolean, implemented: boolean, calls30d: number, cacheHits30d: number }[]
  gmail: { configured: boolean, email: string | null, status: string | null, connectedAt: string | null, redirectUri: string }
  settings: Record<string, unknown>
  lastRun: { status: string, sent: number, polled: number, replies: number, bounces: number, waiting: number, stopped: number, cap: number, sentLastDay: number, errors: string[], at: string } | null
  counts: { byStatus: Record<string, number>, sentLastDay: number, sentTotal: number, suppressed: number }
}
const { data: status, refresh, error } = await useLazyAsyncData('admin-prospecting', () => $fetch<Status>('/api/admin/prospecting/status'), { server: false })

type Sub = 'companies' | 'people' | 'prospects' | 'sequences' | 'settings'
const SUBS: { key: Sub, label: string, icon: string }[] = [
  { key: 'companies', label: 'Companies', icon: 'i-lucide-building' },
  { key: 'people', label: 'People', icon: 'i-lucide-user-search' },
  { key: 'prospects', label: 'Prospects & lists', icon: 'i-lucide-contact' },
  { key: 'sequences', label: 'Sequences', icon: 'i-lucide-send' },
  { key: 'settings', label: 'Sending & suppression', icon: 'i-lucide-shield-check' }
]
const sub = ref<Sub>('prospects')
// People search can be opened from a company row.
const peopleDomain = ref('')
function findPeople(domain: string) {
  peopleDomain.value = domain
  sub.value = 'people'
}

const credits = ref<{ provider: string, label: string, credits: { label: string, used: number | null, available: number | null }[], error: string | null }[] | null>(null)
async function loadCredits() {
  credits.value = (await $fetch<{ credits: NonNullable<typeof credits.value> }>('/api/admin/prospecting/credits')).credits
}

const running = ref(false)
const runResult = ref<string | null>(null)
async function runNow() {
  running.value = true
  try {
    const r = await $fetch<{ status: string, sent: number, polled: number, replies: number, bounces: number, waiting: number, cap: number, sentLastDay: number, errors: string[] }>('/api/admin/prospecting/run', { method: 'POST' })
    runResult.value = `${r.status}: ${r.sent} sent (cap ${r.cap}, ${r.sentLastDay} in 24 h), ${r.polled} threads checked, ${r.replies} replies, ${r.bounces} bounces, ${r.waiting} outside the window${r.errors.length ? ` — ${r.errors[0]}` : ''}`
  } catch (e) {
    runResult.value = (e as { statusMessage?: string }).statusMessage ?? String(e)
  } finally {
    running.value = false
    await refresh()
  }
}
const anyProvider = computed(() => status.value?.providers.some(p => p.configured && p.implemented))
</script>

<template>
  <section class="space-y-5">
    <p
      v-if="error"
      class="rounded-[6px] border border-error/30 bg-error/5 p-4 text-sm text-error"
    >
      Prospecting is not ready: {{ (error as { statusMessage?: string }).statusMessage ?? 'the database tables are missing' }}. Apply server/db/migrate-2026-11-23-prospecting.sql.
    </p>

    <div class="grid gap-3 md:grid-cols-[1fr_auto]">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-for="p in status?.providers"
          :key="p.id"
          class="rounded-full border px-2.5 py-1 text-xs"
          :class="p.configured && p.implemented ? 'border-success/40 bg-success/10 text-success' : 'border-(--line) text-(--ink2)'"
          :title="p.implemented ? `${p.capabilities.join(', ')} · ${p.calls30d} paid calls, ${p.cacheHits30d} cache hits in 30 days` : 'Adapter slot — not implemented yet'"
        >
          {{ p.label }} · {{ !p.implemented ? 'slot' : p.configured ? 'on' : `set ${p.env}` }}
        </span>
        <span
          class="rounded-full border px-2.5 py-1 text-xs"
          :class="status?.gmail.email && status.gmail.status === 'ok' ? 'border-success/40 bg-success/10 text-success' : 'border-warning/40 bg-warning/10 text-warning'"
        >
          Gmail · {{ status?.gmail.email ? `${status.gmail.email}${status.gmail.status !== 'ok' ? ` (${status.gmail.status})` : ''}` : 'not connected — Integrations' }}
        </span>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-gauge"
          :disabled="!anyProvider"
          @click="loadCredits"
        >
          Credits
        </UButton>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-(--ink2)">{{ status?.counts.sentLastDay ?? 0 }} sent in 24 h · {{ status?.counts.suppressed ?? 0 }} suppressed</span>
        <UButton
          size="sm"
          icon="i-lucide-play"
          :loading="running"
          :disabled="!status?.gmail.email"
          @click="runNow"
        >
          Run now
        </UButton>
      </div>
    </div>
    <ul
      v-if="credits"
      class="space-y-1 rounded-[6px] border border-(--line) bg-(--card) p-3 text-xs"
    >
      <li
        v-for="c in credits"
        :key="c.provider"
      >
        <b>{{ c.label }}</b>:
        <template v-if="c.error">
          <span class="text-error">{{ c.error }}</span>
        </template>
        <template v-else>
          {{ c.credits.map(x => `${x.label} ${x.used ?? '?'} used / ${x.available ?? '?'} left`).join(' · ') || 'no quota exposed' }}
        </template>
      </li>
      <li v-if="!credits.length">
        No connected provider reports credits.
      </li>
    </ul>
    <p
      v-if="runResult || status?.lastRun"
      class="font-mono text-[11px] text-(--ink2)"
    >
      {{ runResult ?? `Last run ${new Date(status!.lastRun!.at).toLocaleString()}: ${status!.lastRun!.status}, ${status!.lastRun!.sent} sent, ${status!.lastRun!.replies} replies, ${status!.lastRun!.bounces} bounces` }}
    </p>

    <div class="flex flex-wrap gap-2 border-b border-(--line) pb-3">
      <UButton
        v-for="s in SUBS"
        :key="s.key"
        :icon="s.icon"
        :label="s.label"
        size="sm"
        :color="sub === s.key ? 'primary' : 'neutral'"
        :variant="sub === s.key ? 'solid' : 'outline'"
        @click="sub = s.key"
      />
    </div>

    <AdminProspectingCompanies
      v-if="sub === 'companies'"
      :enabled="Boolean(status?.providers.some(p => p.configured && p.capabilities.includes('companies')))"
      @people="findPeople"
    />
    <AdminProspectingPeople
      v-else-if="sub === 'people'"
      :enabled="Boolean(status?.providers.some(p => p.configured && p.capabilities.includes('people')))"
      :domain="peopleDomain"
    />
    <AdminProspectingProspects
      v-else-if="sub === 'prospects'"
      :finder="Boolean(status?.providers.some(p => p.configured && p.capabilities.includes('find')))"
      :verifier="Boolean(status?.providers.some(p => p.configured && p.capabilities.includes('verify')))"
    />
    <AdminProspectingSequences v-else-if="sub === 'sequences'" />
    <AdminProspectingSettings
      v-else
      @saved="refresh"
    />
  </section>
</template>
