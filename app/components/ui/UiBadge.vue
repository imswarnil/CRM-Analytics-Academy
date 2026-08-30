<script setup lang="ts">
/**
 * Small status pill. `tone` is semantic rather than a colour name, so a badge
 * cannot be given a meaning the palette does not have: aqua is data, lime is
 * progress, amber is caution, coral is action, violet is metadata.
 */
withDefaults(defineProps<{
  tone?: 'brand' | 'data' | 'progress' | 'caution' | 'action' | 'meta' | 'neutral'
  size?: 'sm' | 'md'
  icon?: string
  /** Convenience alternative to the default slot. */
  label?: string
}>(), {
  tone: 'neutral',
  size: 'md'
})
</script>

<template>
  <span
    class="badge"
    :class="[`badge--${tone}`, `badge--${size}`]"
  >
    <Icon
      v-if="icon"
      :name="icon"
      class="badge__icon"
    />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  border-radius: var(--r-full);
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;
}

.badge--sm {
  padding: 0.3em 0.6em;
  font-size: var(--t-micro);
}

.badge--md {
  padding: 0.4em 0.75em;
  font-size: var(--t-tiny);
}

// Every tone is a soft fill with its own darker text, rather than a solid fill
// with white on it. At badge size a saturated block is loud enough to pull the
// eye off the heading beside it.
.badge--neutral {
  background: var(--c-bg-inset);
  color: var(--c-text-soft);
}

.badge--brand {
  background: var(--c-brand-soft);
  color: var(--c-brand-strong);
}

.badge--data {
  background: var(--aqua-soft);
  color: #06555E;
}

.badge--progress {
  background: var(--lime-soft);
  color: #0E5F2E;
}

.badge--caution {
  background: var(--amber-soft);
  color: #7A4B03;
}

.badge--action {
  background: var(--coral-soft);
  color: #8C1230;
}

.badge--meta {
  background: var(--violet-soft);
  color: #4A1D96;
}

.badge__icon {
  width: 1.1em;
  height: 1.1em;
}

// On a dark ground the soft fills go muddy, so tones become a tinted wash of
// their own hue with the light end of the ramp as text.
:root[data-theme="dark"] {
  .badge--neutral { background: var(--ink-80); color: var(--ink-20); }
  .badge--brand { background: var(--blue-80); color: var(--blue-20); }
  .badge--data { background: #05414A; color: var(--aqua-soft); }
  .badge--progress { background: #0B4B25; color: var(--lime-soft); }
  .badge--caution { background: #5C3803; color: var(--amber-soft); }
  .badge--action { background: #6B0F26; color: var(--coral-soft); }
  .badge--meta { background: #3B1A78; color: var(--violet-soft); }
}
</style>
