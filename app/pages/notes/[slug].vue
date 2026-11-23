<script setup lang="ts">
import pdfs from '~/data/notes-pdfs.json'

/**
 * /notes/<section> — a section's notes, as a PDF: a small hero with a direct
 * download, then the PDF itself in an inline viewer. Prerendered per locale
 * from the `notes` collection (content/<locale>/notes/<section>.md); the
 * Worker has no content database, so an unknown slug is a 404 there.
 *
 * The PDF is a real file, public/notes/<locale>/<section>.pdf, printed from
 * THIS page by `scripts/notes-pdf.mjs` (local headless Chrome, A4 print
 * stylesheet in NotesSheet) and committed; `app/data/notes-pdfs.json` lists
 * the files that exist. Phones get the sheet as HTML (embedded PDF viewers
 * are poor there) with the same download; so does print, and so does a sheet
 * whose PDF has not been generated yet. Saved offline by the service worker.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = String(route.params.slug)

if (import.meta.server && !import.meta.prerender && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Notes not found', fatal: true })
}
const { data: sheet } = await useAsyncData(`notes-${locale.value}-${slug}`, async () =>
  (await queryCollection('notes').path(`/${locale.value}/notes/${slug}`).first())
  ?? (locale.value === DEFAULT_LOCALE ? null : await queryCollection('notes').path(`/${DEFAULT_LOCALE}/notes/${slug}`).first()))
if (!sheet.value) throw createError({ statusCode: 404, statusMessage: 'Notes not found', fatal: true })

// This language's PDF, else the English one, else none (print instead).
const files = pdfs as Record<string, { bytes: number }>
const pdfKey = [`${locale.value}/${slug}`, `${DEFAULT_LOCALE}/${slug}`].find(k => files[k])
const pdf = pdfKey ? { href: `/notes/${pdfKey}.pdf`, size: `${Math.max(1, Math.round(files[pdfKey]!.bytes / 1024))} KB` } : null
const fileName = `crm-analytics-notes-${slug}.pdf`

const title = computed(() => `${sheet.value!.title} — ${t('notes.suffix')}`)
const description = computed(() => sheet.value!.description || t('notes.lead'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('notes.title'), path: '/notes' }, { name: sheet.value!.title, path: `/notes/${slug}` }],
  extra: [{
    '@type': 'LearningResource',
    'name': title.value,
    'learningResourceType': 'Study notes',
    'isAccessibleForFree': true,
    'encodingFormat': pdf ? ['text/html', 'application/pdf'] : ['text/html'],
    ...(pdf ? { associatedMedia: { '@type': 'MediaObject', 'encodingFormat': 'application/pdf', 'contentUrl': `${SITE.url}${pdf.href}` } } : {}),
    'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url }
  }]
}))

const print = () => window.print()
</script>

<template>
  <div class="notes-page bg-(--paper)">
    <!-- Small hero: where you are, what it is, the download -->
    <section class="no-print border-b border-(--line) bg-(--card)">
      <div class="mx-auto flex max-w-[60rem] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div class="min-w-0">
          <NuxtLink
            :to="localePath('/notes')"
            class="eyebrow inline-flex items-center gap-1 hover:text-(--signal)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="size-3.5"
            />{{ t('notes.title') }}
          </NuxtLink>
          <h1 class="mt-1.5 text-2xl font-bold leading-tight tracking-[-0.02em] text-(--ink) sm:text-[1.75rem]">
            {{ sheet!.title }}
          </h1>
          <p
            v-if="pdf"
            class="mt-1 flex items-center gap-1.5 text-sm text-(--ink2)"
          >
            <UIcon
              name="i-lucide-file-text"
              class="size-4 text-(--signal)"
            />PDF · A4 · {{ pdf.size }}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <template v-if="pdf">
            <UButton
              :href="pdf.href"
              :download="fileName"
              size="lg"
              icon="i-lucide-download"
            >
              {{ t('notes.pdf') }}
            </UButton>
            <UButton
              :href="pdf.href"
              target="_blank"
              size="lg"
              color="neutral"
              variant="outline"
              icon="i-lucide-external-link"
            >
              {{ t('notes.openPdf') }}
            </UButton>
          </template>
          <UButton
            v-else
            size="lg"
            icon="i-lucide-printer"
            @click="print"
          >
            {{ t('notes.pdf') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- The PDF, previewed inline (wide screens) -->
    <section
      v-if="pdf"
      class="pdf-view no-print mx-auto hidden max-w-[60rem] px-4 py-8 md:block"
    >
      <object
        :data="`${pdf.href}#view=FitH`"
        type="application/pdf"
        class="block h-[calc(100dvh-12rem)] min-h-[36rem] w-full rounded-[6px] border border-(--line) bg-(--card)"
        :aria-label="sheet!.title"
      >
        <div class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-(--ink2)">
          <UIcon
            name="i-lucide-file-text"
            class="size-10 text-(--signal)"
          />
          <p>{{ t('notes.noViewer') }}</p>
          <UButton
            :href="pdf.href"
            :download="fileName"
            icon="i-lucide-download"
          >
            {{ t('notes.pdf') }}
          </UButton>
        </div>
      </object>
    </section>

    <!-- The sheet as HTML: phones, print (this is what the PDF is made from),
         and sheets whose PDF is not generated yet -->
    <div
      class="sheet-html py-8"
      :class="pdf ? 'md:hidden' : ''"
    >
      <NotesSheet :sheet="sheet!" />
    </div>
  </div>
</template>

<style scoped>
@media print {
  .sheet-html { display: block !important; padding: 0 !important; }
}
</style>
