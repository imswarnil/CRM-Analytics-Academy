#!/usr/bin/env node
/**
 * gen-academy-dataset — the teaching warehouse for the whole course.
 *
 *   node scripts/gen-academy-dataset.mjs [--scale=1] [--out=public/sample-data/academy]
 *
 * The company is CRM Analytics Academy itself: it sells CRM Analytics training
 * to individual learners (Academy Pro), to company teams (Team Plan and
 * Enterprise Programmes), runs classroom batches at six training centers, sells
 * certification vouchers, and takes on implementation work. That mix is the
 * point. A seat subscription renews, a prepaid pool of classroom seat-days or
 * consulting hours is drawn down and has to be re-earned, and a classroom
 * batch is one-off revenue with a fixed-cost room behind it -- three revenue
 * shapes, and every analytics problem the course teaches lives in the gaps
 * between them.
 *
 * WHY GENERATED AND NOT HAND-WRITTEN.
 * Every lesson quotes numbers. If the CSVs were hand-typed, a fix in one file
 * would silently contradict a figure in another. Here one seed produces the
 * whole warehouse, so the relationships hold by construction:
 *
 *   - a campaign's Leads column equals the rows in leads.csv that name it
 *   - an opportunity's ARR equals the sum of its opportunity_products rows
 *   - quotes.csv NetTotal equals ListTotal minus the discount actually applied
 *   - usage_monthly only draws down products the account has a closed-won line for
 *   - arr_snapshots movements reconcile to opportunity close dates
 *   - a batch's SeatsSold equals its rows in enrollments.csv
 *
 * Deterministic: same seed, same bytes. Safe to regenerate and commit.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const argOf = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.split('=').slice(1).join('=') : fallback
}

const SCALE = Number(argOf('scale', '1'))
const OUT = argOf('out', 'public/sample-data/academy')
const SEED = Number(argOf('seed', '20260926'))

/* ------------------------------------------------------------------ random */
// mulberry32: tiny, seedable, and good enough that nobody has to install a
// dependency to regenerate a teaching dataset.
let _s = SEED >>> 0
function rnd() {
  _s = (_s + 0x6d2b79f5) >>> 0
  let t = _s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1))
const pick = arr => arr[Math.floor(rnd() * arr.length)]
const chance = p => rnd() < p
// Weighted pick: [[value, weight], ...]. Used everywhere a distribution should
// look like a real funnel rather than a uniform sample.
function weighted(pairs) {
  const total = pairs.reduce((s, p) => s + p[1], 0)
  let r = rnd() * total
  for (const [v, w] of pairs) {
    r -= w
    if (r <= 0) return v
  }
  return pairs[pairs.length - 1][0]
}
// Box-Muller, clamped. Latency and deal sizes are lognormal in real life.
function gauss(mean, sd) {
  const u = Math.max(rnd(), 1e-9)
  const v = Math.max(rnd(), 1e-9)
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const round = (n, dp = 2) => Number(n.toFixed(dp))

/* -------------------------------------------------------------------- dates */
const DAY = 86400000
const END = new Date('2026-09-30T00:00:00Z')
const START = new Date('2025-04-01T00:00:00Z')
const iso = d => new Date(d).toISOString().slice(0, 10)
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY)
const monthEnd = (y, m) => iso(new Date(Date.UTC(y, m + 1, 0)))
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY)
const randomDate = (from = START, to = END) =>
  iso(new Date(new Date(from).getTime() + rnd() * (new Date(to) - new Date(from))))

// Every month boundary in the window, for snapshots and spend.
const MONTHS = []
for (let y = 2025, m = 3; new Date(Date.UTC(y, m, 1)) <= END; m++) {
  if (m > 11) {
    m = 0
    y++
  }
  MONTHS.push({ y, m, end: monthEnd(y, m), label: `${y}-${String(m + 1).padStart(2, '0')}` })
}

/* ---------------------------------------------------------------- csv write */
function csv(rows) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const cell = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [cols.join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\n') + '\n'
}

const files = {}
const emit = (name, rows) => {
  files[name] = rows
  writeFileSync(path.join(OUT, name), csv(rows))
}
mkdirSync(OUT, { recursive: true })

/* ================================================================ DIMENSIONS
   Small, stable, hand-authored tables. These are the conformed dimensions the
   whole warehouse joins to, so they are written out rather than sampled: a
   dimension that changes when you re-run the generator is not a dimension. */

// Six offerings across three pricing models. The mix is the reason the
// Academy's revenue analytics is hard: a seat plan renews, a prepaid pool of
// seat-days, vouchers or consulting hours is drawn down and re-earned, and an
// enterprise programme fee does neither.
const PRODUCTS = [
  { ProductCode: 'PRO', ProductName: 'Academy Pro', Family: 'Online', PricingModel: 'Seat', Unit: 'learner/year', ListUnitPrice: 240, GrossMarginPct: 88, LaunchDate: '2024-03-01' },
  { ProductCode: 'TEAM', ProductName: 'Team Plan', Family: 'Online', PricingModel: 'Seat', Unit: 'seat/year', ListUnitPrice: 390, GrossMarginPct: 84, LaunchDate: '2024-06-01' },
  { ProductCode: 'ENTERPRISE', ProductName: 'Enterprise Programme', Family: 'Programmes', PricingModel: 'Platform', Unit: 'year', ListUnitPrice: 36000, GrossMarginPct: 78, LaunchDate: '2025-01-15' },
  { ProductCode: 'CLASSROOM', ProductName: 'Classroom Seat-Days', Family: 'Classroom', PricingModel: 'Usage', Unit: 'seat-day', ListUnitPrice: 310, GrossMarginPct: 46, LaunchDate: '2024-09-01' },
  { ProductCode: 'VOUCHER', ProductName: 'Certification Vouchers', Family: 'Certification', PricingModel: 'Usage', Unit: 'voucher', ListUnitPrice: 180, GrossMarginPct: 35, LaunchDate: '2025-02-01' },
  { ProductCode: 'IMPL', ProductName: 'Implementation Services', Family: 'Services', PricingModel: 'Usage', Unit: 'consulting hour', ListUnitPrice: 175, GrossMarginPct: 38, LaunchDate: '2025-05-15' }
]

const SEGMENTS = [
  { name: 'Self-Serve', arrLo: 240, arrHi: 3600, motion: 'PLG', cycle: 0 },
  { name: 'SMB', arrLo: 3000, arrHi: 18000, motion: 'Sales-Assisted', cycle: 21 },
  { name: 'Mid-Market', arrLo: 15000, arrHi: 72000, motion: 'Sales-Led', cycle: 48 },
  { name: 'Enterprise', arrLo: 60000, arrHi: 280000, motion: 'Sales-Led', cycle: 92 },
  { name: 'Strategic', arrLo: 240000, arrHi: 1100000, motion: 'Sales-Led', cycle: 140 }
]

const REGIONS = [
  { region: 'AMER', countries: ['United States', 'Canada', 'Brazil', 'Mexico'], w: 46 },
  { region: 'EMEA', countries: ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'UAE', 'Spain'], w: 30 },
  { region: 'APAC', countries: ['India', 'Australia', 'Singapore', 'Japan', 'Indonesia'], w: 19 },
  { region: 'LATAM', countries: ['Argentina', 'Chile', 'Colombia'], w: 5 }
]

const INDUSTRIES = ['Financial Services', 'Healthcare', 'Retail', 'Manufacturing', 'Technology', 'Consulting / SI', 'Telecom', 'Insurance', 'Media', 'Logistics', 'Education', 'Public Sector']

// The five people who ever appear on an Academy deal. Persona is the single
// most useful lead field the course has, because it explains conversion
// differences that source alone cannot: the learner who finds the free course
// is not the person who signs for forty seats.
const PERSONAS = [
  { persona: 'Individual Learner', w: 36, convert: 0.09, plg: 0.78 },
  { persona: 'Salesforce Admin', w: 22, convert: 0.22, plg: 0.41 },
  { persona: 'Analytics Lead', w: 18, convert: 0.27, plg: 0.26 },
  { persona: 'L&D / Enablement Manager', w: 14, convert: 0.33, plg: 0.08 },
  { persona: 'Procurement / Finance', w: 10, convert: 0.34, plg: 0.03 }
]

const pickRegion = () => weighted(REGIONS.map(r => [r, r.w]))

/* ------------------------------------------------------------------- people */
const FIRST = ['Aditi', 'Marcus', 'Yuki', 'Sofia', 'Omar', 'Lena', 'Diego', 'Priya', 'Tom', 'Nina', 'Kwame', 'Hannah', 'Ravi', 'Elena', 'Jonas', 'Mei', 'Ana', 'Noah', 'Zara', 'Felix', 'Ishaan', 'Clara', 'Luis', 'Amara', 'Ben', 'Sana', 'Victor', 'Maya']
const LAST = ['Rao', 'Hale', 'Tanaka', 'Marino', 'Haddad', 'Fischer', 'Moreno', 'Nair', 'Whitfield', 'Kovac', 'Mensah', 'Lindqvist', 'Iyer', 'Petrova', 'Berg', 'Chen', 'Silva', 'Okafor', 'Ahmed', 'Brandt', 'Kapoor', 'Novak', 'Ortega', 'Diallo', 'Shaw', 'Qureshi', 'Almeida', 'Bright']
const personName = () => `${pick(FIRST)} ${pick(LAST)}`

const ROLES = [
  { role: 'AE', n: 14, quotaBase: 600000 },
  { role: 'SDR', n: 8, quotaBase: 0 },
  { role: 'BDR', n: 5, quotaBase: 0 },
  { role: 'SC', n: 6, quotaBase: 0 },
  { role: 'CSM', n: 7, quotaBase: 0 }
]

