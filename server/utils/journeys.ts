import { DOMAINS, PAPERS, type ExamDomain } from '../../app/utils/exam'

/**
 * Email journeys, run every hour by the `email:journeys` task (Cron Trigger).
 * Each journey is a query for who is due a step, and the email for that step.
 * A send is recorded in app.email_sent BEFORE it goes out (and forgotten if
 * Resend refuses it), so a crashed or overlapping run never sends twice.
 *
 * Rules (business/AUTOMATION.md): one link per email; marketing emails only
 * to verified addresses that have not opted out, at most two in seven days per
 * person, and only to accounts created after JOURNEYS_START, so existing
 * accounts are never sent a backlog. Certificates are transactional: they go
 * regardless of the weekly cap.
 */
const SITE = 'https://crmanalytics.imswarnil.com'
const JOURNEYS_START = '2026-11-22'
const MARKETING = ['welcome', 'stalled', 'exam', 'checkout']
const PER_RUN = 40

interface Due {
  userId: string
  email: string
  name: string | null
  journey: string
  step: number
  ref: string
  transactional?: boolean
  mail: (first: string) => Omit<Mail, 'to' | 'idempotencyKey' | 'unsubscribe'>
}

export interface JourneyReport {
  configured: boolean
  dry: boolean
  due: { email: string, journey: string, step: number, ref: string, subject: string }[]
  sent: number
  failed: string[]
}

