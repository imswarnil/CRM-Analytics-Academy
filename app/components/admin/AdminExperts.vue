<script setup lang="ts">
/**
 * /admin → Experts: run the experts network.
 *
 *   - Applications (`expert` leads): read them, approve one to create its
 *     public profile from the application, or reopen the profile it became.
 *   - Roster (app.expert): edit what each public card shows — photo,
 *     headline, skills, links, order — and whether it is shown at all.
 *   - Project requests (`project` leads): a summary; they are worked in the
 *     Leads tab, which "Open in Leads" opens pre-filtered.
 *
 * Only `approved` profiles reach /experts (GET /api/experts, cached for up
 * to five minutes at the edge).
 */
interface Application {
  id: number
  name: string
  email: string
  company: string | null
  role: string | null
  country: string | null
  message: string | null
  details: Record<string, string>
  status: string
  createdAt: string
  expertId: number | null
  expertStatus: string | null
}
interface ProjectRequest {
  id: number
  name: string
  email: string
  company: string | null
  logoUrl: string | null
  budget: string | null
  message: string | null
  details: Record<string, string>
  status: string
  createdAt: string
}
interface Expert {
  id: number
  leadId: number | null
  userId: string | null
  name: string
  email: string | null
  headline: string | null
  bio: string | null
  photoUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  skills: string[]
  years: number | null
  country: string | null
  timezone: string | null
  status: 'pending' | 'approved' | 'hidden'
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const emit = defineEmits<{ go: [tab: string] }>()
const { t } = useI18n()
const toast = useToast()

const { data, status, error, refresh } = await useFetch<{ applications: Application[], projects: ProjectRequest[], experts: Expert[] }>('/api/admin/experts', {
  server: false,
  default: () => ({ applications: [], projects: [], experts: [] })
})

const applications = computed(() => data.value?.applications ?? [])
const projects = computed(() => data.value?.projects ?? [])
const experts = computed(() => data.value?.experts ?? [])

const totals = computed(() => ({
  'To review': applications.value.filter(a => !a.expertId && a.status !== 'spam' && a.status !== 'lost').length,
  'On the roster': experts.value.filter(e => e.status === 'approved').length,
  'Hidden': experts.value.filter(e => e.status === 'hidden').length,
  'New project requests': projects.value.filter(p => p.status === 'new').length
}))

const date = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Stored values are stable keys; show their English labels here.
const known = (group: string, keys: readonly string[]) => {
  const set = new Set<string>(keys)
  return (v: string) => (set.has(v) ? t(`${group}.${v}`) : v)
}
const skillLabel = known('experts.skills', EXPERT_SKILLS)
const serviceLabel = known('experts.services', PROJECT_SERVICES)
const yearsLabel = known('experts.years', EXPERT_YEARS)
const rateLabel = known('experts.rates', EXPERT_RATES)
const availabilityLabel = known('experts.availability', EXPERT_AVAILABILITY)
const budgetLabel = known('experts.form.project.budgets', ['under10k', 'from10k', 'from50k', 'from150k', 'unsure'])
const list = (v: string | undefined, label: (x: string) => string) => (v ? v.split(',').map(x => label(x.trim())).filter(Boolean) : [])

function openLeads(type: 'expert' | 'project') {
  useState<string | null>('admin-leads-type').value = type
  emit('go', 'leads')
}

// ---- Approve ---------------------------------------------------------------
const approving = ref<number | null>(null)
async function approve(a: Application) {
  approving.value = a.id
  try {
    const res = await $fetch<{ expert: Expert }>('/api/admin/experts', { method: 'POST', body: { leadId: a.id } })
    toast.add({ title: `${a.name} is on the roster`, description: 'Add a photo and a headline so the card reads well.', color: 'success' })
    await refresh()
    edit(res.expert)
  } catch (e) {
    toast.add({ title: 'Could not approve', description: apiError(e) || 'Try again.', color: 'error' })
  } finally {
    approving.value = null
  }
}

// ---- Edit / add ------------------------------------------------------------
const open = ref(false)
const editingId = ref<number | null>(null)
const draft = reactive({
  name: '',
  email: '',
  headline: '',
  bio: '',
  photoUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  skills: [] as string[],
  years: '',
  country: '',
  timezone: '',
  status: 'approved' as Expert['status'],
  sortOrder: 100
})
const saving = ref(false)
const formError = ref('')

function edit(e: Expert | null) {
  editingId.value = e?.id ?? null
  Object.assign(draft, {
    name: e?.name ?? '',
    email: e?.email ?? '',
    headline: e?.headline ?? '',
    bio: e?.bio ?? '',
    photoUrl: e?.photoUrl ?? '',
    linkedinUrl: e?.linkedinUrl ?? '',
    portfolioUrl: e?.portfolioUrl ?? '',
    skills: [...(e?.skills ?? [])],
    years: e?.years == null ? '' : String(e.years),
    country: e?.country ?? '',
    timezone: e?.timezone ?? '',
    status: e?.status ?? 'approved',
    sortOrder: e?.sortOrder ?? 100
  })
  formError.value = ''
  open.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    const body = { ...draft }
    if (editingId.value) {
      await $fetch(`/api/admin/experts/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/experts', { method: 'POST', body })
    }
    toast.add({ title: 'Profile saved', description: 'The public page updates within five minutes.', color: 'success' })
    open.value = false
    await refresh()
  } catch (e) {
    formError.value = apiError(e) || 'Could not save the profile.'
  } finally {
    saving.value = false
  }
}

async function setStatus(e: Expert, next: Expert['status']) {
  try {
    await $fetch(`/api/admin/experts/${e.id}`, { method: 'PATCH', body: { status: next } })
    await refresh()
  } catch (err) {
    toast.add({ title: 'Could not change visibility', description: apiError(err) || 'Try again.', color: 'error' })
  }
}

// The fixed vocabulary plus any free-text skills already on this profile.
const skillItems = computed(() => [
  ...EXPERT_SKILLS.map(k => ({ value: k as string, label: t(`experts.skills.${k}`) })),
  ...draft.skills.filter(s => !(EXPERT_SKILLS as readonly string[]).includes(s)).map(s => ({ value: s, label: s }))
])
const statusItems = [
  { value: 'approved', label: 'Approved — shown on /experts' },
  { value: 'hidden', label: 'Hidden — kept, not shown' },
  { value: 'pending', label: 'Pending — not shown' }
]
const STATUS_CLS: Record<string, string> = {
  approved: 'border-(--signal) text-(--signal)',
  hidden: 'border-(--ink) text-(--ink2)',
  pending: 'border-(--line) text-(--ink2)'
}
</script>

<template>
  <div class="space-y-10">
    <div class="grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-4">
      <div
        v-for="(v, k) in totals"
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
        icon="i-lucide-user-plus"
        @click="edit(null)"
      >
        Add an expert by hand
      </UButton>
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

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load the experts network"
      :description="apiError(error) || 'Has server/db/011_experts.sql been applied?'"
    />

    <!-- Applications ---------------------------------------------------- -->
    <section>
      <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 class="text-lg font-extrabold">
          Applications
        </h2>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
          @click="openLeads('expert')"
        >
          Open in Leads
        </UButton>
      </div>
      <p
        v-if="status !== 'pending' && !applications.length"
        class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
      >
        No applications yet. They arrive from /experts/join.
      </p>
      <div class="space-y-3">
        <article
          v-for="a in applications"
          :key="a.id"
          class="border-[1.5px] border-(--ink) bg-(--card) p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-extrabold">
                {{ a.name }}
                <span class="font-normal text-(--ink2)">· {{ a.email }}</span>
              </p>
              <p class="font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)">
                {{ [a.role, a.company, a.country, a.details.timezone].filter(Boolean).join(' · ') || '—' }} · applied {{ date(a.createdAt) }} · lead {{ a.status }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="a.expertStatus"
                class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase"
                :class="STATUS_CLS[a.expertStatus]"
              >{{ a.expertStatus }}</span>
              <UButton
                v-if="a.expertId"
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
                @click="edit(experts.find(e => e.id === a.expertId) ?? null)"
              >
                Edit profile
              </UButton>
              <UButton
                v-else
                size="xs"
                icon="i-lucide-check"
                :loading="approving === a.id"
                @click="approve(a)"
              >
                Approve
              </UButton>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="s in list(a.details.expertise, skillLabel)"
              :key="s"
              class="border-[1.5px] border-(--line) px-1.5 py-0.5 font-mono text-[10px] uppercase"
            >{{ s }}</span>
          </div>
          <dl class="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <div v-if="a.details.experienceYears">
              <dt class="mono-label">
                Experience
              </dt><dd>{{ yearsLabel(a.details.experienceYears) }}</dd>
            </div>
            <div v-if="a.details.rateBand">
              <dt class="mono-label">
                Rate
              </dt><dd>{{ rateLabel(a.details.rateBand) }}</dd>
            </div>
            <div v-if="a.details.availability">
              <dt class="mono-label">
                Availability
              </dt><dd>{{ availabilityLabel(a.details.availability) }}</dd>
            </div>
          </dl>
          <p
            v-if="a.message"
            class="mt-3 whitespace-pre-line text-sm text-(--ink2)"
          >
            {{ a.message }}
          </p>
          <div class="mt-3 flex flex-wrap gap-3 text-sm">
            <a
              v-if="a.details.linkedin"
              :href="a.details.linkedin"
              target="_blank"
              rel="noopener"
              class="underline hover:text-(--signal)"
            >LinkedIn</a>
            <a
              v-if="a.details.portfolio"
              :href="a.details.portfolio"
              target="_blank"
              rel="noopener"
              class="underline hover:text-(--signal)"
            >Portfolio</a>
          </div>
        </article>
      </div>
    </section>

    <!-- Roster ---------------------------------------------------------- -->
    <section>
      <h2 class="mb-3 text-lg font-extrabold">
        Roster
      </h2>
      <p
        v-if="status !== 'pending' && !experts.length"
        class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
      >
        Nobody on the roster yet. Approve an application, or add someone by hand.
      </p>
      <div
        v-else
        class="overflow-x-auto border-[1.5px] border-(--ink) bg-(--card)"
      >
        <table class="w-full min-w-[640px] text-sm">
          <thead class="border-b-[1.5px] border-(--ink) bg-(--ice) font-mono text-[10px] uppercase tracking-[.1em]">
            <tr>
              <th class="px-4 py-2 text-start">
                Order
              </th>
              <th class="px-4 py-2 text-start">
                Expert
              </th>
              <th class="px-4 py-2 text-start">
                Skills
              </th>
              <th class="px-4 py-2 text-start">
                Status
              </th>
              <th class="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="e in experts"
              :key="e.id"
              class="border-t border-dashed border-(--line) align-top first:border-t-0"
            >
              <td class="px-4 py-3 font-mono">
                {{ e.sortOrder }}
              </td>
              <td class="px-4 py-3">
                <p class="font-bold">
                  {{ e.name }}
                </p>
                <p class="text-xs text-(--ink2)">
                  {{ e.headline || 'No headline yet' }}
                </p>
              </td>
              <td class="px-4 py-3 text-xs text-(--ink2)">
                {{ e.skills.map(skillLabel).join(', ') || '—' }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase"
                  :class="STATUS_CLS[e.status]"
                >{{ e.status }}</span>
              </td>
              <td class="px-4 py-3 text-end">
                <div class="flex justify-end gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    :icon="e.status === 'approved' ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="e.status === 'approved' ? 'Hide' : 'Show'"
                    @click="setStatus(e, e.status === 'approved' ? 'hidden' : 'approved')"
                  />
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-pencil"
                    @click="edit(e)"
                  >
                    Edit
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Project requests -------------------------------------------------- -->
    <section>
      <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 class="text-lg font-extrabold">
          Project requests
        </h2>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
          @click="openLeads('project')"
        >
          Work them in Leads
        </UButton>
      </div>
      <p
        v-if="status !== 'pending' && !projects.length"
        class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
      >
        No project requests yet. They arrive from the form on /experts.
      </p>
      <ul
        v-else
        class="border-[1.5px] border-(--ink) bg-(--card)"
      >
        <li
          v-for="p in projects"
          :key="p.id"
          class="flex flex-wrap items-start gap-4 border-b border-dashed border-(--line) px-5 py-3 last:border-b-0"
        >
          <span class="flex size-9 flex-none items-center justify-center overflow-hidden border-[1.5px] border-(--ink) bg-(--paper)">
            <img
              v-if="p.logoUrl"
              :src="p.logoUrl"
              alt=""
              class="size-5"
              loading="lazy"
              referrerpolicy="no-referrer"
            >
            <UIcon
              v-else
              name="i-lucide-building-2"
              class="size-4 text-(--ink2)"
            />
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-bold">
              {{ p.company || p.name }}
              <span class="font-normal text-(--ink2)">· {{ p.name }} · {{ p.email }}</span>
            </p>
            <p class="text-xs text-(--ink2)">
              {{ list(p.details.services, serviceLabel).join(', ') || '—' }}
              <template v-if="p.budget">
                · {{ budgetLabel(p.budget) }}
              </template>
            </p>
          </div>
          <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ p.status }} · {{ date(p.createdAt) }}</span>
        </li>
      </ul>
    </section>

    <USlideover
      v-model:open="open"
      :title="editingId ? `Edit ${draft.name}` : 'Add an expert'"
      description="What the public card on /experts shows."
      :ui="{ content: 'max-w-xl' }"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              label="Name"
              required
            >
              <UInput
                v-model="draft.name"
                required
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Email (private)"
            >
              <UInput
                v-model="draft.email"
                type="email"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Headline"
              hint="160 max"
              class="sm:col-span-2"
            >
              <UInput
                v-model="draft.headline"
                maxlength="160"
                placeholder="e.g. CRM Analytics architect · security and SAQL"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Photo URL (https)"
              class="sm:col-span-2"
            >
              <UInput
                v-model="draft.photoUrl"
                type="url"
                placeholder="https://…"
                class="w-full"
              />
            </UFormField>
            <UFormField label="LinkedIn">
              <UInput
                v-model="draft.linkedinUrl"
                type="url"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Portfolio">
              <UInput
                v-model="draft.portfolioUrl"
                type="url"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Skills"
              hint="From the list, or type your own"
              class="sm:col-span-2"
            >
              <USelectMenu
                v-model="draft.skills"
                :items="skillItems"
                value-key="value"
                multiple
                create-item
                class="w-full"
                @create="(item: string) => draft.skills.push(item)"
              />
            </UFormField>
            <UFormField label="Years with CRM Analytics">
              <UInput
                v-model="draft.years"
                type="number"
                min="0"
                max="60"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Country">
              <UInput
                v-model="draft.country"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Time zone">
              <UInput
                v-model="draft.timezone"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Order"
              hint="Lower shows first"
            >
              <UInput
                v-model.number="draft.sortOrder"
                type="number"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Visibility"
              class="sm:col-span-2"
            >
              <USelect
                v-model="draft.status"
                :items="statusItems"
                class="w-full"
              />
            </UFormField>
          </div>

          <UAlert
            v-if="formError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="formError"
          />

          <div class="flex justify-end gap-2 border-t border-dashed border-(--line) pt-4">
            <UButton
              color="neutral"
              variant="outline"
              @click="open = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
            >
              Save profile
            </UButton>
          </div>
        </form>
      </template>
    </USlideover>
  </div>
</template>
