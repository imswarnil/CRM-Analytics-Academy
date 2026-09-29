<script setup lang="ts">
/**
 * The brief for one dashboard, before a single widget is dragged.
 *
 * This is the component the GTM modules are built around, because the failure it
 * prevents is the expensive one. A dashboard that is technically correct and
 * answers nobody's question gets opened twice and abandoned — and no amount of
 * conditional formatting saves it. So every build lesson opens with the same
 * four answers: who opens this, what they are deciding, what they do differently
 * depending on the number, and how we will know it worked.
 *
 * `decision` is the field to labour over. If it cannot be filled in, the honest
 * output of the lesson is not to build the dashboard.
 *
 * ::build-brief
 * ---
 * dashboard: Pipeline Health
 * audience: AEs and their front-line managers
 * cadence: Monday morning, before forecast call
 * question: Is there enough qualified pipeline to make the quarter?
 * decision: Which three deals get the manager's time this week.
 * success: Forecast-call prep time drops; stuck-deal list is actioned weekly.
 * datasets: [opportunities.csv, opportunity_products.csv, reps.csv]
 * ---
 * ::
 */
defineProps<{
  dashboard: string
  audience: string
  question: string
  decision: string
  cadence?: string
  success?: string
  datasets?: string[]
  /** Anything explicitly out of scope — useful for keeping a build honest. */
  notInScope?: string[]
}>()
</script>

<template>
  <section class="not-prose my-8 overflow-hidden border-[1.5px] border-(--ink) bg-(--card)">
    <header class="flex flex-wrap items-center gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
      <UIcon
        name="i-lucide-clipboard-list"
        class="size-4 shrink-0 text-(--signal)"
      />
      <p class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--signal)">
        Build brief
      </p>
      <h4 class="ml-auto text-sm font-semibold text-(--ink)">
        {{ dashboard }}
      </h4>
    </header>

    <dl class="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
      <div>
        <dt class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">
          Who opens it
        </dt>
        <dd class="mt-1 text-sm leading-snug text-(--ink2)">
          {{ audience }}
        </dd>
      </div>
      <div v-if="cadence">
        <dt class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">
          When
        </dt>
        <dd class="mt-1 text-sm leading-snug text-(--ink2)">
          {{ cadence }}
        </dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">
          The question it answers
        </dt>
        <dd class="mt-1 text-sm leading-snug text-(--ink2)">
          {{ question }}
        </dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--signal)">
          <UIcon
            name="i-lucide-git-branch"
            class="size-3"
          />
          The decision it changes
        </dt>
        <dd class="mt-1 text-sm font-medium leading-snug text-(--ink)">
          {{ decision }}
        </dd>
      </div>
      <div v-if="success">
        <dt class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">
          How we know it worked
        </dt>
        <dd class="mt-1 text-sm leading-snug text-(--ink2)">
          {{ success }}
        </dd>
      </div>
      <div v-if="notInScope?.length">
        <dt class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">
          Deliberately not here
        </dt>
        <dd class="mt-1 text-sm leading-snug text-(--ink2)">
          {{ notInScope.join(' · ') }}
        </dd>
      </div>
    </dl>

    <footer
      v-if="datasets?.length"
      class="flex flex-wrap items-center gap-1.5 border-t border-dashed border-(--line) px-5 py-3"
    >
      <span class="mr-1 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)">Built on</span>
      <code
        v-for="(d, i) in datasets"
        :key="i"
        class="border-[1.5px] border-(--ink) bg-(--card) px-1.5 py-0.5 font-mono text-[11px] text-(--ink2)"
      >{{ d }}</code>
    </footer>
  </section>
</template>
