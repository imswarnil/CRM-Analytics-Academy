<script setup lang="ts">
/**
 * Self-serve teams: buy seats on a company email, invite colleagues by link,
 * see who is learning. Anything larger or invoiced goes to the sales form below (#contact).
 */
const title = 'CRM Analytics Academy for teams'
const description = 'Give your team Pro: $15 per seat per month, billed yearly, 3–50 seats. Invite colleagues on your company domain and manage seats yourself.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight and nothing a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const faq = [
  { label: 'Who can join our team?', content: 'Anyone with an email on your company domain — the domain you bought with. The owner can allow extra domains (a subsidiary, a second brand) from the team console. Personal mailboxes such as Gmail cannot own or join a team.' },
  { label: 'How do invites work?', content: 'The owner or a team admin creates an invite for an email address and copies the link to them. They sign in with that address and accept; that is when the seat is taken. Unused invites expire after 14 days.' },
  { label: 'Can we change the number of seats?', content: 'Yes, from the billing portal. Removing someone frees their seat for the next person straight away.' },
  { label: 'What if we cancel?', content: 'Everyone keeps Pro until the end of the year you paid for, then the team goes back to the free course. Progress is never deleted.' },
  { label: 'More than 50 seats, invoicing or SSO?', content: 'Talk to sales: volume pricing, purchase orders, SSO, private cohorts and instructor-led training are quoted per organisation.' }
]

usePageSchema({
  name: title,
  description,
  type: 'WebPage',
  extra: [
    {
      '@type': 'Service',
      'name': title,
      'description': description,
      'serviceType': 'Salesforce CRM Analytics team training',
      'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
      'areaServed': 'Worldwide',
      'url': `${SITE.url}/teams`,
      'offers': {
        '@type': 'Offer', 'price': '180', 'priceCurrency': 'USD', 'url': `${SITE.url}/teams`,
        'eligibleQuantity': { '@type': 'QuantitativeValue', 'minValue': 3, 'maxValue': 50, 'unitText': 'seat' },
        'priceSpecification': { '@type': 'UnitPriceSpecification', 'price': '180', 'priceCurrency': 'USD', 'billingDuration': 'P1Y', 'referenceQuantity': { '@type': 'QuantitativeValue', 'value': 1, 'unitText': 'seat' } }
      }
    },
    {
      '@type': 'FAQPage',
      'mainEntity': faq.map(f => ({ '@type': 'Question', 'name': f.label, 'acceptedAnswer': { '@type': 'Answer', 'text': f.content } }))
    }
  ]
})

const steps = [
  { n: '01', icon: 'i-lucide-credit-card', title: 'Buy seats', text: 'Choose 3–50 seats and pay on your company email. You become the team owner.' },
  { n: '02', icon: 'i-lucide-link', title: 'Invite by link', text: 'Create an invite per colleague and send them the link. Only your company domain can accept.' },
  { n: '03', icon: 'i-lucide-graduation-cap', title: 'They learn with Pro', text: 'Every Pro lesson, video and quiz, no ads — with their own progress and points.' },
  { n: '04', icon: 'i-lucide-gauge', title: 'You manage seats', text: 'The team console shows members, open invites and free seats. Remove someone to free a seat.' }
]

