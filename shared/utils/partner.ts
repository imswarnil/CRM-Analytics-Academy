/**
 * Sponsorship rules shared by the browser and the Worker, so the studio's
 * live validation and the API's checks can never disagree.
 *
 * Named "partner" rather than "sponsor" on purpose: filter lists match some
 * paths containing "sponsor", and anything that ships on a lesson page must
 * not look like something an ad blocker removes.
 *
 * One sponsor per calendar month (UTC), exclusive, every placement.
 */
export const PARTNER_PRICE_USD = 99
export const PARTNER_MONTHS_AHEAD = 12
export const PARTNER_HOLD_MINUTES = 30
/** The current month stays bookable while at least this many days remain. */
export const PARTNER_MIN_DAYS_LEFT = 10

export type PartnerFormat = 'leaderboard' | 'square' | 'text'
export type PartnerMode = 'image' | 'designed'
export type PartnerTheme = 'paper' | 'navy' | 'signal'

/** A creative as the serving API hands it to the browser. */
export interface PartnerCreative {
  id: string
  format: PartnerFormat
  mode: PartnerMode
  imageUrl: string | null
  imageMobileUrl: string | null
  logoUrl: string | null
  headline: string | null
  body: string | null
  cta: string | null
  theme: PartnerTheme
  alt: string | null
  sponsor: string
}

export const PARTNER_LIMITS = {
  headline: 60,
  body: 140,
  cta: 24,
  alt: 140,
  /** Upload cap for creative images. */
  bytes: 1024 * 1024
} as const

/**
 * Image specs per slot. `w`×`h` is the true display size; uploads may be that
 * size or exactly 2× (for sharp screens). `kind` is what the upload route is
 * told the picture is for.
 */
export const PARTNER_IMAGE_SPECS = {
  leaderboard: { w: 728, h: 90, label: 'Leaderboard 728×90' },
  leaderboardMobile: { w: 320, h: 100, label: 'Mobile leaderboard 320×100' },
  square: { w: 300, h: 250, label: 'Medium rectangle 300×250' },
  squareOne: { w: 600, h: 600, label: 'Square 1:1 (at least 300×300)' },
  logo: { w: 96, h: 96, label: 'Logo, square, at least 96×96' }
} as const
export type PartnerImageKind = keyof typeof PARTNER_IMAGE_SPECS

/**
 * Whether an image of these pixel dimensions fits a slot. Exact size or 2×
 * for the fixed units; any 1:1 picture of at least 300px for the square
 * alternative; any square-ish picture of at least 96px for a logo.
 */
export function partnerImageFits(kind: PartnerImageKind, w: number, h: number): boolean {
  if (!w || !h) return false
  if (kind === 'squareOne') return w === h && w >= 300 && w <= 2400
  if (kind === 'logo') return Math.abs(w - h) <= Math.max(w, h) * 0.05 && w >= 96 && w <= 1024
  const s = PARTNER_IMAGE_SPECS[kind]
  return (w === s.w && h === s.h) || (w === s.w * 2 && h === s.h * 2)
}

/** "2026-11" for a Date or a "2026-11-01" date string. */
export function partnerMonthKey(d: Date | string): string {
  if (typeof d === 'string') return d.slice(0, 7)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** The next `count` month keys starting with the current UTC month. */
export function partnerMonthWindow(now = new Date(), count = PARTNER_MONTHS_AHEAD): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(partnerMonthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1))))
  }
  return out
}

/** The month after `key`. */
export function partnerNextMonth(key: string): string {
  const [y, m] = key.split('-').map(Number) as [number, number]
  return partnerMonthKey(new Date(Date.UTC(y, m, 1)))
}

/** False for the current month once fewer than PARTNER_MIN_DAYS_LEFT days remain. */
export function partnerMonthOpen(key: string, now = new Date()): boolean {
  const current = partnerMonthKey(now)
  if (key < current) return false
  if (key > current) return true
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate()
  return daysInMonth - now.getUTCDate() + 1 >= PARTNER_MIN_DAYS_LEFT
}

export const PARTNER_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
