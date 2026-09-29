<script setup lang="ts">
/**
 * The hero visual: a preview of the dashboard the course ends on.
 *
 * This replaced an embedded YouTube player pointed at a third-party CRM
 * Analytics training recording. That video was the spine of the old
 * curriculum, and its clips were removed from every lesson when the course was
 * rewritten as original work — leaving the home page introducing the site with
 * somebody else's material, which contradicted the one claim the site most
 * needs to make.
 *
 * So the hero now shows what the course produces instead of what it used to
 * quote: Build 16's executive board, the nine numbers that survive from the
 * ~120 widgets across the other fifteen builds. It is drawn rather than
 * screenshotted, so it stays sharp at any density, themes with the site, and
 * needs no image pipeline.
 *
 * Decorative: the real numbers live in the lessons. Hidden from assistive tech,
 * with the heading and CTA beside it carrying the meaning.
 */
const { t } = useI18n()
const localePath = useLocalePath()

// The Academy's own numbers: the training business the go-to-market builds
// model — seats sold, corporate pipeline, completion and center utilisation.
const kpis = [
  { label: 'Bookings (QTD)', value: '$486K', delta: '+12.4%', up: true, good: true },
  { label: 'Enrollments', value: '1,284', delta: '+9.1%', up: true, good: true },
  { label: 'Team pipeline', value: '$2.3M', delta: '−4.2%', up: false, good: false },
  { label: 'Completion rate', value: '71%', delta: '+3pt', up: true, good: true }
]

// Heights are a fixed sequence rather than random, so the render is
// deterministic — a prerendered page and its hydrated counterpart must agree.
const waterfall = [38, 62, 46, 74, 55, 83, 68, 96]
const funnel = [96, 74, 58, 41, 27]
</script>

<template>
  <div
    class="rounded-2xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-hidden="true"
  >
    <!-- Toolbar -->
    <div class="mb-4 flex items-center justify-between gap-3 border-b border-muted pb-3">
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-primary" />
        <span class="text-sm font-semibold text-highlighted">Academy — Revenue Board</span>
      </div>
      <div class="hidden items-center gap-1.5 sm:flex">
        <span
          v-for="chip in ['Q3 FY26', 'All centers']"
          :key="chip"
          class="rounded-md border border-default px-2 py-0.5 text-[11px] text-muted"
        >{{ chip }}</span>
      </div>
    </div>

    <!-- The four tiles -->
    <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <div
        v-for="k in kpis"
        :key="k.label"
        class="rounded-lg border border-muted bg-elevated/40 p-3"
      >
        <p class="truncate text-[11px] text-dimmed">
          {{ k.label }}
        </p>
        <p class="mt-1 text-lg font-semibold tracking-tight text-highlighted">
          {{ k.value }}
        </p>
        <p
          class="mt-0.5 flex items-center gap-1 text-[11px]"
          :class="k.good ? 'text-success' : 'text-error'"
        >
          <!-- Direction is carried by the arrow, not by the colour alone —
               the same rule the dashboard-design section insists on. -->
          <UIcon
            :name="k.up ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
            class="size-3 shrink-0"
          />
          {{ k.delta }}
        </p>
      </div>
    </div>

    <!-- Two charts: the waterfall that explains the first tile, and the
         funnel that explains the third. -->
    <div class="mt-3 grid gap-2.5 sm:grid-cols-2">
      <div class="rounded-lg border border-muted p-3">
        <p class="mb-2 text-[11px] text-dimmed">
          Bookings by month
        </p>
        <div
          class="flex items-end gap-1.5"
          style="height: 5rem"
        >
          <span
            v-for="(h, i) in waterfall"
            :key="i"
            class="flex-1 rounded-sm"
            :class="i % 3 === 2 ? 'bg-secondary' : 'bg-primary'"
            :style="{ height: `${h}%` }"
          />
        </div>
      </div>

      <div class="rounded-lg border border-muted p-3">
        <p class="mb-2 text-[11px] text-dimmed">
          Enrollment funnel
        </p>
        <div
          class="flex flex-col justify-between gap-1 py-0.5"
          style="height: 5rem"
        >
          <span
            v-for="(w, i) in funnel"
            :key="i"
            class="h-2.5 rounded-sm bg-primary"
            :class="i === 0 ? 'opacity-100' : i === 1 ? 'opacity-80' : i === 2 ? 'opacity-60' : i === 3 ? 'opacity-45' : 'opacity-30'"
            :style="{ width: `${w}%` }"
          />
        </div>
      </div>
    </div>

    <NuxtLink
      :to="localePath('/revops-analytics/the-executive-gtm-board')"
      class="mt-3 flex items-center justify-between rounded-lg bg-elevated/60 px-3 py-2 text-xs text-muted transition-colors hover:text-highlighted"
    >
      <span>{{ t('hero.boardCaption') }}</span>
      <UIcon
        name="i-lucide-arrow-right"
        class="size-3.5 shrink-0"
      />
    </NuxtLink>
  </div>
</template>
