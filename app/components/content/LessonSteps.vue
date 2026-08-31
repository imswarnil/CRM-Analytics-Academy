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
        class="relative is-flex gap-4"
      >
        <span class="relative z-10 is-flex size-8 shrink-0 is-align-items-center is-justify-content-center rounded-full bg-primary is-size-7 has-text-weight-bold leading-none text-inverted shadow-sm ring-4 ring-default">
          {{ i + 1 }}
        </span>
        <div class="pt-0.5">
          <h4 class="is-size-6 has-text-weight-semibold has-text-weight-semibold">
            {{ step.title }}
          </h4>
          <p
            v-if="step.description"
            class="mt-1 is-size-7 has-text-grey"
          >
            {{ step.description }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
