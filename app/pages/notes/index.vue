<script setup lang="ts">
import { ROADMAP } from '~/data/roadmap'

/**
 * /notes — every section's notes sheet that exists, in course order, with the
 * planned ones shown as coming. A sheet is written when its section is done.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()

if (import.meta.server && !import.meta.prerender && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}
const { data: sheets } = await useAsyncData(`notes-index-${locale.value}`, async () => {
  const own = await queryCollection('notes').where('path', 'LIKE', `/${locale.value}/notes/%`).all()
  return own.length || locale.value === DEFAULT_LOCALE ? own : queryCollection('notes').where('path', 'LIKE', `/${DEFAULT_LOCALE}/notes/%`).all()
})
const rows = computed(() => ROADMAP.map((s, i) => {
  const sheet = (sheets.value ?? []).find(n => n.section === s.slug)
  return { n: i + 1, slug: s.slug, icon: s.icon, title: sheet?.title ?? t(`roadmap.${s.key}.title`), description: sheet?.description ?? '', ready: Boolean(sheet) }
}))

const NuxtLink = resolveComponent('NuxtLink')
const title = computed(() => t('notes.seoTitle'))
const description = computed(() => t('notes.lead'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('notes.eyebrow')"
      :title="t('notes.title')"
      :lead="t('notes.lead')"
    />
    <div class="mx-auto grid max-w-(--ui-container) gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
      <component
        :is="r.ready ? NuxtLink : 'div'"
        v-for="r in rows"
        :key="r.slug"
        :to="r.ready ? localePath(`/notes/${r.slug}`) : undefined"
        class="flex flex-col rounded-[6px] border p-6"
        :class="r.ready ? 'bp-card bp-card--hover' : 'border-dashed border-(--line) bg-(--paper)'"
      >
        <div class="flex items-center gap-3">
          <span class="bp-iconbox">
            <UIcon
              :name="r.icon"
              class="size-5"
            />
          </span>
          <span class="mono-label">{{ t('curriculumPage.section', { n: r.n }) }}</span>
        </div>
        <h2
          class="mt-4 text-lg font-bold"
          :class="r.ready ? 'text-(--ink)' : 'text-(--ink2)'"
        >
          {{ r.title }}
        </h2>
        <p
          v-if="r.description"
          class="mt-1 text-sm text-(--ink2)"
        >
          {{ r.description }}
        </p>
        <span
          class="mt-auto pt-4 text-sm font-semibold"
          :class="r.ready ? 'text-(--signal)' : 'text-(--label)'"
        >{{ r.ready ? t('notes.open') : t('curriculumPage.coming') }}</span>
      </component>
    </div>
  </div>
</template>
