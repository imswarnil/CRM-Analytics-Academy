/**
 * Upload a dashboard screenshot to the media bucket.
 *
 * Signed-in users only, image types only, 4 MB cap — this backs the submit
 * form's photo picker, not a general file host. Keys are namespaced under
 * submissions/<user>/ so moderation can trace every object to the account
 * that wrote it, and the filename is regenerated server-side so a client
 * can never choose a key.
 *
 * The R2 binding only exists on the deployed Worker (wrangler.jsonc →
 * r2_buckets). In `nuxt dev` there is no bucket, so the route answers 503
 * rather than pretending the upload happened.
 */
const MAX_BYTES = 4 * 1024 * 1024
const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const bucket = event.context.cloudflare?.env?.MEDIA
  if (!bucket) {
    throw createError({ statusCode: 503, statusMessage: 'Uploads are unavailable in this environment.' })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file || !file.type || !(file.type in TYPES)) {
    throw createError({ statusCode: 400, statusMessage: 'Send one PNG, JPG or WebP image as `file`.' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Images are capped at 4 MB.' })
  }

  const key = `submissions/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TYPES[file.type]}`
  await bucket.put(key, file.data, { httpMetadata: { contentType: file.type } })

  return { key, url: `/media/${key}` }
})
