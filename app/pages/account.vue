<script setup lang="ts">
/**
 * /account — plan and billing in one place, for individuals and teams.
 *
 *   Your plan      what you have now (Free, Pro monthly / yearly, a team
 *                  seat, or a team you run), when it renews or ends, and the
 *                  Stripe portal for cards, invoices, switching and cancelling
 *   Upgrade        side by side: Pro for me (monthly / yearly) or a team
 *                  (seats stepper, live total) — straight to Stripe Checkout
 *   Your team      for a team's admin: seats used, invite people by email,
 *                  and the join link; members and domains stay on /team
 *
 * Everything goes through the existing billing and org APIs; access only ever
 * comes from the Stripe webhook.
 */
definePageMeta({ middleware: 'auth' })

interface Billing {
  configured: boolean
  pro: boolean
  subscription: { plan: string, status: string, periodEnd: string | null, cancelAtPeriodEnd: boolean } | null
  team: { id: number, name: string, seats: number, status: string, billing: string, admin: boolean } | null
}
interface Org { name: string, seats: number, used: number, invited: number, joinCode: string | null, role: string, invites: string[], domains: string[] }

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user } = useAuth()
const { data: billing, refresh } = useLazyFetch<Billing>('/api/billing', { server: false })
const { data: org, refresh: refreshOrg } = useLazyAsyncData('account-org', () => $fetch<{ org: Org | null }>('/api/org').then(r => r.org), { server: false })

const plan = computed(() => {
  const b = billing.value
  if (!b) return null
  if (b.team?.admin && b.team.status === 'active') return { key: 'teamAdmin', icon: 'i-lucide-building-2' }
  if (b.subscription && b.pro) return { key: b.subscription.plan === 'proYearly' ? 'proYearly' : 'proMonthly', icon: 'i-lucide-sparkles' }
  if (b.team && b.team.status === 'active') return { key: 'teamSeat', icon: 'i-lucide-users' }
  if (b.pro) return { key: 'granted', icon: 'i-lucide-gift' }
  return { key: 'free', icon: 'i-lucide-book-open' }
})
const paid = computed(() => Boolean(billing.value?.subscription || billing.value?.team?.admin))
const renew = computed(() => {
  const s = billing.value?.subscription
  if (!s?.periodEnd) return ''
  const d = new Date(s.periodEnd).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
  return s.cancelAtPeriodEnd ? t('dash.endsOn', { date: d }) : t('dash.renewsOn', { date: d })
})

/* --- Buying ------------------------------------------------------------------- */
const yearly = ref(true)
const seats = ref(5)
const teamName = ref('')
const busy = ref('')
const error = ref('')
const saving = computed(() => Math.round((1 - PRICES.proYearly.usd / (PRICES.proMonthly.usd * 12)) * 100))
const teamTotal = computed(() => seats.value * PRICES.teamSeat.usd)
async function go(kind: 'pro' | 'team' | 'portal') {
  busy.value = kind
  error.value = ''
  try {
    const res = kind === 'pro'
      ? await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan: yearly.value ? 'proYearly' : 'proMonthly', locale: locale.value } })
      : kind === 'team'
        ? await $fetch<{ url: string }>('/api/billing/team', { method: 'POST', body: { name: teamName.value || `${user.value?.name ?? 'My'} team`, seats: seats.value } })
        : await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST', body: { team: plan.value?.key === 'teamAdmin' } })
    window.location.href = res.url
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    busy.value = ''
  }
}

/* --- Team admin ----------------------------------------------------------------- */
const emails = ref('')
const inviteMsg = ref('')
async function invite() {
  busy.value = 'invite'
  error.value = ''
  inviteMsg.value = ''
  try {
    await $fetch('/api/org/invite', { method: 'POST', body: { emails: emails.value } })
    emails.value = ''
    inviteMsg.value = t('account.invited')
    await refreshOrg()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    busy.value = ''
  }
}
// Third way in: everyone signing in with the company's email domain.
const domains = ref('')
watch(org, o => (domains.value = (o?.domains ?? []).join(', ')), { immediate: true })
const domainMsg = ref('')
async function saveDomains() {
  busy.value = 'domains'
  error.value = ''
  domainMsg.value = ''
  try {
    await $fetch('/api/org/domains', { method: 'POST', body: { domains: domains.value } })
    domainMsg.value = t('account.domainsSaved')
    await refreshOrg()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    busy.value = ''
  }
}
const joinLink = computed(() => (org.value?.joinCode ? `${SITE.url}${localePath('/team')}?code=${org.value.joinCode}` : ''))
const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(joinLink.value).catch(() => null)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
const usedPct = computed(() => (org.value?.seats ? Math.min(100, ((org.value.used + org.value.invited) / org.value.seats) * 100) : 0))

// Back from Stripe before the webhook landed: look again for a few seconds.
onMounted(() => {
  if (route.query.checkout !== 'success') return
  let n = 0
  const timer = setInterval(async () => {
    if (paid.value || ++n > 10) return clearInterval(timer)
    await Promise.all([refresh(), refreshOrg()])
  }, 3000)
})

