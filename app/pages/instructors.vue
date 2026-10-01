<script setup lang="ts">
/**
 * Become an instructor: what teaching here involves, who we are looking for,
 * and the application.
 */
const title = 'Become an instructor'
const description = 'Teach Salesforce CRM Analytics with the Academy: write a lesson or a lab, run a live cohort or mentor learners. Credited, reviewed and paid for cohorts.'
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })
usePageSchema({ name: title, description, type: 'WebPage' })

const ways = [
  { n: '01', title: 'Write a lesson or lab', text: 'One topic, taught on the Academy\'s own company data, with a walkthrough and a quiz. Credited on the page.' },
  { n: '02', title: 'Own a section', text: 'Keep a whole section current across Salesforce releases, with the editor reviewing every change.' },
  { n: '03', title: 'Run live cohorts', text: 'Teach the classroom programmes online or at a center. Paid per cohort.' },
  { n: '04', title: 'Mentor', text: 'Office hours for teams on the Enterprise plan. Paid per hour.' }
]

const looking = [
  'You have shipped CRM Analytics in production — recipes, SAQL, dashboards people use.',
  'You can explain why, not only how: the decision a dashboard supports, the trade-off a recipe makes.',
  'You write plainly and are happy to be edited.',
  'You can commit to keeping what you teach current after each Salesforce release.'
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 22 / Instructors"
      title="Teach what you ship"
      lead="The Academy is written by people who build CRM Analytics for a living. If that is you, there is a lesson, a lab or a cohort with your name on it."
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <p class="eyebrow">
        Fig. 01 — Ways to teach
      </p>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="w in ways"
          :key="w.n"
          class="bp-card bp-card--hover p-5"
        >
          <span class="text-3xl font-black tracking-[-0.04em] text-(--signal)">{{ w.n }}</span>
          <h3 class="mt-2 font-extrabold text-(--ink)">
            {{ w.title }}
          </h3>
          <p class="mt-1 text-sm text-(--ink2)">
            {{ w.text }}
          </p>
        </div>
      </div>

      <div class="mt-20 grid gap-10 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 02 — Who we are looking for
          </p>
          <ul class="mt-6 space-y-3">
            <li
              v-for="l in looking"
              :key="l"
              class="flex gap-3 text-(--ink)"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-1 size-4 flex-none text-(--signal)"
              />
              {{ l }}
            </li>
          </ul>
          <p class="mt-6 text-sm text-(--ink2)">
            Prefer to start small? <NuxtLink
              to="/contribute"
              class="font-semibold text-(--signal) underline-offset-4 hover:underline"
            >Contribute a fix or a resource</NuxtLink> first.
          </p>
        </div>
        <div class="lg:col-span-3">
          <LeadForm type="instructor" />
        </div>
      </div>
    </div>
  </div>
</template>
