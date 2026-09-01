<template>
  <span class="flex items-center gap-2.5">
    <!-- The design system's mark: a Salesforce-blue tile wearing the ink
         line, three white bars ascending inside it. -->
    <span class="nb-tile size-8 bg-primary">
      <svg
        viewBox="0 0 24 24"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="13"
          width="4"
          height="8"
          rx="1"
          fill="#fff"
        />
        <rect
          x="9"
          y="8"
          width="4"
          height="13"
          rx="1"
          fill="#fff"
        />
        <rect
          x="15"
          y="3"
          width="4"
          height="18"
          rx="1"
          fill="#fff"
        />
      </svg>
    </span>

    <span class="font-display font-bold text-base tracking-tight whitespace-nowrap text-highlighted">
      <!-- Full name on desktop, condensed on mobile -->
      <span class="hidden sm:inline">CRM Analytics </span>
      <span class="sm:hidden">CRMA </span>
      <span class="text-primary">Academy</span>
    </span>
  </span>
</template>
