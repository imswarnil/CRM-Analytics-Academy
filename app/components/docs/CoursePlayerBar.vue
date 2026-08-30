<script setup lang="ts">
/**
 * The player chrome that sits under the header on every lesson.
 *
 * A curriculum this size is easy to get lost in — 49 lessons across six
 * modules. This answers the three questions a learner actually has at any
 * moment: where am I, how far through am I, and what is next. It is sticky
 * because those questions recur while scrolling, not just on arrival.
 */
const { current, previous, next, total, position, percent } = useCourse()
const localePath = useLocalePath()
</script>

<template>
  <div
    v-if="current"
    class="player"
  >
    <div class="shell player__inner">
      <div class="player__where">
        <p class="player__module">
          {{ current.moduleTitle }}
        </p>
        <p class="player__count">
          <span class="player__n">{{ position }}</span>
          <span class="player__sep">/</span>
          <span>{{ total }}</span>
        </p>
      </div>

      <div class="player__track">
        <div
          class="player__fill"
          :style="{ width: `${percent}%` }"
        />
      </div>

      <div class="player__controls">
        <NuxtLink
          v-if="previous"
          :to="localePath(previous.path)"
          class="player__btn"
          :title="previous.title"
          rel="prev"
        >
          <Icon
            name="i-lucide-chevron-left"
            class="player__chev"
          />
          <span class="player__btn-label">Prev</span>
        </NuxtLink>
        <span
          v-else
          class="player__btn is-off"
        >
          <Icon
            name="i-lucide-chevron-left"
            class="player__chev"
          />
          <span class="player__btn-label">Prev</span>
        </span>

        <NuxtLink
          v-if="next"
          :to="localePath(next.path)"
          class="player__btn player__btn--next"
          :title="next.title"
          rel="next"
        >
          <span class="player__btn-label">Next</span>
          <Icon
            name="i-lucide-chevron-right"
            class="player__chev"
          />
        </NuxtLink>
        <span
          v-else
          class="player__btn player__btn--next is-off"
        >
          <span class="player__btn-label">Done</span>
          <Icon
            name="i-lucide-check"
            class="player__chev"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.player {
  position: sticky;
  // Sits directly beneath the site header rather than at the top of the
  // viewport, so the two stack instead of overlapping.
  top: var(--h-header);
  z-index: var(--z-sticky);
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(10px) saturate(150%);
  border-block-end: 1px solid var(--c-line);
}

.player__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-4);
  height: 3rem;
}

.player__where {
  display: flex;
  align-items: baseline;
  gap: var(--s-2);
  min-width: 0;
}

.player__module {
  margin: 0;
  font-size: var(--t-tiny);
  font-weight: 600;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 16rem;

  @media (max-width: 40rem) { display: none; }
}

.player__count {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.15rem;
  font-family: var(--font-mono);
  font-size: var(--t-micro);
  color: var(--c-text-faint);
  font-variant-numeric: tabular-nums;
}

.player__n {
  font-weight: 700;
  color: var(--c-brand-text);
}

.player__sep { opacity: 0.5; }

.player__track {
  height: 0.3rem;
  border-radius: var(--r-full);
  background: var(--c-bg-inset);
  overflow: hidden;
}

.player__fill {
  height: 100%;
  border-radius: var(--r-full);
  // Two-stop, hard-edged: brand into aqua. It reads as a measured quantity
  // rather than as decoration, which is the register the whole site is in.
  background: linear-gradient(90deg, var(--c-brand), var(--aqua));
  transition: width var(--dur-slow) var(--ease-spring);
}

.player__controls {
  display: flex;
  align-items: center;
  gap: var(--s-1);
}

.player__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: var(--s-1) var(--s-2);
  border-radius: var(--r-sm);
  font-size: var(--t-tiny);
  font-weight: 600;
  color: var(--c-text-soft);
  text-decoration: none;
  transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);

  &:hover { background: var(--c-bg-inset); color: var(--c-text); }

  // Kept in the DOM rather than hidden so the control row does not reflow at
  // the first and last lesson.
  &.is-off { opacity: 0.35; pointer-events: none; }
}

.player__chev {
  width: 1rem;
  height: 1rem;
}

:global([dir="rtl"]) .player__chev {
  transform: scaleX(-1);
}

.player__btn-label {
  @media (max-width: 30rem) { display: none; }
}
</style>
