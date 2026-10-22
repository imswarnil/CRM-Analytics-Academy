#!/usr/bin/env node
// Set up a CRM Analytics org for the course in one command:
//
//   1. assign the two CRM Analytics Plus permission sets to the logged-in user
//   2. deploy salesforce/academy/ — the "Academy Analytics" app, and any course
//      builds (dashboards, lenses, recipes) committed there
//   3. load the 21 Academy CSVs from public/sample-data/academy/ into that app
//      as datasets named academy_<file>, with field types set explicitly
//
// Needs only Node 18+ and the Salesforce CLI (`sf`). No npm install.
//
//   sf org login web --alias my-crma
//   node scripts/academy-setup.mjs --target-org my-crma
//
// Flags:
//   --target-org <alias>   org to set up (default: the CLI's default org)
//   --only accounts,leads  load just these files
//   --enable-null-measures turn on Setup → Analytics → Settings → "Null Measure
//                          Handling in Datasets" first, so blank numbers (a case
//                          with no CSAT survey) load as null instead of 0
//   --skip-permsets        do not assign permission sets
//   --skip-deploy          do not deploy salesforce/academy/
//   --skip-data            do not load datasets
//   --dry-run              print what would happen and change nothing
//
// Safe to re-run: datasets are overwritten in place, the app deploy is idempotent,
// and an already-assigned permission set is reported, not treated as an error.
// It writes only to the Academy Analytics app and academy_* datasets — the
// sample apps and datasets that ship with the org are never touched.

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PROJECT = join(HERE, '..')
const DATA_DIR = join(PROJECT, '..', 'public', 'sample-data', 'academy')
const APP = 'Academy_Analytics'
const PERMSETS = ['EinsteinAnalyticsPlusAdmin', 'EinsteinAnalyticsPlusUser']
const PART_BYTES = 8 * 1024 * 1024

const args = process.argv.slice(2)
const flag = name => args.includes(`--${name}`)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const targetOrg = opt('target-org') || opt('o')
const only = opt('only')?.split(',').map(s => s.trim().replace(/\.csv$/, ''))
const dryRun = flag('dry-run')

const step = msg => console.log(`\n▸ ${msg}`)
const info = msg => console.log(`  ${msg}`)

function sf(cmdArgs, { json = true } = {}) {
  const full = [...cmdArgs, ...(targetOrg ? ['--target-org', targetOrg] : [])]
  if (json) full.push('--json')
  try {
    const out = execFileSync('sf', full, { cwd: PROJECT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })
    return json ? JSON.parse(out) : out
  } catch (err) {
    if (json && err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {}
    }
    throw err
  }
}

// --- org -------------------------------------------------------------------

step('Checking the org')
let org
try {
  org = sf(['org', 'display']).result
} catch {}
if (!org?.username || org.connectedStatus && org.connectedStatus !== 'Connected') {
  console.error('  Could not reach an org. Log in first:  sf org login web --alias my-crma')
  process.exit(1)
}
const API = `/services/data/v${org.apiVersion || '62.0'}`
info(`${org.username} · ${org.instanceUrl}`)

