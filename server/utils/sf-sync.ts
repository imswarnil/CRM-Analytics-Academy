import type { FetchLike, LearnerRow, OrgRow, SeatRow, UpsertResult } from './sf-api'
import type { DomainKind, NetworkKind } from './score'

/**
 * Active self-serve accounts → Salesforce, hourly (server/tasks/salesforce/
 * sync.ts) or from /admin → Integrations → "Sync now".
 *
 *   Account             one per team org        external ID Academy_Org_Id__c
 *   Academy_Learner__c  one per active learner  external ID Academy_User_Id__c
 *   Seat_Assignment__c  one per seat            external ID Academy_Seat_Key__c (org:user)
 *
 * "Active" = signed up in the last 90 days, learned in the last 90 days, holds
 * or held Pro or a seat, or was synced before (so a lapse is synced too).
 * Each payload is hashed; only rows whose hash differs from app.sf_sync are
 * sent, at most SF_SYNC_MAX_RECORDS (default 400) a run and SF_SYNC_MAX_CALLS
 * (default 12) API calls. Without SF_INSTANCE_URL / SF_CLIENT_ID /
 * SF_CLIENT_SECRET it does nothing and says "not configured".
 *
 * Three refused tokens in a row pause the hourly run for 24 hours (the admin
 * button still runs), so a broken app never knocks on the org every hour.
 */

export type SyncStatus = 'not_configured' | 'paused' | 'ok' | 'partial' | 'auth_failed' | 'limit' | 'failed'
export interface SyncReport {
  status: SyncStatus
  candidates: number
  changed: number
  sent: number
  created: number
  updated: number
  failed: number
  calls: number
  errors: string[]
}

const empty = (status: SyncStatus): SyncReport => ({ status, candidates: 0, changed: 0, sent: 0, created: 0, updated: 0, failed: 0, calls: 0, errors: [] })

