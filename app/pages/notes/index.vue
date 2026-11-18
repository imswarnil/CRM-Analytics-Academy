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

const print = () => {
  // Print every sheet in full, whatever is expanded on screen.
  window.print()
}
const open = reactive(new Set<string>())
const NuxtLink = resolveComponent('NuxtLink')

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
    <!-- PRODUCT HERO --------------------------------------------------- -->
    <section class="no-print relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div>
          <p class="eyebrow">
            {{ t('notes.eyebrow') }}
          </p>
          <h1 class="bp-h1 mt-3">
            {{ t('notes.productTitle') }}
          </h1>
          <p class="bp-lead mt-4 max-w-xl">
            {{ t('notes.lead') }}
          </p>
          <ul class="mt-6 grid gap-2.5 sm:grid-cols-2">
            <li
              v-for="(f, i) in ['f1', 'f2', 'f3', 'f4']"
              :key="f"
              class="flex items-start gap-2.5 text-(--ink)"
            >
              <UIcon
                :name="['i-lucide-file-text', 'i-lucide-chart-column', 'i-lucide-file-down', 'i-lucide-languages'][i]!"
                class="mt-0.5 size-5 shrink-0 text-(--signal)"
              />{{ t(`notes.features.${f}`) }}
            </li>
          </ul>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              v-if="ready.length"
              size="xl"
              icon="i-lucide-file-down"
              @click="print"
            >
              {{ t('notes.pdfAll') }}
            </UButton>
            <UButton
              href="#preview"
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-eye"
            >
              {{ t('notes.seePreview') }}
            </UButton>
          </div>
          <p class="mt-4 text-sm text-(--ink2)">
            {{ t('notes.status', { ready: ready.length, total: rows.length }) }} · {{ t('notes.free') }}
          </p>
        </div>

        <!-- A stack of sheets -->
        <div
          class="relative mx-auto h-80 w-full max-w-md"
          aria-hidden="true"
        >
          <div
            v-for="k in [2, 1, 0]"
            :key="k"
            class="notes-mock absolute inset-x-6 top-4 bottom-0 rounded-[4px] border border-(--line)"
            :style="{ transform: `rotate(${[-1.5, 2.5, -4][k]}deg) translate(${k * 14}px, ${k * 10}px)`, zIndex: 3 - k }"
          >
            <template v-if="k === 0">
              <p class="hand-title">
                {{ ready[0]?.title ?? t('notes.title') }}
              </p>
              <svg
                viewBox="0 0 220 90"
                class="mx-6 mt-3 w-[70%]"
              >
                <path
                  d="M8 82 L8 8 M8 82 L212 82"
                  class="hand-ink"
                />
                <rect
                  v-for="(h, i) in [30, 46, 38, 60, 72]"
                  :key="i"
                  :x="22 + i * 38"
                  :y="82 - h"
                  width="24"
                  :height="h"
                  class="hand-bar"
                />
              </svg>
              <p class="hand-line mx-6 mt-3">
                <mark>Objects</mark> are tables · <mark>records</mark> are rows
              </p>
              <p class="hand-line mx-6">
                Lookup ≠ master-detail → sharing!
              </p>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT'S INSIDE -------------------------------------------------- -->
    <section class="no-print mx-auto max-w-(--ui-container) px-4 py-14 sm:px-6 lg:px-8">
      <h2 class="bp-h2">
        {{ t('notes.insideTitle') }}
      </h2>
      <ol class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="r in rows"
          :key="r.slug"
        >
          <component
            :is="r.sheet ? NuxtLink : 'div'"
            v-bind="r.sheet ? { to: `#${r.slug}` } : {}"
            class="flex h-full items-center gap-3 rounded-[6px] border border-(--line) bg-(--card) p-4"
            :class="r.sheet ? 'transition-colors hover:border-(--signal)' : 'opacity-70'"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-[4px]"
              :class="r.sheet ? 'bg-(--signal) text-white' : 'bg-(--paper2) text-(--ink2)'"
            >
              <UIcon
                :name="r.icon"
                class="size-5"
              />
            </span>
            <span class="min-w-0">
              <span class="block text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">{{ t('curriculumPage.section', { n: r.n }) }}</span>
              <span class="block truncate font-semibold text-(--ink)">{{ r.title }}</span>
              <span
                class="block text-xs"
                :class="r.sheet ? 'text-success' : 'text-(--ink2)'"
              >{{ r.sheet ? t('notes.ready') : t('curriculumPage.coming') }}</span>
            </span>
          </component>
        </li>
      </ol>
    </section>

    <!-- PREVIEW: every sheet, clipped until opened (prints in full) ---- -->
    <section
      id="preview"
      class="scroll-mt-20 border-y border-(--line) bg-(--paper2)/60 py-14"
    >
      <div class="mx-auto max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
        <h2 class="no-print bp-h2">
          {{ t('notes.previewTitle') }}
        </h2>
        <div class="mt-8 space-y-12">
          <div
            v-for="r in ready"
            :id="r.slug"
            :key="r.slug"
            class="scroll-mt-24 space-y-3"
          >
            <div class="no-print mx-auto flex max-w-[52rem] flex-wrap items-center justify-between gap-2 px-4">
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
            <div
              class="preview-frame relative"
              :class="{ open: open.has(r.slug) }"
            >
              <NotesSheet :sheet="r.sheet!" />
              <div
                v-if="!open.has(r.slug)"
                class="no-print absolute inset-x-0 bottom-0 flex h-48 items-end justify-center bg-gradient-to-t from-(--paper2) to-transparent pb-6"
              >
                <UButton
                  icon="i-lucide-chevrons-down"
                  @click="open.add(r.slug)"
                >
                  {{ t('notes.readAll') }}
                </UButton>
              </div>
            </div>
          </div>
          <p
            v-if="!ready.length"
            class="text-(--ink2)"
          >
            {{ t('curriculumPage.coming') }}
          </p>
        </div>
      </div>
    </section>

    <!-- REVIEWS + COMMENTS -------------------------------------------- -->
    <section class="no-print mx-auto max-w-(--ui-container) space-y-14 px-4 py-14 sm:px-6 lg:px-8">
      <div>
        <h2 class="bp-h2 mb-8">
          {{ t('reviews.heading') }}
        </h2>
        <ProductReviews
          product="notes"
          :name="t('notes.productTitle')"
        />
      </div>
      <div class="max-w-3xl">
        <CourseLessonComments lesson-path="/notes" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.notes-mock {
  background:
    repeating-linear-gradient(to bottom, transparent 0 27px, #cfe0f3 27px 28px),
    #fffdf7;
  box-shadow: none;
}
.hand-title { margin: 22px 24px 0; font-family: Caveat, Kalam, cursive; font-size: 30px; font-weight: 700; color: #0b3b78; line-height: 1.1; }
.hand-line { font-family: Kalam, Caveat, cursive; font-size: 15px; color: #23324a; line-height: 28px; }
.hand-line mark { background: #fff1a8; padding: 0 3px; }
.hand-ink { stroke: #23324a; stroke-width: 2; fill: none; stroke-linecap: round; }
.hand-bar { fill: #1b96ff; opacity: .75; stroke: #0b3b78; stroke-width: 1.5; }
.preview-frame:not(.open) { max-height: 46rem; overflow: hidden; }
@media print {
  .preview-frame { max-height: none !important; overflow: visible !important; }
}
</style>