const reps = []
let repSeq = 1
const MANAGERS = ['Dana Whitfield', 'Ines Kovac', 'Paul Okafor']
for (const r of ROLES) {
  for (let i = 0; i < r.n; i++) {
    const seg = weighted([['SMB', 30], ['Mid-Market', 34], ['Enterprise', 26], ['Strategic', 10]])
    const rg = pickRegion()
    const start = randomDate('2023-01-01', '2026-06-01')
    const tenure = daysBetween(start, END)
    reps.push({
      OwnerId: `U-${String(repSeq++).padStart(3, '0')}`,
      OwnerName: personName(),
      Role: r.role,
      Segment: r.role === 'AE' || r.role === 'CSM' ? seg : seg,
      Region: rg.region,
      Manager: pick(MANAGERS),
      StartDate: start,
      // Ramp matters: comparing a rep in month two to a rep in year three is
      // the most common unfair chart in sales analytics.
      RampStatus: tenure < 90 ? 'Ramping' : tenure < 180 ? 'Partial' : 'Full',
      TenureMonths: Math.round(tenure / 30),
      AnnualQuota: r.quotaBase ? Math.round((r.quotaBase * (seg === 'Strategic' ? 2.4 : seg === 'Enterprise' ? 1.7 : seg === 'Mid-Market' ? 1 : 0.6)) / 1000) * 1000 : 0,
      IsActive: chance(0.93)
    })
  }
}
emit('reps.csv', reps)
const AES = reps.filter(r => r.Role === 'AE')
const SDRS = reps.filter(r => r.Role === 'SDR' || r.Role === 'BDR')
const CSMS = reps.filter(r => r.Role === 'CSM')

emit('products.csv', PRODUCTS)

/* ================================================================== ACCOUNTS
   The customer base. Segment drives almost everything downstream -- ARR band,
   sales motion, cycle length, which products they can even buy -- which is why
   it is assigned first and then respected everywhere else. */
const N_ACCOUNTS = Math.round(140 * SCALE)
const COMPANY_A = ['North', 'Vertex', 'Lumen', 'Harbor', 'Quanta', 'Orbital', 'Kestrel', 'Sable', 'Meridian', 'Cobalt', 'Aster', 'Lattice', 'Foundry', 'Halcyon', 'Juniper', 'Onyx', 'Pallas', 'Rivet', 'Solstice', 'Tundra', 'Umbra', 'Vantage', 'Wexler', 'Zephyr', 'Beacon', 'Cinder', 'Dovetail', 'Ember']
const COMPANY_B = ['Bank', 'Health', 'Retail', 'Logistics', 'Systems', 'Insurance', 'Consulting', 'Energy', 'Care', 'Works', 'Group', 'Digital', 'Partners', 'Technologies', 'Foods', 'Media', 'Motors', 'Telecom', 'Pharma', 'Capital']

const accounts = []
const usedNames = new Set()
for (let i = 0; i < N_ACCOUNTS; i++) {
  const seg = weighted(SEGMENTS.map(s => [s, s.name === 'Self-Serve' ? 34 : s.name === 'SMB' ? 27 : s.name === 'Mid-Market' ? 22 : s.name === 'Enterprise' ? 13 : 4]))
  const rg = pickRegion()
  let name
  do {
    name = `${pick(COMPANY_A)} ${pick(COMPANY_B)}`
  } while (usedNames.has(name))
  usedNames.add(name)

  const signup = randomDate('2024-05-01', '2026-08-15')
  const tenureDays = daysBetween(signup, END)
  const arr = Math.round(((seg.arrLo + rnd() * (seg.arrHi - seg.arrLo)) / 100)) * 100
  // Health is deliberately correlated with support pain and usage trend later,
  // so the "why is this account red" lesson has a real answer to find.
  const health = Math.max(4, Math.min(98, Math.round(gauss(seg.name === 'Self-Serve' ? 58 : 72, 17))))

  accounts.push({
    AccountId: `ACC-${String(1000 + i)}`,
    AccountName: name,
    Segment: seg.name,
    Motion: seg.motion,
    Industry: pick(INDUSTRIES),
    Country: pick(rg.countries),
    Region: rg.region,
    EmployeeBand: seg.name === 'Self-Serve' ? pick(['1-10', '11-50']) : seg.name === 'SMB' ? pick(['11-50', '51-200']) : seg.name === 'Mid-Market' ? pick(['201-500', '501-1000']) : pick(['1001-5000', '5000+']),
    SignupDate: signup,
    TenureMonths: Math.round(tenureDays / 30),
    ARR: arr,
    HealthScore: health,
    // Not every signup becomes a paying logo: the free course is the top of the
    // funnel,
    // and lessons on "customer count" have to decide what counts.
    IsPayingCustomer: seg.name === 'Self-Serve' ? chance(0.55) : true,
    IsLogo: seg.name === 'Enterprise' || seg.name === 'Strategic' ? chance(0.7) : false,
    CSMOwnerId: seg.name === 'Self-Serve' ? '' : pick(CSMS).OwnerId,
    SupportTier: seg.name === 'Strategic' ? 'Premier' : seg.name === 'Enterprise' ? 'Business' : seg.name === 'Self-Serve' ? 'Community' : 'Standard',
    ContractType: seg.name === 'Self-Serve' ? 'Monthly Subscription' : chance(0.68) ? 'Annual Commit' : 'Monthly',
    RenewalMonth: MONTHS[int(0, MONTHS.length - 1)].label
  })
}
// A free learner who never paid has no ARR. Set after the fact rather than
// inside the loop so the random sequence -- and every other file -- is
// unchanged by it.
for (const a of accounts) if (!a.IsPayingCustomer) a.ARR = 0
emit('accounts.csv', accounts)
const byAccount = new Map(accounts.map(a => [a.AccountId, a]))
const payingAccounts = accounts.filter(a => a.IsPayingCustomer)

