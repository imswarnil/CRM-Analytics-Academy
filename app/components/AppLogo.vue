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
  <span class="flex items-center gap-2.5">
    <!-- The mark: three rising bars, no tile — reads on light, dark and navy. -->
    <span
      class="flex h-[26px] w-[26px] flex-none items-end gap-[3px]"
      aria-hidden="true"
    >
      <span
        class="h-[42%] flex-1 rounded-[2px]"
        :class="inverted ? 'bg-blueprint-200' : 'bg-blueprint-300'"
      />
      <span class="h-[70%] flex-1 rounded-[2px] bg-blueprint-400" />
      <span
        class="h-full flex-1 rounded-[2px]"
        :class="inverted ? 'bg-white' : 'bg-blueprint-500'"
      />
    </span>
    <span
      class="whitespace-nowrap text-[18px] font-bold leading-none tracking-[-0.02em]"
      :class="inverted ? 'text-white' : 'text-(--ink)'"
    >CRM Analytics<span
      :class="[inverted ? 'text-blueprint-300' : 'text-(--signal)', compact ? 'max-[420px]:hidden' : '']"
    > Academy</span></span>
  </span>
</template>
