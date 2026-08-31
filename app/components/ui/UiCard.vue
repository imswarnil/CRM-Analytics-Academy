<script setup lang="ts">
/**
 * Bulma's .card with the two things this site needs on top: the whole card can
 * be the link target rather than just the heading inside it — a much larger
 * hit area, and the thing most card layouts get wrong — and an optional accent
 * rail down the inline-start edge, which is how a module, difficulty or lesson
 * type is signalled without spending a badge on it.
 */
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  target?: string
  accent?: 'brand' | 'data' | 'progress' | 'caution' | 'action' | 'meta'
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}>(), {
  padding: 'md'
})

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'div'))
const isLink = computed(() => Boolean(props.to || props.href))

const bindings = computed(() => {
  if (props.to) return { to: props.to, target: props.target }
  if (props.href) {
    return {
      href: props.href,
      target: props.target,
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined
    }
  }
  return {}
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="card ui-card"
    :class="[
      `ui-card--${padding}`,
      accent && `ui-card--accent ui-card--${accent}`,
      { 'ui-card--link': isLink || interactive }
    ]"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-card {
  position: relative;
  display: block;
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-1);
  transition:
    border-color var(--dur-mid) var(--ease-out),
    box-shadow var(--dur-mid) var(--ease-out),
    transform var(--dur-mid) var(--ease-spring);
}

.ui-card--sm { padding: var(--s-4); }
.ui-card--md { padding: var(--s-5); }
.ui-card--lg { padding: var(--s-6); }

.ui-card--link {
  cursor: pointer;

  &:hover {
    border-color: var(--c-line-strong);
    box-shadow: var(--shadow-3);
    transform: translateY(-3px);
  }

  // The whole card is the target, so the focus ring belongs on the whole card.
  &:focus-visible {
    outline: 2px solid var(--c-brand);
    outline-offset: 3px;
  }
}

// Drawn as a pseudo-element rather than a border so it does not shift the
// padding, and inset-inline so it flips for Arabic and Urdu.
.ui-card--accent::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  background: var(--card-accent, var(--c-brand));
}

.ui-card--brand { --card-accent: var(--c-brand); }
.ui-card--data { --card-accent: var(--aqua); }
.ui-card--progress { --card-accent: var(--lime); }
.ui-card--caution { --card-accent: var(--amber); }
.ui-card--action { --card-accent: var(--coral); }
.ui-card--meta { --card-accent: var(--violet); }
</style>
