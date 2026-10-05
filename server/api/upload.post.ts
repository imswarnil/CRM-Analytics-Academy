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
 *
 * With a `kind` field it also takes sponsor-studio creatives (see below).
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

  // A sponsor-studio creative: `kind` names the slot it is for, and the
  // picture must be that slot's exact size (or 2×) — checked from the bytes,
  // not trusted from the browser. Stored under brand/<sponsor id>/, a prefix
  // chosen because filter lists do not match it.
  const kind = parts?.find(p => p.name === 'kind')?.data?.toString()
  if (kind) {
    if (!(kind in PARTNER_IMAGE_SPECS)) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown image kind.' })
    }
    const sponsor = await findSponsor(useDb(), user.id)
    if (!sponsor) throw createError({ statusCode: 403, statusMessage: 'Book a month before uploading creatives.' })
    if (file.data.length > PARTNER_LIMITS.bytes) {
      throw createError({ statusCode: 413, statusMessage: 'Creative images are capped at 1 MB.' })
    }
    const size = imageDimensions(new Uint8Array(file.data))
    const spec = PARTNER_IMAGE_SPECS[kind as PartnerImageKind]
    if (!size || !partnerImageFits(kind as PartnerImageKind, size.w, size.h)) {
      throw createError({
        statusCode: 400,
        statusMessage: `${spec.label}: this image is ${size ? `${size.w}×${size.h}` : 'unreadable'}.`
      })
    }
    const key = `brand/${sponsor.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TYPES[file.type]}`
    await bucket.put(key, file.data, { httpMetadata: { contentType: file.type } })
    return { key, url: `/media/${key}`, width: size.w, height: size.h }
  }

  const key = `submissions/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TYPES[file.type]}`
  await bucket.put(key, file.data, { httpMetadata: { contentType: file.type } })

  return { key, url: `/media/${key}` }
})
