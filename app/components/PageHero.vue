<script setup lang="ts">
/**
 * Bulma's .hero, used as the masthead on every non-docs page.
 *
 * Nine pages were each carrying their own copy of the same markup, which meant
 * nine places to change when the pattern changed and nine chances to drift.
 */
withDefaults(defineProps<{
  eyebrow?: string
  icon?: string
  title?: string
  description?: string
  size?: 'sm' | 'md'
}>(), {
  size: 'md'
})
</script>

<template>
  <section
    class="hero"
    :class="size === 'md' ? 'is-medium' : 'is-small'"
  >
    <div class="hero-body has-text-centered">
      <div class="container">
        <UiBadge
          v-if="eyebrow"
          tone="brand"
          :icon="icon"
          class="mb-4"
        >
          {{ eyebrow }}
        </UiBadge>

        <h1 class="title is-2">
          <slot name="title">
            {{ title }}
          </slot>
        </h1>

        <p
          v-if="description || $slots.description"
          class="subtitle is-5 has-text-grey mx-auto"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </p>

        <div
          v-if="$slots.actions"
          class="buttons is-centered mt-5"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The lead sets better at a measure than at full container width. */
.subtitle {
  max-width: 46ch;
}
</style>
