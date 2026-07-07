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
      class="group rounded-2xl border border-default bg-default p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div
        v-if="card.icon"
        class="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-inverted"
      >
        <UIcon
          :name="card.icon"
          class="size-5"
        />
      </div>
      <h4 class="font-semibold text-highlighted">
        {{ card.title }}
      </h4>
      <p
        v-if="card.description"
        class="mt-1 text-sm leading-relaxed text-muted"
      >
        {{ card.description }}
      </p>
    </div>
  </div>
</template>
