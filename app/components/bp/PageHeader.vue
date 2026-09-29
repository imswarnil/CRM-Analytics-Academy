<script setup lang="ts">
/** A Blueprint sheet header: graph paper, mono sheet number, big title. */
defineProps<{
  sheet: string
  title: string
  lead?: string
  center?: boolean
}>()
</script>

<template>
  <header class="graph-paper border-b-[1.5px] border-(--ink)">
    <div
      class="mx-auto max-w-(--ui-container) px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      :class="center ? 'text-center' : ''"
    >
      <p class="eyebrow">
        {{ sheet }}
      </p>
      <h1 class="bp-h1 mt-4">
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
