<script setup lang="ts">
/**
 * The lesson player shell: the lesson on the left, the course contents in a
 * sticky 360px column on the right that collapses to a 60px rail of donuts.
 * Below 1024px the column becomes a slideover opened from the lesson header.
 *
 * The collapsed state is a per-reader convenience, remembered in a cookie so
 * the server renders the right grid and nothing jumps on hydration.
 */
const collapsed = useCookie<boolean>('bp-contents-collapsed', { default: () => false, sameSite: 'lax' })
const mobileOpen = useState('bp-contents-mobile', () => false)
const route = useRoute()
watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div
    class="bp-player"
    :class="{ 'bp-player--collapsed': collapsed }"
  >
    <div class="min-w-0">
      <slot />
    </div>

    <aside
      class="bp-player-aside hidden lg:block"
      aria-label="Course contents"
    >
      <BpCourseContents
        :collapsed="collapsed"
        @toggle="collapsed = !collapsed"
      />
    </aside>

    <USlideover
      v-model:open="mobileOpen"
      side="right"
      title="Course contents"
      :ui="{ body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <BpCourseContents
          :collapsible="false"
          @navigate="mobileOpen = false"
        />
      </template>
    </USlideover>
  </div>
</template>
