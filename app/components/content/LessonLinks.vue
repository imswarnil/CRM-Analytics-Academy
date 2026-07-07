<script setup lang="ts">
// MDC link cards. Usage:
// ::lesson-links
// ---
// items:
//   - label: Get your free Developer org
//     to: https://trailhead.salesforce.com/promo/orgs/analytics-de
//     icon: i-lucide-external-link
//     description: Spin up a practice environment.
// ---
// ::
defineProps<{
  items: { label: string, to: string, description?: string, icon?: string }[]
}>()

function external(to: string) {
  return /^https?:\/\//.test(to)
}
</script>

<template>
  <div class="not-prose my-8 grid gap-3 sm:grid-cols-2">
    <NuxtLink
      v-for="(link, i) in items"
      :key="i"
      :to="link.to"
      :target="external(link.to) ? '_blank' : undefined"
      :rel="external(link.to) ? 'noopener' : undefined"
      class="group flex items-center gap-3 rounded-xl border border-default bg-elevated/30 px-4 py-3 transition hover:border-primary/50 hover:bg-elevated"
    >
      <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <UIcon
          :name="link.icon || 'i-lucide-arrow-up-right'"
          class="size-5"
        />
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-highlighted group-hover:text-primary">
          {{ link.label }}
        </p>
        <p
          v-if="link.description"
          class="truncate text-xs text-muted"
        >
          {{ link.description }}
        </p>
      </div>
      <UIcon
        name="i-lucide-chevron-right"
        class="ml-auto size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </NuxtLink>
  </div>
</template>
