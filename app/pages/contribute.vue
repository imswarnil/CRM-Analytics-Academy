<script setup lang="ts">
const { t, tm, rt } = useI18n()
const title = computed(() => t('contribute.seo.title'))
const description = computed(() => t('contribute.seo.description'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage' }))

const localePath = useLocalePath()
const repo = 'https://github.com/imswarnil/CRM-Analytics-Academy'

/** Keys under `contribute.levels`. */
type Level = 'startHere' | 'noCode' | 'beginner' | 'intermediate' | 'advanced' | 'reference' | 'anytime'

/** Labels live under `contribute.steps.<id>`. */
const steps: { id: string, n: string, icon: string, level: Level }[] = [
  { id: 'ways', n: '01', icon: 'i-lucide-sparkles', level: 'startHere' },
  { id: 'setup', n: '02', icon: 'i-lucide-terminal', level: 'beginner' },
  { id: 'lessons', n: '03', icon: 'i-lucide-pen-line', level: 'noCode' },
  { id: 'frontmatter', n: '04', icon: 'i-lucide-file-code-2', level: 'noCode' },
  { id: 'translations', n: '05', icon: 'i-lucide-languages', level: 'noCode' },
  { id: 'showcase', n: '06', icon: 'i-lucide-layout-dashboard', level: 'noCode' },
  { id: 'submit', n: '07', icon: 'i-lucide-upload', level: 'noCode' },
  { id: 'code', n: '08', icon: 'i-lucide-code', level: 'intermediate' },
  { id: 'stack', n: '09', icon: 'i-lucide-layers', level: 'reference' },
  { id: 'pr', n: '10', icon: 'i-lucide-git-pull-request', level: 'beginner' },
  { id: 'help', n: '11', icon: 'i-lucide-life-buoy', level: 'anytime' }
]

const levelColor = (l: Level): 'success' | 'primary' | 'warning' | 'neutral' =>
  l === 'noCode' ? 'success' : l === 'beginner' || l === 'startHere' ? 'primary' : l === 'intermediate' || l === 'advanced' ? 'warning' : 'neutral'

// The friendliest first contributions — no experience required. The copy
// lives in i18n (`contribute.quickStarts`); icons and anchors stay here, by position.
const QUICK_STARTS = [
  { icon: 'i-lucide-type', to: '#lessons' },
  { icon: 'i-lucide-upload', to: '#submit' },
  { icon: 'i-lucide-languages', to: '#translations' },
  { icon: 'i-lucide-layout-dashboard', to: '#showcase' }
]
const quickStarts = computed(() =>
  (tm('contribute.quickStarts') as { title: string, text: string }[]).map((q, i) => ({
    icon: QUICK_STARTS[i]?.icon ?? 'i-lucide-circle',
    to: QUICK_STARTS[i]?.to ?? '#ways',
    title: rt(q.title),
    text: rt(q.text)
  }))
)

// Prose classes shared by every timeline step body.
const prose = 'prose prose-neutral mt-4 max-w-none dark:prose-invert prose-a:text-primary prose-pre:border prose-pre:border-default prose-headings:scroll-mt-24'
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-14 text-center sm:py-20">
        <p class="eyebrow mb-5">
          {{ t('contribute.hero.eyebrow') }}
        </p>
        <i18n-t
          keypath="contribute.hero.title"
          tag="h1"
          scope="global"
          class="mx-auto max-w-3xl bp-h1"
        >
          <template #em>
            <span class="text-gradient">{{ t('contribute.hero.titleEm') }}</span>
          </template>
        </i18n-t>
        <p class="mx-auto mt-5 max-w-2xl bp-lead">
          {{ t('contribute.hero.lead') }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton
            :to="repo"
            target="_blank"
            size="lg"
            icon="i-simple-icons-github"
            class="font-semibold"
          >
            {{ t('contribute.hero.github') }}
          </UButton>
          <UButton
            :to="localePath('/submit?kind=resource')"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
            class="font-semibold"
          >
            {{ t('contribute.hero.suggest') }}
          </UButton>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
        <!-- Sticky stepper -->
        <aside class="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-(--ink2)">
            {{ t('contribute.stepper') }}
          </p>
          <ol class="relative space-y-1">
            <!-- connecting line -->
            <span class="absolute bottom-3 left-3.5 top-3 w-px bg-(--card)" />
            <li
              v-for="s in steps"
              :key="s.id"
            >
              <a
                :href="`#${s.id}`"
                class="group relative flex items-center gap-3 py-1.5 pl-0 pr-2 text-sm text-(--ink2) transition hover:text-(--signal)"
              >
                <span class="relative z-10 flex size-7 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) text-[11px] font-bold text-(--ink2) transition group-hover:border-(--signal) group-hover:text-(--signal)">
                  {{ Number(s.n) }}
                </span>
                <span class="min-w-0 flex-1 truncate font-medium">{{ t(`contribute.steps.${s.id}`) }}</span>
                <UBadge
                  v-if="s.level === 'noCode' || s.level === 'startHere'"
                  :color="levelColor(s.level)"
                  variant="subtle"
                  size="sm"
                  class="shrink-0"
                >
                  {{ t(`contribute.levels.${s.level}`) }}
                </UBadge>
              </a>
            </li>
          </ol>
        </aside>

        <!-- Timeline body -->
        <div class="space-y-8">
          <!-- New-contributor welcome + quick starts -->
          <div class="border border-(--ink) bg-(--ice) p-6 sm:p-8">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-hand-heart"
                class="size-5 text-(--signal)"
              />
              <h2 class="text-lg font-bold text-(--ink)">
                {{ t('contribute.welcome.title') }}
              </h2>
            </div>
            <i18n-t
              keypath="contribute.welcome.body"
              tag="p"
              scope="global"
              class="mt-2 text-sm text-(--ink2)"
            >
              <template #zero>
                <span class="font-medium text-(--ink)">{{ t('contribute.welcome.zero') }}</span>
              </template>
            </i18n-t>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <a
                v-for="q in quickStarts"
                :key="q.to"
                :href="q.to"
                class="group border-[1.5px] border-(--ink) bg-(--card) p-4 transition hover:-translate-y-0.5 hover:border-(--signal) hover:shadow-[4px_4px_0_var(--ink)]"
              >
                <div class="flex size-9 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) text-(--signal) ">
                  <UIcon
                    :name="q.icon"
                    class="size-4.5"
                  />
                </div>
                <p class="mt-3 flex items-center gap-1 text-sm font-semibold text-(--ink)">
                  {{ q.title }}
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-3.5 text-(--ink2) transition group-hover:translate-x-0.5 group-hover:text-(--signal)"
                  />
                </p>
                <p class="mt-1 text-xs text-(--ink2)">
                  {{ q.text }}
                </p>
              </a>
            </div>
          </div>

          <div class="relative space-y-8">
            <!-- vertical timeline rail (desktop) -->
            <span class="absolute bottom-6 left-5 top-6 hidden border-s-[1.5px] border-dashed border-(--signal) sm:block" />

            <section
              v-for="s in steps"
              :id="s.id"
              :key="s.id"
              class="relative scroll-mt-24 sm:pl-16"
            >
              <div class="absolute left-0 top-0 hidden size-11 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) text-(--signal) sm:flex">
                <UIcon
                  :name="s.icon"
                  class="size-5"
                />
              </div>
              <div class="border-[1.5px] border-(--ink) bg-(--card) p-6 sm:p-8">
                <div class="mb-1 flex items-center gap-2">
                  <p class="text-xs font-semibold uppercase tracking-widest text-(--signal)">
                    {{ t('contribute.stepLabel', { n: s.n }) }}
                  </p>
                  <UBadge
                    :color="levelColor(s.level)"
                    variant="subtle"
                    size="sm"
                  >
                    {{ t(`contribute.levels.${s.level}`) }}
                  </UBadge>
                </div>
                <h2 class="flex items-center gap-2 text-xl font-bold tracking-tight text-(--ink) sm:text-2xl">
                  <UIcon
                    :name="s.icon"
                    class="size-5 text-(--signal) sm:hidden"
                  />
                  {{ t(`contribute.steps.${s.id}`) }}
                </h2>

                <!-- ways -->
                <div
                  v-if="s.id === 'ways'"
                  :class="prose"
                >
                  <p>{{ t('contribute.ways.intro') }}</p>
                  <ul>
                    <li><strong>{{ t('contribute.ways.write.label') }}</strong> — {{ t('contribute.ways.write.text') }}</li>
                    <li><strong>{{ t('contribute.ways.translate.label') }}</strong> — {{ t('contribute.ways.translate.text') }}</li>
                    <li>
                      <strong>{{ t('contribute.ways.resource.label') }}</strong> —
                      <i18n-t
                        keypath="contribute.ways.resource.text"
                        scope="global"
                      >
                        <template #link>
                          <NuxtLink :to="localePath('/submit?kind=resource')">
                            {{ t('contribute.submitHere') }}
                          </NuxtLink>
                        </template>
                      </i18n-t>
                    </li>
                    <li><strong>{{ t('contribute.ways.code.label') }}</strong> — {{ t('contribute.ways.code.text') }}</li>
                  </ul>
                  <p>{{ t('contribute.ways.outro') }}</p>
                </div>

                <!-- setup -->
                <div
                  v-else-if="s.id === 'setup'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.setup.need"
                    tag="p"
                    scope="global"
                  >
                    <template #node>
                      <strong>Node.js 20+</strong>
                    </template>
                    <template #pnpm>
                      <strong>pnpm</strong>
                    </template>
                  </i18n-t>
                  <pre><code># 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/&lt;you&gt;/CRM-Analytics-Academy.git
cd CRM-Analytics-Academy

# 2. Install dependencies
pnpm install

# 3. Start the dev server → http://localhost:3000
pnpm dev</code></pre>
                  <p>{{ t('contribute.setup.checks') }}</p>
                  <pre><code>pnpm lint       # eslint
pnpm typecheck  # vue-tsc</code></pre>
                  <blockquote>
                    <i18n-t
                      keypath="contribute.setup.tip"
                      tag="p"
                      scope="global"
                    >
                      <template #label>
                        <strong>{{ t('contribute.setup.tipLabel') }}</strong>
                      </template>
                      <template #cmd>
                        <code>rm -rf .data && pnpm dev</code>
                      </template>
                    </i18n-t>
                  </blockquote>
                </div>

                <!-- lessons -->
                <div
                  v-else-if="s.id === 'lessons'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.lessons.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #path>
                      <code>content/&lt;locale&gt;/&lt;module&gt;/&lt;lesson&gt;.md</code>
                    </template>
                    <template #en>
                      <code>content/en/</code>
                    </template>
                  </i18n-t>
                  <pre><code>content/en/
  1.foundations/
    1.index.md
    2.data-and-datasets.md
  5.saql/
    1.index.md
    2.filter-and-group.md</code></pre>
                  <i18n-t
                    keypath="contribute.lessons.p2"
                    tag="p"
                    scope="global"
                  >
                    <template #example>
                      <code>content/en/5.saql/5.window-functions.md</code>
                    </template>
                    <template #h2>
                      <code>##</code>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.lessons.p3"
                    tag="p"
                    scope="global"
                  >
                    <template #edit>
                      <strong>{{ t('contribute.lessons.editLabel') }}</strong>
                    </template>
                  </i18n-t>
                </div>

                <!-- frontmatter -->
                <div
                  v-else-if="s.id === 'frontmatter'"
                  :class="prose"
                >
                  <p>{{ t('contribute.frontmatter.intro') }}</p>
                  <pre><code>---
title: SAQL Basics
description: A one-line summary used for SEO, the OG image, and AI search.
# Optional — embed a clip of a YouTube video at the top of the lesson:
video:
  id: dQw4w9WgXcQ
  start: 120
  end: 480
# Optional — model Q&amp;A rendered after the body (also emitted as FAQ schema):
interview:
  - q: "What does the load statement do in SAQL?"
    a: "It loads a dataset into the query as the starting stream."
---

# SAQL Basics

Your content here…</code></pre>
                  <i18n-t
                    keypath="contribute.frontmatter.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #title>
                      <code>title</code>
                    </template>
                    <template #description>
                      <code>description</code>
                    </template>
                    <template #video>
                      <code>video</code>
                    </template>
                    <template #interview>
                      <code>interview</code>
                    </template>
                    <template #module>
                      <strong>{{ t('contribute.frontmatter.module') }}</strong>
                    </template>
                    <template #nav>
                      <code>.navigation.yml</code>
                    </template>
                    <template #navTitle>
                      <code>title</code>
                    </template>
                    <template #icon>
                      <code>icon</code>
                    </template>
                    <template #llms>
                      <code>llms</code>
                    </template>
                    <template #config>
                      <code>nuxt.config.ts</code>
                    </template>
                  </i18n-t>
                </div>

                <!-- translations -->
                <div
                  v-else-if="s.id === 'translations'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.translations.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #languages>
                      <strong>{{ t('contribute.translations.languages') }}</strong>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.translations.p2"
                    tag="p"
                    scope="global"
                  >
                    <template #bold>
                      <strong>{{ t('contribute.translations.p2Bold') }}</strong>
                    </template>
                    <template #main>
                      <code>main</code>
                    </template>
                    <template #path>
                      <code>content/&lt;locale&gt;/…</code>
                    </template>
                  </i18n-t>
                  <pre><code>content/en/5.saql/1.index.md   →   automatically →   content/es/5.saql/1.index.md
                                                content/ar/5.saql/1.index.md
                                                … and nine more</code></pre>
                  <i18n-t
                    keypath="contribute.translations.p3"
                    tag="p"
                    scope="global"
                  >
                    <template #all>
                      <code>pnpm translate</code>
                    </template>
                    <template #subset>
                      <code>pnpm translate --locales=es,fr</code>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.translations.p4"
                    tag="p"
                    scope="global"
                  >
                    <template #bold>
                      <strong>{{ t('contribute.translations.p4Bold') }}</strong>
                    </template>
                    <template #english>
                      <em>{{ t('contribute.translations.english') }}</em>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.translations.p5"
                    tag="p"
                    scope="global"
                  >
                    <template #path>
                      <code>i18n/locales/&lt;lang&gt;.json</code>
                    </template>
                    <template #en>
                      <code>en.json</code>
                    </template>
                  </i18n-t>
                </div>

                <!-- showcase -->
                <div
                  v-else-if="s.id === 'showcase'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.showcase.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #link>
                      <NuxtLink :to="localePath('/submit')">
                        {{ t('contribute.showcase.link') }}
                      </NuxtLink>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.showcase.p2"
                    tag="p"
                    scope="global"
                  >
                    <template #working>
                      <strong>{{ t('contribute.showcase.working') }}</strong>
                    </template>
                  </i18n-t>
                  <pre><code>---
title: "Pipeline Health"
description: "One-screen read on coverage, slippage and win rate."
image: "/showcase/pipeline-health.png"
author: "Your Name"
authorUrl: "https://github.com/yourhandle"
domain: "Sales"              # Sales | Service | Marketing | Finance | …
difficulty: "Intermediate"   # Beginner | Intermediate | Advanced
datasets: ["Opportunity", "User"]
kpis:
  - name: "Win Rate"
    formula: "count() [IsWon] / count() [IsClosed]"
    note: "Closed-only denominator, or the rate drifts all quarter."
recipe:
  - step: "Build at opportunity grain"
    detail: "Account and Owner as lookups — never join line items here."
techniques: ["Dataflow", "Faceting", "Conditional Formatting"]
---

Your write-up goes here.</code></pre>
                  <i18n-t
                    keypath="contribute.showcase.p3"
                    tag="p"
                    scope="global"
                  >
                    <template #domain>
                      <code>domain</code>
                    </template>
                    <template #difficulty>
                      <code>difficulty</code>
                    </template>
                    <template #techniques>
                      <code>techniques</code>
                    </template>
                    <template #title>
                      <code>title</code>
                    </template>
                    <template #description>
                      <code>description</code>
                    </template>
                    <template #image>
                      <code>image</code>
                    </template>
                    <template #author>
                      <code>author</code>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.showcase.p4"
                    tag="p"
                    scope="global"
                  >
                    <template #bold>
                      <strong>{{ t('contribute.showcase.p4Bold') }}</strong>
                    </template>
                  </i18n-t>
                </div>

                <!-- submit -->
                <div
                  v-else-if="s.id === 'submit'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.submit.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #link>
                      <NuxtLink :to="localePath('/submit')">
                        {{ t('contribute.submitHere') }}
                      </NuxtLink>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.submit.p2"
                    tag="p"
                    scope="global"
                  >
                    <template #path>
                      <code>content/resources/</code>
                    </template>
                  </i18n-t>
                </div>

                <!-- code -->
                <div
                  v-else-if="s.id === 'code'"
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.code.p1"
                    tag="p"
                    scope="global"
                  >
                    <template #stack>
                      <strong>Nuxt 4 · Nuxt Content · Nuxt UI v4 · Tailwind CSS 4</strong>
                    </template>
                  </i18n-t>
                  <ul>
                    <i18n-t
                      keypath="contribute.code.content"
                      tag="li"
                      scope="global"
                    >
                      <template #path>
                        <code>content/</code>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.code.app"
                      tag="li"
                      scope="global"
                    >
                      <template #pages>
                        <code>app/pages/</code>
                      </template>
                      <template #components>
                        <code>app/components/</code>
                      </template>
                      <template #composables>
                        <code>app/composables/</code>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.code.raw"
                      tag="li"
                      scope="global"
                    >
                      <template #path>
                        <code>server/routes/raw/</code>
                      </template>
                    </i18n-t>
                  </ul>
                  <i18n-t
                    keypath="contribute.code.p2"
                    tag="p"
                    scope="global"
                  >
                    <template #cmd>
                      <code>pnpm lint --fix</code>
                    </template>
                  </i18n-t>
                </div>

                <!-- stack -->
                <div
                  v-else-if="s.id === 'stack'"
                  :class="prose"
                >
                  <p>{{ t('contribute.stack.intro') }}</p>
                  <ul>
                    <i18n-t
                      keypath="contribute.stack.nuxt"
                      tag="li"
                      scope="global"
                    >
                      <template #name>
                        <strong>Nuxt 4</strong>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.stack.content"
                      tag="li"
                      scope="global"
                    >
                      <template #name>
                        <strong>Nuxt Content 3</strong>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.stack.ui"
                      tag="li"
                      scope="global"
                    >
                      <template #ui>
                        <strong>Nuxt UI v4</strong>
                      </template>
                      <template #tailwind>
                        <strong>Tailwind CSS 4</strong>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.stack.i18n"
                      tag="li"
                      scope="global"
                    >
                      <template #name>
                        <strong>@nuxtjs/i18n</strong>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.stack.hosting"
                      tag="li"
                      scope="global"
                    >
                      <template #workers>
                        <strong>Cloudflare Workers</strong>
                      </template>
                      <template #actions>
                        <strong>GitHub Actions</strong>
                      </template>
                      <template #main>
                        <code>main</code>
                      </template>
                    </i18n-t>
                  </ul>
                  <i18n-t
                    keypath="contribute.stack.extras"
                    tag="p"
                    scope="global"
                  >
                    <template #og>
                      <code>nuxt-og-image</code>
                    </template>
                    <template #llms>
                      <code>nuxt-llms</code>
                    </template>
                  </i18n-t>
                  <i18n-t
                    keypath="contribute.stack.noDb"
                    tag="p"
                    scope="global"
                  >
                    <template #bold>
                      <strong>{{ t('contribute.stack.noDbBold') }}</strong>
                    </template>
                  </i18n-t>
                </div>

                <!-- pr -->
                <div
                  v-else-if="s.id === 'pr'"
                  :class="prose"
                >
                  <ol>
                    <i18n-t
                      keypath="contribute.pr.branch"
                      tag="li"
                      scope="global"
                    >
                      <template #bold>
                        <strong>{{ t('contribute.pr.branchBold') }}</strong>
                      </template>
                      <template #main>
                        <code>main</code>
                      </template>
                      <template #cmd>
                        <code>git checkout -b fix/typo-in-saql</code>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.pr.change"
                      tag="li"
                      scope="global"
                    >
                      <template #bold>
                        <strong>{{ t('contribute.pr.changeBold') }}</strong>
                      </template>
                      <template #cmd>
                        <code>pnpm dev</code>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.pr.verify"
                      tag="li"
                      scope="global"
                    >
                      <template #bold>
                        <strong>{{ t('contribute.pr.verifyBold') }}</strong>
                      </template>
                      <template #lint>
                        <code>pnpm lint</code>
                      </template>
                      <template #typecheck>
                        <code>pnpm typecheck</code>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.pr.commit"
                      tag="li"
                      scope="global"
                    >
                      <template #bold>
                        <strong>{{ t('contribute.pr.commitBold') }}</strong>
                      </template>
                      <template #push>
                        <strong>{{ t('contribute.pr.pushBold') }}</strong>
                      </template>
                    </i18n-t>
                    <i18n-t
                      keypath="contribute.pr.open"
                      tag="li"
                      scope="global"
                    >
                      <template #bold>
                        <strong>{{ t('contribute.pr.openBold') }}</strong>
                      </template>
                      <template #main>
                        <code>main</code>
                      </template>
                    </i18n-t>
                  </ol>
                  <p>{{ t('contribute.pr.after') }}</p>
                </div>

                <!-- help -->
                <div
                  v-else
                  :class="prose"
                >
                  <i18n-t
                    keypath="contribute.help"
                    tag="p"
                    scope="global"
                  >
                    <template #github>
                      <a
                        :href="repo"
                        target="_blank"
                        rel="noopener"
                      >GitHub</a>
                    </template>
                  </i18n-t>
                </div>
              </div>
            </section>
          </div>

          <PromoSlot
            placement="betweenSections"
            class="mx-auto max-w-3xl"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
