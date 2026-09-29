<script setup lang="ts">
/**
 * Upskilling for company teams, and the quotation form.
 */
const title = 'CRM Analytics training for teams'
const description = 'Upskill your admins, analysts and developers in Salesforce CRM Analytics: onsite, at an Academy center or live virtual, with a curriculum fitted to your org. Request a quotation.'
// Hand-written English, so one copy: twelve locale copies of an untranslated
// page add prerender weight (the build runs near its heap limit) and nothing
// a reader can use.
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

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
    <section class="bg-brand-wash border-b border-default">
      <UContainer class="py-14 sm:py-20">
        <p class="im-meta text-primary">
          CRM Analytics Academy · For teams
        </p>
        <h1 class="mt-3 max-w-3xl text-4xl font-bold tracking-tighter text-highlighted sm:text-5xl text-balance">
          Upskill the whole team on CRM Analytics
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-muted text-pretty">
          From the admin who owns the licences to the analyst who ships the dashboards — one
          curriculum, delivered the way your team works, with progress you can see.
        </p>
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
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-16">
      <div class="grid gap-4 lg:grid-cols-3">
        <article
          v-for="p in plans"
          :key="p.name"
          class="relative flex flex-col rounded-2xl border bg-default p-6"
          :class="p.highlight ? 'border-primary ring-1 ring-primary' : 'border-default'"
        >
          <UBadge
            v-if="p.highlight"
            class="absolute -top-3 left-6"
          >
            Most teams
          </UBadge>
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UIcon
                :name="p.icon"
                class="size-5"
              />
            </span>
            <h2 class="text-lg font-semibold text-highlighted">
              {{ p.name }}
            </h2>
          </div>
          <p class="mt-5">
            <span class="text-4xl font-bold tracking-tight text-highlighted">{{ p.price }}</span>
            <span class="ms-1.5 text-sm text-muted">{{ p.per }}</span>
          </p>
          <p class="mt-3 text-sm text-muted">
            {{ p.blurb }}
          </p>
          <ul class="mt-5 flex-1 space-y-2.5 text-sm text-toned">
            <li
              v-for="f in p.features"
              :key="f"
              class="flex gap-2.5"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
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
            :color="p.highlight ? 'primary' : 'neutral'"
          >
            {{ p.cta.label }}
          </UButton>
        </article>
      </div>

      <div class="mt-16">
        <p class="im-meta text-primary">
          Outcomes by role
        </p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
          Every role leaves able to do its part
        </h2>
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="o in outcomes"
            :key="o.title"
            class="rounded-xl border border-default bg-default p-5"
          >
            <UIcon
              :name="o.icon"
              class="size-5 text-primary"
            />
            <h3 class="mt-3 font-semibold text-highlighted">
              {{ o.title }}
            </h3>
            <p class="mt-1.5 text-sm text-muted">
              {{ o.text }}
            </p>
          </div>
        </div>
      </div>

      <div
        id="quote"
        class="mt-16 grid scroll-mt-24 gap-10 lg:grid-cols-5"
      >
        <div class="lg:col-span-2">
          <p class="im-meta text-primary">
            Quotation
          </p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-highlighted">
            Tell us about the team
          </h2>
          <p class="mt-3 text-muted">
            A training advisor replies within two working days with a programme outline, a
            schedule and a price for your headcount.
          </p>
        </div>
        <div class="lg:col-span-3">
          <InquiryForm kind="quotation" />
        </div>
      </div>
    </UContainer>
  </div>
</template>
