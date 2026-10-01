<script setup lang="ts">
import { WALL_PEOPLE, WALL_TYPE_ICONS, WALL_TYPES, type WallPersonType } from '~/data/wall-of-fame'

const { t, locale, locales } = useI18n()
const title = computed(() => t('wall.title'))
const description = computed(() => t('wall.subtitle'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

// The people are data in app/data/wall-of-fame.ts, shared with the home page.
const people = WALL_PEOPLE
const selected = ref<'all' | WallPersonType>('all')
const filtered = computed(() => selected.value === 'all' ? people : people.filter(p => p.type === selected.value))
const countFor = (key: 'all' | WallPersonType) => key === 'all' ? people.length : people.filter(p => p.type === key).length

// Always leave a few empty frames on the board: an open invitation to
// nominate, and the honest way to show a wall that is still filling up.
const minSlots = computed(() => Math.max(8, Math.ceil((filtered.value.length + 2) / 4) * 4))

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/wall-of-fame`,
  'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
  'itemListElement': people.map((p, i) => ({
    '@type': 'ListItem',
    'position': i + 1,
    'item': {
      '@type': 'Person',
      'name': p.name,
      'url': p.linkedin,
      'description': p.desc,
      ...(p.url ? { sameAs: [p.url] } : {})
    }
  }))
})
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="`Sheet 09 / ${t('wall.eyebrow')}`"
      :title="t('wall.title')"
      :lead="t('wall.subtitle')"
      center
    >
      <div class="mt-8 flex justify-center">
        <UButton
          to="/nominate"
          icon="i-lucide-heart-handshake"
          size="lg"
        >
          {{ t('wall.nominate') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <!-- Filter strip -->
      <div
        class="mx-auto mb-10 flex w-fit max-w-full flex-wrap justify-center border-[1.5px] border-(--ink) bg-(--card)"
        role="group"
        :aria-label="t('wall.filter')"
      >
        <button
          v-for="key in (['all', ...WALL_TYPES] as const)"
          :key="key"
          type="button"
          class="flex items-center gap-2 border-e-[1.5px] border-(--ink) px-4 py-2 font-mono text-[11px] uppercase tracking-[.1em] transition-colors last:border-e-0"
          :class="selected === key ? 'bg-(--ink) text-(--paper)' : 'text-(--ink) hover:bg-(--ice)'"
          :aria-pressed="selected === key"
          @click="selected = key"
        >
          <UIcon
            :name="key === 'all' ? 'i-lucide-layout-grid' : WALL_TYPE_ICONS[key]"
            class="size-3.5"
          />
          {{ key === 'all' ? t('wall.all') : t(`wall.types.${key}`) }}
          <span class="opacity-60">{{ countFor(key) }}</span>
        </button>
      </div>

      <BpPolaroidWall
        :key="selected"
        :people="filtered"
        :min-slots="minSlots"
        :label="`${t('wall.board')} — ${filtered.length}`"
      />

      <!-- Who they are, in words: the polaroids are the picture, this is the record. -->
      <section class="mt-16">
        <p class="eyebrow">
          {{ t('wall.whoTitle') }}
        </p>
        <ul class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="p in filtered"
            :key="p.name"
            class="border-[1.5px] border-(--ink) bg-(--card) p-4"
          >
            <p class="mono-label">
              {{ t(`wall.types.${p.type}`) }}
            </p>
            <a
              :href="p.linkedin"
              target="_blank"
              rel="noopener"
              class="mt-1 block font-extrabold text-(--ink) hover:text-(--signal)"
            >{{ p.name }}</a>
            <p class="mt-1.5 text-sm text-(--ink2)">
              {{ p.desc }}
            </p>
          </li>
        </ul>
      </section>

      <section class="graph-paper-navy mt-16 grid items-center gap-6 border-[1.5px] border-(--ink) bg-(--navy) p-8 text-white shadow-[10px_10px_0_var(--signal)] sm:p-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            {{ t('wall.eyebrow') }}
          </p>
          <h2 class="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
            {{ t('wall.nominateTitle') }}
          </h2>
          <p class="mt-3 max-w-xl text-white/80">
            {{ t('wall.nominateDesc') }}
          </p>
        </div>
        <UButton
          to="/nominate"
          color="secondary"
          size="lg"
          icon="i-lucide-heart-handshake"
        >
          {{ t('wall.nominate') }}
        </UButton>
      </section>
    </div>
  </div>
</template>