export async function runSalesforceSync(opts: { trigger: 'cron' | 'admin', fetchImpl?: FetchLike } = { trigger: 'cron' }): Promise<SyncReport> {
  const cfg = sfConfigFromEnv()
  if (!cfg) return empty('not_configured')
  const sql = useDb()

  if (opts.trigger === 'cron') {
    const recent = await sql`select status, started_at from app.sf_sync_run order by id desc limit 3`
    if (recent.length === 3 && recent.every(r => r.status === 'auth_failed') && new Date(recent[0]!.started_at as string).getTime() > Date.now() - 86400000) {
      return empty('paused')
    }
  }

  const maxRecords = Math.min(2000, Math.max(1, Number(process.env.SF_SYNC_MAX_RECORDS) || 400))
  const maxCalls = Math.min(50, Math.max(2, Number(process.env.SF_SYNC_MAX_CALLS) || 12))
  const [run] = await sql`insert into app.sf_sync_run (trigger, status) values (${opts.trigger}, 'running') returning id`
  const report = empty('ok')

  try {
    // ---- what the site holds ---------------------------------------------------
    const orgRows = await sql`
      select o.id, o.name, o.kind, o.seats, o.join_code, o.domain, o.status, o.expires_at,
             (select count(*) from app.org_member m where m.org_id = o.id)::int as used
        from app.org o order by o.id`
    const orgs: OrgRow[] = orgRows.map(r => ({
      id: Number(r.id), name: String(r.name), kind: String(r.kind), seats: Number(r.seats), used: Number(r.used),
      joinCode: String(r.join_code), domain: (r.domain as string | null) ?? null, status: String(r.status),
      expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null
    }))

    const ids = (await sql`
      select u.id::text as id from neon_auth."user" u
       where not exists (select 1 from app.demo_account d where d.user_id = u.id::text)
         and (u."createdAt" > now() - interval '90 days'
           or exists (select 1 from app.subscription s where s.user_id = u.id::text)
           or exists (select 1 from app.entitlement e where e.user_id = u.id::text)
           or exists (select 1 from app.org_member m where m.user_id = u.id::text)
           or exists (select 1 from app.progress p where p.user_id = u.id::text and p.completed_at > now() - interval '90 days')
           or exists (select 1 from app.event ev where ev.user_id = u.id::text and ev.created_at > now() - interval '90 days')
           or exists (select 1 from app.sf_sync x where x.kind = 'learner' and x.ext_id = u.id::text))
       limit 5000`).map(r => String(r.id))
    const signals = await loadSignals(ids)
    const enr = new Map((ids.length
      ? await sql`
          select e.*, d.website, d.linkedin from app.enrichment e
            left join app.company_domain d on d.domain = e.email_domain
           where e.user_id = any(${ids}::text[])`
      : []).map(r => [String(r.user_id), r]))

    const learners: { row: LearnerRow, score: ReturnType<typeof scoreLead> }[] = []
    for (const s of signals.values()) {
      const e = enr.get(s.userId)
      const score = scoreLead({
        domainKind: (e?.domain_kind as DomainKind | null) ?? domainKind(emailDomain(s.email)),
        companyFound: Boolean(e?.website),
        networkKind: (e?.network_kind as NetworkKind | null) ?? null,
        networkOrg: (e?.as_org as string | null) ?? null,
        country: (e?.country as string | null) ?? null,
        lessons: s.lessons,
        activeDays30: s.activeDays30,
        daysSinceActive: s.daysSinceActive,
        examAttempts: s.exams,
        bestExamPct: s.bestExamPct,
        checkoutIntent: s.checkouts,
        pro: s.pro,
        orgSeat: Boolean(s.org?.active)
      })
      learners.push({
        score,
        row: {
          userId: s.userId, email: s.email, name: s.name, plan: s.plan, pro: s.pro, lessons: s.lessons, points: s.points,
          streak: s.streak, activeDays30: s.activeDays30, lastActive: s.lastActive, quizzes: s.quizzes, exams: s.exams,
          bestExamPct: s.bestExamPct, checkouts: s.checkouts, signedUp: s.signedUp, score: score.score, grade: score.grade,
          reasons: reasonsLine(score.reasons, 1000), emailDomain: (e?.email_domain as string | null) ?? emailDomain(s.email),
          domainKind: (e?.domain_kind as string | null) ?? domainKind(emailDomain(s.email)), company: (e?.company as string | null) ?? null,
          website: (e?.website as string | null) ?? null, linkedin: (e?.linkedin as string | null) ?? null,
          country: (e?.country as string | null) ?? null, region: (e?.region as string | null) ?? null, city: (e?.city as string | null) ?? null,
          timezone: (e?.timezone as string | null) ?? null, networkOrg: (e?.as_org as string | null) ?? null,
          source: (e?.first_touch as string | null) ?? null, orgId: s.org?.id ?? null
        }
      })
    }
    // Most recently active first, so the cap keeps what matters.
    learners.sort((a, b) => String(b.row.lastActive ?? '').localeCompare(String(a.row.lastActive ?? '')))

    const seatRows = await sql`
      select m.org_id, m.user_id, m.role, m.joined_at, (o.status = 'active' and (o.expires_at is null or o.expires_at > now())) as active
        from app.org_member m join app.org o on o.id = m.org_id`
    const seats: SeatRow[] = seatRows.map(r => ({ orgId: Number(r.org_id), userId: String(r.user_id), role: String(r.role), joinedAt: r.joined_at ? new Date(r.joined_at as string).toISOString() : null, active: Boolean(r.active) }))
    report.candidates = orgs.length + learners.length + seats.length

    // ---- what changed since the last sync -------------------------------------
    const known = new Map((await sql`select kind, ext_id, hash from app.sf_sync`).map(r => [`${r.kind}|${r.ext_id}`, String(r.hash)]))
    interface Pending { kind: 'org' | 'learner' | 'seat', ext: string, rec: Record<string, unknown>, hash: string }
    const pending: Pending[] = []
    const queue = async (kind: Pending['kind'], ext: string, rec: Record<string, unknown>, fixedHash?: string) => {
      const hash = fixedHash ?? await recordHash(rec)
      if (known.get(`${kind}|${ext}`) !== hash) pending.push({ kind, ext, rec, hash })
    }
    for (const o of orgs) await queue('org', String(o.id), orgRecord(o))
    for (const l of learners) await queue('learner', l.row.userId, learnerRecord(l.row))
    const liveSeats = new Set(seats.map(s => seatKey(s.orgId, s.userId)))
    for (const s of seats) await queue('seat', seatKey(s.orgId, s.userId), seatRecord(s))
    for (const k of known.keys()) {
      const [kind, ext] = k.split('|') as [string, string]
      if (kind === 'seat' && !liveSeats.has(ext)) await queue('seat', ext, freedSeatRecord(ext), 'freed')
    }
    report.changed = pending.length

    // Keep the admin's scores fresh with the hourly recomputation.
    const changedLearners = new Set(pending.filter(p => p.kind === 'learner').map(p => p.ext))
    const rescored = learners.filter(l => changedLearners.has(l.row.userId))
    if (rescored.length) {
      const json = JSON.stringify(rescored.map(l => ({ user_id: l.row.userId, fit: l.score.fit, engagement: l.score.engagement, score: l.score.score, grade: l.score.grade, reasons: l.score.reasons, email_domain: l.row.emailDomain, domain_kind: l.row.domainKind })))
      await sql`
        insert into app.enrichment (user_id, email_domain, domain_kind, fit, engagement, score, grade, reasons, updated_at)
        select user_id, email_domain, domain_kind, fit, engagement, score, grade, reasons, now()
          from jsonb_to_recordset(${json}::jsonb) as x(user_id text, email_domain text, domain_kind text, fit smallint, engagement smallint, score smallint, grade text, reasons jsonb)
        on conflict (user_id) do update set fit = excluded.fit, engagement = excluded.engagement, score = excluded.score,
          grade = excluded.grade, reasons = excluded.reasons`
    }

    const batch = pending.slice(0, maxRecords)
    if (!batch.length) {
      await finish(run!.id as number, report)
      return report
    }

    // ---- send, in dependency order ---------------------------------------------
    const session = await sfConnect(cfg, opts.fetchImpl ?? (fetch as unknown as FetchLike), { maxCalls })
    const results: { p: Pending, r: UpsertResult }[] = []
    const plan: [Pending['kind'], string, string][] = [['org', 'Account', 'Academy_Org_Id__c'], ['learner', 'Academy_Learner__c', 'Academy_User_Id__c'], ['seat', 'Seat_Assignment__c', 'Academy_Seat_Key__c']]
    try {
      for (const [kind, sobject, field] of plan) {
        const items = batch.filter(p => p.kind === kind)
        if (!items.length) continue
        const res = await sfUpsert(session, sobject, field, items.map(p => p.rec))
        items.forEach((p, i) => results.push({ p, r: res[i]! }))
      }
    } catch (e) {
      const err = e as SfError
      report.status = err.kind === 'auth' ? 'auth_failed' : err.kind === 'limit' ? 'limit' : 'failed'
      report.errors.push(String(err.message).slice(0, 300))
    } finally {
      report.calls = session.calls
    }

    for (const { r } of results) {
      if (r.ok) {
        report.sent++
        if (r.created) report.created++
        else report.updated++
      } else {
        report.failed++
        if (report.errors.length < 10) report.errors.push(`${r.externalId}: ${r.error}`)
      }
    }
    if (results.length) {
      // A failed row keeps an empty hash, so the next run tries it again.
      const json = JSON.stringify(results.map(({ p, r }) => ({ kind: p.kind, ext_id: p.ext, hash: r.ok ? p.hash : '', sf_id: r.id, status: r.ok ? 'ok' : `error: ${r.error}`.slice(0, 300) })))
      await sql`
        insert into app.sf_sync (kind, ext_id, hash, sf_id, status, synced_at)
        select kind, ext_id, hash, sf_id, status, now()
          from jsonb_to_recordset(${json}::jsonb) as x(kind text, ext_id text, hash text, sf_id text, status text)
        on conflict (kind, ext_id) do update set hash = excluded.hash, sf_id = coalesce(excluded.sf_id, app.sf_sync.sf_id),
          status = excluded.status, synced_at = now()`
    }
    if (report.status === 'ok' && (report.failed || pending.length > batch.length)) report.status = 'partial'
  } catch (e) {
    const err = e as SfError
    report.status = err.kind === 'auth' ? 'auth_failed' : 'failed'
    report.errors.push(String(err.message ?? e).slice(0, 300))
  }
  await finish(run!.id as number, report)
  return report
}

async function finish(id: number, r: SyncReport) {
  await useDb()`
    update app.sf_sync_run set finished_at = now(), status = ${r.status}, candidates = ${r.candidates}, changed = ${r.changed},
      sent = ${r.sent}, created = ${r.created}, updated = ${r.updated}, failed = ${r.failed}, calls = ${r.calls},
      error = ${r.errors.length ? r.errors.join('\n').slice(0, 2000) : null}
    where id = ${id}`
}
