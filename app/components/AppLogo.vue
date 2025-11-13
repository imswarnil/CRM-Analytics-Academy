<template>
  <!-- Desktop Logo: Wide viewBox, full text. Visible on medium screens and up. -->
  <svg viewBox="0 0 1600 200" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="CRM Analytics Academy" class="w-auto h-[var(--logo-h,1.75rem)] shrink-0 hidden md:block" style="height: var(--logo-h, 1.75rem);" preserveAspectRatio="xMinYMid meet">
    <title>CRM Analytics Academy</title>
    <!-- Left icon -->
    <g transform="translate(16,0)">
      <rect x="20" y="128" width="44" height="72" rx="10" fill="var(--ui-primary, #009ED9)"></rect>
      <rect x="80" y="86" width="44" height="114" rx="10" fill="var(--ui-primary, #009ED9)" opacity="0.9"></rect>
      <rect x="140" y="50" width="44" height="150" rx="10" fill="var(--ui-primary, #009ED9)" opacity="0.85"></rect>
    </g>
    <!-- Wordmark: Full text -->
    <text x="260" y="170" fill="currentColor" font-family="Outfit, Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="140" font-weight="800" textLength="1300" lengthAdjust="spacingAndGlyphs" dominant-baseline="alphabetic" style="letter-spacing: -4.9px;">
      CRM Analytics Academy
    </text>
  </svg>

  <!-- Mobile Logo: Compact viewBox, "CRMA" text. Visible only on small screens. -->
  <svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="CRM Analytics Academy" class="w-auto h-[var(--logo-h,1.75rem)] shrink-0 block md:hidden" style="height: var(--logo-h, 1.75rem);" preserveAspectRatio="xMinYMid meet">
    <title>CRM Analytics Academy</title>
    <!-- Left icon (identical) -->
    <g transform="translate(16,0)">
      <rect x="20" y="128" width="44" height="72" rx="10" fill="var(--ui-primary, #009ED9)"></rect>
      <rect x="80" y="86" width="44" height="114" rx="10" fill="var(--ui-primary, #009ED9)" opacity="0.9"></rect>
      <rect x="140" y="50" width="44" height="150" rx="10" fill="var(--ui-primary, #009ED9)" opacity="0.85"></rect>
    </g>
    <!-- Wordmark: Abbreviated text -->
    <text x="260" y="170" fill="currentColor" font-family="Outfit, Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="140" font-weight="800" textLength="400" lengthAdjust="spacingAndGlyphs" dominant-baseline="alphabetic" style="letter-spacing: -4.9px;">
      CRMA
    </text>
  </svg>
</template>