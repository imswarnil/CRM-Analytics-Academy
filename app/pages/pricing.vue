<script setup lang="ts">
/**
 * Pro plans. The free course stays free — Pro unlocks the lessons and videos
 * marked Pro, and pays for the rest. Checkout is Dodo Payments; the grant
 * happens in the webhook, never on the return redirect.
 */
defineI18nRoute({ locales: ['en'] })

const title = 'Pricing'
const description = 'Unlock every Pro lesson, quiz and lesson video on CRM Analytics Academy. Monthly or once, and the rest of the course stays free.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { pro } = useProgress()

const plans = [
  {
    key: 'monthly',
    name: 'Pro Monthly',
    price: '$9',
    per: 'per month',
    blurb: 'Everything in Pro, month to month. Cancel any time from your dashboard.',
    highlight: false
  },
  {
    key: 'lifetime',
    name: 'Pro Lifetime',
    price: '$99',
    per: 'once',
    blurb: 'Everything in Pro, for good — including every Pro lesson added later.',
    highlight: true
  }
] as const

const features = [
  'Every lesson marked Pro, with its quiz and interview questions',
  'Lesson videos, in your language as recordings are added',
  'Progress, points and the leaderboard, as on the free course',
  'Every free lesson stays free — Pro pays for them'
]

const tab = ref<'individual' | 'teams'>('individual')

const faq = [
  { label: 'Is the course still free?', content: 'Yes. Every lesson not marked Pro is free, with progress, points and the leaderboard. Pro pays for the free course to keep growing.' },
  { label: 'What happens when I pay?', content: 'Checkout runs on Dodo Payments. Pro is granted by the payment webhook, usually within seconds, and the dashboard shows it. Monthly can be cancelled any time from the billing portal.' },
  { label: 'Can I buy for a team?', content: 'Yes — team seats, a shared progress view and invoicing are quoted per team. Ask on the For teams page and we reply within two working days.' },
  { label: 'Do you store my card?', content: 'No. Card details go straight to Dodo Payments; this site only ever sees whether a payment succeeded.' }
]

// Real prices of the real (Dodo) products. Structured data must match what
// the page shows, so change both together.
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
          '@type': 'Offer',
          'name': 'Pro Monthly',
          'category': 'Subscription',
          'price': '9',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': `${SITE.url}/pricing`,
          'priceSpecification': { '@type': 'UnitPriceSpecification', 'price': '9', 'priceCurrency': 'USD', 'billingDuration': 'P1M' }
        },
        { '@type': 'Offer', 'name': 'Pro Lifetime', 'category': 'Paid', 'price': '99', 'priceCurrency': 'USD', 'availability': 'https://schema.org/InStock', 'url': `${SITE.url}/pricing` }
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

async function buy(plan: 'monthly' | 'lifetime') {
  if (!isSignedIn.value) {
    await navigateTo(localePath('/sign-in'))
    return
  }
  busy.value = plan
  error.value = ''
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan } })
    window.location.href = url
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage || 'Checkout could not start. Please try again.'
    busy.value = ''
  }
}
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 04 / Pricing"
      title="Learn free. Go Pro when it pays."
      lead="The course is free. Pro unlocks the lessons and videos marked Pro — and funds everything else."
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
          description="Every Pro lesson is unlocked. Manage billing from your dashboard."
          class="mb-8"
        />
      </ClientOnly>

      <!-- Individual -->
      <div
        v-if="tab === 'individual'"
        class="grid gap-6 md:grid-cols-3"
      >
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
            Every free lesson, the datasets, progress, points and the leaderboard.
          </p>
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

        <div
          v-for="(p, n) in plans"
          :key="p.key"
          class="relative flex flex-col border-[1.5px] border-(--ink) p-6"
          :class="p.highlight ? 'graph-paper-navy bg-(--navy) text-white shadow-[10px_10px_0_var(--signal)]' : 'bg-(--card)'"
        >
          <span
            v-if="p.highlight"
            class="absolute -top-3 end-4 bg-(--glow) px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-(--ink)"
          >Best value</span>
          <p
            class="mono-label"
            :class="p.highlight ? 'text-(--glow)!' : ''"
          >
            Plan 0{{ n + 2 }}
          </p>
          <h2 class="mt-2 text-xl font-extrabold">
            {{ p.name }}
          </h2>
          <p class="mt-4 flex items-baseline gap-2">
            <span class="text-5xl font-black tracking-[-0.04em]">{{ p.price }}</span>
            <span
              class="font-mono text-xs uppercase"
              :class="p.highlight ? 'text-white/70' : 'text-(--ink2)'"
            >{{ p.per }}</span>
          </p>
          <p
            class="mt-3 text-sm"
            :class="p.highlight ? 'text-white/80' : 'text-(--ink2)'"
          >
            {{ p.blurb }}
          </p>
          <ul class="my-6 space-y-2 text-sm">
            <li
              v-for="f in features"
              :key="f"
              class="flex gap-2"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 flex-none"
                :class="p.highlight ? 'text-(--glow)' : 'text-(--signal)'"
              />
              {{ f }}
            </li>
          </ul>
          <UButton
            :loading="busy === p.key"
            :disabled="pro"
            :color="p.highlight ? 'secondary' : 'primary'"
            block
            class="mt-auto"
            @click="buy(p.key)"
          >
            {{ pro ? 'You have Pro' : `Get ${p.name}` }}
          </UButton>
        </div>
      </div>

      <!-- Teams -->
      <div
        v-else
        class="grid gap-6 md:grid-cols-2"
      >
        <div class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6">
          <p class="mono-label">
            Plan T1
          </p>
          <h2 class="mt-2 text-xl font-extrabold">
            Team
          </h2>
          <p class="mt-4 text-3xl font-black tracking-[-0.03em]">
            Per seat, quoted
          </p>
          <p class="mt-3 text-sm text-(--ink2)">
            Pro for every seat, a shared progress view for the lead, and one invoice. From five seats.
          </p>
          <UButton
            :to="localePath('/teams')"
            block
            class="mt-8"
          >
            Get a team quote
          </UButton>
        </div>
        <div class="graph-paper-navy flex flex-col border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white shadow-[10px_10px_0_var(--signal)]">
          <p class="mono-label text-(--glow)!">
            Plan T2
          </p>
          <h2 class="mt-2 text-xl font-extrabold">
            Enterprise &amp; training centres
          </h2>
          <p class="mt-4 text-3xl font-black tracking-[-0.03em]">
            Custom
          </p>
          <p class="mt-3 text-sm text-white/80">
            Classroom delivery, a private cohort, or a CRM Analytics implementation alongside the training.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/training')"
              color="secondary"
            >
              Classroom training
            </UButton>
            <UButton
              :to="localePath('/implementation')"
              color="neutral"
              variant="outline"
              class="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              Implementation
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
        Payments by Dodo Payments · prices in USD · cancel monthly any time
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
