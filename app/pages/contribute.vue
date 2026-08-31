<script setup lang="ts">
const title = 'Contribute — CRM Analytics Academy'
const description = 'Full contributor guide: set up locally, write and translate lessons, suggest resources, follow the code style, and open a pull request.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const localePath = useLocalePath()
const repo = 'https://github.com/imswarnil/CRM-Analytics-Academy'

type Level = 'Start here' | 'No code' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Reference' | 'Anytime'

const steps: { id: string, n: string, label: string, icon: string, level: Level }[] = [
  { id: 'ways', n: '01', label: 'Ways to contribute', icon: 'i-lucide-sparkles', level: 'Start here' },
  { id: 'setup', n: '02', label: 'Local setup', icon: 'i-lucide-terminal', level: 'Beginner' },
  { id: 'lessons', n: '03', label: 'Writing a lesson', icon: 'i-lucide-pen-line', level: 'No code' },
  { id: 'frontmatter', n: '04', label: 'Lesson frontmatter', icon: 'i-lucide-file-code-2', level: 'No code' },
  { id: 'translations', n: '05', label: 'Translations', icon: 'i-lucide-languages', level: 'No code' },
  { id: 'showcase', n: '06', label: 'Submitting a dashboard', icon: 'i-lucide-layout-dashboard', level: 'No code' },
  { id: 'submit', n: '07', label: 'Suggesting resources', icon: 'i-lucide-upload', level: 'No code' },
  { id: 'code', n: '08', label: 'Code contributions', icon: 'i-lucide-code', level: 'Intermediate' },
  { id: 'stack', n: '09', label: 'Tech stack', icon: 'i-lucide-layers', level: 'Reference' },
  { id: 'pr', n: '10', label: 'Opening a pull request', icon: 'i-lucide-git-pull-request', level: 'Beginner' },
  { id: 'help', n: '11', label: 'Getting help', icon: 'i-lucide-life-buoy', level: 'Anytime' }
]

// Maps a contribution's difficulty label onto the badge tone vocabulary.
const levelTone = (l: Level): 'progress' | 'brand' | 'caution' | 'neutral' =>
  l === 'No code' ? 'progress' : l === 'Beginner' || l === 'Start here' ? 'brand' : l === 'Intermediate' || l === 'Advanced' ? 'caution' : 'neutral'

