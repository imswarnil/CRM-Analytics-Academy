<script setup lang="ts">
/**
 * /pro — how access works, usage-based and never money: sessions, paid in
 * points (shared/utils/products.ts). A visitor gets ANON_SESSIONS sessions; an
 * account ACCOUNT_SESSIONS and WELCOME_POINTS points; packs of PACK_SESSIONS
 * cost PACK_POINTS points (POST /api/meter/buy); organisations get unlimited
 * access by request (POST /api/leads → app.lead + Salesforce) or by their
 * verified email domain. The same form takes Salesforce set-up, consulting
 * and mentoring requests, so every buying signal lands in one place.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, isSignedIn } = useAuth()
const { balance, data: progress, load } = useProgress()
const { status: meter, refresh: refreshMeter, buy } = useMeter()
const track = (name: string, label?: string) => useNuxtApp().$track?.(name, label)

onMounted(() => {
  track('pricing_view', String(route.query.from ?? ''))
  refreshMeter()
})

/* --- Packs, bought with points ----------------------------------------------- */
const buying = ref(0)
const buyError = ref('')
const bought = ref(0)
async function buyPacks(n: number) {
  track('plan_click', `pack-${n}`)
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-up'), query: { redirect: localePath('/pro') } })
    return
  }
  buying.value = n
  buyError.value = ''
  try {
    await buy(n)
    bought.value = n * PACK_SESSIONS
    await load()
  } catch (e) {
    buyError.value = apiError(e) || t('contrib.err.generic')
  } finally {
    buying.value = 0
  }
}

/* --- Requests: seats and other help ---------------------------------------- */
type Interest = 'seats' | 'salesforce-setup' | 'consulting' | 'mentoring'
const INTERESTS: Interest[] = ['seats', 'salesforce-setup', 'consulting', 'mentoring']
const initial = String(route.query.product ?? route.query.interest ?? '')
const form = reactive({
  interest: (INTERESTS.includes(initial as Interest) ? initial : 'seats') as Interest,
  orgKind: 'company' as OrgKind,
  seats: 10,
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  title: '',
  phone: '',
  message: '',
  website: ''
})
watch(user, (u) => {
  if (!u) return
  const [first, ...rest] = (u.name ?? '').split(' ')
  form.firstName ||= first ?? ''
  form.lastName ||= rest.join(' ')
  form.email ||= u.email
}, { immediate: true })

const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const sent = ref(false)
const error = ref('')

function ask(interest: Interest) {
  form.interest = interest
  sent.value = false
  track('plan_click', interest)
  if (interest === 'salesforce-setup') track('salesforce_interest', 'pro')
  nextTick(() => document.getElementById('request')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

async function send() {
  error.value = ''
  if (!token.value) {
    error.value = t('human.wait')
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
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        ...form,
        product: form.interest,
        seats: form.interest === 'seats' ? form.seats : undefined,
        token: token.value,
        locale: locale.value,
        source,
        visitor,
        landing: String(route.query.from ?? route.query.lesson ?? '') || undefined
      }
    })
    sent.value = true
    track('lead', form.interest)
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    human.value?.reset()
  } finally {
    sending.value = false
  }
}

