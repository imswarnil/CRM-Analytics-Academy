<script setup lang="ts">
/**
 * Surface primitive. Becomes a link when given `to`, which is what makes the
 * whole card clickable rather than just the heading inside it — a much larger
 * target, and the thing most card layouts get wrong.
 *
 * `accent` paints a hairline down the inline-start edge. It is how a module,
 * a difficulty or a lesson type is signalled without spending a badge on it.
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
    class="card"
    :class="[
      `card--pad-${padding}`,
      accent && `card--accent card--${accent}`,
      { 'card--interactive': isLink || interactive }
    ]"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.card {
  position: relative;
  display: block;
  background: var(--c-bg-raised);
  border: 1px solid var(--c-line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-1);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition:
    border-color var(--dur-mid) var(--ease-out),
    box-shadow var(--dur-mid) var(--ease-out),
    transform var(--dur-mid) var(--ease-spring);
}

.card--pad-sm { padding: var(--s-4); }
.card--pad-md { padding: var(--s-5); }
.card--pad-lg { padding: var(--s-6); }

.card--interactive {
  cursor: pointer;

  &:hover {
    border-color: var(--c-line-strong);
    box-shadow: var(--shadow-3);
    transform: translateY(-3px);
  }

  // The whole card is the target, so the ring belongs on the whole card.
  &:focus-visible {
    outline: 2px solid var(--c-brand);
    outline-offset: 3px;
  }
}

// The accent rail. Drawn as a pseudo-element rather than a border so it does
// not shift the padding, and inset-inline so it flips for Arabic and Urdu.
.card--accent::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  background: var(--card-accent, var(--c-brand));
}

.card--brand { --card-accent: var(--c-brand); }
.card--data { --card-accent: var(--aqua); }
.card--progress { --card-accent: var(--lime); }
.card--caution { --card-accent: var(--amber); }
.card--action { --card-accent: var(--coral); }
.card--meta { --card-accent: var(--violet); }
</style>
