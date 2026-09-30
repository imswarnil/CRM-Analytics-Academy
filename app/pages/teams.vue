<script setup lang="ts">
/**
 * Upskilling for company teams, and the quotation form.
 */
const title = 'CRM Analytics training for teams'
const description = 'Train your admins, analysts and developers in Salesforce CRM Analytics — onsite, at a center or live online, fitted to your org. Request a quote.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight (the build runs near its heap limit) and nothing
// a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

usePageSchema({
  name: title,
  description,
  type: 'WebPage',
  extra: [{
    '@type': 'Service',
    'name': title,
    'description': description,
    'serviceType': 'Salesforce CRM Analytics corporate training',
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'areaServed': 'Worldwide',
    'url': `${SITE.url}/teams`
  }]
})

const plans = [
  {
    name: 'Self-serve',
    price: 'Free',
    per: 'forever',
    icon: 'i-lucide-laptop',
    blurb: 'The whole online course, for anyone on the team, at their own pace.',
    features: ['161 lessons and 17 builds', 'Progress tracking per learner', 'Quizzes and interview sets'],
    cta: { label: 'Start learning', to: '/curriculum' },
    highlight: false
  },
  {
    name: 'Team',
    price: '$390',
    per: 'per learner',
    icon: 'i-lucide-users',
    blurb: 'Self-paced plus mentor hours and a cohort manager who reports progress back to you.',
    features: ['Everything in Self-serve', 'Weekly live office hours', 'Team progress report', 'Practice org per learner'],
    cta: { label: 'Get a quotation', to: '#quote' },
    highlight: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: 'per programme',
    icon: 'i-lucide-building-2',
    blurb: 'Instructor-led, onsite or virtual, with exercises built on a copy of your own data model.',
    features: ['Curriculum fitted to your org', 'Onsite or at an Academy center', 'Pre- and post-assessment', 'Dedicated training advisor'],
    cta: { label: 'Talk to us', to: '#quote' },
    highlight: false
  }
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
      title="Upskill the whole team on CRM Analytics"
      lead="From the admin who owns the licences to the analyst who ships the dashboards — one curriculum, delivered the way your team works, with progress you can see."
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#quote"
          size="lg"
          icon="i-lucide-file-text"
        >
          Request a quotation
        </UButton>
        <UButton
          to="/implementation"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-wrench"
        >
          Need it built instead?
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <p class="eyebrow">
        Fig. 01 — Plans
      </p>
      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <article
          v-for="(p, n) in plans"
          :key="p.name"
          class="relative flex flex-col border-[1.5px] border-(--ink) p-6"
          :class="p.highlight ? 'graph-paper-navy bg-(--navy) text-white shadow-[10px_10px_0_var(--signal)]' : 'bg-(--card)'"
        >
          <span
            v-if="p.highlight"
            class="absolute -top-3 end-4 bg-(--glow) px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.1em] text-(--ink)"
          >Most teams</span>
          <div class="flex items-center gap-3">
            <span
              class="flex size-10 items-center justify-center border-[1.5px]"
              :class="p.highlight ? 'border-white/60 text-(--glow)' : 'border-(--ink) bg-(--ice) text-(--signal)'"
            >
              <UIcon
                :name="p.icon"
                class="size-5"
              />
            </span>
            <div>
              <p
                class="mono-label"
                :class="p.highlight ? 'text-(--glow)!' : ''"
              >
                Plan 0{{ n + 1 }}
              </p>
              <h2 class="text-lg font-extrabold">
                {{ p.name }}
              </h2>
            </div>
          </div>
          <p class="mt-5 flex items-baseline gap-2">
            <span class="text-4xl font-black tracking-[-0.04em]">{{ p.price }}</span>
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
          <ul class="mt-5 flex-1 space-y-2.5 text-sm">
            <li
              v-for="f in p.features"
              :key="f"
              class="flex gap-2.5"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0"
                :class="p.highlight ? 'text-(--glow)' : 'text-(--signal)'"
              />
              {{ f }}
            </li>
          </ul>
          <UButton
            :to="p.cta.to"
            block
            size="lg"
            class="mt-6"
            :variant="p.highlight ? 'solid' : 'outline'"
            :color="p.highlight ? 'secondary' : 'neutral'"
          >
            {{ p.cta.label }}
          </UButton>
        </article>
      </div>

      <div class="mt-20">
        <p class="eyebrow">
          Fig. 02 — Outcomes by role
        </p>
        <h2 class="bp-h2 mt-3">
          Every role leaves able to do its part
        </h2>
        <div class="mt-8 grid border-s-[1.5px] border-t-[1.5px] border-(--ink) sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(o, n) in outcomes"
            :key="o.title"
            class="border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-5"
          >
            <div class="flex items-center justify-between">
              <span class="bp-iconbox">
                <UIcon
                  :name="o.icon"
                  class="size-5"
                />
              </span>
              <span class="font-mono text-[10px] text-(--ink2)">R-0{{ n + 1 }}</span>
            </div>
            <h3 class="mt-4 font-extrabold text-(--ink)">
              {{ o.title }}
            </h3>
            <p class="mt-1.5 text-sm text-(--ink2)">
              {{ o.text }}
            </p>
          </div>
        </div>
      </div>

      <div
        id="quote"
        class="mt-20 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 03 — Quotation
          </p>
          <h2 class="bp-h2 mt-3">
            Tell us about the team
          </h2>
          <p class="bp-lead mt-4">
            A training advisor replies within two working days with a programme outline, a
            schedule and a price for your headcount.
          </p>
        </div>
        <div class="lg:col-span-3">
          <InquiryForm kind="quotation" />
        </div>
      </div>
    </div>
  </div>
</template>
