<script setup lang="ts">
/**
 * The mark: three ascending bars in an ink-bordered box — a bar chart as a
 * drafting symbol — beside the name.
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
    <span
      class="whitespace-nowrap text-[17px] font-extrabold leading-none tracking-[-0.02em]"
      :class="inverted ? 'text-white' : 'text-(--ink)'"
    >CRM Analytics <span :class="inverted ? 'text-(--glow)' : 'text-(--signal)'">Academy</span></span>
  </span>
</template>
