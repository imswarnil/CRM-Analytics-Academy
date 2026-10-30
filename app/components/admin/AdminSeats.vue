<script setup lang="ts">
/**
 * /admin → Seats: organisations (companies, teams, universities) that hold Pro
 * seats. Create one from a seats lead (Leads → "Create org") or here; hand the
 * join code to its admin; members join at /team. Seats can grow or shrink
 * (never below the seats in use) and an org can carry an end date.
 */
interface Member { userId: string, role: string, name: string | null, email: string | null, lessons: number, joinedAt: string }
interface Org {
  id: number
  name: string
  kind: string
  seats: number
  used: number
  joinCode: string
  domain: string | null
  leadId: number | null
  note: string | null
  expiresAt: string | null
  createdAt: string
  members: Member[]
}

const { data, refresh } = await useLazyAsyncData('admin-orgs', () => $fetch<{ orgs: Org[] }>('/api/admin/orgs').then(r => r.orgs), { server: false, default: () => [] })

const draft = reactive({ name: '', kind: 'company' as OrgKind, seats: 10, months: 12, adminEmail: '', note: '' })
const error = ref('')
const busy = ref(false)
async function post(body: Record<string, unknown>) {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/orgs', { method: 'POST', body })
    await refresh()
    return true
  } catch (e) {
    error.value = apiError(e) || 'Could not save.'
    return false
  } finally {
    busy.value = false
  }
}
async function create() {
  if (await post({ ...draft, adminEmail: draft.adminEmail || undefined })) {
    Object.assign(draft, { name: '', seats: 10, adminEmail: '', note: '' })
  }
}
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'no end')
const seatTotals = computed(() => ({
  orgs: data.value.length,
  seats: data.value.reduce((s, o) => s + o.seats, 0),
  used: data.value.reduce((s, o) => s + o.used, 0)
}))
</script>

<template>
  <section class="space-y-6">
    <dl class="grid grid-cols-3 border-s-[1.5px] border-t-[1.5px] border-(--ink)">
      <div
        v-for="tile in [
          { label: 'Organisations', value: seatTotals.orgs },
          { label: 'Seats sold', value: seatTotals.seats },
          { label: 'Seats in use', value: seatTotals.used }
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

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      :description="error"
      :close="{ onClick: () => { error = '' } }"
    />

    <form
      class="grid gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4 sm:grid-cols-6"
      @submit.prevent="create"
    >
      <p class="mono-label sm:col-span-6">
        New organisation
      </p>
      <UInput
        v-model="draft.name"
        placeholder="Name"
        class="sm:col-span-2"
        required
      />
      <USelect
        v-model="draft.kind"
        :items="[...ORG_KINDS]"
      />
      <UInput
        v-model.number="draft.seats"
        type="number"
        min="1"
        placeholder="Seats"
      />
      <UInput
        v-model.number="draft.months"
        type="number"
        min="0"
        placeholder="Months (0 = no end)"
      />
      <UInput
        v-model="draft.adminEmail"
        type="email"
        placeholder="Admin's email (optional)"
      />
      <UInput
        v-model="draft.note"
        placeholder="Note (invoice, contact…)"
        class="sm:col-span-5"
      />
      <UButton
        type="submit"
        :loading="busy"
        icon="i-lucide-plus"
        block
      >
        Create
      </UButton>
    </form>

    <p
      v-if="!data.length"
      class="border-[1.5px] border-dashed border-(--line) p-8 text-center text-(--ink2)"
    >
      No organisations yet. A seats request in Leads becomes one with "Create org".
    </p>

    <ul class="space-y-4">
      <li
        v-for="o in data"
        :key="o.id"
        class="border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="flex flex-wrap items-center gap-3 border-b-[1.5px] border-(--ink) px-4 py-3">
          <span class="bg-(--ink) px-2 py-0.5 font-mono text-[11px] uppercase text-(--paper)">{{ o.kind }}</span>
          <span class="font-bold text-(--ink)">{{ o.name }}</span>
          <span class="font-mono text-sm tabular-nums text-(--ink2)">{{ o.used }} / {{ o.seats }} seats</span>
          <span class="font-mono text-xs text-(--ink2)">until {{ date(o.expiresAt) }}</span>
          <code class="ms-auto select-all border-[1.5px] border-(--signal) px-2 py-0.5 font-mono text-sm text-(--signal)">{{ o.joinCode }}</code>
        </header>
        <div class="flex flex-wrap items-center gap-2 px-4 py-3">
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-plus"
            @click="post({ id: o.id, seats: o.seats + 5 })"
          >
            5 seats
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-minus"
            :disabled="o.seats - 5 < Math.max(o.used, 1)"
            @click="post({ id: o.id, seats: o.seats - 5 })"
          >
            5 seats
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-calendar-plus"
            @click="post({ id: o.id, months: 12 })"
          >
            12 months from today
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-refresh-cw"
            @click="post({ id: o.id, regenerateCode: true })"
          >
            New code
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            class="ms-auto"
            @click="post({ id: o.id, delete: true })"
          >
            Remove org
          </UButton>
        </div>
        <p
          v-if="o.note"
          class="px-4 pb-3 text-sm text-(--ink2)"
        >
          {{ o.note }}
        </p>
        <table
          v-if="o.members.length"
          class="w-full border-t-[1.5px] border-(--line) text-sm"
        >
          <tbody>
            <tr
              v-for="m in o.members"
              :key="m.userId"
              class="border-b border-(--line)"
            >
              <td class="px-4 py-2 font-semibold text-(--ink)">
                {{ m.name ?? '—' }} <span
                  v-if="m.role === 'admin'"
                  class="ms-1 font-mono text-[10px] uppercase text-(--signal)"
                >admin</span>
              </td>
              <td class="px-4 py-2 text-(--ink2)">
                {{ m.email }}
              </td>
              <td class="px-4 py-2 font-mono tabular-nums text-(--ink2)">
                {{ m.lessons }} lessons
              </td>
              <td class="px-4 py-2 text-end">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-user-minus"
                  @click="post({ id: o.id, removeUserId: m.userId })"
                >
                  Free seat
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </li>
    </ul>
  </section>
</template>
