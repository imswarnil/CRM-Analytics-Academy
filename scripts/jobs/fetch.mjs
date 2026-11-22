#!/usr/bin/env node
/**
 * Daily CRM Analytics jobs feed → public/jobs.json (read by /jobs and the home
 * page in the browser; the Worker does no work).
 *
 *   node scripts/jobs/fetch.mjs            fetch, merge, write
 *   node scripts/jobs/fetch.mjs --dry      fetch and print, write nothing
 *   node scripts/jobs/fetch.mjs --page <url>   test the JobPosting reader on one page
 *
 * Only sources with a public API or a public job-board JSON are used. LinkedIn
 * and Indeed have no public job API and their terms forbid scraping, so they
 * are not here. Keyless sources always run; keyed ones run when their key is
 * in the environment (GitHub → Settings → Secrets → Actions):
 *
 *   keyless   Remotive, Arbeitnow, Jobicy, Himalayas, company boards in
 *             scripts/jobs/boards.json (Workday, Greenhouse, Lever, Ashby)
 *   ADZUNA_APP_ID + ADZUNA_APP_KEY   Adzuna, 12 countries (free tier)
 *   JOOBLE_KEY                       Jooble, worldwide (free key on request)
 *   SERPAPI_KEY                      the whole web: Google Jobs (which indexes
 *                                    LinkedIn, Indeed, Naukri, Glassdoor and
 *                                    company sites) + a web search of every
 *                                    applicant-tracking system, read through
 *                                    the schema.org JobPosting on each page
 *
 * A posting is kept only if its title or description names CRM Analytics (or
 * its earlier names) — "Salesforce" alone is not enough. Each job links to its
 * original posting. Jobs stay 30 days after they were posted; the feed is a
 * merge, so a source that is down for a day loses nothing.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'public/jobs.json'
const KEEP_DAYS = 30
const DRY = process.argv.includes('--dry')
const UA = 'crm-analytics-academy-jobs/1.0 (+https://crmanalytics.imswarnil.com/jobs)'

// What counts as a CRM Analytics job.
const MATCH = /\b(CRM Analytics|Tableau CRM|Einstein Analytics|Wave Analytics|SAQL|Analytics Studio|CRMA)\b/i
const SKILLS = [
  ['SAQL', /\bSAQL\b/i],
  ['Recipes', /\b(recipes?|data prep)\b/i],
  ['Dataflows', /\bdataflows?\b/i],
  ['Bindings', /\bbindings?\b/i],
  ['Einstein Discovery', /Einstein Discovery/i],
  ['Data Cloud', /Data Cloud/i],
  ['Tableau', /\bTableau\b(?! CRM)/i],
  ['Apex', /\bApex\b/i],
  ['SOQL', /\bSOQL\b/i],
  ['Security predicates', /security predicates?|row[- ]level security/i],
  ['Sales Cloud', /Sales Cloud/i],
  ['Service Cloud', /Service Cloud/i],
  ['SQL', /\bSQL\b/]
]
const COUNTRY_NAMES = {
  'united states': 'US', 'usa': 'US', 'india': 'IN', 'united kingdom': 'GB', 'uk': 'GB', 'germany': 'DE',
  'france': 'FR', 'canada': 'CA', 'australia': 'AU', 'ireland': 'IE', 'spain': 'ES', 'netherlands': 'NL',
  'poland': 'PL', 'japan': 'JP', 'singapore': 'SG', 'brazil': 'BR', 'mexico': 'MX', 'italy': 'IT',
  'switzerland': 'CH', 'united arab emirates': 'AE', 'israel': 'IL', 'portugal': 'PT', 'philippines': 'PH'
}
const US_STATES = /\b(Alabama|Arizona|California|Colorado|Florida|Georgia|Illinois|Indiana|Massachusetts|Michigan|Minnesota|New York|North Carolina|Ohio|Oregon|Pennsylvania|Texas|Virginia|Washington|Remote US)\b/i

// ---- helpers -----------------------------------------------------------------
const strip = html => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&amp;|&lt;|&gt;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim()
const day = (d) => {
  const t = d ? new Date(d) : null
  return t && !Number.isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
}
const hash = s => createHash('sha256').update(s).digest('hex').slice(0, 16)
function countryOf(text) {
  const low = String(text ?? '').toLowerCase()
  for (const [name, code] of Object.entries(COUNTRY_NAMES)) if (low.includes(name)) return code
  if (US_STATES.test(text ?? '')) return 'US'
  return undefined
}
function levelOf(title) {
  if (/\b(principal|lead|architect|head|director|manager)\b/i.test(title)) return 'lead'
  if (/\b(senior|sr\.?|staff|iii)\b/i.test(title)) return 'senior'
  if (/\b(junior|jr\.?|associate|intern|graduate|entry|trainee)\b/i.test(title)) return 'junior'
  return 'mid'
}
function job({ title, company, location, remote, url, posted, source, text }) {
  const all = `${title} ${text ?? ''}`
  if (!MATCH.test(all) || !url) return null
  let loc = strip(location) || (remote ? 'Remote' : '')
  const parts = loc.split(/\s*,\s*/)
  if (parts.length > 3) loc = `${remote ? 'Remote · ' : ''}${parts.length} countries`
  return {
    id: hash(url.replace(/[?#].*$/, '')),
    title: strip(title).slice(0, 140),
    company: strip(company).slice(0, 80) || 'Unknown',
    location: loc.slice(0, 80),
    remote: Boolean(remote || /\bremote\b/i.test(loc)),
    country: countryOf(loc),
    level: levelOf(title),
    posted: day(posted),
    url,
    source,
    skills: SKILLS.filter(([, re]) => re.test(all)).map(([s]) => s).slice(0, 6)
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function get(url, init = {}) {
  // Polite: one retry after a pause when a board says "too many requests".
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { ...init, headers: { 'user-agent': UA, 'accept': 'application/json', ...init.headers }, signal: AbortSignal.timeout(20000) })
    if (res.status === 429 && attempt < 2) {
      await sleep(15000 * (attempt + 1))
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`)
    return res.json()
  }
}
const QUERIES = ['CRM Analytics', 'Tableau CRM', 'Einstein Analytics']
const PLACES = ['United States', 'India', 'United Kingdom', 'Remote', 'Canada', 'Australia', 'Germany', 'Singapore', 'Ireland', 'Netherlands', 'France', 'Japan']
const ATS_SITES = ['boards.greenhouse.io', 'job-boards.greenhouse.io', 'jobs.lever.co', 'myworkdayjobs.com', 'jobs.ashbyhq.com', 'apply.workable.com', 'jobs.smartrecruiters.com', 'careers.icims.com', 'jobs.jobvite.com', 'recruitee.com', 'bamboohr.com/careers', 'oraclecloud.com', 'successfactors.com']

// Today's slice of a list, so a daily run walks the whole list over days.
function rotate(list, n) {
  const start = (Math.floor(Date.now() / 864e5) * n) % list.length
  return Array.from({ length: Math.min(n, list.length) }, (_, i) => list[(start + i) % list.length])
}
// "3 days ago" / "12 hours ago" → a date.
function agoToDate(s) {
  const m = String(s ?? '').match(/(\d+)\+?\s*(hour|day|week|month)/i)
  if (!m) return undefined
  const per = { hour: 36e5, day: 864e5, week: 6048e5, month: 2592e6 }[m[2].toLowerCase()]
  return Date.now() - Number(m[1]) * per
}
// Any job page: the schema.org JobPosting it publishes for search engines.
async function jobsFromPage(url) {
  // Greenhouse and Workday draw their pages with JavaScript: read the posting
  // from their public job APIs instead.
  const u = new URL(url)
  const gh = /greenhouse\.io$/.test(u.hostname) && u.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/)
  if (gh) {
    const j = await get(`https://boards-api.greenhouse.io/v1/boards/${gh[1]}/jobs/${gh[2]}`)
    return [job({ title: j.title, company: j.company_name || gh[1], location: j.location?.name, url: j.absolute_url || url, posted: j.first_published || j.updated_at, source: 'greenhouse.io', text: strip(String(j.content ?? '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')) })]
  }
  const wd = /myworkdayjobs\.com$/.test(u.hostname) && u.pathname.match(/^\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/]+)(\/job\/.+)$/)
  if (wd) {
    const info = (await get(`https://${u.hostname}/wday/cxs/${u.hostname.split('.')[0]}/${wd[1]}${wd[2]}`)).jobPostingInfo
    return info ? [job({ title: info.title, company: info.hiringOrganization?.name || u.hostname.split('.')[0], location: info.location, remote: /remote/i.test(info.remoteType ?? ''), url: info.externalUrl || url, posted: info.startDate, source: u.hostname, text: strip(info.jobDescription) })] : []
  }
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept': 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(15000) })
  if (!res.ok || !/html/i.test(res.headers.get('content-type') ?? '')) return []
  const html = (await res.text()).slice(0, 2_000_000)
  const items = []
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk)
        if (!n || typeof n !== 'object') return
        if ([].concat(n['@type']).includes('JobPosting')) items.push(n)
        if (n['@graph']) walk(n['@graph'])
      }
      walk(JSON.parse(m[1].trim()))
    } catch {
      // Not valid JSON-LD: skip this block.
    }
  }
  return items.map((p) => {
    const name = v => (v && typeof v === 'object' ? v.name : v)
    const locs = [].concat(p.jobLocation ?? []).map(l => [l?.address?.addressLocality, l?.address?.addressRegion, name(l?.address?.addressCountry)].filter(x => typeof x === 'string' && x).join(', ')).filter(Boolean)
    const org = name(p.hiringOrganization)
    return job({ title: p.title, company: org || new URL(url).hostname, location: locs.join(' · '), remote: p.jobLocationType === 'TELECOMMUTE', url: p.url || url, posted: p.datePosted, source: new URL(url).hostname.replace(/^www\./, ''), text: strip(p.description) })
  })
}

