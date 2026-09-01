<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The site chrome, exactly as the design system draws it: one sticky top
 * navbar on every page — logo left, pill links centre-right, the yellow
 * call-to-action on the end — and the ink footer after the content.
 *
 * There is no site-nav sidebar any more. The design gives a left pane to two
 * screens only: the course player's curriculum (layouts/docs.vue) and the
 * admin console (pages/admin.vue); each owns its pane itself. Below lg the
 * pill row folds into a slide-over menu behind a hamburger.
 */
const route = useRoute()
const localePath = useLocalePath()
const { t, locale, locales, setLocale } = useI18n()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { user, isSignedIn, fetchSession, signOut } = useAuth()
onMounted(fetchSession)

// Loaded once here — the shell is on every page, which is what makes it the
// right place for the single fetch.
const { load } = useProgress()
watch(isSignedIn, ok => ok && load(), { immediate: true })

const { open: searchOpen } = useContentSearch()
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: v => (colorMode.preference = v ? 'dark' : 'light')
})

/** True on a lesson page — the player owns that screen, so no footer. */
function isLessonRoute(path: string) {
  const stripped = path.replace(new RegExp(`^/(${locales.value.map(l => l.code).join('|')})(?=/|$)`), '')
  const top = stripped.split('/').filter(Boolean)[0]
  if (!top) return false
  return (navigation?.value ?? []).some(m => String(m.path).replace(/^\//, '') === top)
}
const inCourse = computed(() => Boolean(navigation?.value?.length) && isLessonRoute(route.path))

// The design's pill row: Courses, Showcase, Resources, Leaderboard, About.
const navItems = computed(() => [
  { label: t('nav.curriculum'), icon: 'i-lucide-graduation-cap', to: localePath('/foundations') },
  { label: t('nav.showcase'), icon: 'i-lucide-chart-column-big', to: localePath('/showcase') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.leaderboard'), icon: 'i-lucide-trophy', to: localePath('/leaderboard') },
  { label: t('nav.about'), icon: 'i-lucide-info', to: localePath('/about') }
])

// Extra destinations for the mobile menu, where there is room to be complete.
const menuExtras = computed(() => [
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets'), auth: false },
  { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard'), auth: true },
  { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit'), auth: true }
].filter(i => !i.auth || isSignedIn.value))

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

const localeItems = computed(() => [
  locales.value.map(l => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    onSelect: () => setLocale(l.code)
  }))
])

const accountItems = computed(() => [[
  { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
  { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit') }
], [
  { label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: () => signOut() }
]])

/* --- Mobile menu --------------------------------------------------------- */
const menuOpen = ref(false)
watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-(--nb-page)">
    <header class="sticky top-0 z-30 h-16 border-b-[3px] border-(--nb-ink) bg-(--nb-surface)/90 backdrop-blur">
      <UContainer class="flex h-full items-center gap-3">
        <NuxtLink
          :to="localePath('/')"
          aria-label="CRM Analytics Academy"
        >
          <AppLogo />
        </NuxtLink>

        <!-- The pill row. Active is the solid blue pill of the design;
             everything else stays quiet until hovered. -->
        <nav
          class="ms-4 hidden items-center gap-1 lg:flex"
          :aria-label="t('nav.navigate')"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.8125rem] transition-colors"
            :class="isActive(item.to)
              ? 'bg-primary font-semibold text-white'
              : 'font-medium text-muted hover:bg-(--nb-subtle) hover:text-highlighted'"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              class="size-4 shrink-0"
            />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ms-auto flex items-center gap-1">
          <UButton
            icon="i-lucide-search"
            color="neutral"
            variant="ghost"
            :aria-label="t('nav.search')"
            @click="searchOpen = true"
          />
          <UDropdownMenu
            :items="localeItems"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-languages"
              color="neutral"
              variant="ghost"
              class="max-sm:hidden"
              :aria-label="t('nav.chooseLanguage')"
            />
          </UDropdownMenu>
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              color="neutral"
              variant="ghost"
              role="switch"
              :aria-checked="isDark"
              class="max-sm:hidden"
              :aria-label="t('nav.theme')"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="size-9 max-sm:hidden" />
            </template>
          </ClientOnly>

          <div
            class="mx-1 h-4.5 w-px bg-(--ui-border) max-lg:hidden"
            aria-hidden="true"
          />

          <ClientOnly>
            <UDropdownMenu
              v-if="isSignedIn"
              :items="accountItems"
              :content="{ align: 'end' }"
              class="max-lg:hidden"
            >
              <UButton
                icon="i-lucide-circle-user"
                color="neutral"
                variant="ghost"
                :aria-label="t('nav.account')"
              />
            </UDropdownMenu>
          </ClientOnly>

          <ClientOnly>
            <!-- The design system's one loud button: yellow, ink text, ink
                 line. Reserved for the primary action in the chrome. -->
            <UButton
              :to="localePath(isSignedIn ? '/dashboard' : '/sign-in')"
              :label="isSignedIn ? t('nav.dashboard') : t('nav.signIn')"
              class="bg-brand-yellow text-ink hover:bg-brand-yellow/85 max-sm:hidden"
            />
            <template #fallback>
              <div class="h-9 w-24 max-sm:hidden" />
            </template>
          </ClientOnly>

          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            class="lg:hidden"
            :aria-label="t('nav.menu')"
            @click="menuOpen = true"
          />
        </div>
      </UContainer>
    </header>

    <!-- Mobile menu: the same destinations as the pill row plus the ones the
         row has no room for, one full-width tap target each. -->
    <USlideover
      v-model:open="menuOpen"
      side="right"
      :title="t('nav.navigate')"
      :ui="{ content: 'max-w-72' }"
    >
      <template #body>
        <nav
          class="flex flex-col gap-1"
          :aria-label="t('nav.navigate')"
        >
          <UButton
            v-for="item in [...navItems.map(i => ({ ...i, auth: false })), ...menuExtras]"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            :variant="isActive(item.to) ? 'solid' : 'ghost'"
            block
            class="justify-start"
          />
        </nav>

        <USeparator class="my-4" />

        <div class="flex items-center gap-1">
          <UDropdownMenu
            :items="localeItems"
            :content="{ align: 'start' }"
          >
            <UButton
              icon="i-lucide-languages"
              color="neutral"
              variant="ghost"
              :aria-label="t('nav.chooseLanguage')"
            />
          </UDropdownMenu>
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              color="neutral"
              variant="ghost"
              role="switch"
              :aria-checked="isDark"
              :aria-label="t('nav.theme')"
              @click="isDark = !isDark"
            />
          </ClientOnly>
        </div>

        <ClientOnly>
          <UButton
            v-if="!isSignedIn"
            :to="localePath('/sign-in')"
            :label="t('nav.signIn')"
            icon="i-lucide-log-in"
            block
            class="mt-4 bg-brand-yellow text-ink hover:bg-brand-yellow/85"
          />
          <template v-else>
            <div class="mt-4 flex items-center gap-2 px-1">
              <UAvatar
                :alt="user?.name || user?.email || '?'"
                size="2xs"
              />
              <span class="min-w-0 flex-1 truncate text-sm text-highlighted">{{ user?.name || user?.email }}</span>
            </div>
            <UButton
              :label="t('nav.signOut')"
              icon="i-lucide-log-out"
              color="neutral"
              variant="ghost"
              block
              class="mt-2 justify-start"
              @click="signOut()"
            />
          </template>
        </ClientOnly>
      </template>
    </USlideover>

    <main class="flex-1">
      <slot />
    </main>

    <!-- The player owns the lesson screen edge to edge; every other page
         ends on the ink footer, per the design. -->
    <AppFooter v-if="!inCourse" />
  </div>
</template>
