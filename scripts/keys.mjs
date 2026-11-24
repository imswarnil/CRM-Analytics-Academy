#!/usr/bin/env node
/**
 * Add the site's keys safely: `pnpm keys`
 *
 * Shows which keys exist (NAMES only, never values) in your local .env and on
 * the Cloudflare Worker, then asks for each missing one:
 *
 *   - you paste it; typing is hidden (nothing echoes to the screen)
 *   - it is checked for the right shape (sk_test_/sk_live_, whsec_, …)
 *   - it is written to .env (gitignored, permissions 600) and/or sent to the
 *     Worker with `wrangler secret put` over stdin, so it never appears in a
 *     command line, your shell history, a log or this repository
 *
 *   pnpm keys            status + fill in what is missing
 *   pnpm keys --status   status only
 *   pnpm keys --replace STRIPE_SECRET_KEY   overwrite one key
 *   pnpm keys --sync     copy keys that are in .env but missing on the Worker
 *                        (read from the file, sent over stdin, never shown)
 *
 * Random secrets (CAPTCHA_SECRET, NEON_AUTH_COOKIE_SECRET) can be generated
 * for you. Press Enter on any prompt to skip it.
 */
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import readline from 'node:readline'

// What the site uses, where it goes, and what a valid value looks like.
const KEYS = [
  { name: 'STRIPE_SECRET_KEY', where: ['env', 'worker'], shape: /^(sk|rk)_(test|live)_[A-Za-z0-9]{20,}$/, help: 'Stripe → Developers → API keys. Start with sk_test_… (test mode).' },
  { name: 'STRIPE_WEBHOOK_SECRET', where: ['env', 'worker'], shape: /^whsec_[A-Za-z0-9]{20,}$/, help: 'Printed once by `pnpm stripe:setup --webhook`, or Stripe → Webhooks → endpoint → Signing secret.' },
  { name: 'CAPTCHA_SECRET', where: ['env', 'worker'], shape: /^[a-f0-9]{64}$/, generate: true, help: 'Optional. Leave blank to generate one.' },
  { name: 'DATABASE_URL', where: ['env', 'worker'], shape: /^postgres(ql)?:\/\/\S+$/, help: 'Neon → Connect → Pooled connection string.' },
  { name: 'NEON_AUTH_BASE_URL', where: ['env', 'worker'], shape: /^https:\/\/\S+$/, help: '`neonctl neon-auth status --project-id <id>`' },
  { name: 'NEON_AUTH_COOKIE_SECRET', where: ['env', 'worker'], shape: /^[a-f0-9]{64}$/, generate: true, help: 'Leave blank to generate one. Changing it signs everyone out.' },
  { name: 'MY_DODO_API_KEY', where: ['env', 'worker'], shape: /^\S{20,}$/, help: 'Dodo Payments → Developer → API keys (test mode while DODO_ENV is test).' },
  { name: 'DODO_WEBHOOK_SECRET', where: ['env', 'worker'], shape: /^whsec_\S{20,}$/, help: 'Dodo Payments → Developer → Webhooks → the crmanalytics endpoint → Signing secret.' },
  { name: 'RESEND_API_KEY', where: ['env', 'worker'], shape: /^re_[A-Za-z0-9_]{20,}$/, help: 'Resend → API Keys → Create (Sending access). Verify your domain in Resend first.' },
  { name: 'SF_INSTANCE_URL', where: ['env', 'worker'], shape: /^https:\/\/[a-z0-9.-]+\.my\.salesforce\.com\/?$/i, help: 'Optional (account sync). The org\'s My Domain URL: Setup → My Domain, e.g. https://<name>.my.salesforce.com' },
  { name: 'SF_CLIENT_ID', where: ['env', 'worker'], shape: /^\S{20,}$/, help: 'Optional. External Client App → OAuth Settings → Consumer Key (salesforce/CRM-PROCESS.md → Account sync).' },
  { name: 'SF_CLIENT_SECRET', where: ['env', 'worker'], shape: /^\S{20,}$/, help: 'Optional. The same app → Consumer Secret.' },
  { name: 'APOLLO_API_KEY', where: ['env', 'worker'], shape: /^\S{16,}$/, help: 'Optional (Prospecting). Apollo.io → Settings → Integrations → API → Create new key (master key for search).' },
  { name: 'HUNTER_API_KEY', where: ['env', 'worker'], shape: /^[a-f0-9]{30,}$/i, help: 'Optional (Prospecting). Hunter.io → API → Your API key.' },
  { name: 'SMTP_USER', where: ['env', 'worker'], shape: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, help: 'Optional (Prospecting). The outreach mailbox address on Hostinger (hPanel → Emails).' },
  { name: 'SMTP_PASS', where: ['worker'], shape: /^\S.{5,}$/, help: 'Optional. The outreach mailbox password — sent to the Worker only, never written to .env.' },
  { name: 'OUTREACH_FROM', where: ['env', 'worker'], shape: /^.*<?[^\s@]+@[^\s@]+\.[^\s@]+>?$/, help: 'Optional. "Your Name <address>" outreach is sent as (same address as SMTP_USER).' },
  { name: 'N8N_WEBHOOK_SECRET', where: ['env', 'worker'], shape: /^[a-f0-9]{64}$/, generate: true, help: 'Optional (n8n). Leave blank to generate; paste the same value into n8n.' },
  { name: 'STUDIO_GITHUB_CLIENT_ID', where: ['worker'], shape: /^\S{10,}$/, help: 'GitHub → Settings → Developer settings → OAuth Apps.' },
  { name: 'STUDIO_GITHUB_CLIENT_SECRET', where: ['worker'], shape: /^\S{20,}$/, help: 'Same OAuth app → Generate a new client secret.' }
]

