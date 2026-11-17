<script setup lang="ts">
/**
 * The mark: three ascending bars in an ink-bordered box — a bar chart as a
 * drafting symbol — beside the name.
 */
// `compact` drops the word "Academy" on narrow screens, where the header row
// would otherwise wrap or push the menu button off screen.
defineProps<{ inverted?: boolean, compact?: boolean }>()
</script>

<template>
  <span class="flex items-center gap-[11px]">
    <span
      class="flex size-[34px] flex-none items-end gap-[3px] rounded-[6px] p-[7px]"
      :class="inverted ? 'bg-white/10' : 'bg-blueprint-800'"
      aria-hidden="true"
    >
      <span class="h-[45%] flex-1 rounded-[1px] bg-blueprint-200" />
      <span class="h-[72%] flex-1 rounded-[1px] bg-blueprint-400" />
      <span class="h-full flex-1 rounded-[1px] bg-blueprint-500" />
    </span>
    <span
      class="whitespace-nowrap text-[17px] font-bold leading-none tracking-[-0.02em]"
      :class="inverted ? 'text-white' : 'text-(--ink)'"
    >CRM Analytics<span
      :class="[inverted ? 'text-blueprint-300' : 'text-(--signal)', compact ? 'max-[420px]:hidden' : '']"
    > Academy</span></span>
  </span>
</template>
