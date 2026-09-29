import type { CollectionConfig } from 'payload'
import { signedIn } from './access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Admin' },
  auth: true,
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  fields: [{ name: 'name', type: 'text' }]
}
