// Admin-only: resources awaiting moderation. Uses the service-role client
// (after verifying admin) so the full queue is visible.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const { data } = await admin.from('resources')
    .select('id, title, url, description, category, status, created_at, profiles(username, full_name)')
    .eq('status', 'pending').order('created_at', { ascending: true })

  return { resources: data ?? [] }
})
