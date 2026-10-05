<script setup lang="ts">
/**
 * `::pro … ::` — a Pro-only section inside a lesson.
 *
 * In a published page this component never renders for a free lesson: the
 * build (scripts/gate-content.mjs) cuts every top-level `::pro` block out of
 * the public file and puts a `::pro-locked` placeholder in its place. It
 * renders in two places only: inside the unlocked body of a whole Pro lesson
 * (the reader is entitled, so the content shows), and in `pnpm dev` before
 * the gate has run, where the frame makes it obvious what will be locked.
 */
const { t } = useI18n()
</script>

<template>
  <div class="bp-pro-block relative my-8 border-[1.5px] border-(--ink) bg-(--card) px-5 pb-2 pt-6">
    <span class="absolute -top-3 start-4 flex items-center gap-1 border-[1.5px] border-(--ink) bg-(--ink) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.1em] text-(--paper)">
      <UIcon
        name="i-lucide-sparkles"
        class="size-3"
      />
      {{ t('pro.badge') }}
    </span>
    <slot />
  </div>
</template>
