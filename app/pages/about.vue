<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { AUTHOR } from '~/data/author'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
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
    'name': AUTHOR.name,
    'url': 'https://imswarnil.com',
    'image': AUTHOR.avatar,
    'description': AUTHOR.summary,
    'jobTitle': AUTHOR.role,
    'worksFor': { '@type': 'Organization', 'name': AUTHOR.company },
    'workLocation': { '@type': 'Place', 'name': AUTHOR.place },
    'alumniOf': { '@type': 'CollegeOrUniversity', 'name': AUTHOR.education.school },
    'hasOccupation': AUTHOR.roles.map(r => ({ '@type': 'Occupation', 'name': r.title, 'description': `${r.company}, ${r.place} (${r.years})` })),
    'knowsAbout': AUTHOR.skills.flatMap(g => g.items),
    'sameAs': AUTHOR.social.map(s => s.url)
  }
])

const principles = [
  { icon: 'i-lucide-unlock', title: 'Open, and free at the core', desc: 'No sign-up wall. The core course is free and lives in a public repo you can read, fork and improve; optional Pro lessons pay for the rest.' },
  { icon: 'i-lucide-route', title: 'A path, not a pile', desc: 'Nineteen sections build on each other — from what CRM Analytics is, through SAQL and dashboard design, to seventeen go-to-market dashboards on the Academy\u2019s own business data.' },
  { icon: 'i-lucide-square-code', title: 'Hands-on by default', desc: 'Real SAQL, recipes, and dashboard examples you can paste straight into your own org.' },
  { icon: 'i-lucide-bot', title: 'AI-native', desc: 'Every page is published as Markdown and over MCP, so assistants can teach from the source.' }
]

// Every section of the course, straight from the navigation tree.
const modules = computed(() => (navigation.value ?? []).map((m, i) => ({
  n: String(i).padStart(2, '0'),
  label: String(m.title ?? ''),
  to: String(m.path ?? '/')
})))

const stack = [
  { icon: 'i-simple-icons-nuxt', label: 'Nuxt 4' },
  { icon: 'i-simple-icons-vuedotjs', label: 'Vue 3' },
  { icon: 'i-simple-icons-tailwindcss', label: 'Tailwind CSS 4' },
  { icon: 'i-lucide-file-text', label: 'Nuxt Content' },
  { icon: 'i-lucide-plug', label: 'MCP server' },
  { icon: 'i-simple-icons-salesforce', label: 'CRM Analytics' }
]

const authorLinks = [
  { icon: 'i-simple-icons-linkedin', label: 'LinkedIn', to: 'https://www.linkedin.com/in/imswarnil/', target: '_blank' },
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
            <ul class="max-h-96 overflow-y-auto">
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
                    {{ AUTHOR.name }}
                  </h3>
                  <p class="mono-label mt-1">
                    {{ AUTHOR.role }} · {{ AUTHOR.company }}
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

    <!-- ===================== SECTION 3 — THE WORK ===================== -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('about.work.eyebrow') }}
      </p>
      <div class="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
        <h2 class="bp-h2">
          {{ t('about.work.title') }}
        </h2>
        <p class="bp-lead">
          {{ AUTHOR.summary }}
        </p>
      </div>

      <div class="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <!-- Highlights -->
        <div>
          <p class="mono-label">
            {{ t('about.work.highlights') }}
          </p>
          <ol class="mt-3 space-y-3">
            <li
              v-for="(h, i) in AUTHOR.highlights"
              :key="i"
              class="bp-card bp-card--hover flex gap-4 p-5"
            >
              <span class="font-mono text-xs font-semibold text-(--signal)">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="text-[15px] leading-relaxed text-(--ink2)">{{ h }}</span>
            </li>
          </ol>
        </div>

        <!-- Experience + education -->
        <div class="space-y-6">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
              {{ t('about.work.experience') }}
            </p>
            <ol class="relative px-4 py-2">
              <li
                v-for="r in AUTHOR.roles"
                :key="r.company"
                class="relative border-s-[1.5px] border-(--line) py-3 ps-5"
              >
                <span
                  class="absolute -start-[7px] top-4 size-3 border-[1.5px] border-(--ink)"
                  :class="r.current ? 'bg-(--signal)' : 'bg-(--card)'"
                />
                <p class="font-mono text-[11px] text-(--ink2)">
                  {{ r.years }} · {{ r.place }}
                </p>
                <p class="mt-0.5 font-bold text-(--ink)">
                  {{ r.title }} <span class="font-normal text-(--ink2)">· {{ r.company }}</span>
                </p>
              </li>
            </ol>
          </div>
          <div class="flex items-start gap-4 border-[1.5px] border-(--ink) bg-(--card) p-4">
            <span class="bp-iconbox text-(--signal)">
              <UIcon
                name="i-lucide-graduation-cap"
                class="size-5"
              />
            </span>
            <div>
              <p class="mono-label">
                {{ t('about.work.education') }}
              </p>
              <p class="mt-1 font-bold text-(--ink)">
                {{ AUTHOR.education.degree }}
              </p>
              <p class="text-sm text-(--ink2)">
                {{ AUTHOR.education.school }} · {{ AUTHOR.education.years }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="mt-12 border-[1.5px] border-(--ink) bg-(--card)">
        <p class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.12em]">
          {{ t('about.work.skills') }}
        </p>
        <dl class="divide-y divide-dashed divide-(--line)">
          <div
            v-for="g in AUTHOR.skills"
            :key="g.group"
            class="grid gap-3 px-4 py-3 md:grid-cols-[8rem_minmax(0,1fr)] md:items-baseline"
          >
            <dt class="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-(--signal)">
              {{ g.group }}
            </dt>
            <dd class="flex flex-wrap gap-1.5">
              <span
                v-for="s in g.items"
                :key="s"
                class="border-[1.5px] border-(--ink) px-2 py-0.5 text-[12px] text-(--ink)"
              >{{ s }}</span>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Other things he builds -->
      <p class="mono-label mt-12">
        {{ t('about.work.projects') }}
      </p>
      <div class="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]">
        <a
          v-for="p in AUTHOR.projects"
          :key="p.name"
          :href="p.url"
          target="_blank"
          rel="noopener"
          class="bp-card bp-card--hover flex flex-col p-4"
        >
          <span class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-(--ink)">{{ p.name }}</span>
            <span
              class="border-[1.5px] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[.1em]"
              :class="p.status === 'live' ? 'border-(--signal) text-(--signal)' : 'border-(--line) text-(--ink2)'"
            >{{ p.status === 'live' ? t('about.work.live') : t('about.work.building') }}</span>
          </span>
          <span class="mt-2 text-sm text-(--ink2)">{{ p.blurb }}</span>
          <span class="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">{{ p.stack }}</span>
        </a>
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
