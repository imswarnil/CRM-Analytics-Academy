<script setup lang="ts">
/**
 * Bulma's .button, wrapped.
 *
 * The wrapper exists for three things Bulma's bare class does not give: it
 * picks the right element (<button>, <a>, <NuxtLink>) from the props, so a
 * "link that looks like a button" never needs a second component; it adds
 * rel="noopener" to anything opening a new tab; and it maps a small set of
 * intent names onto Bulma's colour/variant matrix so call sites say what they
 * mean rather than which Bulma modifiers to combine.
 */
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'link'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  target?: string
  icon?: string
  trailingIcon?: string
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

const VARIANT: Record<string, string> = {
  primary: 'is-primary',
  secondary: '',
  ghost: 'is-ghost',
  danger: 'is-danger',
  quiet: 'is-primary is-light',
  link: 'is-text'
}

const SIZE: Record<string, string> = {
  sm: 'is-small',
  md: '',
  lg: 'is-medium'
}

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))

const bindings = computed(() => {
  if (props.to) return { to: props.to, target: props.target }
  if (props.href) {
    return {
      href: props.href,
      target: props.target,
      // Without noopener the destination can reach back through window.opener
      // and navigate this tab.
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
    class="button"
    :class="[
      VARIANT[variant],
      SIZE[size],
      {
        'is-fullwidth': block,
        'is-loading': loading,
        'is-rounded': !square,
        'ui-btn--square': square
      }
    ]"
    :aria-disabled="disabled || undefined"
  >
    <span
      v-if="icon && !loading"
      class="icon"
    >
      <Icon :name="icon" />
    </span>
    <span v-if="$slots.default || label"><slot>{{ label }}</slot></span>
    <span
      v-if="trailingIcon && !loading"
      class="icon"
    >
      <Icon :name="trailingIcon" />
    </span>
  </component>
</template>

<style scoped lang="scss">
.button {
  font-weight: 600;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-mid) var(--ease-out),
    transform var(--dur-fast) var(--ease-spring);

  &:active:not([disabled]) { transform: scale(0.97); }
}

// Icon-only. Bulma's horizontal padding would otherwise collapse it to a
// sliver, and 2.5rem is a real touch target.
.ui-btn--square {
  padding-inline: 0;
  aspect-ratio: 1;
  width: 2.5rem;
  border-radius: var(--r-full);

  &.is-small { width: 2rem; }
  &.is-medium { width: 3rem; }
}

// The primary action on a view is the only thing that lifts toward the reader.
.is-primary:not(.is-light) {
  box-shadow: var(--shadow-brand);

  &:hover:not([disabled]) {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgb(1 118 211 / 0.36);
  }
}
</style>
