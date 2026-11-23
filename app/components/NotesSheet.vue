<script setup lang="ts">
import { ROADMAP } from '~/data/roadmap'

/**
 * One notes sheet on lined paper — handwritten type, highlighter, sticky
 * notes, hand-drawn figures. Shared by /notes (every sheet, one page) and
 * /notes/<section>. `sheet` is a `notes` collection entry.
 */
import type { NotesCollectionItem } from '@nuxt/content'

// `anchor: false` for copies (gallery, zoom) so the page has one id per sheet.
const props = withDefaults(defineProps<{ sheet: NotesCollectionItem, anchor?: boolean }>(), { anchor: true })
const { t } = useI18n()
const localePath = useLocalePath()
const sheet = computed(() => props.sheet)
const slug = computed(() => props.sheet.path.split('/').pop() ?? '')
const section = computed(() => ROADMAP.find(s => s.slug === props.sheet.section))
</script>

<template>
  <article
    :id="anchor ? slug : undefined"
    class="sheet mx-auto max-w-[52rem] scroll-mt-24 px-4"
  >
    <div class="paper">
      <header class="mb-6">
        <p class="hand-eyebrow">
          {{ t('notes.eyebrow') }}<template v-if="section">
            · {{ t('curriculumPage.section', { n: ROADMAP.indexOf(section) + 1 }) }}
          </template>
        </p>
        <h1 class="hand-title">
          {{ sheet.title }}
        </h1>
        <p
          v-if="sheet.description"
          class="hand-lead"
        >
          {{ sheet.description }}
        </p>
      </header>
      <ContentRenderer
        :value="sheet"
        class="hand-body"
      />
      <footer class="hand-foot">
        crmanalytics.imswarnil.com{{ localePath(`/notes/${slug}`) }}
      </footer>
    </div>
  </article>
</template>

<style scoped>
.paper {
  position: relative;
  background-color: #fffdf6;
  background-image:
    linear-gradient(90deg, transparent 54px, rgb(234 0 30 / .28) 54px, rgb(234 0 30 / .28) 56px, transparent 56px),
    repeating-linear-gradient(to bottom, transparent 0 31px, rgb(1 118 211 / .16) 31px 32px);
  border: 1px solid #e7e2d3;
  border-radius: 6px;
  box-shadow: 0 4px 16px -8px rgb(0 0 0 / .18);
  padding: 40px 32px 32px 76px;
  color: #1b3a6b;
  font-family: 'Kalam', 'Caveat', cursive;
  font-size: 1.12rem;
  line-height: 32px;
}
.hand-eyebrow { font-family: 'Caveat', cursive; font-size: 1.25rem; font-weight: 700; color: #0176d3; }
.hand-title { font-family: 'Caveat', cursive; font-size: 2.6rem; line-height: 1.05; font-weight: 700; color: #0b2a55; margin: 4px 0 8px; }
.hand-lead { color: #3b5a8a; }
.hand-foot { margin-top: 28px; font-size: .9rem; color: #7a8aa6; }
.hand-body :deep(h2) {
  font-family: 'Caveat', cursive; font-size: 2rem; font-weight: 700; color: #0176d3;
  margin: 28px 0 4px; line-height: 1.1;
}
.hand-body :deep(h3) { font-family: 'Caveat', cursive; font-size: 1.55rem; font-weight: 700; margin: 18px 0 2px; }
.hand-body :deep(p) { margin: 0 0 8px; }
.hand-body :deep(ul) { list-style: none; padding: 0; margin: 0 0 8px; }
.hand-body :deep(ul li)::before { content: '→ '; color: #0176d3; font-weight: 700; }
.hand-body :deep(ol) { padding-left: 1.4em; margin: 0 0 8px; }
.hand-body :deep(strong) { background: linear-gradient(transparent 55%, #fde68a 55%); font-weight: 700; color: #0b2a55; }
.hand-body :deep(code) { font-family: 'Kalam', cursive; background: #e8f2ff; border-radius: 3px; padding: 0 4px; }
.hand-body :deep(blockquote) {
  background: #fff4b8; border: 0; margin: 14px 0; padding: 10px 14px; transform: rotate(-.6deg);
  box-shadow: 2px 3px 0 rgb(0 0 0 / .08); color: #5b4a00; font-style: normal;
}
.hand-body :deep(table) { border-collapse: collapse; margin: 10px 0 14px; }
.hand-body :deep(th), .hand-body :deep(td) { border: 1.5px solid #1b3a6b; padding: 0 10px; text-align: left; }
.hand-body :deep(th) { font-family: 'Caveat', cursive; font-size: 1.25rem; }
:global(.dark) .paper { background-color: #0d1c33; border-color: #1f3556; color: #cfe3ff;
  background-image: linear-gradient(90deg, transparent 54px, rgb(255 123 123 / .3) 54px, rgb(255 123 123 / .3) 56px, transparent 56px),
    repeating-linear-gradient(to bottom, transparent 0 31px, rgb(124 190 255 / .14) 31px 32px); }
:global(.dark) .hand-title, :global(.dark) .hand-body :deep(strong) { color: #ffffff; }
:global(.dark) .hand-body :deep(strong) { background: linear-gradient(transparent 55%, rgb(180 83 9 / .55) 55%); }
:global(.dark) .hand-body :deep(th), :global(.dark) .hand-body :deep(td) { border-color: #cfe3ff; }
@media (max-width: 640px) { .paper { padding: 28px 18px 24px 40px; background-image: repeating-linear-gradient(to bottom, transparent 0 31px, rgb(1 118 211 / .16) 31px 32px); } }
</style>

<style>
/* Print = the PDF download: only the sheet, on A4, light, no site chrome. */
@media print {
  @page { size: A4; margin: 12mm; }
  header:not(.mb-6), footer:not(.hand-foot), .no-print, nav, [data-promo], .promo-slot { display: none !important; }
  html, body, .notes-page { background: #fff !important; }
  .notes-page { padding: 0 !important; }
  .sheet { max-width: none !important; padding: 0 !important; break-after: page; }
  .paper { box-shadow: none !important; border: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  /* Gradient rules come out mis-scaled in PDF viewers (Preview draws them
     as wide bands): on paper the margin is a plain border, no ruled lines. */
  .paper { background-image: none !important; border-left: 2px solid rgb(234 0 30 / .28) !important; padding: 8px 4px 8px 24px !important; }
  .hand-chart, table, blockquote { break-inside: avoid; }
}
</style>
