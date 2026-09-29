<script setup lang="ts">
// MDC card grid. Usage:
// ::lesson-cards
// ---
// items:
//   - title: Data layer
//     icon: i-lucide-database
//     description: Sync, recipes, datasets.
// ---
// ::
defineProps<{
  items: { title: string, description?: string, icon?: string }[]
  columns?: number
}>()
</script>

<template>
  <div
    class="not-prose my-8 grid gap-4"
    :class="(columns ?? 2) >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'"
  >
    <div
      v-for="(card, i) in items"
      :key="i"
      class="group border-[1.5px] border-(--ink) bg-(--card) p-5 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--signal) hover:shadow-[4px_4px_0_var(--ink)]"
    >
      <div
        v-if="card.icon"
        class="mb-3 flex size-10 items-center justify-center bg-(--ice) text-(--signal) transition group-hover:bg-(--signal) group-hover:text-white"
      >
        <UIcon
          :name="card.icon"
          class="size-5"
        />
      </div>
      <h4 class="font-semibold text-(--ink)">
        {{ card.title }}
      </h4>
      <p
        v-if="card.description"
        class="mt-1 text-sm leading-relaxed text-(--ink2)"
      >
        {{ card.description }}
      </p>
    </div>
  </div>
</template>
