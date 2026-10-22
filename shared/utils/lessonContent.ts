/**
 * Shapes shared by the lesson page and its credits. content.config.ts holds
 * the same shapes as zod schemas for the build; keep them in step.
 */

/** What a third-party credit can point at. */
export const CREDIT_KINDS = ['video', 'post', 'article', 'image', 'dataset'] as const
export type CreditKind = typeof CREDIT_KINDS[number]

/** The registry entry for the site owner: the author of any lesson that names none. */
export const OWNER_SLUG = 'swarnil-singhai'

export interface LessonCredit {
  kind: CreditKind
  title: string
  author: string
  authorUrl?: string
  url: string
  license?: string
  note?: string
}

/** "Building a Pipeline Dashboard!" → "building-a-pipeline-dashboard". */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}
