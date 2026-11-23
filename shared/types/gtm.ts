/** What /api/admin/leads returns about one person's enrichment and Salesforce sync (admin only). */
export interface LeadEnrichment {
  emailDomain: string | null
  domainKind: string | null
  company: string | null
  website: string | null
  linkedin: string | null
  logo: string | null
  description: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  networkOrg: string | null
  networkKind: string | null
  firstTouch: string | null
  lastEvent: string | null
  score: number
  fit: number
  engagement: number
  grade: string
  reasons: { points: number, kind: string, why: string }[]
  signals: Record<string, unknown>
  enrichedAt: string | null
}

export interface LeadSyncState {
  status: string
  at: string
  sfId: string | null
}
