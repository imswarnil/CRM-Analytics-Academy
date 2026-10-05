/**
 * Promo slots: which format each named placement shows.
 *
 * One sponsor per calendar month fills every slot on the site with the
 * creative they published for that slot's format; a month with no sponsor
 * shows the house placeholder linking to /sponsor. The placement names are
 * the ones pages already use (`<PromoSlot placement="sidebarSquare">`), so no
 * page had to change when AdSense was replaced.
 *
 *   leaderboard  728×90 (320×100 on phones) — banners across a content column
 *   square       300×250 — side rails
 *   text         logo + headline + line + link — inside and after lessons
 *
 * Names here avoid "ad": filter lists block modules whose URL matches, and a
 * lesson that imports a blocked module does not render.
 */
import type { PartnerFormat } from '#shared/utils/partner'

export const PROMO_PLACEMENTS = {
  headerBanner: 'leaderboard',
  billboard: 'leaderboard',
  belowHero: 'leaderboard',
  betweenSections: 'leaderboard',
  endOfArticle: 'leaderboard',
  footer: 'leaderboard',
  mobileBanner: 'leaderboard',
  largeDisplay: 'leaderboard',
  sidebarSquare: 'square',
  sidebar: 'square',
  stickySidebar: 'square',
  mobileInline: 'square',
  smallWidget: 'square',
  inArticle: 'text',
  relatedPosts: 'text',
  afterArticle: 'text'
} as const satisfies Record<string, PartnerFormat>

export type PromoPlacementName = keyof typeof PROMO_PLACEMENTS

/**
 * The reserved box per format, as Tailwind classes, shared by the live
 * creative, the house placeholder and the loading skeleton — so whichever
 * arrives, nothing on the page moves. The sizes are the true creative sizes,
 * scaled down proportionally in a narrower column.
 */
export const PROMO_BOX: Record<PartnerFormat, string> = {
  leaderboard: 'mx-auto w-full max-w-[320px] aspect-[320/100] sm:max-w-[728px] sm:aspect-[728/90]',
  square: 'mx-auto w-full max-w-[300px] aspect-[300/250]',
  text: 'w-full h-32'
}

/**
 * Pro readers see no promos. Whether a reader is Pro is only known after
 * /api/progress answers, which is after first paint — so the answer is also
 * kept in localStorage, and an inline <head> script (nuxt.config) marks
 * <html data-pro> before paint on the next visit. CSS there hides every slot,
 * so a returning Pro reader never sees space reserved and then collapsed.
 */
export const PRO_FLAG_KEY = 'crma-pro'
export function rememberPro(isPro: boolean) {
  if (import.meta.server) return
  try {
    if (isPro) localStorage.setItem(PRO_FLAG_KEY, '1')
    else localStorage.removeItem(PRO_FLAG_KEY)
  } catch { /* storage blocked: the slot just hides after load instead */ }
  document.documentElement.toggleAttribute('data-pro', isPro)
}
