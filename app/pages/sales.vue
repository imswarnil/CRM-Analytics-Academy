<script setup lang="ts">
/**
 * Talk to sales, or get a written quotation — one page, two forms, because
 * the same buyer is usually deciding between them.
 */
const title = 'Talk to sales'
const description = 'Talk to CRM Analytics Academy about team licences, live and onsite training or a custom curriculum — or request a written quotation for your team.'
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })
usePageSchema({
  name: title,
  description,
  type: 'ContactPage',
  extra: [{
    '@type': 'Service',
    'name': 'CRM Analytics training for teams',
    'description': description,
    'serviceType': 'Salesforce CRM Analytics corporate training',
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'areaServed': 'Worldwide',
    'url': `${SITE.url}/sales`
  }]
})

const route = useRoute()
const router = useRouter()
const mode = computed<'sales' | 'quote'>({
  get: () => (route.query.type === 'quote' ? 'quote' : 'sales'),
  set: v => router.replace({ query: { ...route.query, type: v === 'quote' ? 'quote' : undefined } })
})

const points = [
  { icon: 'i-lucide-users', title: 'Team licences', text: 'Pro for everyone on one invoice, seats tied to your company domain.' },
  { icon: 'i-lucide-school', title: 'Live and onsite', text: 'Instructor-led cohorts online, at an Academy center or at your office.' },
  { icon: 'i-lucide-route', title: 'Your org, your data', text: 'A curriculum fitted to your objects, dashboards and security model.' },
  { icon: 'i-lucide-receipt-text', title: 'Procurement-friendly', text: 'Quotes, purchase orders and invoices; security questionnaires answered.' }
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 21 / Sales"
      title="Train the whole team"
      lead="Tell us about the team and what it needs to ship. We reply within one working day — with a call, or a written quotation if that is what you need."
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 01 — What we can do
          </p>
          <ul class="mt-6 grid gap-4">
            <li
              v-for="p in points"
              :key="p.title"
              class="flex gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4"
            >
              <span class="bp-iconbox size-9! flex-none text-(--signal)">
                <UIcon
                  :name="p.icon"
                  class="size-4"
                />
              </span>
              <span>
                <span class="block font-bold text-(--ink)">{{ p.title }}</span>
                <span class="block text-sm text-(--ink2)">{{ p.text }}</span>
              </span>
            </li>
          </ul>
          <p class="mt-6 text-sm text-(--ink2)">
            Just a few seats? <NuxtLink
              to="/pricing"
              class="font-semibold text-(--signal) underline-offset-4 hover:underline"
            >Team plans are self-serve</NuxtLink>.
          </p>
        </div>

        <div class="lg:col-span-3">
          <div
            class="mb-5 inline-flex border-[1.5px] border-(--ink) bg-(--card)"
            role="tablist"
            aria-label="What do you need?"
          >
            <button
              v-for="m in (['sales', 'quote'] as const)"
              :key="m"
              type="button"
              role="tab"
              :aria-selected="mode === m"
              class="px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[.1em] transition-colors"
              :class="mode === m ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
              @click="mode = m"
            >
              {{ m === 'sales' ? 'Talk to sales' : 'Get a quotation' }}
            </button>
          </div>
          <LeadForm :type="mode" />
        </div>
      </div>
    </div>
  </div>
</template>
