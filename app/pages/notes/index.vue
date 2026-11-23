<script setup lang="ts">
import { ROADMAP } from '~/data/roadmap'
import pdfs from '~/data/notes-pdfs.json'

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
// The printed PDF of a sheet (scripts/notes-pdf.mjs): this language's, else English.
const pdfOf = (slug: string) => [`${locale.value}/${slug}`, `${DEFAULT_LOCALE}/${slug}`].find(k => (pdfs as Record<string, unknown>)[k])

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
    <!-- PRODUCT: gallery on the left, the product card on the right -->
    <section class="no-print border-b border-(--line) bg-(--card)">
      <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:px-8 lg:py-14">
        <NotesGallery :sheets="ready.map(r => r.sheet!)" />

        <div class="lg:sticky lg:top-24 lg:self-start">
          <p class="eyebrow">
            {{ t('notes.eyebrow') }}
          </p>
          <h1 class="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-(--ink) sm:text-4xl">
            {{ t('notes.productTitle') }}
          </h1>
          <a
            href="#reviews"
            class="mt-3 inline-flex items-center gap-1.5 text-sm text-(--ink2) hover:text-(--signal)"
          >
            <UIcon
              name="i-lucide-star"
              class="size-4 text-amber-500"
            />
            {{ t('notes.readReviews') }}
          </a>
          <p class="mt-4 text-[1.0625rem] leading-relaxed text-(--ink2)">
            {{ t('notes.lead') }}
          </p>

          <div class="mt-6 rounded-[6px] border border-(--line) p-5">
            <div class="flex items-baseline justify-between gap-3">
              <p class="text-3xl font-bold text-(--ink)">
                {{ t('notes.free') }}
              </p>
              <p class="text-sm text-(--ink2)">
                {{ t('notes.status', { ready: ready.length, total: rows.length }) }}
              </p>
            </div>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-(--line)">
              <div
                class="h-full rounded-full bg-(--signal)"
                :style="{ width: `${(ready.length / rows.length) * 100}%` }"
              />
            </div>
            <p class="mt-4 text-xs font-bold uppercase tracking-[.09em] text-(--label)">
              {{ t('notes.formats') }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="f in ['PDF', 'Print', 'Offline']"
                :key="f"
                class="rounded-full border border-(--line) px-3 py-1 text-sm font-medium text-(--ink)"
              >{{ f }}</span>
            </div>
            <div class="mt-5 grid gap-2 sm:grid-cols-2">
              <UButton
                v-if="ready.length"
                size="xl"
                icon="i-lucide-file-down"
                block
                @click="print"
              >
                {{ t('notes.pdfAll') }}
              </UButton>
              <UButton
                href="#preview"
                size="xl"
                color="neutral"
                variant="outline"
                icon="i-lucide-book-open"
                block
              >
                {{ t('notes.readOnline') }}
              </UButton>
            </div>
          </div>

          <ul class="mt-6 space-y-2.5">
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
        <div class="mt-8 space-y-12 pb-10">
          <div
            v-for="(r, k) in ready"
            :id="r.slug"
            :key="r.slug"
            class="stack-card scroll-mt-24 space-y-3"
            :style="{ '--stack': k }"
          >
            <div class="no-print mx-auto flex max-w-[52rem] flex-wrap items-center justify-between gap-2 px-4">
              <NuxtLink
                :to="localePath(`/notes/${r.slug}`)"
                class="text-sm font-semibold text-(--signal) hover:underline"
              >
                {{ t('notes.openSingle') }} →
              </NuxtLink>
              <UButton
                v-if="pdfOf(r.slug)"
                :href="`/notes/${pdfOf(r.slug)}.pdf`"
                :download="`crm-analytics-notes-${r.slug}.pdf`"
                size="sm"
                color="neutral"
                variant="outline"
                icon="i-lucide-download"
              >
                {{ t('notes.pdf') }}
              </UButton>
            </div>
            <div
              class="preview-frame relative"
              :class="{ open: open.has(r.slug) }"
            >
              <NotesSheet
                :sheet="r.sheet!"
                :anchor="false"
              />
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
      <div
        id="reviews"
        class="scroll-mt-24"
      >
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
/* Sheets pile up as you scroll: each one sticks a little lower than the last. */
@media (min-width: 1024px) {
  .stack-card { position: sticky; top: calc(5.5rem + var(--stack) * 1.25rem); }
}
@media print {
  .stack-card { position: static !important; }
}
@media print {
  .preview-frame { max-height: none !important; overflow: visible !important; }
}
</style>
