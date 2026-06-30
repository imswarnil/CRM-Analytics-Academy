/**
 * Automatic in-article ad placement.
 *
 * Nuxt Content parses a page body into a "minimark" AST: a flat array of block
 * nodes, each shaped like `[tag, props, ...children]`. This walks that array and
 * splices `<AdUnit placement="inArticle">` nodes between top-level `## sections`,
 * so every lesson gets ads automatically — no manual `:ad-unit` in the markdown.
 *
 * Density rules (keeps content dominant / avoids policy issues):
 *   - Only inject if the article has at least `minSections` H2 sections.
 *   - Place an ad before every `interval`-th section (never before the first).
 *   - Cap the total at `max` in-article ads per page.
 */

type MinimarkNode = [string, Record<string, unknown>?, ...unknown[]]

export interface InArticleAdOptions {
  /** Insert before every Nth H2 (default 3). */
  interval?: number
  /** Maximum in-article ads per page (default 2). */
  max?: number
  /** Minimum number of H2 sections required before injecting anything (default 4). */
  minSections?: number
}

const AD_NODE = (): MinimarkNode => ['ad-unit', { placement: 'inArticle' }]

/**
 * Return a new body value array with in-article ad nodes injected.
 * The original nodes are reused (only the top-level array is rebuilt), so this
 * is cheap and non-destructive.
 */
export function injectInArticleAds(
  nodes: unknown[],
  options: InArticleAdOptions = {}
): unknown[] {
  const { interval = 2, max = 3, minSections = 3 } = options

  if (!Array.isArray(nodes) || nodes.length === 0) return nodes

  // Indices of every top-level H2 heading.
  const headingIndices: number[] = []
  nodes.forEach((node, i) => {
    if (Array.isArray(node) && node[0] === 'h2') headingIndices.push(i)
  })

  if (headingIndices.length < minSections) return nodes

  // Heading positions where an ad should go (skip the first section).
  const insertBefore = new Set<number>()
  for (let h = interval; h < headingIndices.length && insertBefore.size < max; h += interval) {
    insertBefore.add(headingIndices[h]!)
  }

  if (insertBefore.size === 0) return nodes

  const result: unknown[] = []
  nodes.forEach((node, i) => {
    if (insertBefore.has(i)) result.push(AD_NODE())
    result.push(node)
  })

  return result
}
