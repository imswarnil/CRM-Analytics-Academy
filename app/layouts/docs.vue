<script setup lang="ts">
/**
 * A lesson, inside the app shell.
 *
 * The shell already provides the rail — on a lesson route it holds the
 * curriculum — so this layout is only the transport bar and the reading
 * column. Progress is not loaded here either: AppShell does it, because it is
 * the one component on every page including the dashboard, which is not in
 * this layout.
 */
</script>

<template>
  <div>
    <CourseBar />

    <div class="px-4 sm:px-6">
      <AdUnit
        placement="headerBanner"
        class="mt-4 max-lg:hidden"
      />

      <slot />

      <AdUnit
        placement="footer"
        class="mb-8"
      />
    </div>
  </div>
</template>
