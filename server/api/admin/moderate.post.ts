// Admin-only moderation endpoint: approve/reject a submitted resource or project.
// Uses the service-role client (after verifying the caller is an admin) so the
// action is authoritative regardless of RLS.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const body = await readBody<{ table?: string, id?: string, status?: string }>(event)

  const table = body.table === 'resources' ? 'resources' : null
  const status = body.status && ['approved', 'rejected', 'pending'].includes(body.status)
    ? (body.status as 'approved' | 'rejected' | 'pending')
    : null

  if (!table || !body.id || !status) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid moderation request' })
  }

  const { error } = await admin.from(table).update({ status }).eq('id', body.id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
