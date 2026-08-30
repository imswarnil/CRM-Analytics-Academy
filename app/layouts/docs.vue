<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

// Published by the lesson page — see app/pages/[...slug].vue. The rail is a
// sibling of the page, not an ancestor, so state is the only seam between them.
const toc = useState<{ id: string, text: string, depth: number }[]>('page-toc', () => [])
const { toc: tocConfig } = useAppConfig()
</script>

<template>
  <div>
    <DocsCoursePlayerBar />

    <div class="shell">
      <div class="docs">
        <!-- Sidebar. Hidden below lg, where the header drawer carries the same
           tree instead — see AppHeader. -->
        <aside class="docs__rail">
          <div class="docs__rail-scroll">
            <DocsNav
              v-if="navigation?.length"
              :items="navigation"
            />
          </div>

          <SponsorCard class="docs__rail-foot" />
        </aside>

        <div class="docs__main">
          <slot />
        </div>

        <aside class="docs__aside">
          <DocsToc
            v-if="toc?.length"
            :links="toc"
            :title="tocConfig?.title"
          />

          <AdUnit
            placement="sidebarSquare"
            class="docs__aside-ad"
          />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// The nav scrolls in its own area so a 60-lesson tree never pushes the sponsor
// card off the bottom of the sidebar.
.docs__rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-inline-end: var(--s-2);
  // Keeps the scrollbar from sitting on top of the text at narrow widths.
  scrollbar-gutter: stable;
}

.docs__rail-foot {
  flex-shrink: 0;
  margin-block-start: var(--s-4);
}

.docs__aside-ad {
  margin-block-start: var(--s-5);
}
</style>