const args = process.argv.slice(2)
const statusOnly = args.includes('--status')
const sync = args.includes('--sync')
const replace = args.includes('--replace') ? args[args.indexOf('--replace') + 1] : null

// ---- local .env (names only) ------------------------------------------------
const ENV = '.env'
const envText = () => (existsSync(ENV) ? readFileSync(ENV, 'utf8') : '')
const envHas = name => new RegExp(`^${name}=\\S`, 'm').test(envText())
const envGet = name => envText().match(new RegExp(`^${name}=["']?([^"'\\n]*)`, 'm'))?.[1] ?? ''
function envSet(name, value) {
  const text = envText()
  const line = `${name}=${value}`
  const next = new RegExp(`^${name}=.*$`, 'm').test(text)
    ? text.replace(new RegExp(`^${name}=.*$`, 'm'), line)
    : `${text}${text && !text.endsWith('\n') ? '\n' : ''}${line}\n`
  writeFileSync(ENV, next, { mode: 0o600 })
  chmodSync(ENV, 0o600)
}

// ---- Worker secrets (names only) ---------------------------------------------
function workerNames() {
  const r = spawnSync('npx', ['wrangler', 'secret', 'list'], { encoding: 'utf8' })
  if (r.status !== 0) return null
  return new Set([...r.stdout.matchAll(/"name":\s*"([A-Z0-9_]+)"/g)].map(m => m[1]))
}
function workerPut(name, value) {
  return new Promise((resolve) => {
    // The value goes in on stdin: never on the command line or in a log.
    const p = spawn('npx', ['wrangler', 'secret', 'put', name], { stdio: ['pipe', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => {
      err += d
    })
    p.stdin.end(`${value}\n`)
    p.on('close', code => resolve(code === 0 ? null : err.split('\n').find(l => /error/i.test(l)) ?? `exit ${code}`))
  })
}

// ---- hidden prompt -------------------------------------------------------------
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => {
      if (s.includes(question)) rl.output.write(s)
    }
    rl.question(question, (answer) => {
      rl.output.write('\n')
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ---- run ----------------------------------------------------------------------
if (!statusOnly && !sync && !process.stdin.isTTY) {
  console.error('Run this in your own terminal (it needs hidden input): pnpm keys')
  process.exit(1)
}
const worker = workerNames()
if (!worker) console.log('! Could not read Worker secrets (run `npx wrangler login` first). Only .env will be updated.\n')

const mark = ok => (ok ? '✓' : '·')
console.log('Key                          .env  Worker')
for (const k of KEYS) {
  const e = k.where.includes('env') ? mark(envHas(k.name)) : ' '
  const w = k.where.includes('worker') ? (worker ? mark(worker.has(k.name)) : '?') : ' '
  console.log(`${k.name.padEnd(28)} ${e}     ${w}`)
}
console.log('\n✓ set   · missing   (values are never shown)\n')
if (statusOnly) process.exit(0)

if (sync) {
  if (!worker) process.exit(1)
  for (const k of KEYS) {
    if (!k.where.includes('worker') || worker.has(k.name) || !envHas(k.name)) continue
    const value = envGet(k.name)
    if (!k.shape.test(value)) {
      console.log(`${k.name}: the .env value does not look right, not copied`)
      continue
    }
    const err = await workerPut(k.name, value)
    console.log(err ? `${k.name}: ✗ ${err}` : `${k.name}: ✓ copied to the Worker`)
  }
  process.exit(0)
}

for (const k of KEYS) {
  const needEnv = k.where.includes('env') && (!envHas(k.name) || replace === k.name)
  const needWorker = k.where.includes('worker') && worker && (!worker.has(k.name) || replace === k.name)
  if (!needEnv && !needWorker) continue
  if (replace && replace !== k.name) continue

  console.log(`${k.name}\n  ${k.help}`)
  let value = await askHidden('  Paste value (hidden, Enter to skip): ')
  if (!value && k.generate) {
    value = randomBytes(32).toString('hex')
    console.log('  Generated a new random value.')
  }
  if (!value) {
    console.log('  Skipped.\n')
    continue
  }
  if (!k.shape.test(value)) {
    console.log('  That does not look like the right kind of key. Skipped, nothing saved.\n')
    continue
  }
  if (/_live_/.test(value)) console.log('  Note: this is a LIVE key. Real payments will be charged.')
  if (needEnv) {
    envSet(k.name, value)
    console.log('  ✓ saved to .env')
  }
  if (needWorker) {
    const err = await workerPut(k.name, value)
    console.log(err ? `  ✗ Worker: ${err}` : '  ✓ saved on the Worker')
  }
  console.log('')
}
console.log('Done. Check again any time with: pnpm keys --status')
