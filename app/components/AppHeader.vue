<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const { choice, resolved, cycle } = useTheme()

const menuOpen = ref(false)
const langOpen = ref(false)
const moreOpen = ref(false)

const route = useRoute()
watch(() => route.path, () => {
  menuOpen.value = false
  langOpen.value = false
  moreOpen.value = false
})

watch(menuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

const primary = computed(() => [
  { label: t('nav.showcase'), to: localePath('/showcase') },
  { label: t('nav.resources'), to: localePath('/resources') },
  { label: t('nav.datasets'), to: localePath('/datasets') }
])

const more = computed(() => [
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') },
  { label: t('nav.roadmap'), icon: 'i-lucide-map', to: localePath('/roadmap') },
  { label: t('nav.changelog'), icon: 'i-lucide-history', to: localePath('/changelog') },
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.sponsor'), icon: 'i-lucide-heart', to: localePath('/sponsor') }
])

const themeIcon = computed(() =>
  choice.value === 'system' ? 'i-lucide-monitor' : resolved.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'
)

function closeAll() {
  langOpen.value = false
  moreOpen.value = false
}
</script>

<template>
  <header class="hdr">
    <div class="hdr__inner container">
      <NuxtLink
        :to="localePath('/')"
        class="hdr__brand"
      >
        <AppLogo />
      </NuxtLink>

      <nav
        class="hdr__nav hide-below-lg"
        aria-label="Main"
      >
        <NuxtLink
          :to="localePath('/foundations')"
          class="hdr__link"
        >
          {{ t('nav.curriculum') }}
        </NuxtLink>
        <NuxtLink
          v-for="item in primary"
          :key="item.to"
          :to="item.to"
          class="hdr__link"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="hdr__actions">
        <DocsSearch class="hdr__search" />

        <div class="hdr__menu-wrap hide-below-lg">
          <button
            class="hdr__icon-btn"
            type="button"
            :aria-expanded="langOpen"
            :title="t('nav.chooseLanguage')"
            :aria-label="t('nav.chooseLanguage')"
            @click="closeAll(); langOpen = !langOpen"
          >
            <Icon name="i-lucide-languages" />
          </button>
          <div
            v-if="langOpen"
            class="hdr__menu"
          >
            <button
              v-for="l in locales"
              :key="l.code"
              class="hdr__menu-item"
              :class="{ 'is-current': l.code === locale }"
              type="button"
              @click="setLocale(l.code); langOpen = false"
            >
              {{ l.name || l.code }}
              <Icon
                v-if="l.code === locale"
                name="i-lucide-check"
                class="hdr__menu-check"
              />
            </button>
          </div>
        </div>

        <button
          class="hdr__icon-btn"
          type="button"
          :aria-label="t('nav.theme')"
          :title="`${t('nav.theme')}: ${choice}`"
          @click="cycle"
        >
          <Icon :name="themeIcon" />
        </button>

        <span class="hdr__divider hide-below-lg" />

        <a
          class="hdr__icon-btn hide-below-lg"
          href="https://github.com/imswarnil/CRM-Analytics-Academy"
          target="_blank"
          rel="noopener noreferrer"
          :title="t('nav.github')"
          :aria-label="t('nav.github')"
        >
          <Icon name="i-simple-icons-github" />
        </a>

        <div class="hdr__menu-wrap hide-below-lg">
          <button
            class="hdr__icon-btn"
            type="button"
            :aria-expanded="moreOpen"
            :aria-label="t('nav.more')"
            @click="closeAll(); moreOpen = !moreOpen"
          >
            <Icon name="i-lucide-ellipsis" />
          </button>
          <div
            v-if="moreOpen"
            class="hdr__menu"
          >
            <NuxtLink
              v-for="item in more"
              :key="item.to"
              :to="item.to"
              class="hdr__menu-item"
            >
              <Icon
                :name="item.icon"
                class="hdr__menu-icon"
              />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>

        <button
          class="hdr__icon-btn hide-from-lg"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="Menu"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer. Carries the curriculum tree too, since the docs rail is
         hidden below lg and this is the only way to reach a lesson there. -->
    <div
      v-if="menuOpen"
      class="hdr__drawer hide-from-lg"
    >
      <div class="hdr__drawer-inner container">
        <nav
          class="hdr__drawer-nav"
          aria-label="Sections"
        >
          <NuxtLink
            v-for="item in [{ label: t('nav.curriculum'), to: localePath('/foundations') }, ...primary, ...more]"
            :key="item.to"
            :to="item.to"
            class="hdr__drawer-link"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div
          v-if="navigation?.length"
          class="hdr__drawer-tree"
        >
          <DocsNav :items="navigation" />
        </div>

        <div class="hdr__drawer-langs">
          <button
            v-for="l in locales"
            :key="l.code"
            class="hdr__lang-chip"
            :class="{ 'is-current': l.code === locale }"
            type="button"
            @click="setLocale(l.code)"
          >
            {{ l.name || l.code }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.hdr {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(12px) saturate(150%);
  border-block-end: 1px solid var(--c-line);
}

.hdr__inner {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  height: var(--h-header);
}

.hdr__brand {
  text-decoration: none;
  flex-shrink: 0;
}

.hdr__nav {
  display: flex;
  align-items: center;
  gap: var(--s-1);
  margin-inline-start: var(--s-4);
}

.hdr__link {
  position: relative;
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-sm);
  font-size: var(--t-small);
  font-weight: 600;
  color: var(--c-text-soft);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);

  &:hover { color: var(--c-text); background: var(--c-bg-inset); }

  // The current section gets an underline that reads like a plotted baseline
  // rather than a filled pill — quieter, and it does not fight the logo.
  &.router-link-active {
    color: var(--c-brand-text);

    &::after {
      content: "";
      position: absolute;
      inset-inline: var(--s-3);
      inset-block-end: 0.25rem;
      height: 2px;
      border-radius: var(--r-full);
      background: var(--c-brand);
    }
  }
}

