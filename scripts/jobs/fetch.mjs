#!/usr/bin/env node
/**
 * Daily CRM Analytics jobs feed → public/jobs.json (read by /jobs in the
 * browser; the Worker does no work). scripts/jobs/README.md explains it.
 *
 *   node scripts/jobs/fetch.mjs              fetch, keep, check every link, write
 *   node scripts/jobs/fetch.mjs --check      no fetching: re-check the links in the feed, write
 *   node scripts/jobs/fetch.mjs --dry        do everything, print, write nothing
 *   node scripts/jobs/fetch.mjs --page <url>     test the JobPosting reader on one page
 *   node scripts/jobs/fetch.mjs --status <url>   test the link check on one URL
 *
 * Four rules, in this order:
 *
 * 1. Find. Company boards in boards.json (Workday, Greenhouse, Lever, Ashby),
 *    Arbeitnow, and when their keys are set Adzuna, Jooble and SerpApi
 *    (Google Jobs + a web search of applicant-tracking systems).
 * 2. Keep only posts that name CRM Analytics (or its earlier names) in the
 *    title or description — "Salesforce" alone is not enough.
 * 3. Keep only links owned by the employer: its own careers site, its
 *    applicant-tracking system (ATS_HOSTS) or a LinkedIn job page
 *    (linkedin.com/jobs/view/…). A result from a job board is resolved to the
 *    employer's apply link (Google Jobs apply options, the board page's apply
 *    button, a redirect); when there is none, the job is dropped. LinkedIn is
 *    never scraped or searched: a LinkedIn URL is only accepted when another
 *    source hands it to us, and it is only ever asked for its status.
 *    Remotive, Himalayas and Jobicy are not used: their API terms require
 *    every apply button to send people through their own page.
 * 4. Check every link, every run (new and kept): live, expired (404/410, the
 *    ATS says closed, redirected to a generic careers page, JobPosting
 *    validThrough in the past, or the page says it is closed) or unknown
 *    (403/429/999/timeouts — LinkedIn answers robots with 999, which never
 *    means expired). Expired jobs stay EXPIRED_DAYS with a "No longer active"
 *    state, then go. A job unknown UNVERIFIED_RUNS runs in a row shows
 *    "Couldn't verify". Jobs go KEEP_DAYS after they were posted.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'public/jobs.json'
const KEEP_DAYS = 30
const EXPIRED_DAYS = 7
const UNVERIFIED_RUNS = 3
const DRY = process.argv.includes('--dry')
const CHECK_ONLY = process.argv.includes('--check')
// APIs get an honest name; job pages get a browser's, because many careers
// sites answer anything else with 403 and the check would learn nothing.
const UA = 'crm-analytics-academy-jobs/1.0 (+https://crmanalytics.imswarnil.com/jobs)'
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const CONCURRENCY = 4
const HOST_GAP_MS = 1500

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

// ---- who owns a link -----------------------------------------------------------
// Applicant-tracking systems: a posting there is the employer's own.
const ATS_HOSTS = [
  [/(^|\.)greenhouse\.io$/, 'Greenhouse'],
  [/(^|\.)lever\.co$/, 'Lever'],
  [/(^|\.)ashbyhq\.com$/, 'Ashby'],
  [/(^|\.)myworkdayjobs\.com$|(^|\.)myworkdaysite\.com$/, 'Workday'],
  [/(^|\.)smartrecruiters\.com$/, 'SmartRecruiters'],
  [/(^|\.)icims\.com$/, 'iCIMS'],
  [/(^|\.)jobvite\.com$/, 'Jobvite'],
  [/(^|\.)workable\.com$/, 'Workable'],
  [/(^|\.)taleo\.net$/, 'Taleo'],
  [/(^|\.)successfactors\.(com|eu)$|(^|\.)sapsf\.(com|eu|cn)$/, 'SuccessFactors'],
  [/(^|\.)oraclecloud\.com$/, 'Oracle Recruiting'],
  [/(^|\.)bamboohr\.com$/, 'BambooHR'],
  [/(^|\.)recruitee\.com$/, 'Recruitee'],
  [/(^|\.)teamtailor\.com$/, 'Teamtailor'],
  [/(^|\.)jobs\.personio\.(de|com)$/, 'Personio'],
  [/(^|\.)join\.com$/, 'JOIN'],
  [/(^|\.)breezy\.hr$/, 'Breezy HR'],
  [/(^|\.)applytojob\.com$/, 'JazzHR'],
  [/^ats\.rippling\.com$/, 'Rippling'],
  [/(^|\.)eightfold\.ai$/, 'Eightfold'],
  [/(^|\.)avature\.net$/, 'Avature'],
  [/(^|\.)ultipro\.com$|(^|\.)ukg\.net$/, 'UKG'],
  [/^recruiting\.paylocity\.com$/, 'Paylocity'],
  [/^workforcenow\.adp\.com$|^myjobs\.adp\.com$/, 'ADP'],
  [/(^|\.)pinpointhq\.com$/, 'Pinpoint'],
  [/(^|\.)comeet\.(com|co)$/, 'Comeet'],
  [/(^|\.)zohorecruit\.(com|in|eu)$/, 'Zoho Recruit'],
  [/(^|\.)freshteam\.com$/, 'Freshteam'],
  [/(^|\.)dover\.(com|io)$/, 'Dover'],
  [/(^|\.)phenompeople\.com$/, 'Phenom'],
  [/(^|\.)jobs\.gem\.com$/, 'Gem'],
  [/(^|\.)hire\.withgoogle\.com$/, 'Google Hire']
]
// Job boards and search engines: never the employer, whatever the name says.
const BOARDS = /(^|\.)(indeed|glassdoor|ziprecruiter|monster|naukri|simplyhired|talent|jooble|adzuna|careerjet|jobrapido|remotive|himalayas|jobicy|arbeitnow|dice|builtin|wellfound|angel|otta|weworkremotely|remoteok|workingnomads|jobgether|jobleads|lensa|jobright|bebee|learn4good|salary|recruit|whatjobs|google|foundit|shine|timesjobs|instahyre|hirist|iimjobs|cutshort|apna|upwork|jobsora|neuvoo|careerbuilder|snagajob|totaljobs|reed|stepstone|xing|seek|jora|jobstreet|bayt|naukrigulf|efinancialcareers|theladders|getwork|jobted|jobsearcher|joblift|tealhq|clickajob|resume-library|cv-library|flexjobs|virtualvocations|hiringcafe|hiring\.cafe|levels|startup|ycombinator|workatastartup)\./i
const SOCIAL = /(^|\.)(facebook|twitter|x|instagram|youtube|tiktok|reddit|t|g|paypal|medium|github|wikipedia|apple|play\.google)\.(com|me|page|org)$/i
const STOP = new Set(['inc', 'llc', 'ltd', 'limited', 'group', 'the', 'and', 'solutions', 'technologies', 'technology', 'services', 'consulting', 'global', 'corp', 'corporation', 'company', 'gmbh', 'pvt', 'private', 'plc', 'llp', 'holdings', 'international', 'digital', 'software', 'systems', 'partners', 'labs', 'cloud', 'data', 'tech'])

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}
// "NeuraFlash" ↔ neuraflash.com, "TELUS Digital" ↔ jobs.telusdigital.com.
function hostNamesCompany(host, company) {
  const words = String(company ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
  const labels = host.split('.').slice(0, -1).join('.')
  const tokens = words.filter(w => w.length >= 3 && !STOP.has(w))
  if (words.length > 1) tokens.push(words.join(''))
  return tokens.some(t => labels.includes(t))
}
function linkedinJob(url) {
  try {
    const u = new URL(url)
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) return null
    const id = u.pathname.match(/^\/(?:comm\/)?jobs\/view\/(?:[^/]*?-)?(\d{6,})/)?.[1] ?? u.searchParams.get('currentJobId')
    return id ? `https://www.linkedin.com/jobs/view/${id}/` : null
  } catch {
    return null
  }
}
/**
 * Who owns this link: { url, kind: 'ats' | 'company' | 'linkedin', source }
 * or null when it is a job board, a search page or anything else.
 */
