<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const colorMode = useColorMode()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// The main destinations, drawn as full-height cells with an icon each. The
// label folds away below xl so the row fits; the icon and its title remain.
const menuItems = computed(() => [
  { label: t('nav.curriculum'), icon: 'i-lucide-graduation-cap', to: localePath('/curriculum') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.wallOfFame'), icon: 'i-lucide-heart-handshake', to: localePath('/wall-of-fame') },
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') }
])

function isActive(item: { to: string, exact?: boolean }) {
  if (item.exact) return route.path === item.to || route.path === `${item.to}/`
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

// The rest of the site, for the mobile slideover only.
const extraItems = computed(() => [
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.youtube'), icon: 'i-simple-icons-youtube', to: SITE.youtube, target: '_blank' },
  { label: t('nav.github'), icon: 'i-simple-icons-github', to: SITE.github, target: '_blank' }
])

const signInTo = computed(() => ({ path: localePath('/sign-in'), query: route.path.match(/\/sign-(in|up)/) ? {} : { redirect: route.fullPath } }))
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: route.path.match(/\/sign-(in|up)/) ? {} : { redirect: route.fullPath } }))

// Account menu — the session itself is fetched once in app.vue.
const { user, isSignedIn, signOut } = useAuth()
// The admin flag arrives with progress (one request, made once a session
// exists). The console checks it on every request; this is navigation only.
const { admin } = useProgress()

const initials = computed(() => (user.value?.name || user.value?.email || '?').trim().slice(0, 1).toUpperCase())

const accountItems = computed(() => [
  [{
    type: 'label' as const,
    label: user.value?.name || user.value?.email || t('nav.account'),
    avatar: user.value?.image ? { src: user.value.image } : undefined
  }],
  [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
    { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit') }
  ],
  ...(admin.value
    ? [[{ label: 'Admin console', icon: 'i-lucide-shield', to: '/admin' }]]
    : []),
  [{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: () => signOut() }]
])

// Language switcher. The choice is written to the same cookie the first-visit
// auto-pick reads, so picking a language here ends auto-detection for good.
const localeChoice = useCookie<string | null>(LOCALE_CHOICE_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
const localeItems = computed(() =>
  locales.value.map(l => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    onSelect: () => {
      localeChoice.value = l.code
      setLocale(l.code)
    }
  }))
)
</script>

