#!/usr/bin/env node
/**
 * Checks the GTM pieces against fixtures — no network, no database, no
 * Salesforce (the org is never called): `pnpm gtm:check`
 *
 *   - score.ts: domain/network/seniority classification, scores, grades, streak
 *   - company-page.ts: parsing a company home page
 *   - salesforce.ts: the Web-to-Lead form an enriched lead becomes (fetch mocked)
 *   - sf-api.ts: payload builders, client-credentials token, collections upsert
 *     with backoff, auth failure, the call cap (fetch mocked)
 *   - sf-sync.ts: a full sync run twice against a fake database and a mocked
 *     Salesforce — the second run must send nothing
 *
 * Needs Node 22.18+ (TypeScript type stripping). The server modules use Nitro
 * auto-imports, so the globals they expect are put on globalThis first.
 */
import assert from 'node:assert/strict'

const score = await import('../server/utils/score.ts')
const page = await import('../server/utils/company-page.ts')
const api = await import('../server/utils/sf-api.ts')
const enrich = await import('../server/utils/enrich.ts')
Object.assign(globalThis, score, page, api, { signalsLine: enrich.signalsLine, loadSignals: enrich.loadSignals })
const sf = await import('../server/utils/salesforce.ts')
const sync = await import('../server/utils/sf-sync.ts')

let passed = 0
const ok = (name, fn) => Promise.resolve(fn()).then(() => {
  passed++
  console.log(`  ✓ ${name}`)
})

// ---- score.ts ------------------------------------------------------------------
console.log('score')
await ok('domain kinds', () => {
  assert.equal(score.domainKind(score.emailDomain('a@gmail.com')), 'personal')
  assert.equal(score.domainKind(score.emailDomain('a@Acme.co.uk')), 'business')
  assert.equal(score.domainKind('iitb.ac.in'), 'education')
  assert.equal(score.domainKind('stanford.edu'), 'education')
  assert.equal(score.domainKind('mailinator.com'), 'disposable')
  assert.equal(score.domainKind('uidai.gov.in'), 'government')
  assert.equal(score.emailDomain('nope'), null)
})
await ok('network kinds', () => {
  assert.equal(score.networkKind('Reliance Jio Infocomm Limited'), 'isp')
  assert.equal(score.networkKind('Comcast Cable Communications, LLC'), 'isp')
  assert.equal(score.networkKind('Amazon.com, Inc.'), 'hosting')
  assert.equal(score.networkKind('Indian Institute of Technology Bombay'), 'education')
  assert.equal(score.networkKind('Infosys Limited'), 'organisation')
  assert.equal(score.networkKind(null), 'unknown')
})
await ok('seniority', () => {
  assert.equal(score.seniorityOf('VP, Analytics'), 'executive')
  assert.equal(score.seniorityOf('Head of Data'), 'executive')
  assert.equal(score.seniorityOf('Analytics Manager'), 'manager')
  assert.equal(score.seniorityOf('Salesforce Developer'), 'practitioner')
  assert.equal(score.seniorityOf(''), null)
})
await ok('enterprise seat request is Hot, with reasons that add up', () => {
  const r = score.scoreLead({ domainKind: 'business', companyFound: true, networkKind: 'organisation', networkOrg: 'Infosys Limited', title: 'Director of Analytics', country: 'US', interest: 'seats', seats: 40, daysSinceActive: 0 })
  assert.equal(r.grade, 'Hot')
  assert.equal(r.fit, 50) // 20 + 5 + 10 + 15 + 5 + 10 = 65, capped at 50
  assert.equal(r.engagement, 25) // seats 15 + active today 10
  assert.equal(r.score, 75)
  assert.ok(r.reasons.some(x => x.why.includes('Infosys')))
})
await ok('inactive gmail learner is Cold; active practitioner with exams is Warm', () => {
  assert.equal(score.scoreLead({ domainKind: 'personal', lessons: 0, activeDays30: 0, daysSinceActive: 80 }).grade, 'Cold')
  const r = score.scoreLead({ domainKind: 'personal', networkKind: 'isp', lessons: 12, activeDays30: 6, daysSinceActive: 0, examAttempts: 2, bestExamPct: 78 })
  assert.equal(r.score, 0 + 10 + 6 + 8 + 6 + 4)
  assert.equal(r.grade, 'Warm')
})
await ok('disposable email cannot go below zero; pro + checkout count', () => {
  const r = score.scoreLead({ domainKind: 'disposable' })
  assert.equal(r.fit, 0)
  assert.equal(r.score, 0)
  const p = score.scoreLead({ checkoutIntent: 1, pro: true, orgSeat: true })
  assert.equal(p.engagement, 18)
})
await ok('reasonsLine fits 255 characters', () => {
  const r = score.scoreLead({ domainKind: 'business', companyFound: true, networkKind: 'organisation', networkOrg: 'X'.repeat(200), title: 'CEO', interest: 'seats', seats: 99 })
  assert.ok(score.reasonsLine(r.reasons).length <= 255)
  assert.match(score.reasonsLine(r.reasons), /^\+20 Business email domain/)
})
await ok('streak', () => {
  const today = new Date('2026-11-23T10:00:00Z')
  assert.equal(score.streakFrom(['2026-11-23', '2026-11-22', '2026-11-21', '2026-11-19'], today), 3)
  assert.equal(score.streakFrom(['2026-11-22', '2026-11-21'], today), 2)
  assert.equal(score.streakFrom(['2026-11-20'], today), 0)
})

