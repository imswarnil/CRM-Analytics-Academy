<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The curriculum rail — the standing view of where a learner is in the course.
 *
 * Modules are <details> so the tree works before hydration and a browser's
 * in-page find can open a collapsed module to reveal a match. The module
 * holding the current lesson opens on the server, so a learner lands with
 * their place already visible.
 */
defineProps<{
  items: ContentNavigationItem[]
}>()

const route = useRoute()
const localePath = useLocalePath()
const { isDone } = useProgress()
const { lessons, position, total, percent } = useCourse()

function isCurrent(path?: string) {
  if (!path) return false
  return route.path === localePath(path) || route.path === path
}

function hasCurrent(item: ContentNavigationItem): boolean {
  if (isCurrent(item.path)) return true
  return (item.children ?? []).some(c => hasCurrent(c as ContentNavigationItem))
}

/** How many of a module's lessons are ticked. */
function moduleDone(mod: ContentNavigationItem) {
  const own = lessons.value.filter(l => l.moduleTitle === String(mod.title ?? ''))
  return { done: own.filter(l => isDone(l.path)).length, total: own.length }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="shrink-0 border-b border-default pb-4">
      <p class="text-xs font-semibold uppercase tracking-widest text-muted">
        Curriculum
      </p>
      <div class="mt-2 flex items-baseline justify-between gap-2">
        <span class="text-sm font-medium text-highlighted">{{ position }} of {{ total }}</span>
        <span class="font-mono text-xs text-muted">{{ Math.round(percent) }}%</span>
      </div>
      <UProgress
        :model-value="percent"
        :max="100"
        size="sm"
        class="mt-2"
      />
    </div>

    <nav
      class="min-h-0 flex-1 overflow-y-auto py-3"
      aria-label="Curriculum"
    >
      <details
        v-for="(mod, i) in items"
        :key="mod.path || i"
        :open="hasCurrent(mod)"
        class="mb-1"
      >
        <summary class="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-highlighted hover:bg-elevated">
          <UIcon
            v-if="mod.icon"
            :name="String(mod.icon)"
            class="size-4 shrink-0 text-muted"
          />
          <span class="min-w-0 flex-1 truncate">{{ mod.title }}</span>
          <span class="shrink-0 font-mono text-[10px] text-muted">
            {{ moduleDone(mod).done }}/{{ moduleDone(mod).total }}
          </span>
        </summary>

        <ul class="ms-4 mt-1 border-s border-default ps-2">
          <li
            v-for="(lesson, j) in mod.children"
            :key="lesson.path || j"
          >
            <NuxtLink
              :to="localePath(lesson.path)"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
              :class="isCurrent(lesson.path)
                ? 'bg-primary/10 font-semibold text-primary'
                : 'text-muted hover:bg-elevated hover:text-highlighted'"
              :aria-current="isCurrent(lesson.path) ? 'page' : undefined"
            >
              <UIcon
                :name="isDone(lesson.path) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
                class="size-4 shrink-0"
                :class="isDone(lesson.path) ? 'text-primary' : 'text-dimmed'"
              />
              <span class="min-w-0 flex-1 truncate">{{ lesson.title }}</span>
            </NuxtLink>
          </li>
        </ul>
      </details>
    </nav>

    <SponsorCard class="mt-3 shrink-0" />
  </div>
</template>
