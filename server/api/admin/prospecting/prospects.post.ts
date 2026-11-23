/**
 * Prospect actions (admin only):
 *   save       { people: NewProspect[], source, lawfulBasis?, listId? }
 *   update     { id, firstName?, lastName?, title?, email?, timezone?, country? }
 *   find_email { id }      — provider email finder (name + company domain)
 *   verify     { id }      — provider verifier → valid / risky / invalid / unknown
 *   status     { id, status: 'do_not_contact' | 'new' }
 *   note       { id, text }
 *   convert    { id }      — into app.lead + Web-to-Lead with source = outbound
 *   delete     { id, suppress? } — GDPR erasure; `suppress` keeps the address on the do-not-contact list
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()
  const env = process.env as Record<string, string | undefined>

  if (body.action === 'save') {
    const source = pclean(body.source, 120)
    if (!source) throw createError({ statusCode: 400, statusMessage: 'Say where these people came from (source)' })
    const listId = Number.isInteger(Number(body.listId)) && body.listId ? Number(body.listId) : null
    return await saveProspects(Array.isArray(body.people) ? body.people as NewProspect[] : [], { source, lawfulBasis: body.lawfulBasis === 'consent' ? 'consent' : 'legitimate_interest', listId })
  }

  const id = Number(body.id)
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  const [p] = await sql`select p.*, c.domain, c.name as company from app.prospect p left join app.prospect_company c on c.id = p.company_id where p.id = ${id}`
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  switch (body.action) {
    case 'update': {
      const email = body.email === undefined ? p.email : pemail(body.email)
      const tz = pclean(body.timezone, 60)
      const changedEmail = email !== p.email
      await sql`update app.prospect set first_name = ${body.firstName === undefined ? p.first_name : pclean(body.firstName, 80)},
                  last_name = ${body.lastName === undefined ? p.last_name : pclean(body.lastName, 80)},
                  title = ${body.title === undefined ? p.title : pclean(body.title, 160)}, email = ${email},
                  email_status = ${changedEmail ? null : p.email_status}, timezone = ${tz && isTimeZone(tz) ? tz : body.timezone === undefined ? p.timezone : null},
                  country = ${body.country === undefined ? p.country : pclean(body.country, 80)}, updated_at = now() where id = ${id}`
      await logActivity(id, 'edited', changedEmail ? `Email changed to ${email ?? 'none'} — verify it again` : 'Details edited')
      return { ok: true }
    }
    case 'find_email': {
      const provider = providerFor('find', env)
      if (!provider?.findEmail) throw createError({ statusCode: 409, statusMessage: 'Connect an email finder (HUNTER_API_KEY)' })
      if (!p.first_name || !p.last_name || !p.domain) throw createError({ statusCode: 400, statusMessage: 'Needs a first name, last name and company domain' })
      const found = await provider.findEmail({ firstName: String(p.first_name), lastName: String(p.last_name), domain: String(p.domain) }, providerContext(provider))
      if (!found) {
        await logActivity(id, 'email_not_found', provider.label)
        return { ok: true, email: null }
      }
      const [taken] = await sql`select id from app.prospect where lower(email) = ${found.email} and id <> ${id}`
      if (taken) throw createError({ statusCode: 409, statusMessage: `${found.email} already belongs to prospect #${taken.id}` })
      await sql`update app.prospect set email = ${found.email}, email_status = ${found.status}, email_detail = ${`${provider.label} finder${found.score !== null ? ` (score ${found.score})` : ''}`},
                  email_checked_at = now(), updated_at = now() where id = ${id}`
      await logActivity(id, 'email_found', `${found.email} · ${found.status} · ${provider.label}`)
      return { ok: true, email: found.email, status: found.status }
    }
    case 'verify': {
      const provider = providerFor('verify', env)
      if (!provider?.verifyEmail) throw createError({ statusCode: 409, statusMessage: 'Connect an email verifier (HUNTER_API_KEY)' })
      if (!p.email) throw createError({ statusCode: 400, statusMessage: 'No email to verify' })
      const v = await provider.verifyEmail(String(p.email), providerContext(provider))
      await sql`update app.prospect set email_status = ${v.status}, email_detail = ${v.detail}, email_checked_at = now(), updated_at = now() where id = ${id}`
      await logActivity(id, 'verified', `${p.email}: ${v.status} (${v.detail})`)
      if (v.status === 'invalid') await sql`update app.prospect_enrollment set status = 'stopped' where prospect_id = ${id} and status = 'active'`
      return { ok: true, status: v.status, detail: v.detail }
    }
    case 'status': {
      const status = body.status === 'do_not_contact' ? 'do_not_contact' : body.status === 'new' ? 'new' : null
      if (!status) throw createError({ statusCode: 400, statusMessage: 'Bad status' })
      await sql`update app.prospect set status = ${status}, updated_at = now() where id = ${id}`
      if (status === 'do_not_contact') {
        await sql`update app.prospect_enrollment set status = 'stopped' where prospect_id = ${id} and status = 'active'`
        if (p.email) await suppress(String(p.email), 'manual', 'Marked do-not-contact')
      }
      await logActivity(id, status === 'do_not_contact' ? 'do_not_contact' : 'reopened', null)
      return { ok: true }
    }
    case 'note': {
      const text = pclean(body.text, 1000)
      if (!text) throw createError({ statusCode: 400, statusMessage: 'Empty note' })
      await logActivity(id, 'note', text)
      return { ok: true }
    }
    case 'convert': {
      if (p.lead_id) return { ok: true, leadId: Number(p.lead_id) }
      if (!p.email) throw createError({ statusCode: 400, statusMessage: 'A lead needs an email' })
      const [lead] = await sql`
        insert into app.lead (product, interest, first_name, last_name, email, company, title, country, source, landing, message)
        values ('outbound', 'outbound', ${p.first_name}, ${p.last_name ?? p.email}, ${p.email}, ${p.company}, ${p.title}, ${p.country},
                'outbound', '/admin/prospecting', ${`Outbound prospect #${id} (source: ${p.source})`})
        returning id`
      const leadId = Number(lead!.id)
      await sql`update app.prospect set status = 'converted', lead_id = ${leadId}, updated_at = now() where id = ${id}`
      await sql`update app.prospect_enrollment set status = 'stopped' where prospect_id = ${id} and status = 'active'`
      await logActivity(id, 'converted', `Lead #${leadId} — sent to Salesforce with source outbound`)
      // The same path as a "talk to us" request: enrich, then Web-to-Lead.
      event.waitUntil((async () => {
        const enrichment = await enrichLead(leadId)
        const sf = await sendLeadToSalesforce({
          event: 'request', product: 'outbound', firstName: p.first_name as string | null, lastName: String(p.last_name ?? p.email),
          email: String(p.email), company: p.company as string | null, title: p.title as string | null, country: null,
          message: `Outbound prospect (source: ${p.source})`, lessonsDone: 0, points: 0, source: 'outbound', landing: null, enrichment
        })
        await sql`update app.lead set sf_status = ${sf} where id = ${leadId}`
      })().catch(e => console.warn(`convert ${id}: ${String((e as Error).message).slice(0, 120)}`)))
      return { ok: true, leadId }
    }
    case 'delete': {
      if (body.suppress === true && p.email) await suppress(String(p.email), 'deleted', 'Prospect deleted, kept as do-not-contact')
      await sql`delete from app.prospect where id = ${id}`
      return { ok: true }
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