// Every call goes through `sf api request rest`, which signs it with the CLI's
// own session. The script never sees an access token, so it cannot leak one.
async function api(method, path, body, attempt = 1) {
  let out
  try {
    out = callSf(method, path, body)
  } catch (err) {
    // A non-2xx response exits non-zero but still prints the response.
    const printed = String(err.stdout || '').replace(/\x1b\[[0-9;]*m/g, '')
    if (/^HTTP\/[\d.]+ \d{3}/m.test(printed)) return parseResponse(method, path, printed)
    // The CLI occasionally reports a bare "fetch failed" on a flaky connection.
    if (attempt < 3 && /fetch failed|ECONNRESET|ETIMEDOUT/i.test(String(err.stderr || err.message))) {
      await new Promise(r => setTimeout(r, 2000 * attempt))
      return api(method, path, body, attempt + 1)
    }
    throw new Error(`${method} ${path}: ${String(err.stderr || err.message).replace(/.*update available.*\n?/g, '').trim()}`)
  }
  return parseResponse(method, path, out)
}

function callSf(method, path, body) {
  return execFileSync('sf', [
    'api', 'request', 'rest', `${API}${path}`, '-X', method, '-i',
    '-H', 'Content-Type:application/json',
    ...(body ? ['-b', '-'] : []),
    ...(targetOrg ? ['--target-org', targetOrg] : [])
  ], {
    cwd: PROJECT,
    input: body ? JSON.stringify(body) : undefined,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', SF_DISABLE_AUTOUPDATE: 'true' },
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  }).replace(/\x1b\[[0-9;]*m/g, '')
}

function parseResponse(method, path, out) {
  const status = Number(out.match(/^HTTP\/[\d.]+ (\d{3})/m)?.[1])
  // `-i` prints the status line and headers, then the body with no blank line between.
  const lines = out.split(/\r?\n/)
  const start = lines.findIndex((l, i) => i > 0 && !/^[\w-]+: /.test(l))
  const text = start < 0 ? '' : lines.slice(start).join('\n').trim()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!(status >= 200 && status < 300)) {
    const msg = Array.isArray(data) ? data.map(e => e.message).join('; ') : text.slice(0, 300)
    throw new Error(`${method} ${path} → ${status}: ${msg}`)
  }
  return data
}

try {
  await api('GET', '/wave')
  info('CRM Analytics is enabled')
} catch (err) {
  if (/→ 404/.test(err.message)) {
    console.error('  CRM Analytics is not available in this org. Use a CRM Analytics Developer Edition org:')
    console.error('  https://trailhead.salesforce.com/promo/orgs/analytics-de')
  } else {
    console.error(`  ${err.message}`)
  }
  process.exit(1)
}

// --- 0. null measure handling (opt-in) --------------------------------------

if (flag('enable-null-measures')) {
  step('Turning on Null Measure Handling in Datasets')
  if (dryRun) {
    info('would deploy Analytics settings: replaceBlankMeasuresWithNulls = true')
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'academy-settings-'))
    mkdirSync(join(dir, 'settings'))
    writeFileSync(join(dir, 'package.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>Analytics</members><name>Settings</name></types><version>${org.apiVersion || '62.0'}</version></Package>`)
    writeFileSync(join(dir, 'settings', 'Analytics.settings'), `<?xml version="1.0" encoding="UTF-8"?>
<AnalyticsSettings xmlns="http://soap.sforce.com/2006/04/metadata"><replaceBlankMeasuresWithNulls>true</replaceBlankMeasuresWithNulls></AnalyticsSettings>`)
    const r = sf(['project', 'deploy', 'start', '--metadata-dir', dir, '--wait', '10'])
    rmSync(dir, { recursive: true, force: true })
    if (r.status !== 0) {
      console.error(`  Could not change the setting: ${r.message}`)
      process.exit(1)
    }
    info('On — blank numbers will load as null')
  }
}

// --- 1. permission sets ------------------------------------------------------

if (!flag('skip-permsets')) {
  step('Assigning CRM Analytics Plus Admin + User')
  for (const name of PERMSETS) {
    if (dryRun) {
      info(`would assign ${name}`)
      continue
    }
    const r = sf(['org', 'assign', 'permset', '--name', name])
    const failure = r.result?.failures?.[0]?.message || (r.status !== 0 ? r.message : '')
    if (!failure) info(`${name} assigned`)
    else if (/duplicate|already/i.test(failure)) info(`${name} already assigned`)
    else info(`${name}: ${failure}`)
  }
}

// --- 2. deploy the app and any committed builds ------------------------------

if (!flag('skip-deploy')) {
  step('Deploying salesforce/academy/ (the Academy Analytics app and course builds)')
  if (dryRun) {
    info('would run: sf project deploy start --source-dir academy')
  } else {
    // The app has to exist before datasets can be loaded into it, and datasets
    // have to exist before a dashboard that reads them can deploy. So: the app
    // first, then the data, then everything else in academy/.
    const appOnly = sf(['project', 'deploy', 'start', '--metadata', `WaveApplication:${APP}`, '--wait', '10'])
    if (appOnly.status !== 0) {
      console.error(`  App deploy failed: ${appOnly.message}`)
      process.exit(1)
    }
    info('Academy Analytics app deployed')
  }
}

// --- 3. load the datasets ----------------------------------------------------

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const label = s => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/_/g, ' ')
const titleCase = s => s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

