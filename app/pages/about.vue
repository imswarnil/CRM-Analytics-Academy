<script setup lang="ts">
const { t, locale } = useI18n()
const title = computed(() => t('seo.aboutTitle'))
const description = computed(() => t('seo.aboutDesc'))

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title: title.value, description: description.value })

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': title.value,
    'description': description.value,
    'url': `${SITE.url}/about`,
    'inLanguage': locale.value
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': SITE.author,
    'url': 'https://imswarnil.com',
    'jobTitle': 'Creator & maintainer, CRM Analytics Academy',
    'worksFor': { '@type': 'Organization', 'name': SITE.name },
    'sameAs': ['https://github.com/imswarnil', 'https://imswarnil.com']
  }
])

const principles = [
  { icon: 'i-lucide-unlock', title: 'Open & free, forever', desc: 'No paywalls, no sign-up walls. Every lesson lives in a public repo you can read, fork, and improve.' },
  { icon: 'i-lucide-route', title: 'A path, not a pile', desc: 'Five modules build on each other — from CRM basics to a deployed Einstein Discovery model.' },
  { icon: 'i-lucide-square-code', title: 'Hands-on by default', desc: 'Real SAQL, recipes, and dashboard examples you can paste straight into your own org.' },
  { icon: 'i-lucide-bot', title: 'AI-native', desc: 'Every page is published as Markdown and over MCP, so assistants can teach from the source.' }
]

const modules = [
  { n: '01', label: 'CRM Analytics Foundations', to: '/foundations' },
  { n: '02', label: 'Interview questions', to: '/foundations/interview-questions' }
]

const stack = [
  { icon: 'i-simple-icons-nuxt', label: 'Nuxt 4' },
  { icon: 'i-simple-icons-vuedotjs', label: 'Vue 3' },
  { icon: 'i-simple-icons-bulma', label: 'Bulma' },
  { icon: 'i-lucide-file-text', label: 'Nuxt Content' },
  { icon: 'i-simple-icons-postgresql', label: 'Neon Postgres' },
  { icon: 'i-simple-icons-cloudflare', label: 'Cloudflare Workers' },
  { icon: 'i-simple-icons-salesforce', label: 'CRM Analytics' }
]

