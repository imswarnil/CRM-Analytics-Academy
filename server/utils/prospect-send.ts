import type { EmailStatus, TemplateVars } from './prospect-core'
import type { SocketFactory } from './smtp'

/**
 * The outreach run (task `prospect:send`, hourly; or /admin → Prospecting →
 * "Run now"). Sends due steps of RUNNING sequences through the outreach
 * transport (outreach.ts: Hostinger SMTP from the Worker, or n8n) — never
 * Resend. At most 15 a run, under today's cap (default 30 a rolling day,
 * ramping up from 10), Monday–Friday inside the sending window of the
 * prospect's time zone (or the default one).
 *
 * Never to an address that is not valid/risky, suppressed (unsubscribed,
 * bounced, manual, deleted, an existing learner if chosen) or a prospect who
 * replied, bounced, unsubscribed, converted or is do-not-contact. Replies and
 * bounces arrive from n8n (prospect-inbound.ts) and stop the sequences.
 *
 * Every email: our own Message-ID; follow-ups carry In-Reply-To + References
 * and "Re: <first subject>"; the owner's footer; a one-click unsubscribe link
 * (List-Unsubscribe + in the body). No tracking pixel.
 */
type F = (url: string, init: { method: string, headers: Record<string, string>, body: string }) => Promise<{ ok: boolean, status: number }>

export interface ProspectRunReport {
  status: 'not_configured' | 'ok' | 'failed'
  transport: 'smtp' | 'n8n'
  sent: number
  waiting: number
  stopped: number
  cap: number
  sentLastDay: number
  errors: string[]
  at: string
}

const STOP_STATUSES = new Set(['replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact'])

