import type { EmailStatus, TemplateVars } from './prospect-core'

/**
 * The outreach run (task `prospect:send`, hourly; or /admin → Prospecting →
 * "Run now"). From the connected Gmail mailbox only — never Resend.
 *
 *   1. Poll up to 25 active threads: a reply stops the prospect's sequences,
 *      a bounce stops them, marks the address invalid and suppresses it.
 *   2. Send due steps of RUNNING sequences, at most 15 a run, under today's
 *      cap (default 30 a rolling day, ramping up from 10), Monday–Friday in
 *      the sending window of the prospect's time zone (or the default one).
 *      Never to an address that is not valid/risky, suppressed (unsubscribed,
 *      bounced, manual, deleted, an existing learner if chosen) or a prospect
 *      who replied, bounced, unsubscribed, converted or is do-not-contact.
 *
 * Every email: rendered template, the owner's footer, a one-click
 * unsubscribe link (List-Unsubscribe + in the body). No tracking pixel.
 */
type F = (url: string, init?: { method?: string, headers?: Record<string, string>, body?: string | URLSearchParams }) => Promise<{ ok: boolean, status: number, json: () => Promise<unknown> }>

export interface ProspectRunReport {
  status: 'not_configured' | 'no_mailbox' | 'ok' | 'failed'
  polled: number
  replies: number
  bounces: number
  sent: number
  waiting: number
  stopped: number
  cap: number
  sentLastDay: number
  errors: string[]
  at: string
}

const STOP_STATUSES = new Set(['replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact'])

