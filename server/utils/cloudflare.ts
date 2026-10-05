import type { H3Event } from 'h3'

/**
 * The Worker's per-request Cloudflare objects, typed in one place.
 *
 * Nitro puts them on `event.context.cloudflare` under the cloudflare_module
 * preset, but the generated server types do not always describe that field
 * (it depends on how `.nuxt` was last generated), so every route that read it
 * directly broke typecheck. Absent in dev and during prerender.
 */
export interface CloudflareContext {
  request?: { cf?: { country?: string } }
  env?: Record<string, unknown> & { MEDIA?: R2BucketLike }
  context?: { waitUntil?: (p: Promise<unknown>) => void }
}

/** The subset of an R2 bucket this site uses. */
export interface R2BucketLike {
  get: (key: string) => Promise<{ body: ReadableStream, httpMetadata?: { contentType?: string }, httpEtag?: string, size?: number } | null>
  put: (key: string, value: ArrayBuffer | ReadableStream | Uint8Array | string, options?: { httpMetadata?: { contentType?: string, cacheControl?: string } }) => Promise<unknown>
}

export function cloudflareOf(event: H3Event): CloudflareContext {
  return ((event.context as Record<string, unknown>).cloudflare ?? {}) as CloudflareContext
}
