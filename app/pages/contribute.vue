<script setup lang="ts">
const title = 'Contribute — CRM Analytics Academy'
const description = 'How to contribute to CRM Analytics Academy — fix a typo, write a lesson, add a translation, or share a dataset. A step-by-step guide.'

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const repo = 'https://github.com/crm-analytics-academy/crm-analytics-academy'

const ways = [
  { icon: 'i-lucide-spell-check', title: 'Fix a typo or error', desc: 'Spotted a mistake? Use the "Edit this page" link on any lesson to open a quick pull request.' },
  { icon: 'i-lucide-book-plus', title: 'Write a lesson', desc: 'Add a new lesson or improve an existing one. Lessons are plain Markdown under content/<locale>/.' },
  { icon: 'i-lucide-languages', title: 'Add a translation', desc: 'Translate a lesson or the UI strings into your language — every locale lives in its own folder.' },
  { icon: 'i-lucide-database', title: 'Share a dataset', desc: 'Contribute a clean sample CSV others can practice with under public/sample-data/.' }
]

const steps = [
  { t: 'Fork the repo', d: 'Click Fork on GitHub to get your own copy.' },
  { t: 'Make your change', d: 'Edit Markdown in content/, or components/pages in app/. Run pnpm dev to preview.' },
  { t: 'Open a pull request', d: 'Push your branch and open a PR. Describe what you changed and why.' },
  { t: 'Review & merge', d: 'A maintainer reviews it, suggests tweaks if needed, and merges. You are now a contributor!' }
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
            name="i-lucide-git-pull-request"
            class="mr-1 size-4"
          />
          Contribute
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Built by the <span class="text-gradient">community</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Every lesson, translation, and dataset here came from someone like you. Here's how to add yours.
        </p>
        <UButton
          :to="repo"
          target="_blank"
          size="xl"
          icon="i-simple-icons-github"
          class="mt-8 rounded-full font-semibold"
        >
          Open the repo
        </UButton>
      </UContainer>
    </section>

    <UContainer class="py-14 sm:py-20">
      <h2 class="mb-10 text-center text-3xl font-bold tracking-tight text-highlighted">
        Ways to help
      </h2>
      <div class="grid gap-6 sm:grid-cols-2">
        <div
          v-for="w in ways"
          :key="w.title"
          class="rounded-2xl border border-default bg-default p-6"
        >
          <div class="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UIcon
              :name="w.icon"
              class="size-5"
            />
          </div>
          <h3 class="font-semibold text-highlighted">
            {{ w.title }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ w.desc }}
          </p>
        </div>
      </div>

      <h2 class="mb-10 mt-20 text-center text-3xl font-bold tracking-tight text-highlighted">
        The contribution flow
      </h2>
      <div class="mx-auto max-w-2xl space-y-4">
        <div
          v-for="(s, i) in steps"
          :key="s.t"
          class="flex gap-4 rounded-2xl border border-default bg-default p-5"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-inverted">{{ i + 1 }}</span>
          <div>
            <h3 class="font-semibold text-highlighted">
              {{ s.t }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ s.d }}
            </p>
          </div>
        </div>
      </div>

      <div class="mx-auto mt-12 max-w-2xl rounded-2xl border border-default bg-muted/30 p-6">
        <h3 class="flex items-center gap-2 font-semibold text-highlighted">
          <UIcon
            name="i-lucide-folder-tree"
            class="size-4 text-primary"
          />
          Where things live
        </h3>
        <ul class="mt-3 space-y-1.5 font-mono text-[13px] text-muted">
          <li><span class="text-primary">content/&lt;locale&gt;/</span> — lessons (Markdown), one folder per language</li>
          <li><span class="text-primary">i18n/locales/</span> — UI translation strings (JSON)</li>
          <li><span class="text-primary">public/sample-data/</span> — sample datasets (CSV)</li>
          <li><span class="text-primary">app/</span> — pages, components, and styling</li>
        </ul>
      </div>

      <div class="mt-12 text-center">
        <UButton
          :to="`${repo}/issues`"
          target="_blank"
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-list-checks"
          class="rounded-full font-semibold"
        >
          Browse good first issues
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
