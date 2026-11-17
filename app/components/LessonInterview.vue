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
    class="not-prose my-12"
  >
    <div class="mb-5 flex items-end justify-between gap-4 border-b border-(--line) pb-3">
      <div>
        <p class="eyebrow">
          Interview prep
        </p>
        <h2 class="bp-h3 mt-1 text-(--ink)">
          Interview questions
        </h2>
      </div>
      <p class="max-w-xs text-end font-medium text-[11px] text-(--ink2)">
        {{ items.length }} questions · rehearse each aloud
      </p>
    </div>

    <ol class="space-y-4">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="border border-(--line) bg-(--card) rounded-2xl"
      >
        <div class="flex items-start gap-3 border-b border-dashed border-(--line) px-4 py-3">
          <span class="flex size-7 shrink-0 items-center justify-center border border-(--line) bg-(--signal) font-mono text-xs font-semibold text-white">
            Q{{ i + 1 }}
          </span>
          <p class="pt-0.5 text-sm font-bold text-(--ink)">
            {{ item.q }}
          </p>
        </div>
        <div class="flex items-start gap-3 px-4 py-3">
          <span class="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-(--line) bg-(--ice) font-mono text-xs font-semibold text-(--ink)">
            A
          </span>
          <p class="text-sm leading-relaxed text-(--ink2)">
            {{ item.a }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
