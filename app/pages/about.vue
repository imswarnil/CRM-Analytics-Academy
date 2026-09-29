<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const navigation = inject<Ref<unknown[]>>('navigation', ref([]))
const { total } = useCourse()
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
  { icon: 'i-lucide-unlock', title: 'Open, and free at the core', desc: 'No sign-up wall. The core course is free and lives in a public repo you can read, fork and improve; optional Pro lessons pay for the rest.' },
  { icon: 'i-lucide-route', title: 'A path, not a pile', desc: 'Nineteen sections build on each other — from what CRM Analytics is, through SAQL and dashboard design, to seventeen go-to-market dashboards on the Academy\u2019s own business data.' },
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
  { icon: 'i-simple-icons-tailwindcss', label: 'Tailwind CSS 4' },
  { icon: 'i-lucide-file-text', label: 'Nuxt Content' },
  { icon: 'i-lucide-plug', label: 'MCP server' },
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
    <BpPageHeader
      sheet="Sheet 07 / About"
      title="Making CRM Analytics learnable for everyone"
      lead="Two things to know: what this project is, and who builds it."
    />

    <!-- ===================== SECTION 1 — THE PROJECT ===================== -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <!-- Narrative -->
        <div>
          <p class="eyebrow">
            § 01 — The project
          </p>
          <h2 class="bp-h2 mt-3 text-(--ink)">
            Great analytics learning shouldn't be locked away
          </h2>
          <div class="mt-6 space-y-4 text-lg text-(--ink2)">
            <p>
              Learning CRM Analytics usually means stitching together scattered docs, expensive courses,
              and out-of-date blog posts. The result is a steep, lonely climb — even though the platform
              is genuinely powerful once it clicks.
            </p>
            <p>
              <strong class="text-(--ink)">CRM Analytics Academy</strong> exists to fix that: one
              coherent, modern, community-driven curriculum that takes you from "what is a CRM?" all the
              way to deploying an explainable prediction back into Salesforce. It is, and always will be,
              free and open source.
            </p>
            <p>
              Everything is written in the open. Spot a mistake or want to add a recipe? Open a pull
              request — the curriculum gets better with every learner who joins in.
            </p>
          </div>

          <div class="mt-8 flex flex-wrap gap-2">
            <span
              v-for="tech in stack"
              :key="tech.label"
              class="inline-flex items-center gap-2 border-[1.5px] border-(--ink) bg-(--card) px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.06em] text-(--ink)"
            >
              <UIcon
                :name="tech.icon"
                class="size-3.5 text-(--signal)"
              />
              {{ tech.label }}
            </span>
          </div>
        </div>

        <!-- Principles + curriculum -->
        <div class="space-y-6">
          <div class="grid gap-5 sm:grid-cols-2">
            <div
              v-for="(p, n) in principles"
              :key="p.title"
              class="bp-card bp-card--hover p-5"
            >
              <span class="bp-iconbox text-(--signal)">
                <UIcon
                  :name="p.icon"
                  class="size-5"
                />
              </span>
              <p class="mono-label mt-4">
                Principle {{ String(n + 1).padStart(2, '0') }}
              </p>
              <h3 class="mt-1 font-extrabold text-(--ink)">
                {{ p.title }}
              </h3>
              <p class="mt-1.5 text-sm text-(--ink2)">
                {{ p.desc }}
              </p>
            </div>
          </div>

          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              The curriculum at a glance
            </p>
            <ul>
              <li
                v-for="m in modules"
                :key="m.n"
                class="border-b border-dashed border-(--line) last:border-b-0"
              >
                <NuxtLink
                  :to="localePath(m.to)"
                  class="bp-row group flex items-center gap-3 px-4 py-3 hover:bg-(--ice)/50"
                >
                  <span class="font-mono text-xs font-semibold text-(--signal)">{{ m.n }}</span>
                  <span class="text-sm font-semibold text-(--ink)">{{ m.label }}</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="ms-auto size-4 text-(--ink2) transition group-hover:translate-x-0.5 group-hover:text-(--signal)"
                  />
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-3xl px-4">
      <PromoSlot placement="betweenSections" />
    </div>

    <!-- ===================== SECTION 2 — THE AUTHOR ===================== -->
    <section class="graph-paper border-y-[1.5px] border-(--ink)">
      <div class="mx-auto grid max-w-(--ui-container) gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8">
        <!-- Instructor card -->
        <div>
          <p class="eyebrow">
            § 02 — The instructor
          </p>
          <BpFigure
            caption="Fig. 01 — Instructor"
            spec="Creator &amp; maintainer"
            shadow
            class="mt-4"
          >
            <div class="p-8">
              <div class="flex items-center gap-5">
                <span class="flex size-20 flex-none items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) text-3xl font-black tracking-[-0.04em] text-white">
                  SS
                </span>
                <div>
                  <h3 class="text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
                    Swarnil Singhai
                  </h3>
                  <p class="mono-label mt-1">
                    Creator &amp; maintainer
                  </p>
                </div>
              </div>

              <dl class="mt-6 grid grid-cols-3 border-[1.5px] border-(--ink)">
                <div class="border-e-[1.5px] border-(--ink) p-3 text-center">
                  <dt class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                    Sections
                  </dt>
                  <dd class="mt-1 text-2xl font-black tracking-[-0.03em] text-(--ink)">
                    {{ navigation.length }}
                  </dd>
                </div>
                <div class="border-e-[1.5px] border-(--ink) p-3 text-center">
                  <dt class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                    Lessons
                  </dt>
                  <dd class="mt-1 text-2xl font-black tracking-[-0.03em] text-(--ink)">
                    {{ total }}
                  </dd>
                </div>
                <div class="p-3 text-center">
                  <dt class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
                    Open source
                  </dt>
                  <dd class="mt-1 text-2xl font-black tracking-[-0.03em] text-(--signal)">
                    100%
                  </dd>
                </div>
              </dl>

              <div class="mt-6 flex flex-wrap gap-2">
                <UButton
                  v-for="l in authorLinks"
                  :key="l.label"
                  :icon="l.icon"
                  :to="l.to"
                  :target="l.target"
                  :label="l.label"
                  color="neutral"
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          </BpFigure>
        </div>

        <!-- Author narrative -->
        <div class="flex flex-col justify-center">
          <h2 class="bp-h2 text-(--ink)">
            Built by one developer, for the whole community
          </h2>
          <div class="mt-6 space-y-4 text-lg text-(--ink2)">
            <p>
              Hi — I'm <strong class="text-(--ink)">Swarnil</strong>. I build on the Salesforce
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
                class="font-semibold text-(--signal) underline-offset-4 hover:underline"
              >star the repo</NuxtLink>, suggest a topic, or contribute a lesson. Sponsorships keep it
              free and growing.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================ CTA ============================ -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="graph-paper-navy border-[1.5px] border-(--ink) bg-(--navy) px-6 py-16 text-center text-white shadow-[10px_10px_0_var(--signal)] sm:px-12">
        <p class="eyebrow text-(--glow)!">
          Start
        </p>
        <h2 class="bp-h2 mt-3 text-white">
          Start learning today
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-white/80">
          It's free, open, and built to take you from CRM basics all the way to certified.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton
            :to="localePath('/foundations')"
            size="xl"
            color="secondary"
            trailing-icon="i-lucide-arrow-right"
          >
            Start with Foundations
          </UButton>
          <UButton
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            size="xl"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
            class="border-white/60 bg-transparent text-white hover:bg-white/10"
          >
            Star on GitHub
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
