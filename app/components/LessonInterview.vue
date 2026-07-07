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
    <div class="mb-5 flex items-center gap-2.5">
      <div class="flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <UIcon
          name="i-lucide-messages-square"
          class="size-5 text-primary"
        />
      </div>
      <div>
        <h2 class="text-base font-semibold text-highlighted">
          Interview questions
        </h2>
        <p class="text-xs text-muted">
          {{ items.length }} common questions with model answers — rehearse each one aloud.
        </p>
      </div>
    </div>

    <ol class="space-y-4">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="overflow-hidden rounded-xl border border-default bg-default"
      >
        <div class="flex items-start gap-3 border-b border-default bg-elevated/40 px-4 py-3">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">
            {{ i + 1 }}
          </span>
          <p class="text-sm font-semibold text-highlighted">
            {{ item.q }}
          </p>
        </div>
        <div class="flex items-start gap-3 px-4 py-3">
          <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-[0.65rem] font-semibold uppercase text-muted">
            A
          </span>
          <p class="text-sm leading-relaxed text-muted">
            {{ item.a }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
