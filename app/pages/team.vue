<script setup lang="ts">
/**
 * /team — seats in an organisation. A learner enters the join code their
 * company, team or university was given; while the org has seats, they are
 * Pro. The org's admin sees the code, the seats in use and each member's
 * progress, and can free a seat. Organisations are created in /admin from a
 * seats request on /pro.
 */
definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { load } = useProgress()

interface Member { userId: string, role: string, joinedAt: string, name: string | null, email: string | null, lessons: number, points: number, sessions: number }
interface Org { name: string, kind: string, seats: number, used: number, invited: number, expiresAt: string | null, role: string, joinCode: string | null, domains: string[], billing: string, invites: string[], members: Member[] }
const { data, refresh } = await useLazyAsyncData('my-org', () => $fetch<{ org: Org | null }>('/api/org').then(r => r.org), { server: false })

const code = ref(String(route.query.code ?? ''))
const busy = ref(false)
const error = ref('')
async function join() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/org/join', { method: 'POST', body: { code: code.value } })
    useNuxtApp().$track?.('org_join')
    await Promise.all([refresh(), load()])
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    busy.value = false
  }
}
async function remove(m: Member) {
  error.value = ''
  try {
    await $fetch('/api/org/members', { method: 'DELETE', body: { userId: m.userId } })
    await refresh()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  }
}
/* --- Admin: seats, people, domains, billing ------------------------------------ */
const justPaid = computed(() => route.query.checkout === 'success')
const seatsDraft = ref(0)
watch(data, o => (seatsDraft.value = o?.seats ?? 0), { immediate: true })
const emails = ref('')
const domainsDraft = ref('')
watch(data, o => (domainsDraft.value = (o?.domains ?? []).join(', ')), { immediate: true })
const working = ref('')
async function act(kind: string, fn: () => Promise<unknown>) {
  working.value = kind
  error.value = ''
  try {
    await fn()
    await refresh()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    working.value = ''
  }
}
// Back from Stripe before its webhook landed: look again for a few seconds.
onMounted(() => {
  if (!justPaid.value) return
  let tries = 0
  const timer = setInterval(async () => {
    if (data.value || ++tries > 10) return clearInterval(timer)
    await refresh()
  }, 3000)
})
const saveSeats = () => act('seats', () => $fetch('/api/billing/seats', { method: 'POST', body: { seats: seatsDraft.value } }))
const invite = () => act('invite', async () => {
  await $fetch('/api/org/invite', { method: 'POST', body: { emails: emails.value } })
  emails.value = ''
})
const uninvite = (email: string) => act('invite', () => $fetch('/api/org/invite', { method: 'DELETE', body: { email } }))
const saveDomains = () => act('domains', () => $fetch('/api/org/domains', { method: 'POST', body: { domains: domainsDraft.value } }))
const billing = () => act('billing', async () => {
  window.location.href = (await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST', body: { team: true } })).url
})

const joinLink = computed(() => (data.value?.joinCode ? `${SITE.url}${localePath('/team')}?code=${data.value.joinCode}` : ''))
const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(joinLink.value).catch(() => null)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

useSeoMeta({ title: () => t('team.title'), robots: 'noindex' })
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 10 / SEATS"
      :title="t('team.title')"
      :lead="t('team.lead')"
    />

    <div class="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="error"
      />

      <UAlert
        v-if="justPaid && !data"
        color="primary"
        variant="subtle"
        icon="i-lucide-loader"
        :description="t('team.activating')"
      />

      <!-- No seat yet: join -->
      <form
        v-if="!data"
        class="space-y-4 border-[1.5px] border-(--ink) bg-(--card) p-6"
        @submit.prevent="join"
      >
        <UFormField
          :label="t('team.code')"
          :hint="t('team.codeHint')"
        >
          <UInput
            v-model="code"
            size="xl"
            class="w-full font-mono uppercase tracking-[.2em]"
            maxlength="9"
            autocomplete="off"
            required
          />
        </UFormField>
        <UButton
          type="submit"
          size="xl"
          icon="i-lucide-key-round"
          :loading="busy"
        >
          {{ t('team.join') }}
        </UButton>
        <p class="text-sm text-(--ink2)">
          {{ t('team.noCode') }}
          <NuxtLink
            :to="`${localePath('/pro')}?product=seats#request`"
            class="font-semibold text-(--signal) hover:underline"
          >{{ t('team.request') }}</NuxtLink>
        </p>
      </form>

      <!-- A seat -->
      <template v-else>
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="flex flex-wrap items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-4">
            <UIcon
              name="i-lucide-building-2"
              class="size-6 text-(--signal)"
            />
            <p class="text-xl font-bold text-(--ink)">
              {{ data.name }}
            </p>
            <span class="font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">{{ t(`plans.kind.${data.kind}`) }}</span>
            <span class="ms-auto font-mono text-sm tabular-nums text-(--ink)">{{ t('team.seats', { used: data.used, seats: data.seats }) }}</span>
          </header>
          <div class="space-y-2 p-6">
            <p class="flex items-center gap-2 font-semibold text-(--ink)">
              <UIcon
                name="i-lucide-badge-check"
                class="size-5 text-(--signal)"
              />{{ t('team.youArePro') }}
            </p>
            <p
              v-if="data.domains.length"
              class="text-sm text-(--ink2)"
            >
              {{ t('team.domains', { domains: data.domains.map(d => `@${d}`).join(', ') }) }}
            </p>
            <p
              v-if="data.expiresAt"
              class="text-sm text-(--ink2)"
            >
              {{ t('team.until', { date: new Date(data.expiresAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }) }}
            </p>
          </div>
        </section>

        <UAlert
          v-if="justPaid"
          color="primary"
          variant="subtle"
          icon="i-lucide-party-popper"
          :description="t('team.paid')"
        />

        <!-- Admin tools: seats, people by email, company domains, billing -->
        <section
          v-if="data.role === 'admin'"
          class="grid gap-px border-[1.5px] border-(--ink) bg-(--line) md:grid-cols-2"
        >
          <div class="space-y-3 bg-(--card) p-5">
            <p class="eyebrow">
              {{ t('team.seatsTitle') }}
            </p>
            <p class="text-sm text-(--ink2)">
              {{ t('team.seatsUsed', { used: data.used + data.invited, seats: data.seats }) }}
            </p>
            <div
              v-if="data.billing === 'stripe'"
              class="flex flex-wrap items-center gap-2"
            >
              <UButton
                icon="i-lucide-minus"
                color="neutral"
                variant="outline"
                square
                :aria-label="t('plans.fewer')"
                @click="seatsDraft = Math.max(TEAM_MIN_SEATS, seatsDraft - 1)"
              />
              <span class="min-w-20 text-center font-semibold tabular-nums">{{ t('plans.seatsN', { n: seatsDraft }) }}</span>
              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="outline"
                square
                :aria-label="t('plans.more')"
                @click="seatsDraft++"
              />
              <UButton
                size="sm"
                :disabled="seatsDraft === data.seats"
                :loading="working === 'seats'"
                @click="saveSeats"
              >
                {{ t('team.saveSeats') }}
              </UButton>
            </div>
            <UButton
              v-if="data.billing === 'stripe'"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-credit-card"
              :loading="working === 'billing'"
              @click="billing"
            >
              {{ t('team.billing') }}
            </UButton>
          </div>
          <form
            class="space-y-3 bg-(--card) p-5"
            @submit.prevent="invite"
          >
            <p class="eyebrow">
              {{ t('team.assignTitle') }}
            </p>
            <UTextarea
              v-model="emails"
              :rows="2"
              autoresize
              :placeholder="t('team.emailsPlaceholder')"
              class="w-full"
            />
            <UButton
              type="submit"
              size="sm"
              icon="i-lucide-user-plus"
              :loading="working === 'invite'"
              :disabled="!emails.trim()"
            >
              {{ t('team.assign') }}
            </UButton>
            <ul
              v-if="data.invites.length"
              class="flex flex-wrap gap-1.5"
            >
              <li
                v-for="e in data.invites"
                :key="e"
                class="flex items-center gap-1 border border-(--line) px-2 py-0.5 font-mono text-xs"
              >
                {{ e }}
                <button
                  type="button"
                  class="text-(--ink2) hover:text-error"
                  :aria-label="t('team.free')"
                  @click="uninvite(e)"
                >
                  ×
                </button>
              </li>
            </ul>
          </form>
          <form
            class="space-y-3 bg-(--card) p-5 md:col-span-2"
            @submit.prevent="saveDomains"
          >
            <p class="eyebrow">
              {{ t('team.domainsTitle') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <UInput
                v-model="domainsDraft"
                placeholder="yourcompany.com"
                class="min-w-64 flex-1"
              />
              <UButton
                type="submit"
                size="sm"
                variant="outline"
                color="neutral"
                :loading="working === 'domains'"
              >
                {{ t('team.saveDomains') }}
              </UButton>
            </div>
            <p class="text-xs text-(--ink2)">
              {{ t('team.domainsHint') }}
            </p>
          </form>
        </section>

        <!-- The org's admin -->
        <section
          v-if="data.role === 'admin'"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <header class="border-b-[1.5px] border-(--ink) px-6 py-3">
            <p class="eyebrow">
              {{ t('team.adminTitle') }}
            </p>
          </header>
          <div class="space-y-3 p-6">
            <p class="text-(--ink2)">
              {{ t('team.share') }}
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <code class="select-all border-[1.5px] border-(--signal) px-3 py-1.5 font-mono text-lg tracking-[.2em] text-(--signal)">{{ data.joinCode }}</code>
              <UButton
                variant="outline"
                color="neutral"
                :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
                @click="copy"
              >
                {{ t('team.copyLink') }}
              </UButton>
            </div>
          </div>
          <table class="w-full border-t-[1.5px] border-(--line) text-sm">
            <thead class="font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)">
              <tr>
                <th class="px-6 py-2 text-start">
                  {{ t('team.member') }}
                </th>
                <th class="px-3 py-2 text-end">
                  {{ t('team.lessons') }}
                </th>
                <th class="px-3 py-2 text-end">
                  {{ t('team.points') }}
                </th>
                <th class="px-3 py-2 text-end">
                  {{ t('team.sessions') }}
                </th>
                <th class="px-6 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in data.members"
                :key="m.userId"
                class="border-t border-dashed border-(--line)"
              >
                <td class="px-6 py-2">
                  <span class="block font-semibold text-(--ink)">{{ m.name ?? '—' }}</span>
                  <span class="block font-mono text-xs text-(--ink2)">{{ m.email }}</span>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ m.lessons }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ m.points }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ m.sessions }}
                </td>
                <td class="px-6 py-2 text-end">
                  <UButton
                    v-if="m.role !== 'admin'"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-user-minus"
                    @click="remove(m)"
                  >
                    {{ t('team.free') }}
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>
    </div>
  </div>
</template>
