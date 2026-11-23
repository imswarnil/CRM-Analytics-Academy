/**
 * The lead score — the ONE place it is defined. Pure: no database, no fetch,
 * no auto-imports, so `node scripts/check-gtm.mjs` can test it on fixtures.
 *
 *   score = fit (0–50) + engagement (0–50)          grade: Hot ≥ 60, Warm ≥ 30, Cold
 *
 * Fit is who they are: the email domain, the network they were on, the job
 * title they gave, the country, what they asked for. Engagement is what they
 * did here: recency, frequency, lessons, exams, checkout intent, Pro, a seat.
 * Every point comes with a reason, so the score is never a black box — the
 * reasons are shown in /admin → Leads and sent to Salesforce.
 *
 * Only first-party, real data goes in. Nothing is guessed from an IP address
 * (none is stored); the network organisation is Cloudflare's AS name.
 */

export type DomainKind = 'personal' | 'business' | 'education' | 'government' | 'disposable'
export type NetworkKind = 'organisation' | 'isp' | 'hosting' | 'education' | 'unknown'
export type Grade = 'Hot' | 'Warm' | 'Cold'

/** Free webmail: a person, not a company. Compared on the full domain. */
export const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.in', 'live.com', 'live.in', 'msn.com', 'icloud.com', 'me.com',
  'mac.com', 'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.de', 'gmx.net', 'mail.com', 'yandex.com',
  'yandex.ru', 'zohomail.com', 'zohomail.in', 'rediffmail.com', 'qq.com', '163.com', '126.com', 'sina.com', 'naver.com',
  'hanmail.net', 'web.de', 't-online.de', 'libero.it', 'orange.fr', 'free.fr', 'laposte.net', 'fastmail.com', 'tutanota.com',
  'tuta.io', 'hey.com', 'inbox.com', 'aim.com', 'bol.com.br', 'uol.com.br', 'mail.ru', 'seznam.cz', 'wp.pl', 'o2.pl'
])

export const DISPOSABLE_MAIL = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com', 'trashmail.com',
  'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'mintemail.com', 'fakeinbox.com'
])

/** The domain part of an email, lower-cased, or null. */
export function emailDomain(email: string | null | undefined): string | null {
  const m = /@([a-z0-9.-]+\.[a-z]{2,})$/i.exec(String(email ?? '').trim())
  return m ? m[1]!.toLowerCase() : null
}

export function domainKind(domain: string | null | undefined): DomainKind | null {
  if (!domain) return null
  if (FREE_MAIL.has(domain)) return 'personal'
  if (DISPOSABLE_MAIL.has(domain)) return 'disposable'
  if (/(^|\.)(edu|ac\.[a-z]{2}|edu\.[a-z]{2})$/.test(domain)) return 'education'
  if (/(^|\.)(gov|gov\.[a-z]{2}|nic\.in|mil)$/.test(domain)) return 'government'
  return 'business'
}

const ISP = /tele(com|kom|net)|communications?|broadband|cable|mobile|wireless|cellular|fib(er|re)|airtel|jio|reliance|vodafone|idea cellular|bsnl|mtnl|tata (play|sky)|hathway|act (fibernet|broadband)|comcast|verizon|at&t|charter|spectrum|cox|centurylink|frontier|t-mobile|sprint|telstra|optus|rogers|bell canada|shaw|virgin media|british telecom|\bbt\b|sky broadband|orange|deutsche telekom|telefonica|movistar|claro|vivo|tim\b|telmex|pldt|globe|singtel|starhub|m1 |du |etisalat|stc\b|ooredoo|internet service|isp\b/i
const HOSTING = /amazon|aws|google|microsoft|azure|cloudflare|digitalocean|ovh|hetzner|linode|akamai|oracle|alibaba|tencent|vultr|m247|datacamp|choopa|leaseweb|contabo|fastly|zscaler|private internet|nord|expressvpn|mullvad|proton ag|surfshark|hosting|datacenter|data center|colo/i
const EDU = /universit|college|institute of technology|school|education|academ|research (and education )?network|\bnren\b|ernet/i

/** What kind of network an AS organisation name is. */
export function networkKind(asOrg: string | null | undefined): NetworkKind {
  const name = String(asOrg ?? '').trim()
  if (!name) return 'unknown'
  if (EDU.test(name)) return 'education'
  if (HOSTING.test(name)) return 'hosting'
  if (ISP.test(name)) return 'isp'
  return 'organisation'
}

export type Seniority = 'executive' | 'manager' | 'practitioner' | null
export function seniorityOf(title: string | null | undefined): Seniority {
  const t = String(title ?? '').toLowerCase()
  if (!t) return null
  if (/\b(ceo|cto|cio|cdo|cfo|coo|chief|founder|co-founder|owner|president|partner|vp|vice president|head of|director|principal)\b/.test(t)) return 'executive'
  if (/\b(manager|lead|architect|senior manager|program manager|product owner)\b/.test(t)) return 'manager'
  if (/\b(consultant|analyst|admin|administrator|developer|engineer|specialist|scientist|designer)\b/.test(t)) return 'practitioner'
  return null
}