useSeoMeta({ title: () => t('account.title'), robots: 'noindex' })
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 11 / ACCOUNT"
      :title="t('account.title')"
      :lead="t('account.lead')"
    />

    <div class="mx-auto max-w-(--ui-container) space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="error"
      />
      <UAlert
        v-if="route.query.checkout === 'success' && !paid"
        color="primary"
        variant="subtle"
        icon="i-lucide-loader"
        :description="t('team.activating')"
      />
      <UAlert
        v-if="billing && !billing.configured"
        color="warning"
        variant="subtle"
        icon="i-lucide-construction"
        :description="t('account.notConfigured')"
      />

      <!-- Your plan -->
      <section class="grid gap-0 border-[1.5px] border-(--ink) bg-(--card) shadow-[6px_6px_0_var(--ink)] md:grid-cols-[1fr_auto]">
        <div class="flex items-start gap-4 p-6">
          <span class="flex size-12 shrink-0 items-center justify-center bg-(--ink) text-(--paper)">
            <UIcon
              :name="plan?.icon ?? 'i-lucide-loader'"
              class="size-6"
              :class="plan ? '' : 'animate-spin'"
            />
          </span>
          <div class="min-w-0">
            <p class="eyebrow">
              {{ t('account.yourPlan') }}
            </p>
            <h2 class="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
              {{ plan ? t(`account.plan.${plan.key}`, { team: billing?.team?.name ?? '' }) : '…' }}
            </h2>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ plan ? t(`account.planNote.${plan.key}`) : '' }}
              <span
                v-if="renew"
                class="font-semibold text-(--ink)"
              > · {{ renew }}</span>
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 border-t-[1.5px] border-(--ink) p-6 md:border-s-[1.5px] md:border-t-0">
          <UButton
            v-if="paid"
            icon="i-lucide-credit-card"
            :loading="busy === 'portal'"
            @click="go('portal')"
          >
            {{ t('account.manage') }}
          </UButton>
          <UButton
            :to="localePath('/dashboard')"
            color="neutral"
            variant="outline"
            icon="i-lucide-layout-dashboard"
          >
            {{ t('nav.dashboard') }}
          </UButton>
        </div>
      </section>

      <!-- Your team (admin) -->
      <section
        v-if="org && billing?.team?.admin"
        class="space-y-4"
      >
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 class="bp-h3">
            {{ org.name }}
          </h2>
          <UButton
            :to="localePath('/team')"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('account.allMembers') }}
          </UButton>
        </div>
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="border-[1.5px] border-(--ink) bg-(--card) p-5">
            <p class="mono-label">
              {{ t('account.seats') }}
            </p>
            <p class="mt-2 text-3xl font-black tabular-nums text-(--ink)">
              {{ org.used + org.invited }} <span class="text-lg text-(--ink2)">/ {{ org.seats }}</span>
            </p>
            <div class="mt-3 h-2 overflow-hidden bg-(--line)">
              <div
                class="h-full bg-(--signal) transition-[width] duration-500"
                :style="{ width: `${usedPct}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-(--ink2)">
              {{ t('account.seatsNote', { used: org.used, invited: org.invited, free: Math.max(0, org.seats - org.used - org.invited) }) }}
            </p>
            <UButton
              class="mt-3"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-plus-minus"
              :loading="busy === 'portal'"
              @click="go('portal')"
            >
              {{ t('account.changeSeats') }}
            </UButton>
          </div>
          <form
            class="space-y-3 border-[1.5px] border-(--ink) bg-(--card) p-5 lg:col-span-2"
            @submit.prevent="invite"
          >
            <p class="mono-label">
              {{ t('account.giveAccess') }}
            </p>
            <p class="text-sm text-(--ink2)">
              {{ t('account.giveAccessLead') }}
            </p>
            <UTextarea
              v-model="emails"
              :rows="2"
              autoresize
              class="w-full"
              :placeholder="t('account.invitePh')"
            />
            <div class="flex flex-wrap items-center gap-3">
              <UButton
                type="submit"
                icon="i-lucide-send"
                :loading="busy === 'invite'"
                :disabled="!emails.trim()"
              >
                {{ t('account.sendInvites') }}
              </UButton>
              <span
                v-if="inviteMsg"
                class="text-sm text-(--signal)"
              >{{ inviteMsg }}</span>
            </div>
            <div class="space-y-2 border-t border-dashed border-(--line) pt-3">
              <p class="mono-label">
                {{ t('account.domains') }}
              </p>
              <div class="flex gap-2">
                <UInput
                  v-model="domains"
                  class="flex-1"
                  placeholder="yourcompany.com"
                />
                <UButton
                  color="neutral"
                  variant="outline"
                  :loading="busy === 'domains'"
                  @click="saveDomains"
                >
                  {{ t('account.saveDomains') }}
                </UButton>
              </div>
              <p class="text-xs text-(--ink2)">
                {{ domainMsg || t('account.domainsHint') }}
              </p>
            </div>
            <div
              v-if="joinLink"
              class="flex items-center gap-2 border-t border-dashed border-(--line) pt-3"
            >
              <code class="min-w-0 flex-1 truncate font-mono text-xs text-(--ink2)">{{ joinLink }}</code>
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                @click="copy"
              >
                {{ t('account.copyLink') }}
              </UButton>
            </div>
          </form>
        </div>
      </section>

      <!-- Upgrade: for me, or for a team -->
      <section
        v-if="billing && !paid && plan?.key !== 'teamSeat'"
        class="space-y-4"
      >
        <h2 class="bp-h3">
          {{ t('account.upgrade') }}
        </h2>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6">
            <p class="flex items-center gap-2 font-bold text-(--ink)">
              <UIcon
                name="i-lucide-user"
                class="size-5 text-(--signal)"
              />{{ t('account.forMe') }}
            </p>
            <div class="mt-4 inline-flex self-start border-[1.5px] border-(--ink)">
              <button
                v-for="y in [false, true]"
                :key="String(y)"
                type="button"
                class="px-3 py-1.5 text-sm font-semibold"
                :class="yearly === y ? 'bg-(--ink) text-(--paper)' : 'text-(--ink)'"
                @click="yearly = y"
              >
                {{ y ? t('plans.yearly', { n: saving }) : t('plans.monthly') }}
              </button>
            </div>
            <p class="mt-5 text-4xl font-black tabular-nums text-(--ink)">
              ${{ yearly ? Math.round(PRICES.proYearly.usd / 12 * 100) / 100 : PRICES.proMonthly.usd }}<span class="text-base font-semibold text-(--ink2)"> {{ t('plans.perMonth') }}</span>
            </p>
            <p
              v-if="yearly"
              class="text-sm text-(--ink2)"
            >
              {{ t('plans.billedYearly', { price: `$${PRICES.proYearly.usd}` }) }}
            </p>
            <ul class="mt-4 flex-1 space-y-1.5 text-sm text-(--ink)">
              <li
                v-for="n in 5"
                :key="n"
                class="flex gap-2"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`products.pro.f${n}`) }}
              </li>
            </ul>
            <UButton
              class="mt-6 self-start"
              size="lg"
              icon="i-lucide-sparkles"
              :loading="busy === 'pro'"
              @click="go('pro')"
            >
              {{ t('plans.getPro') }}
            </UButton>
          </div>

          <div class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6">
            <p class="flex items-center gap-2 font-bold text-(--ink)">
              <UIcon
                name="i-lucide-users"
                class="size-5 text-(--signal)"
              />{{ t('account.forTeam') }}
            </p>
            <UInput
              v-model="teamName"
              class="mt-4 w-full"
              :placeholder="t('plans.teamName')"
              maxlength="120"
            />
            <div class="mt-4 flex items-center gap-3">
              <UButton
                icon="i-lucide-minus"
                color="neutral"
                variant="outline"
                square
                :aria-label="t('plans.fewer')"
                :disabled="seats <= TEAM_MIN_SEATS"
                @click="seats = Math.max(TEAM_MIN_SEATS, seats - 1)"
              />
              <input
                v-model.number="seats"
                type="number"
                :min="TEAM_MIN_SEATS"
                max="1000"
                class="w-20 border-[1.5px] border-(--ink) bg-(--paper) py-1.5 text-center text-lg font-bold tabular-nums"
                :aria-label="t('account.seats')"
              >
              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="outline"
                square
                :aria-label="t('plans.more')"
                @click="seats = Math.min(1000, seats + 1)"
              />
              <span class="text-sm text-(--ink2)">× ${{ PRICES.teamSeat.usd }} {{ t('plans.perSeat') }}</span>
            </div>
            <p class="mt-5 text-4xl font-black tabular-nums text-(--ink)">
              ${{ teamTotal.toLocaleString(locale) }}<span class="text-base font-semibold text-(--ink2)"> {{ t('plans.perMonth') }}</span>
            </p>
            <ul class="mt-4 flex-1 space-y-1.5 text-sm text-(--ink)">
              <li
                v-for="n in 5"
                :key="n"
                class="flex gap-2"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`products.team.f${n}`) }}
              </li>
            </ul>
            <UButton
              class="mt-6 self-start"
              size="lg"
              icon="i-lucide-building-2"
              :loading="busy === 'team'"
              :disabled="seats < TEAM_MIN_SEATS"
              @click="go('team')"
            >
              {{ t('plans.buyTeam') }}
            </UButton>
          </div>
        </div>
        <p class="text-sm text-(--ink2)">
          <UIcon
            name="i-lucide-lock"
            class="me-1 inline size-4 align-[-3px]"
          />{{ t('plans.stripeNote') }} · <NuxtLink
            :to="localePath('/team')"
            class="underline"
          >{{ t('account.haveCode') }}</NuxtLink>
        </p>
      </section>
    </div>
  </div>
</template>
