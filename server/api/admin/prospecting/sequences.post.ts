/**
 * Sequences. Nothing is ever sent until the owner previews a sequence, marks
 * it reviewed and presses Start; editing it sends it back to draft.
 *
 *   save    { id?, name, steps: [{ delayDays, subject, body }] }   (≤ 10 steps; not while running)
 *   preview { id, prospectId }  → each step rendered for that prospect, missing variables, sendability
 *   review  { id }  · start { id } (must be reviewed) · pause { id } · delete { id }
 *   enroll  { id, listId? , prospectIds? } → only sendable, unsuppressed prospects
 *   unenroll { id, prospectIds }
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()

  if (body.action === 'save') {
    const name = pclean(body.name, 80)
    const steps = (Array.isArray(body.steps) ? body.steps : []).slice(0, 10).map((s: Record<string, unknown>, i: number) => ({
      position: i,
      delayDays: Math.min(60, Math.max(0, Math.round(Number(s?.delayDays) || 0))),
      subject: String(s?.subject ?? '').trim().slice(0, 200),
      body: String(s?.body ?? '').replace(/\r\n/g, '\n').trim().slice(0, 5000)
    }))
    if (!name || !steps.length || steps.some(s => !s.subject || !s.body)) throw createError({ statusCode: 400, statusMessage: 'A name and at least one step with a subject and a body' })
    let id = Number(body.id)
    if (Number.isInteger(id) && id > 0) {
      const [cur] = await sql`select status from app.prospect_sequence where id = ${id}`
      if (!cur) throw createError({ statusCode: 404, statusMessage: 'Not found' })
      if (cur.status === 'running') throw createError({ statusCode: 409, statusMessage: 'Pause the sequence before editing it' })
      await sql`update app.prospect_sequence set name = ${name}, status = 'draft', reviewed_at = null where id = ${id}`
      await sql`delete from app.prospect_step where sequence_id = ${id}`
    } else {
      const [row] = await sql`insert into app.prospect_sequence (name) values (${name}) returning id`
      id = Number(row!.id)
    }
    const json = JSON.stringify(steps.map(s => ({ position: s.position, delay_days: s.delayDays, subject: s.subject, body: s.body })))
    await sql`insert into app.prospect_step (sequence_id, position, delay_days, subject, body)
              select ${id}, position, delay_days, subject, body from jsonb_to_recordset(${json}::jsonb) as x(position smallint, delay_days smallint, subject text, body text)`
    return { ok: true, id }
  }

  const id = Number(body.id)
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  const [seq] = await sql`select * from app.prospect_sequence where id = ${id}`
  if (!seq) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  switch (body.action) {
    case 'preview': {
      const pid = Number(body.prospectId)
      const [p] = await sql`select p.*, c.name as company, c.domain from app.prospect p left join app.prospect_company c on c.id = p.company_id where p.id = ${pid}`
      if (!p) throw createError({ statusCode: 404, statusMessage: 'Prospect not found' })
      const settings = await prospectSettings()
      const steps = await sql`select * from app.prospect_step where sequence_id = ${id} order by position`
      const vars: TemplateVars = { firstName: p.first_name as string | null, lastName: p.last_name as string | null, company: p.company as string | null, title: p.title as string | null, domain: p.domain as string | null, senderName: settings.senderName }
      const suppressed = p.email ? await suppressionReason(String(p.email), settings) : null
      let day = 0
      return {
        to: p.email ?? null,
        emailStatus: p.email_status ?? null,
        sendable: Boolean(p.email && SENDABLE.has(p.email_status as EmailStatus) && !suppressed && !['replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact'].includes(String(p.status))),
        blocked: suppressed ? `suppressed (${suppressed})` : !p.email ? 'no email' : !SENDABLE.has(p.email_status as EmailStatus) ? `email ${p.email_status ?? 'not verified'}` : null,
        timezone: (p.timezone as string | null) ?? settings.defaultTz,
        steps: steps.map((s) => {
          day += Number(s.delay_days)
          return {
            day,
            subject: renderTemplate(String(s.subject), vars),
            body: `${renderTemplate(String(s.body), vars)}\n\n--\n${settings.footer}\nUnsubscribe: (one-click link)`,
            missing: [...new Set([...missingVars(String(s.subject), vars), ...missingVars(String(s.body), vars)])]
          }
        })
      }
    }
    case 'review':
      if (seq.status === 'running') throw createError({ statusCode: 409, statusMessage: 'Already running' })
      await sql`update app.prospect_sequence set status = 'reviewed', reviewed_at = now() where id = ${id}`
      return { ok: true }
    case 'start':
      if (!['reviewed', 'paused'].includes(String(seq.status)) || !seq.reviewed_at) throw createError({ statusCode: 409, statusMessage: 'Preview the sequence and mark it reviewed first' })
      await sql`update app.prospect_sequence set status = 'running', started_at = coalesce(started_at, now()) where id = ${id}`
      return { ok: true }
    case 'pause':
      await sql`update app.prospect_sequence set status = 'paused' where id = ${id} and status = 'running'`
      return { ok: true }
    case 'delete':
      if (seq.status === 'running') throw createError({ statusCode: 409, statusMessage: 'Pause it first' })
      await sql`delete from app.prospect_sequence where id = ${id}`
      return { ok: true }
    case 'enroll': {
      const listId = Number(body.listId)
      const ids = Array.isArray(body.prospectIds) ? body.prospectIds.map(Number).filter(Number.isInteger).slice(0, 1000) : []
      const candidates = Number.isInteger(listId) && listId > 0
        ? await sql`select p.id, p.email, p.email_status, p.status from app.prospect p join app.prospect_list_member m on m.prospect_id = p.id where m.list_id = ${listId}`
        : await sql`select id, email, email_status, status from app.prospect where id = any(${ids}::bigint[])`
      const settings = await prospectSettings()
      const out = { enrolled: 0, already: 0, skipped: [] as string[] }
      for (const c of candidates) {
        const label = String(c.email ?? `#${c.id}`)
        if (!c.email || !SENDABLE.has(c.email_status as EmailStatus)) {
          out.skipped.push(`${label}: ${c.email ? `email ${c.email_status ?? 'not verified'}` : 'no email'}`)
          continue
        }
        if (['replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact'].includes(String(c.status))) {
          out.skipped.push(`${label}: ${c.status}`)
          continue
        }
        const why = await suppressionReason(String(c.email), settings)
        if (why) {
          out.skipped.push(`${label}: suppressed (${why})`)
          continue
        }
        const [row] = await sql`insert into app.prospect_enrollment (sequence_id, prospect_id) values (${id}, ${c.id}) on conflict do nothing returning id`
        if (!row) {
          out.already++
          continue
        }
        out.enrolled++
        await logActivity(Number(c.id), 'enrolled', `Sequence "${seq.name}"`)
      }
      return out
    }
    case 'unenroll': {
      const ids = Array.isArray(body.prospectIds) ? body.prospectIds.map(Number).filter(Number.isInteger).slice(0, 1000) : []
      await sql`update app.prospect_enrollment set status = 'stopped' where sequence_id = ${id} and prospect_id = any(${ids}::bigint[]) and status = 'active'`
      return { ok: true }
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
