#!/usr/bin/env node
/**
 * Checks the Prospecting module against fixtures — no network, no database,
 * no real provider or Gmail call: `pnpm prospect:check`
 *
 *   prospect-core.ts       templates, sending window, cap + ramp, CSV, MIME, token cipher
 *   prospect-providers.ts  Apollo and Hunter adapters on mocked API answers, provider selection
 *   gmail.ts               consent URL, code exchange, refresh, send, reply/bounce detection (mocked Google)
 *   prospect.ts            the provider call wrapper: cache hit = no paid call, 429 backoff
 *   prospect-send.ts       a full run on a fake database: reply/bounce polling, window, cap, suppression
 *
 * Needs Node 22.18+ (type stripping). Server modules use Nitro auto-imports,
 * so their globals are put on globalThis first.
 */
import assert from 'node:assert/strict'

const core = await import('../server/utils/prospect-core.ts')
const prov = await import('../server/utils/prospect-providers.ts')
const gmail = await import('../server/utils/gmail.ts')
const score = await import('../server/utils/score.ts')
const page = await import('../server/utils/company-page.ts')
Object.assign(globalThis, core, prov, gmail, score, page)
globalThis.createError = o => Object.assign(new Error(o.statusMessage), o)
globalThis.secretKey = async () => 'test-secret'
const email = await import('../server/utils/email.ts')
Object.assign(globalThis, email)
const pro = await import('../server/utils/prospect.ts')
Object.assign(globalThis, pro)
const send = await import('../server/utils/prospect-send.ts')

let passed = 0
const ok = async (name, fn) => {
  await fn()
  passed++
  console.log(`  ✓ ${name}`)
}

