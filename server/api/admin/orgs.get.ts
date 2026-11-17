/** Every organisation with seats in use (admin console → Teams). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await useDb()`
    select o.*, (select count(*)::int from app.org_member m where m.org_id = o.id) as used,
           (select u.email from app.org_member m join neon_auth."user" u on u.id::text = m.user_id
             where m.org_id = o.id and m.role = 'admin' limit 1) as admin_email
    from app.org o order by o.created_at desc`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    orgs: rows.map(r => ({
      id: Number(r.id), name: String(r.name), kind: String(r.kind), seats: Number(r.seats), used: Number(r.used),
      joinCode: String(r.join_code), domain: (r.domain as string | null) ?? null, status: String(r.status),
      expiresAt: (r.expires_at as string | null) ?? null, adminEmail: (r.admin_email as string | null) ?? null
    }))
  }
})
