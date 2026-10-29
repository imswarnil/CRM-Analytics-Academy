/**
 * What the Academy sells (shared: the /pro page and POST /api/leads read it). There is no checkout: "Get it" files a lead
 * (POST /api/leads → app.lead + a Salesforce Lead via Web-to-Lead) and the
 * owner follows up, invoices, and grants access in /admin.
 *
 * Prices are shown as the price; nothing here charges anyone. Product names,
 * taglines and features are translated through i18n (`products.<id>.*`);
 * the ids are what the lead and Salesforce record.
 */
export type ProductId = 'pro' | 'bootcamp' | 'mentoring' | 'dashboard-review' | 'interview-prep' | 'team' | 'consulting'

export interface Product {
  id: ProductId
  icon: string
  /** Display price, e.g. "$12"; null = "Let's talk". */
  price: string | null
  /** i18n key suffix for the unit: perMonth, perYear, once, perSeat. */
  unit?: 'perMonth' | 'once' | 'perSession' | 'perSeat'
  /** How many feature lines exist under products.<id>.f1…fN. */
  features: number
  audience: 'individual' | 'business'
  /** Pro is granted to an account, so asking for it needs one. */
  needsAccount: boolean
  featured?: boolean
}

export const PRODUCTS: Product[] = [
  { id: 'pro', icon: 'i-lucide-sparkles', price: '$12', unit: 'perMonth', features: 5, audience: 'individual', needsAccount: true, featured: true },
  { id: 'bootcamp', icon: 'i-lucide-graduation-cap', price: '$299', unit: 'once', features: 4, audience: 'individual', needsAccount: true },
  { id: 'interview-prep', icon: 'i-lucide-messages-square', price: '$99', unit: 'once', features: 4, audience: 'individual', needsAccount: false },
  { id: 'mentoring', icon: 'i-lucide-video', price: '$79', unit: 'perSession', features: 3, audience: 'individual', needsAccount: false },
  { id: 'dashboard-review', icon: 'i-lucide-scan-search', price: '$149', unit: 'once', features: 3, audience: 'business', needsAccount: false },
  { id: 'team', icon: 'i-lucide-users', price: '$180', unit: 'perSeat', features: 4, audience: 'business', needsAccount: false },
  { id: 'consulting', icon: 'i-lucide-briefcase-business', price: null, features: 4, audience: 'business', needsAccount: false }
]

export const productById = (id: string) => PRODUCTS.find(p => p.id === id)