// Types are set explicitly rather than inferred by CRM Analytics, so the three
// traps the set-up lesson warns about cannot happen: dates stay dates, IDs
// (ACC-1000, CMP-002) stay dimensions, and amounts keep their decimal scale.
function schemaFor(alias, header, rows, { zeroDefaults = false } = {}) {
  const fields = header.map((name, col) => {
    const values = rows.map(r => r[col]).filter(v => v !== undefined && v !== '')
    const base = { fullyQualifiedName: `${alias}.${name}`, name, label: label(name) }
    if (values.length && values.every(v => /^\d{4}-\d{2}-\d{2}$/.test(v))) {
      return { ...base, type: 'Date', format: 'yyyy-MM-dd', fiscalMonthOffset: 0 }
    }
    if (values.length && values.every(v => /^-?\d+(\.\d+)?$/.test(v)) && !/Id$/.test(name)) {
      const scale = Math.max(0, ...values.map(v => (v.split('.')[1] || '').length))
      const field = { ...base, type: 'Numeric', precision: 18, scale }
      if (zeroDefaults) field.defaultValue = '0'
      field.hasBlanks = values.length < rows.length
      return field
    }
    return { ...base, type: 'Text' }
  })
  return {
    fileFormat: { charsetName: 'UTF-8', fieldsDelimitedBy: ',', fieldsEnclosedBy: '"', linesTerminatedBy: '\n', numberOfLinesToIgnore: 1 },
    objects: [{ connector: 'CSV', fullyQualifiedName: alias, label: titleCase(alias), name: alias, fields }]
  }
}