// ---- company-page.ts ---------------------------------------------------------------
console.log('company page')
await ok('parses name, description, logo, LinkedIn', () => {
  const html = `<!doctype html><html><head><title>Acme Analytics — Data for everyone | Home</title>
    <meta name="description" content="Acme builds &amp; runs dashboards.">
    <meta property="og:site_name" content="Acme Analytics">
    <link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="https://cdn.acme.io/touch.png">
    </head><body><a href="https://www.linkedin.com/company/acme-analytics/">LinkedIn</a></body></html>`
  const p = page.parseCompanyPage(html, 'acme.io')
  assert.equal(p.company, 'Acme Analytics')
  assert.equal(p.description, 'Acme builds & runs dashboards.')
  assert.equal(p.logo, 'https://cdn.acme.io/touch.png')
  assert.equal(p.linkedin, 'https://www.linkedin.com/company/acme-analytics')
  assert.equal(p.title, 'Acme Analytics — Data for everyone | Home')
})
await ok('falls back to the title, then the domain', () => {
  assert.equal(page.parseCompanyPage('<title>Northwind | Home</title>', 'northwind.com').company, 'Northwind')
  assert.equal(page.parseCompanyPage('', 'pune-tech.co.in').company, 'Pune Tech')
  assert.equal(page.parseCompanyPage('', 'pune-tech.co.in').logo, 'https://pune-tech.co.in/favicon.ico')
})

