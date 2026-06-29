<template>
  <span class="flex items-center gap-2">
    <!-- Three-bar chart, ascending heights, dark → lighter Salesforce blues -->
    <svg
      viewBox="0 0 32 32"
      class="h-7 w-7 shrink-0"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="14"
        width="7"
        height="15"
        rx="1.5"
        fill="var(--color-salesforce-700)"
      />
      <rect
        x="12.5"
        y="9"
        width="7"
        height="20"
        rx="1.5"
        fill="var(--color-salesforce-500)"
      />
      <rect
        x="22"
        y="4"
        width="7"
        height="25"
        rx="1.5"
        fill="var(--color-salesforce-300)"
      />
    </svg>

    <span class="font-bold text-base tracking-tight whitespace-nowrap text-highlighted">
      <!-- Full name on desktop, condensed on mobile -->
      <span class="hidden sm:inline">CRM Analytics </span>
      <span class="sm:hidden">CRMA </span>
      <span class="text-primary">Academy</span>
    </span>
  </span>
</template>
