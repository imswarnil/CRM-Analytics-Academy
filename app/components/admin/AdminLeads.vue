<script setup lang="ts">
/**
 * The leads inbox: every business form on the site (contact, sales, quotes,
 * teams, training, implementation, sponsorship, instructor applications,
 * nominations) in one table, with the company each lead was enriched from,
 * where it stands in the CRM hand-off, and a slideover to work it.
 */
interface Lead {
  id: number
  type: string
  name: string
  email: string
  company: string | null
  companyDomain: string | null
  role: string | null
  phone: string | null
  country: string | null
  seats: number | null
  budget: string | null
  message: string | null
  sourcePage: string | null
  utm: Record<string, string>
  details: Record<string, string>
  companyName: string | null
  logoUrl: string | null
  siteTitle: string | null
  siteDescription: string | null
  enrichedAt: string | null
  n8nStatus: 'pending' | 'sent' | 'failed' | 'not_configured'
  n8nAttempts: number
  n8nLastError: string | null
  n8nSentAt: string | null
  salesforceId: string | null
  status: string
  owner: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'sales', label: 'Sales' },
  { value: 'quote', label: 'Quote' },
  { value: 'team', label: 'Team' },
  { value: 'training', label: 'Training' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'nomination', label: 'Nomination' },
  { value: 'contact', label: 'Contact' }
]
const TYPE_ICON: Record<string, string> = {
  project: 'i-lucide-handshake',
  sales: 'i-lucide-briefcase-business',
  quote: 'i-lucide-file-text',
  team: 'i-lucide-users',
  training: 'i-lucide-school',
  implementation: 'i-lucide-wrench',
  sponsor: 'i-lucide-heart-handshake',
  instructor: 'i-lucide-presentation',
  nomination: 'i-lucide-award',
  contact: 'i-lucide-mail'
}
const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'] as const
const statusItems: string[] = [...STATUSES]
const N8N_META: Record<Lead['n8nStatus'], { label: string, cls: string }> = {
  sent: { label: 'In CRM', cls: 'border-(--signal) text-(--signal)' },
  pending: { label: 'Sending', cls: 'border-(--line) text-(--ink2)' },
  failed: { label: 'CRM failed', cls: 'border-error text-error' },
  not_configured: { label: 'No CRM', cls: 'border-(--line) text-(--ink2)' }
}

// Another tab can open this one pre-filtered by setting this state.
const presetType = useState<string | null>('admin-leads-type', () => null)
const preset = presetType.value && TYPES.some(x => x.value === presetType.value) ? presetType.value : null
presetType.value = null
const type = ref(preset ?? 'all')
// Arriving pre-filtered means "show me all of these", not only the new ones.
const status = ref<string>(preset ? 'all' : 'new')
const q = ref('')
const page = ref(1)
const leads = ref<Lead[]>([])
const total = ref(0)
const pageSize = ref(50)
const counts = ref<Record<string, number>>({})
const loading = ref(false)
const error = ref('')
const toast = useToast()

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ leads: Lead[], total: number, pageSize: number, counts: Record<string, number> }>('/api/admin/leads', {
      query: {
        type: type.value === 'all' ? undefined : type.value,
        status: status.value === 'all' ? undefined : status.value,
        q: q.value.trim() || undefined,
        page: page.value
      }
    })
    leads.value = res.leads
    total.value = res.total
    pageSize.value = res.pageSize
    counts.value = res.counts
  } catch (e) {
    error.value = apiError(e) || 'Could not load leads.'
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(q, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})
watch([type, status], () => {
  page.value = 1
  load()
})
watch(page, load)
onMounted(load)

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// ---- The slideover -------------------------------------------------------
const open = ref(false)
const current = ref<Lead | null>(null)
const draft = reactive<{ status: string, owner: string, notes: string }>({ status: 'new', owner: '', notes: '' })
const saving = ref(false)
const busy = ref<'' | 'enrich' | 'forward'>('')

function openLead(lead: Lead) {
  current.value = lead
  draft.status = lead.status
  draft.owner = lead.owner ?? ''
  draft.notes = lead.notes ?? ''
  open.value = true
}