const outcomes = [
  { icon: 'i-lucide-shield-check', title: 'Admins', text: 'Licences, permission sets, sharing inheritance and security predicates that pass an audit.' },
  { icon: 'i-lucide-chart-column', title: 'Analysts', text: 'Datasets at the right grain, dashboards people open, and metrics with a written contract.' },
  { icon: 'i-lucide-code-xml', title: 'Developers', text: 'SAQL, bindings, dashboard JSON, the REST API and deploying analytics through source control.' },
  { icon: 'i-lucide-briefcase', title: 'Leaders', text: 'What CRM Analytics is for, what it costs to run, and how to tell a good dashboard from a busy one.' }
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 07 / For teams"
      title="Pro for the whole team, in five minutes"
      lead="Buy seats on your company email, invite colleagues by link, and see who is learning. $15 per seat per month, billed yearly."
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#buy"
          icon="i-lucide-users"
        >
          Buy team seats
        </UButton>
        <UButton
          to="#contact"
          color="neutral"
          variant="outline"
          icon="i-lucide-message-square"
        >
          Talk to sales
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-[68rem] space-y-20 px-4 py-14 sm:px-6">
      <!-- How it works -->
      <section>
        <p class="eyebrow">
          Fig. 01 — How it works
        </p>
        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="s in steps"
            :key="s.n"
            class="bp-card bp-card--hover p-5"
          >
            <div class="flex items-start justify-between">
              <span class="font-mono text-xs text-(--ink2)">{{ s.n }}</span>
              <span class="bp-iconbox size-10 text-(--signal)">
                <UIcon
                  :name="s.icon"
                  class="size-5"
                />
              </span>
            </div>
            <h3 class="mt-5 text-lg font-extrabold">
              {{ s.title }}
            </h3>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ s.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- Buy -->
      <section
        id="buy"
        class="scroll-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div class="border-[1.5px] border-(--ink) bg-(--card) p-6 sm:p-8">
          <p class="eyebrow">
            Fig. 02 — Pricing calculator
          </p>
          <h2 class="bp-h3 mt-3">
            Team seats
          </h2>
          <p class="mt-2 text-sm text-(--ink2)">
            $15 per seat per month, billed yearly. 3 to 50 seats; add more any time from billing.
          </p>
          <div class="mt-6">
            <TeamCheckout />
          </div>
        </div>
        <div class="graph-paper-navy flex flex-col border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white shadow-[10px_10px_0_var(--signal)] sm:p-8">
          <p class="mono-label text-(--glow)!">
            Bigger than 50 seats?
          </p>
          <h2 class="mt-3 text-2xl font-extrabold">
            Enterprise and invoicing
          </h2>
          <p class="mt-3 text-sm text-white/80">
            Volume pricing, purchase orders and invoices, SSO and a custom start date. Tell us what you need and we reply within two working days.
          </p>
          <div class="mt-auto flex flex-wrap gap-3 pt-8">
            <UButton
              to="#contact"
              color="secondary"
              icon="i-lucide-message-square"
            >
              Talk to sales
            </UButton>
          </div>
        </div>
      </section>

      <!-- Who learns what -->
      <section>
        <p class="eyebrow">
          Fig. 03 — What each role gets
        </p>
        <div class="mt-6 grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-2">
          <div
            v-for="(o, i) in outcomes"
            :key="o.title"
            class="flex gap-4 p-6"
            :class="[i % 2 === 0 ? 'sm:border-e-[1.5px] sm:border-(--ink)' : '', i < 2 ? 'border-b-[1.5px] border-(--ink)' : i === 2 ? 'border-b-[1.5px] border-(--ink) sm:border-b-0' : '']"
          >
            <span class="bp-iconbox size-10 flex-none text-(--signal)">
              <UIcon
                :name="o.icon"
                class="size-5"
              />
            </span>
            <div>
              <h3 class="font-extrabold">
                {{ o.title }}
              </h3>
              <p class="mt-1 text-sm text-(--ink2)">
                {{ o.text }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-3xl">
        <p class="eyebrow">
          Fig. 04 — Questions
        </p>
        <h2 class="bp-h2 mt-3">
          How teams work
        </h2>
        <UAccordion
          :items="faq"
          class="mt-8"
        />
      </section>

      <!-- Talk to sales -->
      <section
        id="contact"
        class="mx-auto max-w-3xl scroll-mt-24"
      >
        <p class="eyebrow">
          Fig. 05 — Talk to sales
        </p>
        <h2 class="bp-h2 mt-3">
          Invoicing, more seats or SSO
        </h2>
        <p class="bp-lead mt-3">
          Tell us about your team. We reply within two working days.
        </p>
        <div class="mt-8 border-[1.5px] border-(--ink) bg-(--card) p-6 sm:p-8">
          <LeadForm type="sales" />
        </div>
      </section>
    </div>
  </div>
</template>
