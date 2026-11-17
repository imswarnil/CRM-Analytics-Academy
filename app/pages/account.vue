<script setup lang="ts">
/**
 * /account — your plan and how you hold it: Pro Monthly (manage in the
 * Stripe portal), Pro Lifetime, a team seat, or Free with the ways up.
 */
definePageMeta({ middleware: 'auth' })

interface Billing {
  configured: boolean
  access: Access
  lifetime: { product: string, at: string, until: string | null } | null
  subscription: { status: string, periodEnd: string | null, cancelAtPeriodEnd: boolean } | null
  org: { name: string, kind: string, role: string } | null
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user } = useAuth()
const { data: billing } = useLazyFetch<Billing>('/api/billing', { server: false })

const date = (d: string | null) => (d ? new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }) : '')
const opening = ref(false)
async function portal() {
  opening.value = true
  try {
    window.location.href = (await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })).url
  } catch {
    opening.value = false
  }
}

useSeoMeta({ title: () => t('account.title'), robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-5 px-4 py-14">
    <header>
      <p class="eyebrow">
        {{ t('nav.billing') }}
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-(--ink)">
        {{ t('account.title') }}
      </h1>
      <p class="mt-1 text-(--ink2)">
        {{ user?.email }}
      </p>
    </header>

    <section class="rounded-[6px] border border-(--line) bg-(--card) p-6">
      <p class="mono-label">
        {{ t('account.current') }}
      </p>
      <p class="mt-2 flex items-center gap-2 text-2xl font-bold text-(--ink)">
        <UIcon
          :name="billing?.access === 'pro' ? 'i-lucide-sparkles' : 'i-lucide-book-open'"
          class="size-6 text-(--signal)"
        />{{ billing?.access === 'pro' ? t('plans.pro.name') : t('plans.free.name') }}
      </p>

      <!-- How Pro is held -->
      <div class="mt-4 space-y-2 text-sm text-(--ink2)">
        <p v-if="billing?.subscription">
          {{ t('plans.monthly.name') }} ·
          {{ billing.subscription.cancelAtPeriodEnd ? t('account.endsOn', { date: date(billing.subscription.periodEnd) }) : t('account.renewsOn', { date: date(billing.subscription.periodEnd) }) }}
        </p>
        <p v-if="billing?.lifetime">
          {{ billing.lifetime.product === 'lifetime' ? t('account.boughtOn', { date: date(billing.lifetime.at) }) : t('account.granted') }}
        </p>
        <p v-if="billing?.org">
          {{ t('account.seat', { org: billing.org.name }) }}
        </p>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <UButton
          v-if="billing?.subscription"
          color="neutral"
          variant="outline"
          icon="i-lucide-credit-card"
          :loading="opening"
          @click="portal"
        >
          {{ t('account.manage') }}
        </UButton>
        <UButton
          v-if="billing && billing.access !== 'pro'"
          :to="localePath('/pro')"
          icon="i-lucide-sparkles"
        >
          {{ t('plans.goPro', { price: `$${PRICES.monthly.usd}` }) }}
        </UButton>
        <UButton
          :to="localePath('/team')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-building-2"
        >
          {{ billing?.org ? t('account.yourTeam') : t('account.haveCode') }}
        </UButton>
      </div>
    </section>
  </div>
</template>
