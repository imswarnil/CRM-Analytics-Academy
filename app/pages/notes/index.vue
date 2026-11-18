<script setup lang="ts">
import { ROADMAP } from '~/data/roadmap'

/**
 * /notes — every notes sheet on one page, with an index. The index lists all
 * sections in course order (finished ones link to their sheet below, the rest
 * show as coming); "Download all as PDF" prints the whole stack, one sheet per
 * A4 page. Each sheet also has its own page at /notes/<section>.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()

if (import.meta.server && !import.meta.prerender && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}
const { data: sheets } = await useAsyncData(`notes-all-${locale.value}`, async () => {
  const own = await queryCollection('notes').where('path', 'LIKE', `/${locale.value}/notes/%`).all()
  return own.length || locale.value === DEFAULT_LOCALE ? own : queryCollection('notes').where('path', 'LIKE', `/${DEFAULT_LOCALE}/notes/%`).all()
})
const rows = computed(() => ROADMAP.map((s, i) => {
  const sheet = (sheets.value ?? []).find(n => n.section === s.slug)
  return { n: i + 1, slug: s.slug, icon: s.icon, title: sheet?.title ?? t(`roadmap.${s.key}.title`), sheet }
}))
const ready = computed(() => rows.value.filter(r => r.sheet))

const active = ref('')
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) active.value = e.target.id
  }, { rootMargin: '-25% 0px -65% 0px' })
  for (const r of ready.value) {
    const el = document.getElementById(r.slug)
    if (el) io.observe(el)
  }
  onBeforeUnmount(() => io.disconnect())
})
const print = () => window.print()

const title = computed(() => t('notes.seoTitle'))
const description = computed(() => t('notes.lead'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  extra: [{
    '@type': 'ItemList',
    'name': title.value,
    'itemListElement': ready.value.map((r, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': r.title, 'url': `${SITE.url}${localePath(`/notes/${r.slug}`)}` }))
  }]
}))
</script>

<template>
  <div class="notes-page bg-(--paper)">
    <section class="no-print relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto flex max-w-(--ui-container) flex-wrap items-end justify-between gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p class="eyebrow">
            {{ t('notes.eyebrow') }}
          </p>
          <h1 class="bp-h1 mt-3">
            {{ t('notes.title') }}
          </h1>
          <p class="bp-lead mt-4">
            {{ t('notes.lead') }}
          </p>
        </div>
        <UButton
          v-if="ready.length"
          size="lg"
          icon="i-lucide-file-down"
          @click="print"
        >
          {{ t('notes.pdfAll') }}
        </UButton>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8">
      <!-- Index -->
      <aside class="no-print">
        <nav
          class="space-y-1 lg:sticky lg:top-24"
          :aria-label="t('notes.index')"
        >
          <p class="mono-label mb-3 px-3">
            {{ t('notes.index') }}
          </p>
          <template
            v-for="r in rows"
            :key="r.slug"
          >
            <a
              v-if="r.sheet"
              :href="`#${r.slug}`"
              class="flex items-center gap-2.5 rounded-[4px] px-3 py-2 text-[0.9375rem] transition-colors"
              :class="active === r.slug ? 'bg-(--ice) font-semibold text-(--signal)' : 'text-(--ink) hover:bg-(--paper2)'"
            >
              <UIcon
                :name="r.icon"
                class="size-4 shrink-0"
              />
              <span class="min-w-0 flex-1 truncate">{{ r.title }}</span>
            </a>
            <span
              v-else
              class="flex items-center gap-2.5 px-3 py-2 text-[0.9375rem] text-(--ink2)"
            >
              <UIcon
                :name="r.icon"
                class="size-4 shrink-0 opacity-60"
              />
              <span class="min-w-0 flex-1 truncate">{{ r.title }}</span>
              <span class="text-[10px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.coming') }}</span>
            </span>
          </template>
        </nav>
      </aside>

      <!-- Every sheet -->
      <div class="min-w-0 space-y-10">
        <div
          v-for="r in ready"
          :key="r.slug"
          class="space-y-3"
        >
          <div class="no-print mx-auto flex max-w-[52rem] items-center justify-between gap-2 px-4">
            <NuxtLink
              :to="localePath(`/notes/${r.slug}`)"
              class="text-sm font-semibold text-(--signal) hover:underline"
            >
              {{ t('notes.openSingle') }} →
            </NuxtLink>
            <UButton
              :href="`/notes/${r.sheet!.path.startsWith(`/${DEFAULT_LOCALE}/`) ? DEFAULT_LOCALE : locale}/${r.slug}.md`"
              download
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-file-text"
            >
              {{ t('notes.markdown') }}
            </UButton>
          </div>
          <NotesSheet :sheet="r.sheet!" />
        </div>
        <p
          v-if="!ready.length"
          class="text-(--ink2)"
        >
          {{ t('curriculumPage.coming') }}
        </p>
      </div>
    </div>
  </div>
</template>
