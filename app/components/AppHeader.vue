<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const colorMode = useColorMode()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// The six destinations from the Blueprint spec, drawn as full-height cells.
// Everything else lives in the mobile menu and the footer.
const menuItems = computed(() => [
  { label: t('nav.home'), icon: 'i-lucide-house', to: localePath('/'), exact: true },
  { label: t('nav.curriculum'), icon: 'i-lucide-graduation-cap', to: localePath('/curriculum') },
  { label: t('nav.pricing'), icon: 'i-lucide-tag', to: '/pricing' },
  { label: t('nav.showcase'), icon: 'i-lucide-layout-dashboard', to: localePath('/showcase') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') }
])

function isActive(item: { to: string, exact?: boolean }) {
  if (item.exact) return route.path === item.to || route.path === `${item.to}/`
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

// The rest of the site, for the mobile slideover only.
const extraItems = computed(() => [
  { label: t('nav.ask'), icon: 'i-lucide-sparkles', to: localePath('/ask') },
  { label: t('nav.forTeams'), icon: 'i-lucide-users', to: '/teams' },
  { label: t('nav.training'), icon: 'i-lucide-school', to: '/training' },
  { label: t('nav.implementation'), icon: 'i-lucide-wrench', to: '/implementation' },
  { label: t('nav.jobs'), icon: 'i-lucide-briefcase', to: localePath('/jobs') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.wallOfFame'), icon: 'i-lucide-heart-handshake', to: localePath('/wall-of-fame') },
  { label: t('nav.companies'), icon: 'i-lucide-building-2', to: localePath('/companies') },
  { label: t('nav.leaderboard'), icon: 'i-lucide-trophy', to: localePath('/leaderboard') },
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.sponsor'), icon: 'i-lucide-heart', to: localePath('/sponsor') },
  { label: t('nav.github'), icon: 'i-simple-icons-github', to: 'https://github.com/imswarnil/CRM-Analytics-Academy', target: '_blank' }
])

// Account menu — the session itself is fetched once in app.vue.
const { user, isSignedIn, signOut } = useAuth()
const { pro } = useProgress()

// Whether to show the admin console link. Asked once per session, only for a
// signed-in user, and only on the client — the console itself enforces the
// role on every request, so this is navigation, not access control.
const role = ref<string | null>(null)
watch(isSignedIn, async (ok) => {
  if (!ok || import.meta.server) {
    role.value = null
    return
  }
  try {
    role.value = (await $fetch<{ role: string | null }>('/api/admin/me')).role
  } catch {
    role.value = null
  }
}, { immediate: true })

const initials = computed(() => (user.value?.name || user.value?.email || '?').trim().slice(0, 1).toUpperCase())

const accountItems = computed(() => [
  [{
    type: 'label' as const,
    label: user.value?.name || user.value?.email || t('nav.account'),
    avatar: user.value?.image ? { src: user.value.image } : undefined
  }],
  [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
    { label: t('nav.leaderboard'), icon: 'i-lucide-trophy', to: localePath('/leaderboard') },
    { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit') },
    pro.value
      ? { label: 'Pro — active', icon: 'i-lucide-badge-check', to: localePath('/dashboard') }
      : { label: 'Upgrade to Pro', icon: 'i-lucide-sparkles', to: '/pricing', color: 'primary' as const }
  ],
  ...(role.value === 'admin' || role.value === 'moderator'
    ? [[{ label: 'Admin console', icon: 'i-lucide-shield', to: localePath('/admin') }]]
    : []),
  [{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: () => signOut() }]
])

// Language switcher — use setLocale so the choice is persisted (cookie) and
// the browser-language auto-redirect doesn't bounce the user back.
const localeItems = computed(() =>
  locales.value.map(l => ({
    label: l.name || l.code,
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    onSelect: () => setLocale(l.code)
  }))
)
</script>

<template>
  <UHeader
    :ui="{ center: 'hidden', left: 'lg:flex-none', right: 'lg:flex-1', body: 'flex flex-col h-full p-0 overflow-hidden', toggle: 'rounded-none border-[1.5px] border-(--ink) size-9 flex items-center justify-center' }"
    :to="localePath('/')"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0"
        aria-label="CRM Analytics Academy — home"
      >
        <AppLogo />
      </NuxtLink>

      <!-- Nav cells, full header height, hairline-separated. -->
      <nav
        class="ms-6 hidden h-16 items-stretch border-s border-(--line) min-[1060px]:flex"
        aria-label="Main"
      >
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="relative flex items-center border-e border-(--line) px-4 text-[15px] font-semibold transition-colors"
          :class="isActive(item) ? 'bg-(--ice) text-(--signal)' : 'text-(--ink) hover:bg-(--ice)/60'"
        >
          {{ item.label }}
          <span
            v-if="isActive(item)"
            class="absolute inset-x-0 bottom-0 h-[3px] bg-(--signal)"
          />
        </NuxtLink>
      </nav>
    </template>

    <template #right>
      <div class="ms-auto flex items-center gap-2">
        <UContentSearchButton
          v-if="header?.search"
          :collapsed="false"
          class="hidden h-9 rounded-none border-[1.5px] border-(--ink) bg-(--card) px-3 font-mono text-xs text-(--ink2) ring-0 hover:bg-(--ice) sm:flex"
          label=""
        />
        <UContentSearchButton
          v-if="header?.search"
          class="size-9 rounded-none border-[1.5px] border-(--ink) sm:hidden"
        />

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
            <UIcon
              name="i-lucide-chevron-down"
              class="size-3.5"
            />
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
              <span
                v-if="pro"
                class="font-mono text-[10px] uppercase tracking-[.08em] text-(--signal) max-sm:hidden"
              >Pro</span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-3.5 text-(--ink2)"
              />
            </button>
          </UDropdownMenu>
          <UButton
            v-else
            to="/pricing"
            size="sm"
            trailing-icon="i-lucide-arrow-up-right"
            class="max-sm:hidden"
          >
            {{ t('nav.enroll') }}
          </UButton>
          <template #fallback>
            <div class="h-9 w-24 max-sm:hidden" />
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

      <div class="flex items-center justify-between gap-2 border-t-[1.5px] border-(--ink) px-5 py-3">
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
