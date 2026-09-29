import type { CollectionConfig } from 'payload'
import { staffOnly } from './access'
import { sourceFile } from './fields'

/** A course section: one folder under content/en, e.g. 07.saql. */
export const Sections: CollectionConfig = {
  slug: 'sections',
  admin: { useAsTitle: 'title', defaultColumns: ['order', 'title', 'slug'], group: 'Course' },
  defaultSort: 'order',
  access: staffOnly,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'The URL segment: /saql/…' } },
    { name: 'order', type: 'number', required: true, admin: { description: 'Position in the course. Written as the two-digit folder prefix.' } },
    { name: 'icon', type: 'text', admin: { description: 'Any i-lucide-* name.' } },
    sourceFile('Folder under content/en.')
  ]
}
