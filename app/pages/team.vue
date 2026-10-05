<script setup lang="ts">
/**
 * The team console: seats, members, open invites and allowed domains.
 * Owners and team admins manage; members see the roster and can leave.
 * Every action is enforced again server-side in /api/team.
 */
definePageMeta({ middleware: 'auth' })
defineI18nRoute({ locales: ['en'] })
useSeoMeta({ title: 'Your team', robots: 'noindex, nofollow' })

interface TeamData {
  team: null | { id: string, name: string, domain: string, extra_domains: string[], seats: number, status: string, current_period_end: string | null }
  role?: 'owner' | 'admin' | 'member'
  canManage?: boolean
  seats?: { total: number, used: number, pending: number, free: number }
  members?: { userId: string, email: string, role: string, joinedAt: string, you: boolean }[]
  invites?: { id: string, email: string, createdAt: string, expiresAt: string }[]
}

const route = useRoute()
const toast = useToast()
const { data, refresh, status } = await useFetch<TeamData>('/api/team', { server: false, default: () => ({ team: null }) })

const justPaid = computed(() => route.query.checkout === 'done')
// A team is created by the payment webhook, which can land a few seconds
// after the redirect back. Poll briefly rather than showing "no team".
onMounted(async () => {
  if (!justPaid.value) return
  for (let i = 0; i < 10 && !data.value?.team; i++) {
    await new Promise(r => setTimeout(r, 2000))
    await refresh()
  }
})

const pct = (n: number, d: number) => (d ? Math.min(100, (n / d) * 100) : 0)
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

// Invites
const inviteEmail = ref('')
const inviting = ref(false)
const lastLink = ref<{ email: string, link: string } | null>(null)
async function invite() {
  inviting.value = true
  try {
    const res = await $fetch<{ email: string, link: string }>('/api/team/invites', { method: 'POST', body: { email: inviteEmail.value } })
    lastLink.value = res
    inviteEmail.value = ''
    await refresh()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not create the invite', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    inviting.value = false
  }
}
async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  toast.add({ title: 'Invite link copied', icon: 'i-lucide-copy-check' })
}
async function withdraw(id: string) {
  await $fetch(`/api/team/invites/${id}`, { method: 'DELETE' })
  await refresh()
}
async function removeMember(userId: string, you: boolean) {
  try {
    await $fetch(`/api/team/members/${encodeURIComponent(userId)}`, { method: 'DELETE' })
    if (you) await navigateTo('/dashboard')
    else await refresh()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not remove', color: 'error' })
  }
}

