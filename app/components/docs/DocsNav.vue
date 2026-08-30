<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The curriculum tree. Replaces UContentNavigation.
 *
 * Modules are <details> elements rather than JS-driven accordions, so the tree
 * works before hydration and a browser's in-page find can open a collapsed
 * module to reveal a match. The module containing the current lesson is opened
 * on the server, so a reader lands with their place already visible.
 */
const props = defineProps<{
  items: ContentNavigationItem[]
}>()

const route = useRoute()
const localePath = useLocalePath()

function isActive(path?: string) {
  if (!path) return false
  return route.path === localePath(path) || route.path === path
}

function containsActive(item: ContentNavigationItem): boolean {
  if (isActive(item.path)) return true
  return (item.children ?? []).some(child => containsActive(child as ContentNavigationItem))
}

const modules = computed(() => props.items ?? [])
</script>

<template>
  <nav
    class="docsnav"
    aria-label="Curriculum"
  >
    <ul class="docsnav__modules">
      <li
        v-for="(mod, i) in modules"
        :key="mod.path || i"
      >
        <!-- A module with no children is a plain link, not an empty disclosure. -->
        <NuxtLink
          v-if="!mod.children?.length"
          :to="localePath(mod.path)"
          class="docsnav__lesson docsnav__lesson--top"
          :class="{ 'is-active': isActive(mod.path) }"
        >
          <Icon
            v-if="mod.icon"
            :name="String(mod.icon)"
            class="docsnav__icon"
          />
          <span>{{ mod.title }}</span>
        </NuxtLink>

        <details
          v-else
          class="docsnav__module"
          :open="containsActive(mod)"
        >
          <summary class="docsnav__summary">
            <Icon
              v-if="mod.icon"
              :name="String(mod.icon)"
              class="docsnav__icon"
            />
            <span class="docsnav__title">{{ mod.title }}</span>
            <Icon
              name="i-lucide-chevron-down"
              class="docsnav__chev"
            />
          </summary>

          <ul class="docsnav__lessons">
            <li
              v-for="(lesson, j) in mod.children"
              :key="lesson.path || j"
            >
              <NuxtLink
                :to="localePath(lesson.path)"
                class="docsnav__lesson"
                :class="{ 'is-active': isActive(lesson.path) }"
                :aria-current="isActive(lesson.path) ? 'page' : undefined"
              >
                {{ lesson.title }}
              </NuxtLink>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.docsnav__modules,
.docsnav__lessons {
  list-style: none;
  margin: 0;
  padding: 0;
}

.docsnav__modules > li + li {
  margin-block-start: var(--s-1);
}

.docsnav__summary {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: var(--t-small);
  font-weight: 650;
  color: var(--c-text);
  list-style: none;
  user-select: none;
  transition: background-color var(--dur-fast) var(--ease-out);

  &::-webkit-details-marker { display: none; }

  &:hover { background: var(--c-bg-inset); }
}

.docsnav__title {
  flex: 1;
  min-width: 0;
}

.docsnav__icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  color: var(--c-text-faint);
}

.docsnav__chev {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--c-text-faint);
  transition: transform var(--dur-mid) var(--ease-out);
}

.docsnav__module[open] > .docsnav__summary .docsnav__chev {
  transform: rotate(180deg);
}

.docsnav__module[open] > .docsnav__summary .docsnav__icon {
  color: var(--c-brand);
}

.docsnav__lessons {
  margin-block-start: var(--s-1);
  margin-inline-start: calc(var(--s-3) + 0.5rem);
  padding-inline-start: var(--s-3);
  border-inline-start: 1px solid var(--c-line);
}

.docsnav__lesson {
  position: relative;
  display: block;
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-sm);
  font-size: var(--t-small);
  color: var(--c-text-soft);
  text-decoration: none;
  transition:
    color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);

  &:hover {
    background: var(--c-bg-inset);
    color: var(--c-text);
  }

  &.is-active {
    background: var(--c-brand-faint);
    color: var(--c-brand-text);
    font-weight: 650;
  }

  // The active marker replaces a segment of the module spine, so position in a
  // long tree is readable at a glance without the whole row shouting.
  &.is-active::before {
    content: "";
    position: absolute;
    inset-block: 0.35rem;
    inset-inline-start: calc(var(--s-3) * -1 - 1px);
    width: 2px;
    border-radius: var(--r-full);
    background: var(--c-brand);
  }
}

.docsnav__lesson--top {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-weight: 650;
  color: var(--c-text);
}
</style>
