<script setup lang="ts">
/**
 * /account — what you can open, and how you got it:
 *
 *   YouTube     verified subscriber or not (re-checked with Google)
 *   All Access  bought once, or the button to buy it
 *
 * Access only ever comes from the Stripe webhook or the Google check.
 */
definePageMeta({ middleware: 'auth' })

interface Billing {
  configured: boolean
  access: Access
  pro: boolean
  purchase: { product: string, at: string } | null
  youtube: { subscribed: boolean, verifiedAt: string } | null
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user } = useAuth()
const { access } = useProgress()
const { data: billing, refresh } = useLazyFetch<Billing>('/api/billing', { server: false })
watch(access, () => refresh())

const date = (d: string) => new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
const busy = ref(false)
const error = ref('')
async function buy() {
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { locale: locale.value } })
    window.location.href = res.url
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    busy.value = false
  }
}

useSeoMeta({ title: () => t('account.title'), robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 px-4 py-14">
    <header>
      <h1 class="text-3xl font-bold tracking-tight text-(--ink)">
        {{ t('account.title') }}
      </h1>
      <p class="mt-1 text-(--ink2)">
        {{ user?.email }}
      </p>
    </header>

    <!-- What you hold -->
    <section class="rounded-3xl border border-(--line) bg-(--card) p-6">
      <p class="text-sm text-(--ink2)">
        {{ t('account.current') }}
      </p>
      <p class="mt-1 text-2xl font-semibold text-(--ink)">
        {{ t(`plans.${access === 'pro' ? 'all-access' : access}.name`) }}
      </p>
    </section>

    <!-- YouTube -->
    <section class="rounded-3xl border border-(--line) bg-(--card) p-6">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-(--ink)">
        <UIcon
          name="i-simple-icons-youtube"
          class="size-5 text-[#FF0000]"
        />{{ t('plans.youtube.name') }}
      </h2>
      <p class="mt-1 text-sm text-(--ink2)">
        <template v-if="billing?.youtube?.subscribed">
          {{ t('account.youtubeVerified', { date: date(billing.youtube.verifiedAt) }) }}
        </template>
        <template v-else>
          {{ t('plans.youtube.tagline') }}
        </template>
      </p>
      <div class="mt-4">
        <YoutubeUnlock />
      </div>
    </section>

    <!-- All Access -->
    <section class="rounded-3xl border border-(--line) bg-(--card) p-6">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-(--ink)">
        <UIcon
          name="i-lucide-infinity"
          class="size-5 text-(--signal)"
        />{{ t('plans.all-access.name') }}
      </h2>
      <p
        v-if="billing?.purchase"
        class="mt-1 text-sm text-(--ink2)"
      >
        {{ t('account.boughtOn', { date: date(billing.purchase.at) }) }}
      </p>
      <template v-else-if="access !== 'pro'">
        <p class="mt-1 text-sm text-(--ink2)">
          {{ t('plans.all-access.tagline') }}
        </p>
        <UButton
          class="mt-4 rounded-full"
          size="lg"
          :loading="busy"
          :disabled="billing && !billing.configured"
          @click="buy"
        >
          {{ t('plans.all-access.cta', { price: `$${PRICES.allAccess.usd}` }) }}
        </UButton>
        <UAlert
          v-if="error"
          class="mt-3"
          color="error"
          variant="subtle"
          :description="error"
        />
      </template>
      <p
        v-else
        class="mt-1 text-sm text-(--ink2)"
      >
        {{ t('plans.current') }}
      </p>
    </section>

    <p class="text-center text-sm">
      <NuxtLink
        :to="localePath('/pro')"
        class="font-semibold text-(--signal) hover:underline"
      >{{ t('account.comparePlans') }}</NuxtLink>
    </p>
  </div>
</template>
