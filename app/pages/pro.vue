<script setup lang="ts">
/**
 * /pro — the plans (shared/utils/products.ts), paid through Stripe Checkout:
 *
 *   Free   every free lesson and tool, unlimited once signed in
 *   Pro    every paid lesson, no ads — monthly or yearly (POST /api/billing/checkout)
 *   Team   Pro per seat; the buyer is the admin and assigns seats at /team
 *          (POST /api/billing/team)
 *
 * Access is granted by the Stripe webhook, never by this page. Below the
 * plans: sponsors (/sponsor) and a three-field "talk to us" form for set-up
 * help, consulting and large organisations (POST /api/leads → Salesforce).
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, isSignedIn } = useAuth()
const { pro: isPro } = useProgress()
const track = (name: string, label?: string) => useNuxtApp().$track?.(name, label)
onMounted(() => track('pricing_view', String(route.query.from ?? '')))

const usd = (n: number, digits = 0) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)
const yearly = ref(true)
const proPrice = computed(() => (yearly.value ? PRICES.proYearly.usd / 12 : PRICES.proMonthly.usd))
const saving = Math.round((1 - PRICES.proYearly.usd / (PRICES.proMonthly.usd * 12)) * 100)

const busy = ref('')
const talkOpen = ref(route.hash === '#request')
const error = ref('')
const cancelled = computed(() => route.query.checkout === 'cancelled')

// Teams pick their seats on /account; Pro goes straight to Stripe.
async function go(kind: 'pro') {
  track('plan_click', kind)
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: `${localePath('/pro')}#plans` } })
    return
  }
  busy.value = kind
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan: yearly.value ? 'proYearly' : 'proMonthly', locale: locale.value } })
    window.location.href = res.url
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    busy.value = ''
  }
}

/* --- Talk to us: three fields --------------------------------------------------- */
type Interest = 'salesforce-setup' | 'seats' | 'consulting' | 'mentoring'
const INTERESTS: Interest[] = ['salesforce-setup', 'seats', 'consulting', 'mentoring']
const form = reactive({ interest: 'salesforce-setup' as Interest, email: '', message: '', website: '' })
watch(user, u => (form.email ||= u?.email ?? ''), { immediate: true })
const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const sent = ref(false)
const formError = ref('')
async function send() {
  formError.value = ''
  if (!token.value) {
    formError.value = t('human.wait')
    return
  }
  sending.value = true
  try {
    let source = ''
    let visitor = ''
    try {
      source = sessionStorage.getItem('crma-source') ?? ''
      visitor = localStorage.getItem('crma-v') ?? ''
    } catch { /* storage blocked */ }
    await $fetch('/api/leads', { method: 'POST', body: { product: form.interest, email: form.email, message: form.message, website: form.website, token: token.value, locale: locale.value, source, visitor, landing: '/pro' } })
    sent.value = true
    track('lead', form.interest)
    if (form.interest === 'salesforce-setup') track('salesforce_interest', 'pro')
  } catch (e) {
    formError.value = apiError(e) || t('contrib.err.generic')
    human.value?.reset()
  } finally {
    sending.value = false
  }
}

const title = computed(() => t('store.seoTitle'))
const description = computed(() => t('store.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: `PRO ${usd(PRICES.proMonthly.usd)}/MO · TEAMS ${usd(PRICES.teamSeat.usd)}/SEAT` })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('store.eyebrow'), path: '/pro' }],
  extra: [{
    '@type': 'Product',
    'name': `${SITE.name} Pro`,
    'description': t('products.pro.tagline'),
    'brand': { '@type': 'Organization', 'name': SITE.name },
    'offers': [
      { '@type': 'Offer', 'name': 'Monthly', 'price': String(PRICES.proMonthly.usd), 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'name': 'Yearly', 'price': String(PRICES.proYearly.usd), 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'name': 'Team seat (monthly)', 'price': String(PRICES.teamSeat.usd), 'priceCurrency': 'USD' }
    ]
  }]
}))
</script>