function ownerOf(url, company) {
  const li = linkedinJob(url)
  if (li) return { url: li, kind: 'linkedin', source: 'LinkedIn' }
  const host = hostOf(url)
  if (!host || /(^|\.)linkedin\.com$/.test(host)) return null
  const ats = ATS_HOSTS.find(([re]) => re.test(host))
  const path = new URL(url).pathname
  if (/^\/?$|\/(terms|privacy|legal|cookies?|imprint|impressum|about)\b/i.test(path)) return null
  if (ats) return { url, kind: 'ats', source: ats[1] }
  if (BOARDS.test(`${host}.`) || SOCIAL.test(host)) return null
  if (hostNamesCompany(host, company)) return { url, kind: 'company', source: 'Company site' }
  return null
}
const RANK = { ats: 0, company: 0, linkedin: 1 }
function bestOwner(urls, company) {
  return urls.map(u => ownerOf(u, company)).filter(Boolean).sort((a, b) => RANK[a.kind] - RANK[b.kind])[0] ?? null
}

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
/**
 * A matching posting, or null. `via` is where we found it; `apply` lists
 * other apply links a board handed us (Google Jobs apply options); `ref` lets
 * the link check ask an ATS API directly ("greenhouse/<board>/<id>").
 */
function job({ title, company, location, remote, url, posted, via, text, apply, ref }) {
  const all = `${title} ${text ?? ''}`
  if (!MATCH.test(all) || !url) return null
  let loc = strip(location) || (remote ? 'Remote' : '')
  const parts = loc.split(/\s*,\s*/)
  if (parts.length > 3) loc = `${remote ? 'Remote · ' : ''}${parts.length} countries`
  return {
    title: strip(title).slice(0, 140),
    company: strip(company).slice(0, 80) || 'Unknown',
    location: loc.slice(0, 80),
    remote: Boolean(remote || /\bremote\b/i.test(loc)),
    country: countryOf(loc),
    level: levelOf(title),
    posted: day(posted),
    url,
    via,
    ...(ref ? { ref } : {}),
    ...(apply?.length ? { apply } : {}),
    skills: SKILLS.filter(([, re]) => re.test(all)).map(([s]) => s).slice(0, 6)
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Polite: one request at a time per host, HOST_GAP_MS apart.
const nextSlot = new Map()
async function hostTurn(url) {
  const host = hostOf(url)
  const now = Date.now()
  const at = Math.max(now, nextSlot.get(host) ?? 0)
  // Workday rate-limits hard: give it twice the gap.
  nextSlot.set(host, at + HOST_GAP_MS * (/myworkdayjobs\.com$/.test(host) ? 2 : 1))
  if (at > now) await sleep(at - now)
}
// One polite request: waits its turn on the host, and once more (Retry-After,
// at most 30 s) when the host says "too many requests".
async function politeFetch(url, init) {
  for (let attempt = 0; ; attempt++) {
    await hostTurn(url)
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) })
    if (res.status !== 429 || attempt > 0) return res
    await res.body?.cancel().catch(() => {})
    await sleep(Math.min(30, Number(res.headers.get('retry-after')) || 20) * 1000)
  }
}
async function get(url, init = {}) {
  // One retry after a pause when a board says "too many requests".
  for (let attempt = 0; ; attempt++) {
    await hostTurn(url)
    const res = await fetch(url, { ...init, headers: { 'user-agent': UA, 'accept': 'application/json', ...init.headers }, signal: AbortSignal.timeout(20000) })
    if (res.status === 429 && attempt < 2) {
      await sleep(15000 * (attempt + 1))
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`)
    return res.json()
  }
}
/** A page as a browser would load it: { status, url (after redirects), html } or { error }. */
async function page(url, { body = true } = {}) {
  try {
    const res = await politeFetch(url, { headers: { 'user-agent': BROWSER_UA, 'accept': 'text/html,application/xhtml+xml', 'accept-language': 'en-US,en;q=0.8' }, redirect: 'follow' })
    const html = body && /html|xml/i.test(res.headers.get('content-type') ?? '') ? (await res.text()).slice(0, 2_000_000) : ''
    if (!body || !html) await res.body?.cancel().catch(() => {})
    return { status: res.status, url: res.url || url, html }
  } catch (e) {
    return { error: e.name === 'TimeoutError' ? 'timeout' : e.message }
  }
}
// Every schema.org JobPosting a page publishes for search engines.
function postingsIn(html) {
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
  return items
}
const visibleText = html => strip(html.replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, ' '))
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
    return [job({ title: j.title, company: j.company_name || gh[1], location: j.location?.name, url: j.absolute_url || url, posted: j.first_published || j.updated_at, via: 'Web search', ref: `greenhouse/${gh[1]}/${gh[2]}`, text: strip(String(j.content ?? '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')) })]
  }
  const wd = /myworkdayjobs\.com$/.test(u.hostname) && u.pathname.match(/^\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/]+)(\/job\/.+)$/)
  if (wd) {
    const info = (await get(`https://${u.hostname}/wday/cxs/${u.hostname.split('.')[0]}/${wd[1]}${wd[2]}`)).jobPostingInfo
    return info ? [job({ title: info.title, company: info.hiringOrganization?.name || u.hostname.split('.')[0], location: info.location, remote: /remote/i.test(info.remoteType ?? ''), url: info.externalUrl || url, posted: info.startDate, via: 'Web search', text: strip(info.jobDescription) })] : []
  }
  const p = await page(url)
  if (p.error || p.status >= 400) return []
  return postingsIn(p.html).map((post) => {
    const name = v => (v && typeof v === 'object' ? v.name : v)
    const locs = [].concat(post.jobLocation ?? []).map(l => [l?.address?.addressLocality, l?.address?.addressRegion, name(l?.address?.addressCountry)].filter(x => typeof x === 'string' && x).join(', ')).filter(Boolean)
    const org = name(post.hiringOrganization)
    return job({ title: post.title, company: org || hostOf(url), location: locs.join(' · '), remote: post.jobLocationType === 'TELECOMMUTE', url: post.url || p.url, posted: post.datePosted, via: 'Web search', text: strip(post.description) })
  })
}

// ---- sources -----------------------------------------------------------------
const sources = {
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
  },
  // Arbeitnow lists each job's apply button as <job page>/apply, a redirect
  // to the employer's own posting; resolve() follows it.
  async arbeitnow() {
    const out = []
    for (let n = 1; n <= 5; n++) {
      const d = await get(`https://www.arbeitnow.com/api/job-board-api?page=${n}`)
      for (const j of d.data ?? []) out.push(job({ title: j.title, company: j.company_name, location: j.location, remote: j.remote, url: j.url, posted: j.created_at * 1000, via: 'Arbeitnow', text: strip(j.description) }))
      if (!d.links?.next) break
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
      for (const j of d.results ?? []) out.push(job({ title: j.title, company: j.company?.display_name, location: j.location?.display_name, url: j.redirect_url, posted: j.created, via: 'Adzuna', text: strip(j.description) }))
    }
    return out
  },
  async jooble() {
    const key = process.env.JOOBLE_KEY
    if (!key) return 'skipped (no JOOBLE_KEY)'
    const out = []
    for (const q of QUERIES) {
      const d = await get(`https://jooble.org/api/${key}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ keywords: `"${q}"`, page: 1 }) })
      for (const j of d.jobs ?? []) out.push(job({ title: j.title, company: j.company, location: j.location, url: j.link, posted: j.updated, via: 'Jooble', text: strip(j.snippet) }))
    }
    return out
  },
  // Google Jobs through SerpApi: Google's own job index. Each result lists
  // its apply options (company site, ATS, LinkedIn, boards); resolve() picks
  // the employer's, then LinkedIn. SERPAPI_DAILY searches a day (default 6),
  // rotating query × place by date, so the free plan lasts the month.
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
        const links = (j.apply_options ?? []).map(l => l.link).filter(Boolean)
        out.push(job({ title: j.title, company: j.company_name, location: j.location, remote: j.detected_extensions?.work_from_home, url: links[0] ?? j.share_link, apply: links, posted: agoToDate(j.detected_extensions?.posted_at), via: 'Google Jobs', text: j.description }))
      }
    }
    return out
  },
  // The open web: postings from the last week on any applicant-tracking
  // system or careers page, read through each page's schema.org JobPosting.
  // Same SERPAPI_KEY (Google web search); WEB_PAGES caps pages read (default 40).
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
    for (const url of [...urls].slice(0, Number(process.env.WEB_PAGES || 40))) out.push(...await jobsFromPage(url).catch(() => []))
    return out
  }
}

// Company career sites with a public JSON board.
async function board(b) {
  const via = 'Company board'
  if (b.type === 'workday') {
    // https://<tenant>.<wd>.myworkdayjobs.com/<site> — search, then read each hit's description.
    const base = `https://${b.host}/wday/cxs/${b.tenant}/${b.site}`
    const seen = new Map()
    for (const q of QUERIES) {
      const d = await get(`${base}/jobs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: q }) })
      for (const p of d.jobPostings ?? []) seen.set(p.externalPath, p)
    }
    const out = []
    for (const [path, p] of seen) {
      const d = await get(`${base}${path}`).catch(() => null)
      const info = d?.jobPostingInfo
      if (!info) continue
      out.push(job({ title: info.title, company: b.company, location: info.location || p.locationsText, remote: /remote/i.test(info.remoteType ?? ''), url: info.externalUrl || `https://${b.host}/${b.site}${path}`, posted: info.startDate, via, text: strip(info.jobDescription) }))
    }
    return out
  }
  if (b.type === 'greenhouse') {
    const d = await get(`https://boards-api.greenhouse.io/v1/boards/${b.token}/jobs?content=true`)
    return (d.jobs ?? []).map(j => job({ title: j.title, company: b.company, location: j.location?.name, url: j.absolute_url, posted: j.first_published || j.updated_at, via, ref: `greenhouse/${b.token}/${j.id}`, text: strip(j.content?.replace(/&lt;/g, '<').replace(/&gt;/g, '>')) }))
  }
  if (b.type === 'lever') {
    const d = await get(`https://api.lever.co/v0/postings/${b.token}?mode=json`)
    return (d ?? []).map(j => job({ title: j.text, company: b.company, location: j.categories?.location, remote: j.workplaceType === 'remote', url: j.hostedUrl, posted: j.createdAt, via, text: `${j.descriptionPlain ?? ''} ${(j.lists ?? []).map(l => strip(l.content)).join(' ')}` }))
  }
  if (b.type === 'ashby') {
    const d = await get(`https://api.ashbyhq.com/posting-api/job-board/${b.token}?includeCompensation=false`)
    return (d.jobs ?? []).map(j => job({ title: j.title, company: b.company, location: j.location, remote: j.isRemote, url: j.jobUrl, posted: j.publishedAt, via, text: j.descriptionPlain }))
  }
  return []
}

// ---- rule 3: resolve a board's result to the employer's own link ------------------
async function resolve(j) {
  const direct = bestOwner([j.url, ...(j.apply ?? [])], j.company)
  if (direct) return direct
  // Never fetch LinkedIn, and never fetch a URL that is not a page of the board.
  const p = await page(j.url)
  if (p.error || p.status >= 400) return null
  const landed = ownerOf(p.url, j.company)
  if (landed) return landed
  const base = p.url
  const hrefs = [...p.html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => {
    try {
      return new URL(m[1].replace(/&amp;/g, '&'), base).href
    } catch {
      return null
    }
  }).filter(Boolean)
  // Only links to one posting: a board page also links the employer's home
  // page and its ATS's terms, which are not the job.
  const found = bestOwner(hrefs.filter(h => linkedinJob(h) || jobSpecific(new URL(h).pathname)), j.company)
  if (found) return found
  // An "apply" link on the board itself usually redirects to the employer.
  const own = hostOf(base)
  const applyLink = hrefs.find(h => hostOf(h) === own && /\/apply\b|[?&]apply\b|\/away\//i.test(h))
  if (!applyLink) return null
  const hop = await page(applyLink, { body: false })
  return hop.error ? null : ownerOf(hop.url, j.company)
}

// ---- rule 4: is the link still live? ---------------------------------------------
const CLOSED = /no longer (accepting applications|available|active|open|posted|accepting)|(job|position|role|posting|vacancy|requisition|opening) (has been|is|was) (closed|filled|removed|expired|no longer)|position has been filled|(job|posting) (has )?expired|the (job|page|position) you(?:'|’| a)re? looking for (is|was|has|no longer|could not|cannot|does not)|job not found|job (is )?no longer exists|this job has been (closed|archived)|applications? (are |is )?(now )?closed|not accepting applications/i
const GENERIC = /^\/?(?:[a-z]{2}(?:[-_][a-z]{2})?\/)?(?:[a-z-]*careers?|[a-z-]*jobs?|search|job-search|search-jobs|positions|openings|vacancies|join-us|opportunities|en)?\/?$/i
const jobSpecific = path => /\d{4,}|[0-9a-f]{8}-[0-9a-f]{4}|_[A-Z]{1,4}\d+|\/jobs?\/[^/]{6,}/i.test(path)

const ashbyBoards = new Map()
async function check(j) {
  const url = j.url
  let u
  try {
    u = new URL(url)
  } catch {
    return { status: 'expired', reason: 'bad url' }
  }
  const host = u.hostname.toLowerCase()
  try {
    // Ask the applicant-tracking system's own API where there is a cheap one.
    const gh = j.ref?.match(/^greenhouse\/([^/]+)\/(\d+)$/) ?? (/greenhouse\.io$/.test(host) && u.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/))
    if (gh) return apiStatus(`https://boards-api.greenhouse.io/v1/boards/${gh[1]}/jobs/${gh[2]}`, 'Greenhouse')
    const lv = /(^|\.)lever\.co$/.test(host) && u.pathname.match(/^\/([^/]+)\/([0-9a-f-]{36})/)
    if (lv) return apiStatus(`https://${host.includes('.eu.') ? 'api.eu' : 'api'}.lever.co/v0/postings/${lv[1]}/${lv[2]}`, 'Lever')
    const ab = host === 'jobs.ashbyhq.com' && u.pathname.match(/^\/([^/]+)\/([0-9a-f-]{36})/)
    if (ab) {
      if (!ashbyBoards.has(ab[1])) ashbyBoards.set(ab[1], get(`https://api.ashbyhq.com/posting-api/job-board/${ab[1]}`).then(d => new Set((d.jobs ?? []).map(x => x.id))).catch(e => (/^404/.test(e.message) ? new Set() : null)))
      const ids = await ashbyBoards.get(ab[1])
      if (ids) return ids.has(ab[2]) ? { status: 'live' } : { status: 'expired', reason: 'Ashby: not on the board' }
    }
    const wd = /myworkdayjobs\.com$/.test(host) && u.pathname.match(/^\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/]+)(\/job\/.+)$/)
    if (wd) {
      const res = await politeFetch(`https://${host}/wday/cxs/${host.split('.')[0]}/${wd[1]}${wd[2]}`, { headers: { 'user-agent': UA, 'accept': 'application/json' } })
      if (res.status === 404 || res.status === 410) return { status: 'expired', reason: `Workday: ${res.status}` }
      if (res.ok) {
        const info = (await res.json()).jobPostingInfo
        if (!info || info.posted === false || info.canApply === false) return { status: 'expired', reason: 'Workday: closed' }
        return { status: 'live' }
      }
      // Workday answers an unposted job with 403 "S22 permission denied".
      // Confirm on the board itself: no hit for its requisition id = closed.
      const err = await res.json().catch(() => ({}))
      const req = wd[2].match(/_([A-Z]{1,5}-?\d+)(?:-\d+)?$/)?.[1]
      if (res.status === 403 && err.errorCode === 'S22' && req) {
        const hits = await politeFetch(`https://${host}/wday/cxs/${host.split('.')[0]}/${wd[1]}/jobs`, { method: 'POST', headers: { 'user-agent': UA, 'accept': 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ appliedFacets: {}, limit: 5, offset: 0, searchText: req }) }).then(r => (r.ok ? r.json() : null)).catch(() => null)
        if (hits && !(hits.jobPostings ?? []).some(p => p.externalPath?.includes(req))) return { status: 'expired', reason: 'Workday: unposted' }
      }
      if (res.status === 429 || res.status === 403) return { status: 'unknown', reason: `Workday: ${res.status}` }
    }
  } catch {
    // The API was not reachable: fall back to the page itself.
  }

  // LinkedIn: one request, its status and nothing else it would not show anyone.
  const li = Boolean(linkedinJob(url))
  const p = await page(url)
  if (p.error) return { status: 'unknown', reason: p.error }
  if (p.status === 404 || p.status === 410) return { status: 'expired', reason: String(p.status) }
  if (p.status >= 400) return { status: 'unknown', reason: String(p.status) }
  if (li) {
    if (/authwall|\/login|checkpoint|signup/i.test(p.url)) return { status: 'unknown', reason: 'sign-in wall' }
    if (/No longer accepting applications/i.test(visibleText(p.html))) return { status: 'expired', reason: 'LinkedIn: closed' }
    return { status: 'live' }
  }
  const from = new URL(url)
  const to = new URL(p.url)
  const moved = `${to.hostname}${to.pathname}`.replace(/\/$/, '') !== `${from.hostname}${from.pathname}`.replace(/\/$/, '')
  if (moved && jobSpecific(from.pathname) && (GENERIC.test(to.pathname) || /error|not-?found|expired|closed|404/i.test(to.pathname + to.search))) return { status: 'expired', reason: 'redirected to a careers page' }
  const until = postingsIn(p.html).map(x => x.validThrough).filter(Boolean).map(v => new Date(v)).find(d => !Number.isNaN(d.getTime()))
  if (until && until < new Date()) return { status: 'expired', reason: 'validThrough passed' }
  const text = visibleText(p.html)
  const closed = text.match(CLOSED)
  if (closed) return { status: 'expired', reason: `page says "${closed[0]}"` }
  return { status: 'live' }
}
async function apiStatus(api, name) {
  const res = await politeFetch(api, { headers: { 'user-agent': UA, 'accept': 'application/json' } })
  await res.body?.cancel().catch(() => {})
  if (res.ok) return { status: 'live' }
  if (res.status === 404 || res.status === 410) return { status: 'expired', reason: `${name}: closed` }
  return { status: 'unknown', reason: `${name}: ${res.status}` }
}
async function pool(items, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (i < items.length) {
      const n = i++
      out[n] = await fn(items[n], n)
    }
  }))
  return out
}

