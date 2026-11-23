/**
 * Do-not-contact: { action: 'add', values: ['a@b.com', '@competitor.com'], note? }
 *                 { action: 'remove', value } — only manual entries; unsubscribes and bounces stay.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const sql = useDb()
  if (body?.action === 'add') {
    const values = (Array.isArray(body.values) ? body.values : String(body.values ?? '').split(/[\s,;]+/))
      .map(v => String(v).trim().toLowerCase()).filter(v => /^([^@\s]+)?@[^@\s]+\.[^@\s]+$/.test(v)).slice(0, 1000)
    for (const v of values) await suppress(v, 'manual', pclean(body.note, 200))
    // Stop anything running for them.
    const emails = values.filter(v => !v.startsWith('@'))
    const domains = values.filter(v => v.startsWith('@')).map(v => `%${v}`)
    await sql`update app.prospect_enrollment e set status = 'stopped' from app.prospect p
               where p.id = e.prospect_id and e.status = 'active'
                 and (lower(p.email) = any(${emails}::text[]) or lower(p.email) like any(${domains}::text[]))`
    return { ok: true, added: values.length }
  }
  if (body?.action === 'remove') {
    const value = pclean(body.value, 254)?.toLowerCase()
    await sql`delete from app.prospect_suppression where value = ${value ?? ''} and reason = 'manual'`
    return { ok: true }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
