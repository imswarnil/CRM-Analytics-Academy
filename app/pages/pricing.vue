<script setup lang="ts">
/**
 * Plans. The course stays free; Pro unlocks the lessons and videos marked
 * Pro, removes ads, and pays for the rest. Teams buy seats self-serve;
 * anything larger or invoiced goes to sales. Checkout is Dodo Payments and
 * the grant happens in the webhook, never on the return redirect.
 *
 * The prices here are the prices of the real Dodo products — change both,
 * and the JSON-LD below, together.
 */
defineI18nRoute({ locales: ['en'] })

const title = 'Pricing'
const description = 'CRM Analytics Academy is free. Pro is $12 a month or $96 a year for every Pro lesson, video and quiz with no ads; teams are $15 per seat per month.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { pro } = useProgress()

const tab = ref<'individual' | 'teams'>('individual')
const billing = ref<'annual' | 'monthly'>('annual')

const proFeatures = [
  'Every Pro lesson, with its quiz and interview questions',
  'Lesson videos, in your language as recordings are added',
  'No ads, anywhere on the site',
  'Progress, points and certificates'
]
const freeFeatures = [
  'Every free lesson — most of the course',
  'The twenty-one practice datasets',
  'Progress, points and quiz scores',
  'Community showcase and resources'
]
const teamFeatures = [
  'Pro for every seat, no ads',
  'Invite by link; members join on your company domain',
  'Owner console: seats, members, invites',
  'One invoice from Dodo Payments'
]

const pro$ = computed(() => billing.value === 'annual'
  ? { price: '$8', per: '/ month', note: '$96 billed yearly · save 33%' }
  : { price: '$12', per: '/ month', note: 'Billed monthly · cancel any time' })

const faq = [
  { label: 'Is the course still free?', content: 'Yes. Every lesson not marked Pro is free, with progress, points and quiz scores. Pro pays for the free course to keep growing.' },
  { label: 'What is the difference between monthly and annual?', content: 'Nothing but the price: Pro Annual is $96 a year, the same as $8 a month, against $12 month to month. Both can be cancelled from the billing portal and keep access until the paid period ends.' },
  { label: 'How do team seats work?', content: 'Buy 3 to 50 seats on your company email; you become the team owner. Invite colleagues with a link — they sign in with an address on your company domain and take a seat. Remove someone and the seat frees up.' },
  { label: 'Can we pay by invoice, or need more than 50 seats?', content: 'Yes — get in touch for invoicing, purchase orders or SSO. We reply within two working days.' },
  { label: 'Do you store my card?', content: 'No. Card details go straight to Dodo Payments; this site only ever sees whether a payment succeeded.' },
  { label: 'I bought Lifetime before. Is it still valid?', content: 'Yes. Lifetime is no longer sold, but every existing Lifetime purchase keeps Pro for good.' }
]

usePageSchema({
  name: title,
  description,
  type: 'WebPage',
  extra: [
    {
      '@type': 'Course',
      'name': `${SITE.name} Pro`,
      'description': description,
      'url': `${SITE.url}/pricing`,
      'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
      'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': 'PT12H' },
      'offers': [
        { '@type': 'Offer', 'name': 'Free', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD', 'availability': 'https://schema.org/InStock', 'url': `${SITE.url}/pricing` },
        {
          '@type': 'Offer', 'name': 'Pro Monthly', 'category': 'Subscription', 'price': '12', 'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock', 'url': `${SITE.url}/pricing`,
          'priceSpecification': { '@type': 'UnitPriceSpecification', 'price': '12', 'priceCurrency': 'USD', 'billingDuration': 'P1M' }
        },
        {
          '@type': 'Offer', 'name': 'Pro Annual', 'category': 'Subscription', 'price': '96', 'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock', 'url': `${SITE.url}/pricing`,
          'priceSpecification': { '@type': 'UnitPriceSpecification', 'price': '96', 'priceCurrency': 'USD', 'billingDuration': 'P1Y' }
        },
        {
          '@type': 'Offer', 'name': 'Team seat', 'category': 'Subscription', 'price': '180', 'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock', 'url': `${SITE.url}/teams`,
          'eligibleQuantity': { '@type': 'QuantitativeValue', 'minValue': 3, 'maxValue': 50, 'unitText': 'seat' },
          'priceSpecification': { '@type': 'UnitPriceSpecification', 'price': '180', 'priceCurrency': 'USD', 'billingDuration': 'P1Y', 'referenceQuantity': { '@type': 'QuantitativeValue', 'value': 1, 'unitText': 'seat' } }
        }
      ]
    },
    {
      '@type': 'FAQPage',
      'mainEntity': faq.map(f => ({ '@type': 'Question', 'name': f.label, 'acceptedAnswer': { '@type': 'Answer', 'text': f.content } }))
    }
  ]
})

