// Admin-only: pending resources + projects awaiting moderation. Uses the
// service-role client (after verifying admin) so the full queue is visible.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const [resources, projects] = await Promise.all([
    admin.from('resources')
      .select('id, title, url, description, category, status, created_at, profiles(username, full_name)')
      .eq('status', 'pending').order('created_at', { ascending: true }),
    admin.from('projects')
      .select('id, title, description, link, image_url, tags, status, created_at, profiles(username, full_name)')
      .eq('status', 'pending').order('created_at', { ascending: true })
  ])

  return { resources: resources.data ?? [], projects: projects.data ?? [] }
})
