<script setup lang="ts">
// MDC timeline/stepper. Usage in markdown:
// ::lesson-steps
// ---
// items:
//   - title: Sign up
//     description: Create your free org.
//   - title: Verify
//     description: Confirm your email.
// ---
// ::
defineProps<{
  items: { title: string, description?: string }[]
}>()
</script>

<template>
  <div class="not-prose my-8">
    <ol class="relative space-y-6 border-l-2 border-dashed border-primary/30 pl-8">
      <li
        v-for="(step, i) in items"
        :key="i"
        class="relative"
      >
        <span class="absolute -left-[2.6rem] flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-inverted shadow-sm ring-4 ring-default">
          {{ i + 1 }}
        </span>
        <h4 class="text-base font-semibold text-highlighted">
          {{ step.title }}
        </h4>
        <p
          v-if="step.description"
          class="mt-1 text-sm leading-relaxed text-muted"
        >
          {{ step.description }}
        </p>
      </li>
    </ol>
  </div>
</template>