<template>
  <div>
    <section class="mx-auto max-w-5xl px-4 pt-16 pb-6 text-center sm:px-6">
      <h1 class="text-4xl font-black tracking-[-0.03em] text-(--ink) sm:text-5xl">
        {{ t('store.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-(--ink2)">
        {{ t('store.lead') }}
      </p>
    </section>

    <div
      id="plans"
      class="mx-auto max-w-5xl scroll-mt-24 space-y-10 px-4 pb-20 sm:px-6"
    >
      <UAlert
        v-if="cancelled"
        color="neutral"
        variant="subtle"
        icon="i-lucide-circle-x"
        :description="t('plans.cancelled')"
      />

      <!-- Monthly / yearly -->
      <div class="flex justify-center">
        <div class="inline-flex rounded-full border border-(--line) bg-(--card) p-1">
          <button
            v-for="y in [false, true]"
            :key="String(y)"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-semibold"
            :class="yearly === y ? 'bg-(--ink) text-(--paper)' : 'text-(--ink2)'"
            @click="yearly = y"
          >
            {{ y ? t('plans.yearly', { n: saving }) : t('plans.monthly') }}
          </button>
        </div>
      </div>

      <ul class="grid gap-5 md:grid-cols-3">
        <li
          v-for="p in PRODUCTS"
          :key="p.id"
          class="flex flex-col rounded-2xl border bg-(--card) p-6"
          :class="p.featured ? 'border-(--signal) ring-2 ring-(--signal)/20' : 'border-(--line)'"
        >
          <p class="flex items-center gap-2 text-lg font-bold text-(--ink)">
            <UIcon
              :name="p.icon"
              class="size-5 text-(--signal)"
            />{{ t(`products.${p.id}.name`) }}
            <span
              v-if="p.featured"
              class="ms-auto rounded-full bg-(--signal)/10 px-2 py-0.5 text-xs font-semibold text-(--signal)"
            >{{ t('store.popular') }}</span>
          </p>
          <p class="mt-4 flex items-baseline gap-1">
            <span class="text-4xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">{{ p.id === 'free' ? usd(0) : p.id === 'pro' ? usd(proPrice, yearly ? 2 : 0) : usd(PRICES.teamSeat.usd) }}</span>
            <span class="text-sm text-(--ink2)">{{ p.id === 'free' ? t('plans.forever') : p.id === 'pro' ? t('plans.perMonth') : t('plans.perSeat') }}</span>
          </p>
          <p class="mt-1 min-h-5 text-xs text-(--ink2)">
            {{ p.id === 'pro' && yearly ? t('plans.billedYearly', { price: usd(PRICES.proYearly.usd) }) : '' }}
          </p>
          <p class="mt-3 text-[15px] text-(--ink2)">
            {{ t(`products.${p.id}.tagline`) }}
          </p>
          <ul class="mt-5 flex-1 space-y-2">
            <li
              v-for="n in Math.min(p.features, 4)"
              :key="n"
              class="flex items-start gap-2 text-[15px] text-(--ink)"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-(--signal)"
              />{{ t(`products.${p.id}.f${n}`) }}
            </li>
          </ul>
          <UButton
            v-if="p.id === 'free'"
            class="mt-6"
            block
            size="lg"
            variant="outline"
            color="neutral"
            :to="isSignedIn ? localePath('/curriculum') : localePath('/sign-up')"
          >
            {{ isSignedIn ? t('plans.startLearning') : t('pro.signUpFirst') }}
          </UButton>
          <UButton
            v-else-if="p.id === 'pro'"
            class="mt-6"
            block
            size="lg"
            :loading="busy === 'pro'"
            :disabled="isPro"
            @click="go('pro')"
          >
            {{ isPro ? t('plans.youArePro') : t('plans.getPro') }}
          </UButton>
          <UButton
            v-else
            class="mt-6"
            block
            size="lg"
            variant="outline"
            color="neutral"
            :to="isSignedIn ? localePath('/account') : { path: localePath('/sign-up'), query: { redirect: localePath('/account') } }"
            @click="track('plan_click', 'team')"
          >
            {{ t('plans.buyTeam') }}
          </UButton>
        </li>
      </ul>
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :description="error"
      />
      <p class="text-center text-sm text-(--ink2)">
        <UIcon
          name="i-lucide-lock"
          class="me-1 inline size-4 align-[-3px]"
        />{{ t('plans.stripeNote') }}
      </p>

      <!-- Sponsors, and talking to a person: one line each -->
      <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-(--line) pt-8 text-sm">
        <NuxtLink
          :to="localePath('/sponsor')"
          class="inline-flex items-center gap-1.5 font-semibold text-(--ink) hover:text-(--signal)"
        >
          <UIcon
            name="i-lucide-megaphone"
            class="size-4"
          />{{ t('sponsor.title') }} · {{ t('sponsor.fromPrice', { price: usd(PRICES.sponsorWeek.usd) }) }}
        </NuxtLink>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 font-semibold text-(--ink) hover:text-(--signal)"
          @click="talkOpen = !talkOpen"
        >
          <UIcon
            name="i-lucide-message-circle"
            class="size-4"
          />{{ t('plans.requestTitle') }}
        </button>
      </div>

      <section
        v-if="talkOpen"
        id="request"
        class="mx-auto max-w-xl scroll-mt-24 rounded-2xl border border-(--line) bg-(--card) p-6"
      >
        <p class="text-sm text-(--ink2)">
          {{ t('plans.requestLead') }}
        </p>
        <p
          v-if="sent"
          class="mt-4 text-(--ink)"
        >
          {{ t('store.sentBody') }}
        </p>
        <form
          v-else
          class="mt-4 grid gap-3"
          @submit.prevent="send"
        >
          <input
            v-model="form.website"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="absolute -left-[9999px] size-px opacity-0"
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="i in INTERESTS"
              :key="i"
              type="button"
              class="rounded-full border px-3 py-1 text-sm font-semibold"
              :class="form.interest === i ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--ink)'"
              @click="form.interest = i"
            >
              {{ t(`plans.interest.${i}`) }}
            </button>
          </div>
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="t('store.f.email')"
            size="lg"
            autocomplete="email"
            :disabled="isSignedIn"
            required
          />
          <UTextarea
            v-model="form.message"
            :placeholder="t('plans.messagePlaceholder')"
            :rows="2"
            autoresize
          />
          <HumanCheck
            ref="human"
            v-model="token"
          />
          <UAlert
            v-if="formError"
            color="error"
            variant="subtle"
            :description="formError"
          />
          <UButton
            type="submit"
            size="lg"
            :loading="sending"
            icon="i-lucide-send"
          >
            {{ t('store.send') }}
          </UButton>
        </form>
      </section>
    </div>
  </div>
</template>
