/**
 * The Academy's business, in one place (shared by /pro, /team, /sponsor, the
 * meter, Stripe and the Salesforce price book in salesforce/crm).
 *
 *   visitor   ANON_SESSIONS pages, then asked to sign up (server/utils/meter.ts)
 *   free      a free account: every free lesson and tool, unlimited, with ads
 *   pro       every paid lesson (`access: pro`), no ads — Stripe subscription
 *   team      Pro per seat; one admin buys seats and assigns them (app.org)
 *   sponsor   a one-time sitewide banner (request → Stripe invoice → live)
 *
 * Prices are USD. Stripe products/prices are created by `pnpm stripe:setup`
 * and found at runtime by their lookup_key, so changing a price here and
 * re-running the setup is the whole job. Points are gamification only.
 */
export type ProductId = 'free' | 'pro' | 'team'

export const WELCOME_POINTS = 1000
export const ANON_SESSIONS = 10
export const ANON_WINDOW_DAYS = 30

export interface Price {
  /** Stripe lookup_key — the stable id code and Salesforce use. */
  key: string
  /** USD, whole dollars. */
  usd: number
  interval?: 'month' | 'year'
  /** One-time products: how many days the purchase lasts. */
  days?: number
}

export const PRICES = {
  proMonthly: { key: 'crma_pro_monthly', usd: 15, interval: 'month' },
  proYearly: { key: 'crma_pro_yearly', usd: 150, interval: 'year' },
  teamSeat: { key: 'crma_team_seat_monthly', usd: 10, interval: 'month' },
  sponsorWeek: { key: 'crma_sponsor_7d', usd: 99, days: 7 },
  sponsorMonth: { key: 'crma_sponsor_30d', usd: 299, days: 30 }
} as const satisfies Record<string, Price>

export type PlanKey = 'proMonthly' | 'proYearly'
export type SponsorPackage = 'sponsorWeek' | 'sponsorMonth'
export const SPONSOR_PACKAGES: SponsorPackage[] = ['sponsorWeek', 'sponsorMonth']
export const TEAM_MIN_SEATS = 2

export interface Product {
  id: ProductId
  icon: string
  /** How many feature lines exist under products.<id>.f1…fN. */
  features: number
  featured?: boolean
}

/** The three plans on /pro. */
export const PRODUCTS: Product[] = [
  { id: 'free', icon: 'i-lucide-book-open', features: 4 },
  { id: 'pro', icon: 'i-lucide-sparkles', features: 5, featured: true },
  { id: 'team', icon: 'i-lucide-users', features: 5 }
]

/** Pages that count against a visitor's free pages: lessons, interview answers, visualisers. */
export function isMeteredPath(path: string): boolean {
  const p = path.replace(/^\/(es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (/^\/(interview-questions\/(?!new$)[a-z0-9-]+|visualiser\/(saql|recipe|dataflow))$/.test(p)) return true
  return /^\/[a-z0-9-]+\/[a-z0-9-]+$/.test(p) && !/^\/(certification|interview-questions|visualiser|admin|api|raw|team|dashboard|submit|sign-in|sign-up|pro|people|sponsor)\//.test(p)
}

/** Organisations that can ask for seats. */
export const ORG_KINDS = ['company', 'team', 'university'] as const
export type OrgKind = typeof ORG_KINDS[number]

/** Anything a lead can be about: a plan, or an interest from elsewhere on the site. */
export const LEAD_INTERESTS = ['pro', 'seats', 'sponsorship', 'salesforce-setup', 'consulting', 'mentoring'] as const

export const productById = (id: string) => PRODUCTS.find(p => p.id === id)
