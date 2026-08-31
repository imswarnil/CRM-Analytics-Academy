<script setup lang="ts">
/**
 * Bulma's .tag. `tone` is semantic rather than a colour name, so a badge
 * cannot be given a meaning the palette does not have: aqua is data, lime is
 * progress, amber is caution, coral is action, violet is metadata.
 */
withDefaults(defineProps<{
  tone?: 'brand' | 'data' | 'progress' | 'caution' | 'action' | 'meta' | 'neutral'
  size?: 'sm' | 'md'
  icon?: string
  label?: string
}>(), {
  tone: 'neutral',
  size: 'md'
})

const TONE: Record<string, string> = {
  brand: 'is-primary is-light',
  data: 'is-info is-light',
  progress: 'is-primary is-light',
  caution: 'is-warning is-light',
  action: 'is-danger is-light',
  meta: 'ui-tag--meta',
  neutral: ''
}
</script>

<template>
  <span
    class="tag ui-tag is-rounded"
    :class="[TONE[tone], size === 'sm' && 'is-small', size === 'md' && 'is-medium']"
  >
    <span
      v-if="icon"
      class="icon is-small"
    >
      <Icon :name="icon" />
    </span>
    <span><slot>{{ label }}</slot></span>
  </span>
</template>

<style scoped lang="scss">
.ui-tag {
  gap: 0.35em;
  font-weight: 650;
}

// Bulma has no violet in its palette, so the metadata tone is defined here
// rather than bent out of one of the semantic colours.
.ui-tag--meta {
  background: var(--violet-soft);
  color: #4A1D96;
}

[data-theme="dark"] .ui-tag--meta {
  background: #3B1A78;
  color: var(--violet-soft);
}
</style>
