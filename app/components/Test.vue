<script setup lang="ts">
import { ref, computed } from 'vue'

const steps = [
  {
    id: 1,
    title: 'Module 1 · CRM Analytics Basics',
    short: 'Understand the platform & core concepts.',
    icon: 'i-lucide-compass',
    level: 'Beginner',
    duration: '45–60 mins',
    outcomes: [
      'What is Salesforce CRM Analytics and where it fits in the ecosystem',
      'Key terminology: lenses, dashboards, recipes, dataflows, apps',
      'Licensing & where users see Analytics in Salesforce',
      'Hands-on: Navigate a sample analytics app confidently'
    ],
    tags: ['Foundations', 'Terminology', 'Navigation']
  },
  {
    id: 2,
    title: 'Module 2 · Connecting Your Data',
    short: 'Learn how data actually reaches dashboards.',
    icon: 'i-lucide-database',
    level: 'Beginner–Intermediate',
    duration: '60–90 mins',
    outcomes: [
      'Understand data manager, connections, and syncs',
      'Compare Salesforce objects vs external data sources',
      'Intro to best practices for row count & performance',
      'Hands-on: Connect a Salesforce object and explore it'
    ],
    tags: ['Data Manager', 'Connections', 'Performance']
  },
  {
    id: 3,
    title: 'Module 3 · Data Prep with Recipes',
    short: 'Shape, clean & join data with clicks, not code.',
    icon: 'i-lucide-sparkles',
    level: 'Intermediate',
    duration: '90 mins',
    outcomes: [
      'Design recipe flows for reporting and dashboards',
      'Use joins, aggregations, filters, and formulas',
      'Handle incremental loads vs full refreshes',
      'Hands-on: Build a pipeline-ready dataset from raw objects'
    ],
    tags: ['Recipes', 'Transforms', 'Best Practices']
  },
  {
    id: 4,
    title: 'Module 4 · Exploring Data (Lenses)',
    short: 'Ask better questions, get better answers.',
    icon: 'i-lucide-search',
    level: 'Intermediate',
    duration: '60 mins',
    outcomes: [
      'Create lenses using groupings, filters, and measure types',
      'Choose the right visualization for the right story',
      'Use compare tables & time-based analysis',
      'Hands-on: Build lenses your sales team can actually use'
    ],
    tags: ['Lenses', 'Visuals', 'Compare Tables']
  },
  {
    id: 5,
    title: 'Module 5 · Building Dashboards',
    short: 'Turn insights into beautiful, interactive stories.',
    icon: 'i-lucide-layout-dashboard',
    level: 'Intermediate–Advanced',
    duration: '90–120 mins',
    outcomes: [
      'Design dashboard layouts for desktop & mobile',
      'Use filters, selectors, and interactions between widgets',
      'Apply UX patterns that feel like Salesforce core',
      'Hands-on: Build a revenue / pipeline dashboard end-to-end'
    ],
    tags: ['Dashboards', 'UX', 'Interactivity']
  },
  {
    id: 6,
    title: 'Module 6 · Actions, Security & Embedding',
    short: 'Make analytics live inside your business processes.',
    icon: 'i-lucide-bolt',
    level: 'Advanced',
    duration: '60–90 mins',
    outcomes: [
      'Add row-level security & inheritance from Salesforce',
      'Trigger Salesforce actions directly from dashboards',
      'Embed dashboards in Lightning pages & record pages',
      'Hands-on: Create a guided analytics experience for AEs'
    ],
    tags: ['Security', 'Actions', 'Embedding']
  },
  {
    id: 7,
    title: 'Module 7 · Going Pro: SAQL & Performance',
    short: 'Advanced tricks to make you the org’s analytics wizard.',
    icon: 'i-lucide-code-2',
    level: 'Advanced',
    duration: '120 mins',
    outcomes: [
      'Understand when to drop into SAQL and why',
      'Tune datasets and dashboards for large data volumes',
      'Design an analytics roadmap for your org',
      'Hands-on: Optimize an existing dashboard & document your design'
    ],
    tags: ['SAQL', 'Performance', 'Architecture']
  }
]

