/**
 * The course plan, section by section (mirrors CURRICULUM.md). /course renders
 * it: a lesson that exists in content/ links to its page; the rest show as
 * "coming". Wording lives in i18n (`roadmap.<key>.title|blurb|l1…lN`) so it
 * is translated with everything else; this file only holds structure.
 *
 * `slug` is the content folder without its number (content/en/course/
 * 01.foundations → foundations), i.e. the section's URL /course/<slug>; a
 * planned section has one already so its URLs are stable from the day it is
 * published.
 */
export interface RoadmapSection {
  key: string
  slug: string
  icon: string
  lessons: number
}

export const ROADMAP: RoadmapSection[] = [
  { key: 's01', slug: 'foundations', icon: 'i-lucide-database', lessons: 3 },
  { key: 's02', slug: 'data-prep', icon: 'i-lucide-workflow', lessons: 8 },
  { key: 's03', slug: 'visualization', icon: 'i-lucide-chart-column', lessons: 5 },
  { key: 's04', slug: 'saql', icon: 'i-lucide-code-xml', lessons: 6 },
  { key: 's05', slug: 'bindings', icon: 'i-lucide-link-2', lessons: 5 },
  { key: 's06', slug: 'sharing', icon: 'i-lucide-share-2', lessons: 4 },
  { key: 's07', slug: 'einstein-discovery', icon: 'i-lucide-sparkles', lessons: 3 }
]