<template>
  <UHeader
    :ui="{ container: 'max-w-(--ui-container)', center: 'hidden', left: 'lg:flex-none', right: 'lg:flex-1', body: 'flex flex-col h-full p-0 overflow-hidden', toggle: 'rounded-none border-[1.5px] border-(--ink) size-9 flex items-center justify-center' }"
    :to="localePath('/')"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0"
        :aria-label="t('nav.homeAria')"
      >
        <AppLogo compact />
      </NuxtLink>

      <!-- Nav cells, full header height, hairline-separated. -->
      <nav
        class="ms-4 hidden h-16 items-stretch border-s border-(--line) lg:flex"
        aria-label="Main"
      >
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :title="item.label"
          class="relative flex items-center gap-2 border-e border-(--line) px-3 text-[14px] font-semibold whitespace-nowrap transition-colors"
          :class="isActive(item) ? 'bg-(--ice) text-(--signal)' : 'text-(--ink) hover:bg-(--ice)/60'"
        >
          <UIcon
            :name="item.icon"
            class="size-4 shrink-0"
          />
          <span class="max-[1400px]:sr-only">{{ item.label }}</span>
          <span
            v-if="isActive(item)"
            class="absolute inset-x-0 bottom-0 h-[3px] bg-(--signal)"
          />
        </NuxtLink>
      </nav>
    </template>

    <template #right>
      <div class="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
        <!-- Icon-only at every width: the container stops growing at
             --ui-container, so a wide search box never has room beside the
             account buttons (it used to push "Sign in" onto two lines). -->
        <UContentSearchButton
          v-if="header?.search"
          class="size-9 shrink-0 rounded-none border-[1.5px] border-(--ink)"
        />

        <a
          :href="SITE.youtube"
          target="_blank"
          rel="noopener"
          class="flex size-9 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--card) text-(--ink) hover:bg-(--ice) hover:text-[#FF0000] max-lg:hidden"
          :aria-label="t('nav.youtube')"
          :title="t('nav.youtube')"
        >
          <UIcon
            name="i-simple-icons-youtube"
            class="size-4"
          />
        </a>

        <!-- Star on GitHub. A plain link: no API call, so no count to go stale
             or to spend the anonymous GitHub rate limit. -->
        <a
          :href="SITE.github"
          target="_blank"
          rel="noopener"
          class="flex size-9 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--card) text-(--ink) hover:bg-(--ice) max-lg:hidden"
          :aria-label="t('nav.starOnGithub')"
          :title="t('nav.starOnGithub')"
        >
          <UIcon
            name="i-simple-icons-github"
            class="size-4"
          />
        </a>

        <UDropdownMenu
          :items="localeItems"
          :content="{ align: 'end' }"
          class="max-lg:hidden"
        >
          <button
            type="button"
            class="flex h-9 items-center gap-1.5 border-[1.5px] border-(--ink) bg-(--card) px-2.5 font-mono text-xs uppercase text-(--ink) hover:bg-(--ice)"
            :aria-label="t('nav.chooseLanguage')"
          >
            <UIcon
              name="i-lucide-languages"
              class="size-4"
            />
            {{ locale }}
          </button>
        </UDropdownMenu>

        <ClientOnly>
          <button
            v-if="header?.colorMode"
            type="button"
            class="group flex size-9 items-center justify-center border-[1.5px] border-(--ink) bg-(--card) text-(--ink) hover:bg-(--ice) max-lg:hidden"
            :aria-label="t('nav.theme')"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          >
            <UIcon
              :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              class="size-4 transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] group-hover:rotate-90"
            />
          </button>
          <template #fallback>
            <div class="size-9 max-lg:hidden" />
          </template>
        </ClientOnly>

        <ClientOnly>
          <UDropdownMenu
            v-if="isSignedIn"
            :items="accountItems"
            :content="{ align: 'end' }"
          >
            <button
              type="button"
              class="flex h-9 items-center gap-2 border-[1.5px] border-(--ink) bg-(--card) pe-2.5 hover:bg-(--ice)"
              :aria-label="user?.name || user?.email || t('nav.account')"
            >
              <span class="flex size-[33px] items-center justify-center overflow-hidden border-e-[1.5px] border-(--ink) bg-(--signal) font-bold text-white">
                <img
                  v-if="user?.image"
                  :src="user.image"
                  alt=""
                  class="size-full object-cover"
                >
                <template v-else>{{ initials }}</template>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-3.5 text-(--ink2)"
              />
            </button>
          </UDropdownMenu>
          <div
            v-else
            class="flex shrink-0 flex-nowrap items-center gap-2"
          >
            <UButton
              :to="signInTo"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-log-in"
              class="shrink-0 whitespace-nowrap max-lg:hidden"
            >
              {{ t('nav.signIn') }}
            </UButton>
            <UButton
              :to="signUpTo"
              size="sm"
              icon="i-lucide-user-plus"
              :aria-label="t('nav.enrollFree')"
              class="shrink-0 whitespace-nowrap"
            >
              <span class="max-sm:sr-only">{{ t('nav.enrollFree') }}</span>
            </UButton>
          </div>
          <template #fallback>
            <div class="h-9 w-9 sm:w-56" />
          </template>
        </ClientOnly>
      </div>
    </template>

    <template #body>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <!-- Numbered rows, as in the spec's mobile menu. -->
        <nav class="border-b-[1.5px] border-(--ink)">
          <NuxtLink
            v-for="(item, i) in [...menuItems, ...extraItems]"
            :key="item.to"
            :to="item.to"
            class="bp-row flex items-center gap-4 border-b border-(--line) px-5 py-3.5 text-lg font-bold last:border-b-0"
            :class="'exact' in item && isActive(item as { to: string, exact?: boolean }) ? 'text-(--signal)' : 'text-(--ink)'"
          >
            <span class="font-mono text-xs text-(--signal)">{{ String(i + 1).padStart(2, '0') }}</span>
            <UIcon
              :name="item.icon"
              class="size-5 shrink-0 text-(--ink2)"
            />
            {{ item.label }}
            <UIcon
              name="i-lucide-arrow-right"
              class="bp-arrow ms-auto size-4 text-(--ink2)"
            />
          </NuxtLink>
        </nav>

        <div class="p-5">
          <p class="eyebrow mb-3">
            Course contents
          </p>
          <UContentNavigation
            highlight
            type="single"
            :navigation="navigation"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] border-(--ink) px-5 py-3">
        <ClientOnly>
          <UButton
            v-if="!isSignedIn"
            :to="signInTo"
            icon="i-lucide-log-in"
            color="neutral"
            variant="outline"
            size="sm"
          >
            {{ t('nav.signIn') }}
          </UButton>
        </ClientOnly>
        <UDropdownMenu
          :items="localeItems"
          :content="{ align: 'start' }"
        >
          <UButton
            icon="i-lucide-languages"
            :label="t('nav.chooseLanguage')"
            color="neutral"
            variant="outline"
            size="sm"
          />
        </UDropdownMenu>
        <UColorModeButton class="rounded-none border-[1.5px] border-(--ink)" />
      </div>
    </template>
  </UHeader>
</template>
