// Admin-only: mark a feedback thread open/resolved.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<{ id?: string, status?: string }>(event)

  const status = body.status === 'resolved' ? 'resolved' : body.status === 'open' ? 'open' : null
  if (!body.id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }

  const { error } = await admin.from('feedback').update({ status }).eq('id', body.id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
