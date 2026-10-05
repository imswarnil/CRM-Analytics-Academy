<script setup lang="ts">
/**
 * The author chips under a lesson title: who wrote it, each linking to their
 * card on /instructors (English-only page, so the link is not localized).
 */
import type { LessonPerson } from '~/composables/useLessonCredits'

defineProps<{ authors: LessonPerson[] }>()
const { t } = useI18n()

const initials = (name: string) => name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
</script>

<template>
  <div
    v-if="authors.length"
    class="flex flex-wrap items-center gap-2"
  >
    <span class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
      {{ t('lesson.authors.label', authors.length) }}
    </span>
    <NuxtLink
      v-for="a in authors"
      :key="a.slug"
      :to="a.to"
      class="group flex items-center gap-2 border-[1.5px] border-(--ink) bg-(--card) py-0.5 pe-2.5 ps-0.5 hover:bg-(--ice)"
      :title="a.headline || a.name"
    >
      <img
        v-if="a.avatar"
        :src="a.avatar"
        :alt="''"
        width="22"
        height="22"
        loading="lazy"
        class="size-[22px] border border-(--ink) object-cover"
      >
      <span
        v-else
        class="grid size-[22px] place-items-center border border-(--ink) bg-(--ice) font-mono text-[9px] font-semibold text-(--ink)"
        aria-hidden="true"
      >{{ initials(a.name) }}</span>
      <span class="text-sm font-semibold text-(--ink) group-hover:text-(--signal)">{{ a.name }}</span>
    </NuxtLink>
  </div>
</template>
