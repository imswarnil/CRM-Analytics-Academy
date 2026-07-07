type Table = 'resources' | 'comments' | 'feedback' | 'guestbook' | 'profiles' | 'resource_votes'

// Column selections per manageable table (admin data browser). Author embeds
// rely on the user_id → profiles FKs.
const SELECT: Record<Table, string> = {
  resources: 'id, title, url, description, category, status, created_at, user_id, author:profiles(username, full_name)',
  comments: 'id, page_path, body, created_at, user_id, author:profiles(username, full_name)',
  feedback: 'id, subject, message, category, status, created_at, user_id, author:profiles(username, full_name)',
  guestbook: 'id, name, message, drawing, status, created_at, user_id, author:profiles(username, full_name)',
  profiles: 'id, username, full_name, linkedin_url, role, created_at',
  resource_votes: 'id, created_at, user_id, resource_id, author:profiles(username, full_name), resource:resources(title)'
}

// Admin-only: browse every row of an allowlisted table for full CRUD.
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const table = getQuery(event).table as string
  if (!(table in SELECT)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown table' })
  }
  const t = table as Table

  const { data, error } = await admin
    .from(t)
    .select(SELECT[t])
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Flatten the votes' embedded resource title into a plain column the generic
  // grid can render.
  if (t === 'resource_votes') {
    const rows = (data ?? []) as { resource?: { title?: string } | null }[]
    return { rows: rows.map(r => ({ ...r, resource_title: r.resource?.title ?? '—', resource: undefined })) }
  }

  return { rows: data ?? [] }
})
