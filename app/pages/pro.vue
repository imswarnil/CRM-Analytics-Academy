<script setup lang="ts">
/**
 * /pricing (route /pro) — the plans, rendered from PLANS in
 * shared/utils/products.ts, so a tier is added or re-priced there:
 *
 *   Free        every free lesson, the practice exam, interview questions
 *   YouTube     subscriber lessons — verified with Google (<YoutubeUnlock>)
 *   All Access  everything, one payment (POST /api/billing/checkout)
 *
 * Access is granted by the Stripe webhook or the Google check, never by this
 * page. Below the plans, a short "talk to us" form for companies and set-up
 * help (POST /api/leads → Salesforce).
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, isSignedIn } = useAuth()
const { access } = useProgress()
const track = (name: string, label?: string) => useNuxtApp().$track?.(name, label)

const usd = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const busy = ref(false)
const talkOpen = ref(route.hash === '#request')
const error = ref('')
const cancelled = computed(() => route.query.checkout === 'cancelled')
const holds = (p: Plan) => canOpen(access.value, p.unlocks)

async function buy() {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: `${localePath('/pro')}#plans` } })
    return
  }
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { locale: locale.value } })
    track('checkout', 'all-access')
    window.location.href = res.url
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    busy.value = false
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
    const source = new URLSearchParams(location.search).get('utm_source') ?? ''
    await $fetch('/api/leads', { method: 'POST', body: { product: form.interest, email: form.email, message: form.message, website: form.website, token: token.value, locale: locale.value, source, landing: '/pro' } })
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
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: `ALL ACCESS ${usd(PRICES.allAccess.usd)} · ONE PAYMENT` })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('store.eyebrow'), path: '/pro' }],
  extra: [{
    '@type': 'Product',
    'name': `${SITE.name} All Access`,
    'description': t('plans.all-access.tagline'),
    'brand': { '@type': 'Organization', 'name': SITE.name },
    'offers': [{ '@type': 'Offer', 'name': 'All Access', 'price': String(PRICES.allAccess.usd), 'priceCurrency': 'USD' }]
  }]
}))
</script>

<template>
  <div>
    <section class="mx-auto max-w-3xl px-4 pt-16 pb-8 text-center sm:pt-24">
      <h1 class="text-4xl font-bold tracking-tight text-(--ink) sm:text-5xl">
        {{ t('store.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-xl text-lg text-(--ink2)">
        {{ t('store.lead') }}
      </p>
    </section>

    <div
      id="plans"
      class="mx-auto max-w-5xl scroll-mt-24 space-y-10 px-4 pb-24 sm:px-6"
    >
      <UAlert
        v-if="cancelled"
        color="neutral"
        variant="subtle"
        icon="i-lucide-circle-x"
        :description="t('plans.cancelled')"
      />

      <div class="grid gap-5 md:grid-cols-3">
        <article
          v-for="p in PLANS"
          :key="p.id"
          class="relative flex flex-col rounded-3xl border bg-(--card) p-7"
          :class="p.featured ? 'border-(--signal) shadow-[0_20px_60px_-30px_var(--signal)]' : 'border-(--line)'"
        >
          <span
            v-if="p.featured"
            class="absolute -top-3 left-7 rounded-full bg-(--signal) px-3 py-1 text-xs font-semibold text-white"
          >{{ t('plans.best') }}</span>
          <UIcon
            :name="p.icon"
            class="size-7"
            :class="p.id === 'youtube' ? 'text-[#FF0000]' : 'text-(--signal)'"
          />
          <h2 class="mt-4 text-xl font-semibold text-(--ink)">
            {{ t(`plans.${p.id}.name`) }}
          </h2>
          <p class="mt-1 text-sm text-(--ink2)">
            {{ t(`plans.${p.id}.tagline`) }}
          </p>
          <p class="mt-6 flex items-baseline gap-1.5">
            <span class="text-4xl font-bold tracking-tight tabular-nums text-(--ink)">{{ p.usd ? usd(p.usd) : usd(0) }}</span>
            <span class="text-sm text-(--ink2)">{{ t(`plans.${p.id}.unit`) }}</span>
          </p>
          <ul class="mt-6 flex-1 space-y-2.5">
            <li
              v-for="n in p.features"
              :key="n"
              class="flex items-start gap-2 text-[15px] text-(--ink)"
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
                v-if="holds(p) && (isSignedIn || p.id === 'free')"
                class="flex h-11 items-center justify-center gap-2 rounded-full bg-(--ice) text-sm font-semibold text-(--ink)"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-4"
                />{{ p.id === 'free' && !isSignedIn ? t('plans.free.cta') : t('plans.current') }}
              </p>
              <YoutubeUnlock
                v-else-if="p.id === 'youtube'"
                block
              />
              <UButton
                v-else
                block
                size="xl"
                class="rounded-full"
                :loading="busy"
                @click="buy"
              >
                {{ t('plans.all-access.cta', { price: usd(PRICES.allAccess.usd) }) }}
              </UButton>
            </ClientOnly>
          </div>
        </article>
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :description="error"
      />

      <p class="text-center text-sm text-(--ink2)">
        {{ t('plans.footnote') }}
        <button
          type="button"
          class="font-semibold text-(--ink) underline-offset-4 hover:underline"
          @click="talkOpen = !talkOpen"
        >
          {{ t('plans.requestTitle') }}
        </button>
      </p>

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
              :class="form.interest === i ? 'border-(--line) bg-(--ink) text-(--paper)' : 'border-(--line) hover:border-(--line)'"
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
