#!/usr/bin/env node
/**
 * Checks the Prospecting module against fixtures — no network, no database,
 * no real provider, Hostinger or n8n call: `pnpm prospect:check`
 *
 *   prospect-core.ts       templates, sending window, cap + ramp, CSV, MIME with Message-ID threading
 *   prospect-providers.ts  Apollo and Hunter adapters on mocked API answers, provider selection
 *   smtp.ts                a full SMTP conversation against a fake server (465 and STARTTLS)
 *   outreach.ts            config, signing, replay window, n8n send transport (mocked)
 *   prospect.ts            the provider call wrapper: cache hit = no paid call, 429 backoff
 *   prospect-send.ts       a full run on a fake database: window, cap, suppression, threading
 *   prospect-inbound.ts    n8n events: signature, replay, reply → stop, bounce → suppress,
 *                          and the shipped n8n classifier (docs/n8n/prospect-inbound.json)
 *
 * Needs Node 22.18+ (type stripping). Server modules use Nitro auto-imports,
 * so their globals are put on globalThis first.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const core = await import('../server/utils/prospect-core.ts')
const prov = await import('../server/utils/prospect-providers.ts')
const smtp = await import('../server/utils/smtp.ts')
const outreach = await import('../server/utils/outreach.ts')
const score = await import('../server/utils/score.ts')
const page = await import('../server/utils/company-page.ts')
Object.assign(globalThis, core, prov, smtp, outreach, score, page)
globalThis.createError = o => Object.assign(new Error(o.statusMessage), o)
globalThis.secretKey = async () => 'test-secret'
const email = await import('../server/utils/email.ts')
Object.assign(globalThis, email)
const pro = await import('../server/utils/prospect.ts')
Object.assign(globalThis, pro)
const send = await import('../server/utils/prospect-send.ts')
const inbound = await import('../server/utils/prospect-inbound.ts')

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
  const raw = core.buildMime({ from: 'me@acme.com', fromName: 'Swarnil Singhai', to: 'asha@northwind.com', subject: 'Héllo', body: 'Hi Asha,\n\nA line.', unsubscribeUrl: 'https://x/u?p=1&s=2', footer: 'Swarnil · CRM Analytics Academy', messageId: '<m2@acme.com>', inReplyTo: '<m1@acme.com>', references: ['<m0@acme.com>'], date: new Date('2026-11-23T10:00:00Z') }, 'B')
  assert.match(raw, /^From: Swarnil Singhai <me@acme\.com>\r\n/)
  assert.match(raw, /Subject: =\?UTF-8\?B\?/)
  assert.match(raw, /List-Unsubscribe: <https:\/\/x\/u\?p=1&s=2>/)
  assert.match(raw, /List-Unsubscribe-Post: List-Unsubscribe=One-Click/)
  assert.match(raw, /\r\nMessage-ID: <m2@acme\.com>\r\n/)
  assert.match(raw, /\r\nDate: Mon, 23 Nov 2026 10:00:00 \+0000\r\n/)
  assert.match(raw, /\r\nIn-Reply-To: <m1@acme\.com>\r\n/)
  assert.match(raw, /\r\nReferences: <m0@acme\.com> <m1@acme\.com>\r\n/)
  assert.match(core.newMessageId('Me@Outreach.Example.com'), /^<[0-9a-f-]{36}@Outreach\.Example\.com>$/)
  const parts = raw.split('--B').slice(1, 3).map(p => Buffer.from(p.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8'))
  assert.match(parts[0], /Swarnil · CRM Analytics Academy\nUnsubscribe: https:\/\/x\/u\?p=1&s=2/)
  assert.match(parts[1], /<a href="https:\/\/x\/u\?p=1&amp;s=2"/)
  assert.ok(!/<img/i.test(parts[1]), 'no tracking pixel')
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

// ---- SMTP (fake server) -------------------------------------------------------------
console.log('smtp (fake server)')
function fakeSmtp({ authOk = true, advertise = 'AUTH PLAIN LOGIN', starttls = false } = {}) {
  const log = []
  const enc = new TextEncoder()
  const dec = new TextDecoder()
  let data = ''
  const make = (tls) => {
    let push
    let inData = false
    let buf = ''
    const readable = new ReadableStream({
      start(c) {
        push = s => c.enqueue(enc.encode(s))
        if (!tls) push('220 smtp.hostinger.com ESMTP ready\r\n')
      }
    })
    const respond = (line) => {
      log.push(line)
      if (/^EHLO /.test(line)) push(`250-smtp.hostinger.com\r\n${starttls && !tls ? '250-STARTTLS\r\n' : ''}250-${advertise}\r\n250 SIZE 48811212\r\n`)
      else if (line === 'STARTTLS') push('220 2.0.0 Ready to start TLS\r\n')
      else if (/^AUTH PLAIN /.test(line)) push(authOk ? '235 2.7.0 Authentication successful\r\n' : '535 5.7.8 Error: authentication failed\r\n')
      else if (line === 'AUTH LOGIN') push('334 VXNlcm5hbWU6\r\n')
      else if (/^MAIL FROM:/.test(line)) push('250 2.1.0 Ok\r\n')
      else if (/^RCPT TO:/.test(line)) push('250 2.1.5 Ok\r\n')
      else if (line === 'DATA') {
        push('354 End data with <CR><LF>.<CR><LF>\r\n')
        inData = true
      } else if (line === 'QUIT') push('221 2.0.0 Bye\r\n')
      else if (log.at(-2) === 'AUTH LOGIN') push('334 UGFzc3dvcmQ6\r\n')
      else if (log.at(-3) === 'AUTH LOGIN') push(authOk ? '235 2.7.0 Authentication successful\r\n' : '535 5.7.8 failed\r\n')
      else push('500 unknown\r\n')
    }
    const writable = new WritableStream({
      write(chunk) {
        buf += dec.decode(chunk)
        if (inData) {
          data += buf
          buf = ''
          if (data.endsWith('\r\n.\r\n')) {
            inData = false
            push('250 2.0.0 Ok: queued as 4ABC\r\n')
          }
          return
        }
        let i
        while ((i = buf.indexOf('\r\n')) >= 0) {
          const line = buf.slice(0, i)
          buf = buf.slice(i + 2)
          respond(line)
        }
      }
    })
    const sock = { readable, writable, close() {}, startTls: () => make(true) }
    return sock
  }
  const opened = []
  const connect = (host, port, tls) => {
    opened.push({ host, port, tls })
    return make(false)
  }
  return { connect, log, opened, data: () => data }
}
const SMTP = { host: 'smtp.hostinger.com', port: 465, user: 'swarnil@outreach.example.com', pass: 's3cret-PASS' }

await ok('465: implicit TLS, EHLO, AUTH PLAIN, MAIL/RCPT/DATA with dot-stuffing, QUIT', async () => {
  const s = fakeSmtp()
  const r = await smtp.smtpSend(SMTP, { from: 'swarnil@outreach.example.com', to: 'asha@northwind.com', raw: 'Subject: x\r\n\r\n.leading dot\r\nbye' }, s.connect, 'outreach.example.com')
  assert.deepEqual(s.opened[0], { host: 'smtp.hostinger.com', port: 465, tls: 'on' })
  assert.equal(s.log[0], 'EHLO outreach.example.com')
  assert.equal(s.log[1], `AUTH PLAIN ${Buffer.from('\0swarnil@outreach.example.com\0s3cret-PASS').toString('base64')}`)
  assert.deepEqual(s.log.slice(2), ['MAIL FROM:<swarnil@outreach.example.com>', 'RCPT TO:<asha@northwind.com>', 'DATA', 'QUIT'])
  assert.equal(s.data(), 'Subject: x\r\n\r\n..leading dot\r\nbye\r\n.\r\n')
  assert.match(r.queued, /queued as 4ABC/)
  assert.ok(!r.transcript.join('\n').includes('s3cret') && !r.transcript.join('\n').includes(Buffer.from('\0swarnil@outreach.example.com\0s3cret-PASS').toString('base64')), 'no password in the transcript')
})
await ok('587: STARTTLS upgrade, then AUTH LOGIN when PLAIN is not offered', async () => {
  const s = fakeSmtp({ starttls: true, advertise: 'AUTH LOGIN' })
  await smtp.smtpCheck({ ...SMTP, port: 587 }, s.connect, 'outreach.example.com')
  assert.equal(s.opened[0].tls, 'starttls')
  assert.deepEqual(s.log.slice(0, 4), ['EHLO outreach.example.com', 'STARTTLS', 'EHLO outreach.example.com', 'AUTH LOGIN'])
  assert.equal(s.log.at(-1), 'QUIT')
})
await ok('a refused login is an error with the server code; header injection is refused', async () => {
  await assert.rejects(smtp.smtpCheck(SMTP, fakeSmtp({ authOk: false }).connect), e => e.code === 535 && !/s3cret/.test(e.message))
  await assert.rejects(smtp.smtpSend(SMTP, { from: 'a@b.com', to: 'x@y.com>\r\nRCPT TO:<z@z.com', raw: '' }, fakeSmtp().connect), /Bad address/)
})

// ---- outreach transport + signing ----------------------------------------------------------
console.log('outreach transport and signing')
await ok('config from env: Hostinger defaults, From parsing, readiness', () => {
  const c = outreach.outreachConfigFromEnv({ SMTP_USER: 'me@out.example.com', SMTP_PASS: 'p', OUTREACH_FROM: 'Swarnil Singhai <me@out.example.com>' })
  assert.deepEqual(c.smtp, { host: 'smtp.hostinger.com', port: 465, user: 'me@out.example.com', pass: 'p' })
  assert.deepEqual(c.from, { name: 'Swarnil Singhai', address: 'me@out.example.com' })
  assert.equal(c.transport, 'smtp')
  assert.equal(outreach.outreachReady(c), null)
  assert.match(outreach.outreachReady(outreach.outreachConfigFromEnv({})), /OUTREACH_FROM/)
  assert.match(outreach.outreachReady(outreach.outreachConfigFromEnv({ OUTREACH_TRANSPORT: 'n8n', OUTREACH_FROM: 'a@b.com' })), /N8N_SEND_WEBHOOK_URL/)
  assert.equal(outreach.parseFrom('"Swarnil" <S@X.com>').address, 's@x.com')
  assert.equal(outreach.parseFrom('nope'), null)
})
await ok('signatures: valid, tampered, stale', async () => {
  const now = 1_790_000_000
  const { ts, signature } = await outreach.signPayload('k', '{"a":1}', now)
  assert.match(signature, /^sha256=[0-9a-f]{64}$/)
  assert.equal(await outreach.verifyPayload('k', ts, '{"a":1}', signature, now + 10), 'ok')
  assert.equal(await outreach.verifyPayload('k', ts, '{"a":2}', signature, now + 10), 'bad')
  assert.equal(await outreach.verifyPayload('other', ts, '{"a":1}', signature, now), 'bad')
  assert.equal(await outreach.verifyPayload('k', ts, '{"a":1}', signature, now + 301), 'stale')
  assert.equal(await outreach.verifyPayload('k', 'x', '{"a":1}', signature, now), 'bad')
})
await ok('n8n transport posts a signed message the n8n workflow can verify', async () => {
  let posted = null
  const cfg = outreach.outreachConfigFromEnv({ OUTREACH_TRANSPORT: 'n8n', OUTREACH_FROM: 'Swarnil <me@out.example.com>', N8N_SEND_WEBHOOK_URL: 'https://n8n.example.com/webhook/crma-prospect-send', N8N_WEBHOOK_SECRET: 'shh' })
  const r = await outreach.deliver(cfg, { to: 'asha@northwind.com', subject: 'Hi', raw: 'RAW', text: 'T', html: '<p>T</p>', messageId: '<m1@out.example.com>', inReplyTo: null, references: [], unsubscribeUrl: 'https://u' }, {
    connect: () => assert.fail('no SMTP in n8n mode'),
    fetch: async (url, init) => {
      posted = { url, init }
      return { ok: true, status: 200 }
    }
  })
  assert.equal(r.transport, 'n8n')
  const body = JSON.parse(posted.init.body)
  assert.equal(await outreach.verifyPayload('shh', body.ts, body.payload, posted.init.headers['x-signature']), 'ok')
  const msg = JSON.parse(body.payload)
  assert.deepEqual([msg.from, msg.fromName, msg.to, msg.messageId, msg.listUnsubscribe], ['me@out.example.com', 'Swarnil', 'asha@northwind.com', '<m1@out.example.com>', 'https://u'])
  // The n8n "Signed and fresh?" check recomputes HMAC(ts + '.' + payload): the same string.
  assert.equal(posted.init.headers['x-signature'], `sha256=${await outreach.hmacSha256Hex('shh', `${body.ts}.${body.payload}`)}`)
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

console.log('outreach run (fake database, fake SMTP)')
process.env.SMTP_USER = 'swarnil@outreach.example.com'
process.env.SMTP_PASS = 's3cret-PASS'
process.env.OUTREACH_FROM = 'Swarnil Singhai <swarnil@outreach.example.com>'
function runDb({ due = [], suppressed = {}, nextStep = true, first = null, day = 0 }) {
  const state = { sent: [], activity: [], enrollment: [], lastRun: null }
  const db = fakeDb([
    [/from app\.prospect_setting$/, []],
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
      state.enrollment.push({ q, v })
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
const due = (over = {}) => ({ id: 1, sequence_id: 9, prospect_id: 5, step: 0, first_name: 'Asha', last_name: 'Rao', title: 'Head of Analytics', email: 'asha@northwind.com', email_status: 'valid', prospect_status: 'new', timezone: 'Europe/London', company: 'Northwind', domain: 'northwind.com', subject: 'CRM Analytics for {{company}}', body: 'Hi {{firstName|there}}', first_subject: null, refs: [], ...over })
const MONDAY = new Date('2026-11-23T10:00:00Z')
const parseSent = (data) => {
  const [head] = data.split('\r\n\r\n')
  return head
}

await ok('sends a due step over SMTP: rendered, our Message-ID, unsubscribe headers, next step scheduled', async () => {
  const st = runDb({ due: [due()] })
  const s = fakeSmtp()
  const r = await send.runProspectSend({ trigger: 'admin', connect: s.connect, now: MONDAY })
  assert.equal(r.status, 'ok', r.errors.join('; '))
  assert.equal(r.sent, 1)
  assert.equal(r.cap, 10, 'first day of the ramp')
  const head = parseSent(s.data())
  assert.match(head, /^From: Swarnil Singhai <swarnil@outreach\.example\.com>/m)
  assert.match(head, /^Subject: CRM Analytics for Northwind/m)
  assert.match(head, /^Message-ID: <[0-9a-f-]{36}@outreach\.example\.com>/m)
  assert.match(head, /^List-Unsubscribe: <https:\/\/crmanalytics\.imswarnil\.com\/api\/prospect\/unsubscribe\?p=5&s=[0-9a-f]{32}>/m)
  assert.match(head, /^List-Unsubscribe-Post: List-Unsubscribe=One-Click/m)
  assert.ok(!/^In-Reply-To/m.test(head))
  const mid = /^Message-ID: (<[^>]+>)/m.exec(head)[1]
  assert.equal(st.sent[0][3], mid, 'the Message-ID is stored for matching replies')
  assert.equal(st.sent[0][4], 'smtp')
  assert.ok(st.enrollment.some(e => /set step = step \+ 1/.test(e.q)))
  assert.equal(st.lastRun.sent, 1)
})
await ok('a follow-up threads: Re: first subject, In-Reply-To the last, References all', async () => {
  runDb({ due: [due({ step: 2, first_subject: 'CRM Analytics for Northwind', refs: ['<a@outreach.example.com>', '<b@outreach.example.com>'] })], nextStep: false })
  const s = fakeSmtp()
  await send.runProspectSend({ trigger: 'admin', connect: s.connect, now: MONDAY })
  const head = parseSent(s.data())
  assert.match(head, /^Subject: Re: CRM Analytics for Northwind/m)
  assert.match(head, /^In-Reply-To: <b@outreach\.example\.com>/m)
  assert.match(head, /^References: <a@outreach\.example\.com> <b@outreach\.example\.com>/m)
})
await ok('outside the window it waits; on a Saturday nothing goes', async () => {
  runDb({ due: [due({ timezone: 'America/Los_Angeles' })] })
  let r = await send.runProspectSend({ trigger: 'admin', connect: () => assert.fail('no send'), now: MONDAY })
  assert.equal(r.sent, 0)
  assert.equal(r.waiting, 1)
  runDb({ due: [due()] })
  r = await send.runProspectSend({ trigger: 'admin', connect: () => assert.fail('no send'), now: new Date('2026-11-28T10:00:00Z') })
  assert.equal(r.sent, 0)
})
await ok('never to invalid, unverified, suppressed or replied prospects', async () => {
  const st = runDb({ due: [due({ id: 1, email_status: 'invalid' }), due({ id: 2, email_status: 'unknown' }), due({ id: 3, email: 'cfo@northwind.com' }), due({ id: 4, prospect_status: 'replied' })], suppressed: { 'cfo@northwind.com': 'unsubscribed' } })
  const r = await send.runProspectSend({ trigger: 'admin', connect: () => assert.fail('must not connect'), now: MONDAY })
  assert.equal(r.sent, 0)
  assert.equal(r.stopped, 4)
  assert.ok(st.activity.some(a => /Suppressed \(unsubscribed\)/.test(a[2])))
})
await ok('the cap holds; an SMTP refusal stops the run and leaves the step due', async () => {
  runDb({ due: [due({ id: 1 }), due({ id: 2, prospect_id: 6, email: 'b@northwind.com' })], first: '2026-11-01T00:00:00Z', day: 29 })
  let r = await send.runProspectSend({ trigger: 'admin', connect: fakeSmtp().connect, now: MONDAY })
  assert.equal(r.cap, 30)
  assert.equal(r.sent, 1)
  const st = runDb({ due: [due({ id: 1 }), due({ id: 2, prospect_id: 6, email: 'b@northwind.com' })] })
  r = await send.runProspectSend({ trigger: 'admin', connect: fakeSmtp({ authOk: false }).connect, now: MONDAY })
  assert.equal(r.status, 'failed')
  assert.match(r.errors[0], /535/)
  assert.equal(st.sent.length, 0)
  assert.ok(!st.enrollment.length, 'nothing advanced')
})
await ok('not configured → nothing happens', async () => {
  const keep = process.env.SMTP_PASS
  delete process.env.SMTP_PASS
  const r = await send.runProspectSend({ trigger: 'cron', connect: () => assert.fail() })
  assert.equal(r.status, 'not_configured')
  process.env.SMTP_PASS = keep
})

// ---- n8n inbound ------------------------------------------------------------------------
console.log('n8n inbound (fake database)')
function inboundDb({ messages = {}, prospects = {} }) {
  const seen = new Set()
  const state = { suppress: [], enrollment: [], prospect: [], activity: [], inbound: [] }
  const db = fakeDb([
    [/insert into app\.prospect_inbound/, (v) => {
      if (seen.has(v[0])) return []
      seen.add(v[0])
      state.inbound.push(v)
      return [{ id: seen.size }]
    }],
    [/from app\.prospect_message where message_id = any/, v => v[0].map(id => messages[id]).filter(Boolean).slice(0, 1).map(pid => ({ prospect_id: pid }))],
    [/select id from app\.prospect where lower\(email\) =/, v => Object.entries(prospects).filter(([, e]) => e === v[0]).map(([id]) => ({ id: Number(id) }))],
    [/select id, email from app\.prospect where id =/, v => (prospects[v[0]] ? [{ id: v[0], email: prospects[v[0]] }] : [])],
    [/insert into app\.prospect_suppression/, (v) => {
      state.suppress.push(v)
      return []
    }],
    [/update app\.prospect_enrollment/, (v, q) => {
      state.enrollment.push(q)
      return []
    }],
    [/update app\.prospect set/, (v, q) => {
      state.prospect.push(q)
      return []
    }],
    [/insert into app\.prospect_activity/, (v) => {
      state.activity.push(v)
      return []
    }]
  ])
  globalThis.useDb = () => db.sql
  return state
}
// What /api/prospect/inbound does, minus h3: verify, parse, handle.
async function post(secret, payloadObj, { tamper = false, ts } = {}) {
  const payload = JSON.stringify(payloadObj)
  const signed = await outreach.signPayload(secret, payload, ts)
  const check = await outreach.verifyPayload(secret, signed.ts, tamper ? payload.replace('reply', 'bounce') : payload, signed.signature)
  if (check !== 'ok') return { status: 401, check }
  const evt = outreach.parseInbound(JSON.parse(payload))
  if (!evt) return { status: 400 }
  const r = await inbound.handleInbound(evt, signed.signature)
  return r.status === 'duplicate' ? { status: 409 } : { ...r, status: 200 }
}
await ok('reply matched by In-Reply-To stops the sequences', async () => {
  const st = inboundDb({ messages: { '<b@outreach.example.com>': 5 }, prospects: { 5: 'asha@northwind.com' } })
  const r = await post('shh', { type: 'reply', from: 'Asha <asha@northwind.com>', subject: 'Re: CRM Analytics', inReplyTo: '<b@outreach.example.com>', snippet: 'Yes, let us talk' })
  assert.equal(r.status, 200)
  assert.equal(r.prospectId, 5)
  assert.equal(r.matchedBy, 'message-id')
  assert.ok(st.enrollment.some(q => /set status = 'replied'/.test(q)))
  assert.ok(st.prospect.some(q => /set status = 'replied'/.test(q)))
  assert.equal(st.suppress.length, 0)
})
await ok('bounce matched by the DSN recipient suppresses the address', async () => {
  const st = inboundDb({ prospects: { 7: 'gone@northwind.com' } })
  const r = await post('shh', { type: 'bounce', from: 'MAILER-DAEMON@mx.hostinger.com', recipient: 'gone@northwind.com', subject: 'Undelivered Mail Returned to Sender' })
  assert.equal(r.matchedBy, 'address')
  assert.deepEqual(st.suppress[0].slice(0, 2), ['gone@northwind.com', 'bounced'])
  assert.ok(st.prospect.some(q => /email_status = 'invalid'/.test(q)))
})
await ok('unsubscribe by reply suppresses; auto-reply only logs', async () => {
  let st = inboundDb({ prospects: { 5: 'asha@northwind.com' } })
  await post('shh', { type: 'unsubscribe', from: 'asha@northwind.com', snippet: 'unsubscribe' })
  assert.deepEqual(st.suppress[0].slice(0, 2), ['asha@northwind.com', 'unsubscribed'])
  st = inboundDb({ prospects: { 5: 'asha@northwind.com' } })
  await post('shh', { type: 'auto_reply', from: 'asha@northwind.com', subject: 'Out of office' })
  assert.equal(st.suppress.length, 0)
  assert.equal(st.enrollment.length, 0)
  assert.equal(st.activity[0][1], 'auto_reply')
})
await ok('tampered, stale and replayed requests are refused', async () => {
  inboundDb({})
  assert.equal((await post('shh', { type: 'reply', from: 'a@b.com' }, { tamper: true })).status, 401)
  assert.equal((await post('shh', { type: 'reply', from: 'a@b.com' }, { ts: Math.floor(Date.now() / 1000) - 3600 })).check, 'stale')
  const payload = JSON.stringify({ type: 'reply', from: 'a@b.com' })
  const signed = await outreach.signPayload('shh', payload)
  const evt = outreach.parseInbound(JSON.parse(payload))
  assert.equal((await inbound.handleInbound(evt, signed.signature)).status, 'ok')
  assert.equal((await inbound.handleInbound(evt, signed.signature)).status, 'duplicate')
  assert.equal(outreach.parseInbound({ type: 'delete_everything' }), null)
})
await ok('the shipped n8n classifier labels real-world mail and signs what the site verifies', async () => {
  const wf = JSON.parse(readFileSync(new URL('../docs/n8n/prospect-inbound.json', import.meta.url), 'utf8'))
  const code = wf.nodes.find(n => n.type === 'n8n-nodes-base.code').parameters.jsCode
  const classify = mail => new Function('$json', '$env', code)(mail, { CRMA_OUTREACH_ADDRESS: 'swarnil@outreach.example.com' })
  const type = mail => JSON.parse(classify(mail).json.payload).type
  assert.equal(type({ from: { value: [{ address: 'asha@northwind.com' }] }, subject: 'Re: CRM Analytics', text: 'Sounds good.\n\nOn Mon, Swarnil wrote:\n> hi', inReplyTo: '<b@outreach.example.com>' }), 'reply')
  const dsn = classify({ from: { value: [{ address: 'MAILER-DAEMON@mx1.hostinger.com' }] }, subject: 'Undelivered Mail Returned to Sender', text: 'Final-Recipient: rfc822; gone@northwind.com\nAction: failed\n\nMessage-ID: <a@outreach.example.com>\n' })
  const p = JSON.parse(dsn.json.payload)
  assert.deepEqual([p.type, p.recipient], ['bounce', 'gone@northwind.com'])
  assert.match(p.references, /<a@outreach\.example\.com>/)
  assert.equal(type({ from: { value: [{ address: 'asha@northwind.com' }] }, subject: 'Automatic reply: CRM Analytics', headers: { 'auto-submitted': 'auto-replied' }, text: 'I am away' }), 'auto_reply')
  assert.equal(type({ from: { value: [{ address: 'asha@northwind.com' }] }, subject: 'Re: hi', text: 'Unsubscribe me please' }), 'unsubscribe')
  assert.equal(classify({ from: { value: [{ address: 'swarnil@outreach.example.com' }] }, subject: 'x', text: '' }), null, 'our own copies are skipped')
  // The Crypto node's HMAC over signInput, sent as x-signature, verifies on the site.
  const out = classify({ from: { value: [{ address: 'asha@northwind.com' }] }, subject: 'Re', text: 'ok' }).json
  const sig = `sha256=${await outreach.hmacSha256Hex('shh', out.signInput)}`
  assert.equal(await outreach.verifyPayload('shh', out.ts, out.payload, sig), 'ok')
})

console.log(`\n${passed} checks passed`)
