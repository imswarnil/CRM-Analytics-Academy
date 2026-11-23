<script setup lang="ts">
/**
 * /pro — pricing, rendered from PLANS (shared/utils/products.ts):
 *
 *   B2C  Free · Pro Monthly (subscription) · Pro Lifetime (one payment)
 *        → POST /api/billing/checkout { plan }
 *   B2B  Teams & institutions — seats for companies, colleges and teams
 *        → a short request (POST /api/leads → Salesforce), then an org in /admin
 *
 * Access is granted by the Stripe webhook (or a seat), never by this page.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, isSignedIn } = useAuth()
const { pro } = useProgress()
const track = (name: string, label?: string) => useNuxtApp().$track?.(name, label)

const usd = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const busy = ref<PaidPlan | ''>('')
const error = ref('')
const cancelled = computed(() => route.query.checkout === 'cancelled')
const price = (id: PlanId) => (id === 'free' ? usd(0) : id in PRICES ? usd(PRICES[id as PaidPlan].usd) : '')
// Yearly, put in monthly terms, and what it saves against twelve months.
const usd2 = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
const yearlyPerMonth = computed(() => usd2(PRICES.yearly.usd / 12))
const yearlySave = Math.round((1 - PRICES.yearly.usd / (PRICES.monthly.usd * 12)) * 100)
// One Pro card, three ways to pay — the way most SaaS pricing reads.
const billing = ref<PaidPlan>('yearly')
const billingOptions = computed(() => (Object.keys(PRICES) as PaidPlan[]).map(id => ({ id, label: t(`plans.billing.${id}`) })))
const trust = [
  { icon: 'i-lucide-lock', key: 'stripe' },
  { icon: 'i-lucide-rotate-ccw', key: 'cancel' },
  { icon: 'i-lucide-ban', key: 'noAds' }
]

async function buy(plan: PaidPlan) {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: `${localePath('/pro')}#plans` } })
    return
  }
  busy.value = plan
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan, locale: locale.value } })
    track('checkout', plan)
    window.location.href = res.url
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    busy.value = ''
  }
}

/* --- Teams & institutions: a short seat request ---------------------------------- */
const form = reactive({ orgKind: 'company' as OrgKind, company: '', seats: 25, when: 'now' as 'now' | 'quarter' | 'exploring', email: '', message: '', website: '' })
watch(user, u => (form.email ||= u?.email ?? ''), { immediate: true })
const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const sent = ref(false)
// The sales request opens in a dialog: the pricing page stays about prices.
const salesOpen = ref(false)
const formError = ref('')
async function send() {
  formError.value = ''
  if (!token.value) {
    formError.value = t('human.wait')
    return
  }
  sending.value = true
  try {
    const source = (useNuxtApp().$firstTouch as (() => string) | undefined)?.() ?? ''
    await $fetch('/api/leads', {
      method: 'POST',
      body: { product: 'seats', company: form.company, orgKind: form.orgKind, seats: form.seats, email: form.email, message: [`Start: ${form.when}`, form.message.trim()].filter(Boolean).join('\n'), website: form.website, token: token.value, locale: locale.value, source, landing: '/pro' }
    })
    sent.value = true
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
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: `PRO ${usd(PRICES.monthly.usd)}/MO · ${usd(PRICES.yearly.usd)}/YR · LIFETIME ${usd(PRICES.lifetime.usd)}` })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('store.eyebrow'), path: '/pro' }],
  extra: [{
    '@type': 'Product',
    'name': `${SITE.name} Pro`,
    'description': t('plans.pro.tagline'),
    'brand': { '@type': 'Organization', 'name': SITE.name },
    'offers': [
      { '@type': 'Offer', 'name': 'Pro Monthly', 'price': String(PRICES.monthly.usd), 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'name': 'Pro Yearly', 'price': String(PRICES.yearly.usd), 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'name': 'Pro Lifetime', 'price': String(PRICES.lifetime.usd), 'priceCurrency': 'USD' }
    ]
  }]
}))
</script>

