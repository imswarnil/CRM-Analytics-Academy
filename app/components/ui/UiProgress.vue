<script setup lang="ts">
/**
 * Progress, as a bar or a ring. Both live here because they are the same idea
 * and the same props — splitting them would mean two places to keep the
 * rounding and the a11y wiring in step.
 *
 * This is the most-repeated element of the learner product: module completion,
 * course completion, the dashboard rings. It is deliberately expressive.
 */
const props = withDefaults(defineProps<{
  value: number
  max?: number
  variant?: 'bar' | 'ring'
  size?: number
  tone?: 'brand' | 'progress' | 'data'
  label?: string
  showValue?: boolean
}>(), {
  max: 100,
  variant: 'bar',
  size: 72,
  tone: 'progress'
})

// Clamped, because a caller computing "12 of 10 lessons" should render a full
// ring rather than a ring that has wrapped around past its own start.
const pct = computed(() => {
  if (!props.max) return 0
  return Math.max(0, Math.min(100, (props.value / props.max) * 100))
})

const RADIUS = 42
const CIRC = 2 * Math.PI * RADIUS
const dash = computed(() => `${(pct.value / 100) * CIRC} ${CIRC}`)
</script>

<template>
  <div
    class="progress"
    :class="[`progress--${variant}`, `progress--${tone}`]"
    role="progressbar"
    :aria-valuenow="Math.round(pct)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <template v-if="variant === 'bar'">
      <div
        v-if="label || showValue"
        class="progress__head"
      >
        <span
          v-if="label"
          class="progress__label"
        >{{ label }}</span>
        <span
          v-if="showValue"
          class="progress__value"
        >{{ Math.round(pct) }}%</span>
      </div>
      <div class="progress__track">
        <div
          class="progress__fill"
          :style="{ width: `${pct}%` }"
        />
      </div>
    </template>

    <template v-else>
      <svg
        class="progress__ring"
        :width="size"
        :height="size"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          class="progress__ring-track"
          cx="50"
          cy="50"
          :r="RADIUS"
        />
        <circle
          class="progress__ring-fill"
          cx="50"
          cy="50"
          :r="RADIUS"
          :stroke-dasharray="dash"
        />
      </svg>
      <div class="progress__ring-label">
        <slot>
          <span class="progress__ring-pct">{{ Math.round(pct) }}<span class="progress__ring-sign">%</span></span>
        </slot>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.progress--brand { --progress-fg: var(--c-brand); }
.progress--progress { --progress-fg: var(--bulma-primary); }
.progress--data { --progress-fg: var(--aqua); }

// --- bar
.progress--bar { width: 100%; }

.progress__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  margin-block-end: var(--s-2);
}

.progress__label {
  font-size: var(--t-tiny);
  font-weight: 600;
  color: var(--c-text-soft);
}

.progress__value {
  font-family: var(--font-mono);
  font-size: var(--t-tiny);
  font-weight: 700;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.progress__track {
  height: 0.5rem;
  border-radius: var(--r-full);
  background: var(--c-bg-inset);
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  border-radius: var(--r-full);
  background: var(--progress-fg);
  // Spring easing on the width is what makes a completion tick feel earned
  // rather than merely reported.
  transition: width var(--dur-slow) var(--ease-spring);
}

// --- ring
.progress--ring {
  position: relative;
  display: inline-grid;
  place-items: center;
}

.progress__ring {
  // Start the arc at 12 o'clock rather than 3, and mirror nothing for RTL:
  // a clockwise progress arc reads the same in every locale.
  transform: rotate(-90deg);
}

.progress__ring-track,
.progress__ring-fill {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
}

.progress__ring-track { stroke: var(--c-bg-inset); }

.progress__ring-fill {
  stroke: var(--progress-fg);
  transition: stroke-dasharray var(--dur-slow) var(--ease-spring);
}

.progress__ring-label {
  position: absolute;
  display: grid;
  place-items: center;
  text-align: center;
  line-height: 1;
}

.progress__ring-pct {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.progress__ring-sign {
  font-size: 0.6em;
  color: var(--c-text-faint);
}
</style>
