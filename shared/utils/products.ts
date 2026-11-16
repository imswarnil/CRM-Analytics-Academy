/**
 * The Academy's offer, in one place (read by /pro, the lesson gate, Stripe,
 * the admin console and Salesforce). Three ways in, one per access level:
 *
 *   free        every `access: free` lesson (the default) — no account needed
 *   youtube     lessons marked `access: youtube` — sign in, then verify a
 *               subscription to the YouTube channel with Google (or subscribe
 *               from the page). Re-checked every YOUTUBE_RECHECK_DAYS.
 *   all-access  everything, `access: pro` lessons included — a single
 *               one-time payment through Stripe Checkout. No subscription.
 *
 * PLANS is data: the pricing page renders whatever is listed here, so adding,
 * removing or re-pricing a tier is an edit to this file (and, for a paid one,
 * `pnpm stripe:setup`). Points are gamification only.
 */
export type Access = 'free' | 'youtube' | 'pro'
export type PlanId = 'free' | 'youtube' | 'all-access'

export const WELCOME_POINTS = 1000
export const YOUTUBE_RECHECK_DAYS = 30

export interface Price {
  /** Stripe lookup_key — the stable id code and Salesforce use. */
  key: string
  /** USD, whole dollars. */
  usd: number
}

export const PRICES = {
  allAccess: { key: 'crma_all_access', usd: 99 }
} as const satisfies Record<string, Price>

export interface Plan {
  id: PlanId
  icon: string
  /** The access level this plan unlocks (and every level below it). */
  unlocks: Access
  /** USD, one-time; 0 = free. */
  usd: number
  /** How many feature lines exist under plans.<id>.f1…fN in en.json. */
  features: number
  featured?: boolean
}

export const PLANS: Plan[] = [
  { id: 'free', icon: 'i-lucide-book-open', unlocks: 'free', usd: 0, features: 4 },
  { id: 'youtube', icon: 'i-simple-icons-youtube', unlocks: 'youtube', usd: 0, features: 4 },
  { id: 'all-access', icon: 'i-lucide-infinity', unlocks: 'pro', usd: PRICES.allAccess.usd, features: 6, featured: true }
]

const RANK: Record<Access, number> = { free: 0, youtube: 1, pro: 2 }

/** Whether someone holding `has` may open a lesson marked `needs`. */
export function canOpen(has: Access, needs: Access): boolean {
  return RANK[has] >= RANK[needs]
}

/** A lesson's access level from its frontmatter (anything unknown is free). */
export function accessOf(value: unknown): Access {
  return value === 'pro' || value === 'youtube' ? value : 'free'
}

/** Organisations that can ask about company training. */
export const ORG_KINDS = ['company', 'team', 'university'] as const
export type OrgKind = typeof ORG_KINDS[number]

/** Anything a lead can be about. */
export const LEAD_INTERESTS = ['all-access', 'seats', 'salesforce-setup', 'consulting', 'mentoring'] as const
