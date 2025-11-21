<!-- components/CourseStepperHero.vue -->
<script setup lang="ts">
const steps = [
  {
    title: 'Welcome & Setup',
    description: 'Understand CRM Analytics, org prerequisites, and enable the features.',
    icon: 'i-lucide-house'
  },
  {
    title: 'Connect Your Data',
    description: 'Create dataflows, connect Salesforce objects, and prepare datasets.',
    icon: 'i-lucide-database'
  },
  {
    title: 'Build Dashboards',
    description: 'Design KPI tiles, charts, and filters for real-world use cases.',
    icon: 'i-lucide-layout-dashboard'
  },
  {
    title: 'Share & Embed',
    description: 'Share with users, embed in Lightning pages, and manage access.',
    icon: 'i-lucide-share-2'
  }
]

const activeStep = ref(0)
</script>

<template>
  <section class="w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] items-start">
      <!-- LEFT: CONTENT -->
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-[color:var(--ui-border-muted)] bg-[color:var(--ui-bg-muted)]/70 px-3 py-1 text-xs font-medium text-[color:var(--ui-text-muted)] shadow-sm">
          <span class="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--ui-primary)]/10 text-[color:var(--ui-primary)]">
            <span class="iconify i-lucide-line-chart text-[0.9rem]" aria-hidden="true" />
          </span>
          <span>Salesforce CRM Analytics Academy</span>
        </div>

        <div class="space-y-3">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[color:var(--ui-text)]">
            Learn
            <span class="text-[color:var(--ui-primary)]">
              CRM Analytics
            </span>
            with real dashboards.
          </h1>
          <p class="text-base sm:text-lg text-[color:var(--ui-text-muted)] max-w-xl">
            Hands-on learning paths, production-style dashboards, and org-ready examples.
            Start from zero and ship dashboards your AEs and leaders will actually use.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton
            size="lg"
            icon="i-lucide-rocket"
            trailing-icon="i-lucide-arrow-right"
            color="primary"
          >
            Start learning
          </UButton>

          <UButton
            size="lg"
            variant="soft"
            color="primary"
            icon="i-lucide-list-checks"
          >
            View full curriculum
          </UButton>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 max-w-xl pt-4 border-t border-[color:var(--ui-border-muted)] mt-4">
          <div class="space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-[color:var(--ui-text-muted)]">
              Real org examples
            </p>
            <p class="text-lg font-semibold text-[color:var(--ui-text)]">
              20+ dashboards
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-[color:var(--ui-text-muted)]">
              Learning style
            </p>
            <p class="text-lg font-semibold text-[color:var(--ui-text)]">
              Project-based
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-[color:var(--ui-text-muted)]">
              Level
            </p>
            <p class="text-lg font-semibold text-[color:var(--ui-text)]">
              Beginner → Pro
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT: STEPPER CARD -->
      <aside
        class="relative rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-bg-muted)]/95 shadow-[0_18px_45px_rgba(3,45,96,0.12)] overflow-hidden"
      >
        <!-- subtle gradient / stripe top -->
        <div class="h-1.5 w-full bg-gradient-to-r from-[color:var(--ui-primary)] via-sky-400 to-indigo-500 dark:from-sky-400 dark:via-sky-300 dark:to-indigo-300" />

        <div class="p-4 sm:p-5">
          <header class="mb-4">
            <p class="text-xs font-medium tracking-wide uppercase text-[color:var(--ui-text-muted)]">
              Guided path
            </p>
            <h2 class="mt-1 text-base sm:text-lg font-semibold text-[color:var(--ui-text)]">
              Module 1 · Getting started with CRM Analytics
            </h2>
            <p class="mt-1 text-xs sm:text-sm text-[color:var(--ui-text-soft)]">
              Follow these steps in order. Each step maps to a hands-on lesson in the academy.
            </p>
          </header>

          <div class="relative">
            <UStepper
              v-model="activeStep"
              :items="steps"
              orientation="vertical"
              class="ui-stepper"
            />
          </div>
        </div>

        <!-- bottom meta -->
        <footer class="flex items-center justify-between border-t border-[color:var(--ui-border-muted)] bg-[color:var(--ui-bg)]/70 px-4 py-2.5 text-[11px] sm:text-xs text-[color:var(--ui-text-muted)]">
          <span>Step {{ activeStep + 1 }} of {{ steps.length }}</span>
          <span class="inline-flex items-center gap-1">
            <span class="iconify i-lucide-badge-check text-[color:var(--ui-primary)]" aria-hidden="true" />
            Org-ready curriculum
          </span>
        </footer>
      </aside>
    </div>
  </section>
</template>
