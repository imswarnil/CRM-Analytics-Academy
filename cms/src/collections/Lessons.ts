import type { CollectionConfig } from 'payload'
import { staffOnly } from './access'
import { extraFrontmatter, markdownBody, sourceFile } from './fields'

/**
 * A lesson: one markdown file under content/en/<section>/. English only —
 * the other eleven locales are generated from it by `pnpm translate`.
 */
export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'section', 'order', 'access', 'updatedAt'],
    group: 'Course',
    listSearchableFields: ['title', 'slug', 'description']
  },
  defaultSort: 'order',
  access: staffOnly,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'section', type: 'relationship', relationTo: 'sections', required: true },
        { name: 'order', type: 'number', required: true, admin: { width: '20%' } },
        { name: 'slug', type: 'text', required: true, admin: { description: 'URL segment. "index" is the section\'s landing page.' } }
      ]
    },
    { name: 'title', type: 'text', required: true },
    { name: 'navTitle', type: 'text', admin: { description: 'Shorter title for the course contents. Optional.' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'access',
      type: 'select',
      defaultValue: 'free',
      options: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }],
      admin: { position: 'sidebar', description: 'Pro lessons are moved out of the public bundle at build time.' }
    },
    {
      type: 'tabs',
      tabs: [
        { label: 'Body', fields: [markdownBody] },
        {
          label: 'Video',
          fields: [
            { name: 'mux', type: 'json', admin: { description: 'Mux playback ids: "abc" or { "en": "abc", "es": "def" }.' } },
            {
              name: 'video',
              type: 'group',
              admin: { description: 'A YouTube clip shown at the top.' },
              fields: [
                { name: 'id', type: 'text' },
                { type: 'row', fields: [{ name: 'start', type: 'number' }, { name: 'end', type: 'number' }] }
              ]
            }
          ]
        },
        {
          label: 'Walkthrough',
          fields: [{
            name: 'walkthrough',
            type: 'group',
            fields: [
              { name: 'org', type: 'text', admin: { description: 'What to have open before starting.' } },
              {
                name: 'shots',
                type: 'array',
                fields: [
                  { name: 'shot', type: 'text', required: true },
                  { name: 'screen', type: 'text' },
                  { name: 'say', type: 'textarea', required: true },
                  { type: 'row', fields: [{ name: 'onscreen', type: 'text' }, { name: 'seconds', type: 'number' }] }
                ]
              }
            ]
          }]
        },
        {
          label: 'Quiz & interview',
          fields: [
            {
              name: 'quiz',
              type: 'array',
              fields: [
                { name: 'q', type: 'text', required: true, label: 'Question' },
                { name: 'options', type: 'array', minRows: 2, maxRows: 6, fields: [{ name: 'text', type: 'text', required: true }] },
                { name: 'answer', type: 'number', required: true, min: 0, admin: { description: 'Index of the correct option, from 0.' } }
              ]
            },
            {
              name: 'interview',
              type: 'array',
              fields: [
                { name: 'q', type: 'text', required: true, label: 'Question' },
                { name: 'a', type: 'textarea', required: true, label: 'Answer' }
              ]
            }
          ]
        },
        {
          label: 'Links & more',
          fields: [
            {
              name: 'links',
              type: 'array',
              admin: { description: 'Buttons in the lesson header.' },
              fields: [
                { type: 'row', fields: [{ name: 'label', type: 'text', required: true }, { name: 'icon', type: 'text' }] },
                { type: 'row', fields: [{ name: 'to', type: 'text', required: true }, { name: 'target', type: 'text' }] }
              ]
            },
            extraFrontmatter
          ]
        }
      ]
    },
    sourceFile()
  ]
}
