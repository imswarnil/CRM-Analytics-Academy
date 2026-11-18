/**
 * The weekly CRM Analytics jobs feed — public/jobs.json, a static file written
 * once a day by the scheduled job (scripts/jobs/README.md). Fetched in the
 * browser from the CDN, so neither the Worker nor the database is involved.
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
  source?: string
  skills?: string[]
}
export interface JobsFeed {
  updated: string | null
  week: string | null
  jobs: Job[]
}

export function useJobs() {
  return useLazyFetch<JobsFeed>('/jobs.json', {
    key: 'jobs-feed',
    server: false,
    default: () => ({ updated: null, week: null, jobs: [] })
  })
}
