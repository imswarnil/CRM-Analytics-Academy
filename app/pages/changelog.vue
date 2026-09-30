<script setup lang="ts">
const title = 'Changelog'
const description = 'What changed on CRM Analytics Academy, release by release: new lessons and sections, dashboard builds, translations, site features and fixes.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

usePageSchema({ name: title, description, type: 'WebPage' })

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
    date: 'September 2026',
    tag: 'Redesign',
    title: 'A new look, and the Academy as the company in every build',
    summary: 'An original blue theme across the whole site, and a worked example that is finally the business behind the course.',
    color: 'primary',
    items: [
      'A new palette, type and component styling throughout, with a rebuilt curriculum page',
      'The example company is now CRM Analytics Academy itself: self-serve learners, team plans, six classroom centers, certification and implementation',
      'A new twenty-one-file warehouse — including classroom batches and enrollments — with the numbers in every lesson recomputed from it',
      'Seventeen builds, numbered consistently across the course',
      'Classroom training, team quotations and implementation requests, submitted on the site'
    ]
  },
  {
    date: 'September 2026',
    tag: 'Curriculum',
    title: 'Rewritten end to end, and reordered around the job',
    summary: 'Every lesson replaced. The course now teaches the platform in order and then uses it on a real go-to-market problem, on one company\u2019s data.',
    color: 'primary',
    items: [
      'Nineteen sections and 161 lessons, written from scratch \u2014 the product first, go-to-market engineering last',
      'SAQL, data visualization, interactions, bindings, dashboard JSON, APIs and Einstein Discovery each promoted to a section of their own',
      'Sixteen dashboard builds on Namilio, a fictional AI company, with published totals so you can check your own work',
      'Screen walkthroughs on every hands-on lesson: what to have open, where to click, and what is worth saying about it',
      'Showcase write-ups for all sixteen builds, with formulas, datasets and the recipe behind each',
      'HowTo and LearningResource structured data, so a build lesson can answer \u201chow do I build this\u201d directly',
      'Third-party training clips removed throughout \u2014 the curriculum is original work'
    ]
  },
  {
    date: 'August 2026',
    tag: 'Platform',
    title: 'Back to a pure static site',
    summary: 'We removed the entire backend. The Academy is now plain Markdown, prerendered and served from GitHub Pages — faster, simpler, and with nothing to sign into.',
    color: 'warning',
    items: [
      'Accounts, progress tracking, graded quizzes, comments, feedback, the guestbook, and certificates have all been retired',
      'No database and no analytics of your learning — every lesson is open to read with no sign-up',
      'Every page is prerendered at build time, so the site loads as fast as static HTML can',
      'Moved hosting from Vercel to GitHub Pages, deployed by GitHub Actions on every push',
      'The old data model is documented in dbms.md in the repository, for anyone curious'
    ]
  },
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
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-14 text-center sm:py-20">
        <p class="eyebrow mb-5">
          Sheet 12 / Changelog
        </p>
        <h1 class="mx-auto max-w-3xl bp-h1">
          What's <span class="text-gradient">new</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl bp-lead">
          Recent updates to the Academy. Follow along on
          <NuxtLink
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            class="text-(--signal) hover:underline"
          >GitHub</NuxtLink>.
        </p>
      </UContainer>
    </section>

    <UContainer class="max-w-3xl py-12 sm:py-16">
      <div class="space-y-10 border-s border-(--line) ps-6">
        <div
          v-for="(e, i) in entries"
          :key="i"
          class="relative"
        >
          <span class="absolute -start-[1.85rem] top-1 flex size-4 items-center justify-center border-2 border-(--signal) bg-(--card)" />
          <div class="mb-1 flex items-center gap-3">
            <span class="text-xs font-medium uppercase tracking-wide text-(--ink2)">{{ e.date }}</span>
            <UBadge
              :color="e.color"
              variant="subtle"
              size="sm"
            >
              {{ e.tag }}
            </UBadge>
          </div>
          <h2 class="text-lg font-bold text-(--ink)">
            {{ e.title }}
          </h2>
          <p class="mb-3 mt-0.5 text-sm text-(--ink2)">
            {{ e.summary }}
          </p>
          <ul class="space-y-1.5">
            <li
              v-for="item in e.items"
              :key="item"
              class="flex items-start gap-2 text-sm text-(--ink2)"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-(--signal)"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
