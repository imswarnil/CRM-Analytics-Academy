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
      class="rounded-2xl border border-default has-background-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div
        v-if="card.icon"
        class="mb-3 is-flex size-10 is-align-items-center is-justify-content-center rounded-xl bg-primary/10 has-text-primary transition group-hover:bg-primary group-hover:text-inverted"
      >
        <Icon
          :name="card.icon"
          class="size-5"
        />
      </div>
      <h4 class="has-text-weight-semibold has-text-weight-semibold">
        {{ card.title }}
      </h4>
      <p
        v-if="card.description"
        class="mt-1 is-size-7 has-text-grey"
      >
        {{ card.description }}
      </p>
    </div>
  </div>
</template>