/* ================================================================== CONTACTS */
const TITLES = {
  'Individual Learner': ['Business Analyst', 'Junior Consultant', 'Data Analyst', 'Career Switcher'],
  'Salesforce Admin': ['Salesforce Administrator', 'Senior Salesforce Admin', 'CRM Manager', 'Platform Owner'],
  'Analytics Lead': ['Head of Analytics', 'RevOps Manager', 'BI Lead', 'Director of Sales Operations'],
  'L&D / Enablement Manager': ['L&D Manager', 'Head of Enablement', 'Training Director', 'People Development Lead'],
  'Procurement / Finance': ['Procurement Manager', 'Head of Vendor Management', 'Finance Director', 'CFO']
}
const contacts = []
let cSeq = 1
for (const a of accounts) {
  const n = a.Segment === 'Self-Serve' ? int(1, 2) : a.Segment === 'Strategic' ? int(5, 8) : int(2, 5)
  for (let i = 0; i < n; i++) {
    const p = weighted(PERSONAS.map(x => [x, x.w]))
    const nm = personName()
    contacts.push({
      ContactId: `CON-${String(cSeq++).padStart(4, '0')}`,
      AccountId: a.AccountId,
      ContactName: nm,
      Title: pick(TITLES[p.persona]),
      Persona: p.persona,
      Email: `${nm.toLowerCase().replace(/[^a-z]/g, '.')}@${a.AccountName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      Country: a.Country,
      Region: a.Region,
      // The economic buyer is rarely the person who signed up for the free
      // course. Multi-threading analysis depends on this flag existing.
      IsEconomicBuyer: p.persona === 'Procurement / Finance' || p.persona === 'L&D / Enablement Manager' ? chance(0.45) : chance(0.06),
      IsChampion: chance(0.18),
      OptedIntoMarketing: chance(0.61)
    })
  }
}
emit('contacts.csv', contacts)

/* ================================================================= CAMPAIGNS
   Channels a training company actually runs. The free online course is listed
   as a campaign on purpose: at the Academy the free curriculum is the top of
   the funnel, and a marketing dashboard that cannot see it is measuring the
   wrong company. Spend is emitted, aggregates are backfilled after leads
   exist so the columns reconcile. */
const CHANNELS = [
  { channel: 'Paid Search', type: 'Advertisement', cpl: 140, w: 14, plg: 0.34, intent: 'high' },
  { channel: 'Paid Social', type: 'Advertisement', cpl: 95, w: 9, plg: 0.42, intent: 'low' },
  { channel: 'Organic Search', type: 'Content', cpl: 22, w: 17, plg: 0.58, intent: 'high' },
  { channel: 'AI Assistant Referral', type: 'Content', cpl: 16, w: 8, plg: 0.63, intent: 'high' },
  { channel: 'Free Course', type: 'Product', cpl: 9, w: 13, plg: 0.86, intent: 'high' },
  { channel: 'Salesforce Community', type: 'Community', cpl: 18, w: 7, plg: 0.71, intent: 'mid' },
  { channel: 'Webinar', type: 'Webinar', cpl: 70, w: 6, plg: 0.26, intent: 'mid' },
  { channel: 'Conference', type: 'Conference', cpl: 320, w: 5, plg: 0.10, intent: 'mid' },
  { channel: 'Outbound Sequence', type: 'Outbound', cpl: 180, w: 11, plg: 0.03, intent: 'low' },
  { channel: 'SI Partner Referral', type: 'Partner', cpl: 60, w: 6, plg: 0.12, intent: 'high' },
  { channel: 'Customer Referral', type: 'Referral', cpl: 30, w: 4, plg: 0.40, intent: 'high' }
]
const CAMPAIGN_THEMES = ['Free Course Launch', 'Certification Season', 'Salesforce Event Follow-up', 'Team Upskilling Offer', 'Classroom Batch Push', 'SAQL Masterclass', 'Einstein Discovery Workshop', 'Q3 Pipeline Push', 'Reports-to-CRMA Migration', 'Dashboard Makeover Challenge', 'Admin to Analyst Path', 'AI Search Visibility']

const campaigns = []
let campSeq = 1
for (const ch of CHANNELS) {
  const runs = Math.max(2, Math.round(ch.w / 2.2))
  for (let i = 0; i < runs; i++) {
    const rg = pickRegion()
    const start = randomDate('2025-04-01', '2026-08-01')
    const days = int(21, 150)
    const spend = ch.channel === 'Free Course' || ch.channel === 'Salesforce Community'
      ? int(1500, 9000)
      : Math.round(int(6000, 90000) / 500) * 500
    const impressions = ch.type === 'Advertisement' ? int(180000, 2600000) : int(4000, 220000)
    const clicks = Math.round(impressions * (ch.type === 'Advertisement' ? 0.012 + rnd() * 0.02 : 0.04 + rnd() * 0.09))
    campaigns.push({
      CampaignId: `CMP-${String(campSeq++).padStart(3, '0')}`,
      CampaignName: `${pick(CAMPAIGN_THEMES)} — ${rg.region} ${start.slice(0, 7)}`,
      Channel: ch.channel,
      Type: ch.type,
      Region: rg.region,
      StartDate: start,
      EndDate: iso(addDays(start, days)),
      IsActive: daysBetween(iso(addDays(start, days)), END) < 0,
      Spend: spend,
      Impressions: impressions,
      Clicks: clicks,
      // Backfilled below from leads/opportunities so nothing contradicts.
      Leads: 0,
      MQLs: 0,
      SQLs: 0,
      OpportunitiesCreated: 0,
      PipelineAmount: 0,
      ClosedWonAmount: 0,
      CostPerLead: 0,
      CostPerMQL: 0,
      PipelineROI: 0
    })
  }
}
const campaignsByChannel = ch => campaigns.filter(c => c.Channel === ch)

/* ============================================================ MARKETING SPEND
   Monthly spend by channel and region. Separate from campaigns because finance
   reports by month and marketing reports by campaign, and reconciling those two
   grains is one of the exercises. */
const spendRows = []
for (const m of MONTHS) {
  for (const ch of CHANNELS) {
    for (const rg of REGIONS) {
      if (rnd() > 0.55) continue
      const base = ch.cpl * ch.w * (rg.w / 40)
      spendRows.push({
        Month: m.label,
        MonthEnd: m.end,
        Channel: ch.channel,
        Region: rg.region,
        Spend: Math.round(Math.max(400, gauss(base * 2.4, base * 0.5)) / 50) * 50,
        Currency: 'USD',
        BudgetOwner: ch.type === 'Outbound' ? 'Sales Development' : 'Marketing',
        IsPaid: ch.type === 'Advertisement' || ch.type === 'Conference'
      })
    }
  }
}
emit('marketing_spend.csv', spendRows)

/* =============================================================== SEO KEYWORDS
   Weekly rank tracking. Clustered, because nobody makes a decision about one
   keyword -- they make it about a topic -- and because the cluster is the join
   key between SEO, the LLM visibility table and the landing pages in GA4. */
const KEYWORD_CLUSTERS = [
  { cluster: 'CRMA Training', intent: 'Commercial', kws: ['crm analytics course', 'crm analytics training online', 'tableau crm course', 'learn crm analytics', 'crm analytics bootcamp'] },
  { cluster: 'Certification', intent: 'Transactional', kws: ['crm analytics consultant certification', 'crm analytics exam guide', 'crm analytics practice exam', 'crm analytics certification cost'] },
  { cluster: 'SAQL & How-To', intent: 'Informational', kws: ['saql tutorial', 'saql group by example', 'crm analytics bindings example', 'crm analytics recipe join', 'what is a dataset in crm analytics'] },
  { cluster: 'Corporate Training', intent: 'Commercial', kws: ['salesforce team training', 'crm analytics corporate training', 'salesforce analytics workshop for teams', 'upskill salesforce admins'] },
  { cluster: 'Implementation', intent: 'Commercial', kws: ['crm analytics implementation partner', 'crm analytics consultant hire', 'crm analytics dashboard services', 'einstein discovery implementation'] },
  { cluster: 'Classroom', intent: 'Transactional', kws: ['crm analytics training bengaluru', 'salesforce classroom training pune', 'crm analytics course london', 'crm analytics training near me'] },
  { cluster: 'Brand', intent: 'Navigational', kws: ['crm analytics academy', 'crm analytics academy pricing', 'crm analytics academy review', 'crm analytics academy login'] }
]
const URLS = {
  'CRMA Training': '/curriculum',
  'Certification': '/certification',
  'SAQL & How-To': '/saql',
  'Corporate Training': '/teams',
  'Implementation': '/implementation',
  'Classroom': '/training',
  'Brand': '/'
}
const seoRows = []
// One reading every Monday: enough to see a trend, small enough to eyeball.
const WEEKS = []
for (let d = new Date(START); d <= END; d = addDays(d, 7)) WEEKS.push(iso(d))
for (const kc of KEYWORD_CLUSTERS) {
  for (const kw of kc.kws) {
    const volume = kc.intent === 'Navigational' ? int(300, 2400) : int(700, 28000)
    // Each keyword gets its own drift so the chart has winners and losers
    // rather than one flat band.
    let pos = int(4, 46)
    const drift = (rnd() - 0.42) * 0.42
    for (let w = 0; w < WEEKS.length; w++) {
      pos = Math.max(1, Math.min(92, pos - drift + gauss(0, 1.6)))
      const p = Math.round(pos)
      // CTR by position, roughly the published curve. Flattened at the tail.
      const ctr = p <= 1 ? 0.28 : p <= 3 ? 0.15 : p <= 5 ? 0.082 : p <= 10 ? 0.031 : p <= 20 ? 0.011 : 0.003
      const impressions = Math.round(volume * (p <= 10 ? 0.62 : p <= 20 ? 0.28 : 0.09) * (0.8 + rnd() * 0.4))
      seoRows.push({
        WeekOf: WEEKS[w],
        Keyword: kw,
        Cluster: kc.cluster,
        Intent: kc.intent,
        LandingPage: URLS[kc.cluster],
        Position: p,
        SearchVolume: volume,
        Impressions: impressions,
        Clicks: Math.round(impressions * ctr),
        CTR: round(ctr, 4),
        // Google's AI Overview eats the click even when the rank is good. This
        // column is the whole reason the SEO lesson is not a 2019 SEO lesson.
        InAIOverview: chance(kc.intent === 'Informational' ? 0.54 : 0.19),
        Country: pick(['United States', 'United Kingdom', 'India', 'Germany', 'Australia'])
      })
    }
  }
}
emit('seo_keywords.csv', seoRows)

/* ============================================================ LLM VISIBILITY
   Generative Engine Optimisation. When a buyer asks an assistant "what is the
   best way to learn CRM Analytics", either the Academy is in the answer or it is not,
   and there is no rank-1 blue link to fall back on. This is the newest table in
   the warehouse and the one with no established benchmark -- which is exactly
   why the curriculum teaches measuring it rather than quoting a target. */
const ENGINES = [
  { engine: 'ChatGPT', w: 34, cites: 0.62 },
  { engine: 'Claude', w: 19, cites: 0.71 },
  { engine: 'Google AI Overviews', w: 22, cites: 0.55 },
  { engine: 'Perplexity', w: 14, cites: 0.88 },
  { engine: 'Gemini', w: 8, cites: 0.49 },
  { engine: 'Copilot', w: 3, cites: 0.52 }
]
const PROMPTS = [
  { prompt: 'best course to learn salesforce crm analytics', cluster: 'CRMA Training', stage: 'Solution' },
  { prompt: 'crm analytics training providers for a team', cluster: 'Corporate Training', stage: 'Vendor' },
  { prompt: 'cheapest way to get crm analytics certified', cluster: 'Certification', stage: 'Vendor' },
  { prompt: 'how do i write a saql query with group by', cluster: 'SAQL & How-To', stage: 'Problem' },
  { prompt: 'how to build a pipeline dashboard in crm analytics', cluster: 'SAQL & How-To', stage: 'Problem' },
  { prompt: 'crm analytics implementation partners', cluster: 'Implementation', stage: 'Vendor' },
  { prompt: 'crm analytics academy vs self study', cluster: 'Brand', stage: 'Decision' },
  { prompt: 'how long does it take to learn crm analytics', cluster: 'CRMA Training', stage: 'Problem' },
  { prompt: 'crm analytics classroom training in india', cluster: 'Classroom', stage: 'Solution' },
  { prompt: 'which crm analytics course has the best hands-on labs', cluster: 'CRMA Training', stage: 'Solution' }
]
const COMPETITORS = ['LearnForce', 'CourseHub', 'BootcampPro', 'BigSI Academy', 'FreelanceTrainer', 'none']
const llmRows = []
for (const m of MONTHS) {
  for (const e of ENGINES) {
    for (const p of PROMPTS) {
      // Run the same prompt several times: assistants are non-deterministic, so
      // a single check is an anecdote and Share of Voice needs a denominator.
      const runs = 5
      let mentions = 0
      for (let r = 0; r < runs; r++) {
        const mentioned = chance(p.cluster === 'Brand' ? 0.86 : p.stage === 'Vendor' ? 0.42 : 0.33)
        if (mentioned) mentions++
        llmRows.push({
          Month: m.label,
          CheckDate: m.end,
          RunId: r + 1,
          Engine: e.engine,
          Prompt: p.prompt,
          PromptCluster: p.cluster,
          BuyerStage: p.stage,
          BrandMentioned: mentioned,
          // Where in the answer, not where on a results page. Being named third
          // in a list of five is not the same as being the recommendation.
          MentionRank: mentioned ? int(1, 5) : '',
          IsRecommended: mentioned ? chance(0.34) : false,
          CitedUrl: mentioned && chance(e.cites) ? `https://crmanalytics.imswarnil.com${URLS[p.cluster]}` : '',
          CitationSource: mentioned && chance(e.cites) ? pick(['Own Lessons', 'Own Blog', 'Course Review Site', 'Reddit', 'Salesforce Community', 'YouTube']) : '',
          CompetitorMentioned: pick(COMPETITORS),
          Sentiment: mentioned ? weighted([['Positive', 52], ['Neutral', 40], ['Negative', 8]]) : '',
          AnswerHasPricing: chance(0.3)
        })
      }
      // Share of Voice is a property of the whole run set, not of one answer,
      // so it is stamped onto every row in the group. Doing it only on the last
      // row would also drop the columns from the header, since the writer reads
      // its column list from the first row.
      for (let i = llmRows.length - runs; i < llmRows.length; i++) {
        llmRows[i].ShareOfVoiceRuns = mentions
        llmRows[i].ShareOfVoicePct = round((mentions / runs) * 100, 1)
      }
    }
  }
}
emit('llm_visibility.csv', llmRows)