/** Large Salesforce markets: a small fit bonus, never a penalty elsewhere. */
export const TIER_A_COUNTRIES = new Set(['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'DE', 'FR', 'NL', 'CH', 'SE', 'DK', 'NO', 'SG', 'JP', 'AE'])

/** What the score reads. Every field is optional: a lead with no account has no product signals. */
export interface ScoreInput {
  domainKind?: DomainKind | null
  companyFound?: boolean
  networkKind?: NetworkKind | null
  networkOrg?: string | null
  title?: string | null
  country?: string | null
  /** A "talk to us" request: seats, consulting, sponsorship, salesforce-setup, … */
  interest?: string | null
  seats?: number | null
  /** Product signals (from our own database). */
  lessons?: number
  activeDays30?: number
  daysSinceActive?: number | null
  examAttempts?: number
  bestExamPct?: number
  checkoutIntent?: number
  pro?: boolean
  orgSeat?: boolean
}

export interface ScoreReason {
  points: number
  kind: 'fit' | 'engagement'
  why: string
}
export interface ScoreResult {
  score: number
  grade: Grade
  fit: number
  engagement: number
  reasons: ScoreReason[]
}

export function gradeOf(score: number): Grade {
  return score >= 60 ? 'Hot' : score >= 30 ? 'Warm' : 'Cold'
}

export function scoreLead(i: ScoreInput): ScoreResult {
  const fit: ScoreReason[] = []
  const eng: ScoreReason[] = []
  const f = (points: number, why: string) => fit.push({ points, kind: 'fit', why })
  const e = (points: number, why: string) => eng.push({ points, kind: 'engagement', why })

  // ---- fit: who they are -------------------------------------------------
  if (i.domainKind === 'business') f(20, 'Business email domain')
  else if (i.domainKind === 'education') f(12, 'University or college email')
  else if (i.domainKind === 'government') f(10, 'Government email')
  else if (i.domainKind === 'disposable') f(-10, 'Disposable email address')
  if (i.companyFound) f(5, 'Company website found')
  if (i.networkKind === 'organisation') f(10, `On a company network${i.networkOrg ? ` (${i.networkOrg})` : ''}`)
  else if (i.networkKind === 'education') f(6, `On a campus network${i.networkOrg ? ` (${i.networkOrg})` : ''}`)
  const seniority = seniorityOf(i.title)
  if (seniority === 'executive') f(15, 'Senior title (decision maker)')
  else if (seniority === 'manager') f(10, 'Manager or lead title')
  else if (seniority === 'practitioner') f(5, 'Practitioner title')
  if (i.country && TIER_A_COUNTRIES.has(i.country.toUpperCase())) f(5, `Country ${i.country.toUpperCase()} (large Salesforce market)`)
  const seats = Number(i.seats ?? 0)
  if (seats >= 20) f(10, `${seats} seats requested`)
  else if (seats >= 5) f(5, `${seats} seats requested`)

  // ---- engagement: what they did --------------------------------------------
  const interest = String(i.interest ?? '')
  if (interest === 'seats') e(15, 'Asked for team seats')
  else if (interest === 'consulting' || interest === 'sponsorship') e(10, `Asked about ${interest}`)
  else if (interest) e(5, `Asked about ${interest}`)
  const since = i.daysSinceActive
  if (since !== null && since !== undefined) {
    if (since <= 1) e(10, 'Active in the last day')
    else if (since <= 7) e(7, 'Active this week')
    else if (since <= 30) e(3, 'Active this month')
  }
  const days = Number(i.activeDays30 ?? 0)
  if (days >= 10) e(10, `${days} active days in 30`)
  else if (days >= 4) e(6, `${days} active days in 30`)
  else if (days >= 1) e(2, `${days} active day(s) in 30`)
  const lessons = Number(i.lessons ?? 0)
  if (lessons >= 10) e(8, `${lessons} lessons completed`)
  else if (lessons >= 3) e(5, `${lessons} lessons completed`)
  else if (lessons >= 1) e(2, `${lessons} lesson(s) completed`)
  if (Number(i.examAttempts ?? 0) >= 1) e(6, `${i.examAttempts} practice exam(s) taken`)
  if (Number(i.bestExamPct ?? 0) >= 70) e(4, `Best exam score ${i.bestExamPct}%`)
  if (Number(i.checkoutIntent ?? 0) >= 1) e(10, 'Started a Pro checkout')
  if (i.pro) e(5, 'Pro member (expansion)')
  if (i.orgSeat) e(3, 'Holds a team seat')

  const sum = (r: ScoreReason[]) => r.reduce((s, x) => s + x.points, 0)
  const fitScore = Math.max(0, Math.min(50, sum(fit)))
  const engScore = Math.max(0, Math.min(50, sum(eng)))
  const score = fitScore + engScore
  return { score, grade: gradeOf(score), fit: fitScore, engagement: engScore, reasons: [...fit, ...eng] }
}

/** Reasons as one line for Salesforce (a 255-character text field). */
export function reasonsLine(reasons: ScoreReason[], max = 255): string {
  const line = reasons.filter(r => r.points !== 0).map(r => `${r.points > 0 ? '+' : ''}${r.points} ${r.why}`).join('; ')
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

/** Consecutive days with activity ending today or yesterday (the dashboard's rule). */
export function streakFrom(days: string[], today = new Date()): number {
  const active = new Set(days)
  const key = (offset: number) => new Date(today.getTime() - offset * 86400000).toISOString().slice(0, 10)
  let streak = 0
  for (let i = active.has(key(0)) ? 0 : 1; active.has(key(i)); i++) streak++
  return streak
}
