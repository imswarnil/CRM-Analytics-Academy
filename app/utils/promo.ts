/**
 * The AdSense inventory, by name. One client, many slots; each placement on
 * the site names the unit it shows here, so a slot id lives in one place.
 *
 * Files, components and CSS are named "promo", never "ad": filter lists block
 * modules whose URL matches /ad/, and a lesson that imports a blocked module
 * fails to render at all.
 */
export const PROMO_CLIENT = 'ca-pub-1291242080282540'

export interface PromoUnit {
  slot: string
  /** Fixed size in CSS px, or null for responsive / fluid. */
  size: [number, number] | null
  /** data-ad-format; 'fluid' + layout for in-article, 'autorelaxed' for multiplex. */
  format?: 'auto' | 'fluid' | 'autorelaxed' | 'horizontal' | 'vertical' | 'rectangle'
  layout?: 'in-article'
  /** Space reserved before the unit fills, so the page never jumps. */
  minHeight: number
  label: string
}

export const PROMO_UNITS = {
  inArticle: { slot: '6501428979', size: null, format: 'fluid', layout: 'in-article', minHeight: 180, label: 'In-article' },
  banner980x120: { slot: '7400425360', size: [980, 120], minHeight: 120, label: '980 × 120' },
  skyscraper300x1050: { slot: '2712169578', size: [300, 1050], minHeight: 1050, label: '300 × 1050' },
  skyscraper300x600: { slot: '9488965956', size: [300, 600], minHeight: 600, label: '300 × 600' },
  skyscraper160x600: { slot: '4394096538', size: [160, 600], minHeight: 600, label: '160 × 600' },
  large336x280: { slot: '1684851337', size: [336, 280], minHeight: 280, label: '336 × 280' },
  square250: { slot: '6066270853', size: [250, 250], minHeight: 250, label: '250 × 250' },
  square300x250: { slot: '9619442326', size: [300, 250], minHeight: 250, label: '300 × 250' },
  multiplexVertical: { slot: '3375031396', size: null, format: 'autorelaxed', minHeight: 400, label: 'Recommended' },
  multiplexHorizontal: { slot: '6808134701', size: null, format: 'autorelaxed', minHeight: 280, label: 'Recommended' },
  button300x60: { slot: '3836856744', size: [300, 60], minHeight: 60, label: '300 × 60' },
  mobileLeaderboard: { slot: '4003326983', size: [300, 50], minHeight: 50, label: '300 × 50' },
  responsiveLeaderboard: { slot: '4774277934', size: null, format: 'horizontal', minHeight: 90, label: 'Leaderboard' },
  billboard970x250: { slot: '4921873558', size: [970, 250], minHeight: 250, label: '970 × 250' },
  leaderboard980x90: { slot: '8539588233', size: [980, 90], minHeight: 90, label: '980 × 90' },
  leaderboard728x90: { slot: '1864856299', size: [728, 90], minHeight: 90, label: '728 × 90' },
  vertical: { slot: '3487917390', size: null, format: 'vertical', minHeight: 600, label: 'Vertical' },
  horizontal: { slot: '8939839370', size: null, format: 'horizontal', minHeight: 90, label: 'Horizontal' },
  square: { slot: '7663977887', size: null, format: 'rectangle', minHeight: 250, label: 'Square' }
} as const satisfies Record<string, PromoUnit>

export type PromoUnitName = keyof typeof PROMO_UNITS

/** No promos on these: the console, the auth forms and the submit form. */
export function promoAllowed(path: string): boolean {
  return !/^(\/[a-z]{2})?\/(admin|sign-in|sign-up|submit)(\/|$)/.test(path)
}

/**
 * Splices an in-article unit into a lesson body (minimark: [tag, props,
 * ...children] nodes) after every `every`-th top-level block, never before a
 * heading's content starts and never as the last node. Rendered by
 * ContentRenderer as <PromoSlot unit="inArticle">, which is why PromoSlot is
 * registered globally.
 */
export function withInArticlePromos<T extends unknown[]>(nodes: T, every = 6, max = 4): T {
  const out: unknown[] = []
  let count = 0
  let placed = 0
  nodes.forEach((node, i) => {
    out.push(node)
    const tag = Array.isArray(node) ? node[0] : null
    if (tag === 'p' || tag === 'ul' || tag === 'ol' || tag === 'pre' || tag === 'table') count++
    const next = nodes[i + 1]
    const nextTag = Array.isArray(next) ? next[0] : null
    if (count >= every && placed < max && i < nodes.length - 2 && nextTag !== 'h3') {
      out.push(['promo-slot', { unit: 'inArticle' }])
      count = 0
      placed++
    }
  })
  return out as T
}
