type Table = 'resources' | 'comments' | 'feedback' | 'guestbook' | 'profiles'

// Column selections per manageable table (admin data browser). Author embeds
// rely on the user_id → profiles FKs.
const SELECT: Record<Table, string> = {
  resources: 'id, title, url, description, category, status, created_at, user_id, author:profiles(username, full_name)',
  comments: 'id, page_path, body, created_at, user_id, author:profiles(username, full_name)',
  feedback: 'id, subject, message, category, status, created_at, user_id, author:profiles(username, full_name)',
  guestbook: 'id, name, message, drawing, status, created_at, user_id, author:profiles(username, full_name)',
  profiles: 'id, username, full_name, linkedin_url, role, created_at'
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
  return { rows: data ?? [] }
})