// ---- core ---------------------------------------------------------------------------
console.log('core')
await ok('templates: variables, fallbacks, missing', () => {
  const v = { firstName: 'Asha', company: 'Northwind', title: null }
  assert.equal(core.renderTemplate('Hi {{firstName}} at {{ company }}', v), 'Hi Asha at Northwind')
  assert.equal(core.renderTemplate('Hi {{title|there}}, {{unknown}}!', v), 'Hi there, !')
  assert.deepEqual(core.missingVars('{{firstName}} {{title}} {{lastName|x}}', v), ['title'])
})
await ok('sending window: business days in the prospect time zone', () => {
  const mondayUtc0930 = new Date('2026-11-23T09:30:00Z') // Monday
  assert.equal(core.inSendWindow(mondayUtc0930, 'Europe/London', 'UTC'), true)
  assert.equal(core.inSendWindow(mondayUtc0930, 'America/Los_Angeles', 'UTC'), false) // 01:30 there
  assert.equal(core.inSendWindow(mondayUtc0930, 'Asia/Kolkata', 'UTC'), true) // 15:00
  assert.equal(core.inSendWindow(new Date('2026-11-28T10:00:00Z'), 'Europe/London', 'UTC'), false) // Saturday
  assert.equal(core.inSendWindow(mondayUtc0930, 'Not/AZone', 'Europe/London'), true) // falls back
})
await ok('daily cap ramps up', () => {
  const now = new Date('2026-11-23T10:00:00Z')
  assert.equal(core.capToday({ cap: 30, rampStart: 10, rampStep: 5, firstSendAt: null, now }), 10)
  assert.equal(core.capToday({ cap: 30, rampStart: 10, rampStep: 5, firstSendAt: new Date('2026-11-21T10:00:00Z'), now }), 20)
  assert.equal(core.capToday({ cap: 30, rampStart: 10, rampStep: 5, firstSendAt: new Date('2026-10-01T00:00:00Z'), now }), 30)
  assert.equal(core.capToday({ cap: 0, rampStart: 10, rampStep: 5, firstSendAt: null, now }), 0)
})
await ok('CSV in and out (quotes, BOM, formula injection)', () => {
  const rows = core.parseCsv('﻿Name,Email,Company,Title\r\n"Rao, Asha",ASHA@Northwind.com,Northwind,"Head of ""Data"""\n,,,\n')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].name, 'Rao, Asha')
  const p = core.csvToProspect({ name: 'Asha Rao', email: 'ASHA@northwind.com', website: 'https://www.northwind.com/about' })
  assert.deepEqual([p.firstName, p.lastName, p.email, p.domain], ['Asha', 'Rao', 'asha@northwind.com', 'northwind.com'])
  assert.equal(core.csvToProspect({ email: 'not-an-email' }).email, null)
  const out = core.toCsv([{ a: '=HYPERLINK("x")', b: 'x,y' }], ['a', 'b'])
  assert.equal(out, 'a,b\n"\'=HYPERLINK(""x"")","x,y"\n')
})
await ok('MIME: headers, one-click unsubscribe, footer, no pixel', () => {
  const raw = core.buildMime({ from: 'me@acme.com', fromName: 'Swarnil Singhai', to: 'asha@northwind.com', subject: 'Héllo', body: 'Hi Asha,\n\nA line.', unsubscribeUrl: 'https://x/u?p=1&s=2', footer: 'Swarnil · CRM Analytics Academy', inReplyTo: '<m1@mail.gmail.com>' }, 'B')
  assert.match(raw, /^From: Swarnil Singhai <me@acme\.com>\r\n/)
  assert.match(raw, /Subject: =\?UTF-8\?B\?/)
  assert.match(raw, /List-Unsubscribe: <https:\/\/x\/u\?p=1&s=2>/)
  assert.match(raw, /List-Unsubscribe-Post: List-Unsubscribe=One-Click/)
  assert.match(raw, /In-Reply-To: <m1@mail\.gmail\.com>/)
  const parts = raw.split('--B').slice(1, 3).map(p => Buffer.from(p.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8'))
  assert.match(parts[0], /Swarnil · CRM Analytics Academy\nUnsubscribe: https:\/\/x\/u\?p=1&s=2/)
  assert.match(parts[1], /<a href="https:\/\/x\/u\?p=1&amp;s=2"/)
  assert.ok(!/<img/i.test(parts[1]), 'no tracking pixel')
  assert.ok(!/[+/=]/.test(core.base64url(raw)))
})
await ok('refresh-token cipher round-trips and refuses another key', async () => {
  const sealed = await core.encryptSecret('1//refresh-token', 'k1')
  assert.ok(!sealed.includes('refresh'))
  assert.equal(await core.decryptSecret(sealed, 'k1'), '1//refresh-token')
  await assert.rejects(core.decryptSecret(sealed, 'k2'))
})

// ---- providers ------------------------------------------------------------------------
console.log('providers (mocked APIs)')
function ctx(answers) {
  const calls = []
  return { calls, key: 'KEY', http: async (op, cacheKey, url, init) => {
    calls.push({ op, cacheKey, url, init })
    return typeof answers === 'function' ? answers(op, url, init) : answers[op]
  } }
}
await ok('selection by env var; slots stay off', () => {
  assert.equal(prov.activeProviders({}).length, 0)
  assert.equal(prov.providerFor('companies', { APOLLO_API_KEY: 'a' }).id, 'apollo')
  assert.equal(prov.providerFor('verify', { APOLLO_API_KEY: 'a' }), null)
  assert.equal(prov.providerFor('people', { APOLLO_API_KEY: 'a', HUNTER_API_KEY: 'h' }, 'hunter').id, 'hunter')
  assert.equal(prov.activeProviders({ PDL_API_KEY: 'x' }).length, 0, 'an unimplemented slot is never active')
})
await ok('Apollo company search: filters, Salesforce technology, mapping', async () => {
  const c = ctx({ companies: { organizations: [{ id: 'o1', name: 'Northwind', primary_domain: 'northwind.com', website_url: 'http://www.northwind.com', industry: 'retail', estimated_num_employees: 420, country: 'India', city: 'Pune', linkedin_url: 'https://linkedin.com/company/nw' }] } })
  const hits = await prov.apollo.searchCompanies({ keywords: 'salesforce, analytics', sizes: ['51,200', '11,50'], country: 'India', usesSalesforce: true }, c)
  const body = JSON.parse(c.calls[0].init.body)
  assert.equal(c.calls[0].url, 'https://api.apollo.io/api/v1/mixed_companies/search')
  assert.equal(c.calls[0].init.headers['x-api-key'], 'KEY')
  assert.ok(!c.calls[0].url.includes('KEY'), 'key never in the URL')
  assert.deepEqual(body.q_organization_keyword_tags, ['salesforce', 'analytics'])
  assert.deepEqual(body.organization_num_employees_ranges, ['11,50', '51,200'])
  assert.deepEqual(body.currently_using_any_of_technology_uids, ['salesforce'])
  assert.deepEqual(hits[0], { provider: 'apollo', providerId: 'o1', name: 'Northwind', domain: 'northwind.com', website: 'http://www.northwind.com', linkedin: 'https://linkedin.com/company/nw', industry: 'retail', size: 420, country: 'India', city: 'Pune', usesSalesforce: true })
})
await ok('Apollo people: titles + seniority; locked emails dropped', async () => {
  const c = ctx({ people: { people: [
    { id: 'p1', first_name: 'Asha', last_name: 'Rao', title: 'Head of Analytics', seniority: 'head', email: 'asha@northwind.com', email_status: 'verified', organization: { name: 'Northwind', primary_domain: 'northwind.com' } },
    { id: 'p2', first_name: 'Ravi', last_name: 'K', title: 'Salesforce Admin', email: 'email_not_unlocked@domain.com' }
  ] } })
  const people = await prov.apollo.searchPeople({ domain: 'northwind.com', titles: ['Salesforce Admin'], seniorities: ['head'] }, c)
  const body = JSON.parse(c.calls[0].init.body)
  assert.deepEqual(body.q_organization_domains_list, ['northwind.com'])
  assert.deepEqual(body.person_titles, ['Salesforce Admin'])
  assert.equal(people[0].emailStatus, 'valid')
  assert.equal(people[1].email, null)
})
await ok('Hunter: domain search, finder, verifier statuses, credits', async () => {
  const c = ctx({
    domain: { data: { organization: 'Northwind', domain: 'northwind.com', emails: [{ value: 'asha@northwind.com', first_name: 'Asha', last_name: 'Rao', position: 'Salesforce Admin', verification: { status: 'valid' } }, { value: 'x@northwind.com', position: 'Chef' }] } },
    find: { data: { email: 'Ravi.K@northwind.com', score: 91, verification: { status: 'accept_all' } } },
    verify: { data: { status: 'invalid', result: 'undeliverable', score: 10 } },
    credits: { data: { requests: { searches: { used: 3, available: 25 }, verifications: { used: 1, available: 50 } } } }
  })
  const ppl = await prov.hunter.searchPeople({ domain: 'northwind.com', titles: ['salesforce'] }, c)
  assert.equal(ppl.length, 1)
  assert.equal(ppl[0].emailStatus, 'valid')
  assert.equal(c.calls[0].init.headers['x-api-key'], 'KEY')
  assert.ok(!c.calls[0].url.includes('KEY'))
  assert.deepEqual(await prov.hunter.findEmail({ firstName: 'Ravi', lastName: 'K', domain: 'northwind.com' }, c), { email: 'ravi.k@northwind.com', score: 91, status: 'risky' })
  assert.equal((await prov.hunter.verifyEmail('a@b.com', c)).status, 'invalid')
  assert.deepEqual((await prov.hunter.credits(c)).map(x => x.available), [25, 50])
  assert.deepEqual(['valid', 'invalid', 'disposable', 'accept_all', 'webmail', 'unknown'].map(s => prov.hunterStatus(s)), ['valid', 'invalid', 'invalid', 'risky', 'risky', 'unknown'])
  assert.equal(prov.hunterStatus(undefined, 'deliverable'), 'valid')
})

// ---- gmail ----------------------------------------------------------------------------
console.log('gmail (mocked Google)')
const cfg = { clientId: 'cid', clientSecret: 'csecret' }
const res = (status, json) => ({ ok: status < 300, status, json: async () => json })
await ok('consent URL asks for send + readonly, offline, signed state', () => {
  const u = new URL(gmail.authorizeUrl(cfg, 'https://site/cb', 'st'))
  assert.equal(u.searchParams.get('scope'), 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly')
  assert.equal(u.searchParams.get('access_type'), 'offline')
  assert.equal(u.searchParams.get('prompt'), 'consent')
  assert.equal(u.searchParams.get('state'), 'st')
})
await ok('code exchange needs a refresh token and both scopes; invalid_grant is explicit', async () => {
  const scopes = gmail.GMAIL_SCOPES.join(' ')
  await assert.rejects(gmail.exchangeCode(cfg, 'c', 'r', async () => res(200, { access_token: 'a', scope: scopes })), /No refresh token/)
  await assert.rejects(gmail.exchangeCode(cfg, 'c', 'r', async () => res(200, { access_token: 'a', refresh_token: 'r', scope: gmail.GMAIL_SCOPES[0] })), /Missing scope/)
  assert.deepEqual(await gmail.exchangeCode(cfg, 'c', 'r', async () => res(200, { access_token: 'a', refresh_token: 'r', scope: scopes })), { accessToken: 'a', refreshToken: 'r' })
  await assert.rejects(gmail.accessToken(cfg, 'r', async () => res(400, { error: 'invalid_grant' })), /^Error: invalid_grant/)
})
await ok('send returns ids + Message-ID; thread replies, bounces and auto-replies', async () => {
  const calls = []
  const f = async (url, init) => {
    calls.push({ url, init })
    if (url.endsWith('/messages/send')) return res(200, { id: 'm1', threadId: 't1' })
    return res(200, { payload: { headers: [{ name: 'Message-ID', value: '<abc@mail.gmail.com>' }] } })
  }
  assert.deepEqual(await gmail.sendRaw('tok', 'RAW', null, f), { id: 'm1', threadId: 't1', messageId: '<abc@mail.gmail.com>' })
  assert.equal(JSON.parse(calls[0].init.body).raw, 'RAW')
  const thread = (...froms) => async () => res(200, { messages: froms.map(([from, auto]) => ({ payload: { headers: [{ name: 'From', value: from }, ...(auto ? [{ name: 'Auto-Submitted', value: auto }] : [])] } })) })
  assert.equal(await gmail.threadState('tok', 't1', 'me@acme.com', thread(['Me <me@acme.com>'])), 'none')
  assert.equal(await gmail.threadState('tok', 't1', 'me@acme.com', thread(['Me <me@acme.com>'], ['Asha <asha@northwind.com>'])), 'replied')
  assert.equal(await gmail.threadState('tok', 't1', 'me@acme.com', thread(['Me <me@acme.com>'], ['Mail Delivery Subsystem <mailer-daemon@googlemail.com>'])), 'bounced')
  assert.equal(await gmail.threadState('tok', 't1', 'me@acme.com', thread(['Me <me@acme.com>'], ['Asha <asha@northwind.com>', 'auto-replied'])), 'none')
})

// ---- fake database ----------------------------------------------------------------------
function fakeDb(handlers) {
  const log = []
  const sql = (strings, ...values) => {
    const q = strings.join('?').replace(/\s+/g, ' ').trim()
    log.push({ q, values })
    for (const [re, fn] of handlers) if (re.test(q)) return Promise.resolve(typeof fn === 'function' ? fn(values, q) : fn)
    return Promise.resolve([])
  }
  return { sql, log }
}

console.log('provider call wrapper (fake database, mocked fetch)')
await ok('a cached answer is never paid for; 429 is retried', async () => {
  let cached = null
  const db = fakeDb([
    [/from app\.prospect_cache/, () => (cached ? [{ response: cached }] : [])],
    [/count\(\*\)::int as n from app\.provider_call/, [{ n: 0 }]],
    [/insert into app\.prospect_cache/, (v) => {
      cached = JSON.parse(v[3])
      return []
    }]
  ])
  globalThis.useDb = () => db.sql
  process.env.HUNTER_API_KEY = 'h'
  let fetches = 0
  globalThis.fetch = async () => {
    fetches++
    return fetches === 1 ? { ok: false, status: 429, json: async () => ({}) } : { ok: true, status: 200, json: async () => ({ data: { status: 'valid' } }) }
  }
  const c = pro.providerContext(prov.hunter)
  assert.equal((await prov.hunter.verifyEmail('a@northwind.com', c)).status, 'valid')
  assert.equal(fetches, 2, 'one 429, one success')
  assert.equal((await prov.hunter.verifyEmail('A@northwind.com', c)).status, 'valid')
  assert.equal(fetches, 2, 'the second lookup came from the cache')
  assert.ok(db.log.some(l => /insert into app\.provider_call .*cached/.test(l.q)))
})
await ok('the per-minute limit refuses before calling the provider', async () => {
  const db = fakeDb([[/count\(\*\)::int as n from app\.provider_call/, [{ n: 999 }]]])
  globalThis.useDb = () => db.sql
  globalThis.fetch = async () => assert.fail('must not call')
  await assert.rejects(prov.hunter.verifyEmail('b@northwind.com', pro.providerContext(prov.hunter)), /rate limit/)
})

console.log('outreach run (fake database, mocked Gmail)')
process.env.GOOGLE_CLIENT_ID = 'cid'
process.env.GOOGLE_CLIENT_SECRET = 'csecret'
const sealed = await core.encryptSecret('refresh-1', 'test-secret')
function runDb({ due = [], threads = [], suppressed = {}, nextStep = true, first = null, day = 0 }) {
  const state = { sent: [], activity: [], enrollment: [], prospect: [], suppress: [], lastRun: null }
  const db = fakeDb([
    [/from app\.prospect_setting$/, []],
    [/from app\.mail_account/, [{ email: 'me@acme.com', refresh_enc: sealed }]],
    [/from app\.prospect_enrollment e join app\.prospect p on p\.id = e\.prospect_id where e\.status = 'active' and e\.thread_id is not null/, threads],
    [/select min\(sent_at\)/, [{ first, day }]],
    [/join app\.prospect_step st/, due],
    [/from app\.prospect_suppression where value in/, v => (suppressed[v[0]] ? [{ reason: suppressed[v[0]] }] : [])],
    [/from neon_auth\."user"/, []],
    [/insert into app\.prospect_message/, (v) => {
      state.sent.push(v)
      return []
    }],
    [/insert into app\.prospect_activity/, (v) => {
      state.activity.push([v[0], v[1], v[2]])
      return []
    }],
    [/select delay_days from app\.prospect_step/, () => (nextStep ? [{ delay_days: 3 }] : [])],
    [/update app\.prospect_enrollment/, (v, q) => {
      state.enrollment.push(q)
      return []
    }],
    [/update app\.prospect set/, (v, q) => {
      state.prospect.push(q)
      return []
    }],
    [/insert into app\.prospect_suppression/, (v) => {
      state.suppress.push(v)
      return []
    }],
    [/insert into app\.prospect_setting/, (v) => {
      state.lastRun = JSON.parse(v[0])
      return []
    }]
  ])
  globalThis.useDb = () => db.sql
  return state
}
const due = (over = {}) => ({ id: 1, sequence_id: 9, prospect_id: 5, step: 0, thread_id: null, rfc_message_id: null, first_name: 'Asha', last_name: 'Rao', title: 'Head of Analytics', email: 'asha@northwind.com', email_status: 'valid', prospect_status: 'new', timezone: 'Europe/London', company: 'Northwind', domain: 'northwind.com', subject: 'CRM Analytics for {{company}}', body: 'Hi {{firstName|there}}', first_subject: null, ...over })
function google(threadFrom = null) {
  const calls = []
  const f = async (url, init) => {
    calls.push({ url, init })
    if (url.includes('oauth2.googleapis.com/token')) return res(200, { access_token: 'at' })
    if (url.endsWith('/messages/send')) return res(200, { id: `m${calls.length}`, threadId: 'th1' })
    if (url.includes('/threads/')) return res(200, { messages: [{ payload: { headers: [{ name: 'From', value: 'me@acme.com' }] } }, ...(threadFrom ? [{ payload: { headers: [{ name: 'From', value: threadFrom }] } }] : [])] })
    return res(200, { payload: { headers: [{ name: 'Message-ID', value: '<x@mail.gmail.com>' }] } })
  }
  return { f, calls }
}
const MONDAY = new Date('2026-11-23T10:00:00Z')

await ok('sends a due step in the window, rendered, with unsubscribe, then schedules the next', async () => {
  const st = runDb({ due: [due()] })
  const g = google()
  const r = await send.runProspectSend({ trigger: 'admin', fetchImpl: g.f, now: MONDAY })
  assert.equal(r.status, 'ok', r.errors.join('; '))
  assert.equal(r.sent, 1)
  assert.equal(r.cap, 10, 'first day of the ramp')
  const sendCall = g.calls.find(c => c.url.endsWith('/messages/send'))
  const raw = Buffer.from(JSON.parse(sendCall.init.body).raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  assert.match(raw, /Subject: CRM Analytics for Northwind/)
  assert.match(raw, /To: asha@northwind\.com/)
  assert.match(raw, /List-Unsubscribe: <https:\/\/crmanalytics\.imswarnil\.com\/api\/prospect\/unsubscribe\?p=5&s=[0-9a-f]{32}>/)
  assert.ok(st.enrollment.some(q => /set step = step \+ 1/.test(q)))
  assert.equal(st.activity[0][1], 'sent')
  assert.equal(st.lastRun.sent, 1)
})
await ok('a follow-up goes into the same thread as Re: the first subject', async () => {
  runDb({ due: [due({ step: 1, thread_id: 'th1', rfc_message_id: '<x@mail.gmail.com>', first_subject: 'CRM Analytics for Northwind' })], nextStep: false })
  const g = google()
  await send.runProspectSend({ trigger: 'admin', fetchImpl: g.f, now: MONDAY })
  const body = JSON.parse(g.calls.find(c => c.url.endsWith('/messages/send')).init.body)
  assert.equal(body.threadId, 'th1')
  const raw = Buffer.from(body.raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  assert.match(raw, /Subject: Re: CRM Analytics for Northwind/)
  assert.match(raw, /In-Reply-To: <x@mail\.gmail\.com>/)
})
await ok('outside the window it waits; on a Saturday nothing goes', async () => {
  runDb({ due: [due({ timezone: 'America/Los_Angeles' })] })
  let r = await send.runProspectSend({ trigger: 'admin', fetchImpl: google().f, now: MONDAY })
  assert.equal(r.sent, 0)
  assert.equal(r.waiting, 1)
  runDb({ due: [due()] })
  r = await send.runProspectSend({ trigger: 'admin', fetchImpl: google().f, now: new Date('2026-11-28T10:00:00Z') })
  assert.equal(r.sent, 0)
})
await ok('never to invalid, unverified, suppressed or replied prospects', async () => {
  const st = runDb({ due: [due({ id: 1, email_status: 'invalid' }), due({ id: 2, email_status: 'unknown' }), due({ id: 3, email: 'cfo@northwind.com' }), due({ id: 4, prospect_status: 'replied' })], suppressed: { 'cfo@northwind.com': 'unsubscribed' } })
  const g = google()
  const r = await send.runProspectSend({ trigger: 'admin', fetchImpl: g.f, now: MONDAY })
  assert.equal(r.sent, 0)
  assert.equal(r.stopped, 4)
  assert.ok(!g.calls.some(c => c.url.endsWith('/messages/send')))
  assert.ok(st.activity.some(a => /Suppressed \(unsubscribed\)/.test(a[2])))
})
await ok('the cap holds: nothing past today\'s limit', async () => {
  runDb({ due: [due({ id: 1 }), due({ id: 2, prospect_id: 6, email: 'b@northwind.com' })], first: '2026-11-01T00:00:00Z', day: 29 })
  const r = await send.runProspectSend({ trigger: 'admin', fetchImpl: google().f, now: MONDAY })
  assert.equal(r.cap, 30)
  assert.equal(r.sent, 1)
})
await ok('a reply stops the sequences; a bounce suppresses the address', async () => {
  let st = runDb({ threads: [{ id: 1, prospect_id: 5, thread_id: 'th1', email: 'asha@northwind.com' }] })
  let r = await send.runProspectSend({ trigger: 'cron', fetchImpl: google('Asha <asha@northwind.com>').f, now: MONDAY })
  assert.equal(r.replies, 1)
  assert.ok(st.enrollment.some(q => /set status = 'replied'/.test(q)))
  st = runDb({ threads: [{ id: 1, prospect_id: 5, thread_id: 'th1', email: 'asha@northwind.com' }] })
  r = await send.runProspectSend({ trigger: 'cron', fetchImpl: google('Mail Delivery Subsystem <mailer-daemon@googlemail.com>').f, now: MONDAY })
  assert.equal(r.bounces, 1)
  assert.deepEqual(st.suppress[0].slice(0, 2), ['asha@northwind.com', 'bounced'])
})
await ok('no Google client or no mailbox: nothing happens', async () => {
  delete process.env.GOOGLE_CLIENT_SECRET
  assert.equal((await send.runProspectSend({ trigger: 'cron', fetchImpl: () => assert.fail() })).status, 'not_configured')
  process.env.GOOGLE_CLIENT_SECRET = 'csecret'
  globalThis.useDb = () => fakeDb([[/from app\.mail_account/, []]]).sql
  assert.equal((await send.runProspectSend({ trigger: 'cron', fetchImpl: () => assert.fail() })).status, 'no_mailbox')
})
await ok('unsubscribe links are signed per prospect and cannot be reused for a learner', async () => {
  const url = new URL(await email.prospectUnsubscribeUrl(5))
  const s = url.searchParams.get('s')
  assert.equal(await email.verifyProspectUnsubscribe('5', s), true)
  assert.equal(await email.verifyProspectUnsubscribe('6', s), false)
  assert.equal(await email.verifyUnsubscribe('5', s), false)
})

console.log(`\n${passed} checks passed`)
