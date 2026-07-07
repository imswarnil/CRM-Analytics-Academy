/**
 * Centralised Google AdSense configuration.
 *
 * One place to manage the publisher id and every ad slot. Each placement holds
 * an ordered list of breakpoint variants; `useAdSlot()` picks the right one for
 * the current viewport so a single `<AdUnit>` adapts to screen size & layout.
 */

export const ADSENSE_CLIENT = 'ca-pub-1291242080282540'

export type AdFormat = 'auto' | 'horizontal' | 'vertical' | 'rectangle' | 'fluid' | 'autorelaxed'

export interface AdVariant {
  /** Active when viewport width is >= min (inclusive). */
  min?: number
  /** Active when viewport width is < max (exclusive). */
  max?: number
  /** AdSense slot id (data-ad-slot). */
  slot: string
  /** data-ad-format. Omit for fixed-size units. */
  format?: AdFormat
  /** data-ad-layout, e.g. 'in-article'. */
  layout?: 'in-article' | 'in-feed'
  /** data-ad-layout-key (required for in-feed; copy from the AdSense UI). */
  layoutKey?: string
  /** Fixed width in px (omit for fully responsive). */
  width?: number
  /** Fixed height in px (omit for fully responsive). */
  height?: number
  /** data-full-width-responsive. */
  fullWidthResponsive?: boolean
  /** Reserved min-height (px) to prevent layout shift before the ad paints. */
  reserve: number
}

export interface AdPlacement {
  /** Show the centered "Advertisement" label (default: true). */
  label?: boolean
  /** Ordered variants — the LAST one matching the viewport wins. */
  variants: AdVariant[]
}

/**
 * Slot map. Ranges are kept mutually exclusive per placement so exactly one
 * variant matches at any width; a placement with no matching variant (e.g. a
 * desktop-only sidebar on mobile) simply renders nothing.
 */
export const AD_PLACEMENTS = {
  /**
   * Top of content — a fully responsive leaderboard. Width and height are
   * automatic (AdSense picks the best horizontal unit per viewport); the
   * `reserve` only sets a min-height to avoid layout shift.
   */
  headerBanner: {
    variants: [
      { max: 768, slot: '4003326983', format: 'horizontal', fullWidthResponsive: true, reserve: 60 },
      { min: 768, max: 1024, slot: '4774277934', format: 'horizontal', fullWidthResponsive: true, reserve: 75 },
      { min: 1024, slot: '8539588233', format: 'horizontal', fullWidthResponsive: true, reserve: 90 }
    ]
  },

  /** Optional billboard (970×250) for wide hero/marketing areas — not auto-placed. */
  billboard: {
    variants: [
      { min: 1200, slot: '4921873558', width: 970, height: 250, reserve: 250 }
    ]
  },

  /** Just under the hero — responsive horizontal, shorter on mobile. */
  belowHero: {
    variants: [
      { max: 768, slot: '8939839370', format: 'horizontal', fullWidthResponsive: true, reserve: 70 },
      { min: 768, slot: '8939839370', format: 'horizontal', fullWidthResponsive: true, reserve: 120 }
    ]
  },

  /** In-article fluid unit for mid-content placement. */
  inArticle: {
    variants: [
      { slot: '6501428979', format: 'fluid', layout: 'in-article', reserve: 200 }
    ]
  },

  /** Between article sections — medium square on mobile, responsive square on larger. */
  betweenSections: {
    variants: [
      { max: 768, slot: '9619442326', width: 250, height: 250, reserve: 250 },
      { min: 768, slot: '7663977887', format: 'rectangle', fullWidthResponsive: true, reserve: 280 }
    ]
  },

  /** Desktop content rail — skyscraper sized to the available width. */
  sidebar: {
    variants: [
      { min: 1024, max: 1280, slot: '4394096538', width: 120, height: 600, reserve: 600 },
      { min: 1280, max: 1600, slot: '9488965956', width: 160, height: 600, reserve: 600 },
      { min: 1600, slot: '2712169578', width: 300, height: 600, reserve: 600 }
    ]
  },

  /**
   * Responsive square shown below the table of contents in the right rail.
   * Auto-sized so it fits the narrow rail on desktop and a phone screen alike.
   */
  sidebarSquare: {
    variants: [
      { max: 768, slot: '6066270853', format: 'rectangle', fullWidthResponsive: true, reserve: 300 },
      { min: 768, slot: '7663977887', format: 'rectangle', fullWidthResponsive: true, reserve: 336 }
    ]
  },

  /** Floating / sticky desktop sidebar skyscraper — available for manual use. */
  stickySidebar: {
    variants: [
      { min: 1024, slot: '5882506557', format: 'vertical', fullWidthResponsive: true, reserve: 600 }
    ]
  },

  /** Related posts — native in-feed unit. NOTE: set `layoutKey` from the AdSense UI to enable. */
  relatedPosts: {
    variants: [
      { slot: '9130894804', format: 'fluid', layout: 'in-feed', layoutKey: '', reserve: 200 }
    ]
  },

  /** After the article body — multiplex (content recommendations), vertical. */
  afterArticle: {
    variants: [
      { slot: '3375031396', format: 'autorelaxed', reserve: 400 }
    ]
  },

  /** End of article — multiplex, horizontal. Smaller reserve on mobile so
   *  it doesn't dominate the screen after a short lesson. */
  endOfArticle: {
    variants: [
      { max: 768, slot: '6808134701', format: 'autorelaxed', reserve: 220 },
      { min: 768, slot: '6808134701', format: 'autorelaxed', reserve: 300 }
    ]
  },

  /** Footer — responsive horizontal, shorter on mobile. */
  footer: {
    variants: [
      { max: 768, slot: '8939839370', format: 'horizontal', fullWidthResponsive: true, reserve: 70 },
      { min: 768, slot: '8939839370', format: 'horizontal', fullWidthResponsive: true, reserve: 120 }
    ]
  },

  /** Mobile-only sticky/banner leaderboard. */
  mobileBanner: {
    variants: [
      { max: 768, slot: '4003326983', format: 'horizontal', fullWidthResponsive: true, reserve: 100 }
    ]
  },

  /** Mobile inline rectangle — 300×250 on narrow phones, 336×280 on larger. */
  mobileInline: {
    variants: [
      { max: 360, slot: '6066270853', width: 300, height: 250, reserve: 250 },
      { min: 360, max: 768, slot: '1684851337', width: 336, height: 280, reserve: 280 }
    ]
  },

  /** Small widget areas — 200×250 in tight columns, 250×250 otherwise. */
  smallWidget: {
    variants: [
      { max: 300, slot: '1549380617', width: 200, height: 250, reserve: 250 },
      { min: 300, slot: '6066270853', width: 250, height: 250, reserve: 250 }
    ]
  },

  /** Large display banner — 980×120 on wide viewports. */
  largeDisplay: {
    variants: [
      { min: 1000, slot: '7400425360', width: 980, height: 120, reserve: 120 }
    ]
  }
} satisfies Record<string, AdPlacement>

export type AdPlacementName = keyof typeof AD_PLACEMENTS
