<script setup lang="ts">
// Interview-prep Q&A as a study sheet: every question is shown with its model
// answer laid out as a Q/A card (no accordion — answers are always visible).
defineProps<{
  items: { q: string, a: string }[]
}>()
</script>

<template>
  <section
    v-if="items.length"
    class="not-prose my-10"
  >
    <div class="mb-5 is-flex is-align-items-center gap-2.5">
      <div class="is-flex size-9 is-align-items-center is-justify-content-center rounded-lg bg-primary/10">
        <Icon
          name="i-lucide-messages-square"
          class="size-5 has-text-primary"
        />
      </div>
      <div>
        <h2 class="is-size-6 has-text-weight-semibold has-text-weight-semibold">
          Interview questions
        </h2>
        <p class="is-size-7 has-text-grey">
          {{ items.length }} common questions with model answers — rehearse each one aloud.
        </p>
      </div>
    </div>

    <ol class="space-y-4">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="overflow-hidden rounded-xl border border-default has-background-white"
      >
        <div class="is-flex is-align-items-flex-start gap-3 border-b border-default bg-elevated/40 px-4 py-3">
          <span class="is-flex size-6 shrink-0 is-align-items-center is-justify-content-center rounded-full bg-primary is-size-7 has-text-weight-semibold text-inverted">
            {{ i + 1 }}
          </span>
          <p class="is-size-7 has-text-weight-semibold has-text-weight-semibold">
            {{ item.q }}
          </p>
        </div>
        <div class="is-flex is-align-items-flex-start gap-3 px-4 py-3">
          <span class="mt-0.5 is-flex size-6 shrink-0 is-align-items-center is-justify-content-center rounded-full bg-elevated text-[0.65rem] has-text-weight-semibold is-uppercase has-text-grey">
            A
          </span>
          <p class="is-size-7 has-text-grey">
            {{ item.a }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
