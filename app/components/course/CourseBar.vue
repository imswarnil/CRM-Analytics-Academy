<script setup lang="ts">
/**
 * The bar docked under the navbar on every lesson: where you are, how far
 * through you are, and what is next. Sticky because those questions recur
 * while scrolling, not only on arrival.
 */
const { current, previous, next, position, total, percent } = useCourse()
const localePath = useLocalePath()
</script>

<template>
  <div
    v-if="current"
    class="sticky top-(--ui-header-height) z-10 border-b border-default bg-default/85 backdrop-blur"
  >
    <UContainer class="flex h-12 items-center gap-4">
      <p class="hidden min-w-0 max-w-64 truncate text-sm font-medium text-highlighted sm:block">
        {{ current.moduleTitle }}
      </p>

      <span class="shrink-0 font-mono text-xs text-muted">
        <span class="font-bold text-primary">{{ position }}</span>
        <span class="opacity-50"> / </span>{{ total }}
      </span>

      <UProgress
        :model-value="percent"
        :max="100"
        size="sm"
        class="min-w-0 flex-1"
      />

      <div class="flex shrink-0 items-center gap-1">
        <UButton
          :to="previous ? localePath(previous.path) : undefined"
          :disabled="!previous"
          :title="previous?.title"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          label="Prev"
          class="max-sm:[&_span:last-child]:hidden"
        />
        <UButton
          :to="next ? localePath(next.path) : undefined"
          :disabled="!next"
          :title="next?.title"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          :label="next ? 'Next' : 'Done'"
          class="max-sm:[&_span:first-child]:hidden"
        />
      </div>
    </UContainer>
  </div>
</template>
