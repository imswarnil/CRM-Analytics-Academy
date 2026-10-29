<script setup lang="ts">
/**
 * /pro — what the Academy sells, and the request form. No checkout: "Get it"
 * files a lead (POST /api/leads → app.lead + Salesforce) and the owner follows
 * up. Products granted to an account ask the visitor to sign up first, which
 * is the point: the free account is the first step to everything here.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { user, isSignedIn } = useAuth()
const { pro: isMember } = useProgress()

const chosen = ref<Product | null>(productById(String(route.query.product ?? '')) ?? null)
const individual = PRODUCTS.filter(p => p.audience === 'individual')
const business = PRODUCTS.filter(p => p.audience === 'business')

const form = reactive({ firstName: '', lastName: '', email: '', company: '', title: '', phone: '', teamSize: '', message: '', website: '' })
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

function pick(p: Product) {
  chosen.value = p
  sent.value = false
  error.value = ''
  useNuxtApp().$track?.('product_view', p.id)
  nextTick(() => document.getElementById('request')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

const needsSignIn = computed(() => Boolean(chosen.value?.needsAccount && !isSignedIn.value))
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: { redirect: `${localePath('/pro')}?product=${chosen.value?.id ?? 'pro'}` } }))

async function send() {
  if (!chosen.value) return
  error.value = ''
  if (!token.value) {
    error.value = t('human.wait')
    return
  }
  sending.value = true
  try {
    let source = ''
    try {
      source = sessionStorage.getItem('crma-source') ?? ''
    } catch { /* storage blocked */ }
    await $fetch('/api/leads', {
      method: 'POST',
      body: { ...form, product: chosen.value.id, token: token.value, locale: locale.value, source, landing: String(route.query.lesson ?? '') }
    })
    sent.value = true
    useNuxtApp().$track?.('lead', chosen.value.id)
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
defineOgImage('Docs', { title: t('store.title'), description: description.value, headline: t('store.eyebrow'), spec: 'PRO · TRAINING · TEAMS' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('store.eyebrow'), path: '/pro' }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 09 / PRO"
      :title="t('store.title')"
      :lead="t('store.lead')"
    >
      <p
        v-if="isMember"
        class="mt-6 inline-flex items-center gap-2 border-[1.5px] border-(--signal) bg-(--ice) px-4 py-2 font-semibold text-(--ink)"
      >
        <UIcon
          name="i-lucide-badge-check"
          class="size-5 text-(--signal)"
        />{{ t('store.youArePro') }}
      </p>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-14 px-4 py-12 sm:px-6 lg:px-8">
      <section
        v-for="group in [{ key: 'individual', items: individual }, { key: 'business', items: business }]"
        :key="group.key"
      >
        <h2 class="bp-h3">
          {{ t(`store.${group.key}`) }}
        </h2>
        <ul class="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <li
            v-for="p in group.items"
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
              <h3 class="text-xl font-extrabold text-(--ink)">
                {{ t(`products.${p.id}.name`) }}
              </h3>
              <p class="mt-1 text-[15px] leading-snug text-(--ink2)">
                {{ t(`products.${p.id}.tagline`) }}
              </p>
              <p class="mt-4 flex items-baseline gap-1">
                <span class="text-3xl font-black tracking-[-0.03em] text-(--ink)">{{ p.price ?? t('store.talk') }}</span>
                <span
                  v-if="p.unit"
                  class="font-mono text-xs text-(--ink2)"
                >{{ t(`store.unit.${p.unit}`) }}</span>
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
              <UButton
                class="mt-6"
                block
                size="lg"
                :variant="chosen?.id === p.id ? 'solid' : p.featured ? 'solid' : 'outline'"
                :color="chosen?.id === p.id || p.featured ? 'primary' : 'neutral'"
                :icon="p.id === 'pro' && isMember ? 'i-lucide-badge-check' : 'i-lucide-arrow-right'"
                :disabled="p.id === 'pro' && isMember"
                @click="pick(p)"
              >
                {{ p.id === 'pro' && isMember ? t('store.youArePro') : t('store.getIt') }}
              </UButton>
            </div>
          </li>
        </ul>
        <PromoSlot
          v-if="group.key === 'individual'"
          unit="leaderboard728x90"
        />
      </section>

      <!-- The request -->
      <section
        v-if="chosen"
        id="request"
        class="mx-auto max-w-2xl scroll-mt-24 border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="flex items-center justify-between gap-3 border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-4">
          <p class="font-bold text-(--ink)">
            {{ t('store.requestTitle', { product: t(`products.${chosen.id}.name`) }) }}
          </p>
          <span class="font-mono text-sm text-(--ink2)">{{ chosen.price ?? t('store.talk') }}</span>
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

        <div
          v-else-if="needsSignIn"
          class="space-y-4 p-6"
        >
          <p class="text-(--ink)">
            {{ t('store.needsAccount') }}
          </p>
          <UButton
            :to="signUpTo"
            size="xl"
            icon="i-lucide-user-plus"
          >
            {{ t('pro.signUpFirst') }}
          </UButton>
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
            :label="t('store.f.company')"
            :required="chosen.audience === 'business'"
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
            v-if="chosen.audience === 'business'"
            :label="t('store.f.teamSize')"
          >
            <USelect
              v-model="form.teamSize"
              :items="['1–5', '6–20', '21–50', '51–200', '200+']"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('store.f.phone')"
            :hint="t('contrib.optional')"
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