// The friendliest first contributions — no experience required.
const quickStarts = [
  { icon: 'i-lucide-type', title: 'Fix a typo', text: 'Hit “Edit this page” on any lesson — it opens a GitHub edit form. No setup at all.', to: '#lessons' },
  { icon: 'i-lucide-upload', title: 'Share a resource', text: 'Found a great link? Open an issue and we will add it to the library.', to: '#submit' },
  { icon: 'i-lucide-languages', title: 'Improve a translation', text: 'Translations are machine-generated. Fix a clumsy sentence in your language — you do not need to touch English.', to: '#translations' },
  { icon: 'i-lucide-layout-dashboard', title: 'Show your dashboard', text: 'Share what you built: a screenshot, the KPIs, and how you calculated them.', to: '#showcase' }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      eyebrow="Contributor guide"
      icon="i-lucide-git-pull-request"
    >
      <template #title>
        Help build the <span class="text-marker">community</span>
      </template>
      <template #description>
        Everything you need to add a lesson, translate content, suggest a resource, or improve the code.
      </template>
    </PageHero>

    <div class="container  py-12 sm:py-16">
      <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
        <!-- Sticky stepper -->
        <aside class="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <p class="mb-4 is-size-7 has-text-weight-semibold is-uppercase has-text-grey-light">
            The guide, step by step
          </p>
          <ol class="relative space-y-1">
            <!-- connecting line -->
            <span class="absolute bottom-3 left-3.5 top-3 w-px has-background-white" />
            <li
              v-for="s in steps"
              :key="s.id"
            >
              <a
                :href="`#${s.id}`"
                class="relative is-flex is-align-items-center gap-3 rounded-lg py-1.5 pl-0 pr-2 is-size-7 has-text-grey transition hover:text-primary"
              >
                <span class="relative z-10 is-flex size-7 shrink-0 is-align-items-center is-justify-content-center rounded-full border border-default bg-elevated has-text-weight-bold has-text-grey-light transition group-hover:border-primary group-hover:text-primary">
                  {{ Number(s.n) }}
                </span>
                <span class="min-w-0 flex-1 truncate has-text-weight-medium">{{ s.label }}</span>
                <UiBadge
                  v-if="s.level === 'No code' || s.level === 'Start here'"
                  :tone="levelTone(s.level)"
                  class="shrink-0"
                  size="sm"
                >
                  {{ s.level }}
                </UiBadge>
              </a>
            </li>
          </ol>
        </aside>

        <!-- Timeline body -->
        <div class="space-y-8">
          <!-- New-contributor welcome + quick starts -->
          <div class="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div class="is-flex is-align-items-center gap-2">
              <Icon
                name="i-lucide-hand-heart"
                class="size-5 has-text-primary"
              />
              <h2 class="title is-3 is-size-5  has-text-weight-semibold">
                New here? You're exactly who this is for.
              </h2>
            </div>
            <p class="mt-2 is-size-7 has-text-grey">
              You don't need to be a CRM Analytics expert or a developer to help. Pick a tiny first step below — most take
              a few minutes and need <span class="has-text-weight-medium text-default">zero code</span>. We review everything and are happy to guide you.
            </p>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <a
                v-for="q in quickStarts"
                :key="q.title"
                :href="q.to"
                class="rounded-xl border border-default has-background-white p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <div class="is-flex size-9 is-align-items-center is-justify-content-center rounded-lg bg-primary/10 has-text-primary ring-1 ring-primary/20">
                  <Icon
                    :name="q.icon"
                    class="size-4.5"
                  />
                </div>
                <p class="mt-3 is-flex is-align-items-center gap-1 is-size-7 has-text-weight-semibold has-text-weight-semibold">
                  {{ q.title }}
                  <Icon
                    name="i-lucide-arrow-right"
                    class="size-3.5 has-text-grey-light transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </p>
                <p class="mt-1 is-size-7 has-text-grey">
                  {{ q.text }}
                </p>
              </a>
            </div>
          </div>

          <div class="relative space-y-8">
            <!-- vertical timeline rail (desktop) -->
            <span class="absolute bottom-6 left-5 top-6 is-hidden w-px has-background-primary-light sm:block" />

            <section
              v-for="s in steps"
              :id="s.id"
              :key="s.id"
              class="relative scroll-mt-24 sm:pl-16"
            >
              <div class="absolute left-0 top-0 is-hidden size-11 is-align-items-center is-justify-content-center rounded-full border border-default bg-elevated has-text-primary shadow-sm sm:flex">
                <Icon
                  :name="s.icon"
                  class="size-5"
                />
              </div>
              <div class="rounded-2xl border border-default bg-default/40 p-6 sm:p-8">
                <div class="mb-1 is-flex is-align-items-center gap-2">
                  <p class="is-size-7 has-text-weight-semibold is-uppercase has-text-primary">
                    Step {{ s.n }}
                  </p>
                  <UiBadge
                    tone="neutral"
                    size="sm"
                  >
                    {{ s.level }}
                  </UiBadge>
                </div>
                <h2 class="title is-3 is-flex is-align-items-center gap-2 is-size-5  has-text-weight-semibold is-size-4-tablet">
                  <Icon
                    :name="s.icon"
                    class="size-5 has-text-primary sm:hidden"
                  />
                  {{ s.label }}
                </h2>

                <!-- ways -->
                <div
                  v-if="s.id === 'ways'"
                  class="content mt-4"
                >
                  <p>There are four main ways to help — pick whatever fits your time and skills:</p>
                  <ul>
                    <li><strong>Write or fix a lesson</strong> — improve wording, fix errors, or add a whole new lesson (Markdown, no coding needed).</li>
                    <li><strong>Translate</strong> — bring a lesson or the UI into one of the site's languages.</li>
                    <li><strong>Suggest a resource</strong> — share a great docs page, course, tool, or community. <NuxtLink :to="`${repo}/issues/new`">Open an issue</NuxtLink> and we'll add it.</li>
                    <li><strong>Improve the code</strong> — fix a bug, refine the UI, or add a feature via a pull request.</li>
                  </ul>
                  <p>Everything goes through GitHub — the site is fully static, so every change is a file in the repo.</p>
                </div>

                <!-- setup -->
                <div
                  v-else-if="s.id === 'setup'"
                  class="content mt-4"
                >
                  <p>You'll need <strong>Node.js 20+</strong> and <strong>pnpm</strong>. Then:</p>
                  <pre><code># 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/&lt;you&gt;/CRM-Analytics-Academy.git
cd CRM-Analytics-Academy

# 2. Install dependencies
pnpm install

# 3. Start the dev server → http://localhost:3000
pnpm dev</code></pre>
                  <p>Before committing, always run the two checks (there's no test runner):</p>
                  <pre><code>pnpm lint       # eslint
pnpm typecheck  # vue-tsc</code></pre>
                  <blockquote>
                    <p><strong>Tip:</strong> if the docs sidebar ever looks empty in dev, the local content database went stale. Fix it with <code>rm -rf .data && pnpm dev</code>.</p>
                  </blockquote>
                </div>

                <!-- lessons -->
                <div
                  v-else-if="s.id === 'lessons'"
                  class="content mt-4"
                >
                  <p>Lessons are plain Markdown under <code>content/&lt;locale&gt;/&lt;module&gt;/&lt;lesson&gt;.md</code>. English lives in <code>content/en/</code>. The number prefixes set the order:</p>
                  <pre><code>content/en/
  1.foundations/
    1.index.md
    2.data-and-datasets.md
  5.saql/
    1.index.md
    2.filter-and-group.md</code></pre>
                  <p>To add a lesson, create a new file with the next number in a module (e.g. <code>content/en/5.saql/5.window-functions.md</code>), start with a top-level heading, and write in Markdown. Use <code>##</code> for sections — they become the table of contents. Keep it practical and example-led.</p>
                  <p>To fix a small typo, just use the <strong>“Edit this page”</strong> link at the bottom of any lesson — it opens a GitHub edit form.</p>
                </div>

                <!-- frontmatter -->
                <div
                  v-else-if="s.id === 'frontmatter'"
                  class="content mt-4"
                >
                  <p>Each lesson starts with a YAML frontmatter block:</p>
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
                  <p><code>title</code> and <code>description</code> are required; <code>video</code> and <code>interview</code> are optional. A new <strong>top-level module</strong> also needs a <code>.navigation.yml</code> (with <code>title</code> and an <code>icon</code>) and a new section in the <code>llms</code> config in <code>nuxt.config.ts</code>.</p>
                </div>

                <!-- translations -->
                <div
                  v-else-if="s.id === 'translations'"
                  class="content mt-4"
                >
                  <p>The site ships in <strong>12 languages</strong>: English (default), Spanish, French, German, Portuguese, Japanese, Chinese, Hindi, Arabic, Russian, Bengali, and Urdu. Arabic and Urdu render right-to-left.</p>
                  <p><strong>You do not translate by hand.</strong> Write the lesson in English only. When it lands on <code>main</code>, a GitHub Action runs it through LibreTranslate and commits <code>content/&lt;locale&gt;/…</code> for all eleven other languages. Code blocks, SAQL, links, frontmatter keys and product names are protected and come through untouched.</p>
                  <pre><code>content/en/5.saql/1.index.md   →   automatically →   content/es/5.saql/1.index.md
                                                content/ar/5.saql/1.index.md
                                                … and nine more</code></pre>
                  <p>To run it yourself: <code>pnpm translate</code> (only changed files), or <code>pnpm translate --locales=es,fr</code>.</p>
                  <p><strong>Machine translation is a starting point, not the finish line.</strong> If a sentence reads badly in your language, edit that locale's file directly and open a pull request — the pipeline only overwrites a file when its <em>English</em> source changes, so your fix survives.</p>
                  <p>UI strings live in <code>i18n/locales/&lt;lang&gt;.json</code>. Add new strings to <code>en.json</code> only; the same run fills in the other eleven and leaves existing translations alone.</p>
                </div>

                <!-- showcase -->
                <div
                  v-else-if="s.id === 'showcase'"
                  class="content mt-4"
                >
                  <p>Built a CRM Analytics dashboard you're proud of? Add it to the <NuxtLink :to="localePath('/showcase')">Showcase</NuxtLink>. It's one markdown file in <code>content/showcase/</code> plus a screenshot in <code>public/showcase/</code> — no database, no account, the pull request review is the moderation.</p>
                  <p>What makes an entry worth reading is not the screenshot, it's the <strong>working out</strong>: which KPIs you put on it, the formula behind each one, and why you measured it that way. Say what went wrong too — the gotcha you hit is usually the most useful part.</p>
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
                  <p><code>domain</code>, <code>difficulty</code> and <code>techniques</code> drive the filters on the showcase page, so reuse existing values where they fit. Everything except <code>title</code>, <code>description</code>, <code>image</code> and <code>author</code> is optional.</p>
                  <p><strong>Sanitise the screenshot first.</strong> Blur or fake customer names, revenue figures and user names — the repository is public.</p>
                </div>

                <!-- submit -->
                <div
                  v-else-if="s.id === 'submit'"
                  class="content mt-4"
                >
                  <p>Found a helpful link (docs, course, tool, community)? <NuxtLink :to="`${repo}/issues/new`">Open an issue</NuxtLink> with the title, URL, and a one-line description. Once accepted it's added to the curated list in <code>app/pages/resources.vue</code> and appears on the <NuxtLink :to="localePath('/resources')">Resources</NuxtLink> page. Comfortable with a pull request? Add the entry yourself — it's a single line in that array.</p>
                </div>

                <!-- code -->
                <div
                  v-else-if="s.id === 'code'"
                  class="content mt-4"
                >
                  <p>The stack is <strong>Nuxt 4 · Nuxt Content · Nuxt UI v4 · Tailwind CSS 4</strong>. Key folders:</p>
                  <ul>
                    <li><code>content/</code> — the lessons (Markdown).</li>
                    <li><code>app/pages/</code>, <code>app/components/</code>, <code>app/composables/</code> — the app UI.</li>
                    <li><code>server/routes/raw/</code> — the raw-markdown surface for AI agents and crawlers.</li>
                  </ul>
                  <p>Style rules are enforced by ESLint: no trailing commas, 1TBS braces, 2-space indent, and one interface member per line. Run <code>pnpm lint --fix</code> to auto-format. Match the surrounding code's conventions.</p>
                </div>

                <!-- stack -->
                <div
                  v-else-if="s.id === 'stack'"
                  class="content mt-4"
                >
                  <p>The whole site is open source — here's what powers it:</p>
                  <ul>
                    <li><strong>Nuxt 4</strong> (Vue 3 + Nitro) — the framework, SSR + prerendering</li>
                    <li><strong>Nuxt Content 3</strong> — lessons authored in Markdown, served from SQLite</li>
                    <li><strong>Nuxt UI v4</strong> + <strong>Tailwind CSS 4</strong> — components and styling</li>
                    <li><strong>@nuxtjs/i18n</strong> — 8 languages</li>
                    <li><strong>GitHub Pages</strong> + <strong>GitHub Actions</strong> — hosting and CI (auto-deploy on push to <code>main</code>)</li>
                  </ul>
                  <p>Also in the box: <code>nuxt-og-image</code> (social cards), <code>nuxt-llms</code> (machine-readable docs), and structured data for SEO.</p>
                  <p>There is <strong>no database and no accounts</strong> — every page is prerendered at build time from Markdown. If you're curious about the data model the site used to run on, see <code>dbms.md</code> in the repo.</p>
                </div>

                <!-- pr -->
                <div
                  v-else-if="s.id === 'pr'"
                  class="content mt-4"
                >
                  <ol>
                    <li><strong>Branch</strong> off <code>main</code>: <code>git checkout -b fix/typo-in-saql</code></li>
                    <li><strong>Make your change</strong> and preview it with <code>pnpm dev</code>.</li>
                    <li><strong>Verify</strong>: <code>pnpm lint</code> and <code>pnpm typecheck</code> both pass.</li>
                    <li><strong>Commit</strong> with a clear message and <strong>push</strong> to your fork.</li>
                    <li><strong>Open a PR</strong> against <code>main</code>, describing what changed and why.</li>
                  </ol>
                  <p>A maintainer will review, suggest tweaks if needed, and merge. Once merged, the GitHub Actions workflow builds the site and publishes it to GitHub Pages automatically.</p>
                </div>

                <!-- help -->
                <div
                  v-else
                  class="content mt-4"
                >
                  <p>
                    Stuck or have an idea? Open an issue or a discussion on <a
                      :href="repo"
                      target="_blank"
                      rel="noopener"
                    >GitHub</a>. First-time contributors are very welcome — no contribution is too small.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <AdUnit
            placement="betweenSections"
            class="mx-auto max-w-3xl"
          />
        </div>
      </div>
    </div>
  </div>
</template>
