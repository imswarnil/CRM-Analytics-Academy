import type { CollectionConfig } from 'payload'
import { staffOnly } from './access'
import { extraFrontmatter, sourceFile } from './fields'

/** A curated link on /resources: one file under content/resources/. */
export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'featured'], group: 'Content' },
  access: staffOnly,
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'url', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, options: ['Docs', 'Learning', 'Books', 'Blogs', 'Tools', 'Community'] },
        { name: 'icon', type: 'text' }
      ]
    },
    { type: 'row', fields: [{ name: 'submittedBy', type: 'text' }, { name: 'submittedByUrl', type: 'text' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    extraFrontmatter,
    sourceFile()
  ]
}
