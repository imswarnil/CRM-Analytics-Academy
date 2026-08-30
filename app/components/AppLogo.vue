<template>
  <span class="logo">
    <!-- Four ascending bars with a plotted point above them: a chart being read,
         which is the subject of the site. Drawn rather than iconified so the
         bars can carry the brand ramp and the marker can carry the accent. -->
    <svg
      class="logo__mark"
      viewBox="0 0 36 32"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="18"
        width="6"
        height="12"
        rx="2"
        fill="var(--blue-30)"
      />
      <rect
        x="9.5"
        y="13"
        width="6"
        height="17"
        rx="2"
        fill="var(--blue-40)"
      />
      <rect
        x="18"
        y="8"
        width="6"
        height="22"
        rx="2"
        fill="var(--blue-55)"
      />
      <rect
        x="26.5"
        y="3"
        width="6"
        height="27"
        rx="2"
        fill="var(--blue-70)"
      />
      <circle
        cx="29.5"
        cy="3"
        r="3"
        fill="var(--aqua)"
        stroke="var(--c-bg)"
        stroke-width="1.5"
      />
    </svg>

    <span class="logo__text">
      <span class="logo__name">
        <span class="logo__full">CRM Analytics</span>
        <span class="logo__short">CRMA</span>
      </span>
      <span class="logo__sub">Academy</span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
}

.logo__mark {
  width: 1.7rem;
  height: 1.5rem;
  flex-shrink: 0;
  overflow: visible;
}

.logo__text {
  display: flex;
  align-items: baseline;
  gap: 0.3em;
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: var(--tr-tight);
  white-space: nowrap;
}

.logo__name { color: var(--c-text); }

.logo__short { display: none; }

@media (max-width: 25rem) {
  .logo__full { display: none; }
  .logo__short { display: inline; }
}

.logo__sub { color: var(--c-brand); }
</style>