/* =============================================================== WEB SESSIONS
   GA4-shaped daily traffic. Deliberately GA4's vocabulary -- sessions, engaged
   sessions, engagement time, key events -- so the lesson on wiring GA4 into CRM
   Analytics maps one-to-one onto columns the reader will actually receive.
   'AI Assistant' is a first-class channel here, because in 2026 it is one, and
   most channel groupings still bucket it as Direct or Referral and lose it. */
const WEB_CHANNELS = [
  { channel: 'Organic Search', w: 26, conv: 0.021, eng: 0.58 },
  { channel: 'Direct', w: 19, conv: 0.030, eng: 0.61 },
  { channel: 'AI Assistant', w: 11, conv: 0.038, eng: 0.72 },
  { channel: 'Paid Search', w: 13, conv: 0.017, eng: 0.42 },
  { channel: 'Referral', w: 9, conv: 0.024, eng: 0.55 },
  { channel: 'Organic Social', w: 8, conv: 0.008, eng: 0.34 },
  { channel: 'Email', w: 6, conv: 0.033, eng: 0.63 },
  { channel: 'Paid Social', w: 5, conv: 0.007, eng: 0.29 },
  { channel: 'Salesforce Community', w: 3, conv: 0.041, eng: 0.77 }
]
const LANDING = [
  { page: '/', type: 'Home' },
  { page: '/pricing', type: 'Pricing' },
  { page: '/introduction', type: 'Course' },
  { page: '/saql/functions', type: 'Course' },
  { page: '/training', type: 'Product' },
  { page: '/teams', type: 'Product' },
  { page: '/implementation', type: 'Product' },
  { page: '/blog/saql-cheatsheet', type: 'Blog' },
  { page: '/certification', type: 'Certification' },
  { page: '/compare/self-study', type: 'Compare' }
]
const webRows = []
for (let d = new Date(START); d <= END; d = addDays(d, 1)) {
  const date = iso(d)
  const dow = new Date(d).getUTCDay()
  // Working learners study at the weekend, but buyers do not: B2B traffic
  // collapses on Saturday and Sunday. Any week-over-week chart that
  // ignores this reads as a crisis every Saturday.
  const weekday = dow === 0 || dow === 6 ? 0.42 : 1
  // Slow compounding growth plus an AI-referral ramp that starts later.
  const t = daysBetween(START, date) / daysBetween(START, END)
  const growth = 1 + t * 1.6
  for (const ch of WEB_CHANNELS) {
    const aiRamp = ch.channel === 'AI Assistant' ? 0.15 + t * 2.6 : 1
    const lp = weighted(LANDING.map(l => [l, l.type === 'Course' ? 26 : l.type === 'Home' ? 18 : 10]))
    const rg = pickRegion()
    const sessions = Math.max(1, Math.round(gauss(ch.w * 24 * weekday * growth * aiRamp, ch.w * 4)))
    const engaged = Math.round(sessions * Math.min(0.95, ch.eng * (0.85 + rnd() * 0.3)))
    const signups = Math.round(sessions * ch.conv * (lp.type === 'Course' || lp.type === 'Pricing' ? 1.7 : 1) * (0.7 + rnd() * 0.6))
    webRows.push({
      Date: date,
      Channel: ch.channel,
      SourceMedium: ch.channel === 'AI Assistant' ? pick(['chatgpt.com / referral', 'claude.ai / referral', 'perplexity.ai / referral', 'gemini.google.com / referral']) : ch.channel === 'Organic Search' ? 'google / organic' : ch.channel === 'Direct' ? '(direct) / (none)' : `${ch.channel.toLowerCase().replace(/ /g, '')} / cpc`,
      LandingPage: lp.page,
      PageType: lp.type,
      Country: pick(rg.countries),
      Region: rg.region,
      DeviceType: weighted([['desktop', 68], ['mobile', 27], ['tablet', 5]]),
      Sessions: sessions,
      EngagedSessions: engaged,
      AvgEngagementSeconds: Math.max(4, Math.round(gauss(lp.type === 'Course' ? 260 : 74, 40))),
      PagesPerSession: round(Math.max(1, gauss(lp.type === 'Course' ? 3.8 : 1.9, 0.7)), 2),
      // The two key events that matter: an account, and a first lesson
      // actually started.
      Signups: signups,
      CourseStarts: Math.round(signups * (0.38 + rnd() * 0.3)),
      QuoteRequests: Math.round(sessions * ch.conv * 0.22 * (0.5 + rnd())),
      IsNewUserMajority: chance(0.62)
    })
  }
}
emit('web_sessions.csv', webRows)

/* ===================================================================== LEADS
   The top of the funnel, with the timestamps that make funnel maths possible.
   Every stage gets its own date column rather than a single Status, because a
   status field tells you where a lead is now and destroys the history of how
   long it took to get there -- and velocity is the question every GTM team
   actually asks. Disqualified leads are kept: a funnel that silently drops them
   reports a conversion rate that flatters everyone. */
const DISQUAL = ['No budget', 'Student — free course only', 'Competitor', 'Wrong geo', 'No Salesforce org', 'Went silent', 'Duplicate', 'Free course is enough']

const leads = []
const N_LEADS = Math.round(2800 * SCALE)
for (let i = 0; i < N_LEADS; i++) {
  const ch = weighted(CHANNELS.map(c => [c, c.w]))
  const camp = pick(campaignsByChannel(ch.channel))
  const p = weighted(PERSONAS.map(x => [x, x.w]))
  const rg = pickRegion()
  const created = randomDate('2025-04-01', '2026-09-20')
  const isPlg = chance(ch.plg)

  // Score is a function of the things a real model would use, plus noise. The
  // lesson on scoring asks the reader to check whether it actually predicts.
  let score = 18 + p.convert * 110 + (ch.intent === 'high' ? 22 : ch.intent === 'mid' ? 10 : 0) + (isPlg ? 14 : 0) + gauss(0, 13)
  score = Math.max(1, Math.min(100, Math.round(score)))

  // Funnel gates. Each is conditional on the last, so the shape is a funnel
  // rather than four independent coin flips.
  const mql = score > 42 ? chance(0.74) : chance(0.16)
  const mqlDate = mql ? iso(addDays(created, int(0, 21))) : ''
  const sql = mql && chance(0.46 + p.convert * 0.5)
  const sqlDate = sql ? iso(addDays(mqlDate, int(1, 26))) : ''
  const converted = sql && chance(0.52)
  const convDate = converted ? iso(addDays(sqlDate, int(2, 34))) : ''

  const status = converted ? 'Converted' : sql ? 'SQL' : mql ? (chance(0.7) ? 'MQL' : 'Nurture') : chance(0.42) ? 'Disqualified' : chance(0.5) ? 'Working' : 'New'
  const sdr = ch.type === 'Outbound' || !isPlg ? pick(SDRS) : null

  leads.push({
    LeadId: `LEAD-${String(10000 + i)}`,
    CreatedDate: created,
    CompanyName: `${pick(COMPANY_A)} ${pick(COMPANY_B)}`,
    Persona: p.persona,
    Title: pick(TITLES[p.persona]),
    Country: pick(rg.countries),
    Region: rg.region,
    LeadSource: ch.channel,
    SourceCategory: ch.type === 'Outbound' ? 'Outbound' : ch.type === 'Partner' || ch.type === 'Referral' ? 'Partner / Referral' : isPlg ? 'Product' : 'Inbound Marketing',
    CampaignId: camp ? camp.CampaignId : '',
    CampaignName: camp ? camp.CampaignName : '',
    // First and last touch differ often enough that the attribution lesson has
    // something real to argue about.
    FirstTouchChannel: ch.channel,
    LastTouchChannel: chance(0.62) ? ch.channel : pick(CHANNELS).channel,
    LeadScore: score,
    ScoreBand: score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D',
    // PLG signal: they were already taking the free course before anyone
    // called them.
    SelfServeSignup: isPlg,
    StartedFreeCourse: isPlg ? chance(0.57) : chance(0.08),
    FreeLessonsCompletedPct: isPlg ? int(0, 100) : 0,
    Status: status,
    MQLDate: mqlDate,
    SQLDate: sqlDate,
    ConvertedDate: convDate,
    IsMQL: mql,
    IsSQL: sql,
    IsConverted: converted,
    DisqualifiedReason: status === 'Disqualified' ? pick(DISQUAL) : '',
    // The single most-audited number in lead management.
    DaysToFirstTouch: sdr ? Math.max(0, Math.round(gauss(isPlg ? 0.6 : 2.1, 1.4))) : '',
    TouchCount: sdr ? int(1, 11) : int(0, 2),
    SDROwnerId: sdr ? sdr.OwnerId : '',
    RoutedToAEId: sql ? pick(AES).OwnerId : '',
    ConvertedAccountId: '',
    ConvertedOpportunityId: ''
  })
}

