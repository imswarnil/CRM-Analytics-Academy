/**
 * Lists: create { name } · rename { id, name } · delete { id } (members stay prospects)
 *        add / remove { id, prospectIds } · import { id?, csv, source } (CSV text, 2 MB max)
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()
  const id = Number(body.id)
  const ids = Array.isArray(body.prospectIds) ? body.prospectIds.map(Number).filter(Number.isInteger).slice(0, 1000) : []

  switch (body.action) {
    case 'create': {
      const name = pclean(body.name, 80)
      if (!name) throw createError({ statusCode: 400, statusMessage: 'Name the list' })
      const [row] = await sql`insert into app.prospect_list (name) values (${name}) on conflict (name) do update set name = excluded.name returning id`
      return { ok: true, id: Number(row!.id) }
    }
    case 'rename': {
      const name = pclean(body.name, 80)
      if (!name || !Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad request' })
      await sql`update app.prospect_list set name = ${name} where id = ${id}`
      return { ok: true }
    }
    case 'delete':
      await sql`delete from app.prospect_list where id = ${id}`
      return { ok: true }
    case 'add':
      if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad list' })
      if (ids.length) await sql`insert into app.prospect_list_member (list_id, prospect_id) select ${id}, unnest(${ids}::bigint[]) on conflict do nothing`
      return { ok: true }
    case 'remove':
      if (ids.length) await sql`delete from app.prospect_list_member where list_id = ${id} and prospect_id = any(${ids}::bigint[])`
      return { ok: true }
    case 'import': {
      const csv = typeof body.csv === 'string' ? body.csv : ''
      if (!csv || csv.length > 2_000_000) throw createError({ statusCode: 400, statusMessage: 'Paste or upload a CSV under 2 MB' })
      const source = pclean(body.source, 120)
      if (!source) throw createError({ statusCode: 400, statusMessage: 'Say where this CSV came from (source) — GDPR needs it' })
      const rows = parseCsv(csv).map(csvToProspect)
      return await saveProspects(rows, { source: `CSV import: ${source}`, listId: Number.isInteger(id) ? id : null, lawfulBasis: body.lawfulBasis === 'consent' ? 'consent' : 'legitimate_interest' })
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
