<script setup lang="ts">
/**
 * The navy footer: the brand, three short columns, one bottom line. Everything
 * the header leaves out on purpose (Jobs, YouTube, GitHub, the theme) lives
 * here, so the header can stay at four links.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()

const columns = computed(() => [
  {
    label: t('footer.learn'),
    children: [
      { label: t('nav.main.course'), to: localePath('/start') },
      { label: t('nav.main.exam'), to: localePath('/certification') },
      { label: t('nav.main.interview'), to: localePath('/interview-questions') },
      { label: t('nav.notes'), to: localePath('/notes') },
      { label: t('nav.jobs'), to: localePath('/jobs') }
    ]
  },
  {
    label: t('footer.community'),
    children: [
      { label: t('nav.resources'), to: localePath('/resources') },
      { label: t('nav.datasets'), to: localePath('/datasets') },
      { label: t('nav.wallOfFame'), to: localePath('/wall-of-fame') },
      { label: t('nav.submit'), to: localePath('/submit') },
      { label: t('nav.contribute'), to: localePath('/contribute') }
    ]
  },
  {
    label: t('footer.project'),
    children: [
      { label: t('nav.pro'), to: localePath('/pro') },
      { label: t('nav.forTeams'), to: `${localePath('/pro')}#teams` },
      { label: t('nav.sponsor'), to: localePath('/sponsor') },
      { label: t('nav.about'), to: localePath('/about') }
    ]
  }
])
const social = [
  { label: 'YouTube', icon: 'i-simple-icons-youtube', to: SITE.youtube },
  { label: 'GitHub', icon: 'i-simple-icons-github', to: SITE.github }
]
</script>

<template>
  <footer class="bg-(--navy) text-white/80">
    <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:px-8">
      <div>
        <NuxtLink
          :to="localePath('/')"
          :aria-label="t('nav.homeAria')"
        >
          <AppLogo inverted />
        </NuxtLink>
        <p class="mt-4 max-w-xs text-sm text-white/65">
          {{ t('footer.tagline') }}
        </p>
        <div class="mt-5 flex flex-wrap items-center gap-2">
          <a
            v-for="s in social"
            :key="s.label"
            :href="s.to"
            target="_blank"
            rel="noopener"
            :aria-label="s.label"
            :title="s.label"
            class="flex size-9 items-center justify-center rounded-[4px] border border-white/25 text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            <UIcon
              :name="s.icon"
              class="size-4"
            />
          </a>
          <InstallApp class="[&_button]:border-white/25 [&_button]:bg-transparent [&_button]:text-white [&_button]:ring-white/25 [&_button:hover]:bg-white/10" />
        </div>
      </div>

      <nav
        v-for="col in columns"
        :key="col.label"
        :aria-label="col.label"
      >
        <p class="text-xs font-bold uppercase tracking-[.09em] text-blueprint-300">
          {{ col.label }}
        </p>
        <ul class="mt-4 space-y-2.5">
          <li
            v-for="link in col.children"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="text-sm text-white/75 hover:text-white"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="border-t border-white/15">
      <div class="mx-auto flex max-w-(--ui-container) flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/60 sm:px-6 lg:px-8">
        <span>© {{ new Date().getFullYear() }} CRM Analytics Academy · {{ t('footer.notAffiliated') }}</span>
        <span class="flex flex-wrap items-center gap-5">
          <NuxtLink
            :to="localePath('/terms')"
            class="hover:text-white"
          >{{ t('nav.terms') }}</NuxtLink>
          <NuxtLink
            :to="localePath('/privacy')"
            class="hover:text-white"
          >{{ t('nav.privacy') }}</NuxtLink>
          <ClientOnly>
            <button
              type="button"
              class="flex items-center gap-1.5 hover:text-white"
              :aria-label="t('nav.theme')"
              @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
            >
              <UIcon
                :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
                class="size-4"
              />{{ t('nav.theme') }}
            </button>
          </ClientOnly>
        </span>
      </div>
    </div>
  </footer>
</template>