const title = computed(() => t('store.seoTitle'))
const description = computed(() => t('store.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: 'SESSIONS · POINTS · ORGANISATIONS' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('store.eyebrow'), path: '/pro' }],
  extra: [{
    '@type': 'ItemList',
    'itemListElement': PRODUCTS.map((p, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': { '@type': 'Product', 'name': t(`products.${p.id}.name`), 'description': t(`products.${p.id}.tagline`), 'brand': { '@type': 'Organization', 'name': SITE.name }, 'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' } }
    }))
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 09 / ACCESS"
      :title="t('store.title')"
      :lead="t('store.lead')"
    >
      <ShareBar
        class="mt-6"
        :title="t('store.title')"
        :text="t('store.seoDesc')"
      />
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <!-- Where you stand -->
      <ClientOnly>
        <section
          v-if="meter"
          class="grid gap-px border-[1.5px] border-(--ink) bg-(--line) sm:grid-cols-4"
        >
          <div class="bg-(--card) p-5 sm:col-span-2">
            <p class="eyebrow">
              {{ t('plans.yourSessions') }}
            </p>
            <p
              v-if="meter.unlimited"
              class="mt-2 text-3xl font-black text-(--signal)"
            >
              {{ t('plans.unlimited') }} <span
                v-if="meter.via && !['admin', 'crawler', 'grant'].includes(meter.via)"
                class="text-base font-semibold text-(--ink2)"
              >· {{ meter.via }}</span>
            </p>
            <template v-else>
              <p class="mt-2 text-3xl font-black tabular-nums text-(--ink)">
                {{ meter.remaining }} <span class="text-base font-semibold text-(--ink2)">/ {{ meter.allowance }}</span>
              </p>
              <UProgress
                :model-value="meter.allowance ? Math.round((meter.used / meter.allowance) * 100) : 0"
                class="mt-3"
              />
              <p class="mt-2 text-sm text-(--ink2)">
                {{ meter.signedIn ? t('plans.accountNote') : t('plans.visitorNote', { days: meter.windowDays ?? ANON_WINDOW_DAYS }) }}
              </p>
            </template>
          </div>
          <div class="bg-(--card) p-5">
            <p class="eyebrow">
              {{ t('plans.pointsLabel') }}
            </p>
            <p class="mt-2 text-3xl font-black tabular-nums text-(--ink)">
              {{ isSignedIn ? balance.toLocaleString(locale) : '—' }}
            </p>
          </div>
          <div class="bg-(--card) p-5">
            <p class="eyebrow">
              {{ t('plans.organisation') }}
            </p>
            <p class="mt-2 text-lg font-bold text-(--ink)">
              {{ progress?.org ?? '—' }}
            </p>
          </div>
        </section>
      </ClientOnly>

      <!-- The four ways in -->
      <ul class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
              <span class="text-3xl font-black tabular-nums tracking-[-0.03em] text-(--ink)">{{ p.id === 'visitor' ? ANON_SESSIONS : p.id === 'account' ? ACCOUNT_SESSIONS : p.id === 'pack' ? PACK_SESSIONS : '∞' }}</span>
              <span class="font-mono text-xs text-(--ink2)">{{ p.id === 'pack' ? t('plans.sessionsFor', { points: PACK_POINTS }) : p.id === 'visitor' ? t('plans.sessionsPer', { days: ANON_WINDOW_DAYS }) : t('plans.sessions') }}</span>
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
                />{{ t(`products.${p.id}.f${n}`, { welcome: WELCOME_POINTS.toLocaleString(locale), points: PACK_POINTS }) }}
              </li>
            </ul>

            <!-- Visitor -->
            <UButton
              v-if="p.id === 'visitor'"
              class="mt-6"
              block
              size="lg"
              variant="outline"
              color="neutral"
              icon="i-lucide-book-open"
              :to="localePath('/curriculum')"
            >
              {{ t('plans.startLearning') }}
            </UButton>

            <!-- Account -->
            <UButton
              v-else-if="p.id === 'account'"
              class="mt-6"
              block
              size="lg"
              :icon="isSignedIn ? 'i-lucide-check' : 'i-lucide-user-plus'"
              :to="isSignedIn ? localePath('/dashboard') : localePath('/sign-up')"
              @click="track('plan_click', 'account')"
            >
              {{ isSignedIn ? t('plans.youHaveAccount') : t('pro.signUpFirst') }}
            </UButton>

            <!-- Packs -->
            <div
              v-else-if="p.id === 'pack'"
              class="mt-6 space-y-2"
            >
              <div class="grid grid-cols-3 gap-2">
                <UButton
                  v-for="n in [1, 3, 5]"
                  :key="n"
                  block
                  :variant="n === 1 ? 'solid' : 'outline'"
                  :color="n === 1 ? 'primary' : 'neutral'"
                  :loading="buying === n"
                  @click="buyPacks(n)"
                >
                  {{ t('plans.buyN', { n, points: n * PACK_POINTS }) }}
                </UButton>
              </div>
              <UAlert
                v-if="bought"
                color="primary"
                variant="subtle"
                icon="i-lucide-party-popper"
                :description="t('plans.bought', { n: bought })"
              />
              <UAlert
                v-if="buyError"
                color="error"
                variant="subtle"
                :description="buyError"
              />
            </div>

            <!-- Organisations -->
            <div
              v-else
              class="mt-6 space-y-2"
            >
              <UButton
                block
                size="lg"
                icon="i-lucide-arrow-right"
                @click="ask('seats')"
              >
                {{ t('plans.requestSeats') }}
              </UButton>
              <UButton
                block
                size="sm"
                variant="link"
                color="neutral"
                icon="i-lucide-key-round"
                :to="localePath('/team')"
              >
                {{ t('plans.haveCode') }}
              </UButton>
            </div>
          </div>
        </li>
      </ul>

      <PromoSlot unit="leaderboard728x90" />

      <!-- How points work -->
      <section class="grid gap-6 border-[1.5px] border-(--ink) bg-(--card) p-6 md:grid-cols-[1fr_2fr]">
        <div>
          <p class="eyebrow">
            {{ t('plans.pointsEyebrow') }}
          </p>
          <h2 class="bp-h3 mt-2">
            {{ t('plans.pointsTitle') }}
          </h2>
        </div>
        <dl class="grid gap-px bg-(--line) sm:grid-cols-4">
          <div
            v-for="row in [
              { k: 'welcome', v: `+${WELCOME_POINTS}` },
              { k: 'lesson', v: '+10' },
              { k: 'quiz', v: '+2' },
              { k: 'contribution', v: '+25' }
            ]"
            :key="row.k"
            class="bg-(--card) p-4"
          >
            <dd class="text-2xl font-black tabular-nums text-(--signal)">
              {{ row.v }}
            </dd>
            <dt class="mt-1 text-sm text-(--ink2)">
              {{ t(`plans.earnRow.${row.k}`) }}
            </dt>
          </div>
        </dl>
      </section>

      <!-- Requests -->
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

        <div
          v-if="sent"
          class="p-6"
        >
          <p class="text-xl font-bold text-(--ink)">
            {{ t('store.sentTitle') }}
          </p>
          <p class="mt-2 text-(--ink2)">
            {{ t('store.sentBody') }}
          </p>
        </div>

        <form
          v-else
          class="grid gap-5 p-6 sm:grid-cols-2"
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
            :label="t('plans.f.interest')"
            class="sm:col-span-2"
          >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="i in INTERESTS"
                :key="i"
                type="button"
                class="border-[1.5px] px-3 py-1.5 text-[15px] font-semibold"
                :class="form.interest === i ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
                @click="ask(i)"
              >
                {{ t(`plans.interest.${i}`) }}
              </button>
            </div>
          </UFormField>
          <template v-if="form.interest === 'seats'">
            <UFormField :label="t('plans.f.orgKind')">
              <USelect
                v-model="form.orgKind"
                :items="ORG_KINDS.map(k => ({ label: t(`plans.kind.${k}`), value: k }))"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('plans.f.seats')"
              required
            >
              <UInput
                v-model.number="form.seats"
                type="number"
                min="1"
                max="10000"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </template>
          <UFormField :label="t('store.f.firstName')">
            <UInput
              v-model="form.firstName"
              autocomplete="given-name"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('store.f.lastName')"
            required
          >
            <UInput
              v-model="form.lastName"
              autocomplete="family-name"
              size="xl"
              class="w-full"
              required
            />
          </UFormField>
          <UFormField
            :label="t('store.f.email')"
            required
            class="sm:col-span-2"
          >
            <UInput
              v-model="form.email"
              type="email"
              autocomplete="email"
              size="xl"
              class="w-full"
              :disabled="isSignedIn"
              required
            />
          </UFormField>
          <UFormField
            :label="form.interest === 'seats' ? t('plans.f.orgName') : t('store.f.company')"
            :required="form.interest === 'seats' || form.interest === 'consulting'"
          >
            <UInput
              v-model="form.company"
              autocomplete="organization"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('store.f.title')">
            <UInput
              v-model="form.title"
              autocomplete="organization-title"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('store.f.phone')"
            :hint="t('contrib.optional')"
            class="sm:col-span-2"
          >
            <UInput
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('store.f.message')"
            :hint="t('contrib.optional')"
            class="sm:col-span-2"
          >
            <UTextarea
              v-model="form.message"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>
          <div class="space-y-4 sm:col-span-2">
            <HumanCheck
              ref="human"
              v-model="token"
            />
            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :description="error"
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
            <p class="text-sm text-(--ink2)">
              {{ t('store.noCharge') }}
            </p>
          </div>
        </form>
      </section>

      <PromoSlot unit="multiplexHorizontal" />
    </div>
  </div>
</template>
