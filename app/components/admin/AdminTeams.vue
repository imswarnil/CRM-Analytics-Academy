<script setup lang="ts">
/**
 * /admin → Teams: organisations that bought seats (companies, colleges,
 * teams). Create one from a sales conversation, resize it, end it. Members
 * join at /team with the join code; a college's domain limits who can.
 */
interface Org {
  id: number
  name: string
  kind: string
  seats: number
  used: number
  joinCode: string
  domain: string | null
  status: string
  expiresAt: string | null
  adminEmail: string | null
}
const { data, refresh } = await useLazyFetch<{ orgs: Org[] }>('/api/admin/orgs', { server: false, default: () => ({ orgs: [] }) })
const draft = reactive({ name: '', kind: 'company' as OrgKind, seats: 10, months: 12, domain: '', adminEmail: '' })
const busy = ref(false)
const error = ref('')
const created = ref('')

async function create() {
  busy.value = true
  error.value = ''
  created.value = ''
  try {
    const res = await $fetch<{ joinCode: string }>('/api/admin/orgs', { method: 'POST', body: { ...draft } })
    created.value = res.joinCode
    Object.assign(draft, { name: '', seats: 10, domain: '', adminEmail: '' })
    await refresh()
  } catch (e) {
    error.value = apiError(e) || 'Could not create the organisation.'
  } finally {
    busy.value = false
  }
}
async function update(o: Org, change: { seats?: number, status?: string, months?: number }) {
  await $fetch('/api/admin/orgs', { method: 'POST', body: { id: o.id, ...change } })
  await refresh()
}
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'No end date')
</script>

<template>
  <div class="space-y-6">
    <form
      class="grid gap-3 rounded-[6px] border border-(--line) bg-(--card) p-5 sm:grid-cols-2 lg:grid-cols-6"
      @submit.prevent="create"
    >
      <p class="mono-label sm:col-span-2 lg:col-span-6">
        New organisation
      </p>
      <UInput
        v-model="draft.name"
        placeholder="Name"
        class="lg:col-span-2"
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
        v-model="draft.domain"
        placeholder="Email domain (colleges)"
      />
      <UInput
        v-model="draft.adminEmail"
        type="email"
        placeholder="Their admin's email"
        class="lg:col-span-3"
      />
      <UButton
        type="submit"
        :loading="busy"
        icon="i-lucide-plus"
        class="justify-center lg:col-span-3"
      >
        Create and get a join code
      </UButton>
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :description="error"
        class="sm:col-span-2 lg:col-span-6"
      />
      <p
        v-if="created"
        class="text-sm text-(--ink) sm:col-span-2 lg:col-span-6"
      >
        Join code <code class="font-bold">{{ created }}</code> — members enter it at /team.
      </p>
    </form>

    <div class="overflow-x-auto rounded-[6px] border border-(--line) bg-(--card)">
      <table class="w-full text-sm">
        <thead class="bg-(--paper) text-start">
          <tr>
            <th
              v-for="h in ['Organisation', 'Seats', 'Join code', 'Admin', 'Ends', '']"
              :key="h"
              class="px-4 py-2.5 text-start text-[11px] font-bold uppercase tracking-[.09em] text-(--label)"
            >
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--line)">
          <tr v-if="!data.orgs.length">
            <td
              colspan="6"
              class="px-4 py-8 text-center text-(--ink2)"
            >
              No organisations yet. They come from "Teams & institutions" leads.
            </td>
          </tr>
          <tr
            v-for="o in data.orgs"
            :key="o.id"
            :class="o.status === 'ended' ? 'opacity-50' : ''"
          >
            <td class="px-4 py-3">
              <p class="font-semibold text-(--ink)">
                {{ o.name }}
              </p>
              <p class="text-xs text-(--ink2)">
                {{ o.kind }}<template v-if="o.domain">
                  · @{{ o.domain }}
                </template>
              </p>
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ o.used }} / {{ o.seats }}
            </td>
            <td class="px-4 py-3 font-mono">
              {{ o.joinCode }}
            </td>
            <td class="px-4 py-3 text-(--ink2)">
              {{ o.adminEmail ?? '—' }}
            </td>
            <td class="px-4 py-3 text-(--ink2)">
              {{ date(o.expiresAt) }}
            </td>
            <td class="px-4 py-3 text-end whitespace-nowrap">
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-lucide-plus"
                @click="update(o, { seats: o.seats + 10 })"
              >
                10 seats
              </UButton>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                class="ms-1"
                @click="update(o, { status: o.status === 'active' ? 'ended' : 'active' })"
              >
                {{ o.status === 'active' ? 'End' : 'Reactivate' }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
