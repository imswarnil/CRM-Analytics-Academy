import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Lessons } from './collections/Lessons'
import { Media } from './collections/Media'
import { Resources } from './collections/Resources'
import { Sections } from './collections/Sections'
import { Showcase } from './collections/Showcase'
import { Users } from './collections/Users'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// R2 is S3-compatible. Only switched on when a bucket is configured, so a
// fresh checkout runs entirely locally.
const r2 = process.env.S3_BUCKET
  ? [s3Storage({
      collections: { media: process.env.S3_PUBLIC_URL ? { generateFileURL: ({ filename }) => `${process.env.S3_PUBLIC_URL}/${filename}` } : true },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ''
        }
      }
    })]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — CRM Analytics Academy CMS' },
    importMap: { baseDir: path.resolve(dirname) }
  },
  collections: [Sections, Lessons, Showcase, Resources, Media, Users],
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // The site's own Neon database, in a schema of its own: Payload's tables
  // never mix with `app` (progress, billing, comments) or `neon_auth`.
  db: postgresAdapter({
    schemaName: 'payload',
    pool: { connectionString: process.env.DATABASE_URL ?? '' }
  }),
  sharp,
  plugins: [...r2]
})
