<script setup lang="ts">
const { footer } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const columns = computed(() => [
  {
    label: t('footer.curriculum'),
    children: [
      { label: t('nav.curriculum'), to: localePath('/start') },
      { label: t('nav.notes'), to: localePath('/notes') },
      { label: t('nav.jobs'), to: localePath('/jobs') },
      { label: t('nav.certification'), to: localePath('/certification') },
      { label: t('nav.interview'), to: localePath('/interview-questions') },
      { label: t('nav.resources'), to: localePath('/resources') },
      { label: t('nav.datasets'), to: localePath('/datasets') }
    ]
  },
  {
    label: t('footer.community'),
    children: [
      { label: t('nav.wallOfFame'), to: localePath('/wall-of-fame') },
      { label: 'YouTube', to: SITE.youtube, target: '_blank' },
      { label: t('nav.submit'), to: localePath('/submit') }
    ]
  },
  {
    label: t('footer.project'),
    children: [
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.pro'), to: localePath('/pro') },
      { label: t('nav.forTeams'), to: `${localePath('/pro')}#teams` },
      { label: t('nav.sponsor'), to: localePath('/sponsor') },
      { label: t('nav.contribute'), to: localePath('/contribute') },
      { label: t('nav.github'), to: SITE.github, target: '_blank' },
      { label: t('nav.privacy'), to: localePath('/privacy') },
      { label: t('nav.terms'), to: localePath('/terms') }
    ]
  }
])

// What the site is made of, credited in the footer. Brand names, so they are
// not translated; each links to the project's own page.
const stack = [
  { label: 'Nuxt', icon: 'i-simple-icons-nuxtdotjs', to: 'https://nuxt.com' },
  { label: 'Nuxt UI', icon: 'i-lucide-component', to: 'https://ui.nuxt.com' },
  { label: 'Tailwind CSS', icon: 'i-simple-icons-tailwindcss', to: 'https://tailwindcss.com' },
  { label: 'Cloudflare', icon: 'i-simple-icons-cloudflare', to: 'https://workers.cloudflare.com' },
  { label: 'Neon', icon: 'i-lucide-database', to: 'https://neon.com' },
  { label: 'Nuxt Studio', icon: 'i-lucide-pen-line', to: 'https://nuxt.studio' },
  { label: 'LibreTranslate', icon: 'i-lucide-languages', to: 'https://libretranslate.com' },
  { label: 'Salesforce', icon: 'i-simple-icons-salesforce', to: 'https://www.salesforce.com/analytics/crm/' }
]

// The colophon. One line per page view, chosen on the client so the
// prerendered page has a stable first line and hydration does not mismatch.
const quips = computed(() => [t('footer.quip.0'), t('footer.quip.1'), t('footer.quip.2')])
const quip = ref(0)
onMounted(() => {
  quip.value = Math.floor(Math.random() * quips.value.length)
})
</script>

<template>
  <!-- The navy footer (Namaste Salesforce). Custom markup rather than
       UFooter, because the columns sit on a dark ground it does not theme. -->
  <footer class="bg-(--navy) text-white/80">
    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
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
          <InstallApp class="mt-5 [&_button]:border-white/25 [&_button]:bg-transparent [&_button]:text-white [&_button]:ring-white/25 [&_button:hover]:bg-white/10" />
          <div class="mt-5 flex gap-2">
            <a
              v-for="(link, index) of footer?.links ?? []"
              :key="index"
              :href="link.to"
              target="_blank"
              rel="noopener"
              :aria-label="link['aria-label']"
              class="flex size-9 items-center justify-center rounded-[4px] border border-white/25 text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              <UIcon
                :name="link.icon"
                class="size-4"
              />
            </a>
          </div>
        </div>

        <div
          v-for="col in columns"
          :key="col.label"
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
                :target="'target' in link ? link.target : undefined"
                class="text-sm text-white/75 hover:text-white"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Built with: the stack, credited -->
    <div class="border-t border-white/15">
      <div class="mx-auto flex max-w-(--ui-container) flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
        <p class="shrink-0 font-medium text-[11px] text-(--glow)">
          {{ t('footer.builtWith') }}
        </p>
        <ul class="flex flex-wrap gap-1.5">
          <li
            v-for="s in stack"
            :key="s.label"
          >
            <a
              :href="s.to"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-1.5 border border-white/25 px-2 py-1 font-mono text-[11px] text-white/75 hover:border-(--glow) hover:text-white"
            >
              <UIcon
                :name="s.icon"
                class="size-3.5"
                aria-hidden="true"
              />{{ s.label }}
            </a>
          </li>
        </ul>
        <a
          :href="SITE.github"
          target="_blank"
          rel="noopener"
          class="flex shrink-0 items-center gap-2 text-sm text-white/70 hover:text-white lg:ms-auto"
        >
          <UIcon
            name="i-lucide-star"
            class="size-4 text-(--glow)"
            aria-hidden="true"
          />{{ t('footer.builtWithNote') }}
        </a>
      </div>
    </div>
    <div class="border-t border-white/15">
      <div class="mx-auto flex max-w-(--ui-container) flex-wrap items-center justify-between gap-3 px-4 py-4 font-medium text-[11px] text-white/60 sm:px-6 lg:px-8">
        <span>© {{ new Date().getFullYear() }} CRM Analytics Academy — not affiliated with Salesforce, Inc.</span>
        <span class="flex gap-5">
          <NuxtLink
            :to="localePath('/terms')"
            class="hover:text-white"
          >Terms</NuxtLink>
          <NuxtLink
            :to="localePath('/privacy')"
            class="hover:text-white"
          >Privacy</NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="hover:text-white"
          >Contact</NuxtLink>
        </span>
      </div>
    </div>
    <!-- Colophon strip -->
    <div class="bg-(--glow) text-(--navy)">
      <div class="mx-auto flex max-w-(--ui-container) flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-[13px] sm:px-6 lg:px-8">
        <UIcon
          name="i-lucide-coffee"
          class="size-4 flex-none"
          aria-hidden="true"
        />
        <span>{{ quips[quip] }}</span>
      </div>
    </div>
  </footer>
</template>
