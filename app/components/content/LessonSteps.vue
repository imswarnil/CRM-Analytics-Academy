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
    <ol class="relative space-y-6">
      <!-- Vertical rail runs through the centre of the number badges -->
      <span
        class="pointer-events-none absolute bottom-4 left-4 top-4 border-l-2 border-dashed border-primary/30"
        aria-hidden="true"
      />
      <li
        v-for="(step, i) in items"
        :key="i"
        class="relative flex gap-4"
      >
        <span class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold leading-none text-inverted shadow-sm ring-4 ring-default">
          {{ i + 1 }}
        </span>
        <div class="pt-0.5">
          <h4 class="text-base font-semibold text-highlighted">
            {{ step.title }}
          </h4>
          <p
            v-if="step.description"
            class="mt-1 text-sm leading-relaxed text-muted"
          >
            {{ step.description }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