if (!flag('skip-data')) {
  if (!existsSync(DATA_DIR)) {
    console.error(`  Dataset folder not found: ${DATA_DIR}`)
    process.exit(1)
  }
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.csv')).sort()
    .filter(f => !only || only.includes(basename(f, '.csv')))
  step(`Loading ${files.length} dataset${files.length === 1 ? '' : 's'} into Academy Analytics`)

  const jobs = []
  const zeroed = []
  let nullsRefused = false
  for (const file of files) {
    const name = basename(file, '.csv')
    const alias = `academy_${name}`
    const bytes = readFileSync(join(DATA_DIR, file))
    const [header, ...rows] = parseCsv(bytes.toString('utf8')).filter(r => r.length > 1 || r[0])
    let schema = schemaFor(alias, header, rows, { zeroDefaults: nullsRefused })
    const types = schema.objects[0].fields.reduce((n, f) => ({ ...n, [f.type]: (n[f.type] || 0) + 1 }), {})
    const summary = `${rows.length} rows · ${Object.entries(types).map(([t, n]) => `${n} ${t.toLowerCase()}`).join(', ')}`
    if (dryRun) {
      info(`${alias.padEnd(32)} ${summary}`)
      continue
    }
    const create = sch => api('POST', '/sobjects/InsightsExternalData', {
      Format: 'Csv',
      EdgemartAlias: alias,
      EdgemartLabel: `Academy · ${titleCase(name)}`,
      EdgemartContainer: APP,
      Operation: 'Overwrite',
      Action: 'None',
      MetadataJson: Buffer.from(JSON.stringify(sch, (k, v) => k === 'hasBlanks' ? undefined : v)).toString('base64')
    })
    let job
    try {
      job = await create(schema)
    } catch (err) {
      // Without null measure handling the org demands a default for every
      // numeric field. Fall back to 0 and say which columns that distorts.
      if (nullsRefused || !/must have a default value/.test(err.message)) throw err
      nullsRefused = true
      schema = schemaFor(alias, header, rows, { zeroDefaults: true })
      job = await create(schema)
    }
    if (nullsRefused) {
      for (const f of schema.objects[0].fields.filter(f => f.hasBlanks)) zeroed.push(`${alias}.${f.name}`)
    }
    for (let part = 0, n = 1; part < bytes.length; part += PART_BYTES, n++) {
      await api('POST', '/sobjects/InsightsExternalDataPart', {
        InsightsExternalDataId: job.id,
        PartNumber: n,
        DataFile: bytes.subarray(part, part + PART_BYTES).toString('base64')
      })
    }
    await api('PATCH', `/sobjects/InsightsExternalData/${job.id}`, { Action: 'Process' })
    jobs.push({ alias, id: job.id, rows: rows.length })
    info(`${alias.padEnd(32)} ${summary} — queued`)
  }

  if (jobs.length) {
    step('Waiting for CRM Analytics to process the uploads')
    const done = new Map()
    const deadline = Date.now() + 15 * 60 * 1000
    while (done.size < jobs.length && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 5000))
      const ids = jobs.filter(j => !done.has(j.id)).map(j => `'${j.id}'`).join(',')
      const q = await api('GET', `/query?q=${encodeURIComponent(`SELECT Id, Status, StatusMessage FROM InsightsExternalData WHERE Id IN (${ids})`)}`)
      for (const rec of q.records) {
        if (['Completed', 'CompletedWithWarnings', 'Failed', 'NotProcessed'].includes(rec.Status)) {
          const job = jobs.find(j => j.id.startsWith(rec.Id.slice(0, 15)))
          done.set(job.id, rec)
          const mark = rec.Status.startsWith('Completed') ? '✓' : '✗'
          info(`${mark} ${job.alias.padEnd(30)} ${rec.Status}${rec.StatusMessage && !rec.Status.startsWith('Completed') ? ` — ${rec.StatusMessage}` : ''}`)
        }
      }
    }
    const failed = [...done.values()].filter(r => !r.Status.startsWith('Completed')).length
    const pending = jobs.length - done.size
    if (pending) info(`${pending} still processing — check Data Manager → Monitor`)
    if (failed) process.exitCode = 1
  }

  if (zeroed.length) {
    step('Warning: blank numbers were loaded as 0')
    info('This org has "Null Measure Handling in Datasets" turned off, so CRM Analytics')
    info('requires a default for every number. These columns have real blanks that now read 0,')
    info('which pulls averages down (a case with no survey is not a CSAT of 0):')
    for (const z of zeroed) info(`  ${z}`)
    info('Fix: re-run with --enable-null-measures (or turn it on in Setup → Analytics → Settings).')
  }
}

// --- 4. the rest of academy/ (dashboards etc.), now the datasets exist -------

if (!flag('skip-deploy') && !dryRun) {
  const builds = readdirSync(join(PROJECT, 'academy', 'main', 'default', 'wave')).filter(f => !f.endsWith('.wapp-meta.xml'))
  if (builds.length) {
    step(`Deploying ${builds.length} course build file${builds.length === 1 ? '' : 's'}`)
    const r = sf(['project', 'deploy', 'start', '--source-dir', 'academy', '--wait', '10'])
    info(r.status === 0 ? 'Deployed' : `Deploy failed: ${r.message}`)
    if (r.status !== 0) process.exitCode = 1
  }
}

step(dryRun ? 'Dry run — nothing was changed.' : 'Done. Open Analytics Studio → Academy Analytics.')
