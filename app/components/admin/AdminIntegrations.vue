<script setup lang="ts">
/**
 * /admin → Integrations: the GTM stack, and whether each piece is switched on.
 *
 * Every tool here collects its own data from the browser or its own crawler —
 * none of them costs the Worker a request. The site's part is small and
 * static: a beacon token, a verification meta tag, UTM tags on shared links,
 * the first-touch source captured at sign-up and sent to Salesforce.
 */
const { public: pub } = useRuntimeConfig()

// The Salesforce account sync (server/utils/sf-sync.ts): status and "Sync now".
interface SyncRun {
  id: number
  trigger: string
  status: string
  candidates: number
  changed: number
  sent: number
  created: number
  updated: number
  failed: number
  calls: number
  error: string | null
  startedAt: string
  finishedAt: string | null
}
interface SyncStatus {
  configured: boolean
  instance: string | null
  apiVersion: string | null
  paused: boolean
  runs: SyncRun[]
  counts: { kind: string, count: number, failing: number, last: string | null }[]
  errors: { kind: string, extId: string, status: string, at: string }[]
}
const { data: sync, refresh: refreshSync, error: syncError } = await useLazyAsyncData('admin-sf-sync', () => $fetch<SyncStatus>('/api/admin/salesforce'), { server: false })
const syncing = ref(false)
const syncResult = ref<string | null>(null)
async function syncNow() {
  syncing.value = true
  syncResult.value = null
  try {
    const r = await $fetch<{ status: string, changed: number, sent: number, failed: number, errors: string[] }>('/api/admin/salesforce', { method: 'POST' })
    syncResult.value = `${r.status}: ${r.changed} changed, ${r.sent} sent, ${r.failed} failed${r.errors.length ? ` — ${r.errors[0]}` : ''}`
  } catch (e) {
    syncResult.value = `Failed: ${(e as { statusMessage?: string }).statusMessage ?? String(e)}`
  } finally {
    syncing.value = false
    await refreshSync()
  }
}
const KIND_LABEL: Record<string, string> = { org: 'Accounts (orgs)', learner: 'Academy Learners', seat: 'Seat Assignments' }
const when = (d: string | null) => (d ? new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')

interface Tool {
  name: string
  icon: string
  what: string
  on: boolean
  how: string
  to: string
}
const TOOLS = computed<Tool[]>(() => [
  {
    name: 'Cloudflare Web Analytics',
    icon: 'i-simple-icons-cloudflare',
    what: 'Traffic, pages, referrers, countries, Core Web Vitals. Cookieless, no Worker requests.',
    on: Boolean(pub.cfBeaconToken),
    how: 'Set NUXT_PUBLIC_CF_BEACON_TOKEN (Cloudflare → Web Analytics → add site → copy the token).',
    to: 'https://dash.cloudflare.com/?to=/:account/web-analytics'
  },
  {
    name: 'Google Search Console',
    icon: 'i-simple-icons-googlesearchconsole',
    what: 'Search queries, impressions, clicks, indexing. The sitemap is /sitemap_index.xml.',
    on: Boolean(pub.gscVerification),
    how: 'Domain property is verified by DNS; for a URL-prefix property set NUXT_PUBLIC_GSC_VERIFICATION.',
    to: 'https://search.google.com/search-console'
  },
  {
    name: 'Source tagging (UTM)',
    icon: 'i-lucide-tags',
    what: 'Every share link carries utm_source/utm_medium. A visitor\'s first source is kept in their browser and attached to their sign-up and to any lead.',
    on: true,
    how: 'Built in. Tag your own links: ?utm_source=linkedin&utm_medium=post&utm_campaign=<name>.',
    to: '/admin?tab=leads'
  },
  {
    name: 'Salesforce (Web-to-Lead)',
    icon: 'i-simple-icons-salesforce',
    what: 'Sign-ups, purchases and "talk to us" requests become Leads with their source, first-party enrichment and score, in your org.',
    on: true,
    how: 'Built in, no credentials; field ids live in LEAD_FIELDS (server/utils/salesforce.ts). The account sync is the panel above.',
    to: 'https://login.salesforce.com/'
  },
  {
    name: 'Google AdSense',
    icon: 'i-simple-icons-googleadsense',
    what: 'Ads for free learners only; Pro members never see one.',
    on: true,
    how: 'Client id in nuxt.config.ts; units in app/utils/promo.ts.',
    to: 'https://adsense.google.com/'
  },
  {
    name: 'Stripe',
    icon: 'i-simple-icons-stripe',
    what: 'Pro Monthly and Pro Lifetime checkouts, the customer portal and the webhook.',
    on: true,
    how: 'pnpm stripe:setup --webhook, then STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the Worker.',
    to: 'https://dashboard.stripe.com/'
  },
  {
    name: 'Channel conversations',
    icon: 'i-lucide-messages-square',
    what: 'Where learners talk to you: YouTube comments, LinkedIn, GitHub discussions. Reply there; nothing is pulled into the site.',
    on: true,
    how: 'Links below; tag every link you post so it shows up in sources.',
    to: 'https://studio.youtube.com/channel/comments'
  }
])
</script>

<template>
  <section class="mb-6 rounded-[6px] border border-(--line) bg-(--card) p-5">
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex size-9 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
        <UIcon
          name="i-lucide-refresh-cw"
          class="size-5"
        />
      </span>
      <h3 class="flex-1 font-semibold text-(--ink)">
        Salesforce account sync
      </h3>
      <span
        class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
        :class="sync?.configured ? (sync.paused ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success') : 'bg-(--paper) text-(--ink2)'"
      >{{ !sync ? '…' : !sync.configured ? 'Not configured' : sync.paused ? 'Paused' : 'On' }}</span>
      <UButton
        size="sm"
        icon="i-lucide-refresh-cw"
        :loading="syncing"
        :disabled="!sync?.configured"
        @click="syncNow"
      >
        Sync now
      </UButton>
    </div>
    <p class="mt-3 text-sm text-(--ink2)">
      Hourly, only changed rows: active self-serve learners → <b>Academy Learner</b> (by Academy_User_Id__c), team orgs →
      <b>Account</b> (Academy_Org_Id__c), seats → <b>Seat Assignment</b> (Academy_Seat_Key__c). REST API, OAuth client
      credentials, at most SF_SYNC_MAX_RECORDS records and SF_SYNC_MAX_CALLS calls a run.
    </p>
    <p
      v-if="syncError"
      class="mt-2 text-xs text-error"
    >
      Could not read the sync status (has migrate-2026-11-23-gtm.sql been applied?).
    </p>
    <p
      v-else-if="sync && !sync.configured"
      class="mt-2 text-xs text-(--label)"
    >
      Set SF_INSTANCE_URL, SF_CLIENT_ID and SF_CLIENT_SECRET on the Worker (salesforce/CRM-PROCESS.md → "Account sync" has the setup).
    </p>
    <p
      v-else-if="sync"
      class="mt-2 text-xs text-(--label)"
    >
      {{ sync.instance }} · API {{ sync.apiVersion }}<template v-if="sync.paused">
        · three refused tokens in a row: the hourly run is paused for 24 hours, "Sync now" still runs
      </template>
    </p>
    <p
      v-if="syncResult"
      class="mt-2 font-mono text-xs text-(--ink)"
    >
      {{ syncResult }}
    </p>

    <dl
      v-if="sync?.counts.length"
      class="mt-4 grid grid-cols-3 border-s border-t border-(--line)"
    >
      <div
        v-for="c in sync.counts"
        :key="c.kind"
        class="flex flex-col-reverse border-e border-b border-(--line) p-3"
      >
        <dd class="text-xs text-(--ink2)">
          {{ c.count }} in sync<template v-if="c.failing">
            · <span class="text-error">{{ c.failing }} failing</span>
          </template> · {{ when(c.last) }}
        </dd>
        <dt class="text-[11px] font-medium text-(--ink)">
          {{ KIND_LABEL[c.kind] ?? c.kind }}
        </dt>
      </div>
    </dl>

    <div
      v-if="sync?.runs.length"
      class="mt-4 overflow-x-auto"
    >
      <table class="w-full text-xs">
        <thead class="text-left text-(--ink2)">
          <tr>
            <th class="py-1 pe-3 font-semibold">
              Run
            </th>
            <th class="py-1 pe-3 font-semibold">
              Status
            </th>
            <th class="py-1 pe-3 font-semibold">
              Changed / sent
            </th>
            <th class="py-1 pe-3 font-semibold">
              New / updated / failed
            </th>
            <th class="py-1 pe-3 font-semibold">
              Calls
            </th>
            <th class="py-1 font-semibold">
              Error
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in sync.runs"
            :key="r.id"
            class="border-t border-(--line) align-top"
          >
            <td class="py-1 pe-3 whitespace-nowrap">
              {{ when(r.startedAt) }} · {{ r.trigger }}
            </td>
            <td
              class="py-1 pe-3"
              :class="r.status === 'ok' ? 'text-(--signal)' : r.status === 'partial' ? 'text-warning' : 'text-error'"
            >
              {{ r.status }}
            </td>
            <td class="py-1 pe-3 tabular-nums">
              {{ r.changed }} / {{ r.sent }}
            </td>
            <td class="py-1 pe-3 tabular-nums">
              {{ r.created }} / {{ r.updated }} / {{ r.failed }}
            </td>
            <td class="py-1 pe-3 tabular-nums">
              {{ r.calls }}
            </td>
            <td class="py-1 text-(--ink2) break-all">
              {{ r.error?.split('\n')[0] ?? '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul
      v-if="sync?.errors.length"
      class="mt-3 space-y-0.5 font-mono text-[11px] text-error"
    >
      <li
        v-for="e in sync.errors"
        :key="`${e.kind}${e.extId}`"
      >
        {{ e.kind }} {{ e.extId }}: {{ e.status }}
      </li>
    </ul>
  </section>

  <div class="grid gap-4 md:grid-cols-2">
    <article
      v-for="tool in TOOLS"
      :key="tool.name"
      class="flex flex-col rounded-[6px] border border-(--line) bg-(--card) p-5"
    >
      <div class="flex items-center gap-3">
        <span class="flex size-9 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
          <UIcon
            :name="tool.icon"
            class="size-5"
          />
        </span>
        <h3 class="flex-1 font-semibold text-(--ink)">
          {{ tool.name }}
        </h3>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
          :class="tool.on ? 'bg-success/10 text-success' : 'bg-(--paper) text-(--ink2)'"
        >{{ tool.on ? 'On' : 'Off' }}</span>
      </div>
      <p class="mt-3 text-sm text-(--ink2)">
        {{ tool.what }}
      </p>
      <p class="mt-2 text-xs text-(--label)">
        {{ tool.how }}
      </p>
      <UButton
        :to="tool.to"
        :target="tool.to.startsWith('http') ? '_blank' : undefined"
        size="sm"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
        class="mt-4 self-start"
      >
        Open
      </UButton>
    </article>
  </div>
</template>
