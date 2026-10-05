<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const title = computed(() => t('roadmap.seo.title'))
const description = computed(() => t('roadmap.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

usePageSchema(() => ({ name: title.value, description: description.value, type: 'WebPage' }))

// The copy lives in i18n (`roadmap.principles`); the icons stay here, by position.
const PRINCIPLE_ICONS = ['i-lucide-gift', 'i-lucide-git-fork', 'i-lucide-monitor-play', 'i-lucide-users']
const principles = computed(() =>
  (tm('roadmap.principles') as { title: string, text: string }[]).map((p, i) => ({
    icon: PRINCIPLE_ICONS[i] ?? 'i-lucide-circle',
    title: rt(p.title),
    text: rt(p.text)
  }))
)

const COLUMNS = [
  { key: 'now', icon: 'i-lucide-check-circle-2', color: 'text-white', ring: 'bg-(--signal)' },
  { key: 'next', icon: 'i-lucide-loader', color: 'text-(--signal)', ring: 'bg-(--ice)' },
  { key: 'later', icon: 'i-lucide-sparkles', color: 'text-(--ink2)', ring: 'hatch bg-(--card)' }
]
const columns = computed(() => COLUMNS.map(c => ({
  ...c,
  label: t(`roadmap.columns.${c.key}.label`),
  items: (tm(`roadmap.columns.${c.key}.items`) as string[]).map(i => rt(i))
})))
</script>

<template>
  <div>
    <section class="graph-paper relative overflow-hidden border-b-[1.5px] border-(--ink)">
      <UContainer class="relative py-14 text-center sm:py-20">
        <p class="eyebrow mb-5">
          {{ t('roadmap.hero.eyebrow') }}
        </p>
        <i18n-t
          keypath="roadmap.hero.title"
          tag="h1"
          scope="global"
          class="mx-auto max-w-3xl bp-h1"
        >
          <template #em>
            <span class="text-gradient">{{ t('roadmap.hero.titleEm') }}</span>
          </template>
        </i18n-t>
        <i18n-t
          keypath="roadmap.hero.lead"
          tag="p"
          scope="global"
          class="mx-auto mt-5 max-w-2xl bp-lead"
        >
          <template #issue>
            <NuxtLink
              to="https://github.com/imswarnil/CRM-Analytics-Academy/issues"
              target="_blank"
              class="text-(--signal) hover:underline"
            >
              {{ t('roadmap.hero.issue') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12">
        <!-- Left: vision -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <h2 class="flex items-center gap-2 text-lg font-bold text-(--ink)">
            <UIcon
              name="i-lucide-telescope"
              class="size-5 text-(--signal)"
            />
            {{ t('roadmap.vision.title') }}
          </h2>
          <i18n-t
            keypath="roadmap.vision.body"
            tag="p"
            scope="global"
            class="mt-3 text-(--ink2)"
          >
            <template #anyone>
              <span class="font-medium text-(--ink)">{{ t('roadmap.vision.anyone') }}</span>
            </template>
          </i18n-t>
          <ul class="mt-6 space-y-4">
            <li
              v-for="p in principles"
              :key="p.icon"
              class="flex gap-3"
            >
              <div class="flex size-9 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--ice) text-(--signal) ">
                <UIcon
                  :name="p.icon"
                  class="size-4.5"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-(--ink)">
                  {{ p.title }}
                </p>
                <p class="mt-0.5 text-sm text-(--ink2)">
                  {{ p.text }}
                </p>
              </div>
            </li>
          </ul>
          <UButton
            to="https://github.com/imswarnil/CRM-Analytics-Academy"
            target="_blank"
            icon="i-simple-icons-github"
            color="neutral"
            variant="outline"
            class="mt-6 font-medium"
          >
            {{ t('roadmap.vision.star') }}
          </UButton>
        </aside>

        <!-- Right: now / next / later -->
        <div class="space-y-6">
          <div
            v-for="col in columns"
            :key="col.key"
            class="border-[1.5px] border-(--ink) bg-(--card) p-6"
          >
            <h3 class="mb-4 flex items-center gap-3 text-lg font-extrabold tracking-[-0.02em] text-(--ink)">
              <span
                class="flex size-8 items-center justify-center border-[1.5px] border-(--ink)"
                :class="col.ring"
              >
                <UIcon
                  :name="col.icon"
                  class="size-4.5"
                  :class="col.color"
                />
              </span>
              {{ col.label }}
            </h3>
            <ul class="grid gap-3 sm:grid-cols-2">
              <li
                v-for="item in col.items"
                :key="item"
                class="flex items-start gap-2.5 border border-dashed border-(--line) bg-(--card) p-3 text-sm text-(--ink2)"
              >
                <UIcon
                  name="i-lucide-circle-dot"
                  class="mt-0.5 size-4 shrink-0 text-(--ink2)"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <i18n-t
            keypath="roadmap.shipped"
            tag="p"
            scope="global"
            class="text-center text-sm text-(--ink2)"
          >
            <template #changelog>
              <NuxtLink
                :to="localePath('/changelog')"
                class="text-(--signal) hover:underline"
              >
                {{ t('roadmap.changelogLink') }} →
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </div>

      <PromoSlot
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