// ---- run -----------------------------------------------------------------------
if (process.argv.includes('--page')) {
  const url = process.argv[process.argv.indexOf('--page') + 1]
  const kept = (await jobsFromPage(url)).filter(Boolean)
  console.log(`${kept.length} kept as CRM Analytics jobs`, kept)
  process.exit(0)
}
if (process.argv.includes('--status')) {
  const url = process.argv[process.argv.indexOf('--status') + 1]
  console.log(ownerOf(url, process.argv[process.argv.indexOf('--status') + 2] ?? ''), await check({ url }))
  process.exit(0)
}

let previous = { jobs: [] }
try {
  previous = JSON.parse(readFileSync(OUT, 'utf8'))
} catch {
  // First run: no feed yet.
}
const previousIds = new Set((previous.jobs ?? []).map(j => j.id))
const now = new Date()
const nowIso = now.toISOString()
const dropped = { notOwner: 0, closedOnArrival: 0, expiredGone: 0, old: 0 }

// 1–2. Find and match.
const fresh = []
const found = {}
if (!CHECK_ONLY) {
  for (const [name, fn] of Object.entries(sources)) {
    try {
      const r = await fn()
      if (typeof r === 'string') {
        console.log(`${name}: ${r}`)
        continue
      }
      const kept = r.filter(Boolean)
      fresh.push(...kept)
      for (const j of kept) found[j.via] = (found[j.via] ?? 0) + 1
      console.log(`${name}: ${kept.length} matching`)
    } catch (e) {
      console.log(`${name}: failed (${e.message})`)
    }
  }
}

