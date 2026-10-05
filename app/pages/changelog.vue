<script setup lang="ts">
const { t, tm, rt } = useI18n()
const title = computed(() => t('changelog.seo.title'))
const description = computed(() => t('changelog.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage' }))

type Color = 'primary' | 'success' | 'warning' | 'neutral'

interface Entry {
  date: string
  tag: string
  title: string
  summary: string
  color: Color
  items: string[]
}

// The copy lives in i18n (`changelog.entries`, newest first); the badge
// colours stay here, by position.
const COLORS: Color[] = ['primary', 'primary', 'warning', 'primary', 'success', 'warning', 'primary', 'neutral', 'neutral']

const entries = computed<Entry[]>(() =>
  (tm('changelog.entries') as { date: string, tag: string, title: string, summary: string, items: string[] }[]).map((e, i) => ({
    date: rt(e.date),
    tag: rt(e.tag),
    title: rt(e.title),
    summary: rt(e.summary),
    color: COLORS[i] ?? 'neutral',
    items: e.items.map(item => rt(item))
  }))
)
</script>

<template>
  <div>
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-14 text-center sm:py-20">
        <p class="eyebrow mb-5">
          {{ t('changelog.hero.eyebrow') }}
        </p>
        <i18n-t
          keypath="changelog.hero.title"
          tag="h1"
          scope="global"
          class="mx-auto max-w-3xl bp-h1"
        >
          <template #em>
            <span class="text-gradient">{{ t('changelog.hero.titleEm') }}</span>
          </template>
        </i18n-t>
        <i18n-t
          keypath="changelog.hero.lead"
          tag="p"
          scope="global"
          class="mx-auto mt-5 max-w-2xl bp-lead"
        >
          <template #github>
            <NuxtLink
              to="https://github.com/imswarnil/CRM-Analytics-Academy"
              target="_blank"
              class="text-(--signal) hover:underline"
            >
              GitHub
            </NuxtLink>
          </template>
        </i18n-t>
      </UContainer>
    </section>

    <UContainer class="max-w-3xl py-12 sm:py-16">
      <div class="space-y-10 border-s border-(--line) ps-6">
        <div
          v-for="(e, i) in entries"
          :key="i"
          class="relative"
        >
          <span class="absolute -start-[1.85rem] top-1 flex size-4 items-center justify-center border-2 border-(--signal) bg-(--card)" />
          <div class="mb-1 flex items-center gap-3">
            <span class="text-xs font-medium uppercase tracking-wide text-(--ink2)">{{ e.date }}</span>
            <UBadge
              :color="e.color"
              variant="subtle"
              size="sm"
            >
              {{ e.tag }}
            </UBadge>
          </div>
          <h2 class="text-lg font-bold text-(--ink)">
            {{ e.title }}
          </h2>
          <p class="mb-3 mt-0.5 text-sm text-(--ink2)">
            {{ e.summary }}
          </p>
          <ul class="space-y-1.5">
            <li
              v-for="item in e.items"
              :key="item"
              class="flex items-start gap-2 text-sm text-(--ink2)"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-(--signal)"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
