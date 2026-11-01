/**
 * How access works (shared: /pro, the meter, POST /api/leads, the Salesforce
 * price book in salesforce/crm). Usage-based: SESSIONS, paid in POINTS.
 *
 *   visitor  ANON_SESSIONS sessions per 30 days, no account
 *   account  ACCOUNT_SESSIONS sessions in total and WELCOME_POINTS points
 *   pack     PACK_SESSIONS more sessions for PACK_POINTS points, any time
 *   seats    unlimited for a company, team or university — by request (a
 *            lead) or automatically by verified email domain
 *
 * Never money (decided 2026-11-01): points are earned by learning (+10 a
 * lesson, +2 a quiz answer, +25 an approved contribution). Copy is i18n
 * (`products.<id>.*`); the ids are what Salesforce records.
 */
export type ProductId = 'visitor' | 'account' | 'pack' | 'seats'

export const WELCOME_POINTS = 1000
export const ANON_SESSIONS = 10
export const ANON_WINDOW_DAYS = 30
export const ACCOUNT_SESSIONS = 100
export const PACK_SESSIONS = 10
/** What a pack costs, in points. Swap for a price if that ever changes — nothing else needs to. */
export const PACK_POINTS = 100

/** Pages that cost a session: lessons, interview answers, visualisers. */
export function isMeteredPath(path: string): boolean {
  const p = path.replace(/^\/(es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (/^\/(interview-questions\/(?!new$)[a-z0-9-]+|visualiser\/(saql|recipe|dataflow))$/.test(p)) return true
  // A lesson is /<section>/<lesson>; app pages with two segments are not.
  return /^\/[a-z0-9-]+\/[a-z0-9-]+$/.test(p) && !/^\/(certification|interview-questions|visualiser|admin|api|raw|team|dashboard|submit|sign-in|sign-up|pro|people)\//.test(p)
}

export interface Product {
  id: ProductId
  icon: string
  /** How many feature lines exist under products.<id>.f1…fN. */
  features: number
  featured?: boolean
}

/** The four ways in, smallest first (rendered by /pro). */
export const PRODUCTS: Product[] = [
  { id: 'visitor', icon: 'i-lucide-eye', features: 3 },
  { id: 'account', icon: 'i-lucide-user-plus', features: 4, featured: true },
  { id: 'pack', icon: 'i-lucide-ticket', features: 3 },
  { id: 'seats', icon: 'i-lucide-building-2', features: 4 }
]

/** Organisations that can ask for seats. */
export const ORG_KINDS = ['company', 'team', 'university'] as const
export type OrgKind = typeof ORG_KINDS[number]

/** Anything a lead can be about: a plan, or an interest from elsewhere on the site. */
export const LEAD_INTERESTS = ['pro', 'seats', 'salesforce-setup', 'consulting', 'mentoring'] as const

export const productById = (id: string) => PRODUCTS.find(p => p.id === id)
