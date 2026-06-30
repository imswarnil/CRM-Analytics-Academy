/**
 * Automatic in-article ad placement.
 *
 * Nuxt Content parses a page body into a "minimark" AST: a flat array of block
 * nodes, each shaped like `[tag, props, ...children]`. This walks that array and
 * splices `<AdUnit placement="inArticle">` nodes after every Nth top-level
 * paragraph, so every lesson gets ads automatically — no manual `:ad-unit` in
 * the markdown.
 *
 * Density rules (keeps content dominant / avoids policy issues):
 *   - Only inject if the article has at least `minParagraphs` paragraphs.
 *   - Insert an ad right after every `interval`-th paragraph (3rd, 6th, ...).
 *   - Cap the total at `max` in-article ads per page.
 */

type MinimarkNode = [string, Record<string, unknown>?, ...unknown[]]

export interface InArticleAdOptions {
  /** Insert an ad after every Nth paragraph (default 3). */
  interval?: number
  /** Maximum in-article ads per page (default 4). */
  max?: number
  /** Minimum number of top-level paragraphs required before injecting anything (default 3). */
  minParagraphs?: number
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
  const { interval = 3, max = 4, minParagraphs = 3 } = options

  if (!Array.isArray(nodes) || nodes.length === 0) return nodes

  // Indices of every top-level paragraph.
  const paragraphIndices: number[] = []
  nodes.forEach((node, i) => {
    if (Array.isArray(node) && node[0] === 'p') paragraphIndices.push(i)
  })

  if (paragraphIndices.length < minParagraphs) return nodes

  // Node indices after which an ad should go (after the 3rd, 6th, ... paragraph).
  const insertAfter = new Set<number>()
  for (let p = interval - 1; p < paragraphIndices.length && insertAfter.size < max; p += interval) {
    insertAfter.add(paragraphIndices[p]!)
  }

  if (insertAfter.size === 0) return nodes

  const result: unknown[] = []
  nodes.forEach((node, i) => {
    result.push(node)
    if (insertAfter.has(i)) result.push(AD_NODE())
  })

  return result
}
