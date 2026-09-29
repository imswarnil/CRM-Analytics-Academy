import type { CollectionConfig } from 'payload'
import { staffOnly } from './access'

/**
 * Screenshots and images. Without R2 configured, files land in
 * ../public/cms-media and the site serves them as ordinary static assets.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: staffOnly,
  upload: {
    staticDir: '../public/cms-media',
    mimeTypes: ['image/*', 'video/mp4']
  },
  fields: [{ name: 'alt', type: 'text', required: true }]
}
