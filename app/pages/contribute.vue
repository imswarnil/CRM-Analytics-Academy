<script setup lang="ts">
const title = 'Contribute — CRM Analytics Academy'
const description = 'Full contributor guide: set up locally, write and translate lessons, submit resources and projects, follow the code style, and open a pull request.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const localePath = useLocalePath()
const repo = 'https://github.com/imswarnil/CRM-Analytics-Academy'

const steps = [
  { id: 'ways', n: '01', label: 'Ways to contribute', icon: 'i-lucide-sparkles' },
  { id: 'setup', n: '02', label: 'Local setup', icon: 'i-lucide-terminal' },
  { id: 'lessons', n: '03', label: 'Writing a lesson', icon: 'i-lucide-pen-line' },
  { id: 'frontmatter', n: '04', label: 'Lesson frontmatter', icon: 'i-lucide-file-code-2' },
  { id: 'translations', n: '05', label: 'Translations', icon: 'i-lucide-languages' },
  { id: 'submit', n: '06', label: 'Submitting resources', icon: 'i-lucide-upload' },
  { id: 'code', n: '07', label: 'Code contributions', icon: 'i-lucide-code' },
  { id: 'stack', n: '08', label: 'Tech stack', icon: 'i-lucide-layers' },
  { id: 'database', n: '09', label: 'Database & migrations', icon: 'i-lucide-database' },
  { id: 'pr', n: '10', label: 'Opening a pull request', icon: 'i-lucide-git-pull-request' },
  { id: 'help', n: '11', label: 'Getting help', icon: 'i-lucide-life-buoy' }
]

// Prose classes shared by every timeline step body.
const prose = 'prose prose-neutral mt-4 max-w-none dark:prose-invert prose-a:text-primary prose-pre:border prose-pre:border-default prose-headings:scroll-mt-24'
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-git-pull-request"
            class="mr-1 size-4"
          />
          Contributor guide
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Help build the <span class="text-gradient">community</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Everything you need to add a lesson, translate content, share a resource or project, or improve the code.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton
            :to="repo"
            target="_blank"
            size="lg"
            icon="i-simple-icons-github"
            class="rounded-full font-semibold"
          >
            View on GitHub
          </UButton>
          <UButton
            :to="localePath('/submit/resource')"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
            class="rounded-full font-semibold"
          >
            Submit a resource
          </UButton>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
        <!-- Sticky stepper -->
        <aside class="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <p class="mb-4 text-xs font-semibold uppercase tracking-widest text-dimmed">
            The guide, step by step
          </p>
          <ol class="relative space-y-1">
            <!-- connecting line -->
            <span class="absolute bottom-3 left-3.5 top-3 w-px bg-default" />
            <li
              v-for="s in steps"
              :key="s.id"
            >
              <a
                :href="`#${s.id}`"
                class="group relative flex items-center gap-3 rounded-lg py-1.5 pl-0 pr-2 text-sm text-muted transition hover:text-primary"
              >
                <span class="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-default bg-elevated text-[11px] font-bold text-dimmed transition group-hover:border-primary group-hover:text-primary">
                  {{ Number(s.n) }}
                </span>
                <span class="font-medium">{{ s.label }}</span>
              </a>
            </li>
          </ol>
        </aside>

        <!-- Timeline body -->
        <div class="relative space-y-8">
          <!-- vertical timeline rail (desktop) -->
          <span class="absolute bottom-6 left-5 top-6 hidden w-px bg-gradient-to-b from-primary/40 via-default to-default sm:block" />

          <section
            v-for="s in steps"
            :id="s.id"
            :key="s.id"
            class="relative scroll-mt-24 sm:pl-16"
          >
            <div class="absolute left-0 top-0 hidden size-11 items-center justify-center rounded-full border border-default bg-elevated text-primary shadow-sm sm:flex">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </div>
            <div class="rounded-2xl border border-default bg-default/40 p-6 sm:p-8">
              <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Step {{ s.n }}
              </p>
              <h2 class="flex items-center gap-2 text-xl font-bold tracking-tight text-highlighted sm:text-2xl">
                <UIcon
                  :name="s.icon"
                  class="size-5 text-primary sm:hidden"
                />
                {{ s.label }}
              </h2>

              <!-- ways -->
              <div
                v-if="s.id === 'ways'"
                :class="prose"
              >
                <p>There are five main ways to help — pick whatever fits your time and skills:</p>
                <ul>
                  <li><strong>Write or fix a lesson</strong> — improve wording, fix errors, or add a whole new lesson (Markdown, no coding needed).</li>
                  <li><strong>Translate</strong> — bring a lesson or the UI into one of the site's languages.</li>
                  <li><strong>Submit a resource</strong> — share a great docs page, course, tool, or community. <NuxtLink :to="localePath('/submit/resource')">Submit here</NuxtLink> (an admin reviews it).</li>
                  <li><strong>Improve the code</strong> — fix a bug, refine the UI, or add a feature via a pull request.</li>
                </ul>
                <p>Resources and projects can be submitted right on the site once you <NuxtLink :to="localePath('/login')">sign in</NuxtLink> — no GitHub needed. The rest go through GitHub.</p>
              </div>

              <!-- setup -->
              <div
                v-else-if="s.id === 'setup'"
                :class="prose"
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
                :class="prose"
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
                :class="prose"
              >
                <p>Each lesson starts with a YAML frontmatter block:</p>
                <pre><code>---