const authorLinks = [
  { icon: 'i-simple-icons-github', label: 'GitHub', to: 'https://github.com/imswarnil', target: '_blank' },
  { icon: 'i-lucide-globe', label: 'Website', to: 'https://imswarnil.com', target: '_blank' },
  { icon: 'i-lucide-heart', label: 'Sponsor', to: 'https://github.com/sponsors/crm-analytics-academy', target: '_blank' }
]
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <PageHero
      eyebrow="About"
      icon="i-lucide-info"
    >
      <template #title>
        Making Salesforce <span class="text-marker">CRM Analytics</span> learnable for everyone
      </template>
      <template #description>
        Two things to know: what this project is, and who builds it.
      </template>
    </PageHero>

    <!-- ===================== SECTION 1 — THE PROJECT ===================== -->
    <section class="py-20 sm:py-24">
      <div class="container">
        <div class="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <!-- Narrative -->
          <div>
            <p class="mb-3 is-size-7 has-text-weight-semibold is-uppercase has-text-primary">
              01 — The project
            </p>
            <h2 class="title is-3   has-text-weight-semibold">
              Great analytics learning shouldn't be locked away
            </h2>
            <div class="mt-6 space-y-4 is-size-5 has-text-grey">
              <p>
                Learning CRM Analytics usually means stitching together scattered docs, expensive courses,
                and out-of-date blog posts. The result is a steep, lonely climb — even though the platform
                is genuinely powerful once it clicks.
              </p>
              <p>
                <strong class="has-text-weight-semibold">CRM Analytics Academy</strong> exists to fix that: one
                coherent, modern, community-driven curriculum that takes you from "what is a CRM?" all the
                way to deploying an explainable prediction back into Salesforce. It is, and always will be,
                free and open source.
              </p>
              <p>
                Everything is written in the open. Spot a mistake or want to add a recipe? Open a pull
                request — the curriculum gets better with every learner who joins in.
              </p>
            </div>

            <div class="mt-8 is-flex is-flex-wrap-wrap gap-2">
              <span
                v-for="tech in stack"
                :key="tech.label"
                class="is-inline-flex is-align-items-center gap-2 rounded-full border border-default has-background-white px-3 py-1.5 is-size-7 has-text-weight-medium has-text-grey-dark"
              >
                <Icon
                  :name="tech.icon"
                  class="size-3.5 has-text-primary"
                />
                {{ tech.label }}
              </span>
            </div>
          </div>

          <!-- Principles + curriculum -->
          <div class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2">
              <div
                v-for="p in principles"
                :key="p.title"
                class="rounded-2xl border border-default has-background-white p-5"
              >
                <div class="mb-3 is-flex size-10 is-align-items-center is-justify-content-center rounded-xl bg-primary/10 has-text-primary ring-1 ring-primary/20">
                  <Icon
                    :name="p.icon"
                    class="size-5"
                  />
                </div>
                <h3 class="title is-5 is-size-7 has-text-weight-semibold ">
                  {{ p.title }}
                </h3>
                <p class="mt-1.5 is-size-7 has-text-grey">
                  {{ p.desc }}
                </p>
              </div>
            </div>

            <div class="rounded-2xl border border-default bg-muted/30 p-6">
              <p class="mb-4 is-size-7 has-text-weight-semibold has-text-weight-semibold">
                The curriculum at a glance
              </p>
              <ul class="space-y-1">
                <li
                  v-for="m in modules"
                  :key="m.n"
                >
                  <NuxtLink
                    :to="m.to"
                    class="is-flex is-align-items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-default"
                  >
                    <span class="is-family-monospace is-size-7 has-text-weight-bold text-primary/60">{{ m.n }}</span>
                    <span class="is-size-7 has-text-weight-medium has-text-grey-dark group-hover:text-highlighted">{{ m.label }}</span>
                    <Icon
                      name="i-lucide-arrow-right"
                      class="ml-auto size-4 has-text-grey-light transition group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <AdUnit
        placement="betweenSections"
        class="mx-auto max-w-3xl"
      />
    </div>

    <!-- ===================== SECTION 2 — THE AUTHOR ===================== -->
    <section class="border-t border-default bg-muted/30 py-20 sm:py-24">
      <div class="container">
        <div class="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <!-- Author card -->
          <div>
            <p class="mb-3 is-size-7 has-text-weight-semibold is-uppercase has-text-primary">
              02 — The author
            </p>
            <div class="rounded-3xl border border-default has-background-white p-8">
              <div class="relative w-fit">
                <div class="absolute -inset-2 rounded-full bg-primary/20 blur-xl" />
                <div class="relative is-flex size-24 is-align-items-center is-justify-content-center rounded-full has-background-primary is-size-3 has-text-weight-bold has-text-white shadow-xl">
                  SS
                </div>
              </div>
              <h3 class="title is-5 mt-5 is-size-4 has-text-weight-bold ">
                Swarnil Singhai
              </h3>
              <p class="mt-1 is-size-7 has-text-weight-medium has-text-primary">
                Creator &amp; maintainer
              </p>

              <div class="mt-6 is-flex is-flex-wrap-wrap gap-2">
                <UiButton
                  v-for="l in authorLinks"
                  :key="l.label"
                  variant="secondary"
                  :icon="l.icon"
                  :to="l.to"
                  :target="l.target"
                  :label="l.label"
                  class="rounded-full"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Author narrative -->
          <div class="is-flex is-flex-direction-column is-justify-content-center">
            <h2 class="title is-3   has-text-weight-semibold">
              Built by one developer, for the whole community
            </h2>
            <div class="mt-6 space-y-4 is-size-5 has-text-grey">
              <p>
                Hi — I'm <strong class="has-text-weight-semibold">Swarnil</strong>. I build on the Salesforce
                platform and care a lot about making hard things approachable. I started CRM Analytics
                Academy after watching too many capable people bounce off the learning curve, simply
                because the good material was scattered, dated, or behind a paywall.
              </p>
              <p>
                So I turned what I'd learned the hard way into a structured, open path others can follow —
                the resource I wish I'd had when I started. Every lesson is something I'd actually want a
                teammate to read on their first week.
              </p>
              <p>
                This is an ongoing, community-driven project. If it helped you, the best thanks is to
                <NuxtLink
                  to="https://github.com/imswarnil/CRM-Analytics-Academy"
                  target="_blank"
                  class="has-text-weight-medium has-text-primary underline-offset-4 hover:underline"
                >star the repo</NuxtLink>, suggest a topic, or contribute a lesson. Sponsorships keep it
                free and growing.
              </p>
            </div>

            <div class="mt-8 grid grid-cols-3 gap-4">
              <div class="rounded-2xl border border-default has-background-white p-4 has-text-centered">
                <div class="is-size-4 has-text-weight-bold has-text-weight-semibold">
                  2
                </div>
                <div class="mt-1 is-size-7 has-text-grey">
                  Modules
                </div>
              </div>
              <div class="rounded-2xl border border-default has-background-white p-4 has-text-centered">
                <div class="is-size-4 has-text-weight-bold has-text-weight-semibold">
                  4
                </div>
                <div class="mt-1 is-size-7 has-text-grey">
                  Lessons
                </div>
              </div>
              <div class="rounded-2xl border border-default has-background-white p-4 has-text-centered">
                <div class="is-size-4 has-text-weight-bold has-text-weight-semibold">
                  100%
                </div>
                <div class="mt-1 is-size-7 has-text-grey">
                  Open source
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================ CTA ============================ -->
    <section class="py-20 sm:py-24">
      <div class="container">
        <div class="relative overflow-hidden rounded-3xl border border-default has-background-primary px-6 py-16 has-text-centered sm:px-12">
          <div class="relative mx-auto max-w-2xl">
            <h2 class="title is-3   has-text-white is-size-2-tablet">
              Start learning today
            </h2>
            <p class="mt-4 is-size-5 text-white/80">
              It's free, open, and built to take you from CRM basics all the way to certified.
            </p>
            <div class="mt-8 is-flex is-flex-wrap-wrap is-justify-content-center gap-3">
              <UiButton
                variant="secondary"
                to="/foundations"
                trailing-icon="i-lucide-arrow-right"
                class="rounded-full bg-white has-text-weight-semibold text-salesforce-700 hover:bg-white/90"
                size="lg"
              >
                Start with Foundations
              </UiButton>
              <UiButton
                variant="secondary"
                to="https://github.com/imswarnil/CRM-Analytics-Academy"
                target="_blank"
                icon="i-simple-icons-github"
                class="rounded-full bg-transparent has-text-weight-semibold has-text-white ring-white/30 hover:bg-white/10 active:bg-white/10"
                size="lg"
              >
                Star on GitHub
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
