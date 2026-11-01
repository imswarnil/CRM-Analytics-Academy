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

const team = reactive({ name: '', seats: 5 })
const busy = ref('')
const error = ref('')
const cancelled = computed(() => route.query.checkout === 'cancelled')

async function go(kind: 'pro' | 'team') {
  track('plan_click', kind)
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: `${localePath('/pro')}#plans` } })
    return
  }
  busy.value = kind
  error.value = ''
  try {
    const res = kind === 'pro'
      ? await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan: yearly.value ? 'proYearly' : 'proMonthly', locale: locale.value } })
      : await $fetch<{ url: string }>('/api/billing/team', { method: 'POST', body: { name: team.name || `${user.value?.name ?? 'My'} team`, seats: team.seats } })
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
    <BpPageHeader
      sheet="SHEET 09 / PLANS"
      :title="t('store.title')"
      :lead="t('store.lead')"
    >
      <ShareBar
        class="mt-6"
        :title="t('store.title')"
        :text="t('store.seoDesc')"
      />
    </BpPageHeader>

    <div
      id="plans"
      class="mx-auto max-w-(--ui-container) scroll-mt-24 space-y-12 px-4 py-12 sm:px-6 lg:px-8"
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
        <div class="inline-flex border-[1.5px] border-(--ink) bg-(--card) p-1">
          <button
            v-for="y in [false, true]"
            :key="String(y)"
            type="button"
            class="px-4 py-1.5 text-sm font-semibold"
            :class="yearly === y ? 'bg-(--ink) text-(--paper)' : 'text-(--ink)'"
            @click="yearly = y"
          >
            {{ y ? t('plans.yearly', { n: saving }) : t('plans.monthly') }}
          </button>
        </div>
      </div>

      <ul class="grid gap-6 lg:grid-cols-3">
        <li
          v-for="p in PRODUCTS"
          :key="p.id"
          class="crosshair flex flex-col border-[1.5px] border-(--ink) bg-(--card)"
          :class="p.featured ? 'shadow-[8px_8px_0_var(--signal)]' : ''"
        >
          <div class="flex items-center justify-between border-b-[1.5px] border-(--ink) px-5 py-3">
            <UIcon
              :name="p.icon"
              class="size-6 text-(--signal)"
            />
            <span
              v-if="p.featured"
              class="bg-(--signal) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.12em] text-white"
            >{{ t('store.popular') }}</span>
          </div>
          <div class="flex flex-1 flex-col p-5">
            <h2 class="text-xl font-extrabold text-(--ink)">
              {{ t(`products.${p.id}.name`) }}
            </h2>
            <p class="mt-1 text-[15px] leading-snug text-(--ink2)">
              {{ t(`products.${p.id}.tagline`) }}
            </p>
            <p class="mt-4 flex items-baseline gap-1">
              <span class="text-4xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">{{ p.id === 'free' ? usd(0) : p.id === 'pro' ? usd(proPrice, yearly ? 2 : 0) : usd(PRICES.teamSeat.usd) }}</span>
              <span class="font-mono text-xs text-(--ink2)">{{ p.id === 'free' ? t('plans.forever') : p.id === 'pro' ? t('plans.perMonth') : t('plans.perSeat') }}</span>
            </p>
            <p
              v-if="p.id === 'pro' && yearly"
              class="mt-1 font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)"
            >
              {{ t('plans.billedYearly', { price: usd(PRICES.proYearly.usd) }) }}
            </p>
            <ul class="mt-4 flex-1 space-y-2">
              <li
                v-for="n in p.features"
                :key="n"
                class="flex items-start gap-2 text-[15px] text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`products.${p.id}.f${n}`) }}
              </li>
            </ul>

            <!-- Free -->
            <UButton
              v-if="p.id === 'free'"
              class="mt-6"
              block
              size="lg"
              variant="outline"
              color="neutral"
              :icon="isSignedIn ? 'i-lucide-book-open' : 'i-lucide-user-plus'"
              :to="isSignedIn ? localePath('/curriculum') : localePath('/sign-up')"
            >
              {{ isSignedIn ? t('plans.startLearning') : t('pro.signUpFirst') }}
            </UButton>

            <!-- Pro -->
            <UButton
              v-else-if="p.id === 'pro'"
              class="mt-6"
              block
              size="lg"
              :icon="isPro ? 'i-lucide-badge-check' : 'i-lucide-sparkles'"
              :loading="busy === 'pro'"
              :disabled="isPro"
              @click="go('pro')"
            >
              {{ isPro ? t('plans.youArePro') : t('plans.getPro') }}
            </UButton>

            <!-- Team: name + seats, then checkout -->
            <div
              v-else
              class="mt-6 space-y-2"
            >
              <UInput
                v-model="team.name"
                :placeholder="t('plans.teamName')"
                size="lg"
                class="w-full"
              />
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-minus"
                  color="neutral"
                  variant="outline"
                  square
                  :aria-label="t('plans.fewer')"
                  :disabled="team.seats <= TEAM_MIN_SEATS"
                  @click="team.seats--"
                />
                <span class="min-w-24 text-center font-semibold tabular-nums text-(--ink)">{{ t('plans.seatsN', { n: team.seats }) }}</span>
                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  square
                  :aria-label="t('plans.more')"
                  @click="team.seats++"
                />
                <span class="ms-auto font-mono text-sm tabular-nums text-(--ink2)">{{ usd(team.seats * PRICES.teamSeat.usd) }}{{ t('plans.perMonthShort') }}</span>
              </div>
              <UButton
                block
                size="lg"
                icon="i-lucide-users"
                :loading="busy === 'team'"
                @click="go('team')"
              >
                {{ t('plans.buyTeam') }}
              </UButton>
            </div>
          </div>
        </li>
      </ul>
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :description="error"
      />
      <p class="text-center text-sm text-(--ink2)">
        {{ t('plans.stripeNote') }}
      </p>

      <PromoSlot unit="leaderboard728x90" />

      <!-- Sponsors -->
      <NuxtLink
        :to="localePath('/sponsor')"
        class="graph-paper-navy flex flex-wrap items-center gap-4 border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white shadow-[8px_8px_0_var(--signal)]"
      >
        <UIcon
          name="i-lucide-megaphone"
          class="size-8 text-(--glow)"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-xl font-extrabold">{{ t('sponsor.title') }}</span>
          <span class="block text-sm text-white/75">{{ t('sponsor.lead') }}</span>
        </span>
        <span class="font-mono text-xs uppercase tracking-[.12em] text-(--glow)">{{ t('sponsor.fromPrice', { price: usd(PRICES.sponsorWeek.usd) }) }} →</span>
      </NuxtLink>

      <!-- Talk to us -->
      <section
        id="request"
        class="mx-auto max-w-2xl scroll-mt-24 border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-4">
          <p class="font-bold text-(--ink)">
            {{ t('plans.requestTitle') }}
          </p>
          <p class="mt-1 text-sm text-(--ink2)">
            {{ t('plans.requestLead') }}
          </p>
        </header>
        <p
          v-if="sent"
          class="p-6 text-(--ink)"
        >
          {{ t('store.sentBody') }}
        </p>
        <form
          v-else
          class="grid gap-4 p-6"
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
              class="border-[1.5px] px-3 py-1.5 text-[15px] font-semibold"
              :class="form.interest === i ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
              @click="form.interest = i"
            >
              {{ t(`plans.interest.${i}`) }}
            </button>
          </div>
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="t('store.f.email')"
            size="xl"
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
            size="xl"
            block
            :loading="sending"
            icon="i-lucide-send"
          >
            {{ t('store.send') }}
          </UButton>
        </form>
      </section>

      <PromoSlot unit="multiplexHorizontal" />
    </div>
  </div>
</template>