/* ============================================================ OPPORTUNITIES
   Three ways a deal appears: a converted lead (new business), an existing
   account growing (expansion / upsell), and a contract coming up (renewal).
   Mixing them in one table without a Type column is how a "win rate" ends up
   meaningless, so Type is explicit and every lesson filters on it. */
const STAGES = ['Discovery', 'Needs Assessment', 'Business Case', 'Proposal / Quote', 'Negotiation', 'Closed Won', 'Closed Lost']
const OPEN_STAGES = STAGES.slice(0, 5)
const FORECAST = { 'Discovery': 'Pipeline', 'Needs Assessment': 'Pipeline', 'Business Case': 'Best Case', 'Proposal / Quote': 'Commit', 'Negotiation': 'Commit', 'Closed Won': 'Closed', 'Closed Lost': 'Omitted' }
const LOSS = ['Price', 'Lost to competitor', 'No decision', 'Trained in-house', 'Timing / budget freeze', 'Missing course topic', 'Failed vendor review', 'Champion left']

const opps = []
const oppProducts = []
let oppSeq = 1

function makeOpp({ account, type, createdDate, lead }) {
  const seg = SEGMENTS.find(s => s.name === account.Segment)
  const id = `OPP-${String(20000 + oppSeq++)}`
  const cycle = Math.max(4, Math.round(gauss(seg.cycle || 12, (seg.cycle || 12) * 0.38)))
  const closeDate = iso(addDays(createdDate, cycle))
  const isClosed = new Date(closeDate) < END

  // Win rate is honestly different per type and per segment, which is the
  // finding the pipeline lessons are built to surface.
  const baseWin = type === 'Renewal' ? 0.88 : type === 'Expansion' ? 0.63 : type === 'Upsell' ? 0.58 : account.Segment === 'Self-Serve' ? 0.44 : account.Segment === 'Strategic' ? 0.24 : 0.33
  const won = isClosed ? chance(baseWin) : false
  const stage = !isClosed
    ? weighted(OPEN_STAGES.map((s, i) => [s, [30, 24, 18, 16, 12][i]]))
    : won ? 'Closed Won' : 'Closed Lost'

  // Deal size follows the segment band, with renewals anchored to current ARR.
  const amount = type === 'Renewal'
    ? Math.round(account.ARR * (0.92 + rnd() * 0.28) / 100) * 100
    : type === 'Expansion' || type === 'Upsell'
      ? Math.round(account.ARR * (0.15 + rnd() * 0.55) / 100) * 100
      : Math.round((seg.arrLo + rnd() * (seg.arrHi - seg.arrLo)) / 100) * 100

  const stageEntered = iso(addDays(closeDate, -int(1, Math.max(2, Math.round(cycle * 0.4)))))
  const owner = account.Segment === 'Self-Serve' && type === 'New Business' ? null : pick(AES.filter(a => a.Segment === account.Segment).length ? AES.filter(a => a.Segment === account.Segment) : AES)

  // Line items: pick a product mix, then force the sum to equal Amount so the
  // header and the detail reconcile exactly.
  const eligible = PRODUCTS.filter(pr => account.Segment === 'Self-Serve' ? pr.PricingModel !== 'Platform' : true)
  const n = account.Segment === 'Strategic' ? int(3, 5) : account.Segment === 'Self-Serve' ? 1 : int(1, 3)
  const chosen = []
  while (chosen.length < n) {
    const pr = pick(eligible)
    if (!chosen.includes(pr)) chosen.push(pr)
  }
  const weights = chosen.map(() => 0.4 + rnd())
  const wSum = weights.reduce((a, b) => a + b, 0)
  let allocated = 0
  chosen.forEach((pr, i) => {
    const isLast = i === chosen.length - 1
    const lineArr = isLast ? amount - allocated : Math.round((amount * weights[i] / wSum) / 100) * 100
    allocated += lineArr
    const discount = weighted([[0, 34], [5, 18], [10, 16], [15, 12], [20, 9], [25, 6], [35, 5]])
    const netUnit = pr.ListUnitPrice * (1 - discount / 100)
    oppProducts.push({
      OpportunityId: id,
      AccountId: account.AccountId,
      ProductCode: pr.ProductCode,
      ProductName: pr.ProductName,
      Family: pr.Family,
      PricingModel: pr.PricingModel,
      Unit: pr.Unit,
      ListUnitPrice: pr.ListUnitPrice,
      DiscountPct: discount,
      NetUnitPrice: round(netUnit, 5),
      // For a draw-down product the "quantity" is a prepaid pool -- seat-days,
      // vouchers, consulting hours -- which is the thing that later gets over-
      // or under-consumed.
      CommittedUnits: pr.PricingModel === 'Usage' ? Math.round(lineArr / Math.max(netUnit, 0.0001)) : pr.PricingModel === 'Seat' ? Math.max(1, Math.round(lineArr / Math.max(netUnit, 1))) : 1,
      ARR: lineArr,
      IsPrimaryProduct: i === 0
    })
  })

  opps.push({
    OpportunityId: id,
    OpportunityName: `${account.AccountName} — ${type} — ${chosen[0].ProductName}`,
    AccountId: account.AccountId,
    AccountName: account.AccountName,
    Segment: account.Segment,
    Motion: account.Motion,
    Industry: account.Industry,
    Region: account.Region,
    Country: account.Country,
    Type: type,
    Stage: stage,
    ForecastCategory: FORECAST[stage],
    Amount: amount,
    ARR: amount,
    Probability: stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 : [12, 28, 45, 68, 82][OPEN_STAGES.indexOf(stage)],
    WeightedAmount: stage === 'Closed Won' ? amount : stage === 'Closed Lost' ? 0 : Math.round(amount * [12, 28, 45, 68, 82][OPEN_STAGES.indexOf(stage)] / 100),
    CreatedDate: createdDate,
    CloseDate: closeDate,
    StageEnteredDate: stageEntered,
    DaysInCurrentStage: Math.max(0, daysBetween(stageEntered, isClosed ? closeDate : iso(END))),
    SalesCycleDays: isClosed ? cycle : '',
    AgeDays: daysBetween(createdDate, isClosed ? closeDate : iso(END)),
    IsClosed: isClosed,
    IsWon: won,
    LossReason: isClosed && !won ? pick(LOSS) : '',
    Competitor: isClosed && !won && chance(0.55) ? pick(COMPETITORS.filter(c => c !== 'none')) : '',
    OwnerId: owner ? owner.OwnerId : '',
    OwnerName: owner ? owner.OwnerName : 'Self-Serve (no owner)',
    LeadSource: lead ? lead.LeadSource : type === 'Renewal' ? 'Renewal' : 'Customer Success',
    SourceCategory: lead ? lead.SourceCategory : type === 'Renewal' ? 'Renewal' : 'Expansion',
    OriginatingLeadId: lead ? lead.LeadId : '',
    CampaignId: lead ? lead.CampaignId : '',
    ProductCount: chosen.length,
    PrimaryProduct: chosen[0].ProductName,
    // The two gates that actually decide a corporate training deal: a pilot
    // cohort that proves the programme, and the vendor review that clears it.
    PilotCompleted: account.Segment === 'Self-Serve' ? false : chance(0.58),
    PilotDays: account.Segment === 'Self-Serve' ? '' : chance(0.58) ? int(7, 45) : '',
    SecurityReviewDays: account.Segment === 'Enterprise' || account.Segment === 'Strategic' ? int(9, 88) : chance(0.3) ? int(3, 21) : '',
    ContactsEngaged: account.Segment === 'Self-Serve' ? 1 : int(1, 7),
    HasEconomicBuyer: chance(account.Segment === 'Strategic' ? 0.72 : 0.48),
    NextStep: isClosed ? '' : pick(['Schedule curriculum review', 'Send vendor questionnaire', 'Pricing review with deal desk', 'L&D sponsor intro', 'Pilot cohort sign-off', 'Awaiting procurement'])
  })
  return id
}

// New business from converted leads.
for (const l of leads.filter(x => x.IsConverted)) {
  const acct = pick(accounts)
  l.ConvertedAccountId = acct.AccountId
  l.ConvertedOpportunityId = makeOpp({ account: acct, type: 'New Business', createdDate: l.ConvertedDate, lead: l })
}
emit('leads.csv', leads)

// Expansion, upsell and renewal on the installed base.
for (const a of payingAccounts) {
  const n = a.Segment === 'Strategic' ? int(2, 4) : a.Segment === 'Enterprise' ? int(1, 3) : chance(0.55) ? 1 : 0
  for (let i = 0; i < n; i++) {
    makeOpp({ account: a, type: weighted([['Expansion', 42], ['Upsell', 24], ['Renewal', 34]]), createdDate: randomDate(a.SignupDate, '2026-09-15'), lead: null })
  }
}
emit('opportunities.csv', opps)
emit('opportunity_products.csv', oppProducts)

