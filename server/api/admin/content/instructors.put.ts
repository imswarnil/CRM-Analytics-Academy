/**
 * Link an instructor account to a person in the registry (or unlink it with
 * personSlug: null). Admins only. The person must exist on main — linking to
 * a slug nobody can author lessons under would be a dead end.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{ userId?: unknown, personSlug?: unknown }>(event)
  const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Which user?' })

  const sql = useDb()
  if (body?.personSlug === null || body?.personSlug === '') {
    await sql`delete from app.instructor_profile where user_id = ${userId}`
    return { ok: true, personSlug: null }
  }

  const slug = assertSlug(body?.personSlug, 'Person')
  const course = await readCourse()
  if (!course.people.some(p => p.slug === slug)) {
    throw createError({ statusCode: 422, statusMessage: `content/people/${slug}.yml does not exist on main yet - add the person first.` })
  }
  try {
    await sql`
      insert into app.instructor_profile (user_id, person_slug, updated_by)
      values (${userId}, ${slug}, ${admin.id})
      on conflict (user_id) do update
        set person_slug = excluded.person_slug, updated_by = excluded.updated_by, updated_at = now()
    `
  } catch (e) {
    if (/unique/i.test(String((e as Error).message))) {
      throw createError({ statusCode: 409, statusMessage: `Another account is already linked to ${slug}.` })
    }
    if (/does not exist/i.test(String((e as Error).message))) {
      throw createError({ statusCode: 503, statusMessage: 'Instructor tables are missing - apply server/db/012_instructors.sql.' })
    }
    throw e
  }
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, personSlug: slug }
})