// 3. The employer's own link, or nothing.
const owned = []
await pool(fresh, async (j) => {
  const o = await resolve(j)
  if (!o) {
    dropped.notOwner++
    if (DRY) console.log(`  drop (no employer link): ${j.title} · ${j.company} [${j.via}] ${j.url}`)
    return
  }
  const rest = { ...j }
  delete rest.apply
  owned.push({ ...rest, id: hash(o.url.replace(/[?#].*$/, '')), url: o.url, source: o.source, kind: o.kind })
})
// Kept jobs answer the same question again (the rules may be newer than the job).
const kept = []
for (const j of previous.jobs ?? []) {
  const o = ownerOf(j.url, j.company)
  if (!o) {
    dropped.notOwner++
    continue
  }
  kept.push({ ...j, url: o.url, source: o.source, kind: o.kind, via: j.via ?? 'Company board' })
}

// Merge: a fresh copy wins, keeping the first-seen date and the check history.
const byId = new Map()
for (const j of [...kept, ...owned]) {
  const old = byId.get(j.id)
  if (!old) {
    byId.set(j.id, j)
    continue
  }
  const { status, checkedAt, expiredAt, verifiedAt, unknownRuns, reason } = old
  byId.set(j.id, { ...j, status, checkedAt, expiredAt, verifiedAt, unknownRuns, reason, posted: old.posted < j.posted ? old.posted : j.posted })
}
const cutoff = new Date(now - KEEP_DAYS * 864e5).toISOString().slice(0, 10)
let all = [...byId.values()].filter((j) => {
  if (j.posted >= cutoff) return true
  dropped.old++
  return false
})

// 4. Check every link.
console.log(`\nChecking ${all.length} links…`)
await pool(all, async (j) => {
  const r = await check(j)
  j.checkedAt = nowIso
  if (r.status === 'unknown') {
    j.unknownRuns = (j.unknownRuns ?? 0) + 1
    // Unknown never turns an expired job back on, or a live one off.
    if (j.status !== 'expired') j.status = 'unknown'
  } else {
    j.unknownRuns = 0
    j.status = r.status
    if (r.status === 'live') {
      j.verifiedAt = nowIso
      delete j.expiredAt
    } else {
      j.expiredAt ??= nowIso
    }
  }
  if (r.reason) j.reason = r.reason
  else delete j.reason
  if (DRY || process.env.VERBOSE) console.log(`  ${j.status.padEnd(7)} ${r.reason ?? ''} · ${j.title} · ${j.company} [${j.source}] ${j.url}`)
})
const expiredCutoff = new Date(now - EXPIRED_DAYS * 864e5).toISOString()
all = all.filter((j) => {
  // Closed before anyone saw it here: not news, just noise.
  if (j.status === 'expired' && !j.verifiedAt && !j.unknownRuns && j.expiredAt === nowIso && !previousIds.has(j.id)) {
    dropped.closedOnArrival++
    return false
  }
  if (j.status !== 'expired' || j.expiredAt >= expiredCutoff) return true
  dropped.expiredGone++
  return false
})

// The same role on two sites: one card — the live one, the employer's before LinkedIn.
const STATUS_RANK = { live: 0, unknown: 1, expired: 2 }
const seen = new Set()
const jobs = all
  .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || RANK[a.kind] - RANK[b.kind] || b.posted.localeCompare(a.posted))
  .filter((j) => {
    const k = `${j.company}|${j.title}|${j.location}`.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  .sort((a, b) => b.posted.localeCompare(a.posted))
  .map((j) => {
    const out = { ...j }
    delete out.kind
    return out
  })

const thursday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 4 - (now.getUTCDay() || 7)))
const week = `${thursday.getUTCFullYear()}-W${String(Math.ceil(((thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0')}`
const count = s => jobs.filter(j => j.status === s).length
const tally = key => Object.entries(jobs.reduce((m, j) => ({ ...m, [j[key]]: (m[j[key]] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
const meta = {
  generatedAt: CHECK_ONLY ? previous.meta?.generatedAt ?? previous.updated ?? nowIso : nowIso,
  checkedAt: nowIso,
  counts: { total: jobs.length, live: count('live'), expired: count('expired'), unknown: count('unknown'), unverified: jobs.filter(j => j.status === 'unknown' && j.unknownRuns >= UNVERIFIED_RUNS).length },
  sources: tally('source'),
  found: CHECK_ONLY ? previous.meta?.found ?? [] : Object.entries(found).map(([name, n]) => ({ name, n })),
  dropped,
  rules: { keepDays: KEEP_DAYS, expiredDays: EXPIRED_DAYS, unverifiedRuns: UNVERIFIED_RUNS }
}
const feed = { updated: meta.generatedAt, week, meta, jobs }

console.log(`\n${fresh.length} matching found, ${owned.length} with the employer's own link; ${jobs.length} in the feed: ${meta.counts.live} live, ${meta.counts.expired} expired, ${meta.counts.unknown} unknown (${meta.counts.unverified} unverified)`)
console.log(`dropped: ${dropped.notOwner} without an employer link, ${dropped.closedOnArrival} already closed when found, ${dropped.expiredGone} expired over ${EXPIRED_DAYS} days, ${dropped.old} older than ${KEEP_DAYS} days`)
if (DRY) {
  for (const j of jobs.slice(0, 30)) console.log(`  ${j.posted}  ${j.status.padEnd(7)} ${j.title} · ${j.company} · ${j.location} [${j.source}]`)
} else {
  // Every run writes: the statuses and "checked" times are the news.
  writeFileSync(OUT, `${JSON.stringify(feed, null, 2)}\n`)
}
