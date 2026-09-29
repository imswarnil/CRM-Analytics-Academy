<script setup lang="ts">
/**
 * Two or three options side by side, each with what it is good and bad at.
 *
 * Most design decisions in this curriculum are trade-offs, not right answers —
 * inbound against outbound, a snapshot table against a live query, bins against
 * a gradient. Laying them out in columns forces the honest version: every option
 * gets a `cons` list, and the `verdict` line says when to pick it rather than
 * declaring a winner.
 *
 * ::compare-cols
 * ---
 * items:
 *   - title: Snapshot table
 *     pros: [Answers "as at March" correctly]
 *     cons: [Another job to run and monitor]
 *     verdict: Use when history must not move.
 * ---
 * ::
 */
defineProps<{
  items: {
    title: string
    subtitle?: string
    icon?: string
    pros?: string[]
    cons?: string[]
    verdict?: string
  }[]
}>()
</script>

<template>
  <div
    class="not-prose my-8 grid gap-4"
    :class="items.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'"
  >
    <div
      v-for="(o, i) in items"
      :key="i"
      class="flex flex-col overflow-hidden border-[1.5px] border-(--ink) bg-(--card)"
    >
      <div class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-3">
        <div class="flex items-center gap-2">
          <UIcon
            v-if="o.icon"
            :name="o.icon"
            class="size-4 shrink-0 text-(--signal)"
          />
          <h4 class="text-sm font-semibold text-(--ink)">
            {{ o.title }}
          </h4>
        </div>
        <p
          v-if="o.subtitle"
          class="mt-0.5 text-xs text-(--ink2)"
        >
          {{ o.subtitle }}
        </p>
      </div>

      <div class="flex-1 space-y-3 p-4">
        <ul
          v-if="o.pros?.length"
          class="space-y-1.5"
        >
          <li
            v-for="(p, j) in o.pros"
            :key="j"
            class="flex gap-2 text-sm leading-snug text-(--ink2)"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-4 shrink-0 text-(--signal)"
            />
            <span>{{ p }}</span>
          </li>
        </ul>
        <ul
          v-if="o.cons?.length"
          class="space-y-1.5"
        >
          <li
            v-for="(c, j) in o.cons"
            :key="j"
            class="flex gap-2 text-sm leading-snug text-(--ink2)"
          >
            <UIcon
              name="i-lucide-x"
              class="mt-0.5 size-4 shrink-0 text-(--ink)"
            />
            <span>{{ c }}</span>
          </li>
        </ul>
      </div>

      <p
        v-if="o.verdict"
        class="border-t border-dashed border-(--line) bg-(--ice) px-4 py-2.5 text-xs font-medium leading-snug text-(--ink2)"
      >
        {{ o.verdict }}
      </p>
    </div>
  </div>
</template>
