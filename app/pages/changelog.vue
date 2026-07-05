<script setup lang="ts">
const title = 'Changelog — CRM Analytics Academy'
const description = 'Recent updates and improvements to CRM Analytics Academy.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

interface Entry {
  date: string
  tag: string
  color: 'primary' | 'success' | 'warning' | 'neutral'
  items: string[]
}

const entries: Entry[] = [
  {
    date: 'July 2026',
    tag: 'Members',
    color: 'primary',
    items: [
      'Google sign-in, member profiles, and a personal dashboard',
      'Mark lessons complete and track progress (now shared across languages)',
      'End-of-lesson quizzes with saved results',
      'Per-lesson comments'
    ]
  },
  {
    date: 'July 2026',
    tag: 'AI',
    color: 'success',
    items: [
      'CRM Analytics AI — a docs-grounded assistant (floating + inline per lesson)',
      'Bring your own key: Gemini, OpenAI, Anthropic Claude, Groq, or OpenRouter',
      'Clearer errors and a per-session free limit on the shared model'
    ]
  },
  {
    date: 'July 2026',
    tag: 'Community',
    color: 'warning',
    items: [
      'Submit resources with a custom icon — admin-approved, shown on the Resources page',
      'Admin moderation queue'
    ]
  },
  {
    date: 'June 2026',
    tag: 'Launch',
    color: 'neutral',
    items: [
      'Free, open-source CRM Analytics curriculum in 8 languages',
      'Raw Markdown, llms.txt, and MCP tools for AI agents',
      'SEO, OG images, and structured data'
    ]
  }
]
</script>

<template>
  <div>
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
            name="i-lucide-history"
            class="mr-1 size-4"
          />
          Changelog
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          What's <span class="text-gradient">new</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Recent updates to the Academy. Follow along on
          <NuxtLink
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            class="text-primary hover:underline"
          >GitHub</NuxtLink>.
        </p>
      </UContainer>
    </section>

    <UContainer class="max-w-3xl py-12 sm:py-16">
      <div class="space-y-10 border-s border-default ps-6">
        <div
          v-for="(e, i) in entries"
          :key="i"
          class="relative"
        >
          <span class="absolute -start-[1.85rem] top-1 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-default" />
          <div class="mb-2 flex items-center gap-3">
            <span class="text-sm font-semibold text-highlighted">{{ e.date }}</span>
            <UBadge
              :color="e.color"
              variant="subtle"
              size="sm"
            >
              {{ e.tag }}
            </UBadge>
          </div>
          <ul class="space-y-1.5">
            <li
              v-for="item in e.items"
              :key="item"
              class="flex items-start gap-2 text-sm text-toned"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-success"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
