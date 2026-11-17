<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The course, on one page. A short hero (one title, one sentence, two
 * actions), then every published section with its lessons. While nothing is
 * published, the page says so plainly and points to YouTube, where lessons
 * appear first.
 *
 * Progress is client-only and additive: the page prerenders for everyone and
 * a signed-in learner's ticks hydrate on top.
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const localePath = useLocalePath()
const route = useRoute()
const { t } = useI18n()
const { isDone } = useProgress()
const { of: metaOf } = useLessonMeta()

const title = computed(() => t('curriculumPage.seo.title'))
const description = computed(() => t('curriculumPage.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

const sections = computed(() =>
  (navigation.value ?? []).map((mod, index) => ({
    n: index + 1,
    title: String(mod.title ?? ''),
    path: String(mod.path ?? ''),
    icon: String((mod as { icon?: string }).icon ?? 'i-lucide-book-open'),
    lessons: ((mod.children ?? []) as ContentNavigationItem[]).filter(l => l.path).map((l) => {
      const m = metaOf(String(l.path))
      return { title: String(l.title ?? ''), path: String(l.path), minutes: m.minutes, access: accessOf((l as { access?: string }).access ?? (m.pro ? 'pro' : 'free')) }
    })
  }))
)

usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  extra: [{
    '@type': 'Course',
    'name': SITE.name,
    'description': description.value,
    'url': `${SITE.url}${route.path}`,
    'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
    'isAccessibleForFree': true,
    'offers': [
      { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'category': 'Pro (monthly)', 'price': String(PRICES.monthly.usd), 'priceCurrency': 'USD' },
      { '@type': 'Offer', 'category': 'Pro (lifetime)', 'price': String(PRICES.lifetime.usd), 'priceCurrency': 'USD' }
    ]
  }]
}))

const TAG: Record<Access, { icon: string, key: string, cls: string }> = {
  free: { icon: 'i-lucide-gift', key: 'pro.freeLesson', cls: 'text-(--ink2)' },
  pro: { icon: 'i-lucide-sparkles', key: 'pro.tag', cls: 'text-(--signal)' }
}
</script>

<template>
  <div>
    <!-- Hero: one title, one sentence, two actions. -->
    <section class="border-b border-(--line) bg-(--paper)">
      <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <h1 class="text-4xl font-bold tracking-tight text-(--ink) sm:text-5xl">
          {{ t('curriculumPage.hero.title') }}
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-(--ink2)">
          {{ t('curriculumPage.hero.lead') }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton
            :to="SITE.youtube"
            target="_blank"
            size="xl"
            icon="i-simple-icons-youtube"
            class="bg-[#FF0000] text-white hover:bg-[#d90000]"
          >
            {{ t('curriculumPage.hero.youtube') }}
          </UButton>
          <UButton
            :to="localePath('/pro')"
            size="xl"
            color="neutral"
            variant="outline"

            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('curriculumPage.hero.pricing') }}
          </UButton>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-3xl px-4 py-12">
      <!-- Nothing published yet -->
      <div
        v-if="!sections.length"
        class="rounded-3xl border border-(--line) bg-(--card) p-8 text-center sm:p-12"
      >
        <UIcon
          name="i-lucide-clapperboard"
          class="size-10 text-(--signal)"
        />
        <h2 class="mt-4 text-2xl font-bold tracking-tight text-(--ink)">
          {{ t('curriculumPage.empty.title') }}
        </h2>
        <p class="mx-auto mt-2 max-w-md text-(--ink2)">
          {{ t('curriculumPage.empty.body') }}
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton
            :to="SITE.youtube"
            target="_blank"
            icon="i-simple-icons-youtube"
          >
            {{ t('curriculumPage.hero.youtube') }}
          </UButton>
          <TestRide variant="outline" />
        </div>
      </div>

      <!-- Sections -->
      <ol
        v-else
        class="space-y-6"
      >
        <li
          v-for="s in sections"
          :key="s.path"
          class="overflow-hidden rounded-3xl border border-(--line) bg-(--card)"
        >
          <div class="flex items-center gap-4 px-6 py-5">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-(--ice) text-(--signal)">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <div class="min-w-0">
              <p class="text-xs font-medium text-(--ink2)">
                {{ t('curriculumPage.section', { n: s.n }) }}
              </p>
              <h2 class="truncate text-lg font-semibold text-(--ink)">
                {{ s.title }}
              </h2>
            </div>
          </div>
          <ul class="divide-y divide-(--line) border-t border-(--line)">
            <li
              v-for="l in s.lessons"
              :key="l.path"
            >
              <NuxtLink
                :to="localePath(l.path)"
                class="flex items-center gap-3 px-6 py-3.5 hover:bg-(--ice)/50"
              >
                <ClientOnly>
                  <UIcon
                    :name="isDone(l.path) ? 'i-lucide-circle-check' : 'i-lucide-circle'"
                    class="size-5 shrink-0"
                    :class="isDone(l.path) ? 'text-(--signal)' : 'text-(--line)'"
                  />
                  <template #fallback>
                    <span class="size-5 shrink-0" />
                  </template>
                </ClientOnly>
                <span class="min-w-0 flex-1 truncate text-[15px] text-(--ink)">{{ l.title }}</span>
                <span
                  class="flex shrink-0 items-center gap-1 text-xs font-medium"
                  :class="TAG[l.access].cls"
                ><UIcon
                  :name="TAG[l.access].icon"
                  class="size-3.5"
                />{{ t(TAG[l.access].key) }}</span>
                <span class="w-14 shrink-0 text-end text-xs tabular-nums text-(--ink2)">{{ l.minutes }} min</span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ol>
    </section>
  </div>
</template>
