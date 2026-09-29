import type { CollectionConfig } from 'payload'
import { staffOnly } from './access'
import { extraFrontmatter, markdownBody, sourceFile } from './fields'

/** A dashboard write-up: one file under content/showcase/. Not localized. */
export const Showcase: CollectionConfig = {
  slug: 'showcase',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'domain', 'difficulty', 'author'], group: 'Content' },
  access: staffOnly,
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'image', type: 'text', required: true, admin: { description: '/showcase/<file>.png or a media URL' } },
        { name: 'publishedAt', type: 'text' }
      ]
    },
    { type: 'row', fields: [{ name: 'author', type: 'text', required: true }, { name: 'authorUrl', type: 'text' }] },
    {
      type: 'row',
      fields: [
        { name: 'domain', type: 'text' },
        {
          name: 'difficulty',
          type: 'select',
          defaultValue: 'Intermediate',
          options: ['Beginner', 'Intermediate', 'Advanced']
        }
      ]
    },
    { name: 'datasets', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { name: 'techniques', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    {
      name: 'kpis',
      type: 'array',
      fields: [
        { type: 'row', fields: [{ name: 'name', type: 'text', required: true }, { name: 'formula', type: 'text', required: true }] },
        { name: 'note', type: 'textarea' }
      ]
    },
    { name: 'recipe', type: 'array', fields: [{ name: 'step', type: 'text', required: true }, { name: 'detail', type: 'textarea' }] },
    markdownBody,
    extraFrontmatter,
    sourceFile()
  ]
}
