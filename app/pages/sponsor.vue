<script setup lang="ts">
const title = 'Sponsor — CRM Analytics Academy'
const description = 'Sponsor CRM Analytics Academy and help keep the best free, open-source Salesforce CRM Analytics curriculum growing for everyone.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const sponsorUrl = 'https://github.com/sponsors/crm-analytics-academy'

const reasons = [
  { icon: 'i-lucide-unlock', title: 'Keep it free', desc: 'Sponsorship pays for hosting and tooling so every lesson stays free, with no paywalls or ads-only model.' },
  { icon: 'i-lucide-rocket', title: 'Fund new content', desc: 'More modules, more languages, more hands-on recipes and sample datasets — funded by the community.' },
  { icon: 'i-lucide-heart-handshake', title: 'Support open source', desc: 'Everything lives in a public repo. Your support keeps it independent and maintained.' }
]

const tiers = [
  { name: 'Supporter', price: '$5', period: '/mo', perks: ['Name in our backers list', 'Our eternal thanks'], highlight: false },
  { name: 'Backer', price: '$25', period: '/mo', perks: ['Everything in Supporter', 'Logo on the homepage', 'Early access to new modules'], highlight: true },
  { name: 'Sponsor', price: '$100', period: '/mo', perks: ['Everything in Backer', 'Logo in the repo README', 'A topic request each quarter'], highlight: false }
]
</script>

<template>
  <div>
    <PageHero
      eyebrow="Sponsor"
      icon="i-lucide-heart"
    >
      <template #title>
        Help keep it <span class="text-marker">free & open</span>
      </template>
      <template #description>
        CRM Analytics Academy is built in the open and given away for free. Sponsorship keeps the lights on and funds new lessons, languages, and datasets.
      </template>
    </PageHero>

    <!-- Featured sponsor -->
    <div class="container  pt-12 sm:pt-16">
      <div class="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
        <div class="is-flex is-flex-direction-column is-align-items-center gap-5 p-6 has-text-centered sm:flex-row sm:p-8 sm:text-left">
          <div class="is-flex size-16 shrink-0 is-align-items-center is-justify-content-center rounded-2xl bg-primary/10 has-text-primary ring-1 ring-primary/20">
            <Icon
              name="i-lucide-sparkles"
              class="size-8"
            />
          </div>
          <div class="min-w-0 flex-1">
            <span class="inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] has-text-weight-bold is-uppercase has-text-primary">
              Featured sponsor
            </span>
            <h2 class="title is-3 mt-2 is-size-5  has-text-weight-semibold">
              Namaste Salesforce
            </h2>
            <p class="mt-1 is-size-7 has-text-grey">
              Learn Salesforce the friendly way — tutorials, tips, and hands-on guidance for admins and developers.
            </p>
          </div>
          <UiButton
            variant="secondary"
            to="https://www.namastesalesforce.com/"
            target="_blank"
            rel="sponsored noopener"
            icon="i-lucide-arrow-up-right"
            trailing
            class="shrink-0 rounded-full has-text-weight-semibold"
            size="lg"
          >
            Visit
          </UiButton>
        </div>
        <p class="border-t border-primary/20 bg-primary/5 px-6 py-3 has-text-centered is-size-7 has-text-grey">
          This is a <span class="has-text-weight-medium text-default">demo placement</span> — your business could be featured here and across the site.
          <NuxtLink
            :to="sponsorUrl"
            target="_blank"
            class="has-text-primary hover:underline"
          >Promote with us →</NuxtLink>
        </p>
      </div>
    </div>

    <div class="container  py-14 sm:py-20">
      <div class="grid gap-6 sm:grid-cols-3">
        <div
          v-for="r in reasons"
          :key="r.title"
          class="rounded-2xl border border-default has-background-white p-6"
        >
          <div class="mb-4 is-flex size-11 is-align-items-center is-justify-content-center rounded-xl bg-primary/10 has-text-primary ring-1 ring-primary/20">
            <Icon
              :name="r.icon"
              class="size-5"
            />
          </div>
          <h3 class="title is-5 has-text-weight-semibold ">
            {{ r.title }}
          </h3>
          <p class="mt-2 is-size-7 has-text-grey">
            {{ r.desc }}
          </p>
        </div>
      </div>

      <div class="mt-16">
        <h2 class="title is-3 mb-10 has-text-centered   has-text-weight-semibold">
          Sponsorship tiers
        </h2>
        <div class="grid gap-6 sm:grid-cols-3">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            class="is-flex is-flex-direction-column rounded-2xl border p-6"
            :class="tier.highlight ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-default bg-default'"
          >
            <h3 class="title is-5 has-text-weight-semibold ">
              {{ tier.name }}
            </h3>
            <p class="mt-2">
              <span class="is-size-3 has-text-weight-bold has-text-weight-semibold">{{ tier.price }}</span>
              <span class="is-size-7 has-text-grey">{{ tier.period }}</span>
            </p>
            <ul class="mt-5 grow space-y-2">
              <li
                v-for="perk in tier.perks"
                :key="perk"
                class="is-flex is-align-items-flex-start gap-2 is-size-7 has-text-grey"
              >
                <Icon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 has-text-primary"
                />
                {{ perk }}
              </li>
            </ul>
            <UiButton
              variant="secondary"
              :to="sponsorUrl"
              target="_blank"
              block
              class="mt-6 rounded-full has-text-weight-semibold"
            >
              Choose {{ tier.name }}
            </UiButton>
          </div>
        </div>
        <p class="mt-8 has-text-centered is-size-7 has-text-grey">
          Prefer a one-time gift? You can also sponsor a single amount on
          <NuxtLink
            :to="sponsorUrl"
            target="_blank"
            class="has-text-weight-medium has-text-primary underline-offset-4 hover:underline"
          >GitHub Sponsors</NuxtLink>.
        </p>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </div>
  </div>
</template>
