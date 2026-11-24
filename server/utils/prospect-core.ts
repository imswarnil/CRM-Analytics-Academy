/**
 * Prospecting — the pure parts: templates, sending windows, the daily cap and
 * its ramp-up, CSV, the email message itself.
 * No database, no auto-imports: scripts/check-prospect.mjs tests them directly.
 */

export type EmailStatus = 'valid' | 'risky' | 'invalid' | 'unknown'

/** Never send to these. `unknown` must be verified first. */
export const SENDABLE: ReadonlySet<EmailStatus> = new Set(['valid', 'risky'])

/** Default people-search titles: who buys CRM Analytics training and team seats. */
export const DEFAULT_TITLES = [
  'CRM Analytics', 'Tableau CRM', 'Einstein Analytics', 'Salesforce Admin', 'Salesforce Administrator', 'Salesforce Architect',
  'Salesforce Developer', 'RevOps', 'Revenue Operations', 'BI Lead', 'Analytics Lead', 'Head of Analytics', 'Sales Operations',
  'Sales Ops', 'Learning and Development', 'L&D', 'Training Manager'
]
export const SENIORITIES = ['owner', 'founder', 'c_suite', 'partner', 'vp', 'head', 'director', 'manager', 'senior', 'entry'] as const

export interface TemplateVars {
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  title?: string | null
  domain?: string | null
  senderName?: string | null
  [k: string]: string | null | undefined
}

/**
 * {{firstName}}, {{company}}, … with an optional fallback: {{firstName|there}}.
 * An unknown variable renders as its fallback or nothing, never as braces.
 */
export function renderTemplate(tpl: string, vars: TemplateVars): string {
  return tpl.replace(/\{\{\s*([a-zA-Z]+)\s*(?:\|([^}]*))?\}\}/g, (_m, key: string, fallback?: string) => {
    const v = vars[key]
    return v !== null && v !== undefined && String(v).trim() ? String(v).trim() : (fallback ?? '').trim()
  })
}

/** Variables a template uses that a prospect has no value (and no fallback) for. */
export function missingVars(tpl: string, vars: TemplateVars): string[] {
  const out = new Set<string>()
  for (const m of tpl.matchAll(/\{\{\s*([a-zA-Z]+)\s*(\|[^}]*)?\}\}/g)) {
    const v = vars[m[1]!]
    if (!m[2] && (v === null || v === undefined || !String(v).trim())) out.add(m[1]!)
  }
  return [...out]
}

export function isTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** Weekday (1 = Monday … 7 = Sunday), hour and date in a time zone. */
export function localParts(now: Date, tz: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now).map(p => [p.type, p.value]))
  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday!) + 1
  return { weekday, hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}` }
}

/** Monday–Friday, startHour ≤ hour < endHour, in the prospect's time zone (or the fallback). */
export function inSendWindow(now: Date, tz: string | null | undefined, fallbackTz: string, startHour = 9, endHour = 17): boolean {
  const { weekday, hour } = localParts(now, isTimeZone(tz) ? tz : fallbackTz)
  return weekday >= 1 && weekday <= 5 && hour >= startHour && hour < endHour
}

/**
 * Today's cap with ramp-up: a new mailbox starts at `rampStart` a day and
 * grows by `rampStep` each day since the first outreach send, up to `cap`.
 */
export function capToday(opts: { cap: number, rampStart: number, rampStep: number, firstSendAt: Date | null, now: Date }): number {
  const cap = Math.max(0, Math.floor(opts.cap))
  if (!opts.firstSendAt) return Math.min(cap, opts.rampStart)
  const days = Math.max(0, Math.floor((opts.now.getTime() - opts.firstSendAt.getTime()) / 86400000))
  return Math.min(cap, opts.rampStart + opts.rampStep * days)
}

// ---- CSV ---------------------------------------------------------------------------

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const s = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        cell += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += c
    }
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  const [header, ...body] = rows.filter(r => r.some(x => x.trim()))
  if (!header) return []
  const keys = header.map(h => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? '' : String(v)
    // Spreadsheet formula injection: a leading = + - @ is made literal.
    if (/^[=+\-@]/.test(s)) s = `'${s}`
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [columns.join(','), ...rows.map(r => columns.map(c => cell(r[c])).join(','))].join('\n') + '\n'
}

