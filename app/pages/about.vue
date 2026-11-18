<script setup lang="ts">
import { AUTHOR } from '~/data/author'
import { ROADMAP } from '~/data/roadmap'

const { t } = useI18n()
const localePath = useLocalePath()
const title = computed(() => t('seo.aboutTitle'))
const description = computed(() => t('seo.aboutDesc'))

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Docs', { title: title.value, description: description.value })

usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'AboutPage',
  extra: [{
    '@type': 'Person',
    'name': AUTHOR.name,
    'url': 'https://imswarnil.com',
    'image': `${SITE.url}${AUTHOR.avatar}`,
    'description': AUTHOR.summary,
    'jobTitle': AUTHOR.role,
    'worksFor': { '@type': 'Organization', 'name': AUTHOR.company },
    'workLocation': { '@type': 'Place', 'name': AUTHOR.place },
    'alumniOf': { '@type': 'CollegeOrUniversity', 'name': AUTHOR.education.school },
    'hasOccupation': AUTHOR.roles.map(r => ({ '@type': 'Occupation', 'name': r.title, 'description': `${r.company}, ${r.place} (${r.years})` })),
    'knowsAbout': AUTHOR.skills.flatMap(g => g.items),
    'sameAs': AUTHOR.social.map(s => s.url)
  }]
}))

const PILLARS = [
  { key: 'free', icon: 'i-lucide-gift' },
  { key: 'path', icon: 'i-lucide-route' },
  { key: 'hands', icon: 'i-lucide-square-code' }
]
const stats = computed(() => [
  { value: '7+', label: t('about.stats.years') },
  { value: String(ROADMAP.length), label: t('about.stats.sections') },
  { value: '7', label: t('about.stats.languages') }
])
const links = AUTHOR.social.filter(s => ['linkedin', 'github', 'site'].includes(s.key))
</script>

<template>
  <div>
    <!-- Who and why -->
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:px-8">
        <div>
          <p class="eyebrow">
            {{ t('about.header.sheet') }}
          </p>
          <h1 class="mt-3 text-3xl font-bold tracking-[-0.02em] text-(--ink) sm:text-4xl">
            {{ t('about.page.title') }}
          </h1>
          <p class="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-(--ink2)">
            {{ t('about.page.lead') }}
          </p>
          <ul class="mt-8 grid gap-3 sm:grid-cols-3">
            <li
              v-for="p in PILLARS"
              :key="p.key"
              class="rounded-[6px] border border-(--line) bg-(--paper) p-4"
            >
              <UIcon
                :name="p.icon"
                class="size-5 text-(--signal)"
              />
              <p class="mt-2 font-semibold text-(--ink)">
                {{ t(`about.page.pillars.${p.key}`) }}
              </p>
            </li>
          </ul>
        </div>

        <!-- The instructor -->
        <div class="rounded-[6px] border border-(--line) bg-(--card) p-6">
          <div class="flex items-center gap-4">
            <img
              :src="AUTHOR.avatar"
              alt=""
              class="size-16 rounded-full bg-(--ice) object-cover"
            >
            <div>
              <p class="text-xl font-bold text-(--ink)">
                {{ AUTHOR.name }}
              </p>
              <p class="text-sm text-(--ink2)">
                {{ AUTHOR.role }} · {{ AUTHOR.company }}
              </p>
            </div>
          </div>
          <dl class="mt-6 grid grid-cols-3 divide-x divide-(--line) rounded-[6px] border border-(--line)">
            <div
              v-for="st in stats"
              :key="st.label"
              class="px-3 py-3 text-center"
            >
              <dd class="text-2xl font-bold tabular-nums text-(--ink)">
                {{ st.value }}
              </dd>
              <dt class="text-xs text-(--ink2)">
                {{ st.label }}
              </dt>
            </div>
          </dl>
          <div class="mt-5 flex flex-wrap gap-2">
            <UButton
              v-for="l in links"
              :key="l.key"
              :to="l.url"
              target="_blank"
              :icon="l.icon"
              size="sm"
              color="neutral"
              variant="outline"
            >
              {{ l.label }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- The work, as a timeline -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <h2 class="bp-h3">
        {{ t('about.work.title') }}
      </h2>
      <ol class="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="r in AUTHOR.roles"
          :key="r.years"
          class="rounded-[6px] border bg-(--card) p-5"
          :class="r.current ? 'border-(--signal)' : 'border-(--line)'"
        >
          <p class="text-xs font-bold uppercase tracking-[.09em] text-(--label)">
            {{ r.years }}
          </p>
          <p class="mt-2 font-bold text-(--ink)">
            {{ r.title }}
          </p>
          <p class="text-sm text-(--ink2)">
            {{ r.company }} · {{ r.place }}
          </p>
        </li>
      </ol>
      <ul class="mt-8 grid gap-3 md:grid-cols-2">
        <li
          v-for="h in AUTHOR.highlights.slice(0, 2)"
          :key="h"
          class="flex gap-3 text-[0.9375rem] leading-relaxed text-(--ink)"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-1 size-4 shrink-0 text-(--signal)"
          />{{ h }}
        </li>
      </ul>
      <div class="mt-10">
        <UButton
          :to="localePath('/start')"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('nav.main.course') }}
        </UButton>
      </div>
    </section>
  </div>
</template>
