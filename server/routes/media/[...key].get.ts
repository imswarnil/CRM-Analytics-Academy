/**
 * Serve an object from the media bucket (crm-analytics-academy on R2).
 *
 * The bucket is private; this route is its only public face, so the Worker
 * controls caching and never lists keys. Immutable cache headers are safe
 * because upload keys embed a timestamp — an object is never rewritten
 * under the same name.
 */
export default defineEventHandler(async (event) => {
  const bucket = cloudflareOf(event).env?.MEDIA
  if (!bucket) {
    throw createError({ statusCode: 503, statusMessage: 'Media is unavailable in this environment.' })
  }

  const key = getRouterParam(event, 'key')
  // Only uploaded submission images are public — nothing else in the bucket.
  if (!key || !/^submissions\/[\w-]{1,64}\/\d{10,14}-[a-f0-9]{8}\.(png|jpg|webp)$/.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const object = await bucket.get(key)
  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const type = object.httpMetadata?.contentType
  setHeader(event, 'content-type', type && /^image\/(png|jpeg|webp)$/.test(type) ? type : 'application/octet-stream')
  setHeader(event, 'x-content-type-options', 'nosniff')
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  if (object.httpEtag) setHeader(event, 'etag', object.httpEtag)
  return object.body
})