// ---- salesforce.ts (Web-to-Lead) ----------------------------------------------------------
console.log('web-to-lead')
await ok('an enriched request carries score, company, location and signals', async () => {
  let sent = null
  globalThis.fetch = async (url, init) => {
    sent = { url, form: new URLSearchParams(init.body) }
    return { status: 200 }
  }
  const r = score.scoreLead({ domainKind: 'business', companyFound: true, networkKind: 'organisation', networkOrg: 'Acme Corp', interest: 'seats', seats: 25 })
  const status = await sf.sendLeadToSalesforce({
    event: 'request', product: 'seats', firstName: 'Asha', lastName: 'Rao', email: 'asha@acme.io', company: null, seats: 25,
    lessonsDone: 3, points: 30, userId: 'u1',
    enrichment: {
      emailDomain: 'acme.io', domainKind: 'business', company: 'Acme Analytics', website: 'https://acme.io/', linkedin: 'https://www.linkedin.com/company/acme',
      country: 'IN', region: 'Maharashtra', city: 'Pune', timezone: 'Asia/Kolkata', networkOrg: 'Acme Corp', networkKind: 'organisation',
      score: r.score, grade: r.grade, reasons: r.reasons, signals: null
    }
  })
  assert.equal(status, 'sent')
  assert.match(sent.url, /webto\.salesforce\.com/)
  const f = sent.form
  assert.equal(f.get('oid'), sf.SF_ORG_ID)
  assert.equal(f.get('company'), 'Acme Analytics')
  assert.equal(f.get('city'), 'Pune')
  assert.equal(f.get('country'), 'IN')
  assert.equal(f.get('URL'), 'https://acme.io/')
  assert.match(f.get('description'), /Score: \d+ \((Hot|Warm|Cold)\)/)
  assert.match(f.get('description'), /Network: Acme Corp \(organisation\)/)
  assert.match(f.get('description'), /Location: Pune, Maharashtra, IN \(Asia\/Kolkata\)/)
  assert.equal(f.get(sf.LEAD_FIELDS.userId), 'u1')
  assert.equal(f.get(sf.LEAD_FIELDS.seats), '25')
  // Field ids not yet deployed are simply not posted.
  for (const k of ['siteScore', 'networkOrg']) if (!sf.LEAD_FIELDS[k]) assert.ok(![...f.keys()].includes(k))
  assert.ok(![...f.values()].some(v => /\d+\.\d+\.\d+\.\d+/.test(v)), 'no IP address in the form')
})
await ok('a personal-email sign-up is filed under the person', async () => {
  let form = null
  globalThis.fetch = async (_u, init) => {
    form = new URLSearchParams(init.body)
    return { status: 200 }
  }
  await sf.sendLeadToSalesforce({ event: 'signup', firstName: 'Ravi', lastName: 'K', email: 'ravi@gmail.com', lessonsDone: 0, points: 0, enrichment: { emailDomain: 'gmail.com', domainKind: 'personal', company: null, website: null, linkedin: null, country: 'IN', region: null, city: null, timezone: null, networkOrg: 'Reliance Jio', networkKind: 'isp', score: 0, grade: 'Cold', reasons: [], signals: null } })
  assert.equal(form.get('company'), 'Ravi K (self-serve)')
})

// ---- sf-api.ts ------------------------------------------------------------------------------
console.log('salesforce REST (mocked)')
const cfg = api.sfConfigFromEnv({ SF_INSTANCE_URL: 'https://example.my.salesforce.com/', SF_CLIENT_ID: 'id', SF_CLIENT_SECRET: 'secret' })
await ok('config: absent → null, present → normalised', () => {
  assert.equal(api.sfConfigFromEnv({}), null)
  assert.equal(api.sfConfigFromEnv({ SF_INSTANCE_URL: 'http://insecure', SF_CLIENT_ID: 'a', SF_CLIENT_SECRET: 'b' }), null)
  assert.deepEqual(cfg, { instanceUrl: 'https://example.my.salesforce.com', clientId: 'id', clientSecret: 'secret', apiVersion: 'v62.0' })
})
await ok('payloads match the metadata', () => {
  const o = api.orgRecord({ id: 7, name: 'Pune Institute', kind: 'college', seats: 10, used: 12, joinCode: 'ABCD2345', domain: 'pit.ac.in', status: 'active', expiresAt: null })
  assert.equal(o.Org_Type__c, 'university')
  assert.equal(o.Seats_Used__c, 10, 'clamped to purchased (validation rule)')
  assert.equal(o.Lifecycle_Stage__c, 'customer')
  assert.equal(o.Academy_Org_Id__c, '7')
  assert.equal(api.orgRecord({ id: 8, name: 'Old', kind: 'team', seats: 2, used: 0, joinCode: 'X', domain: null, status: 'ended', expiresAt: null }).Lifecycle_Stage__c, 'churned')
  const s = api.seatRecord({ orgId: 7, userId: 'u1', role: 'admin', joinedAt: '2026-11-01T10:00:00.000Z', active: true })
  assert.deepEqual(s.Account__r, { Academy_Org_Id__c: '7' })
  assert.equal(s.Academy_Seat_Key__c, '7:u1')
  assert.equal(s.Joined_On__c, '2026-11-01')
  const l = api.learnerRecord({ userId: 'u1', email: 'a@acme.io', name: null, plan: 'monthly', pro: true, lessons: 3, points: 30, streak: 2, activeDays30: 4, lastActive: '2026-11-22T00:00:00.000Z', quizzes: 1, exams: 0, bestExamPct: 0, checkouts: 1, signedUp: null, score: 40, grade: 'Warm', reasons: '+20 Business email domain', emailDomain: 'acme.io', domainKind: 'business', company: 'Acme', website: null, linkedin: null, country: 'IN', region: null, city: null, timezone: null, networkOrg: null, source: 'linkedin.com', orgId: null })
  assert.equal(l.Name, 'a')
  assert.equal(l.Organisation__c, null)
  assert.equal(l.attributes.type, 'Academy_Learner__c')
})

