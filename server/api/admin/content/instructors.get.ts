/**
 * Instructor accounts and the registry person each one is linked to. Admins
 * only. Linking is what lets an instructor edit lessons that name them in
 * `authors`; an unlinked instructor can browse the course but not save.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()
  const users = await sql`
    select user_id, email, name from app.admin_user
    where role = 'instructor'
    order by name nulls last, email
  `
  let links: Record<string, unknown>[] = []
  let migrated = true
  try {
    links = await sql`select user_id, person_slug from app.instructor_profile`
  } catch {
    migrated = false
  }
  const slugOf = new Map(links.map(l => [String(l.user_id), String(l.person_slug)]))
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    migrated,
    instructors: users.map(u => ({
      id: String(u.user_id),
      email: String(u.email),
      name: (u.name as string | null) ?? null,
      personSlug: slugOf.get(String(u.user_id)) ?? null
    }))
  }
})