/* ==================================================================== QUOTES
   CPQ, and the reason deal desk exists. Versions are kept, not overwritten:
   "how many times did we re-quote this deal" is a real efficiency metric and it
   is invisible if only the final quote survives. Approval days are the other
   half -- a discount that needs three approvals and nine days is not the same
   cost as the same discount waved through. */
const quotes = []
let qSeq = 1
const APPROVERS = ['AE Manager', 'Deal Desk', 'RevOps', 'Finance', 'VP Sales', 'CRO']
for (const o of opps) {
  // Only deals that actually reached a commercial conversation get a quote.
  const reached = ['Proposal / Quote', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(o.Stage)
  if (!reached || o.Segment === 'Self-Serve') continue
  const versions = weighted([[1, 40], [2, 30], [3, 18], [4, 8], [5, 4]])
  const lines = oppProducts.filter(l => l.OpportunityId === o.OpportunityId)
  const listTotal = Math.round(lines.reduce((s, l) => s + l.ListUnitPrice * l.CommittedUnits, 0))
  for (let v = 1; v <= versions; v++) {
    const isFinal = v === versions
    // Discounts creep upward with each version. That creep is the finding.
    const discount = Math.min(58, Math.round(weighted([[5, 20], [10, 22], [15, 20], [20, 15], [25, 10], [32, 8], [45, 5]]) + v * 2.5))
    const net = isFinal ? o.Amount : Math.round(listTotal * (1 - discount / 100))
    const needsApproval = discount > 15
    const steps = !needsApproval ? 1 : discount > 40 ? int(4, 6) : discount > 25 ? int(3, 4) : int(2, 3)
    const created = iso(addDays(o.CreatedDate, Math.round((daysBetween(o.CreatedDate, o.CloseDate) || 30) * (0.45 + v * 0.1))))
    const approvalDays = needsApproval ? Math.max(1, Math.round(gauss(steps * 2.4, 2))) : 0
    quotes.push({
      QuoteId: `QTE-${String(40000 + qSeq++)}`,
      OpportunityId: o.OpportunityId,
      AccountId: o.AccountId,
      Segment: o.Segment,
      Version: v,
      IsFinalVersion: isFinal,
      Status: isFinal ? (o.IsWon ? 'Accepted' : o.IsClosed ? 'Rejected' : 'Presented') : 'Superseded',
      CreatedDate: created,
      ListTotal: listTotal,
      DiscountPct: discount,
      NetTotal: net,
      DiscountAmount: Math.max(0, listTotal - net),
      RequiresApproval: needsApproval,
      ApprovalSteps: steps,
      ApproverChain: needsApproval ? APPROVERS.slice(0, steps).join(' > ') : 'Auto-approved',
      ApprovalDays: approvalDays,
      ApprovedDate: needsApproval ? iso(addDays(created, approvalDays)) : created,
      WentToDealDesk: discount > 20,
      TermMonths: weighted([[12, 58], [24, 24], [36, 15], [6, 3]]),
      PaymentTerms: weighted([['Net 30', 46], ['Net 45', 20], ['Net 60', 22], ['Prepaid Annual', 12]]),
      BillingFrequency: weighted([['Annual', 52], ['Quarterly', 24], ['Monthly', 24]]),
      HasRampSchedule: o.Segment === 'Strategic' || o.Segment === 'Enterprise' ? chance(0.42) : false,
      HasNonStandardTerms: chance(discount > 25 ? 0.5 : 0.12),
      HasPrepaidPool: lines.some(l => l.PricingModel === 'Usage'),
      HasTrueUpClause: lines.some(l => l.PricingModel === 'Usage') ? chance(0.82) : false
    })
  }
}
emit('quotes.csv', quotes)

/* ===================================================================== CASES
   Learner and customer support, with SLA and CSAT attached. The interesting
   columns are not "how many tickets" but which offering, which root cause, and
   whether the customer was already unhappy -- because a case dashboard that
   cannot be joined to ARR cannot tell you which outage cost you a renewal. */
const CASE_TYPES = [
  { type: 'Platform Incident', w: 12, hrs: 6, breach: 0.22 },
  { type: 'Bug', w: 14, hrs: 38, breach: 0.19 },
  { type: 'How-To Question', w: 30, hrs: 9, breach: 0.07 },
  { type: 'Onboarding / Org Setup', w: 18, hrs: 21, breach: 0.11 },
  { type: 'Billing / Seat Dispute', w: 12, hrs: 16, breach: 0.14 },
  { type: 'Content Request', w: 9, hrs: 72, breach: 0.05 },
  { type: 'Security / SSO', w: 5, hrs: 44, breach: 0.16 }
]
const ROOT_CAUSES = ['Learner misconfiguration', 'Seat limit reached', 'Practice org expired', 'Video / CDN failure', 'Content gap', 'Product defect', 'Expected behaviour', 'Voucher pool exhausted', 'SSO / identity']
const AGENTS = []
for (let i = 0; i < 18; i++) AGENTS.push({ AgentId: `AG-${String(100 + i)}`, AgentName: personName(), Tier: weighted([['T1', 50], ['T2', 33], ['T3', 17]]) })

const cases = []
const surveys = []
let caseSeq = 1
let svySeq = 1
for (const a of payingAccounts) {
  // Volume scales with size, and with how unhealthy the account is.
  const base = a.Segment === 'Strategic' ? 46 : a.Segment === 'Enterprise' ? 28 : a.Segment === 'Mid-Market' ? 14 : a.Segment === 'SMB' ? 7 : 3
  const n = Math.max(0, Math.round(gauss(base * (1 + (70 - a.HealthScore) / 110), base * 0.35)))
  for (let i = 0; i < n; i++) {
    const ct = weighted(CASE_TYPES.map(c => [c, c.w]))
    const created = randomDate(a.SignupDate, '2026-09-25')
    const priority = ct.type === 'Platform Incident' ? weighted([['Critical', 40], ['High', 42], ['Medium', 18]]) : weighted([['High', 18], ['Medium', 52], ['Low', 30]])
    const slaTarget = priority === 'Critical' ? 1 : priority === 'High' ? 4 : priority === 'Medium' ? 24 : 48
    const resolution = Math.max(0.2, gauss(ct.hrs * (priority === 'Critical' ? 0.4 : 1), ct.hrs * 0.5))
    const firstResp = Math.max(2, Math.round(gauss(priority === 'Critical' ? 14 : priority === 'High' ? 52 : 190, 40)))
    const closed = chance(0.88)
    const breached = resolution > slaTarget * (a.SupportTier === 'Premier' ? 1.4 : 1)
    const agent = pick(AGENTS)
    const id = `CASE-${String(70000 + caseSeq++)}`
    const csat = closed && chance(0.42)
      ? Math.max(1, Math.min(5, Math.round(gauss(breached ? 2.7 : 4.3, 0.9))))
      : ''
    cases.push({
      CaseId: id,
      AccountId: a.AccountId,
      AccountName: a.AccountName,
      Segment: a.Segment,
      Region: a.Region,
      SupportTier: a.SupportTier,
      CreatedDate: created,
      ClosedDate: closed ? iso(addDays(created, Math.max(0, Math.round(resolution / 24)))) : '',
      Status: closed ? weighted([['Closed', 84], ['Resolved - Monitoring', 16]]) : weighted([['New', 22], ['In Progress', 48], ['Waiting on Customer', 30]]),
      CaseType: ct.type,
      Product: pick(PRODUCTS).ProductName,
      Priority: priority,
      Origin: weighted([['Email', 30], ['Web Form', 24], ['In-App Chat', 22], ['LMS Integration', 12], ['Phone', 7], ['Slack Connect', 5]]),
      // The Academy's Ask AI tutor answers the easy ones first. Deflection is a
      // headline metric for the support team, and it belongs in the fact row.
      DeflectedByAI: chance(ct.type === 'How-To Question' ? 0.46 : 0.11),
      EscalatedToTier: agent.Tier,
      Reopened: closed ? chance(0.09) : false,
      FirstResponseMinutes: firstResp,
      ResolutionHours: round(resolution, 1),
      SLATargetHours: slaTarget,
      SLABreached: breached,
      RootCause: closed ? pick(ROOT_CAUSES) : '',
      AgentId: agent.AgentId,
      AgentName: agent.AgentName,
      LinkedToChurnRisk: a.HealthScore < 45 && chance(0.4),
      CSAT: csat
    })
    if (csat !== '') {
      surveys.push({
        SurveyId: `SVY-${String(90000 + svySeq++)}`,
        CaseId: id,
        AccountId: a.AccountId,
        Segment: a.Segment,
        Region: a.Region,
        ResponseDate: iso(addDays(created, int(1, 9))),
        CSAT: csat,
        // NPS is asked separately and on a different scale. Blending the two is
        // one of the mistakes the service lesson calls out.
        NPS: Math.max(0, Math.min(10, Math.round(csat * 2 + gauss(0, 1.3)))),
        NPSBand: csat >= 4 ? 'Promoter' : csat === 3 ? 'Passive' : 'Detractor',
        Verbatim: csat >= 4 ? pick(['Fast and clear.', 'Instructor knew CRM Analytics cold.', 'Fixed on the first reply.']) : csat === 3 ? pick(['Got there eventually.', 'Answer was fine, took a while.']) : pick(['Three days to reset a practice org.', 'Had to explain the problem twice.', 'Still not really fixed.']),
        Tag: csat >= 4 ? pick(['Speed', 'Expertise', 'Proactive']) : pick(['Slow response', 'Repeated handoffs', 'Lesson unclear', 'Unresolved'])
      })
    }
  }
}
emit('cases.csv', cases)
emit('csat_surveys.csv', surveys)

/* ============================================================= USAGE (MONTHLY)
   Consumption against commitment. Seats assigned against seats bought, and
   prepaid pools drawn down against what was prepaid. It is where net revenue
   retention actually comes from: a team that uses every seat buys more at
   renewal without a sales push, and a team with half its seats idle quietly
   shrinks the same way.

   Monthly grain, not daily: billing is monthly, and a daily file of every
   account times every product is a 400,000-row download nobody needs to learn
   the concept. Per-day operational metrics live in platform_health_daily. */
const wonLinesByAccount = new Map()
for (const l of oppProducts) {
  const o = opps.find(x => x.OpportunityId === l.OpportunityId)
  if (!o || !o.IsWon) continue
  if (!wonLinesByAccount.has(l.AccountId)) wonLinesByAccount.set(l.AccountId, [])
  wonLinesByAccount.get(l.AccountId).push({ line: l, since: o.CloseDate })
}

const usage = []
for (const [accId, lines] of wonLinesByAccount) {
  const a = byAccount.get(accId)
  if (!a) continue
  for (const { line, since } of lines) {
    if (line.PricingModel === 'Platform') continue
    // Each account gets a persistent growth trajectory, so its utilisation
    // trend is a line the reader can actually interpret rather than noise.
    const trend = gauss(a.HealthScore > 70 ? 0.035 : a.HealthScore > 45 ? 0.004 : -0.028, 0.02)
    let util = 0.55 + rnd() * 0.5
    for (const m of MONTHS) {
      if (new Date(m.end) < new Date(since)) continue
      util = Math.max(0.05, util * (1 + trend) + gauss(0, 0.05))
      const used = Math.round(line.CommittedUnits * util)
      const overage = Math.max(0, used - line.CommittedUnits)
      const billed = Math.min(used, line.CommittedUnits) * line.NetUnitPrice + overage * line.NetUnitPrice * 1.25
      usage.push({
        Month: m.label,
        MonthEnd: m.end,
        AccountId: accId,
        AccountName: a.AccountName,
        Segment: a.Segment,
        Region: a.Region,
        ProductCode: line.ProductCode,
        ProductName: line.ProductName,
        PricingModel: line.PricingModel,
        Unit: line.Unit,
        CommittedUnits: line.CommittedUnits,
        UsedUnits: used,
        OverageUnits: overage,
        UtilizationPct: round(util * 100, 1),
        // Three states every usage business watches, and the reason a single
        // "revenue" number hides the story.
        CommitState: util < 0.6 ? 'Under-consuming' : util > 1.05 ? 'In overage' : 'On track',
        BilledRevenue: round(billed / 12, 2),
        OverageRevenue: round((overage * line.NetUnitPrice * 1.25) / 12, 2),
        IsAtRiskOfUnderConsumption: util < 0.55
      })
    }
  }
}
emit('usage_monthly.csv', usage)

/* =================================================== PLATFORM HEALTH (DAILY)
   The operational table. It exists so the service lessons can answer "did the
   spike in cases follow a real incident, or did we just get worse at
   answering", which is a question a case table alone cannot settle. */
const health = []
for (let d = new Date(START); d <= END; d = addDays(d, 1)) {
  const date = iso(d)
  for (const pr of PRODUCTS) {
    if (new Date(date) < new Date(pr.LaunchDate)) continue
    const incident = chance(0.014)
    // Requests: lesson views and lab calls for the online offerings, practice-
    // org provisioning and check-ins for the rest.
    const base = pr.ProductCode === 'PRO' ? 180_000 : pr.ProductCode === 'TEAM' ? 260_000 : pr.ProductCode === 'ENTERPRISE' ? 120_000 : 6_000
    health.push({
      Date: date,
      ProductCode: pr.ProductCode,
      ProductName: pr.ProductName,
      Requests: Math.round(Math.max(1000, gauss(base, base * 0.18))),
      ErrorRatePct: round(Math.max(0.01, incident ? gauss(4.2, 1.8) : gauss(0.28, 0.14)), 3),
      P50LatencyMs: Math.round(Math.max(20, gauss(pr.Family === 'Online' ? 180 : 420, 30))),
      P95LatencyMs: Math.round(Math.max(60, gauss(pr.Family === 'Online' ? 640 : 1400, incident ? 600 : 120))),
      UptimePct: round(incident ? gauss(97.9, 1.1) : gauss(99.985, 0.02), 4),
      HadIncident: incident,
      IncidentSeverity: incident ? weighted([['SEV1', 12], ['SEV2', 33], ['SEV3', 55]]) : ''
    })
  }
}
emit('platform_health_daily.csv', health)

/* =========================================================== ARR SNAPSHOTS
   One row per account per month, with the movement that explains the change.
   This is the table that makes NRR, gross retention and the revenue waterfall
   possible, and it is built as a snapshot rather than derived on the fly
   because the moment you need "ARR as at March" you cannot recompute it from a
   table that only knows today. */
const arr = []
for (const a of payingAccounts) {
  let running = 0
  for (const m of MONTHS) {
    if (new Date(m.end) < new Date(a.SignupDate)) continue
    const wonThisMonth = opps.filter(o => o.AccountId === a.AccountId && o.IsWon && o.CloseDate.slice(0, 7) === m.label)
    const newArr = wonThisMonth.filter(o => o.Type === 'New Business').reduce((s, o) => s + o.ARR, 0)
    const expArr = wonThisMonth.filter(o => o.Type === 'Expansion' || o.Type === 'Upsell').reduce((s, o) => s + o.ARR, 0)
    // Churn and contraction are modelled off health, and only once the account
    // has something to lose.
    const churned = running > 0 && a.HealthScore < 38 && chance(0.04)
    const contraction = !churned && running > 0 && a.HealthScore < 58 && chance(0.06) ? Math.round(running * (0.08 + rnd() * 0.2)) : 0
    const movement = churned ? 'Churn' : newArr > 0 ? 'New' : expArr > 0 ? 'Expansion' : contraction > 0 ? 'Contraction' : 'Flat'
    const netNew = churned ? -running : newArr + expArr - contraction
    running = churned ? 0 : running + netNew
    arr.push({
      Month: m.label,
      MonthEnd: m.end,
      AccountId: a.AccountId,
      AccountName: a.AccountName,
      Segment: a.Segment,
      Motion: a.Motion,
      Region: a.Region,
      Industry: a.Industry,
      OpeningARR: round(running - netNew, 2),
      NewARR: newArr,
      ExpansionARR: expArr,
      ContractionARR: -contraction,
      ChurnedARR: churned ? -(running === 0 ? Math.abs(netNew) : 0) : 0,
      NetNewARR: round(netNew, 2),
      ClosingARR: round(running, 2),
      MovementType: movement,
      IsActive: running > 0,
      HealthScore: a.HealthScore,
      CSMOwnerId: a.CSMOwnerId
    })
  }
}
emit('arr_snapshots.csv', arr)

/* ======================================================== CAMPAIGN BACKFILL
   Now that leads and opportunities exist, the campaign aggregates are computed
   from them rather than invented. This is the reconciliation the whole dataset
   is built to demonstrate: the number on the campaign row is the number you get
   if you count the detail rows yourself. */
for (const c of campaigns) {
  const ls = leads.filter(l => l.CampaignId === c.CampaignId)
  // Spend follows the channel's cost-per-lead profile, so a channel's
  // economics are a property of the channel rather than of which random
  // budget its campaigns happened to draw. The spread comes from the campaign
  // id, not from the generator, so no other file changes.
  const chCfg = CHANNELS.find(x => x.channel === c.Channel)
  const spread = 0.75 + (Number(c.CampaignId.slice(4)) * 37 % 50) / 100
  c.Spend = Math.max(500, Math.round((chCfg.cpl * Math.max(ls.length, 1) * spread) / 500) * 500)
  const os = opps.filter(o => o.CampaignId === c.CampaignId)
  c.Leads = ls.length
  c.MQLs = ls.filter(l => l.IsMQL).length
  c.SQLs = ls.filter(l => l.IsSQL).length
  c.OpportunitiesCreated = os.length
  c.PipelineAmount = os.reduce((s, o) => s + o.Amount, 0)
  c.ClosedWonAmount = os.filter(o => o.IsWon).reduce((s, o) => s + o.Amount, 0)
  c.CostPerLead = c.Leads ? round(c.Spend / c.Leads, 2) : 0
  c.CostPerMQL = c.MQLs ? round(c.Spend / c.MQLs, 2) : 0
  c.CostPerOpportunity = c.OpportunitiesCreated ? round(c.Spend / c.OpportunitiesCreated, 2) : 0
  c.PipelineROI = c.Spend ? round(c.PipelineAmount / c.Spend, 2) : 0
  c.MarketingROI = c.Spend ? round(c.ClosedWonAmount / c.Spend, 2) : 0
  c.LeadToOppRatePct = c.Leads ? round((c.OpportunitiesCreated / c.Leads) * 100, 1) : 0
}
emit('campaigns.csv', campaigns)

/* ============================================================ CLASSROOM
   The part of the business that is not a subscription. Six training centers,
   each a room with a fixed monthly cost; batches that run there on a
   schedule; and one enrollment row per seat. A batch is one-off revenue, so
   none of it appears in arr_snapshots -- which is exactly the trap the
   revenue lessons warn about when "total revenue" and "ARR" are put side by
   side. Utilisation is the metric a center manager lives by: a batch that
   runs at six of twenty seats still pays for the room and the instructor. */
const CENTERS = [
  { CenterId: 'CTR-BLR', City: 'Bengaluru', Country: 'India', Region: 'APAC', Seats: 32, OpenedDate: '2024-09-01', MonthlyFixedCost: 9800, demand: 1.25 },
  { CenterId: 'CTR-PNQ', City: 'Pune', Country: 'India', Region: 'APAC', Seats: 24, OpenedDate: '2025-01-15', MonthlyFixedCost: 6400, demand: 0.95 },
  { CenterId: 'CTR-HYD', City: 'Hyderabad', Country: 'India', Region: 'APAC', Seats: 28, OpenedDate: '2025-04-01', MonthlyFixedCost: 7600, demand: 1.05 },
  { CenterId: 'CTR-LON', City: 'London', Country: 'United Kingdom', Region: 'EMEA', Seats: 20, OpenedDate: '2024-11-01', MonthlyFixedCost: 21500, demand: 0.8 },
  { CenterId: 'CTR-AUS', City: 'Austin', Country: 'United States', Region: 'AMER', Seats: 20, OpenedDate: '2025-06-01', MonthlyFixedCost: 18900, demand: 0.7 },
  { CenterId: 'CTR-ONL', City: 'Live online', Country: 'Global', Region: 'Global', Seats: 40, OpenedDate: '2024-09-01', MonthlyFixedCost: 3200, demand: 1.1 }
]
const PROGRAMMES = [
  { code: 'FND', name: 'CRM Analytics Foundations', days: 5, price: 1450, w: 40 },
  { code: 'DSQ', name: 'Dashboards & SAQL', days: 5, price: 1650, w: 28 },
  { code: 'GTM', name: 'Go-to-Market Analytics', days: 10, price: 2900, w: 14 },
  { code: 'CERT', name: 'Certification Bootcamp', days: 3, price: 890, w: 18 }
]
const INSTRUCTORS = Array.from({ length: 9 }, () => personName())

const centers = CENTERS.map(c => ({ CenterId: c.CenterId, City: c.City, Country: c.Country, Region: c.Region, Seats: c.Seats, OpenedDate: c.OpenedDate, MonthlyFixedCost: c.MonthlyFixedCost, CenterManager: personName() }))
emit('centers.csv', centers)

const batches = []
const enrollments = []
let bSeq = 1
let eSeq = 1
const corporate = payingAccounts.filter(a => a.Segment !== 'Self-Serve')
for (const c of CENTERS) {
  // A batch roughly every two to three weeks per center, from opening day.
  for (let d = new Date(Math.max(new Date(c.OpenedDate), START)); d <= addDays(END, -14); d = addDays(d, int(12, 24))) {
    const prog = weighted(PROGRAMMES.map(p => [p, p.w]))
    const start = iso(d)
    const t = daysBetween(START, start) / daysBetween(START, END)
    const fill = Math.max(0.12, Math.min(1, gauss(0.62 * c.demand * (0.85 + t * 0.35), 0.18)))
    const seatsSold = Math.max(3, Math.min(c.Seats, Math.round(c.Seats * fill)))
    const id = `BAT-${String(5000 + bSeq++)}`
    const isPast = addDays(d, prog.days) < END
    // Price varies by market: India is priced for India.
    const priceFactor = c.Country === 'India' ? 0.55 : 1
    let revenue = 0
    let attended = 0
    let completed = 0
    let passed = 0
    let csatSum = 0
    let csatN = 0
    for (let i = 0; i < seatsSold; i++) {
      const acct = chance(0.46) ? pick(corporate) : null
      const discount = acct ? weighted([[10, 40], [15, 30], [20, 20], [25, 10]]) : weighted([[0, 60], [10, 25], [20, 15]])
      const paid = Math.round(prog.price * priceFactor * (1 - discount / 100))
      const att = isPast && chance(0.92)
      const comp = att && chance(prog.days >= 10 ? 0.74 : 0.86)
      const certTry = comp && (prog.code === 'CERT' ? chance(0.9) : chance(0.35))
      const pass = certTry && chance(prog.code === 'CERT' ? 0.78 : 0.64)
      const csat = comp && chance(0.7) ? Math.max(1, Math.min(5, Math.round(gauss(4.3, 0.7)))) : ''
      revenue += paid
      if (att) attended++
      if (comp) completed++
      if (pass) passed++
      if (csat !== '') {
        csatSum += csat
        csatN++
      }
      enrollments.push({
        EnrollmentId: `ENR-${String(80000 + eSeq++)}`,
        BatchId: id,
        CenterId: c.CenterId,
        City: c.City,
        Region: c.Region,
        ProgrammeCode: prog.code,
        Programme: prog.name,
        StartDate: start,
        EnrolledDate: iso(addDays(d, -int(3, 45))),
        LearnerName: personName(),
        LearnerType: acct ? 'Corporate' : 'Individual',
        AccountId: acct ? acct.AccountId : '',
        AccountName: acct ? acct.AccountName : '',
        Channel: acct ? 'Corporate Booking' : weighted([['Organic Search', 30], ['Free Course', 26], ['Paid Search', 16], ['AI Assistant Referral', 12], ['Customer Referral', 9], ['Paid Social', 7]]),
        ListPrice: Math.round(prog.price * priceFactor),
        DiscountPct: discount,
        PricePaid: paid,
        Attended: att,
        Completed: comp,
        CertAttempted: certTry,
        CertPassed: pass,
        CSAT: csat
      })
    }
    batches.push({
      BatchId: id,
      CenterId: c.CenterId,
      City: c.City,
      Region: c.Region,
      ProgrammeCode: prog.code,
      Programme: prog.name,
      StartDate: start,
      EndDate: iso(addDays(d, prog.days + (prog.days >= 10 ? 4 : 0))),
      Days: prog.days,
      Instructor: pick(INSTRUCTORS),
      Capacity: c.Seats,
      SeatsSold: seatsSold,
      SeatsAttended: attended,
      Completed: completed,
      CertPassed: passed,
      UtilizationPct: round((seatsSold / c.Seats) * 100, 1),
      Revenue: revenue,
      Status: isPast ? 'Completed' : 'Scheduled',
      AvgCSAT: csatN ? round(csatSum / csatN, 2) : ''
    })
  }
}
emit('batches.csv', batches)
emit('enrollments.csv', enrollments)

/* ============================================================== SELF-CHECK
   Printed, not asserted. If a future edit breaks a relationship the reader is
   told to rely on, it should be obvious the moment the generator runs -- and a
   hard assert would stop a teaching script from producing anything at all. */
const sum = (a, f) => a.reduce((s, x) => s + (Number(f(x)) || 0), 0)
const lineSum = new Map()
for (const l of oppProducts) lineSum.set(l.OpportunityId, (lineSum.get(l.OpportunityId) || 0) + l.ARR)
const mismatched = opps.filter(o => Math.round(lineSum.get(o.OpportunityId) || 0) !== Math.round(o.ARR))
const campLeadDrift = campaigns.filter(c => c.Leads !== leads.filter(l => l.CampaignId === c.CampaignId).length)
const batchDrift = batches.filter(b => b.SeatsSold !== enrollments.filter(e => e.BatchId === b.BatchId).length)

const manifest = {
  generatedAt: new Date().toISOString().slice(0, 10),
  seed: SEED,
  scale: SCALE,
  window: { from: iso(START), to: iso(END) },
  company: 'CRM Analytics Academy — online courses, team plans, classroom training centers, certification and implementation',
  files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, { rows: v.length, columns: v.length ? Object.keys(v[0]).length : 0 }])),
  checks: {
    opportunityLinesReconcile: mismatched.length === 0,
    campaignLeadCountsReconcile: campLeadDrift.length === 0,
    batchSeatsReconcile: batchDrift.length === 0,
    classroomRevenue: Math.round(sum(batches, b => b.Revenue)),
    totalPipeline: Math.round(sum(opps.filter(o => !o.IsClosed), o => o.Amount)),
    totalClosedWon: Math.round(sum(opps.filter(o => o.IsWon), o => o.Amount)),
    leadToOppRatePct: round((opps.filter(o => o.OriginatingLeadId).length / leads.length) * 100, 2),
    winRatePct: round((opps.filter(o => o.IsWon).length / Math.max(1, opps.filter(o => o.IsClosed).length)) * 100, 2)
  }
}
writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

const pad = s => String(s).padEnd(28)
console.log(`\nAcademy warehouse -> ${OUT}  (seed ${SEED}, scale ${SCALE})\n`)
for (const [name, meta] of Object.entries(manifest.files)) {
  console.log(`  ${pad(name)} ${String(meta.rows).padStart(7)} rows  ${String(meta.columns).padStart(3)} cols`)
}
console.log(`\n  opportunity lines reconcile : ${mismatched.length === 0 ? 'yes' : `NO (${mismatched.length} off)`}`)
console.log(`  campaign lead counts match  : ${campLeadDrift.length === 0 ? 'yes' : `NO (${campLeadDrift.length} off)`}`)
console.log(`  open pipeline               : $${manifest.checks.totalPipeline.toLocaleString('en-US')}`)
console.log(`  closed won                  : $${manifest.checks.totalClosedWon.toLocaleString('en-US')}`)
console.log(`  lead -> opp rate            : ${manifest.checks.leadToOppRatePct}%`)
console.log(`  win rate (closed deals)     : ${manifest.checks.winRatePct}%\n`)