title: SAQL Basics
description: A one-line summary used for SEO, the OG image, and AI search.
# Optional — members-only lesson (logged-out users see a teaser):
access: members
# Optional — an end-of-lesson quiz (answer is the 0-based option index):
quiz:
  - q: "What does the load statement do in SAQL?"
    options: ["Filters rows", "Loads a dataset", "Groups data"]
    answer: 1
---

# SAQL Basics

Your content here…</code></pre>
                <p><code>title</code> and <code>description</code> are required; <code>access</code> and <code>quiz</code> are optional. A new <strong>top-level module</strong> also needs a <code>.navigation.yml</code> (with <code>title</code> and an <code>icon</code>) and a new section in the <code>llms</code> config in <code>nuxt.config.ts</code>.</p>
              </div>

              <!-- translations -->
              <div
                v-else-if="s.id === 'translations'"
                :class="prose"
              >
                <p>The site ships in 8 languages: English (default), Spanish, French, German, Portuguese, Japanese, Chinese, and Hindi. To translate a lesson, copy it to the same path under the target locale and translate the text — keep code blocks, headings, and frontmatter keys unchanged:</p>
                <pre><code>content/en/5.saql/1.index.md   →   content/es/5.saql/1.index.md</code></pre>
                <p>UI strings live in <code>i18n/locales/&lt;lang&gt;.json</code>. If you add a new UI string, add it to <strong>all</strong> language files (there's no automatic fallback).</p>
              </div>

              <!-- submit -->
              <div
                v-else-if="s.id === 'submit'"
                :class="prose"
              >
                <p>This doesn't need GitHub — just sign in and share a helpful link (docs, course, tool, community). Go to <NuxtLink :to="localePath('/submit/resource')">Submit a resource</NuxtLink>, fill in the title, URL, and category. An admin reviews it, and once approved it appears on the <NuxtLink :to="localePath('/resources')">Resources</NuxtLink> page. Track the status (pending / approved) on your <NuxtLink :to="localePath('/dashboard')">dashboard</NuxtLink>.</p>
              </div>

              <!-- code -->
              <div
                v-else-if="s.id === 'code'"
                :class="prose"
              >
                <p>The stack is <strong>Nuxt 4 · Nuxt Content · Nuxt UI v4 · Tailwind CSS 4 · Supabase</strong>. Key folders:</p>
                <ul>
                  <li><code>content/</code> — the lessons (Markdown).</li>
                  <li><code>app/pages/</code>, <code>app/components/</code>, <code>app/composables/</code> — the app UI.</li>
                  <li><code>server/</code> — API routes (moderation) and the raw-markdown surface.</li>
                  <li><code>supabase/migrations/</code> — the database schema.</li>
                </ul>
                <p>Style rules are enforced by ESLint: no trailing commas, 1TBS braces, 2-space indent, and one interface member per line. Run <code>pnpm lint --fix</code> to auto-format. Match the surrounding code's conventions.</p>
              </div>

              <!-- stack -->
              <div
                v-else-if="s.id === 'stack'"
                :class="prose"
              >
                <p>The whole site is open source — here's what powers it:</p>
                <ul>
                  <li><strong>Nuxt 4</strong> (Vue 3 + Nitro) — the framework, SSR + prerendering</li>
                  <li><strong>Nuxt Content 3</strong> — lessons authored in Markdown, served from SQLite</li>
                  <li><strong>Nuxt UI v4</strong> + <strong>Tailwind CSS 4</strong> — components and styling</li>
                  <li><strong>Supabase</strong> (Postgres + Row-Level Security) — Google auth, profiles, progress, quizzes, comments, and resource submissions</li>
                  <li><strong>@nuxtjs/i18n</strong> — 8 languages</li>
                  <li><strong>Vercel</strong> — hosting and CI (auto-deploy on push to <code>main</code>)</li>
                </ul>
                <p>Also in the box: <code>nuxt-og-image</code> (social cards), <code>nuxt-llms</code> (machine-readable docs), and structured data for SEO.</p>
              </div>

              <!-- database -->
              <div
                v-else-if="s.id === 'database'"
                :class="prose"
              >
                <p>Schema changes go in <code>supabase/migrations/</code> as timestamped SQL files and are applied with the Supabase CLI:</p>
                <pre><code>supabase db push</code></pre>
                <p>Keep <code>types/database.types.ts</code> in sync so the typed client (<code>useDb()</code>) stays accurate. Every table uses Row-Level Security — new tables should ship with policies. If a SQL function forward-references a table created later in the file, add <code>set check_function_bodies = off;</code> at the top.</p>
              </div>

              <!-- pr -->
              <div
                v-else-if="s.id === 'pr'"
                :class="prose"
              >
                <ol>
                  <li><strong>Branch</strong> off <code>main</code>: <code>git checkout -b fix/typo-in-saql</code></li>
                  <li><strong>Make your change</strong> and preview it with <code>pnpm dev</code>.</li>
                  <li><strong>Verify</strong>: <code>pnpm lint</code> and <code>pnpm typecheck</code> both pass.</li>
                  <li><strong>Commit</strong> with a clear message and <strong>push</strong> to your fork.</li>
                  <li><strong>Open a PR</strong> against <code>main</code>, describing what changed and why.</li>
                </ol>
                <p>A maintainer will review, suggest tweaks if needed, and merge. Once merged, Vercel deploys it automatically.</p>
              </div>

              <!-- help -->
              <div
                v-else
                :class="prose"
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

          <AdUnit
            placement="betweenSections"
            class="mx-auto max-w-3xl"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