function mockSalesforce(script) {
  const calls = []
  const f = async (url, init) => {
    calls.push({ url, method: init?.method, body: init?.body })
    const next = script.shift() ?? { status: 500, json: {} }
    if (next.throw) throw new Error(next.throw)
    if (typeof next === 'function') return next(url, init)
    return { ok: next.status < 300, status: next.status, json: async () => next.json, text: async () => JSON.stringify(next.json ?? '') }
  }
  return { f, calls }
}
const sleep = async () => {}
const TOKEN = { status: 200, json: { access_token: 'tok', instance_url: 'https://example.my.salesforce.com' } }

await ok('client credentials token, then a 429 is retried, results map to records', async () => {
  const m = mockSalesforce([TOKEN, { status: 429, json: [] }, { status: 200, json: [{ id: 'a01', success: true, created: true }, { success: false, errors: [{ statusCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION', message: 'nope' }] }] }])
  const s = await api.sfConnect(cfg, m.f, { sleep })
  assert.equal(m.calls[0].url, 'https://example.my.salesforce.com/services/oauth2/token')
  assert.equal(new URLSearchParams(m.calls[0].body).get('grant_type'), 'client_credentials')
  const res = await api.sfUpsert(s, 'Account', 'Academy_Org_Id__c', [{ attributes: { type: 'Account' }, Academy_Org_Id__c: '1' }, { attributes: { type: 'Account' }, Academy_Org_Id__c: '2' }])
  assert.equal(m.calls[1].method, 'PATCH')
  assert.equal(m.calls[1].url, 'https://example.my.salesforce.com/services/data/v62.0/composite/sobjects/Account/Academy_Org_Id__c')
  assert.equal(JSON.parse(m.calls[2].body).allOrNone, false)
  assert.deepEqual(res.map(r => [r.externalId, r.ok, r.created]), [['1', true, true], ['2', false, false]])
  assert.match(res[1].error, /FIELD_CUSTOM_VALIDATION_EXCEPTION/)
  assert.equal(s.calls, 3)
})
await ok('a refused token is an auth error and does not leak the body', async () => {
  const m = mockSalesforce([{ status: 400, json: { error: 'invalid_client', error_description: 'secret-ish detail' } }])
  await assert.rejects(api.sfConnect(cfg, m.f, { sleep }), e => e.kind === 'auth' && !/secret-ish/.test(e.message))
})
await ok('401 mid-run is auth; the call cap stops a run; 200 records per call', async () => {
  const m = mockSalesforce([TOKEN, { status: 401, json: [] }])
  const s = await api.sfConnect(cfg, m.f, { sleep })
  await assert.rejects(api.sfUpsert(s, 'Account', 'Academy_Org_Id__c', [{ Academy_Org_Id__c: '1' }]), e => e.kind === 'auth')
  const ok200 = (_u, init) => {
    const n = JSON.parse(init.body).records.length
    return { ok: true, status: 200, json: async () => Array.from({ length: n }, (_, i) => ({ id: `x${i}`, success: true, created: false })), text: async () => '' }
  }
  const m2 = mockSalesforce([TOKEN, ok200, ok200, ok200])
  const s2 = await api.sfConnect(cfg, m2.f, { sleep, maxCalls: 3 })
  const recs = Array.from({ length: 450 }, (_, i) => ({ Academy_User_Id__c: `u${i}` }))
  await assert.rejects(api.sfUpsert(s2, 'Academy_Learner__c', 'Academy_User_Id__c', recs), e => e.kind === 'limit')
  assert.equal(JSON.parse(m2.calls[1].body).records.length, 200)
})

// ---- sf-sync.ts: a full run against a fake database ---------------------------------------
console.log('account sync (fake database, mocked Salesforce)')
const db = {
  runs: [],
  sync: new Map(),
  enrichment: []
}
const now = new Date().toISOString()
function fakeSql(strings, ...values) {
  const q = strings.join('?').replace(/\s+/g, ' ')
  if (/from app\.sf_sync_run order by id desc limit 3/.test(q)) return Promise.resolve(db.runs.slice(-3).reverse())
  if (/insert into app\.sf_sync_run/.test(q)) {
    db.runs.push({ id: db.runs.length + 1, status: 'running', started_at: now })
    return Promise.resolve([{ id: db.runs.length }])
  }
  if (/update app\.sf_sync_run/.test(q)) {
    db.runs[db.runs.length - 1].status = values[0]
    return Promise.resolve([])
  }
  if (/from app\.org o order by o\.id/.test(q)) return Promise.resolve([{ id: 3, name: 'Northwind', kind: 'company', seats: 25, join_code: 'NWND2345', domain: 'northwind.com', status: 'active', expires_at: null, used: 1 }])
  if (/select u\.id::text as id from neon_auth/.test(q)) return Promise.resolve([{ id: 'u1' }, { id: 'u2' }])
  if (/with ids as/.test(q)) {
    return Promise.resolve([
      { user_id: 'u1', email: 'asha@northwind.com', name: 'Asha Rao', signed_up: '2026-10-01T00:00:00Z', lessons: 12, points: 140, quizzes: 4, exams: 1, best_exam: 81, checkouts: 0, last_at: now, active_days_30: 9, days: [now.slice(0, 10)], sub_plan: null, sub_status: null, ent_product: null, ent_expires: null, org_role: 'admin', org_id: 3, org_name: 'Northwind', org_kind: 'company', org_status: 'active', org_expires: null, org_seats: 25, org_domain: 'northwind.com' },
      { user_id: 'u2', email: 'ravi@gmail.com', name: null, signed_up: '2026-11-20T00:00:00Z', lessons: 1, points: 10, quizzes: 0, exams: 0, best_exam: 0, checkouts: 1, last_at: now, active_days_30: 1, days: [], sub_plan: 'monthly', sub_status: 'active', ent_product: null, ent_expires: null, org_id: null }
    ])
  }
  if (/from app\.enrichment e left join app\.company_domain/.test(q)) return Promise.resolve([{ user_id: 'u1', email_domain: 'northwind.com', domain_kind: 'business', company: 'Northwind', country: 'GB', as_org: 'Northwind Traders Ltd', network_kind: 'organisation', website: 'https://northwind.com/' }])
  if (/from app\.org_member m join app\.org o/.test(q)) return Promise.resolve([{ org_id: 3, user_id: 'u1', role: 'admin', joined_at: '2026-10-02T00:00:00Z', active: true }])
  if (/select kind, ext_id, hash from app\.sf_sync/.test(q)) return Promise.resolve([...db.sync.entries()].map(([k, v]) => ({ kind: k.split('|')[0], ext_id: k.split('|')[1], hash: v.hash })))
  if (/insert into app\.enrichment/.test(q)) {
    db.enrichment.push(...JSON.parse(values[0]))
    return Promise.resolve([])
  }
  if (/insert into app\.sf_sync /.test(q)) {
    for (const r of JSON.parse(values[0])) db.sync.set(`${r.kind}|${r.ext_id}`, r)
    return Promise.resolve([])
  }
  throw new Error(`unexpected query: ${q.slice(0, 80)}`)
}
globalThis.useDb = () => fakeSql
globalThis.loadSignals = enrich.loadSignals
process.env.SF_INSTANCE_URL = 'https://example.my.salesforce.com'
process.env.SF_CLIENT_ID = 'id'
process.env.SF_CLIENT_SECRET = 'secret'

const sent = []
const sfMock = async (url, init) => {
  if (url.endsWith('/services/oauth2/token')) return { ok: true, status: 200, json: async () => TOKEN.json, text: async () => '' }
  const body = JSON.parse(init.body)
  sent.push({ url, records: body.records })
  return { ok: true, status: 200, json: async () => body.records.map((_, i) => ({ id: `a0${i}`, success: true, created: true })), text: async () => '' }
}

await ok('first run sends org → learners → seat, in that order', async () => {
  const r = await sync.runSalesforceSync({ trigger: 'admin', fetchImpl: sfMock })
  assert.equal(r.status, 'ok', r.errors.join('; '))
  assert.equal(r.changed, 4)
  assert.equal(r.sent, 4)
  assert.equal(r.calls, 4) // token + Account + Academy_Learner__c + Seat_Assignment__c
  assert.deepEqual(sent.map(s => s.url.split('/composite/sobjects/')[1]), ['Account/Academy_Org_Id__c', 'Academy_Learner__c/Academy_User_Id__c', 'Seat_Assignment__c/Academy_Seat_Key__c'])
  const asha = sent[1].records.find(x => x.Academy_User_Id__c === 'u1')
  assert.equal(asha.Plan__c, 'seat')
  assert.equal(asha.Company__c, 'Northwind')
  assert.deepEqual(asha.Organisation__r, { Academy_Org_Id__c: '3' })
  assert.ok(asha.Site_Score__c >= 60, `Asha scores ${asha.Site_Score__c}`)
  const ravi = sent[1].records.find(x => x.Academy_User_Id__c === 'u2')
  assert.equal(ravi.Plan__c, 'monthly')
  assert.equal(ravi.Is_Pro__c, true)
  assert.equal(db.enrichment.length, 2, 'recomputed scores written back')
})
await ok('second run: nothing changed, nothing sent, no token requested', async () => {
  sent.length = 0
  const r = await sync.runSalesforceSync({ trigger: 'cron', fetchImpl: async () => assert.fail('Salesforce must not be called') })
  assert.equal(r.status, 'ok')
  assert.equal(r.changed, 0)
  assert.equal(r.calls, 0)
})
await ok('not configured → no-op', async () => {
  delete process.env.SF_CLIENT_SECRET
  const r = await sync.runSalesforceSync({ trigger: 'cron', fetchImpl: async () => assert.fail('no call') })
  assert.equal(r.status, 'not_configured')
})
await ok('three refused tokens pause the hourly run, not the admin button', async () => {
  process.env.SF_CLIENT_SECRET = 'secret'
  db.sync.clear()
  const refuse = async () => ({ ok: false, status: 400, json: async () => ({}), text: async () => '' })
  for (let i = 0; i < 3; i++) assert.equal((await sync.runSalesforceSync({ trigger: 'cron', fetchImpl: refuse })).status, 'auth_failed')
  assert.equal((await sync.runSalesforceSync({ trigger: 'cron', fetchImpl: refuse })).status, 'paused')
  assert.equal((await sync.runSalesforceSync({ trigger: 'admin', fetchImpl: refuse })).status, 'auth_failed')
})

console.log(`\n${passed} checks passed`)
