<template>
  <span class="flex items-center gap-2.5">
    <!-- A rounded cobalt tile holding three ascending bars and a trend
         point: a dashboard in one glyph. -->
    <svg
      viewBox="0 0 32 32"
      class="size-8 shrink-0"
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill="var(--color-cobalt-600)"
      />
      <rect
        x="7"
        y="17"
        width="4.5"
        height="8"
        rx="1.25"
        fill="var(--color-lagoon-300)"
      />
      <rect
        x="13.75"
        y="12.5"
        width="4.5"
        height="12.5"
        rx="1.25"
        fill="var(--color-cobalt-200)"
      />
      <rect
        x="20.5"
        y="8"
        width="4.5"
        height="17"
        rx="1.25"
        fill="#fff"
      />
    </svg>

    <span class="flex flex-col leading-none">
      <span class="font-bold text-[0.95rem] tracking-tight whitespace-nowrap text-highlighted">
        <span class="hidden sm:inline">CRM Analytics</span>
        <span class="sm:hidden">CRMA</span>
        <span class="text-primary"> Academy</span>
      </span>
    </span>
  </span>
</template>
