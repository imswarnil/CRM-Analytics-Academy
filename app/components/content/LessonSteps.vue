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
        class="pointer-events-none absolute bottom-4 left-4 top-4 border-l-[1.5px] border-dashed border-(--signal)"
        aria-hidden="true"
      />
      <li
        v-for="(step, i) in items"
        :key="i"
        class="relative flex gap-4"
      >
        <span class="relative z-10 flex size-8 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) font-mono text-sm font-bold leading-none text-white ring-4 ring-(--paper)">
          {{ i + 1 }}
        </span>
        <div class="pt-0.5">
          <h4 class="text-base font-semibold text-(--ink)">
            {{ step.title }}
          </h4>
          <p
            v-if="step.description"
            class="mt-1 text-sm leading-relaxed text-(--ink2)"
          >
            {{ step.description }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