const activeIndex = ref(0)

const currentStep = computed(() => steps[activeIndex.value])
const totalSteps = steps.length
const isFirst = computed(() => activeIndex.value === 0)
const isLast = computed(() => activeIndex.value === totalSteps - 1)
const progressPercent = computed(
  () => ((activeIndex.value + 1) / totalSteps) * 100
)

const stepperItems = computed(() =>
  steps.map(step => ({
    label: step.title,
    description: step.short,
    icon: step.icon
  }))
)

function goTo(index: number) {
  activeIndex.value = index
}

function next() {
  if (!isLast.value) activeIndex.value++
}

function prev() {
  if (!isFirst.value) activeIndex.value--
}
</script>

<template>
  <section
    class="w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-18"
  >
    <div
      class="relative overflow-hidden rounded-xl border border-default bg-default/90 dark:bg-default/80 shadow-sm sm:shadow-md"
    >
      <!-- subtle top gradient -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--color-sf-400)] via-[var(--color-sf-600)] to-[var(--color-sf-400)] opacity-80"
      />

      <div class="relative p-4 sm:p-6 lg:p-8 space-y-8">
        <!-- Header -->
        <header class="space-y-2">
          <p class="text-xs font-semibold tracking-wide text-primary uppercase">
            Learning Path · CRM Analytics
          </p>
          <h2
            class="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-highlighted"
          >
            Your <span class="text-primary">7-Module</span> CRM Analytics
            Roadmap
          </h2>
          <p class="text-sm sm:text-base text-muted max-w-2xl">
            Move through each module step-by-step. Click a step in the roadmap
            to see exactly what you’ll learn, how long it takes, and what level
            it is.
          </p>
        </header>

        <!-- Stepper -->
        <div class="space-y-3">
          <UStepper
            v-model="activeIndex"
            :items="stepperItems"
            orientation="horizontal"
            class="w-full"
          >
            <template #item="{ item, index, state }">
              <button
                type="button"
                class="group flex-1 min-w-0 px-2 sm:px-3 py-2 text-left rounded-lg border transition-all duration-150
                       bg-muted/60 dark:bg-muted/40 border-default/70
                       hover:border-primary/70 hover:bg-primary/5
                       data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                :data-state="state"
                @click="goTo(index)"
              >
                <div class="flex items-start gap-2 sm:gap-3">
                  <span
                    class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md
                           bg-primary/10 text-primary text-xs font-semibold
                           group-data-[state=active]:bg-primary group-data-[state=active]:text-inverted"
                  >
                    {{ index + 1 }}
                  </span>
                  <div class="min-w-0 space-y-0.5">
                    <p
                      class="truncate text-xs sm:text-sm font-medium text-highlighted"
                    >
                      {{ item.label }}
                    </p>
                    <p
                      class="hidden sm:block text-[11px] sm:text-xs text-muted line-clamp-1"
                    >
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </button>
            </template>
          </UStepper>

          <!-- progress bar under stepper -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-1.5 rounded-full bg-muted/70 overflow-hidden">
              <div
                class="h-full rounded-full bg-primary transition-[width] duration-300"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            <span class="text-[11px] text-muted font-medium shrink-0">
              Step {{ activeIndex + 1 }} of {{ totalSteps }}
            </span>
          </div>
        </div>

        <!-- Content panel -->
        <div
          class="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start"
        >
          <!-- Main detail card -->
          <div
            class="rounded-lg border border-default bg-muted/80 dark:bg-muted/50 p-4 sm:p-5 space-y-3"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm sm:text-base font-semibold text-highlighted">
                {{ currentStep.title }}
              </h3>
              <span
                class="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] uppercase tracking-wide text-primary font-semibold"
              >
                <span class="i-lucide-route size-3.5" />
                Module {{ activeIndex + 1 }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-muted">
              {{ currentStep.short }}
            </p>

            <div class="pt-2 space-y-2">
              <p
                class="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wide"
              >
                What you’ll be able to do
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(outcome, i) in currentStep.outcomes"
                  :key="i"
                  class="flex gap-2 text-xs sm:text-sm text-default"
                >
                  <span
                    class="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <span class="i-lucide-check size-3" />
                  </span>
                  <span class="leading-snug">{{ outcome }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Meta / badges card -->
          <div
            class="rounded-lg border border-default bg-elevated/80 dark:bg-elevated/70 p-4 sm:p-5 space-y-4"
          >
            <div class="space-y-2">
              <p
                class="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wide"
              >
                Module overview
              </p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-primary/8 text-primary border border-primary/20 px-2 py-1"
                >
                  <span class="i-lucide-flag size-3.5" />
                  {{ currentStep.level }}
                </span>
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-muted text-muted border border-default px-2 py-1"
                >
                  <span class="i-lucide-timer size-3.5" />
                  {{ currentStep.duration }}
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <p
                class="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wide"
              >
                Focus areas
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in currentStep.tags"
                  :key="tag"
                  class="inline-flex items-center rounded-md bg-muted/80 dark:bg-muted/60 px-2 py-1 text-[11px] text-muted border border-default/60"
                >
                  <span class="i-lucide-sparkles size-3 mr-1" />
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="pt-1 border-t border-default/70 mt-2 space-y-2">
              <p class="text-[11px] text-muted">
                Pro tip: Take quick notes while you go. By the time you hit
                Module {{ totalSteps }}, you’ll already have a mini playbook for
                your org.
              </p>

              <!-- navigation buttons -->
              <div class="flex items-center justify-between gap-2 pt-1">
                <UButton
                  size="xs"
                  color="gray"
                  variant="ghost"
                  :disabled="isFirst"
                  @click="prev"
                >
                  <span class="i-lucide-arrow-left size-3 mr-1" />
                  Previous
                </UButton>

                <UButton
                  size="xs"
                  :color="isLast ? 'primary' : 'primary'"
                  :variant="isLast ? 'solid' : 'soft'"
                  @click="next"
                >
                  <template v-if="!isLast">
                    Next module
                    <span class="i-lucide-arrow-right size-3 ml-1" />
                  </template>
                  <template v-else>
                    Finish roadmap
                    <span class="i-lucide-party-popper size-3 ml-1" />
                  </template>
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confetti when last step is active -->
      <Transition name="confetti-fade">
        <div
          v-if="isLast"
          class="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span
            v-for="n in 36"
            :key="n"
            class="confetti-piece"
            :style="{
              left: `${(n * 97) % 100}%`,
              animationDelay: `${(n % 10) * 0.12}s`
            }"
          />
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.confetti-fade-enter-active,
.confetti-fade-leave-active {
  transition: opacity 0.5s ease-out;
}
.confetti-fade-enter-from,
.confetti-fade-leave-to {
  opacity: 0;
}

.confetti-piece {
  position: absolute;
  top: -8px;
  width: 6px;
  height: 14px;
  border-radius: 9999px;
  opacity: 0;
  background: var(--color-sf-400);
  animation: confetti-fall 2.4s ease-out infinite;
}

.confetti-piece:nth-child(3n) {
  background: #ffb75d;
}
.confetti-piece:nth-child(4n) {
  background: #4ad295;
}
.confetti-piece:nth-child(5n) {
  background: #f95f89;
}
.confetti-piece:nth-child(7n) {
  background: #8b9bff;
}

@keyframes confetti-fall {
  0% {
    transform: translate3d(0, 0, 0) rotateZ(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate3d(-25px, 260px, 0) rotateZ(340deg);
    opacity: 0;
  }
}
</style>