export async function runProspectSend(opts: { trigger: 'cron' | 'admin', connect?: SocketFactory, fetchImpl?: F, now?: Date } = { trigger: 'cron' }): Promise<ProspectRunReport> {
  const now = opts.now ?? new Date()
  const cfg = outreachConfigFromEnv()
  const report: ProspectRunReport = { status: 'ok', transport: cfg.transport, sent: 0, waiting: 0, stopped: 0, cap: 0, sentLastDay: 0, errors: [], at: now.toISOString() }
  const notReady = outreachReady(cfg)
  if (notReady) return { ...report, status: 'not_configured', errors: [notReady] }
  const deps = { connect: opts.connect ?? workerSockets, fetch: opts.fetchImpl ?? (fetch as unknown as F) }
  const sql = useDb()
  const settings = await prospectSettings()

  const [first] = await sql`select min(sent_at) as first, count(*) filter (where sent_at > now() - interval '24 hours')::int as day from app.prospect_message`
  report.sentLastDay = Number(first?.day ?? 0)
  report.cap = capToday({ cap: settings.dailyCap, rampStart: settings.rampStart, rampStep: settings.rampStep, firstSendAt: first?.first ? new Date(first.first as string) : null, now })
  let room = Math.min(15, report.cap - report.sentLastDay)
  if (room <= 0) return await finish(report)

  const due = await sql`
    select e.id, e.sequence_id, e.prospect_id, e.step,
           p.first_name, p.last_name, p.title, p.email, p.email_status, p.status as prospect_status, p.timezone,
           c.name as company, c.domain, st.subject, st.body,
           (select m.subject from app.prospect_message m where m.enrollment_id = e.id order by m.sent_at limit 1) as first_subject,
           (select coalesce(array_agg(m.message_id order by m.sent_at), '{}') from app.prospect_message m
             where m.enrollment_id = e.id and m.message_id is not null) as refs
      from app.prospect_enrollment e
      join app.prospect_sequence q on q.id = e.sequence_id and q.status = 'running'
      join app.prospect p on p.id = e.prospect_id
      left join app.prospect_company c on c.id = p.company_id
      join app.prospect_step st on st.sequence_id = e.sequence_id and st.position = e.step
     where e.status = 'active' and e.next_at <= ${now.toISOString()}
     order by e.next_at limit 60`

  for (const d of due) {
    if (room <= 0) break
    const pid = Number(d.prospect_id)
    const stop = async (why: string) => {
      report.stopped++
      await sql`update app.prospect_enrollment set status = 'stopped' where id = ${d.id}`
      await logActivity(pid, 'stopped', why)
    }
    if (STOP_STATUSES.has(String(d.prospect_status))) {
      await stop(`Prospect is ${d.prospect_status}`)
      continue
    }
    if (!d.email || !SENDABLE.has(d.email_status as EmailStatus)) {
      await stop(`Address not sendable (${d.email_status ?? 'no email'}) — verify it first`)
      continue
    }
    const why = await suppressionReason(String(d.email), settings)
    if (why) {
      await stop(`Suppressed (${why})`)
      continue
    }
    if (!inSendWindow(now, d.timezone as string | null, settings.defaultTz, settings.windowStart, settings.windowEnd)) {
      report.waiting++
      continue
    }

    const vars: TemplateVars = {
      firstName: d.first_name as string | null, lastName: d.last_name as string | null, company: d.company as string | null,
      title: d.title as string | null, domain: d.domain as string | null, senderName: settings.senderName
    }
    const refs = ((d.refs as string[] | null) ?? []).filter(Boolean)
    const followUp = Number(d.step) > 0 && d.first_subject
    const subject = followUp ? `Re: ${String(d.first_subject).replace(/^re:\s*/i, '')}` : renderTemplate(String(d.subject), vars)
    const messageId = newMessageId(cfg.from!.address)
    const unsubscribeUrl = await prospectUnsubscribeUrl(pid)
    const body = renderTemplate(String(d.body), vars)
    const inReplyTo = refs.at(-1) ?? null
    const raw = buildMime({ from: cfg.from!.address, fromName: cfg.from!.name ?? settings.senderName, to: String(d.email), subject, body, unsubscribeUrl, footer: settings.footer, messageId, inReplyTo, references: refs, date: now })
    const { text, html } = mailBodies({ body, footer: settings.footer, unsubscribeUrl })
    try {
      const sent = await deliver(cfg, { to: String(d.email), subject, raw, text, html, messageId, inReplyTo, references: refs, unsubscribeUrl }, deps)
      room--
      report.sent++
      await sql`insert into app.prospect_message (enrollment_id, prospect_id, step, message_id, transport, subject)
                values (${d.id}, ${pid}, ${d.step}, ${messageId}, ${sent.transport}, ${subject})`
      await logActivity(pid, 'sent', `Step ${Number(d.step) + 1}: ${subject} (${sent.transport})`)
      await sql`update app.prospect set status = 'active', updated_at = now() where id = ${pid} and status = 'new'`
      const [next] = await sql`select delay_days from app.prospect_step where sequence_id = ${d.sequence_id} and position = ${Number(d.step) + 1}`
      if (next) {
        await sql`update app.prospect_enrollment set step = step + 1, next_at = ${new Date(now.getTime() + Number(next.delay_days) * 86400000).toISOString()},
                    rfc_message_id = coalesce(rfc_message_id, ${messageId}) where id = ${d.id}`
      } else {
        await sql`update app.prospect_enrollment set status = 'finished', rfc_message_id = coalesce(rfc_message_id, ${messageId}) where id = ${d.id}`
      }
    } catch (e) {
      report.errors.push(`send ${d.id}: ${String((e as Error).message).slice(0, 160)}`)
      // A refusal (auth, quota, network) stops this run; the step stays due.
      break
    }
  }
  return await finish(report)
}

async function finish(r: ProspectRunReport) {
  if (r.errors.length && !r.sent) r.status = 'failed'
  await useDb()`insert into app.prospect_setting (key, value) values ('last_run', ${JSON.stringify(r)}::jsonb)
                on conflict (key) do update set value = excluded.value`
  return r
}
