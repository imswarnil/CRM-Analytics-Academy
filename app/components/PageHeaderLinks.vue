<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const { copy, copied } = useClipboard()
const site = useSiteConfig()

// Content lives at /raw/<locale>/<path>.md — but the default locale has no
// URL prefix (/foundations), so route.path alone 404s against the raw route.
// Map it to the locale-prefixed content path first.
const { locales } = useI18n()
const localeCodes = locales.value.map(l => l.code)
const contentPath = computed(() => routeToContentPath(route.path, localeCodes))
const mdPath = computed(() => `${site.url}/raw${contentPath.value}.md`)

const rawPath = computed(() => `/raw${contentPath.value}.md`)

const menuEl = ref<HTMLDetailsElement | null>(null)
function close() {
  if (menuEl.value) menuEl.value.open = false
}

const items = computed(() => [
  {
    label: 'Copy Markdown link',
    icon: 'i-lucide-link',
    onSelect() {
      copy(mdPath.value)
    }
  },
  {
    label: 'View as Markdown',
    icon: 'i-simple-icons:markdown',
    target: '_blank',
    to: rawPath.value
  },
  {
    label: 'Open in ChatGPT',
    icon: 'i-simple-icons:openai',
    target: '_blank',
    to: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`
  },
  {
    label: 'Open in Claude',
    icon: 'i-simple-icons:anthropic',
    target: '_blank',
    to: `https://claude.ai/new?q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`
  }
])

async function copyPage() {
  try {
    copy(await $fetch<string>(rawPath.value))
  } catch {
    // The copy button reports success by swapping its own icon; a failed fetch
    // simply leaves it unchanged, which is the right amount of noise for an
    // optional convenience action.
  }
}
</script>

<template>
  <div class="pagelinks">
    <UiButton
      size="sm"
      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
      label="Copy page"
      @click="copyPage"
    />

    <details
      ref="menuEl"
      class="pagelinks__menu"
    >
      <summary
        class="pagelinks__trigger"
        aria-label="Open copy actions menu"
      >
        <Icon name="i-lucide-chevron-down" />
      </summary>

      <div class="pagelinks__list">
        <component
          :is="item.to ? 'a' : 'button'"
          v-for="item in items"
          :key="item.label"
          class="pagelinks__item"
          :href="item.to"
          :target="item.target"
          :rel="item.target === '_blank' ? 'noopener noreferrer' : undefined"
          :type="item.to ? undefined : 'button'"
          @click="item.onSelect?.(); close()"
        >
          <Icon
            :name="item.icon"
            class="pagelinks__icon"
          />
          {{ item.label }}
        </component>
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.pagelinks {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
}

.pagelinks__menu {
  position: relative;
}

.pagelinks__trigger {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--c-line);
  border-radius: var(--r-full);
  background: var(--c-bg-raised);
  color: var(--c-text-soft);
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker { display: none; }

  &:hover { border-color: var(--c-brand); color: var(--c-brand-text); }
}

.pagelinks__list {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + var(--s-2));
  z-index: var(--z-overlay);
  min-width: 13rem;
  padding: var(--s-2);
  background: var(--c-bg-raised);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-3);
}

.pagelinks__item {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  width: 100%;
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-sm);
  font-size: var(--t-small);
  color: var(--c-text);
  text-decoration: none;
  text-align: start;

  &:hover { background: var(--c-bg-inset); }
}

.pagelinks__icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>