// ---- sources -----------------------------------------------------------------
const sources = {
  async remotive() {
    const out = []
    for (const q of ['salesforce', 'crm analytics', 'tableau']) {
      const d = await get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}`)
      for (const j of d.jobs ?? []) out.push(job({ title: j.title, company: j.company_name, location: j.candidate_required_location, remote: true, url: j.url, posted: j.publication_date, source: 'remotive.com', text: strip(j.description) }))
    }
    return out
  },
  async arbeitnow() {
    const out = []
    for (let page = 1; page <= 5; page++) {
      const d = await get(`https://www.arbeitnow.com/api/job-board-api?page=${page}`)
      for (const j of d.data ?? []) out.push(job({ title: j.title, company: j.company_name, location: j.location, remote: j.remote, url: j.url, posted: j.created_at * 1000, source: 'arbeitnow.com', text: strip(j.description) }))
      if (!d.links?.next) break
    }
    return out
  },
  async jobicy() {
    const d = await get('https://jobicy.com/api/v2/remote-jobs?count=50&tag=salesforce')
    return (d.jobs ?? []).map(j => job({ title: j.jobTitle, company: j.companyName, location: j.jobGeo, remote: true, url: j.url, posted: j.pubDate, source: 'jobicy.com', text: strip(`${j.jobExcerpt} ${j.jobDescription}`) }))
  },
  async himalayas() {
    const out = []
    for (const q of QUERIES) {
      const d = await get(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}`)
      for (const j of d.jobs ?? []) out.push(job({ title: j.title, company: j.companyName, location: (j.locationRestrictions ?? []).join(', ') || 'Remote', remote: true, url: j.applicationLink || j.guid, posted: j.pubDate ? j.pubDate * 1000 : undefined, source: 'himalayas.app', text: strip(`${j.excerpt} ${j.description}`) }))
    }
    return out
  },
  async adzuna() {
    const id = process.env.ADZUNA_APP_ID
    const key = process.env.ADZUNA_APP_KEY
    if (!id || !key) return 'skipped (no ADZUNA_APP_ID/ADZUNA_APP_KEY)'
    const out = []
    for (const c of ['us', 'gb', 'in', 'ca', 'au', 'de', 'fr', 'nl', 'pl', 'sg', 'es', 'it']) {
      const what = encodeURIComponent('"CRM Analytics" OR "Tableau CRM" OR "Einstein Analytics"')
      const d = await get(`https://api.adzuna.com/v1/api/jobs/${c}/search/1?app_id=${id}&app_key=${key}&results_per_page=50&max_days_old=${KEEP_DAYS}&what_or=${encodeURIComponent('CRM Analytics Tableau Einstein')}&what=${what}`).catch(() => ({ results: [] }))
      for (const j of d.results ?? []) out.push(job({ title: j.title, company: j.company?.display_name, location: j.location?.display_name, url: j.redirect_url, posted: j.created, source: 'adzuna', text: strip(j.description) }))
    }
    return out
  },
  async jooble() {
    const key = process.env.JOOBLE_KEY
    if (!key) return 'skipped (no JOOBLE_KEY)'
    const out = []
    for (const q of QUERIES) {
      const d = await get(`https://jooble.org/api/${key}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ keywords: `"${q}"`, page: 1 }) })
      for (const j of d.jobs ?? []) out.push(job({ title: j.title, company: j.company, location: j.location, url: j.link, posted: j.updated, source: j.source || 'jooble', text: strip(j.snippet) }))
    }
    return out
  },
  // Google Jobs through SerpApi: Google's own job index, which already holds
  // LinkedIn, Indeed, Glassdoor, Naukri and company career pages worldwide.
  // SERPAPI_DAILY searches a day (default 6), rotating query × place by date,
  // so the free plan's monthly allowance lasts the month.
  async googlejobs() {
    const key = process.env.SERPAPI_KEY
    if (!key) return 'skipped (no SERPAPI_KEY)'
    const combos = QUERIES.flatMap(q => PLACES.map(p => [q, p]))
    const out = []
    for (const [q, place] of rotate(combos, Number(process.env.SERPAPI_DAILY || 6))) {
      const params = new URLSearchParams({ engine: 'google_jobs', q: `"${q}"`, api_key: key, hl: 'en', ...(place === 'Remote' ? { ltype: '1' } : { location: place }) })
      const d = await get(`https://serpapi.com/search.json?${params}`).catch((e) => {
        console.log(`  google jobs ${q} / ${place}: ${e.message}`)
        return {}
      })
      for (const j of d.jobs_results ?? []) {
        const links = j.apply_options ?? []
        // Prefer the employer's own page, then any board.
        const best = links.find(l => !/linkedin|indeed|glassdoor|ziprecruiter|naukri|monster|simplyhired/i.test(l.link)) ?? links[0]
        out.push(job({ title: j.title, company: j.company_name, location: j.location, remote: j.detected_extensions?.work_from_home, url: best?.link ?? j.share_link, posted: agoToDate(j.detected_extensions?.posted_at), source: best?.title ? `${best.title} via Google Jobs` : 'Google Jobs', text: j.description }))
      }
    }
    return out
  },

  // The open web: search for postings on any applicant-tracking system or
  // careers page from the last week, then read the schema.org JobPosting that
  // job pages publish for search engines. Uses the same SERPAPI_KEY (Google
  // web search); WEB_PAGES caps how many pages are read (default 40).
  async web() {
    const key = process.env.SERPAPI_KEY
    if (!key) return 'skipped (no SERPAPI_KEY)'
    const ats = ATS_SITES.map(s => `site:${s}`).join(' OR ')
    const searches = [`("CRM Analytics" OR "Tableau CRM" OR "Einstein Analytics") (${ats})`, '("CRM Analytics" OR "Tableau CRM") (intitle:job OR intitle:careers OR intitle:hiring) -site:linkedin.com -site:indeed.com']
    const urls = new Set()
    for (const q of searches) {
      const d = await get(`https://serpapi.com/search.json?${new URLSearchParams({ engine: 'google', q, num: '50', tbs: 'qdr:w', api_key: key })}`).catch(() => ({}))
      for (const r of d.organic_results ?? []) if (r.link) urls.add(r.link)
    }
    const out = []
    for (const url of [...urls].slice(0, Number(process.env.WEB_PAGES || 40))) {
      await sleep(1000)
      out.push(...await jobsFromPage(url).catch(() => []))
    }
    return out
  },
  async boards() {
    const list = JSON.parse(readFileSync(new URL('./boards.json', import.meta.url), 'utf8')).boards
    const out = []
    for (const b of list) {
      try {
        out.push(...await board(b))
      } catch (e) {
        console.log(`  board ${b.company}: ${e.message}`)
      }
    }
    return out
  }
}

