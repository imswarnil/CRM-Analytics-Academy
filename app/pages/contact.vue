<script setup lang="ts">
/**
 * Contact us: the general inbox, and the directory of the more specific
 * forms, so a sales question does not wait in the general queue.
 */
const title = 'Contact us'
const description = 'Contact CRM Analytics Academy: questions about lessons, your account or Pro, billing, partnerships and press. We reply within two working days.'
defineI18nRoute({ locales: ['en'] })

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })
usePageSchema({
  name: title,
  description,
  type: 'ContactPage',
  extra: [{
    '@type': 'Organization',
    '@id': ORG_ID,
    'name': SITE.name,
    'url': SITE.url,
    'contactPoint': [
      { '@type': 'ContactPoint', 'contactType': 'customer support', 'url': `${SITE.url}/contact`, 'availableLanguage': ['English'] },
      { '@type': 'ContactPoint', 'contactType': 'sales', 'url': `${SITE.url}/sales`, 'availableLanguage': ['English'] }
    ]
  }]
})

const routes = [
  { icon: 'i-lucide-briefcase-business', title: 'Talk to sales', text: 'Team licences, live training, custom curriculum.', to: '/sales' },
  { icon: 'i-lucide-file-text', title: 'Get a quotation', text: 'A written quote for your team, within two working days.', to: '/sales?type=quote' },
  { icon: 'i-lucide-wrench', title: 'Implementation', text: 'Rollouts, dashboards, pipelines and project rescues.', to: '/implementation' },
  { icon: 'i-lucide-presentation', title: 'Become an instructor', text: 'Teach a lesson, a section or a live cohort.', to: '/instructors' },
  { icon: 'i-lucide-heart-handshake', title: 'Sponsor the project', text: 'Section sponsorships, dataset features and mentions.', to: '/sponsor#sponsor-form' },
  { icon: 'i-lucide-award', title: 'Nominate someone', text: 'Put a CRM Analytics builder on the Wall of Fame.', to: '/nominate' }
]
</script>

<template>
  <div>
    <BpPageHeader
      sheet="Sheet 20 / Contact"
      title="Contact us"
      lead="A question about a lesson, your account, billing or anything else — it reaches a person, and we reply within two working days."
    />

    <div class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <p class="eyebrow">
            Fig. 01 — The right door
          </p>
          <h2 class="bp-h3 mt-3">
            Something more specific?
          </h2>
          <ul class="mt-6 border-[1.5px] border-(--ink) bg-(--card)">
            <li
              v-for="r in routes"
              :key="r.to"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="r.to"
                class="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-(--ice)"
              >
                <span class="bp-iconbox size-9! flex-none text-(--signal)">
                  <UIcon
                    :name="r.icon"
                    class="size-4"
                  />
                </span>
                <span class="min-w-0">
                  <span class="block font-bold text-(--ink) group-hover:text-(--signal)">{{ r.title }}</span>
                  <span class="block text-sm text-(--ink2)">{{ r.text }}</span>
                </span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ms-auto mt-1 size-4 flex-none text-(--ink2) transition-transform group-hover:translate-x-0.5"
                />
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div class="lg:col-span-3">
          <LeadForm type="contact" />
        </div>
      </div>
    </div>
  </div>
</template>
