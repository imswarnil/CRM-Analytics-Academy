<script setup lang="ts">
/**
 * Implementation services, and the consultation request form.
 */
const title = 'CRM Analytics implementation'
const description = 'CRM Analytics implementation by the people who wrote the course: rollouts, dashboards, data pipelines, Einstein Discovery and rescues of stalled projects.'
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
    'serviceType': 'Salesforce CRM Analytics implementation consulting',
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'areaServed': 'Worldwide',
    'url': `${SITE.url}/implementation`
  }]
})

const services = [
  { icon: 'i-lucide-rocket', title: 'New rollout', text: 'Licences, permission sets, security predicates, the first datasets and a first dashboard people use.' },
  { icon: 'i-lucide-layout-dashboard', title: 'Dashboards', text: 'Executive, pipeline, service and retention boards designed around the decision each one supports.' },
  { icon: 'i-lucide-workflow', title: 'Data pipelines', text: 'Recipes, connectors and sync scheduled so the numbers are right before anyone opens them.' },
  { icon: 'i-lucide-brain', title: 'Einstein Discovery', text: 'Predictions that are audited against outcomes, deployed where the decision is made.' },
  { icon: 'i-lucide-gauge', title: 'Performance & security review', text: 'Slow dashboards, oversized datasets and row-level security that does not hold.' },
  { icon: 'i-lucide-life-buoy', title: 'Project rescue', text: 'A stalled rollout taken over, diagnosed and brought to something the business signs off.' }
]

const steps = [
  { n: '01', title: 'Scoping call', text: 'Thirty minutes on the decisions, the users and the data.' },
  { n: '02', title: 'Proposal', text: 'A fixed scope, a timeline and a price within a week.' },
  { n: '03', title: 'Build', text: 'Weekly demos in your sandbox, never a big reveal at the end.' },
  { n: '04', title: 'Handover', text: 'Your team trained on what was built, with its documentation.' }
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 09 / Implementation"
      title="CRM Analytics, built by the people who teach it"
      lead="Rollouts, dashboards and data pipelines delivered with the same rules the course teaches: the right grain, a metric contract, and security that holds."
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#consult"
          size="lg"
          icon="i-lucide-calendar"
        >
          Request a consultation
        </UButton>
        <UButton
          to="/teams"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-users"
        >
          Train your team instead
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <p class="eyebrow">
        Fig. 01 — Services
      </p>
      <h2 class="bp-h2 mt-3">
        What we build
      </h2>
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(s, n) in services"
          :key="s.title"
          class="bp-card bp-card--hover p-5"
        >
          <div class="flex items-start justify-between">
            <span class="bp-iconbox">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <span class="font-mono text-[10px] text-(--ink2)">S-0{{ n + 1 }}</span>
          </div>
          <h3 class="mt-4 font-extrabold text-(--ink)">
            {{ s.title }}
          </h3>
          <p class="mt-1.5 text-sm text-(--ink2)">
            {{ s.text }}
          </p>
        </div>
      </div>

      <div class="graph-paper-navy mt-20 border-[1.5px] border-(--ink) bg-(--navy) p-6 text-white sm:p-8">
        <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
          Fig. 02 — How it works
        </p>
        <ol class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="s in steps"
            :key="s.n"
            class="border-t-[1.5px] border-white/40 pt-4"
          >
            <span class="text-3xl font-black tracking-[-0.04em] text-(--glow)">{{ s.n }}</span>
            <h3 class="mt-2 font-extrabold">
              {{ s.title }}
            </h3>
            <p class="mt-1 text-sm text-white/75">
              {{ s.text }}
            </p>
          </li>
        </ol>
      </div>

      <div
        id="consult"
        class="mt-20 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 03 — Consultation
          </p>
          <h2 class="bp-h2 mt-3">
            Describe the project
          </h2>
          <p class="bp-lead mt-4">
            A solution architect reads every request and replies to schedule a scoping call.
            No sales sequence, no newsletter.
          </p>
        </div>
        <div class="lg:col-span-3">
          <LeadForm type="implementation" />
        </div>
      </div>
    </div>
  </div>
</template>
