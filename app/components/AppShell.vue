<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { useEventListener } from '@vueuse/core'

/**
 * The application shell: one persistent rail, one topbar, one scrolling pane.
 *
 * The rail changes what it holds rather than appearing twice. On a lesson it
 * is the curriculum with a way back out; everywhere else it is site
 * navigation. Two left rails on one screen — site nav beside course nav — is
 * the arrangement this avoids: it doubles the chrome and still leaves the
 * learner guessing which one moves them out of the lesson.
 */
const route = useRoute()
const localePath = useLocalePath()
const { t, locale, locales, setLocale } = useI18n()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { user, isSignedIn, fetchSession, signOut } = useAuth()
onMounted(fetchSession)

// Loaded once here — the shell is on every page, which is what makes it the
// right place for the single fetch.
const { completed, points, load } = useProgress()
watch(isSignedIn, ok => ok && load(), { immediate: true })

const { lessons } = useCourse()
const percentComplete = computed(() => {
  const total = lessons.value.length
  return total ? Math.round((completed.value.size / total) * 100) : 0
})

const { open: searchOpen } = useContentSearch()
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: v => (colorMode.preference = v ? 'dark' : 'light')
})

/** True on a lesson page — the rail shows the curriculum there. */
function isLessonRoute(path: string) {
  const stripped = path.replace(new RegExp(`^/(${locales.value.map(l => l.code).join('|')})(?=/|$)`), '')
  const top = stripped.split('/').filter(Boolean)[0]
  if (!top) return false
  return (navigation?.value ?? []).some(m => String(m.path).replace(/^\//, '') === top)
}
const inCourse = computed(() => Boolean(navigation?.value?.length) && isLessonRoute(route.path))

/**
 * The landing page is the one screen with no rail.
 *
 * A persistent navigation rail is right for an application — you are inside
 * something and need to move around it. It is wrong for the page whose entire
 * job is to explain the product to someone who has not signed up: it spends a
 * sixth of the viewport on links to places they have no reason to go yet, and
 * makes a marketing page look like a dashboard they are locked out of.
 */
const isHome = computed(() => {
  const codes = locales.value.map(l => l.code).join('|')
  return /^\/?$/.test(route.path.replace(new RegExp(`^/(${codes})(?=/|$)`), ''))
})

const siteNav = computed(() => [
  { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard'), auth: true },
  { label: t('nav.curriculum'), icon: 'i-lucide-graduation-cap', to: localePath('/foundations') },
  { label: t('nav.showcase'), icon: 'i-lucide-chart-column-big', to: localePath('/showcase') },
  { label: t('nav.leaderboard'), icon: 'i-lucide-trophy', to: localePath('/leaderboard') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit'), auth: true },
  { label: t('nav.about'), icon: 'i-lucide-info', to: localePath('/about') }
].filter(i => !i.auth || isSignedIn.value))

const marketingNav = computed(() => [
  { label: t('nav.curriculum'), to: localePath('/foundations') },
  { label: t('nav.showcase'), to: localePath('/showcase') },
  { label: t('nav.resources'), to: localePath('/resources') },
  { label: t('nav.leaderboard'), to: localePath('/leaderboard') },
  { label: t('nav.about'), to: localePath('/about') }
])

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

/* --- Mobile drawer ------------------------------------------------------ */
const railOpen = ref(false)
watch(() => route.fullPath, () => {
  railOpen.value = false
})
if (import.meta.client) {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') railOpen.value = false
  })
}
</script>

<template>
  <!-- Marketing shell: a top bar and a page that scrolls normally. -->
  <div
    v-if="isHome"
    class="flex min-h-dvh flex-col bg-default"
  >
    <header class="sticky top-0 z-30 border-b border-default bg-default/85 backdrop-blur">
      <UContainer class="flex h-16 items-center gap-4">
        <NuxtLink :to="localePath('/')">
          <AppLogo class="h-7 w-auto" />
        </NuxtLink>

        <nav class="ms-6 hidden items-center gap-1 lg:flex">
          <UButton
            v-for="item in marketingNav"
            :key="item.to"
            :to="item.to"
            :label="item.label"
            color="neutral"
            variant="ghost"
          />
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
            <template #fallback>
              <div class="size-9" />
            </template>
          </ClientOnly>
          <ClientOnly>
            <UButton
              :to="localePath(isSignedIn ? '/dashboard' : '/sign-in')"
              :label="isSignedIn ? t('nav.dashboard') : t('nav.signIn')"
              :icon="isSignedIn ? 'i-lucide-layout-dashboard' : 'i-lucide-log-in'"
            />
            <template #fallback>
              <div class="h-9 w-24" />
            </template>
          </ClientOnly>
        </div>
      </UContainer>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>

  <!-- Application shell: rail, topbar, one scrolling pane. -->
  <div
    v-else
    class="shell bg-default"
    :data-rail="railOpen ? 'open' : undefined"
  >
    <!-- ------------------------------------------------------------ rail -->
    <nav
      class="shell__rail border-e border-default bg-elevated/40"
      :aria-label="t('nav.navigate')"
    >
      <NuxtLink
        :to="localePath('/')"
        class="flex h-(--shell-topbar) shrink-0 items-center px-4"
      >
        <AppLogo class="h-6 w-auto" />
      </NuxtLink>

      <div class="shell__railbody px-2 py-2">
        <!-- On a lesson the rail IS the curriculum, with one control out. -->
        <template v-if="inCourse">
          <UButton
            :to="localePath('/dashboard')"
            icon="i-lucide-arrow-left"
            :label="t('nav.dashboard')"
            color="neutral"
            variant="ghost"
            size="sm"
            block
            class="mb-2 justify-start"
          />
          <CourseRail
            v-if="navigation?.length"
            :items="navigation"
          />
        </template>

        <template v-else>
          <p class="px-2 pb-1 pt-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-dimmed">
            {{ t('nav.navigate') }}
          </p>
          <UButton
            v-for="item in siteNav"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
            :color="route.path === item.to ? 'primary' : 'neutral'"
            :variant="route.path === item.to ? 'soft' : 'ghost'"
            size="md"
            block
            class="justify-start"
          />
        </template>
      </div>

      <div class="shrink-0 border-t border-default p-2">
        <ClientOnly>
          <NuxtLink
            v-if="isSignedIn"
            :to="localePath('/dashboard')"
            class="block rounded-md px-2 py-2 transition-colors hover:bg-elevated"
          >
            <span class="flex items-center gap-2">
              <UAvatar
                :alt="user?.name || user?.email || '?'"
                size="2xs"
              />
              <span class="min-w-0 flex-1 truncate text-sm text-highlighted">{{ user?.name || user?.email }}</span>
              <span class="tabular text-xs font-semibold text-primary">{{ points }}</span>
            </span>
            <!-- Course progress under the name: the one number a learner
                 wants without navigating, and the affordance that the
                 dashboard exists. -->
            <UProgress
              :model-value="percentComplete"
              :max="100"
              size="xs"
              class="mt-2"
              :aria-label="t('course.courseProgress')"
            />
          </NuxtLink>

          <UButton
            v-else
            :to="localePath('/sign-in')"
            :label="t('nav.signIn')"
            icon="i-lucide-log-in"
            block
            size="sm"
          />

          <!-- Reserves the block's height during SSR so the rail foot does
               not jump once the session resolves. -->
          <template #fallback>
            <div class="h-8" />
          </template>
        </ClientOnly>
      </div>
    </nav>

    <!-- Scrim, mobile only: tapping outside the drawer closes it. -->
    <div
      v-if="railOpen"
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      @click="railOpen = false"
    />

    <!-- ---------------------------------------------------------- topbar -->
    <header class="shell__topbar flex items-center gap-2 border-b border-default bg-default px-3">
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        size="sm"
        class="lg:hidden"
        :aria-label="t('nav.menu')"
        @click="railOpen = !railOpen"
      />

      <p class="min-w-0 truncate font-semibold text-highlighted">
        <slot name="title" />
      </p>

      <div class="ms-auto flex items-center gap-1">
        <UButton
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          size="md"
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
            size="md"
            :aria-label="t('nav.chooseLanguage')"
          />
        </UDropdownMenu>

        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="ghost"
            size="md"
            role="switch"
            :aria-checked="isDark"
            :aria-label="t('nav.theme')"
            @click="isDark = !isDark"
          />
          <template #fallback>
            <div class="size-8" />
          </template>
        </ClientOnly>

        <ClientOnly>
          <UDropdownMenu
            v-if="isSignedIn"
            :items="accountItems"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-circle-user"
              color="neutral"
              variant="ghost"
              size="md"
              :aria-label="t('nav.account')"
            />
          </UDropdownMenu>
        </ClientOnly>
      </div>
    </header>

    <!-- ------------------------------------------------------------ main -->
    <main class="shell__main">
      <slot />
    </main>
  </div>
</template>
