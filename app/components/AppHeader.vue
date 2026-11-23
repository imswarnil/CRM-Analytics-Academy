<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { header } = useAppConfig()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Four plain links, the same for everyone: signed in or out, the bar never
// changes shape. The account slot on the right has one fixed width in both
// states, so the room left for the links (and whether titles fit) is too.
const NAV = [
  { key: 'course', icon: 'i-lucide-graduation-cap', to: '/start' },
  { key: 'exam', icon: 'i-lucide-badge-check', to: '/certification' },
  { key: 'interview', icon: 'i-lucide-messages-square', to: '/interview-questions' },
  { key: 'jobs', icon: 'i-lucide-briefcase-business', to: '/jobs' }
] as const
// Exam mode (a running practice paper): the bar shrinks to the logo, the
// paper's name and one way out, like a test centre's screen.
const focusState = useState('exam-focus', () => false)
const examMode = computed(() => Boolean(route.meta.focus) || focusState.value)
// While the clock runs the paper puts its own controls (progress, timer,
// navigator, submit, exit) into #exam-bar, so there is one bar, not two.
const examRunning = useState('exam-running', () => false)

const menuItems = computed(() => NAV.map(n => ({ label: t(`nav.main.${n.key}`), icon: n.icon, to: localePath(n.to) })))
const phoneItems = menuItems
// Icon + label, or icons alone — never a clipped label. Once mounted, a hidden
// copy with labels is measured and the labels stay only if all of them fit.
const navEl = ref<HTMLElement | null>(null)
const rowProbe = ref<HTMLElement | null>(null)
const mode = ref<'row' | 'icon'>('row')
function fit() {
  const nav = navEl.value
  if (!nav || !nav.clientWidth || !rowProbe.value) return
  mode.value = rowProbe.value.scrollWidth + 4 * menuItems.value.length <= nav.clientWidth ? 'row' : 'icon'
}
let navRo: ResizeObserver | undefined
onMounted(() => {
  navRo = new ResizeObserver(() => fit())
  if (navEl.value) navRo.observe(navEl.value)
  fit()
})
onBeforeUnmount(() => navRo?.disconnect())
watch(locale, () => nextTick(fit))

