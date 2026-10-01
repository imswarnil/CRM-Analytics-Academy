<script setup lang="ts">
/**
 * A Blueprint sheet header: graph paper, mono sheet number, big title — and,
 * on wide screens, a drafting sketch on the right that draws itself once on
 * load. The sketch is seeded by the title, so every page has its own.
 */
defineProps<{
  sheet: string
  title: string
  lead?: string
  center?: boolean
}>()
</script>

<template>
  <header class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
    <BpDrawing
      :seed="title"
      class="absolute top-1/2 hidden w-[22rem] -translate-y-1/2 opacity-60 xl:block"
      style="inset-inline-end: max(1rem, calc((100vw - var(--ui-container)) / 2 + 1rem))"
      :class="center ? 'opacity-30' : ''"
    />
    <div
      class="relative mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      :class="center ? 'text-center' : ''"
    >
      <p class="eyebrow">
        {{ sheet }}
      </p>
      <h1
        class="bp-h1 mt-4"
        :class="center ? '' : 'xl:max-w-[calc(100%_-_24rem)]'"
      >
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="bp-lead mt-5 max-w-2xl"
        :class="center ? 'mx-auto' : ''"
      >
        {{ lead }}
      </p>
      <slot />
    </div>
  </header>
</template>
