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
const price = (id: PlanId) => (id === 'monthly' ? usd(PRICES.monthly.usd) : id === 'lifetime' ? usd(PRICES.lifetime.usd) : id === 'free' ? usd(0) : '')

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
const form = reactive({ orgKind: 'company' as OrgKind, company: '', seats: 25, email: '', message: '', website: '' })
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
    const source = (useNuxtApp().$firstTouch as (() => string) | undefined)?.() ?? ''
    await $fetch('/api/leads', {
      method: 'POST',
      body: { product: 'seats', company: form.company, orgKind: form.orgKind, seats: form.seats, email: form.email, message: form.message, website: form.website, token: token.value, locale: locale.value, source, landing: '/pro' }
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
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: `PRO ${usd(PRICES.monthly.usd)}/MO · LIFETIME ${usd(PRICES.lifetime.usd)}` })
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
      { '@type': 'Offer', 'name': 'Pro Lifetime', 'price': String(PRICES.lifetime.usd), 'priceCurrency': 'USD' }
    ]
  }]
}))
</script>

<template>
  <div>
    <section class="border-b border-(--line) bg-(--card)">
      <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
        <p class="eyebrow">
          {{ t('store.eyebrow') }}
        </p>
        <h1 class="bp-h1 mt-3">
          {{ t('store.title') }}
        </h1>
        <p class="bp-lead mx-auto mt-4 max-w-xl">
          {{ t('store.lead') }}
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          <a
            href="#plans"
            class="text-(--signal) hover:underline"
          >{{ t('store.toPlans') }}</a>
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
      class="mx-auto max-w-(--ui-container) scroll-mt-24 space-y-12 px-4 py-14 sm:px-6 lg:px-8"
    >
      <UAlert
        v-if="cancelled"
        color="neutral"
        variant="subtle"
        icon="i-lucide-circle-x"
        :description="t('plans.cancelled')"
      />

      <!-- For individuals -->
      <section>
        <p class="mono-label mb-4">
          {{ t('plans.forYou') }}
        </p>
        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="p in PLANS.filter(x => x.audience === 'b2c')"
            :key="p.id"
            class="relative flex flex-col rounded-[6px] border bg-(--card) p-6"
            :class="p.featured ? 'border-(--signal)' : 'border-(--line)'"
          >
            <span
              v-if="p.featured"
              class="absolute -top-2.5 left-6 rounded-full bg-(--signal) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[.09em] text-white"
            >{{ t('plans.best') }}</span>
            <UIcon
              :name="p.icon"
              class="size-6 text-(--signal)"
            />
            <h2 class="mt-4 text-lg font-bold text-(--ink)">
              {{ t(`plans.${p.id}.name`) }}
            </h2>
            <p class="mt-1 text-sm text-(--ink2)">
              {{ t(`plans.${p.id}.tagline`) }}
            </p>
            <p class="mt-6 flex items-baseline gap-1.5">
              <span class="text-4xl font-bold tracking-tight tabular-nums text-(--ink)">{{ price(p.id) }}</span>
              <span class="text-sm text-(--ink2)">{{ t(`plans.${p.id}.unit`) }}</span>
            </p>
            <ul class="mt-6 flex-1 space-y-2.5">
              <li
                v-for="n in p.features"
                :key="n"
                class="flex items-start gap-2 text-sm text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-(--signal)"
                />{{ t(`plans.${p.id}.f${n}`) }}
              </li>
            </ul>
            <div class="mt-7">
              <ClientOnly>
                <p
                  v-if="p.id !== 'free' && pro"
                  class="flex h-10 items-center justify-center gap-2 rounded-[4px] bg-(--paper) text-sm font-semibold text-(--ink2)"
                >
                  <UIcon
                    name="i-lucide-check"
                    class="size-4"
                  />{{ t('plans.current') }}
                </p>
                <UButton
                  v-else-if="p.id === 'free'"
                  :to="localePath('/start')"
                  block
                  size="lg"
                  color="neutral"
                  variant="outline"
                >
                  {{ t('plans.free.cta') }}
                </UButton>
                <UButton
                  v-else
                  block
                  size="lg"
                  :color="p.featured ? 'primary' : 'neutral'"
                  :variant="p.featured ? 'solid' : 'outline'"
                  :loading="busy === p.id"
                  @click="buy(p.id as PaidPlan)"
                >
                  {{ t(`plans.${p.id}.cta`) }}
                </UButton>
              </ClientOnly>
            </div>
          </article>
        </div>
        <UAlert
          v-if="error"
          class="mt-4"
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

          <div class="rounded-[6px] bg-(--card) p-6 text-(--ink)">
            <p
              v-if="sent"
              class="text-(--ink)"
            >
              {{ t('store.sentBody') }}
            </p>
            <form
              v-else
              class="grid gap-3"
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
                  v-for="k in ORG_KINDS"
                  :key="k"
                  type="button"
                  class="rounded-full border px-3 py-1 text-sm font-semibold transition-colors"
                  :class="form.orgKind === k ? 'border-(--signal) bg-(--ice) text-(--signal)' : 'border-(--line) text-(--ink2) hover:border-(--signal)'"
                  @click="form.orgKind = k"
                >
                  {{ t(`plans.kind.${k}`) }}
                </button>
              </div>
              <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <UInput
                  v-model="form.company"
                  :placeholder="t('plans.orgName')"
                  size="lg"
                  required
                />
                <UInput
                  v-model.number="form.seats"
                  type="number"
                  min="2"
                  :placeholder="t('plans.seats')"
                  size="lg"
                />
              </div>
              <UInput
                v-model="form.email"
                type="email"
                :placeholder="t('store.f.email')"
                size="lg"
                autocomplete="email"
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
                class="justify-center"
              >
                {{ t('plans.teams.cta') }}
              </UButton>
            </form>
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
  </div>
</template>
