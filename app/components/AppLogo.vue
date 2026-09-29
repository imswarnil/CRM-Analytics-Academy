<script setup lang="ts">
/**
 * The mark: three ascending bars in an ink-bordered box — a bar chart as a
 * drafting symbol — beside the name and a drawing number.
 */
defineProps<{ inverted?: boolean }>()
</script>

<template>
  <span class="flex items-center gap-[11px]">
    <span
      class="flex size-[34px] flex-none items-end gap-[3px] border-[1.5px] p-[6px]"
      :class="inverted ? 'border-white/80 bg-white/5' : 'border-(--ink) bg-(--card)'"
      aria-hidden="true"
    >
      <span class="h-[30%] flex-1 bg-(--frost)" />
      <span class="h-[60%] flex-1 bg-(--tide)" />
      <span class="h-full flex-1 bg-(--signal)" />
    </span>
    <span class="flex flex-col text-start leading-none">
      <span
        class="whitespace-nowrap text-[17px] font-extrabold tracking-[-0.02em]"
        :class="inverted ? 'text-white' : 'text-(--ink)'"
      >CRM Analytics</span>
      <span
        class="mt-1 font-mono text-[9.5px] uppercase tracking-[.2em]"
        :class="inverted ? 'text-white/60' : 'text-(--ink2)'"
      >Academy / 001</span>
    </span>
  </span>
</template>
