/**
 * Inline Pro blocks: the `::pro … ::` MDC block inside an otherwise free lesson.
 *
 *   Free text everyone reads.
 *
 *   ::pro
 *   ## The full worked example          <- first heading = the public teaser
 *   Paragraphs, tables, code …
 *
 *   :::lesson-video{mux="PLAYBACK_ID"}  <- nested components need THREE colons
 *   :::
 *   ::
 *
 * The block is the same paywall as a whole Pro lesson, at a smaller scale:
 * scripts/gate-content.mjs moves its markdown into the Worker's server assets
 * and the public file gets a `::pro-locked{…}` placeholder in its place, so the
 * text never reaches the content database or .output/public.
 *
 * Only a TOP-LEVEL `::pro` (exactly two colons, first column) opens a block.
 * MDC closes a block at the first `::` of the same depth, which is why nested
 * components inside it must use `:::` — a `::youtube-embed` inside would close
 * the Pro block early and publish the rest of it. That case is detected and
 * reported as an error rather than guessed at.
 */

const FENCE = /^\s*(```|~~~)/
const OPEN = /^::pro(?:\{(.*)\})?\s*$/
const CLOSE = /^::\s*$/
const NESTED_TWO_COLON = /^::[a-z][\w-]*/

/** `{teaser="x" title='y'}` → { teaser: 'x', title: 'y' } (quoted values only). */
function parseProps(src = '') {
  const out = {}
  for (const m of src.matchAll(/([a-z][\w-]*)=(?:"([^"]*)"|'([^']*)')/gi)) {
    out[m[1]] = m[2] ?? m[3] ?? ''
  }
  return out
}

/**
 * Split a markdown body into plain text and Pro blocks.
 * Returns `{ segments, blocks, errors }`; `segments` re-join to the input.
 */
export function splitProBlocks(body) {
  const lines = body.split('\n')
  const segments = []
  const blocks = []
  const errors = []
  let buf = []
  let block = null
  let inFence = false

  const flush = () => {
    if (buf.length) segments.push({ text: buf.join('\n') })
    buf = []
  }

  lines.forEach((line, i) => {
    if (FENCE.test(line)) inFence = !inFence

    if (!block) {
      const open = !inFence && OPEN.exec(line)
      if (open) {
        flush()
        block = { n: blocks.length + 1, props: parseProps(open[1]), lines: [], openLine: line, startLine: i + 1 }
        return
      }
      buf.push(line)
      return
    }

    if (!inFence && CLOSE.test(line)) {
      const b = { n: block.n, props: block.props, markdown: block.lines.join('\n').replace(/^\n+|\n+$/g, ''), raw: [block.openLine, ...block.lines, line].join('\n'), startLine: block.startLine }
      blocks.push(b)
      segments.push({ block: b })
      block = null
      return
    }
    if (!inFence && NESTED_TWO_COLON.test(line)) {
      errors.push(`line ${i + 1}: "${line.trim()}" inside ::pro must use three colons (:::) — two would close the Pro block`)
    }
    block.lines.push(line)
  })

  if (block) {
    errors.push(`line ${block.startLine}: ::pro is never closed with a "::" line`)
    // Treat the unclosed remainder as gated: failing closed beats publishing it.
    const b = { n: block.n, props: block.props, markdown: block.lines.join('\n').trim(), raw: [block.openLine, ...block.lines].join('\n'), startLine: block.startLine }
    blocks.push(b)
    segments.push({ block: b })
  }
  flush()
  return { segments, blocks, errors }
}

/** Rebuild the body with each block replaced by `replace(block)`. */
export function replaceProBlocks(body, replace) {
  const { segments } = splitProBlocks(body)
  if (!segments.some(s => s.block)) return body
  return segments.map(s => (s.block ? replace(s.block) : s.text)).join('\n')
}

/** The body with every Pro block removed (for public indexes and teasers). */
export function stripProBlocks(body) {
  return replaceProBlocks(body, () => '')
}

/** Plain text of a markdown line, for a teaser. */
function plain(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * What a locked block holds, for the placeholder card ("3 paragraphs, a video
 * and 2 code examples"). Counts only — never the words themselves.
 */
export function summarise(markdown) {
  let paragraphs = 0
  let videos = 0
  let code = 0
  let tables = 0
  let words = 0
  let inFence = false
  let inTable = false
  let inList = false
  let inYaml = false
  let heading = ''

  for (const line of markdown.split('\n')) {
    if (FENCE.test(line)) {
      if (!inFence) code++
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const t = line.trim()
    if (!t) {
      inTable = false
      inList = false
      continue
    }
    // A nested component's props are YAML between `---` lines: not prose.
    if (/^---$/.test(t)) {
      inYaml = !inYaml
      continue
    }
    if (inYaml) continue
    if (/^:{2,}(lesson-video|youtube-embed)\b/.test(t)) {
      videos++
      continue
    }
    if (/^:{2,}(field-table|metric-spec|compare-cols)\b/.test(t)) {
      tables++
      continue
    }
    if (/^:{2,}/.test(t)) continue
    if (/^\|.*\|$/.test(t)) {
      if (!inTable) tables++
      inTable = true
      continue
    }
    const h = /^#{1,6}\s+(.*)$/.exec(t)
    if (h) {
      if (!heading) heading = plain(h[1])
      continue
    }
    words += t.split(/\s+/).length
    if (/^([-*+]|\d+[.)])\s+/.test(t)) {
      if (!inList) paragraphs++
      inList = true
      continue
    }
    paragraphs++
  }

  return { paragraphs, videos, code, tables, minutes: Math.max(1, Math.round(words / 200)), heading }
}

/** MDC attribute value: double quotes are the delimiter, so they cannot appear inside. */
const attr = s => String(s ?? '').replace(/"/g, '\'').replace(/\s+/g, ' ').trim()

/**
 * The public placeholder for block `n` of a lesson. `id` is
 * `<locale>/<route>#<n>` — the locale is part of it so a page that fell back to
 * English still asks for the English block it is actually showing.
 */
export function placeholder({ locale, route, block }) {
  const s = summarise(block.markdown)
  const teaser = block.props.teaser || s.heading
  const props = [
    `id="${attr(`${locale}${route === '/' ? '' : route}#${block.n}`)}"`,
    teaser ? `teaser="${attr(teaser)}"` : '',
    `paragraphs="${s.paragraphs}"`,
    `videos="${s.videos}"`,
    `code="${s.code}"`,
    `tables="${s.tables}"`,
    `minutes="${s.minutes}"`
  ].filter(Boolean).join(' ')
  return `::pro-locked{${props}}\n::`
}

/** Every Mux playback id referenced inside a block (`mux="…"` / `mux: …`). */
export function muxIdsIn(markdown) {
  const ids = new Set()
  for (const m of markdown.matchAll(/\bmux=["']([A-Za-z0-9]+)["']/g)) ids.add(m[1])
  for (const m of markdown.matchAll(/^\s*mux:\s*["']?([A-Za-z0-9]+)["']?\s*$/gm)) ids.add(m[1])
  return [...ids]
}
