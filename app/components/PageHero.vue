<script setup lang="ts">
/**
 * The masthead every non-docs page opens with. Ten pages were carrying a
 * copy of the same markup — an absolutely-positioned grid, a blurred colour
 * blob, a badge, a centred headline and a lead — which meant ten places to
 * change when the pattern changed, and ten chances to drift.
 *
 * The blur blob is gone. A soft radial glow was the single most out-of-place
 * thing left from the old design; the plot grid does the work now.
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
    class="phero bg-grid"
    :class="`phero--${size}`"
  >
    <div class="shell phero__inner">
      <UiBadge
        v-if="eyebrow"
        tone="brand"
        :icon="icon"
      >
        {{ eyebrow }}
      </UiBadge>

      <h1 class="phero__title text-balance">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>

      <p
        v-if="description || $slots.description"
        class="lead phero__desc text-pretty"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>

      <div
        v-if="$slots.actions"
        class="phero__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.phero {
  border-block-end: 1px solid var(--c-line);
}

.phero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-4);
  max-width: 48rem;
  text-align: center;
}

.phero--sm .phero__inner { padding-block: var(--s-7); }
.phero--md .phero__inner { padding-block: var(--s-8); }

.phero__title {
  margin: 0;
  font-size: var(--t-h1);
}

.phero__desc {
  margin: 0;
  max-width: 46ch;
}

.phero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--s-3);
  margin-block-start: var(--s-2);
}
</style>