async function save() {
  if (!current.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/leads/${current.value.id}`, { method: 'PATCH', body: { ...draft } })
    toast.add({ title: 'Lead updated', icon: 'i-lucide-check' })
    open.value = false
    await load()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not save', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function enrich() {
  if (!current.value) return
  busy.value = 'enrich'
  try {
    const res = await $fetch<{ companyName: string | null, logoUrl: string | null, siteTitle: string | null, siteDescription: string | null }>(`/api/admin/leads/${current.value.id}/enrich`, { method: 'POST' })
    Object.assign(current.value, res)
    toast.add({ title: res.companyName ? `Enriched: ${res.companyName}` : 'Enriched', icon: 'i-lucide-sparkles' })
    load()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not enrich', color: 'error' })
  } finally {
    busy.value = ''
  }
}

async function forward() {
  if (!current.value) return
  busy.value = 'forward'
  try {
    const res = await $fetch<{ status: Lead['n8nStatus'], error?: string }>(`/api/admin/leads/${current.value.id}/forward`, { method: 'POST' })
    current.value.n8nStatus = res.status
    current.value.n8nLastError = res.error ?? null
    toast.add({
      title: res.status === 'sent' ? 'Sent to the CRM' : res.status === 'not_configured' ? 'n8n is not configured yet' : `Failed: ${res.error}`,
      color: res.status === 'failed' ? 'error' : undefined
    })
    load()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not send', color: 'error' })
  } finally {
    busy.value = ''
  }
}

const date = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const label = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
</script>

<template>
  <section>
    <!-- Filters -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <div class="inline-flex flex-wrap border-[1.5px] border-(--ink) bg-(--card)">
        <button
          v-for="s in ['all', ...STATUSES]"
          :key="s"
          type="button"
          class="px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.08em] transition-colors"
          :class="status === s ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="status = s"
        >
          {{ s }}<span
            v-if="s !== 'all' && counts[s]"
            class="ms-1 opacity-60"
          >{{ counts[s] }}</span>
        </button>
      </div>
      <USelect
        v-model="type"
        :items="TYPES"
        size="sm"
        class="w-44"
      />
      <UInput
        v-model="q"
        icon="i-lucide-search"
        size="sm"
        placeholder="Name, email, company…"
        class="w-56"
      />
      <div class="ms-auto flex gap-2">
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          to="/api/admin/leads/export.csv"
          external
          target="_blank"
        >
          CSV
        </UButton>
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          aria-label="Refresh"
          @click="load"
        />
      </div>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error"
      class="mb-4"
    />

    <!-- Table -->
    <div class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)">
      <table class="w-full min-w-[760px] text-sm">
        <thead class="border-b-[1.5px] border-(--ink) bg-(--ice)">
          <tr class="text-start font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
            <th class="px-3 py-2 text-start">
              Company
            </th>
            <th class="px-3 py-2 text-start">
              Contact
            </th>
            <th class="px-3 py-2 text-start">
              Type
            </th>
            <th class="px-3 py-2 text-start">
              Status
            </th>
            <th class="px-3 py-2 text-start">
              CRM
            </th>
            <th class="px-3 py-2 text-end">
              Received
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && !leads.length">
            <td
              colspan="6"
              class="px-3 py-10 text-center text-(--ink2)"
            >
              No leads here yet.
            </td>
          </tr>
          <tr
            v-for="l in leads"
            :key="l.id"
            class="cursor-pointer border-b border-dashed border-(--line) last:border-b-0 hover:bg-(--ice)/60"
            @click="openLead(l)"
          >
            <td class="px-3 py-2.5">
              <div class="flex items-center gap-2.5">
                <span class="flex size-8 flex-none items-center justify-center overflow-hidden border-[1.5px] border-(--ink) bg-(--paper)">
                  <img
                    v-if="l.logoUrl"
                    :src="l.logoUrl"
                    alt=""
                    class="size-5 object-contain"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  >
                  <UIcon
                    v-else
                    name="i-lucide-building-2"
                    class="size-4 text-(--ink2)"
                  />
                </span>
                <span class="min-w-0">
                  <span class="block truncate font-bold text-(--ink)">{{ l.companyName || l.company || '—' }}</span>
                  <span class="block truncate font-mono text-[10px] text-(--ink2)">{{ l.companyDomain || 'personal email' }}</span>
                </span>
              </div>
            </td>
            <td class="px-3 py-2.5">
              <span class="block font-semibold text-(--ink)">{{ l.name }}</span>
              <span class="block truncate text-xs text-(--ink2)">{{ l.email }}</span>
            </td>
            <td class="px-3 py-2.5">
              <span class="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.06em]">
                <UIcon
                  :name="TYPE_ICON[l.type] ?? 'i-lucide-inbox'"
                  class="size-3.5 text-(--signal)"
                />{{ l.type }}
              </span>
              <span
                v-if="l.seats"
                class="block font-mono text-[10px] text-(--ink2)"
              >{{ l.seats }} seats</span>
            </td>
            <td class="px-3 py-2.5">
              <span class="border-[1.5px] border-(--ink) px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]">{{ l.status }}</span>
            </td>
            <td class="px-3 py-2.5">
              <span
                class="border-[1.5px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]"
                :class="N8N_META[l.n8nStatus].cls"
                :title="l.n8nLastError ?? undefined"
              >{{ N8N_META[l.n8nStatus].label }}</span>
            </td>
            <td class="px-3 py-2.5 text-end font-mono text-[11px] text-(--ink2)">
              {{ date(l.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pages > 1"
      class="mt-4 flex items-center justify-end gap-2 font-mono text-xs"
    >
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-chevron-left"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="page--"
      />
      {{ page }} / {{ pages }}
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-chevron-right"
        :disabled="page >= pages"
        aria-label="Next page"
        @click="page++"
      />
    </div>

    <!-- Working a lead -->
    <USlideover
      v-model:open="open"
      :title="current ? `${current.name} — ${current.type}` : 'Lead'"
      :ui="{ content: 'max-w-xl' }"
    >
      <template #body>
        <div
          v-if="current"
          class="space-y-6"
        >
          <div class="flex items-start gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4">
            <span class="flex size-12 flex-none items-center justify-center overflow-hidden border-[1.5px] border-(--ink) bg-(--paper)">
              <img
                v-if="current.logoUrl"
                :src="current.logoUrl"
                alt=""
                class="size-8 object-contain"
                referrerpolicy="no-referrer"
              >
              <UIcon
                v-else
                name="i-lucide-building-2"
                class="size-5 text-(--ink2)"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-extrabold text-(--ink)">
                {{ current.companyName || current.company || 'No company' }}
              </p>
              <a
                v-if="current.companyDomain"
                :href="`https://${current.companyDomain}`"
                target="_blank"
                rel="noopener"
                class="font-mono text-[11px] text-(--signal) hover:underline"
              >{{ current.companyDomain }} ↗</a>
              <p
                v-if="current.siteDescription"
                class="mt-2 text-sm text-(--ink2)"
              >
                {{ current.siteDescription }}
              </p>
              <p class="mt-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
                {{ current.enrichedAt ? `Enriched ${date(current.enrichedAt)}` : 'Not enriched' }}
              </p>
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-lucide-sparkles"
              :loading="busy === 'enrich'"
              :disabled="!current.companyDomain"
              @click="enrich"
            >
              Enrich
            </UButton>
          </div>

          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt class="mono-label">
                Email
              </dt>
              <dd>
                <a
                  :href="`mailto:${current.email}`"
                  class="text-(--signal) hover:underline"
                >{{ current.email }}</a>
              </dd>
            </div>
            <div
              v-for="[k, v] in ([['Role', current.role], ['Phone', current.phone], ['Country', current.country], ['Seats', current.seats], ['Budget', current.budget], ['Page', current.sourcePage]] as const).filter(([, v]) => v)"
              :key="k"
            >
              <dt class="mono-label">
                {{ k }}
              </dt>
              <dd class="text-(--ink)">
                {{ v }}
              </dd>
            </div>
            <div
              v-for="(v, k) in current.details"
              :key="k"
            >
              <dt class="mono-label">
                {{ label(String(k)) }}
              </dt>
              <dd class="break-words text-(--ink)">
                <a
                  v-if="/^https?:\/\//.test(v)"
                  :href="v"
                  target="_blank"
                  rel="noopener"
                  class="text-(--signal) hover:underline"
                >{{ v }}</a>
                <template v-else>
                  {{ v }}
                </template>
              </dd>
            </div>
            <div
              v-for="(v, k) in current.utm"
              :key="k"
            >
              <dt class="mono-label">
                {{ k }}
              </dt>
              <dd class="text-(--ink)">
                {{ v }}
              </dd>
            </div>
          </dl>

          <div
            v-if="current.message"
            class="border-s-[3px] border-(--signal) bg-(--ice)/60 p-3 text-sm whitespace-pre-line text-(--ink)"
          >
            {{ current.message }}
          </div>

          <div class="flex flex-wrap items-center gap-3 border-[1.5px] border-(--ink) p-3">
            <span
              class="border-[1.5px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]"
              :class="N8N_META[current.n8nStatus].cls"
            >{{ N8N_META[current.n8nStatus].label }}</span>
            <span class="min-w-0 flex-1 text-xs text-(--ink2)">
              <template v-if="current.salesforceId">Salesforce {{ current.salesforceId }}</template>
              <template v-else-if="current.n8nLastError">{{ current.n8nLastError }}</template>
              <template v-else-if="current.n8nStatus === 'not_configured'">Set N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET to send leads to Salesforce.</template>
              <template v-else>{{ current.n8nAttempts }} attempt(s)</template>
            </span>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-lucide-send"
              :loading="busy === 'forward'"
              @click="forward"
            >
              {{ current.n8nStatus === 'sent' ? 'Resend' : 'Send to CRM' }}
            </UButton>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Status">
              <USelect
                v-model="draft.status"
                :items="statusItems"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Owner">
              <UInput
                v-model="draft.owner"
                placeholder="Who is working it"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Notes">
            <UTextarea
              v-model="draft.notes"
              :rows="5"
              autoresize
              class="w-full"
            />
          </UFormField>
          <p class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
            #{{ current.id }} · received {{ date(current.createdAt) }} · updated {{ date(current.updatedAt) }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="open = false"
          >
            Close
          </UButton>
          <UButton
            :loading="saving"
            icon="i-lucide-check"
            @click="save"
          >
            Save
          </UButton>
        </div>
      </template>
    </USlideover>
  </section>
</template>