// Company career sites with a public JSON board.
async function board(b) {
  if (b.type === 'workday') {
    // https://<tenant>.<wd>.myworkdayjobs.com/<site> — search, then read each hit's description.
    const base = `https://${b.host}/wday/cxs/${b.tenant}/${b.site}`
    const seen = new Map()
    for (const q of QUERIES) {
      const d = await get(`${base}/jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: q }) })
      for (const p of d.jobPostings ?? []) seen.set(p.externalPath, p)
      await sleep(800)
    }
    const out = []
    for (const [path, p] of seen) {
      await sleep(800)
      const d = await get(`${base}${path}`).catch(() => null)
      const info = d?.jobPostingInfo
      if (!info) continue
      out.push(job({ title: info.title, company: b.company, location: info.location || p.locationsText, remote: /remote/i.test(info.remoteType ?? ''), url: info.externalUrl || `https://${b.host}/${b.site}${path}`, posted: info.startDate, source: b.host, text: strip(info.jobDescription) }))
    }
    return out
  }
  if (b.type === 'greenhouse') {
    const d = await get(`https://boards-api.greenhouse.io/v1/boards/${b.token}/jobs?content=true`)
    return (d.jobs ?? []).map(j => job({ title: j.title, company: b.company, location: j.location?.name, url: j.absolute_url, posted: j.updated_at, source: 'greenhouse.io', text: strip(j.content?.replace(/&lt;/g, '<').replace(/&gt;/g, '>')) }))
  }
  if (b.type === 'lever') {
    const d = await get(`https://api.lever.co/v0/postings/${b.token}?mode=json`)
    return (d ?? []).map(j => job({ title: j.text, company: b.company, location: j.categories?.location, remote: j.workplaceType === 'remote', url: j.hostedUrl, posted: j.createdAt, source: 'lever.co', text: `${j.descriptionPlain ?? ''} ${(j.lists ?? []).map(l => strip(l.content)).join(' ')}` }))
  }
  if (b.type === 'ashby') {
    const d = await get(`https://api.ashbyhq.com/posting-api/job-board/${b.token}?includeCompensation=false`)
    return (d.jobs ?? []).map(j => job({ title: j.title, company: b.company, location: j.location, remote: j.isRemote, url: j.jobUrl, posted: j.publishedAt, source: 'ashbyhq.com', text: j.descriptionPlain }))
  }
  return []
}

// ---- run -----------------------------------------------------------------------
// `--page <url>`: show what one job page publishes (checks the JobPosting reader).
if (process.argv.includes('--page')) {
  const url = process.argv[process.argv.indexOf('--page') + 1]
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  const n = ((await res.text()).match(/"JobPosting"/g) ?? []).length
  const kept = (await jobsFromPage(url)).filter(Boolean)
  console.log(`${n} JobPosting block(s); ${kept.length} kept as CRM Analytics jobs`, kept)
  process.exit(0)
}
const fresh = []
for (const [name, fn] of Object.entries(sources)) {
  try {
    const r = await fn()
    if (typeof r === 'string') {
      console.log(`${name}: ${r}`)
      continue
    }
    const kept = r.filter(Boolean)
    fresh.push(...kept)
    console.log(`${name}: ${kept.length} matching`)
  } catch (e) {
    console.log(`${name}: failed (${e.message})`)
  }
}

let previous = { jobs: [] }
try {
  previous = JSON.parse(readFileSync(OUT, 'utf8'))
} catch {
  // First run: no feed yet.
}
const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString().slice(0, 10)
const byId = new Map()
// Older entries first so a fresh copy of the same posting wins, but keeps its first-seen date.
for (const j of [...(previous.jobs ?? []), ...fresh]) {
  const old = byId.get(j.id)
  byId.set(j.id, old ? { ...j, posted: old.posted < j.posted ? old.posted : j.posted } : j)
}
// The same role on two boards: one card (company + title + location).
const seen = new Set()
const jobs = [...byId.values()]
  .filter(j => j.posted >= cutoff)
  .sort((a, b) => b.posted.localeCompare(a.posted))
  .filter((j) => {
    const k = `${j.company}|${j.title}|${j.location}`.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

const now = new Date()
const thursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 4 - (now.getUTCDay() || 7)))
const week = `${thursday.getUTCFullYear()}-W${String(Math.ceil(((thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0')}`
const feed = { updated: now.toISOString(), week, jobs }

console.log(`\n${fresh.length} fetched, ${jobs.length} in the feed (${KEEP_DAYS} days)`)
if (DRY) {
  for (const j of jobs.slice(0, 20)) console.log(`  ${j.posted}  ${j.title} · ${j.company} · ${j.location} [${j.source}]`)
} else {
  // Only the date changed? Leave the file alone, so the daily run commits nothing.
  const same = JSON.stringify(previous.jobs ?? []) === JSON.stringify(jobs)
  if (same) console.log('No change.')
  else writeFileSync(OUT, `${JSON.stringify(feed, null, 2)}\n`)
}