const firstName = (name: string | null) => (name ?? '').trim().split(/\s+/)[0]?.replace(/[^\p{L}'-]/gu, '') || 'there'
const drillFor = (d: ExamDomain) => PAPERS.find(p => p.domain === d)?.id

async function findDue(): Promise<Due[]> {
  const sql = useDb()
  const demo = (process.env.DEMO_USER_EMAIL ?? '').toLowerCase()
  const due: Due[] = []

  // Welcome: three steps over the first five days.
  const welcome = await sql`
    select u.id::text as id, u.email, u.name, u."createdAt" as created,
      (select count(*)::int from app.progress p where p.user_id = u.id::text) as done,
      coalesce((select max(step) from app.email_sent s where s.user_id = u.id::text and s.journey = 'welcome'), -1) as last_step
    from neon_auth."user" u
    where u."emailVerified" and u."createdAt" >= ${JOURNEYS_START}::date
      and u."createdAt" > now() - interval '9 days'`
  for (const u of welcome) {
    const age = (Date.now() - new Date(u.created as string).getTime()) / 3600e3
    const base = { userId: u.id as string, email: u.email as string, name: u.name as string | null, journey: 'welcome', ref: '' }
    const done = u.done as number
    const last = u.last_step as number
    if (last < 0 && age >= 0.17) {
      due.push({ ...base, step: 0, mail: n => ({
        subject: 'Welcome to CRM Analytics Academy',
        lines: [`Hi ${n},`, 'Thanks for joining. The course goes from your first dataset to SAQL, bindings and Einstein Discovery, one short lesson at a time.', 'Start with lesson one. It takes about five minutes, and your progress saves as you go.'],
        cta: { label: 'Start the course', url: `${SITE}/start` }
      }) })
    } else if (last === 0 && age >= 48) {
      due.push({ ...base, step: 1, mail: n => done === 0
        ? {
            subject: 'Your first lesson takes five minutes',
            lines: [`Hi ${n},`, 'Most people who finish this course started with one lesson on a quiet evening. The first one is how Salesforce objects, fields and relationships become the data you analyse.', 'Five minutes, one quiz, and you are on the board.'],
            cta: { label: 'Open lesson one', url: `${SITE}/salesforce-foundations/objects-fields-and-relationships` }
          }
        : {
            subject: `${done} lesson${done === 1 ? '' : 's'} done. Here is your next one`,
            lines: [`Hi ${n},`, `You have finished ${done} lesson${done === 1 ? '' : 's'} already. Your dashboard keeps your place and shows what comes next.`],
            cta: { label: 'Continue where you left off', url: `${SITE}/dashboard` }
          } })
    } else if (last === 1 && age >= 120) {
      due.push({ ...base, step: 2, mail: n => ({
        subject: 'Try one exam drill: 15 questions, 25 minutes',
        lines: [`Hi ${n},`, 'If you are aiming for the CRM Analytics and Einstein Discovery Consultant exam, a short drill shows you where you stand before you study.', 'Each drill is 15 questions from one exam domain, with the answer explained.'],
        cta: { label: 'Pick a drill', url: `${SITE}/certification` }
      }) })
    }
  }

  // Stalled: the last lesson was 7–14 days ago and nothing since. Once per lesson.
  const stalled = await sql`
    with last as (
      select user_id, max(completed_at) as at,
        (array_agg(lesson_path order by completed_at desc))[1] as path, count(*)::int as done
      from app.progress group by user_id
    )
    select u.id::text as id, u.email, u.name, l.path, l.done
    from last l join neon_auth."user" u on u.id::text = l.user_id
    where u."emailVerified" and u."createdAt" >= ${JOURNEYS_START}::date
      and l.at between now() - interval '14 days' and now() - interval '7 days'`
  for (const u of stalled) {
    due.push({ userId: u.id as string, email: u.email as string, name: u.name as string | null, journey: 'stalled', step: 0, ref: u.path as string, mail: n => ({
      subject: 'Pick up where you left off',
      lines: [`Hi ${n},`, `You have ${u.done} lesson${u.done === 1 ? '' : 's'} done. A week goes quickly, so here is the shortest way back in: your dashboard opens on the next lesson.`],
      cta: { label: 'Continue the course', url: `${SITE}/dashboard` }
    }) })
  }

  // Exam: after a finished paper, the weakest domain and its drill. Not more than once in three days.
  const exams = await sql`
    select distinct on (a.user_id) a.id::text as attempt, a.user_id as id, u.email, u.name, a.score, a.total, a.domains
    from app.exam_attempt a join neon_auth."user" u on u.id::text = a.user_id
    where u."emailVerified" and u."createdAt" >= ${JOURNEYS_START}::date
      and a.created_at between now() - interval '48 hours' and now() - interval '15 minutes'
      and not exists (select 1 from app.email_sent s where s.user_id = a.user_id and s.journey = 'exam' and s.sent_at > now() - interval '3 days')
    order by a.user_id, a.created_at desc`
  for (const a of exams) {
    const domains = Object.entries((a.domains ?? {}) as Record<string, { score: number, total: number }>)
      .filter(([k, v]) => k in DOMAINS && v.total > 0)
      .sort((x, y) => x[1].score / x[1].total - y[1].score / y[1].total)
    const weak = domains[0]?.[0] as ExamDomain | undefined
    const pct = Math.round((a.score as number) / (a.total as number) * 100)
    const drill = weak ? drillFor(weak) : undefined
    due.push({ userId: a.id as string, email: a.email as string, name: a.name as string | null, journey: 'exam', step: 0, ref: a.attempt as string, mail: n => ({
      subject: `You scored ${pct}%. Here is what to practise next`,
      lines: [`Hi ${n},`, `You scored ${pct}% on your practice paper (the real exam passes at 68%).`, weak ? `Your weakest area was ${DOMAINS[weak].label}. A 15-question drill on just that domain is the fastest way to lift it.` : 'A 15-question drill on one domain is the fastest way to lift your score.'],
      cta: { label: weak ? `Practise ${DOMAINS[weak].label}` : 'Open the drills', url: drill ? `${SITE}/certification/${drill}` : `${SITE}/certification` }
    }) })
  }

  // Checkout started, no Pro 24–72 hours later. Once ever, no discount.
  const checkouts = await sql`
    select distinct on (e.user_id) e.user_id as id, u.email, u.name
    from app.event e join neon_auth."user" u on u.id::text = e.user_id
    where e.name = 'checkout' and u."emailVerified" and u."createdAt" >= ${JOURNEYS_START}::date
      and e.created_at between now() - interval '72 hours' and now() - interval '24 hours'
    order by e.user_id, e.created_at desc`
  for (const c of checkouts) {
    if (await hasPro(c.id as string)) continue
    due.push({ userId: c.id as string, email: c.email as string, name: c.name as string | null, journey: 'checkout', step: 0, ref: '', mail: n => ({
      subject: 'Your Pro checkout is still open',
      lines: [`Hi ${n},`, 'You started upgrading to Pro but did not finish. If something went wrong at the payment step, reply to this email and I will sort it out.', 'Pro opens every lesson, removes ads and includes all exam sets.'],
      cta: { label: 'See Pro plans', url: `${SITE}/pro` }
    }) })
  }

  // Capstone approved: the certificate. Transactional.
  const capstones = await sql`
    select s.id::text as sub, s.user_id as id, u.email, u.name
    from app.submission s join neon_auth."user" u on u.id::text = s.user_id
    where s.kind = 'showcase' and s.details->>'type' = 'capstone' and s.status = 'approved'
      and s.reviewed_at > now() - interval '14 days'`
  for (const c of capstones) {
    due.push({ userId: c.id as string, email: c.email as string, name: c.name as string | null, journey: 'capstone', step: 0, ref: c.sub as string, transactional: true, mail: n => ({
      subject: 'Your certificate of completion is ready',
      lines: [`Hi ${n},`, 'Your capstone demo is approved. Congratulations, that is the whole course put to work.', 'Your certificate of completion is on the capstone page, with its credential id. Add it to LinkedIn so recruiters can see it.'],
      cta: { label: 'View your certificate', url: `${SITE}/capstone` }
    }) })
  }

  // Drop what was already sent, opted-out people, the demo account and anyone over the weekly cap.
  if (!due.length) return []
  const ids = [...new Set(due.map(d => d.userId))]
  const sent = await sql`select user_id, journey, step, ref, sent_at from app.email_sent where user_id = any(${ids})`
  const optout = new Set((await sql`select user_id from app.email_optout where user_id = any(${ids})`).map(r => r.user_id as string))
  const already = new Set(sent.map(s => `${s.user_id}|${s.journey}|${s.step}|${s.ref}`))
  const weekAgo = Date.now() - 7 * 864e5
  const recent = new Map<string, number>()
  for (const s of sent) {
    if (MARKETING.includes(s.journey as string) && new Date(s.sent_at as string).getTime() > weekAgo) recent.set(s.user_id as string, (recent.get(s.user_id as string) ?? 0) + 1)
  }
  const out: Due[] = []
  for (const d of due) {
    if (already.has(`${d.userId}|${d.journey}|${d.step}|${d.ref}`) || d.email.toLowerCase() === demo) continue
    if (!d.transactional) {
      if (optout.has(d.userId) || (recent.get(d.userId) ?? 0) >= 2) continue
      recent.set(d.userId, (recent.get(d.userId) ?? 0) + 1)
    }
    out.push(d)
  }
  return out.slice(0, PER_RUN)
}

/** Find who is due and send. `dry` (or no RESEND_API_KEY) only reports. */
export async function runJourneys({ dry = false } = {}): Promise<JourneyReport> {
  const configured = emailConfigured()
  const due = await findDue()
  const report: JourneyReport = { configured, dry: dry || !configured, due: [], sent: 0, failed: [] }
  const sql = useDb()
  for (const d of due) {
    const body = d.mail(firstName(d.name))
    report.due.push({ email: d.email, journey: d.journey, step: d.step, ref: d.ref, subject: body.subject })
    if (report.dry) continue
    const claimed = await sql`insert into app.email_sent (user_id, journey, step, ref) values (${d.userId}, ${d.journey}, ${d.step}, ${d.ref}) on conflict do nothing returning user_id`
    if (!claimed.length) continue
    try {
      await sendEmail({
        ...body,
        to: d.email,
        unsubscribe: d.transactional ? undefined : await unsubscribeUrl(d.userId),
        idempotencyKey: `${d.userId}:${d.journey}:${d.step}:${d.ref}`
      })
      report.sent++
    } catch (e) {
      await sql`delete from app.email_sent where user_id = ${d.userId} and journey = ${d.journey} and step = ${d.step} and ref = ${d.ref}`
      report.failed.push(`${d.journey}/${d.step}: ${(e as Error).message}`)
    }
  }
  return report
}
