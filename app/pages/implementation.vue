<script setup lang="ts">
/**
 * Implementation services, and the consultation request form.
 */
const title = 'CRM Analytics implementation'
const description = 'Salesforce CRM Analytics implementation by the people who wrote the course: rollouts, dashboards, data pipelines, Einstein Discovery and rescues of stalled projects. Request a consultation.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight (the build runs near its heap limit) and nothing
// a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

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
    <section class="bg-brand-wash border-b border-default">
      <UContainer class="py-14 sm:py-20">
        <p class="im-meta text-primary">
          CRM Analytics Academy · Implementation
        </p>
        <h1 class="mt-3 max-w-3xl text-4xl font-bold tracking-tighter text-highlighted sm:text-5xl text-balance">
          CRM Analytics, built by the people who teach it
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-muted text-pretty">
          Rollouts, dashboards and data pipelines delivered with the same rules the course
          teaches: the right grain, a metric contract, and security that holds.
        </p>
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
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-16">
      <p class="im-meta text-primary">
        Services
      </p>
      <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
        What we build
      </h2>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="s in services"
          :key="s.title"
          class="im-card-hover rounded-xl border border-default bg-default p-5"
        >
          <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon
              :name="s.icon"
              class="size-5"
            />
          </span>
          <h3 class="mt-4 font-semibold text-highlighted">
            {{ s.title }}
          </h3>
          <p class="mt-1.5 text-sm text-muted">
            {{ s.text }}
          </p>
        </div>
      </div>

      <div class="mt-16 rounded-2xl border border-default bg-default p-6 sm:p-8">
        <p class="im-meta text-primary">
          How it works
        </p>
        <ol class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="s in steps"
            :key="s.n"
          >
            <span class="im-figure text-2xl font-semibold text-primary">{{ s.n }}</span>
            <h3 class="mt-2 font-semibold text-highlighted">
              {{ s.title }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ s.text }}
            </p>
          </li>
        </ol>
      </div>

      <div
        id="consult"
        class="mt-16 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="im-meta text-primary">
            Consultation
          </p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
            Describe the project
          </h2>
          <p class="mt-3 text-muted">
            A solution architect reads every request and replies to schedule a scoping call.
            No sales sequence, no newsletter.
          </p>
        </div>
        <div class="lg:col-span-3">
          <InquiryForm kind="implementation" />
        </div>
      </div>
    </UContainer>
  </div>
</template>
