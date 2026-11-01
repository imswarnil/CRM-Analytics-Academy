/**
 * The Academy's three plans (shared: /pro, POST /api/leads, POST /api/redeem,
 * the Salesforce price book in salesforce/academy).
 *
 *   free   everything public, no ads once signed in
 *   pro    every Pro lesson, paid in POINTS: every account starts with
 *          WELCOME_POINTS and earns more by learning and contributing
 *   seats  Pro for a company, team or university, per seat — a request
 *          (a lead), never self-serve; the owner sets the seats in /admin
 *
 * The Academy is points only: no payments, no money prices (decided
 * 2026-11-01). Copy is i18n (`products.<id>.*`); the id is what a lead and
 * Salesforce record.
 */
export type ProductId = 'free' | 'pro' | 'seats'

export const WELCOME_POINTS = 1000
/** Points for one Pro period, and its length in days. */
export const PRO_POINTS = 1000
export const PRO_DAYS = 30

export interface Product {
  id: ProductId
  icon: string
  /** Cost in points per period; null = not bought with points. */
  points: number | null
  /** How many feature lines exist under products.<id>.f1…fN. */
  features: number
  audience: 'individual' | 'business'
  featured?: boolean
}

export const PRODUCTS: Product[] = [
  { id: 'free', icon: 'i-lucide-book-open', points: 0, features: 5, audience: 'individual' },
  { id: 'pro', icon: 'i-lucide-sparkles', points: PRO_POINTS, features: 5, audience: 'individual', featured: true },
  { id: 'seats', icon: 'i-lucide-building-2', points: null, features: 5, audience: 'business' }
]

/** Organisations that can ask for seats. */
export const ORG_KINDS = ['company', 'team', 'university'] as const
export type OrgKind = typeof ORG_KINDS[number]

/** Anything a lead can be about: a plan, or an interest from elsewhere on the site. */
export const LEAD_INTERESTS = ['pro', 'seats', 'salesforce-setup', 'consulting', 'mentoring'] as const

export const productById = (id: string) => PRODUCTS.find(p => p.id === id)
