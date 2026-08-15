/**
 * Slug helper shared across admin authoring tools.
 *
 * Blog posts now live as markdown files under content/blog/ (see the `blog`
 * Nuxt Content collection in content.config.ts and app/pages/admin/studio.vue)
 * rather than a `posts` database table.
 */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