.hdr__actions {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin-inline-start: auto;
}

.hdr__icon-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid transparent;
  border-radius: var(--r-sm);
  color: var(--c-text-soft);
  font-size: 1.05rem;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);

  &:hover {
    background: var(--c-bg-sunken);
    border-color: var(--c-line);
    color: var(--c-text);
  }

  &[aria-expanded="true"] {
    background: var(--c-brand-faint);
    border-color: var(--c-brand-soft);
    color: var(--c-brand-text);
  }
}

// A hairline between the navigation controls and the overflow menu, so the
// row reads as two groups rather than six loose glyphs.
.hdr__divider {
  width: 1px;
  height: 1.25rem;
  margin-inline: var(--s-1);
  background: var(--c-line);
}

.hdr__menu-wrap { position: relative; }

.hdr__menu {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + var(--s-2));
  min-width: 12rem;
  max-height: 20rem;
  overflow-y: auto;
  padding: var(--s-2);
  background: var(--c-bg-raised);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-3);
  animation: menu-in var(--dur-fast) var(--ease-spring);
}

@keyframes menu-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}

.hdr__menu-item {
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

  &.is-current { color: var(--c-brand-text); font-weight: 650; }
}

.hdr__menu-icon,
.hdr__menu-check {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.hdr__menu-check { margin-inline-start: auto; }

// --- drawer
.hdr__drawer {
  position: fixed;
  inset: var(--h-header) 0 0;
  z-index: var(--z-overlay);
  overflow-y: auto;
  background: var(--c-bg);
  border-block-start: 1px solid var(--c-line);
}

.hdr__drawer-inner {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  padding-block: var(--s-5) var(--s-8);
}

.hdr__drawer-nav {
  display: flex;
  flex-direction: column;
}

.hdr__drawer-link {
  padding: var(--s-3) 0;
  border-block-end: 1px solid var(--c-line-soft);
  font-size: var(--t-lead);
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;

  &.router-link-active { color: var(--c-brand-text); }
}

.hdr__drawer-tree {
  padding-block-start: var(--s-2);
}

.hdr__drawer-langs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.hdr__lang-chip {
  padding: var(--s-1) var(--s-3);
  border: 1px solid var(--c-line);
  border-radius: var(--r-full);
  font-size: var(--t-tiny);
  color: var(--c-text-soft);

  &.is-current {
    background: var(--c-brand-faint);
    border-color: var(--c-brand);
    color: var(--c-brand-text);
    font-weight: 650;
  }
}
</style>