<template>
  <div>
    <section class="border-b border-(--line) bg-(--card)">
      <div class="mx-auto max-w-3xl px-4 py-10 text-center sm:py-12">
        <p class="eyebrow">
          {{ t('store.eyebrow') }}
        </p>
        <h1 class="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-(--ink) sm:text-4xl">
          {{ t('store.title') }}
        </h1>
        <p class="mx-auto mt-3 max-w-xl text-[1.0625rem] text-(--ink2)">
          {{ t('store.lead') }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          <a
            href="#compare"
            class="inline-flex items-center gap-1 text-(--signal) hover:underline"
          >
            <UIcon
              name="i-lucide-scale"
              class="size-4"
            />{{ t('store.toCompare') }}
          </a>
        </div>
      </div>
    </section>

    <div
      id="plans"
      class="mx-auto max-w-(--ui-container) scroll-mt-24 space-y-14 px-4 py-10 sm:px-6 lg:px-8"
    >
      <UAlert
        v-if="cancelled"
        color="neutral"
        variant="subtle"
        icon="i-lucide-circle-x"
        :description="t('plans.cancelled')"
      />

      <!-- The plans: Free · Pro (three ways to pay) · Teams -->
      <section>
        <div class="flex justify-center">
          <div
            class="inline-flex rounded-full border border-(--line) bg-(--card) p-1"
            role="radiogroup"
            :aria-label="t('plans.billing.label')"
          >
            <button
              v-for="b in billingOptions"
              :key="b.id"
              type="button"
              role="radio"
              :aria-checked="billing === b.id"
              class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              :class="billing === b.id ? 'bg-(--navy) text-white' : 'text-(--ink2) hover:text-(--ink)'"
              @click="billing = b.id"
            >
              {{ b.label }}
              <span
                v-if="b.id === 'yearly'"
                class="rounded-full px-1.5 text-[10px] font-bold"
                :class="billing === b.id ? 'bg-white/20 text-white' : 'bg-success/10 text-success'"
              >−{{ yearlySave }}%</span>
            </button>
          </div>
        </div>

        <div class="mx-auto mt-8 grid max-w-5xl items-stretch gap-4 lg:grid-cols-3">
          <!-- Free -->
          <article class="flex flex-col rounded-[8px] border border-(--line) bg-(--card) p-7">
            <h2 class="text-lg font-bold text-(--ink)">
              {{ t('plans.free.name') }}
            </h2>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ t('plans.free.tagline') }}
            </p>
            <p class="mt-6 flex items-baseline gap-1.5">
              <span class="text-5xl font-bold tracking-tight tabular-nums text-(--ink)">{{ usd(0) }}</span>
              <span class="text-sm text-(--ink2)">{{ t('plans.free.unit') }}</span>
            </p>
            <p class="mt-2 h-5 text-sm text-(--ink2)" />
            <UButton
              :to="localePath('/course')"
              block
              size="lg"
              color="neutral"
              variant="outline"
              class="mt-6"
            >
              {{ t('plans.free.cta') }}
            </UButton>
            <ul class="mt-7 space-y-3 border-t border-(--line) pt-6">
              <li
                v-for="n in 4"
                :key="n"
                class="flex items-start gap-2.5 text-sm text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--ink2)"
                />{{ t(`plans.free.f${n}`) }}
              </li>
            </ul>
          </article>

          <!-- Pro -->
          <article class="relative flex flex-col rounded-[8px] border-2 border-(--signal) bg-(--card) p-7 shadow-[0_18px_40px_-24px_rgb(1_118_211/.55)] lg:-my-3 lg:py-10">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-(--signal) px-3 py-1 text-[10px] font-bold uppercase tracking-[.09em] whitespace-nowrap text-white">{{ t('plans.best') }}</span>
            <h2 class="flex items-center gap-2 text-lg font-bold text-(--ink)">
              {{ t(`plans.${billing}.name`) }}
            </h2>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ t(`plans.${billing}.tagline`) }}
            </p>
            <p class="mt-6 flex items-baseline gap-1.5">
              <span class="text-5xl font-bold tracking-tight tabular-nums text-(--ink)">{{ price(billing) }}</span>
              <span class="text-sm text-(--ink2)">{{ t(`plans.${billing}.unit`) }}</span>
            </p>
            <p class="mt-2 flex h-5 items-center gap-2 text-sm text-(--ink2)">
              <template v-if="billing === 'yearly'">
                {{ t('plans.perMonth', { price: yearlyPerMonth }) }}
                <span class="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">{{ t('plans.save', { pct: yearlySave }) }}</span>
              </template>
              <template v-else>
                {{ t(`plans.note.${billing}`) }}
              </template>
            </p>
            <ClientOnly>
              <p
                v-if="pro"
                class="mt-6 flex h-11 items-center justify-center gap-2 rounded-[4px] bg-(--paper) text-sm font-semibold text-(--ink2)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-4"
                />{{ t('plans.current') }}
              </p>
              <UButton
                v-else
                block
                size="xl"
                class="mt-6"
                trailing-icon="i-lucide-arrow-right"
                :loading="busy === billing"
                @click="buy(billing)"
              >
                {{ t(`plans.${billing}.cta`) }}
              </UButton>
              <template #fallback>
                <div class="mt-6 h-11" />
              </template>
            </ClientOnly>
            <ul class="mt-7 space-y-3 border-t border-(--line) pt-6">
              <li
                v-for="n in 5"
                :key="n"
                class="flex items-start gap-2.5 text-sm text-(--ink)"
              >
                <UIcon
                  name="i-lucide-circle-check"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`plans.monthly.f${n}`) }}
              </li>
            </ul>
          </article>

          <!-- Teams -->
          <article class="flex flex-col rounded-[8px] border border-(--line) bg-(--card) p-7">
            <h2 class="text-lg font-bold text-(--ink)">
              {{ t('plans.teams.name') }}
            </h2>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ t('plans.teams.tagline') }}
            </p>
            <p class="mt-6 flex items-baseline gap-1.5">
              <span class="text-5xl font-bold tracking-tight text-(--ink)">{{ t('plans.teams.price') }}</span>
            </p>
            <p class="mt-2 h-5 text-sm text-(--ink2)">
              {{ t('plans.teams.unit') }}
            </p>
            <UButton
              block
              size="lg"
              color="neutral"
              variant="outline"
              class="mt-6"
              @click="salesOpen = true"
            >
              {{ t('plans.teams.cta') }}
            </UButton>
            <ul class="mt-7 space-y-3 border-t border-(--line) pt-6">
              <li
                v-for="n in 5"
                :key="n"
                class="flex items-start gap-2.5 text-sm text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--ink2)"
                />{{ t(`plans.teams.f${n}`) }}
              </li>
            </ul>
          </article>
        </div>

        <ul class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-(--ink2)">
          <li
            v-for="tr in trust"
            :key="tr.key"
            class="flex items-center gap-1.5"
          >
            <UIcon
              :name="tr.icon"
              class="size-4 text-(--signal)"
            />{{ t(`plans.trust.${tr.key}`) }}
          </li>
        </ul>
        <UAlert
          v-if="error"
          class="mx-auto mt-4 max-w-5xl"
          color="error"
          variant="subtle"
          :description="error"
        />
      </section>

      <!-- For organisations -->
      <section
        id="teams"
        class="scroll-mt-24 overflow-hidden rounded-[8px] bg-(--navy) text-white"
      >
        <div class="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[.09em] text-white/70">
              {{ t('plans.forOrgs') }}
            </p>
            <h2 class="mt-3 text-3xl font-bold tracking-tight">
              {{ t('plans.teams.name') }}
            </h2>
            <p class="mt-2 text-white/75">
              {{ t('plans.teams.tagline') }}
            </p>
            <ul class="mt-6 space-y-2.5">
              <li
                v-for="n in 5"
                :key="n"
                class="flex items-start gap-2 text-sm text-white/90"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-blueprint-300"
                />{{ t(`plans.teams.f${n}`) }}
              </li>
            </ul>
          </div>

          <div class="flex flex-col items-start justify-center gap-4">
            <p class="text-white/80">
              {{ t('plans.salesLead') }}
            </p>
            <UButton
              size="xl"
              icon="i-lucide-message-square-plus"
              @click="salesOpen = true"
            >
              {{ t('plans.teams.cta') }}
            </UButton>
          </div>
        </div>
      </section>

      <p class="text-center text-sm text-(--ink2)">
        {{ t('plans.footnote') }}
      </p>
    </div>

    <!-- How the price compares with classroom training -->
    <div
      id="compare"
      class="scroll-mt-20 border-t border-(--line) bg-(--card)"
    >
      <HomeCompare />
    </div>
    <UModal
      v-model:open="salesOpen"
      :title="t('plans.teams.name')"
      :description="t('plans.teams.tagline')"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <div class="text-(--ink)">
          <div
            v-if="sent"
            class="flex flex-col items-center py-8 text-center"
          >
            <span class="flex size-14 items-center justify-center rounded-full bg-success/10">
              <UIcon
                name="i-lucide-check"
                class="size-7 text-success"
              />
            </span>
            <p class="mt-4 text-xl font-bold text-(--ink)">
              {{ t('plans.sentTitle') }}
            </p>
            <p class="mt-2 max-w-sm text-(--ink2)">
              {{ t('store.sentBody') }}
            </p>
            <ol class="mt-6 space-y-2 text-start text-sm text-(--ink)">
              <li
                v-for="n in 3"
                :key="n"
                class="flex items-start gap-2.5"
              >
                <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--ice) text-xs font-bold text-(--signal)">{{ n }}</span>{{ t(`plans.next.${n}`) }}
              </li>
            </ol>
          </div>
          <form
            v-else
            class="grid gap-5 sm:grid-cols-2"
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
            <UFormField
              :label="t('plans.f.kind')"
              class="sm:col-span-2"
            >
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="k in ORG_KINDS"
                  :key="k"
                  type="button"
                  class="flex flex-col items-center gap-1.5 rounded-[6px] border px-2 py-3 text-sm font-semibold transition-colors"
                  :class="form.orgKind === k ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
                  :aria-pressed="form.orgKind === k"
                  @click="form.orgKind = k"
                >
                  <UIcon
                    :name="{ company: 'i-lucide-building-2', college: 'i-lucide-graduation-cap', team: 'i-lucide-users' }[k]"
                    class="size-5"
                  />{{ t(`plans.kind.${k}`) }}
                </button>
              </div>
            </UFormField>
            <UFormField
              :label="form.orgKind === 'college' ? t('plans.f.college') : t('plans.f.org')"
              required
            >
              <UInput
                v-model="form.company"
                :placeholder="t('plans.orgName')"
                size="lg"
                class="w-full"
                autocomplete="organization"
                required
              />
            </UFormField>
            <UFormField
              :label="form.orgKind === 'college' ? t('plans.f.students') : t('plans.f.seats')"
              :help="t('plans.f.seatsHelp')"
              class="sm:col-span-2"
            >
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="n in [10, 25, 100, 250]"
                  :key="n"
                  type="button"
                  class="rounded-full border px-3 py-1 text-sm font-semibold tabular-nums transition-colors"
                  :class="form.seats === n ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
                  @click="form.seats = n"
                >
                  {{ n }}{{ n === 250 ? '+' : '' }}
                </button>
                <UInput
                  v-model.number="form.seats"
                  type="number"
                  min="2"
                  class="w-24"
                  :aria-label="t('plans.seats')"
                />
              </div>
            </UFormField>
            <UFormField
              :label="t('plans.f.when')"
              class="sm:col-span-2"
            >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="w in (['now', 'quarter', 'exploring'] as const)"
                  :key="w"
                  type="button"
                  class="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
                  :class="form.when === w ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
                  @click="form.when = w"
                >
                  {{ t(`plans.when.${w}`) }}
                </button>
              </div>
            </UFormField>
            <UFormField
              :label="t('plans.f.email')"
              :help="form.orgKind === 'college' ? t('plans.f.emailCollege') : undefined"
              required
            >
              <UInput
                v-model="form.email"
                type="email"
                :placeholder="t('store.f.email')"
                size="lg"
                class="w-full"
                autocomplete="email"
                required
              />
            </UFormField>
            <UFormField
              :label="t('plans.f.message')"
              :hint="t('contrib.optional')"
              class="sm:col-span-2"
            >
              <UTextarea
                v-model="form.message"
                :placeholder="t('plans.messagePlaceholder')"
                :rows="3"
                autoresize
                class="w-full"
              />
            </UFormField>
            <HumanCheck
              ref="human"
              v-model="token"
              class="sm:col-span-2"
            />
            <UAlert
              v-if="formError"
              color="error"
              variant="subtle"
              :description="formError"
              class="sm:col-span-2"
            />
            <UButton
              type="submit"
              size="xl"
              :loading="sending"
              icon="i-lucide-send"
              block
              class="sm:col-span-2"
            >
              {{ t('plans.teams.cta') }}
            </UButton>
            <p class="flex items-center justify-center gap-1.5 text-xs text-(--ink2) sm:col-span-2">
              <UIcon
                name="i-lucide-clock"
                class="size-3.5"
              />{{ t('plans.f.reply') }}
            </p>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>