// Settings
const editName = ref('')
const editDomains = ref('')
watch(() => data.value?.team, (t) => {
  if (!t) return
  editName.value = t.name
  editDomains.value = (t.extra_domains ?? []).join(', ')
}, { immediate: true })
const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch('/api/team', { method: 'PATCH', body: { name: editName.value, extraDomains: editDomains.value.split(/[\s,]+/).filter(Boolean) } })
    toast.add({ title: 'Team updated', icon: 'i-lucide-check' })
    await refresh()
  } catch (e) {
    toast.add({ title: apiError(e) || 'Could not save', color: 'error' })
  } finally {
    saving.value = false
  }
}
async function billing() {
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
    window.location.href = url
  } catch (e) {
    toast.add({ title: apiError(e) || 'Billing portal unavailable', color: 'error' })
  }
}
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet T / Team console"
      :title="data?.team?.name || 'Your team'"
      :lead="data?.team ? `Members join with @${[data.team.domain, ...(data.team.extra_domains ?? [])].join(', @')} addresses.` : undefined"
    />

    <div class="mx-auto max-w-[68rem] px-4 py-12 sm:px-6">
      <div
        v-if="status === 'pending' && !data?.team"
        class="h-40 animate-pulse border-[1.5px] border-(--ink) bg-(--card)"
      />

      <!-- No team yet -->
      <div
        v-else-if="!data?.team"
        class="border-[1.5px] border-(--ink) bg-(--card) p-8 text-center"
      >
        <template v-if="justPaid">
          <UIcon
            name="i-lucide-loader-circle"
            class="size-8 animate-spin text-(--signal)"
          />
          <h2 class="mt-4 text-xl font-extrabold">
            Setting up your team…
          </h2>
          <p class="mt-2 text-sm text-(--ink2)">
            The payment is confirmed by Dodo Payments in a few seconds. This page refreshes on its own.
          </p>
        </template>
        <template v-else>
          <h2 class="text-xl font-extrabold">
            You are not on a team yet
          </h2>
          <p class="mt-2 text-sm text-(--ink2)">
            Buy seats for your company, or ask your team owner for an invite link.
          </p>
          <UButton
            to="/teams"
            class="mt-6"
            icon="i-lucide-users"
          >
            Buy team seats
          </UButton>
        </template>
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <!-- Seats -->
        <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="eyebrow">
                Fig. 01 — Seats
              </p>
              <span
                class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]"
                :class="data.team.status === 'active' ? 'border-(--signal) text-(--signal)' : 'border-(--ink) bg-(--ink) text-(--paper)'"
              >{{ data.team.status }}</span>
            </div>
            <p class="mt-4 text-4xl font-black tracking-[-0.03em]">
              {{ data.seats?.used }}<span class="text-(--ink2)"> / {{ data.seats?.total }}</span>
            </p>
            <p class="font-mono text-[11px] uppercase tracking-[.06em] text-(--ink2)">
              seats used · {{ data.seats?.pending }} invited · {{ data.seats?.free }} free
            </p>
            <div class="relative mt-4 flex h-4 border-[1.5px] border-(--ink) bg-(--card)">
              <div
                class="h-full bg-(--signal)"
                :style="{ width: `${pct(data.seats?.used ?? 0, data.seats?.total ?? 0)}%` }"
              />
              <div
                class="hatch-signal h-full"
                :style="{ width: `${pct(data.seats?.pending ?? 0, data.seats?.total ?? 0)}%` }"
              />
            </div>
            <p class="mt-3 text-xs text-(--ink2)">
              Renews {{ date(data.team.current_period_end) }}. You are the team {{ data.role }}.
            </p>
          </div>
          <div class="graph-paper-navy flex flex-col gap-3 border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white">
            <p class="mono-label text-(--glow)!">
              Billing
            </p>
            <p class="text-sm text-white/80">
              Change seats, update the card or download invoices in the billing portal.
            </p>
            <UButton
              v-if="data.role === 'owner'"
              color="secondary"
              icon="i-lucide-credit-card"
              class="mt-auto"
              @click="billing"
            >
              Manage billing
            </UButton>
            <UButton
              to="/experts#contact"
              color="neutral"
              variant="outline"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              Need more than 50?
            </UButton>
          </div>
        </section>

        <!-- Invite -->
        <section
          v-if="data.canManage"
          class="border-[1.5px] border-(--ink) bg-(--card) p-6"
        >
          <p class="eyebrow">
            Fig. 02 — Invite a colleague
          </p>
          <form
            class="mt-4 flex flex-wrap gap-3"
            @submit.prevent="invite"
          >
            <UInput
              v-model="inviteEmail"
              type="email"
              required
              :placeholder="`name@${data.team.domain}`"
              class="min-w-64 flex-1"
            />
            <UButton
              type="submit"
              :loading="inviting"
              :disabled="(data.seats?.free ?? 0) === 0"
              icon="i-lucide-link"
            >
              Create invite link
            </UButton>
          </form>
          <p class="mt-2 text-xs text-(--ink2)">
            There is no email from us — copy the link and send it yourself. It works for that address only and expires in 14 days.
          </p>
          <div
            v-if="lastLink"
            class="mt-4 flex flex-wrap items-center gap-3 border-[1.5px] border-dashed border-(--signal) bg-(--ice) p-3"
          >
            <span class="font-mono text-xs">{{ lastLink.email }}</span>
            <code class="min-w-0 flex-1 truncate font-mono text-xs text-(--signal)">{{ lastLink.link }}</code>
            <UButton
              size="xs"
              icon="i-lucide-copy"
              @click="copy(lastLink.link)"
            >
              Copy
            </UButton>
          </div>

          <ul
            v-if="data.invites?.length"
            class="mt-6 border-t border-dashed border-(--line)"
          >
            <li
              v-for="inv in data.invites"
              :key="inv.id"
              class="flex items-center justify-between gap-3 border-b border-dashed border-(--line) py-2 text-sm"
            >
              <span>{{ inv.email }}</span>
              <span class="font-mono text-[10px] uppercase text-(--ink2)">expires {{ date(inv.expiresAt) }}</span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                @click="withdraw(inv.id)"
              >
                Withdraw
              </UButton>
            </li>
          </ul>
        </section>

        <!-- Members -->
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-3">
            Fig. 03 — Members
          </p>
          <ul>
            <li
              v-for="m in data.members"
              :key="m.userId"
              class="flex items-center gap-3 border-b border-dashed border-(--line) px-6 py-3 last:border-b-0"
            >
              <span class="flex size-8 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) font-bold uppercase">{{ m.email[0] }}</span>
              <span class="min-w-0 flex-1 truncate">{{ m.email }}<span
                v-if="m.you"
                class="ms-2 font-mono text-[10px] uppercase text-(--signal)"
              >you</span></span>
              <span class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">{{ m.role }} · {{ date(m.joinedAt) }}</span>
              <UButton
                v-if="m.role !== 'owner' && (data.canManage || m.you)"
                size="xs"
                color="neutral"
                variant="ghost"
                :icon="m.you ? 'i-lucide-log-out' : 'i-lucide-user-minus'"
                @click="removeMember(m.userId, m.you)"
              >
                {{ m.you ? 'Leave' : 'Remove' }}
              </UButton>
            </li>
          </ul>
        </section>

        <!-- Settings -->
        <section
          v-if="data.canManage"
          class="border-[1.5px] border-(--ink) bg-(--card) p-6"
        >
          <p class="eyebrow">
            Fig. 04 — Team settings
          </p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <UFormField label="Team name">
              <UInput
                v-model="editName"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Extra allowed domains"
              :help="`Besides @${data.team.domain}. Comma-separated; personal mailboxes are refused.`"
            >
              <UInput
                v-model="editDomains"
                placeholder="subsidiary.com, brand.io"
                class="w-full"
              />
            </UFormField>
          </div>
          <UButton
            class="mt-4"
            :loading="saving"
            icon="i-lucide-save"
            @click="save"
          >
            Save
          </UButton>
        </section>
      </div>
    </div>
  </div>
</template>
