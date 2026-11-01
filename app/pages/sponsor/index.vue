<script setup lang="ts">
/**
 * /sponsor — sponsor the Academy: a one-time, sitewide banner. Three fields
 * (company, email, package) and a silent human check; the owner sends a Stripe
 * invoice and the sponsor designs, previews and publishes the banner in
 * /sponsor/studio, where views, clicks and CTR are tracked.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user, isSignedIn } = useAuth()

const form = reactive({ company: '', email: '', package: 'sponsorMonth' as SponsorPackage, website: '' })
watch(user, u => (form.email ||= u?.email ?? ''), { immediate: true })
const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const sent = ref(false)
const error = ref('')

onMounted(() => useNuxtApp().$track?.('sponsor_view'))

async function send() {
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
    await $fetch('/api/sponsor/request', { method: 'POST', body: { ...form, token: token.value, source } })
    sent.value = true
    useNuxtApp().$track?.('lead', 'sponsorship')
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    human.value?.reset()
  } finally {
    sending.value = false
  }
}

const sample = { headline: 'Your product, in front of CRM Analytics builders', body: 'One banner, every page, for the whole run.', cta: 'Learn more', url: 'https://example.com', bg: '#0c1b33', fg: '#ffffff', accent: '#2f5bea' }
const usd = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const title = computed(() => t('sponsor.seoTitle'))
const description = computed(() => t('sponsor.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('sponsor.title'), description: description.value, headline: t('sponsor.eyebrow'), spec: 'SITEWIDE · ONE-TIME · TRACKED' })
usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage', trail: [{ name: t('sponsor.eyebrow'), path: '/sponsor' }] }))
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 11 / SPONSOR"
      :title="t('sponsor.title')"
      :lead="t('sponsor.lead')"
    >
      <ShareBar
        class="mt-6"
        :title="t('sponsor.title')"
        :text="t('sponsor.lead')"
      />
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <!-- What runs -->
      <section class="space-y-3">
        <p class="eyebrow">
          {{ t('sponsor.previewEyebrow') }}
        </p>
        <div class="border-[1.5px] border-(--ink) shadow-[8px_8px_0_var(--ink)]">
          <SponsorCard
            company="Your company"
            :creative="sample"
            preview
          />
        </div>
        <ul class="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="n in 4"
            :key="n"
            class="flex items-start gap-2 text-[15px] text-(--ink)"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-4 shrink-0 text-(--signal)"
            />{{ t(`sponsor.perk${n}`) }}
          </li>
        </ul>
      </section>

      <!-- Ask: three fields -->
      <section class="mx-auto grid max-w-3xl gap-6 border-[1.5px] border-(--ink) bg-(--card) p-6 sm:p-8">
        <div
          v-if="sent"
          class="space-y-3"
        >
          <p class="text-xl font-bold text-(--ink)">
            {{ t('sponsor.sentTitle') }}
          </p>
          <p class="text-(--ink2)">
            {{ t('sponsor.sentBody') }}
          </p>
          <UButton
            :to="isSignedIn ? localePath('/sponsor/studio') : { path: localePath('/sign-up'), query: { redirect: localePath('/sponsor/studio') } }"
            icon="i-lucide-palette"
          >
            {{ t('sponsor.designNow') }}
          </UButton>
        </div>
        <form
          v-else
          class="grid gap-5"
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
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="p in SPONSOR_PACKAGES"
              :key="p"
              type="button"
              class="flex flex-col items-start border-[1.5px] p-4 text-start"
              :class="form.package === p ? 'border-(--ink) bg-(--ice) shadow-[4px_4px_0_var(--ink)]' : 'border-(--line) hover:border-(--ink)'"
              :aria-pressed="form.package === p"
              @click="form.package = p"
            >
              <span class="font-mono text-[11px] uppercase tracking-[.1em] text-(--signal)">{{ t('sponsor.days', { n: PRICES[p].days }) }}</span>
              <span class="mt-1 text-3xl font-black tabular-nums text-(--ink)">{{ usd(PRICES[p].usd) }}</span>
              <span class="text-sm text-(--ink2)">{{ t('sponsor.oneTime') }}</span>
            </button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <UInput
              v-model="form.company"
              :placeholder="t('sponsor.company')"
              size="xl"
              autocomplete="organization"
              required
            />
            <UInput
              v-model="form.email"
              type="email"
              :placeholder="t('store.f.email')"
              size="xl"
              autocomplete="email"
              :disabled="isSignedIn"
              required
            />
          </div>
          <HumanCheck
            ref="human"
            v-model="token"
          />
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
          />
          <UButton
            type="submit"
            size="xl"
            block
            icon="i-lucide-send"
            :loading="sending"
          >
            {{ t('sponsor.send') }}
          </UButton>
          <p class="text-sm text-(--ink2)">
            {{ t('sponsor.how') }}
          </p>
        </form>
      </section>

      <PromoSlot unit="multiplexHorizontal" />
    </div>
  </div>
</template>
