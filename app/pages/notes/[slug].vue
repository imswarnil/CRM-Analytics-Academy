<script setup lang="ts">
/**
 * /notes/<section> — a section's notes sheet, handwritten style on lined
 * paper, with hand-drawn figures (::hand-chart). Prerendered per locale from
 * the `notes` collection (content/<locale>/notes/<section>.md); the Worker has
 * no content database, so an unknown slug is a 404 there.
 *
 * Download as PDF: the browser's print-to-PDF, with a print stylesheet that
 * keeps only the sheet (A4, no site chrome). Download as Markdown: the file
 * the build copies to /notes/<locale>/<section>.md. Saved offline by the
 * service worker once opened.
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
    'encodingFormat': ['text/html', 'text/markdown', 'application/pdf'],
    'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url }
  }]
}))

const mdHref = computed(() => `/notes/${sheet.value?.path.startsWith(`/${DEFAULT_LOCALE}/`) ? DEFAULT_LOCALE : locale.value}/${slug}.md`)
const print = () => window.print()
</script>

<template>
  <div class="notes-page bg-(--paper) py-10">
    <div class="no-print mx-auto mb-6 flex max-w-[52rem] flex-wrap items-center justify-between gap-3 px-4">
      <NuxtLink
        :to="localePath('/notes')"
        class="inline-flex items-center gap-1 text-sm font-medium text-(--ink2) hover:text-(--signal)"
      >
        <UIcon
          name="i-lucide-chevron-left"
          class="size-4"
        />{{ t('notes.title') }}
      </NuxtLink>
      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-file-down"
          @click="print"
        >
          {{ t('notes.pdf') }}
        </UButton>
        <UButton
          :href="mdHref"
          download
          color="neutral"
          variant="outline"
          icon="i-lucide-file-text"
        >
          {{ t('notes.markdown') }}
        </UButton>
      </div>
    </div>

    <NotesSheet :sheet="sheet!" />
  </div>
</template>
