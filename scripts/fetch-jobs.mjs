#!/usr/bin/env node
/**
 * Refresh the jobs dataset that /jobs renders.
 *
 *   node scripts/fetch-jobs.mjs
 *
 * Pulls CRM Analytics-related roles from two public job APIs, merges them, and
 * writes app/data/jobs.json. The page imports that file statically, so the
 * dataset is baked in at build time; .github/workflows/jobs.yml runs this
 * daily and commits the result back, which triggers the normal deploy.
 *
 * Providers:
 *   - Remotive  — keyless; remote-only listings.
 *   - Adzuna    — only when ADZUNA_APP_ID + ADZUNA_APP_KEY are set (free keys
 *                 from developer.adzuna.com); skipped silently otherwise.
 *
 * Both search endpoints are fuzzy, so every job is re-checked against the
 * product's real names before it is kept. A provider failing mid-run is a
 * warning, not a failure; only when every provider fails and no dataset exists
 * yet does the script have nothing to write.
 */

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_FILE = join(ROOT, 'app', 'data', 'jobs.json')

// The search terms sent to the providers…
const SEARCH_TERMS = ['CRM Analytics', 'Tableau CRM', 'Einstein Analytics']

// …and the phrases a job must actually mention (title or description) to be
// kept. Broader than the search terms: the product has carried five names.
const KEEP_PHRASES = [
  'crm analytics',
  'tableau crm',
  'einstein analytics',
  'einstein discovery',
  'wave analytics'
]

const ADZUNA_COUNTRIES = ['us', 'gb', 'in', 'ca', 'au']
const MAX_JOBS = 120

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || ''
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || ''

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mentionsProduct = (job) => {
  const haystack = `${job.title || ''} ${job.description || ''}`.toLowerCase()
  return KEEP_PHRASES.some(phrase => haystack.includes(phrase))
}

const toIsoDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'crm-analytics-academy-jobs/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Providers — each returns normalized jobs and never throws; a failed request
// is a warning so one provider going down cannot kill the run.
// ---------------------------------------------------------------------------

async function fetchRemotive() {
  const jobs = []
  let failures = 0
  for (const term of SEARCH_TERMS) {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(term)}`
    try {
      const data = await getJson(url)
      for (const job of data.jobs || []) {
        if (!mentionsProduct(job)) continue
        jobs.push({
          id: `remotive-${job.id}`,
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location || 'Remote',
          remote: true,
          url: job.url,
          postedAt: toIsoDate(job.publication_date),
          source: 'remotive'
        })
      }
    } catch (err) {
      failures++
      console.warn(`⚠ Remotive "${term}" failed: ${err.message}`)
    }
  }
  return { jobs, ok: failures < SEARCH_TERMS.length }
}

async function fetchAdzuna() {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.log('Adzuna: ADZUNA_APP_ID / ADZUNA_APP_KEY not set — skipping.')
    return { jobs: [], ok: false }
  }
  const jobs = []
  let attempts = 0
  let failures = 0
  for (const country of ADZUNA_COUNTRIES) {
    for (const term of SEARCH_TERMS) {
      attempts++
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`
        + `?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}`
        + `&results_per_page=50&what_phrase=${encodeURIComponent(term)}`
      try {
        const data = await getJson(url)
        for (const job of data.results || []) {
          if (!mentionsProduct(job)) continue
          const location = job.location?.display_name || country.toUpperCase()
          jobs.push({
            id: `adzuna-${job.id}`,
            title: job.title,
            company: job.company?.display_name || 'Unknown',
            location,
            remote: /remote/i.test(`${job.title} ${location}`),
            url: job.redirect_url,
            postedAt: toIsoDate(job.created),
            source: 'adzuna'
          })
        }
      } catch (err) {
        failures++
        console.warn(`⚠ Adzuna ${country} "${term}" failed: ${err.message}`)
      }
    }
  }
  return { jobs, ok: failures < attempts }
}

// ---------------------------------------------------------------------------
// Merge, dedupe, write
// ---------------------------------------------------------------------------

const [remotive, adzuna] = await Promise.all([fetchRemotive(), fetchAdzuna()])

if (!remotive.ok && !adzuna.ok && existsSync(OUT_FILE)) {
  console.warn('⚠ Every provider failed — keeping the existing dataset untouched.')
  process.exit(0)
}

const seen = new Set()
const jobs = []
for (const job of [...remotive.jobs, ...adzuna.jobs]) {
  const key = `${job.title}::${job.company}`.toLowerCase()
  if (seen.has(key)) continue
  seen.add(key)
  jobs.push(job)
}

jobs.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
const capped = jobs.slice(0, MAX_JOBS)

await mkdir(dirname(OUT_FILE), { recursive: true })
await writeFile(OUT_FILE, `${JSON.stringify({ updatedAt: new Date().toISOString(), jobs: capped }, null, 2)}\n`)

console.log(`Wrote ${capped.length} jobs (${remotive.jobs.length} remotive, ${adzuna.jobs.length} adzuna) → app/data/jobs.json`)
