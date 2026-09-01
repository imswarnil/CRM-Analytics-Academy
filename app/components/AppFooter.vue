<script setup lang="ts">
/**
 * The design system's footer: an ink slab under an ink line, sky-blue column
 * headings, slate links. Deliberately the same in both colour modes — it is
 * already the dark surface.
 */
const { footer } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const columns = computed(() => [
  {
    label: t('footer.curriculum'),
    children: [
      { label: t('home.modules.foundations.title'), to: localePath('/foundations') },
      { label: 'Interview questions', to: localePath('/foundations/interview-questions') },
      { label: t('nav.resources'), to: localePath('/resources') },
      { label: t('nav.datasets'), to: localePath('/datasets') }
    ]
  },
  {
    label: t('footer.project'),
    children: [
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.contribute'), to: localePath('/contribute') },
      { label: t('nav.roadmap'), to: localePath('/roadmap') },
      { label: t('nav.sponsor'), to: localePath('/sponsor') },
      { label: t('nav.github'), to: 'https://github.com/imswarnil/CRM-Analytics-Academy', target: '_blank' }
    ]
  },
  {
    label: t('footer.legal'),
    children: [
      { label: t('nav.privacy'), to: localePath('/privacy') },
      { label: t('nav.terms'), to: localePath('/terms') }
    ]
  }
])
</script>

<template>
  <footer class="border-t-[3px] border-(--nb-ink) bg-ink text-slate-400">
    <UContainer class="py-12">
      <div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div>
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center gap-2.5"
          >
            <span class="flex size-8 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="13"
                  width="4"
                  height="8"
                  rx="1"
                  fill="#fff"
                />
                <rect
                  x="9"
                  y="8"
                  width="4"
                  height="13"
                  rx="1"
                  fill="#fff"
                />
                <rect
                  x="15"
                  y="3"
                  width="4"
                  height="18"
                  rx="1"
                  fill="#fff"
                />
              </svg>
            </span>
            <span class="font-display text-sm font-bold text-white">CRM Analytics Academy</span>
          </NuxtLink>
          <p class="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            {{ t('footer.tagline') }}
          </p>
          <div
            v-if="footer?.links"
            class="mt-4 flex items-center gap-1"
          >
            <UButton
              v-for="(link, index) of footer.links"
              :key="index"
              v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
              class="text-slate-400 hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-x-16 gap-y-8">
          <nav
            v-for="column in columns"
            :key="column.label"
            :aria-label="column.label"
          >
            <p class="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-brand-sky">
              {{ column.label }}
            </p>
            <ul class="mt-3 space-y-2">
              <li
                v-for="child in column.children"
                :key="child.label"
              >
                <NuxtLink
                  :to="child.to"
                  :target="child.target"
                  class="text-[0.8125rem] text-slate-400 transition-colors hover:text-white"
                >
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-600">
        {{ footer.credits }}
      </div>
    </UContainer>
  </footer>
</template>
