/**
 * Upload a dashboard screenshot to the media bucket.
 *
 * Signed-in users only (not the demo), 10 an hour, image types checked by
 * their first bytes, 4 MB cap — this backs the submit
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

/** The file's first bytes must match its claimed type (PNG, JPEG, WebP). */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'image/png'
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  return null
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) throw createError({ statusCode: 403, statusMessage: 'The demo account cannot upload.' })
  await rateLimit(event, 'upload', 10, 60)

  const bucket = cloudflareOf(event).env?.MEDIA
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
  // A renamed script or HTML file claiming to be an image is refused.
  if (sniff(new Uint8Array(file.data.buffer, file.data.byteOffset, Math.min(16, file.data.length))) !== file.type) {
    throw createError({ statusCode: 400, statusMessage: 'That file is not the image it says it is.' })
  }

  const key = `submissions/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TYPES[file.type]}`
  await bucket.put(key, file.data, { httpMetadata: { contentType: file.type } })

  return { key, url: `/media/${key}` }
})
