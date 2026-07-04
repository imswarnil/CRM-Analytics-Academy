<script setup lang="ts">
defineProps<{ locked: boolean }>()

const localePath = useLocalePath()
const route = useRoute()
</script>

<template>
  <div class="relative">
    <div :class="locked ? 'max-h-[26rem] overflow-hidden' : ''">
      <slot />
    </div>

    <div
      v-if="locked"
      class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-default via-default/95 to-transparent pt-24 pb-2 text-center"
    >
      <div class="not-prose max-w-md rounded-2xl border border-default bg-elevated/60 px-6 py-6 shadow-lg backdrop-blur">
        <div class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
          <UIcon
            name="i-lucide-lock"
            class="size-5 text-primary"
          />
        </div>
        <h3 class="text-base font-semibold text-highlighted">
          This is a members-only lesson
        </h3>
        <p class="mt-1.5 text-sm text-muted">
          Sign in free to read the full lesson, track your progress, and take the quiz.
        </p>
        <UButton
          :to="localePath('/login') + `?redirect=${encodeURIComponent(route.fullPath)}`"
          color="primary"
          icon="i-lucide-log-in"
          class="mt-4"
        >
          Sign in to continue
        </UButton>
      </div>
    </div>
  </div>
</template>
