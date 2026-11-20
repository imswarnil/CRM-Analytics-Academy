/**
 * The Academy's offer, in one place (read by /pro, the lesson gate, Stripe,
 * the admin console and Salesforce).
 *
 *   B2C  free       every `access: free` lesson (the default), with ads
 *        monthly    Pro — everything, no ads — a monthly Stripe subscription
 *        yearly     Pro for a year — a yearly Stripe subscription
 *        lifetime   Pro, forever — one Stripe payment
 *   B2B  teams      Pro for every seat of a company, college or team — a
 *                   sales conversation (POST /api/leads) → an org created in
 *                   /admin → members join with a code (and, for colleges,
 *                   a matching email domain)
 *
 * PLANS is data: /pro renders it, so adding or re-pricing a plan is an edit
 * here (and `pnpm stripe:setup` for a self-serve one). Points are
 * gamification only.
 */
export type Access = 'free' | 'pro'
export type PlanId = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'teams'

export const WELCOME_POINTS = 1000

export interface Price {
  /** Stripe lookup_key — the stable id code and Salesforce use. */
  key: string
  /** USD, whole dollars. */
  usd: number
  interval?: 'month' | 'year'
}

export const PRICES = {
  monthly: { key: 'crma_pro_monthly', usd: 19, interval: 'month' },
  yearly: { key: 'crma_pro_yearly', usd: 119, interval: 'year' },
  lifetime: { key: 'crma_pro_lifetime', usd: 249 }
} as const satisfies Record<string, Price>
export type PaidPlan = keyof typeof PRICES
/** The paid plans that renew (Stripe subscriptions). */
export const SUBSCRIPTION_PLANS = ['monthly', 'yearly'] as const
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number]
export const isSubscriptionPlan = (v: unknown): v is SubscriptionPlan => v === 'monthly' || v === 'yearly'

export interface Plan {
  id: PlanId
  icon: string
  /** 'b2c' plans are bought on the page; 'b2b' starts a conversation. */
  audience: 'b2c' | 'b2b'
  /** How many feature lines exist under plans.<id>.f1…fN in en.json. */
  features: number
  featured?: boolean
}

export const PLANS: Plan[] = [
  { id: 'free', icon: 'i-lucide-book-open', audience: 'b2c', features: 4 },
  { id: 'monthly', icon: 'i-lucide-calendar-sync', audience: 'b2c', features: 5 },
  { id: 'yearly', icon: 'i-lucide-calendar-check', audience: 'b2c', features: 5, featured: true },
  { id: 'lifetime', icon: 'i-lucide-infinity', audience: 'b2c', features: 5 },
  { id: 'teams', icon: 'i-lucide-building-2', audience: 'b2b', features: 5 }
]

/** Whether someone holding `has` may open a lesson marked `needs`. */
export function canOpen(has: Access, needs: Access): boolean {
  return has === 'pro' || needs === 'free'
}

/** A lesson's access level from its frontmatter (anything unknown is free). */
export function accessOf(value: unknown): Access {
  return value === 'pro' ? 'pro' : 'free'
}

/** Organisations that buy seats. */
export const ORG_KINDS = ['company', 'college', 'team'] as const
export type OrgKind = typeof ORG_KINDS[number]

/** Anything a lead can be about. */
export const LEAD_INTERESTS = ['seats', 'sponsorship', 'salesforce-setup', 'consulting', 'mentoring'] as const
