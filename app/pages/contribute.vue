<script setup lang="ts">
/**
 * /contribute — four ways to help, each one card and one button, then what
 * happens after you send something. The developer guide (setup, lesson
 * format, pull requests) is CONTRIBUTING.md in the repository.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const title = computed(() => t('contribute.seo.title'))
const description = computed(() => t('contribute.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })
usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage' }))

const guide = `${SITE.github}/blob/main/CONTRIBUTING.md`
const ways = computed(() => [
  { key: 'resource', icon: 'i-lucide-link', to: localePath('/submit?type=resource') },
  { key: 'lesson', icon: 'i-lucide-lightbulb', to: localePath('/submit?type=lesson') },
  { key: 'translation', icon: 'i-lucide-languages', to: localePath('/submit?type=translation') },
  { key: 'code', icon: 'i-simple-icons-github', to: guide, external: true }
])
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
        <p class="eyebrow">
          {{ t('contribute.hero.eyebrow') }}
        </p>
        <h1 class="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.02em] text-(--ink) sm:text-4xl">
          {{ t('contribute.page.title') }}
        </h1>
        <p class="mt-3 max-w-xl text-[1.0625rem] text-(--ink2)">
          {{ t('contribute.page.lead') }}
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-(--ui-container) space-y-14 px-4 py-12 sm:px-6 lg:px-8">
      <!-- Four ways -->
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="w in ways"
          :key="w.key"
        >
          <NuxtLink
            :to="w.to"
            :target="w.external ? '_blank' : undefined"
            class="bp-card bp-card--hover group flex h-full flex-col p-6"
          >
            <span class="flex size-11 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal) transition-colors group-hover:bg-(--signal) group-hover:text-white">
              <UIcon
                :name="w.icon"
                class="size-5"
              />
            </span>
            <span class="mt-4 text-lg font-bold text-(--ink)">{{ t(`contribute.page.ways.${w.key}.title`) }}</span>
            <span class="mt-1 flex-1 text-[0.9375rem] leading-relaxed text-(--ink2)">{{ t(`contribute.page.ways.${w.key}.text`) }}</span>
            <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-(--signal)">
              {{ t(`contribute.page.ways.${w.key}.cta`) }}
              <UIcon
                :name="w.external ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'"
                class="size-4"
              />
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- What happens next -->
      <section>
        <h2 class="bp-h3">
          {{ t('contribute.page.nextTitle') }}
        </h2>
        <ol class="mt-6 grid gap-4 md:grid-cols-3">
          <li
            v-for="(icon, i) in ['i-lucide-send', 'i-lucide-user-check', 'i-lucide-sparkles']"
            :key="icon"
            class="flex items-start gap-4 rounded-[6px] border border-(--line) bg-(--card) p-5"
          >
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--signal) text-white">
              <UIcon
                :name="icon"
                class="size-5"
              />
            </span>
            <span>
              <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ i + 1 }}</span>
              <span class="block font-semibold text-(--ink)">{{ t(`contribute.page.next.${i + 1}`) }}</span>
            </span>
          </li>
        </ol>
      </section>

      <p class="text-(--ink2)">
        {{ t('contribute.page.help') }}
        <a
          :href="`${SITE.github}/issues`"
          target="_blank"
          rel="noopener"
          class="font-semibold text-(--signal) hover:underline"
        >{{ t('contribute.page.helpLink') }}</a>
      </p>
    </div>
  </div>
</template>
