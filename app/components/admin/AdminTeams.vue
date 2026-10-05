<script setup lang="ts">
/**
 * /admin → Teams: every team, bought or granted.
 *
 * Bought teams come from /teams (Dodo seats). Granted teams are created here
 * when a company asks for Pro for its people: seats, an end date, and either
 * named members or auto-join for anyone with a verified address on the
 * company's domain. Both kinds give Pro through the same hasPro() path.
 */
interface RosterRow {
  userId: string
  email: string
  role: string
  joinedAt: string
}
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
  source: 'dodo' | 'admin'
  contactEmail: string | null
  autoJoin: boolean
  note: string | null
  grantedBy: string | null
  roster: RosterRow[]
}
interface AddResult {
  email: string
  status: 'added' | 'invited' | 'already' | 'other-team' | 'no-seat'
  link?: string
  team?: string
}

const toast = useToast()
const { data, status, refresh } = await useFetch<{ teams: AdminTeam[] }>('/api/admin/teams', { server: false, default: () => ({ teams: [] }) })
const open = ref<string | null>(null)
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const isoDay = (s: string | null) => (s ? new Date(s).toISOString().slice(0, 10) : '')
const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const expired = (t: AdminTeam) => Boolean(t.periodEnd && new Date(t.periodEnd) < new Date())

const totals = computed(() => {
  const t = data.value?.teams ?? []
  const active = t.filter(x => x.status === 'active' && !expired(x))
  return {
    teams: t.length,
    active: active.length,
    granted: active.filter(x => x.source === 'admin').length,
    seats: active.reduce((n, x) => n + x.seats, 0),
    used: active.reduce((n, x) => n + x.members, 0)
  }
})

// ---- Grant Pro to a company -------------------------------------------------
const showGrant = ref(false)
const grant = reactive({ name: '', domain: '', extraDomains: '', seats: 10, validUntil: inDays(365), contactEmail: '', autoJoin: true, note: '' })
const granting = ref(false)
async function createGrant() {
  granting.value = true
  try {
    const res = await $fetch<{ id: string }>('/api/admin/teams', { method: 'POST', body: grant })
    toast.add({ title: `Pro granted to ${grant.name}`, icon: 'i-lucide-badge-check' })
    showGrant.value = false
    Object.assign(grant, { name: '', domain: '', extraDomains: '', seats: 10, validUntil: inDays(365), contactEmail: '', autoJoin: true, note: '' })
    await refresh()
    open.value = res.id
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not create the grant', color: 'error' })
  } finally {
    granting.value = false
  }
}

// ---- Edit a team --------------------------------------------------------------
const edits = reactive<Record<string, { seats: number, validUntil: string, autoJoin: boolean, extraDomains: string, contactEmail: string, note: string }>>({})
function editOf(t: AdminTeam) {
  edits[t.id] ??= { seats: t.seats, validUntil: isoDay(t.periodEnd), autoJoin: t.autoJoin, extraDomains: t.extraDomains.join(', '), contactEmail: t.contactEmail ?? '', note: t.note ?? '' }
  return edits[t.id]!
}
const saving = ref<string | null>(null)
async function save(t: AdminTeam, extra: Record<string, unknown> = {}) {
  saving.value = t.id
  try {
    const e = editOf(t)
    await $fetch(`/api/admin/teams/${t.id}`, { method: 'PATCH', body: { ...e, validUntil: e.validUntil || undefined, ...extra } })
    toast.add({ title: 'Saved', icon: 'i-lucide-check' })
    Reflect.deleteProperty(edits, t.id)
    await refresh()
  } catch (err) {
    toast.add({ title: apiError(err) || 'Could not save', color: 'error' })
  } finally {
    saving.value = null
  }
}
function extend(t: AdminTeam, days: number) {
  const from = t.periodEnd && new Date(t.periodEnd) > new Date() ? new Date(t.periodEnd).getTime() : Date.now()
  editOf(t).validUntil = new Date(from + days * 864e5).toISOString().slice(0, 10)
}

