<script setup lang="ts">
/**
 * FIG. 03 — what the course teaches, as six tiles that each open the lesson
 * where it is taught. The tiles rise in, staggered, whenever the slide
 * becomes active.
 */
withDefaults(defineProps<{ active?: boolean }>(), { active: true })

const { t } = useI18n()
const localePath = useLocalePath()

// Every route is a real lesson or section under content/en.
const tiles = [
  { key: 'ai', icon: 'i-lucide-sparkles', to: '/einstein-discovery' },
  { key: 'security', icon: 'i-lucide-shield-check', to: '/setup/row-level-security' },
  { key: 'saql', icon: 'i-lucide-code-xml', to: '/saql/grouping-and-windowing' },
  { key: 'kpis', icon: 'i-lucide-target', to: '/gtm-engineering/metric-contracts' },
  { key: 'bindings', icon: 'i-lucide-link-2', to: '/bindings/selection-bindings' },
  { key: 'recipes', icon: 'i-lucide-workflow', to: '/data-preparation/recipe-nodes' }
] as const
</script>

<template>
  <ul
    class="grid grid-cols-2 gap-3 p-4 sm:p-5"
    :class="{ 'bp-topics--on': active }"
  >
    <li
      v-for="(tile, i) in tiles"
      :key="tile.key"
      class="bp-topic"
      :style="{ transitionDelay: active ? `${i * 70}ms` : '0ms' }"
    >
      <NuxtLink
        :to="localePath(tile.to)"
        :tabindex="active ? undefined : -1"
        class="bp-card bp-card--hover group flex h-full flex-col gap-2 p-3"
      >
        <span class="bp-iconbox size-8! text-(--signal)">
          <UIcon
            :name="tile.icon"
            class="size-4"
          />
        </span>
        <span class="text-sm font-extrabold leading-tight tracking-[-0.01em] text-(--ink)">
          {{ t(`home.slides.tiles.${tile.key}.title`) }}
        </span>
        <span class="font-mono text-[9px] uppercase leading-snug tracking-[.08em] text-(--ink2)">
          {{ t(`home.slides.tiles.${tile.key}.line`) }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.bp-topic {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity .35s ease-out,
    transform .45s cubic-bezier(.3, 1.5, .5, 1);
}
.bp-topics--on .bp-topic {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .bp-topic {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