const busy = ref('')
const error = ref('')

async function buy(plan: 'monthly' | 'annual') {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: useRouter().currentRoute.value.fullPath } })
    return
  }
  busy.value = plan
  error.value = ''
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan } })
    window.location.href = url
  } catch (e) {
    error.value = apiError(e) || 'Checkout could not start. Please try again.'
    busy.value = ''
  }
}
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 04 / Pricing"
      title="Learn free. Go Pro when it pays."
      lead="Most of the course is free, for good. Pro unlocks the lessons and videos marked Pro, removes the ads, and funds everything else."
      center
    >
      <div class="mt-8 inline-flex border-[1.5px] border-(--ink) bg-(--card)">
        <button
          v-for="t in (['individual', 'teams'] as const)"
          :key="t"
          type="button"
          class="px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[.1em] transition-colors"
          :class="tab === t ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-[68rem] px-4 py-14 sm:px-6">
      <ClientOnly>
        <UAlert
          v-if="pro"
          icon="i-lucide-badge-check"
          title="You have Pro"
          description="Every Pro lesson is unlocked and ads are off. Manage billing from your dashboard."
          class="mb-8"
        />
      </ClientOnly>

      <!-- Individual -->
      <template v-if="tab === 'individual'">
        <div class="mb-8 flex justify-center">
          <div class="inline-flex items-center border-[1.5px] border-(--ink) bg-(--card)">
            <button
              v-for="b in (['monthly', 'annual'] as const)"
              :key="b"
              type="button"
              class="flex items-center gap-2 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[.1em]"
              :class="billing === b ? 'bg-(--signal) text-white' : 'hover:bg-(--ice)'"
              @click="billing = b"
            >
              {{ b }}
              <span
                v-if="b === 'annual'"
                class="bg-(--glow) px-1.5 py-px text-[9px] text-(--ink)"
              >−33%</span>
            </button>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6">
            <p class="mono-label">
              Plan 01
            </p>
            <h2 class="mt-2 text-xl font-extrabold">
              Free
            </h2>
            <p class="mt-4 flex items-baseline gap-2">
              <span class="text-5xl font-black tracking-[-0.04em]">$0</span>
              <span class="font-mono text-xs uppercase text-(--ink2)">forever</span>
            </p>
            <p class="mt-3 text-sm text-(--ink2)">
              Learn CRM Analytics end to end, with ads to keep the lights on.
            </p>
            <ul class="my-6 space-y-2 text-sm">
              <li
                v-for="f in freeFeatures"
                :key="f"
                class="flex gap-2"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 flex-none text-(--signal)"
                />{{ f }}
              </li>
            </ul>
            <UButton
              :to="localePath('/introduction')"
              color="neutral"
              variant="outline"
              block
              class="mt-auto"
            >
              Start learning
            </UButton>
          </div>

          <div class="graph-paper-navy relative flex flex-col border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white shadow-[10px_10px_0_var(--signal)]">
            <span
              v-if="billing === 'annual'"
              class="absolute -top-3 end-4 bg-(--glow) px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-(--ink)"
            >Best value</span>
            <p class="mono-label text-(--glow)!">
              Plan 02
            </p>
            <h2 class="mt-2 text-xl font-extrabold">
              Pro {{ billing === 'annual' ? 'Annual' : 'Monthly' }}
            </h2>
            <p class="mt-4 flex items-baseline gap-2">
              <span class="text-5xl font-black tracking-[-0.04em]">{{ pro$.price }}</span>
              <span class="font-mono text-xs uppercase text-white/70">{{ pro$.per }}</span>
            </p>
            <p class="mt-1 font-mono text-[11px] uppercase tracking-[.06em] text-(--glow)">
              {{ pro$.note }}
            </p>
            <ul class="my-6 space-y-2 text-sm">
              <li
                v-for="f in proFeatures"
                :key="f"
                class="flex gap-2"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 flex-none text-(--glow)"
                />{{ f }}
              </li>
            </ul>
            <UButton
              :loading="busy === billing"
              :disabled="pro"
              color="secondary"
              block
              size="lg"
              class="mt-auto"
              @click="buy(billing)"
            >
              {{ pro ? 'You have Pro' : `Get Pro ${billing === 'annual' ? 'Annual' : 'Monthly'}` }}
            </UButton>
          </div>
        </div>
      </template>

      <!-- Teams -->
      <div
        v-else
        class="grid gap-6 md:grid-cols-2"
      >
        <div class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6">
          <p class="mono-label">
            Plan T1 — self-serve
          </p>
          <h2 class="mt-2 text-xl font-extrabold">
            Team
          </h2>
          <p class="mt-4 flex items-baseline gap-2">
            <span class="text-5xl font-black tracking-[-0.04em]">$15</span>
            <span class="font-mono text-xs uppercase text-(--ink2)">/ seat / month</span>
          </p>
          <p class="mt-1 font-mono text-[11px] uppercase tracking-[.06em] text-(--ink2)">
            billed yearly · 3–50 seats
          </p>
          <ul class="my-6 space-y-2 text-sm">
            <li
              v-for="f in teamFeatures"
              :key="f"
              class="flex gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 flex-none text-(--signal)"
              />{{ f }}
            </li>
          </ul>
          <div class="mt-auto border-t border-dashed border-(--line) pt-5">
            <TeamCheckout />
          </div>
        </div>

        <div class="graph-paper-navy flex flex-col border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white shadow-[10px_10px_0_var(--signal)]">
          <p class="mono-label text-(--glow)!">
            Plan T2
          </p>
          <h2 class="mt-2 text-xl font-extrabold">
            Enterprise
          </h2>
          <p class="mt-4 text-4xl font-black tracking-[-0.03em]">
            Custom
          </p>
          <p class="mt-3 text-sm text-white/80">
            More than 50 seats, invoicing and purchase orders, or SSO.
          </p>
          <ul class="my-6 space-y-2 text-sm">
            <li
              v-for="f in ['Volume pricing', 'Invoice / PO billing', 'Instructor-led cohorts', 'Implementation services']"
              :key="f"
              class="flex gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 flex-none text-(--glow)"
              />{{ f }}
            </li>
          </ul>
          <div class="mt-auto flex flex-wrap gap-3">
            <UButton
              to="/teams#contact"
              color="secondary"
              icon="i-lucide-message-square"
            >
              Talk to sales
            </UButton>
            <UButton
              to="/teams"
              color="neutral"
              variant="outline"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              How teams work
            </UButton>
          </div>
        </div>
      </div>

      <p
        v-if="error"
        class="mt-6 text-center text-sm text-error"
      >
        {{ error }}
      </p>
      <p class="mt-8 text-center font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">
        Payments by Dodo Payments · prices in USD, excluding tax · cancel any time
      </p>

      <section class="mx-auto mt-20 max-w-3xl">
        <p class="eyebrow">
          Fig. 02 — Questions
        </p>
        <h2 class="bp-h2 mt-3">
          Before you pay
        </h2>
        <UAccordion
          :items="faq"
          class="mt-8"
        />
      </section>
    </div>
  </div>
</template>
