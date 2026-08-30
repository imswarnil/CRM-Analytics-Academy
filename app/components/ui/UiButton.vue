<script setup lang="ts">
/**
 * The one button. Renders as <button>, <a> or <NuxtLink> depending on what it
 * is given, so a "link that looks like a button" never needs a second
 * component — that split is where design systems start to drift.
 */
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  target?: string
  icon?: string
  trailingIcon?: string
  /** Convenience alternative to the default slot. */
  label?: string
  block?: boolean
  square?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button'
})

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))

const bindings = computed(() => {
  if (props.to) return { to: props.to, target: props.target }
  if (props.href) {
    return {
      href: props.href,
      target: props.target,
      // Any link opening a new tab gets noopener: without it the destination
      // can reach back through window.opener and navigate this tab.
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined
    }
  }
  return { type: props.type, disabled: props.disabled || props.loading }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--block': block, 'btn--square': square, 'is-loading': loading, 'is-disabled': disabled }
    ]"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || undefined"
  >
    <Icon
      v-if="loading"
      name="i-lucide-loader-circle"
      class="btn__spin"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      class="btn__icon"
    />
    <span
      v-if="$slots.default || label"
      class="btn__label"
    ><slot>{{ label }}</slot></span>
    <Icon
      v-if="trailingIcon && !loading"
      :name="trailingIcon"
      class="btn__icon"
    />
  </component>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  border-radius: var(--r-full);
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-mid) var(--ease-out),
    transform var(--dur-fast) var(--ease-spring);

  &:active:not(.is-disabled) {
    transform: scale(0.97);
  }

  &.is-disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// --- sizes. The min-height floors are touch targets, not decoration: 44px is
// the smallest reliably tappable control on a phone.
.btn--sm {
  min-height: 2rem;
  padding-inline: var(--s-3);
  font-size: var(--t-tiny);
}

.btn--md {
  min-height: 2.75rem;
  padding-inline: var(--s-5);
  font-size: var(--t-small);
}

.btn--lg {
  min-height: 3.25rem;
  padding-inline: var(--s-6);
  font-size: var(--t-body);
}

.btn--square {
  padding-inline: 0;
  aspect-ratio: 1;

  &.btn--sm { width: 2rem; }
  &.btn--md { width: 2.75rem; }
  &.btn--lg { width: 3.25rem; }
}

.btn--block {
  display: flex;
  width: 100%;
}

// --- variants
.btn--primary {
  background: var(--c-brand);
  color: var(--c-on-brand);
  box-shadow: var(--shadow-brand);

  &:hover:not(.is-disabled) {
    background: var(--c-brand-hover);
    // The lift is the signature interaction: the primary action on a view is
    // the only thing that moves toward the reader.
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgb(1 118 211 / 0.4);
  }
}

.btn--secondary {
  background: var(--c-bg-raised);
  border-color: var(--c-line);
  color: var(--c-text);
  box-shadow: var(--shadow-1);

  &:hover:not(.is-disabled) {
    border-color: var(--c-brand);
    color: var(--c-brand-text);
    box-shadow: var(--shadow-2);
  }
}

.btn--ghost {
  background: transparent;
  color: var(--c-text-soft);

  &:hover:not(.is-disabled) {
    background: var(--c-bg-inset);
    color: var(--c-text);
  }
}

.btn--quiet {
  background: var(--c-brand-faint);
  color: var(--c-brand-text);

  &:hover:not(.is-disabled) {
    background: var(--c-brand-soft);
  }
}

.btn--danger {
  background: var(--c-danger);
  color: #fff;

  &:hover:not(.is-disabled) {
    filter: brightness(0.92);
  }
}

.btn__icon {
  width: 1.15em;
  height: 1.15em;
  flex-shrink: 0;
}

.btn__label {
  // Keeps a long label from bursting the button on a narrow screen.
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn__spin {
  width: 1.15em;
  height: 1.15em;
  flex-shrink: 0;
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
</style>
