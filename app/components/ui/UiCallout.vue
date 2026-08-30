<script setup lang="ts">
/**
 * Callout / admonition. Backs the ::note and ::tip blocks in the lessons —
 * 82 uses across content/en today — plus warning and danger, which nothing
 * uses yet but which content authors will reach for eventually.
 */
const props = withDefaults(defineProps<{
  type?: 'note' | 'tip' | 'warning' | 'danger'
  title?: string
  icon?: string
}>(), {
  type: 'note'
})

const defaults = {
  note: { icon: 'i-lucide-info', label: 'Note' },
  tip: { icon: 'i-lucide-lightbulb', label: 'Tip' },
  warning: { icon: 'i-lucide-triangle-alert', label: 'Careful' },
  danger: { icon: 'i-lucide-octagon-alert', label: 'Warning' }
} as const

const resolved = computed(() => defaults[props.type])
</script>

<template>
  <aside
    class="callout"
    :class="`callout--${type}`"
  >
    <div class="callout__mark">
      <Icon
        :name="icon || resolved.icon"
        class="callout__icon"
      />
    </div>

    <div class="callout__body">
      <p class="callout__title">
        {{ title || resolved.label }}
      </p>
      <div class="callout__content">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.callout {
  display: flex;
  gap: var(--s-3);
  margin-block: var(--s-5);
  padding: var(--s-4);
  border-radius: var(--r-md);
  border: 1px solid var(--callout-line);
  // The tint is deliberately faint. A callout appearing every few hundred words
  // — and ::tip does, 70 times — has to sit inside the reading rhythm rather
  // than interrupt it, so the colour lives in the icon and the rule, not in a
  // saturated panel behind the text.
  background: var(--callout-bg);
}

.callout--note {
  --callout-bg: var(--c-brand-faint);
  --callout-line: var(--c-brand-soft);
  --callout-fg: var(--c-brand-text);
}

.callout--tip {
  --callout-bg: color-mix(in srgb, var(--aqua) 8%, transparent);
  --callout-line: color-mix(in srgb, var(--aqua) 28%, transparent);
  --callout-fg: #06555E;
}

.callout--warning {
  --callout-bg: color-mix(in srgb, var(--amber) 10%, transparent);
  --callout-line: color-mix(in srgb, var(--amber) 34%, transparent);
  --callout-fg: #7A4B03;
}

.callout--danger {
  --callout-bg: color-mix(in srgb, var(--coral) 9%, transparent);
  --callout-line: color-mix(in srgb, var(--coral) 32%, transparent);
  --callout-fg: #8C1230;
}

.callout__mark {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--r-sm);
  background: var(--c-bg-raised);
  border: 1px solid var(--callout-line);
  color: var(--callout-fg);
}

.callout__icon {
  width: 1rem;
  height: 1rem;
}

.callout__body {
  min-width: 0;
  flex: 1;
}

.callout__title {
  margin: 0 0 var(--s-1);
  font-size: var(--t-tiny);
  font-weight: 700;
  letter-spacing: var(--tr-wide);
  text-transform: uppercase;
  color: var(--callout-fg);
}

.callout__content {
  font-size: var(--t-small);
  line-height: 1.65;
  color: var(--c-text);

  :deep(> * + *) { margin-block-start: var(--s-3); }
  :deep(p:last-child) { margin-block-end: 0; }
}

:root[data-theme="dark"] {
  .callout--tip { --callout-fg: var(--aqua); }
  .callout--warning { --callout-fg: var(--amber); }
  .callout--danger { --callout-fg: var(--coral); }
}
</style>
