/**
 * Serve an object from the media bucket (crm-analytics-academy on R2).
 *
 * The bucket is private; this route is its only public face, so the Worker
 * controls caching and never lists keys. Immutable cache headers are safe
 * because upload keys embed a timestamp — an object is never rewritten
 * under the same name.
 */
export default defineEventHandler(async (event) => {
  const bucket = event.context.cloudflare?.env?.MEDIA
  if (!bucket) {
    throw createError({ statusCode: 503, statusMessage: 'Media is unavailable in this environment.' })
  }

  const key = getRouterParam(event, 'key')
  if (!key || key.includes('..') || key.endsWith('.keep')) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const object = await bucket.get(key)
  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setHeader(event, 'content-type', object.httpMetadata?.contentType || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setHeader(event, 'etag', object.httpEtag)
  return object.body
})