function isActive(item: { to: string, exact?: boolean }) {
  if (item.exact) return route.path === item.to || route.path === `${item.to}/`
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

// The rest of the site, for the mobile slideover only.
const extraItems = computed(() => [
  { label: t('nav.jobs'), icon: 'i-lucide-briefcase-business', to: localePath('/jobs') },
  { label: t('nav.notes'), icon: 'i-lucide-notebook-pen', to: localePath('/notes') },
  { label: t('nav.resources'), icon: 'i-lucide-library-big', to: localePath('/resources') },
  { label: t('nav.wallOfFame'), icon: 'i-lucide-heart-handshake', to: localePath('/wall-of-fame') },
  { label: t('nav.companies'), icon: 'i-lucide-building-2', to: localePath('/companies') },
  { label: t('nav.datasets'), icon: 'i-lucide-database', to: localePath('/datasets') },
  { label: t('nav.about'), icon: 'i-lucide-badge-info', to: localePath('/about') },
  { label: t('nav.hire'), icon: 'i-lucide-briefcase', to: localePath('/hire') },
  { label: t('nav.contribute'), icon: 'i-lucide-git-pull-request', to: localePath('/contribute') },
  { label: t('nav.youtube'), icon: 'i-simple-icons-youtube', to: SITE.youtube, target: '_blank' },
  { label: t('nav.github'), icon: 'i-simple-icons-github', to: SITE.github, target: '_blank' }
])

const signInTo = computed(() => ({ path: localePath('/sign-in'), query: route.path.match(/\/sign-(in|up)/) ? {} : { redirect: route.fullPath } }))

// Account menu — the session itself is fetched once in app.vue.
const { user, isSignedIn, signOut } = useAuth()
// The admin flag arrives with progress (one request, made once a session
// exists). The console checks it on every request; this is navigation only.
const { admin, pro } = useProgress()

// Shown for the admin account; the console itself re-checks id + email on
// every request, so this only decides whether the link appears.
const isAdminUser = computed(() => admin.value || user.value?.email?.toLowerCase() === 'imswarnil@gmail.com')
const initials = computed(() => (user.value?.name || user.value?.email || '?').trim().slice(0, 1).toUpperCase())
const firstName = computed(() => (user.value?.name || '').trim().split(/\s+/)[0] || t('nav.account'))

const accountItems = computed(() => [
  [{ type: 'label' as const, slot: 'profile' as const, label: user.value?.name || user.value?.email || t('nav.account') }],
  [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') },
    { label: t('nav.billing'), icon: 'i-lucide-credit-card', to: localePath('/account') },
    { label: t('nav.team'), icon: 'i-lucide-building-2', to: localePath('/team') },
    { label: t('nav.submit'), icon: 'i-lucide-circle-plus', to: localePath('/submit') }
  ],
  ...(isAdminUser.value
    ? [[{ label: 'Admin console', icon: 'i-lucide-shield-check', to: '/admin', color: 'primary' as const }]]
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
    :toggle="!examMode"
    :ui="{ container: examRunning ? 'max-w-none' : 'max-w-(--ui-container)', center: 'hidden', left: examMode ? 'min-w-0 flex-1' : 'lg:min-w-0 lg:flex-1', right: examMode ? 'flex-none lg:flex-none' : 'lg:flex-none', body: 'flex flex-col h-full p-0 overflow-hidden', toggle: 'rounded-[4px] border border-(--line) size-9 flex items-center justify-center' }"
    :to="localePath('/')"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0"
        :aria-label="t('nav.homeAria')"
      >
        <AppLogo
          compact
          :short="examRunning"
        />
      </NuxtLink>

      <!-- Nav cells, full header height, hairline-separated. -->
      <!-- The nav takes whatever width the buttons leave (a container), and
           shows labels only when they fit in it — in any language. -->
      <div
        v-if="examMode"
        id="exam-bar"
        class="contents"
      />
      <p
        v-if="examMode && !examRunning"
        class="ms-4 flex min-w-0 items-center gap-2 border-s border-(--line) ps-4 text-sm font-semibold text-(--ink)"
      >
        <UIcon
          name="i-lucide-badge-check"
          class="size-4 shrink-0 text-(--signal)"
        />
        <span class="truncate max-sm:sr-only">{{ t('nav.examMode') }}</span>
      </p>
      <nav
        v-show="!examMode"
        ref="navEl"
        class="relative ms-4 hidden h-16 min-w-0 flex-1 items-center overflow-hidden lg:flex"
        aria-label="Main"
      >
        <!-- A hidden labelled copy, measured by fit() -->
        <div
          class="pointer-events-none invisible absolute flex flex-col"
          aria-hidden="true"
        >
          <div
            ref="rowProbe"
            class="flex w-max"
          >
            <span
              v-for="item in menuItems"
              :key="item.to"
              class="flex items-center gap-2 px-3.5 text-[14px] font-medium whitespace-nowrap"
            ><span class="size-4" />{{ item.label }}</span>
          </div>
        </div>
        <div class="flex w-max items-center gap-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            :title="mode === 'icon' ? item.label : undefined"
            class="group flex h-9 shrink-0 items-center gap-2 rounded-[4px] px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors duration-150"
            :class="isActive(item) ? 'bg-(--ice) text-(--signal)' : 'text-(--ink) hover:bg-(--paper) hover:text-(--signal)'"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              class="size-4 shrink-0 transition-colors"
              :class="isActive(item) ? 'text-(--signal)' : 'text-(--ink2) group-hover:text-(--signal)'"
            />
            <span :class="mode === 'icon' ? 'sr-only' : 'leading-none'">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>
    </template>

    <template #right>
      <UButton
        v-if="examMode && !examRunning"
        :to="localePath('/certification')"
        icon="i-lucide-x"
        color="neutral"
        variant="outline"
        size="sm"
      >
        {{ t('nav.exitExam') }}
      </UButton>
      <div
        v-else-if="!examMode"
        class="ms-auto flex shrink-0 items-center gap-1"
      >
        <!-- Quiet tools: borderless icons, one group. -->
        <div class="flex items-center gap-0.5">
          <UContentSearchButton
            v-if="header?.search"
            class="nav-icon"
            variant="ghost"
            color="neutral"
          />
          <UDropdownMenu
            :items="localeItems"
            :content="{ align: 'end' }"
            class="max-lg:hidden"
          >
            <button
              type="button"
              class="nav-icon w-auto gap-1 px-2 text-xs font-bold uppercase"
              :aria-label="t('nav.chooseLanguage')"
              :title="t('nav.chooseLanguage')"
            >
              <UIcon
                name="i-lucide-globe"
                class="size-[1.125rem]"
              />{{ locale }}
            </button>
          </UDropdownMenu>
          <UTooltip :text="t('nav.youtube')">
            <a
              :href="SITE.youtube"
              target="_blank"
              rel="noopener"
              class="nav-icon max-md:hidden"
              :aria-label="t('nav.youtube')"
            ><UIcon
              name="i-simple-icons-youtube"
              class="size-[1.125rem]"
            /></a>
          </UTooltip>
          <UTooltip :text="t('nav.github')">
            <a
              :href="SITE.github"
              target="_blank"
              rel="noopener"
              class="nav-icon max-md:hidden"
              :aria-label="t('nav.github')"
            ><UIcon
              name="i-simple-icons-github"
              class="size-[1.125rem]"
            /></a>
          </UTooltip>
          <ClientOnly>
            <UButton
              v-if="!pro"
              :to="localePath('/pro')"
              size="sm"
              variant="soft"
              icon="i-lucide-crown"
              class="ms-1 max-sm:hidden"
            >
              {{ t('pro.tag') }}
            </UButton>
          </ClientOnly>
        </div>

        <span
          class="mx-2 h-6 w-px bg-(--line) max-sm:hidden"
          aria-hidden="true"
        />

        <!-- Account: one fixed-width slot either way, so the bar keeps its
             shape across sign-in. Dashboard and admin live in the menu. -->
        <div class="flex shrink-0 items-center justify-end gap-2 sm:w-[8.5rem]">
          <ClientOnly>
            <UDropdownMenu
              v-if="isSignedIn"
              :items="accountItems"
              :content="{ align: 'end', sideOffset: 8 }"
              :ui="{ content: 'w-72', item: 'py-2 text-[0.9375rem]', itemLeadingIcon: 'size-5' }"
            >
              <template #profile>
                <div class="flex items-center gap-3 px-1 py-2">
                  <span class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--signal) text-lg font-bold text-white">
                    <img
                      v-if="user?.image"
                      :src="user.image"
                      alt=""
                      class="size-full object-cover"
                    >
                    <template v-else>{{ initials }}</template>
                  </span>
                  <span class="min-w-0">
                    <span class="flex items-center gap-2 text-base font-bold normal-case tracking-normal text-(--ink)">
                      <span class="truncate">{{ user?.name || firstName }}</span>
                      <span
                        v-if="pro"
                        class="shrink-0 rounded-full bg-(--navy) px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em] text-white"
                      >{{ t('pro.tag') }}</span>
                    </span>
                    <span class="block truncate text-sm font-normal normal-case tracking-normal text-(--ink2)">{{ user?.email }}</span>
                  </span>
                </div>
              </template>
              <button
                type="button"
                class="flex h-9 max-w-full items-center gap-2 rounded-full ps-0.5 pe-2 text-sm font-semibold text-(--ink) hover:bg-(--paper2)"
                :aria-label="user?.name || user?.email || t('nav.account')"
              >
                <span class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--signal) text-sm font-semibold text-white">
                  <img
                    v-if="user?.image"
                    :src="user.image"
                    alt=""
                    class="size-full object-cover"
                  >
                  <template v-else>{{ initials }}</template>
                </span>
                <span class="truncate max-sm:hidden">{{ firstName }}</span>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-4 shrink-0 text-(--ink2) max-sm:hidden"
                />
              </button>
            </UDropdownMenu>
            <template v-else>
              <UButton
                :to="signInTo"
                size="md"
                class="h-9 justify-center whitespace-nowrap px-4"
                :aria-label="t('nav.signIn')"
              >
                {{ t('nav.signIn') }}
              </UButton>
            </template>
            <template #fallback>
              <div class="h-9 w-full" />
            </template>
          </ClientOnly>
        </div>
      </div>
    </template>

    <template #body>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <!-- Numbered rows, as in the spec's mobile menu. -->
        <nav class="border-b border-(--line)">
          <NuxtLink
            v-for="(item, i) in [...phoneItems, ...extraItems.filter(x => !phoneItems.some(p => p.to === x.to))]"
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

        <div
          v-if="navigation?.length"
          class="p-5"
        >
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

      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-(--line) px-5 py-3">
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
        <UColorModeButton class="rounded-[4px] border border-(--line)" />
      </div>
    </template>
  </UHeader>
</template>

<style scoped>
.nav-icon {
  display: inline-flex;
  height: 2.25rem;
  min-width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--ink2);
  transition: background-color .15s, color .15s;
}
.nav-icon:hover { background: var(--paper2); color: var(--ink); }
</style>
