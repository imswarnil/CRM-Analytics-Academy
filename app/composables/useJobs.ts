/**
 * The weekly CRM Analytics jobs feed — public/jobs.json, a static file written
 * once a day by the scheduled job (scripts/jobs/README.md). Fetched in the
 * browser from the CDN, so neither the Worker nor the database is involved.
 * Every link is re-checked on each run: `status` says what it found.
 */
export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote?: boolean
  country?: string
  level?: 'junior' | 'mid' | 'senior' | 'lead'
  posted: string
  url: string
  /** Who owns the link: "Workday", "Greenhouse", "Company site", "LinkedIn"… */
  source?: string
  /** Where it was found: "Company board", "Google Jobs", "Arbeitnow"… */
  via?: string
  skills?: string[]
  status?: 'live' | 'expired' | 'unknown'
  checkedAt?: string
  verifiedAt?: string
  expiredAt?: string
  unknownRuns?: number
}
export interface JobsMeta {
  generatedAt: string
  checkedAt: string
  counts: {
    total: number
    live: number
    expired: number
    unknown: number
    unverified: number
  }
  sources: { name: string, n: number }[]
  found: { name: string, n: number }[]
  dropped: {
    notOwner: number
    closedOnArrival: number
    expiredGone: number
    old: number
  }
  rules: {
    keepDays: number
    expiredDays: number
    unverifiedRuns: number
  }
}
export interface JobsFeed {
  updated: string | null
  week: string | null
  meta?: JobsMeta
  jobs: Job[]
}

/** "No longer active" — the check found it closed. */
export const jobExpired = (j: Job) => j.status === 'expired'
/** Unknown for several runs in a row (LinkedIn's 999, a 403…): shown with care. */
export const jobUnverified = (j: Job, runs = 3) => j.status === 'unknown' && (j.unknownRuns ?? 0) >= runs

export function useJobs() {
  return useLazyFetch<JobsFeed>('/jobs.json', {
    key: 'jobs-feed',
    server: false,
    default: () => ({ updated: null, week: null, jobs: [] })
  })
}