/** CSV columns → prospect fields (common exports from Apollo, Hunter, LinkedIn, Sheets). */
export function csvToProspect(r: Record<string, string>) {
  const pick = (...keys: string[]) => keys.map(k => r[k]).find(v => v && v.trim())?.trim() ?? null
  const full = pick('name', 'full_name')
  const [f, ...l] = (full ?? '').split(/\s+/)
  const email = pick('email', 'email_address', 'work_email')?.toLowerCase() ?? null
  return {
    firstName: pick('first_name', 'firstname', 'first') ?? (f || null),
    lastName: pick('last_name', 'lastname', 'last') ?? (l.join(' ') || null),
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null,
    title: pick('title', 'job_title', 'position'),
    company: pick('company', 'company_name', 'organization', 'organisation'),
    domain: pick('domain', 'company_domain', 'website')?.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase() ?? null,
    linkedin: pick('linkedin', 'linkedin_url', 'person_linkedin_url'),
    country: pick('country'),
    timezone: pick('timezone', 'time_zone')
  }
}

// ---- the message -------------------------------------------------------------------

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
const header = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`)
const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export interface OutboundMail {
  from: string
  fromName?: string | null
  to: string
  subject: string
  body: string
  unsubscribeUrl: string
  footer: string
  /** Our own Message-ID for this email, e.g. <uuid@outreach.example.com>. */
  messageId: string
  /** The previous email in the thread, and every earlier one (References). */
  inReplyTo?: string | null
  references?: string[]
  date?: Date
}

/** The plain-text and HTML bodies: the email, the footer, the unsubscribe link. No tracking pixel. */
export function mailBodies(m: Pick<OutboundMail, 'body' | 'footer' | 'unsubscribeUrl'>) {
  const text = `${m.body.trim()}\n\n--\n${m.footer}\nUnsubscribe: ${m.unsubscribeUrl}\n`
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#181818">${m.body.trim().split(/\n{2,}/).map(p => `<p>${escHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}`
    + `<p style="font-size:12px;color:#706e6b;margin-top:24px">${escHtml(m.footer).replace(/\n/g, '<br>')}<br><a href="${escHtml(m.unsubscribeUrl)}" style="color:#706e6b">Unsubscribe</a></p></div>`
  return { text, html }
}

/** A fresh Message-ID on the sender's own domain. */
export function newMessageId(fromAddress: string): string {
  const domain = fromAddress.split('@')[1]?.replace(/[^a-z0-9.-]/gi, '') || 'localhost'
  return `<${crypto.randomUUID()}@${domain}>`
}

/**
 * An RFC 5322 message: Date, our Message-ID, In-Reply-To + References for
 * follow-ups, one-click List-Unsubscribe (RFC 8058), plain text and a
 * minimal HTML twin.
 */
export function buildMime(m: OutboundMail, boundary = `b${Math.random().toString(36).slice(2)}`): string {
  const { text, html } = mailBodies(m)
  const refs = [...new Set([...(m.references ?? []), ...(m.inReplyTo ? [m.inReplyTo] : [])])].filter(r => /^<[^<>\s]+>$/.test(r))
  const lines = [
    `From: ${m.fromName ? `${header(m.fromName)} <${m.from}>` : m.from}`,
    `To: ${m.to}`,
    `Subject: ${header(m.subject)}`,
    `Date: ${(m.date ?? new Date()).toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: ${m.messageId}`,
    ...(m.inReplyTo ? [`In-Reply-To: ${m.inReplyTo}`] : []),
    ...(refs.length ? [`References: ${refs.join(' ')}`] : []),
    'MIME-Version: 1.0',
    `List-Unsubscribe: <${m.unsubscribeUrl}>`,
    'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text).replace(/.{76}/g, '$&\r\n'),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html).replace(/.{76}/g, '$&\r\n'),
    `--${boundary}--`,
    ''
  ]
  return lines.join('\r\n')
}