export async function runProspectSend(opts: { trigger: 'cron' | 'admin', fetchImpl?: F, now?: Date } = { trigger: 'cron' }): Promise<ProspectRunReport> {
  const now = opts.now ?? new Date()
  const report: ProspectRunReport = { status: 'ok', polled: 0, replies: 0, bounces: 0, sent: 0, waiting: 0, stopped: 0, cap: 0, sentLastDay: 0, errors: [], at: now.toISOString() }
  const cfg = googleConfigFromEnv()
  if (!cfg) return { ...report, status: 'not_configured' }
  const box = await mailbox()
  if (!box) return { ...report, status: 'no_mailbox' }
  const f = opts.fetchImpl ?? (fetch as unknown as F)
  const sql = useDb()
  const settings = await prospectSettings()

  let token: string
  try {
    token = await accessToken(cfg, box.refreshToken, f)
  } catch (e) {
    const msg = String((e as Error).message)
    if (msg.startsWith('invalid_grant')) await sql`update app.mail_account set status = 'revoked' where email = ${box.email}`
    return await finish({ ...report, status: 'failed', errors: [msg] })
  }

  // ---- 1. replies and bounces ---------------------------------------------------------
  const threads = await sql`
    select e.id, e.prospect_id, e.thread_id, p.email from app.prospect_enrollment e join app.prospect p on p.id = e.prospect_id
     where e.status = 'active' and e.thread_id is not null
     order by e.last_checked_at nulls first limit 25`
  for (const t of threads) {
    try {
      const state = await threadState(token, String(t.thread_id), box.email, f)
      report.polled++
      await sql`update app.prospect_enrollment set last_checked_at = now() where id = ${t.id}`
      if (state === 'replied') {
        report.replies++
        await sql`update app.prospect_enrollment set status = 'replied' where prospect_id = ${t.prospect_id} and status = 'active'`
        await sql`update app.prospect set status = 'replied', updated_at = now() where id = ${t.prospect_id} and status not in ('converted', 'unsubscribed')`
        await logActivity(Number(t.prospect_id), 'replied', 'Reply seen in Gmail — sequences stopped')
      } else if (state === 'bounced') {
        report.bounces++
        await sql`update app.prospect_enrollment set status = 'bounced' where prospect_id = ${t.prospect_id} and status = 'active'`
        await sql`update app.prospect set status = 'bounced', email_status = 'invalid', updated_at = now() where id = ${t.prospect_id}`
        if (t.email) await suppress(String(t.email), 'bounced')
        await logActivity(Number(t.prospect_id), 'bounced', 'Bounce seen in Gmail — address suppressed')
      }
    } catch (e) {
      report.errors.push(`poll ${t.id}: ${String((e as Error).message).slice(0, 120)}`)
    }
  }

  // ---- 2. due steps --------------------------------------------------------------------
  const [first] = await sql`select min(sent_at) as first, count(*) filter (where sent_at > now() - interval '24 hours')::int as day from app.prospect_message`
  report.sentLastDay = Number(first?.day ?? 0)
  report.cap = capToday({ cap: settings.dailyCap, rampStart: settings.rampStart, rampStep: settings.rampStep, firstSendAt: first?.first ? new Date(first.first as string) : null, now })
  let room = Math.min(15, report.cap - report.sentLastDay)

  const due = room > 0
    ? await sql`
        select e.id, e.sequence_id, e.prospect_id, e.step, e.thread_id, e.rfc_message_id,
               p.first_name, p.last_name, p.title, p.email, p.email_status, p.status as prospect_status, p.timezone,
               c.name as company, c.domain, st.subject, st.body,
               (select m.subject from app.prospect_message m where m.enrollment_id = e.id order by m.sent_at limit 1) as first_subject
          from app.prospect_enrollment e
          join app.prospect_sequence q on q.id = e.sequence_id and q.status = 'running'
          join app.prospect p on p.id = e.prospect_id
          left join app.prospect_company c on c.id = p.company_id
          join app.prospect_step st on st.sequence_id = e.sequence_id and st.position = e.step
         where e.status = 'active' and e.next_at <= ${now.toISOString()}
         order by e.next_at limit 60`
    : []

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
    const rendered = renderTemplate(String(d.subject), vars)
    const subject = Number(d.step) > 0 && d.thread_id && d.first_subject ? `Re: ${String(d.first_subject).replace(/^re:\s*/i, '')}` : rendered
    try {
      const raw = base64url(buildMime({
        from: box.email,
        fromName: settings.senderName,
        to: String(d.email),
        subject,
        body: renderTemplate(String(d.body), vars),
        unsubscribeUrl: await prospectUnsubscribeUrl(pid),
        footer: settings.footer,
        inReplyTo: (d.rfc_message_id as string | null) ?? null
      }))
      const sent = await sendRaw(token, raw, (d.thread_id as string | null) ?? null, f)
      room--
      report.sent++
      await sql`insert into app.prospect_message (enrollment_id, prospect_id, step, gmail_id, thread_id, subject)
                values (${d.id}, ${pid}, ${d.step}, ${sent.id}, ${sent.threadId}, ${subject})`
      await logActivity(pid, 'sent', `Step ${Number(d.step) + 1}: ${subject}`)
      await sql`update app.prospect set status = 'active', updated_at = now() where id = ${pid} and status = 'new'`
      const [next] = await sql`select delay_days from app.prospect_step where sequence_id = ${d.sequence_id} and position = ${Number(d.step) + 1}`
      if (next) {
        await sql`update app.prospect_enrollment set step = step + 1, next_at = ${new Date(now.getTime() + Number(next.delay_days) * 86400000).toISOString()},
                    thread_id = coalesce(thread_id, ${sent.threadId}), rfc_message_id = coalesce(rfc_message_id, ${sent.messageId}) where id = ${d.id}`
      } else {
        await sql`update app.prospect_enrollment set status = 'finished', thread_id = coalesce(thread_id, ${sent.threadId}),
                    rfc_message_id = coalesce(rfc_message_id, ${sent.messageId}) where id = ${d.id}`
      }
    } catch (e) {
      report.errors.push(`send ${d.id}: ${String((e as Error).message).slice(0, 120)}`)
      // A Gmail refusal (quota, auth) stops this run; the step stays due.
      break
    }
  }
  return await finish(report)
}

async function finish(r: ProspectRunReport) {
  if (r.errors.length && r.status === 'ok' && !r.sent && !r.polled) r.status = 'failed'
  await useDb()`insert into app.prospect_setting (key, value) values ('last_run', ${JSON.stringify(r)}::jsonb)
                on conflict (key) do update set value = excluded.value`
  return r
}
