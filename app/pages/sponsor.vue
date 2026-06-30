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
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-16 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-heart"
            class="mr-1 size-4"
          />
          Sponsor
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Help keep it <span class="text-gradient">free & open</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          CRM Analytics Academy is built in the open and given away for free. Sponsorship keeps the lights on and funds new lessons, languages, and datasets.
        </p>
        <UButton
          :to="sponsorUrl"
          target="_blank"
          size="xl"
          icon="i-lucide-heart"
          class="mt-8 rounded-full font-semibold"
        >
          Sponsor on GitHub
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-20">
      <div class="grid gap-6 sm:grid-cols-3">
        <div
          v-for="r in reasons"
          :key="r.title"
          class="rounded-2xl border border-default bg-default p-6"
        >
          <div class="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UIcon
              :name="r.icon"
              class="size-5"
            />
          </div>
          <h3 class="font-semibold text-highlighted">
            {{ r.title }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ r.desc }}
          </p>
        </div>
      </div>

      <div class="mt-16">
        <h2 class="mb-10 text-center text-3xl font-bold tracking-tight text-highlighted">
          Sponsorship tiers
        </h2>
        <div class="grid gap-6 sm:grid-cols-3">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            class="flex flex-col rounded-2xl border p-6"
            :class="tier.highlight ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-default bg-default'"
          >
            <h3 class="font-semibold text-highlighted">
              {{ tier.name }}
            </h3>
            <p class="mt-2">
              <span class="text-3xl font-extrabold text-highlighted">{{ tier.price }}</span>
              <span class="text-sm text-muted">{{ tier.period }}</span>
            </p>
            <ul class="mt-5 grow space-y-2">
              <li
                v-for="perk in tier.perks"
                :key="perk"
                class="flex items-start gap-2 text-sm text-muted"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                {{ perk }}
              </li>
            </ul>
            <UButton
              :to="sponsorUrl"
              target="_blank"
              block
              :color="tier.highlight ? 'primary' : 'neutral'"
              :variant="tier.highlight ? 'solid' : 'outline'"
              class="mt-6 rounded-full font-semibold"
            >
              Choose {{ tier.name }}
            </UButton>
          </div>
        </div>
        <p class="mt-8 text-center text-sm text-muted">
          Prefer a one-time gift? You can also sponsor a single amount on
          <NuxtLink
            :to="sponsorUrl"
            target="_blank"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >GitHub Sponsors</NuxtLink>.
        </p>
      </div>
    </UContainer>
  </div>
</template>
