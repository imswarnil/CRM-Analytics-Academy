/**
 * A team admin sets the company email domains: { domains }. Anyone signing in
 * with a VERIFIED email on one takes a free seat automatically. Public mail
 * providers are refused.
 */
const PUBLIC_MAIL = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'aol.com', 'gmx.com', 'yandex.com', 'mail.com', 'zoho.com', 'qq.com', '163.com', 'rediffmail.com'])
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ domains?: string | string[] }>(event).catch(() => null)
  const list = (Array.isArray(body?.domains) ? body!.domains : String(body?.domains ?? '').split(/[\s,;]+/))
    .map(d => String(d).trim().toLowerCase().replace(/^@/, '')).filter(Boolean)
  const bad = list.find(d => !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) || PUBLIC_MAIL.has(d))
  if (bad) throw createError({ statusCode: 400, statusMessage: `${bad} cannot be a company domain.` })
  // Only a domain the admin's own email is on — so nobody claims someone else's company.
  const own = user.email.split('@')[1]?.toLowerCase()
  if (list.some(d => d !== own && !own?.endsWith(`.${d}`) && !d.endsWith(`.${own}`))) {
    throw createError({ statusCode: 400, statusMessage: `You can add your own email's domain (${own}). Ask us to add others.` })
  }
  const sql = useDb()
  const updated = await sql`
    update app.org o set domains = ${[...new Set(list)].slice(0, 10)}
    from app.org_member me where me.user_id = ${user.id} and me.role = 'admin' and o.id = me.org_id and o.status = 'active'
    returning o.id`
  if (!updated.length) throw createError({ statusCode: 403, statusMessage: 'Only your team admin can set domains.' })
  return { ok: true }
})
