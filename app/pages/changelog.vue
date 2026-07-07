<script setup lang="ts">
const title = 'Changelog — CRM Analytics Academy'
const description = 'Recent updates and improvements to CRM Analytics Academy.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

interface Entry {
  date: string
  tag: string
  title: string
  summary: string
  color: 'primary' | 'success' | 'warning' | 'neutral'
  items: string[]
}

const entries: Entry[] = [
  {
    date: 'July 2026',
    tag: 'Community',
    title: 'Resource voting & leaderboard',
    summary: 'The Resources page grew a community layer — vote for what helped you and see what rises to the top.',
    color: 'primary',
    items: [
      'Upvote any community resource (one vote per member) with a live count',
      'Switch between the list view and a votes-based leaderboard, filterable by type',
      'Every submission credits the member who shared it, with an optional LinkedIn link',
      'Two-column feedback & guestbook, plus a full admin data manager for every table'
    ]
  },
  {
    date: 'July 2026',
    tag: 'Curriculum',
    title: 'Video-led Foundations track',
    summary: 'We rebuilt the curriculum around short, focused video clips paired with hands-on steps.',
    color: 'success',
    items: [
      'CRM Analytics Foundations + Setup & User Provisioning, taught with clip-based lessons',
      'A fully custom video player — no YouTube branding, smooth play, and a “lesson complete” screen',
      'Interactive lesson steps, cards, and links; interview-question study sheets per section',
      'Members-only lessons with a soft sign-in gate'
    ]
  },
  {
    date: 'July 2026',
    tag: 'Exams',
    title: 'Secure exams & certificates',
    summary: 'Graded, tamper-resistant exams that actually gate progress — and a certificate when you finish.',
    color: 'warning',
    items: [
      'Server-side grading — answers are never sent to the browser',
      'A rotating question set per attempt (7 drawn from a larger pool), 85% to pass',
      'Per-skill performance breakdown on the results screen',
      'Shareable, downloadable certificate once every track is complete with a 75%+ average'
    ]
  },
  {
    date: 'July 2026',
    tag: 'Members',
    title: 'Learner dashboard & accounts',
    summary: 'Sign in with Google and track everything in one place.',
    color: 'primary',
    items: [
      'Google sign-in, member profiles, and a personal dashboard',
      'Progress-by-section rings, a skills chart, and average score at a glance',
      'Mark lessons complete (shared across languages) and per-lesson comments',
      'Submit resources for review and follow their status'
    ]
  },
  {
    date: 'July 2026',
    tag: 'Platform',
    title: 'Installable app, analytics & polish',
    summary: 'The site became installable, measurable, and a lot more playful.',
    color: 'neutral',
    items: [
      'Installable PWA with a service worker and offline support',
      'Analytics wired up: Google Analytics, Microsoft Clarity, and Vercel Analytics',
      'Refreshed theme (Space Grotesk + Plus Jakarta Sans), custom favicon, and breadcrumbs',
      'Guestbook with drawings, and a feedback inbox with threaded replies'
    ]
  },
  {
    date: 'June 2026',
    tag: 'Launch',
    title: 'CRM Analytics Academy goes live',
    summary: 'The first public release — a free, open-source curriculum built for the modern web.',
    color: 'neutral',
    items: [
      'Free, open-source CRM Analytics curriculum, localized across 8 languages',
      'Raw Markdown, llms.txt, and MCP tools so AI agents can read every lesson',
      'SEO, Open Graph images, and structured data throughout'
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
          <div class="mb-1 flex items-center gap-3">
            <span class="text-xs font-medium uppercase tracking-wide text-dimmed">{{ e.date }}</span>
            <UBadge
              :color="e.color"
              variant="subtle"
              size="sm"
            >
              {{ e.tag }}
            </UBadge>
          </div>
          <h2 class="text-lg font-bold text-highlighted">
            {{ e.title }}
          </h2>
          <p class="mb-3 mt-0.5 text-sm text-muted">
            {{ e.summary }}
          </p>
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