// ---- Members ----------------------------------------------------------------
const emails = reactive<Record<string, string>>({})
const added = reactive<Record<string, AddResult[]>>({})
const adding = ref<string | null>(null)
async function addMembers(t: AdminTeam) {
  adding.value = t.id
  try {
    const res = await $fetch<{ results: AddResult[] }>(`/api/admin/teams/${t.id}/members`, { method: 'POST', body: { emails: emails[t.id] ?? '' } })
    added[t.id] = res.results
    emails[t.id] = ''
    await refresh()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not add', color: 'error' })
  } finally {
    adding.value = null
  }
}
async function removeMember(t: AdminTeam, m: RosterRow) {
  try {
    await $fetch(`/api/admin/teams/${t.id}/members/${encodeURIComponent(m.userId)}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not remove', color: 'error' })
  }
}
const resultLabel: Record<AddResult['status'], string> = {
  'added': 'Added — Pro now',
  'invited': 'Invite link',
  'already': 'Already on this team',
  'other-team': 'On another team',
  'no-seat': 'No seat free'
}
async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  toast.add({ title: 'Copied', icon: 'i-lucide-copy' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-5">
      <div
        v-for="(v, k) in { 'Teams': totals.teams, 'Active': totals.active, 'Granted': totals.granted, 'Seats live': totals.seats, 'Seats used': totals.used }"
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

    <div class="flex flex-wrap justify-end gap-2">
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
      <UButton
        size="xs"
        icon="i-lucide-building-2"
        @click="showGrant = !showGrant"
      >
        Grant Pro to a company
      </UButton>
    </div>

    <!-- New grant -->
    <form
      v-if="showGrant"
      class="space-y-4 border-[1.5px] border-(--ink) bg-(--card) p-5"
      @submit.prevent="createGrant"
    >
      <p class="eyebrow">
        New team grant
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Company"
          required
        >
          <UInput
            v-model="grant.name"
            class="w-full"
            placeholder="Acme Corp"
          />
        </UFormField>
        <UFormField
          label="Email domain"
          required
          hint="People on this domain can join"
        >
          <UInput
            v-model="grant.domain"
            class="w-full"
            placeholder="acme.com"
          />
        </UFormField>
        <UFormField
          label="Seats"
          required
        >
          <UInput
            v-model.number="grant.seats"
            type="number"
            min="1"
            max="500"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Pro valid until"
          required
        >
          <UInput
            v-model="grant.validUntil"
            type="date"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Contact email"
          hint="Becomes the team owner when they join"
        >
          <UInput
            v-model="grant.contactEmail"
            type="email"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Extra domains"
          hint="Comma-separated, optional"
        >
          <UInput
            v-model="grant.extraDomains"
            class="w-full"
            placeholder="acme.co.uk, acme.io"
          />
        </UFormField>
      </div>
      <UCheckbox
        v-model="grant.autoJoin"
        label="Auto-join: anyone signing in with a verified address on these domains joins while seats remain"
      />
      <UFormField label="Note (PO number, who asked, terms)">
        <UTextarea
          v-model="grant.note"
          :rows="2"
          class="w-full"
        />
      </UFormField>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="showGrant = false"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          icon="i-lucide-badge-check"
          :loading="granting"
        >
          Grant Pro
        </UButton>
      </div>
    </form>

    <p
      v-if="status !== 'pending' && !data?.teams.length"
      class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
    >
      No teams yet. They appear here when someone buys seats on /teams, or when you grant Pro to a company.
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
          <span class="font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)">@{{ t.domain }}<template v-if="t.extraDomains.length"> +{{ t.extraDomains.length }}</template> · {{ t.ownerEmail ? `owner ${t.ownerEmail}` : t.contactEmail ? `contact ${t.contactEmail}` : 'no owner yet' }}</span>
        </span>
        <span
          class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase"
          :class="t.source === 'admin' ? 'border-(--glow) text-(--ink)' : 'border-(--line) text-(--ink2)'"
        >{{ t.source === 'admin' ? 'granted' : 'bought' }}</span>
        <span class="font-mono text-sm">{{ t.members }}/{{ t.seats }} <span class="text-(--ink2)">(+{{ t.pending }})</span></span>
        <span
          class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase"
          :class="t.status === 'active' && !expired(t) ? 'border-(--signal) text-(--signal)' : 'border-(--ink) text-(--ink2)'"
        >{{ expired(t) ? 'expired' : t.status }}</span>
        <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ t.source === 'admin' ? 'until' : 'renews' }} {{ date(t.periodEnd) }}</span>
        <UIcon
          :name="open === t.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4"
        />
      </button>

      <div
        v-if="open === t.id"
        class="grid gap-0 border-t-[1.5px] border-(--ink) lg:grid-cols-2"
      >
        <!-- Access -->
        <div class="space-y-4 border-b-[1.5px] border-(--ink) p-5 lg:border-e-[1.5px] lg:border-b-0">
          <p class="eyebrow">
            Access
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField label="Seats">
              <UInput
                v-model.number="editOf(t).seats"
                type="number"
                min="1"
                max="500"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Pro valid until">
              <UInput
                v-model="editOf(t).validUntil"
                type="date"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="d in [30, 90, 365]"
              :key="d"
              size="xs"
              color="neutral"
              variant="outline"
              @click="extend(t, d)"
            >
              +{{ d }} days
            </UButton>
          </div>
          <UFormField label="Extra domains">
            <UInput
              v-model="editOf(t).extraDomains"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Contact email">
            <UInput
              v-model="editOf(t).contactEmail"
              type="email"
              class="w-full"
            />
          </UFormField>
          <UCheckbox
            v-model="editOf(t).autoJoin"
            label="Auto-join by verified company email"
          />
          <UFormField label="Note">
            <UTextarea
              v-model="editOf(t).note"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <div class="flex flex-wrap justify-between gap-2">
            <UButton
              v-if="t.status === 'active'"
              color="error"
              variant="outline"
              size="sm"
              icon="i-lucide-ban"
              :loading="saving === t.id"
              @click="save(t, { status: 'inactive' })"
            >
              Revoke Pro
            </UButton>
            <UButton
              v-else
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-rotate-ccw"
              :loading="saving === t.id"
              @click="save(t, { status: 'active' })"
            >
              Reactivate
            </UButton>
            <UButton
              size="sm"
              icon="i-lucide-save"
              :loading="saving === t.id"
              @click="save(t)"
            >
              Save
            </UButton>
          </div>
          <p class="font-mono text-[10px] text-(--ink2)">
            {{ t.source === 'admin' ? `granted by ${t.grantedBy ?? '—'}` : `subscription ${t.subscription ?? '—'}` }} · created {{ date(t.createdAt) }}
          </p>
        </div>

        <!-- Members -->
        <div class="space-y-4 p-5">
          <p class="eyebrow">
            Members
          </p>
          <UFormField
            label="Add by email"
            hint="Comma or newline separated"
          >
            <UTextarea
              v-model="emails[t.id]"
              :rows="3"
              class="w-full"
              placeholder="ana@acme.com, raj@acme.com"
            />
          </UFormField>
          <div class="flex justify-end">
            <UButton
              size="sm"
              icon="i-lucide-user-plus"
              :loading="adding === t.id"
              :disabled="!emails[t.id]?.trim()"
              @click="addMembers(t)"
            >
              Add
            </UButton>
          </div>
          <ul
            v-if="added[t.id]?.length"
            class="border-[1.5px] border-dashed border-(--line)"
          >
            <li
              v-for="r in added[t.id]"
              :key="r.email"
              class="flex flex-wrap items-center gap-2 border-b border-dashed border-(--line) px-3 py-2 text-sm last:border-b-0"
            >
              <span class="min-w-0 flex-1 truncate">{{ r.email }}</span>
              <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ resultLabel[r.status] }}<template v-if="r.team"> ({{ r.team }})</template></span>
              <UButton
                v-if="r.link"
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-lucide-copy"
                @click="copy(r.link)"
              >
                Copy link
              </UButton>
            </li>
          </ul>
          <ul class="border-[1.5px] border-(--line)">
            <li
              v-for="m in t.roster"
              :key="m.userId"
              class="flex items-center justify-between gap-3 border-b border-dashed border-(--line) px-3 py-2 text-sm last:border-b-0"
            >
              <span class="min-w-0 truncate">{{ m.email }}</span>
              <span class="flex items-center gap-2">
                <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ m.role }} · {{ date(m.joinedAt) }}</span>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  :aria-label="`Remove ${m.email}`"
                  @click="removeMember(t, m)"
                />
              </span>
            </li>
            <li
              v-if="!t.roster.length"
              class="px-3 py-2 text-sm text-(--ink2)"
            >
              Nobody has joined yet.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
