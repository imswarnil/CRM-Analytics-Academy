/**
 * Markdown ⇄ "translatable HTML" conversion.
 *
 * LibreTranslate mangles raw markdown: sent as `format: 'text'`, `**dataset**`
 * comes back as `**dataset*`. Sent as `format: 'html'` it preserves tags and
 * their attributes perfectly, in every script tested (Arabic, Hindi, Japanese,
 * Chinese, Russian). So the pipeline is:
 *
 *   markdown → HTML (emphasis/links become real tags, everything
 *              untranslatable becomes an EMPTY numbered <v_n/> tag)
 *           → LibreTranslate (format: html)
 *           → back to markdown
 *
 * The atoms must be *empty* tags. Text inside a tag is still translated —
 * `<x>KEEP0</x>` came back as `<x>ケプ0</x>` — so anything that has to survive
 * byte-for-byte is held here on the Node side and re-inserted afterwards, with
 * only its position carried through the API as `<v3></v3>`.
 *
 * Unicode sentinels (`⟦0⟧`) were tried first and are unusable: they are
 * rewritten or dropped entirely, and in Hindi took the whole sentence with them.
 */

import { GLOSSARY } from './i18n.config.mjs'

// Longest first, so "CRM Analytics" is matched before a bare "Analytics".
const GLOSSARY_SORTED = [...GLOSSARY].sort((a, b) => b.length - a.length)
const GLOSSARY_RE = new RegExp(
  `(?<![\\w-])(${GLOSSARY_SORTED.map(escapeRe).join('|')})(?![\\w-])`,
  'g'
)

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Kept as a safety net only. Every `&`, `<` and `>` in prose is held back as an
 * atom before this runs (see ATOM_PATTERNS), because the server corrupts HTML
 * entities rather than passing them through. If one somehow reaches here,
 * escaping it is still better than emitting invalid markup.
 */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function unescapeHtml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/**
 * Everything that must not be translated, in priority order. Earlier patterns
 * win, which is why escapes and code spans come before emphasis: a backslash
 * escape like `\_\_\_\_` must never be read as italics, and `*` inside a code
 * span is not emphasis.
 */
const ATOM_PATTERNS = [
  /\\[\\`*_{}[\]()#+\-.!|~<>]/, // backslash escape
  /`+[^`]*`+/, //                  inline code span
  /!\[[^\]]*\]\([^)]*\)/, //       image
  /<!--[\s\S]*?-->/, //            HTML comment
  /<\/?[a-zA-Z][^<>]*>/, //        raw HTML tag / autolink
  /\{[^{}]*\}/, //                 MDC inline props, e.g. {icon="i-lucide-x"}
  /:[a-z][a-z0-9-]*(?=\s|$)/, //   MDC inline component, e.g. :icon
  // Bare &, < and > in prose. These MUST be held rather than escaped: the
  // server mangles every HTML entity it is given. Measured against es:
  //   &amp; -> &quot;   ("Setup & User Provisioning" became 'Setup " User…')
  //   &lt;  -> dropped entirely
  //   &gt;  -> "√≥"
  // Listed last so the raw-tag and code-span patterns above win a tie at the
  // same index and a real `<tag>` is still held whole.
  /[&<>]/
]

const LINK_RE = /\[([^\]]*)\]\(([^)]*)\)/
const BOLD_RE = /\*\*([^*]+)\*\*|__([^_]+)__/
const ITALIC_RE = /\*([^*\n]+)\*|_([^_\n]+)_/

/**
 * Convert one line of markdown prose into HTML safe to hand to the translator.
 * `atoms` accumulates the raw source of everything held back; the returned
 * HTML refers to them positionally as `<v0></v0>`, `<v1></v1>`, …
 */
export function toTranslatableHtml(text, atoms = []) {
  let out = ''
  let rest = text

  // Two kinds of protection, and the difference matters a lot for quality.
  //
  // `hold` hides a value completely (`<v3></v3>`). Right for things that are
  // not prose — escapes, images, comments, component props.
  //
  // `holdVisible` keeps the words in front of the model (`<g3>Opportunity</g3>`)
  // and throws away whatever comes back, restoring the original. Emptying out
  // every product name and object name instead produced sentences the model
  // could not parse — "An <v/> looks up to an <v/>" came back with the English
  // function words untranslated and, in Japanese, with "お問い合わせ"
  // ("contact us") hallucinated into the gaps. Leaving the noun visible costs
  // nothing and restores exactly the same text.
  const hold = (raw) => {
    const i = atoms.length
    atoms.push(raw)
    return `<v${i}></v${i}>`
  }

  const holdVisible = (raw, visible) => {
    const i = atoms.length
    atoms.push(raw)
    return `<g${i}>${escapeHtml(visible)}</g${i}>`
  }

  outer: while (rest.length) {
    // Find the earliest match among all constructs, so ordering in the source
    // wins rather than ordering in this list.
    let best = null

    for (const re of ATOM_PATTERNS) {
      const m = rest.match(re)
      if (m && (!best || m.index < best.index)) best = { kind: 'atom', m, index: m.index }
    }
    for (const [kind, re] of [['link', LINK_RE], ['bold', BOLD_RE], ['italic', ITALIC_RE]]) {
      const m = rest.match(re)
      if (m && (!best || m.index < best.index)) best = { kind, m, index: m.index }
    }

    if (!best) break outer

    out += escapeHtml(rest.slice(0, best.index))
    const [raw, g1, g2] = best.m

    switch (best.kind) {
      case 'atom': {
        // An inline code span usually holds a readable identifier
        // (`AccountId`), so show it; anything else is opaque.
        const code = /^`+([^`]*)`+$/.exec(raw)
        out += code && /^[\w .]+$/.test(code[1]) ? holdVisible(raw, code[1]) : hold(raw)
        break
      }
      case 'link': {
        // The label is prose and gets translated; the URL rides along as a
        // literal href, which the server preserves verbatim. It deliberately is
        // *not* a `<v_n/>` atom — a tag nested inside an attribute value is
        // invalid HTML and would be destroyed by the server's parser. A URL
        // containing a quote or angle bracket can't be expressed that way, so
        // those rare links are held back whole and left untranslated.
        const url = best.m[2]
        if (/["<>]/.test(url)) {
          out += hold(raw)
        } else {
          out += `<a href="${url}">${toTranslatableHtml(best.m[1], atoms)}</a>`
        }
        break
      }
      case 'bold':
        out += `<strong>${toTranslatableHtml(g1 ?? g2, atoms)}</strong>`
        break
      case 'italic':
        out += `<em>${toTranslatableHtml(g1 ?? g2, atoms)}</em>`
        break
    }
    rest = rest.slice(best.index + raw.length)
  }

  out += escapeHtml(rest)

  // Glossary terms last, so they also cover text nested inside emphasis and
  // link labels. Skipped inside the tags we just emitted by only matching on
  // segments outside `<...>`.
  return protectGlossary(out, atoms)
}

function protectGlossary(html, atoms) {
  // The first alternative matches a whole visible placeholder and passes it
  // through untouched. Without it a code span holding a glossary term nests —
  // `<g0>SAQL</g0>` becomes `<g0><g1>SAQL</g1></g0>` — and the restore pass
  // rightly rejects the line as structurally broken.
  return html.replace(/(<g\d+>[\s\S]*?<\/g\d+>|<[^>]*>)|([^<]+)/g, (whole, tag, textRun) => {
    if (tag) return tag
    return textRun.replace(GLOSSARY_RE, (term) => {
      const i = atoms.length
      atoms.push(term)
      return `<g${i}>${term}</g${i}>`
    })
  })
}

/**
 * Reverse of {@link toTranslatableHtml}. Returns `null` when the translator
 * returned something structurally broken — a dropped or duplicated atom, or an
 * unbalanced tag. Callers treat null as "keep the English source for this
 * line", which is a far better failure mode than emitting corrupt markdown.
 */
export function fromTranslatedHtml(html, atoms) {
  // Tolerate the shapes the server actually returns: `<v0></v0>`, `<v0/>`,
  // `<v0> </v0>` (it rewrote our self-closing probe into a tag pair).
  const seen = new Array(atoms.length).fill(0)
  const take = (n) => {
    const i = Number(n)
    if (i >= atoms.length) return ''
    seen[i]++
    return atoms[i]
  }

  let out = html
    // Visible atoms: whatever the translator did to the inner text is
    // discarded — only the position was ever in question.
    .replace(/<g(\d+)\s*>[\s\S]*?<\/g\1\s*>/g, (_, n) => take(n))
    .replace(/<g(\d+)\s*\/>/g, (_, n) => take(n))
    // Opaque atoms.
    .replace(/<v(\d+)\s*\/?>\s*(?:<\/v\1\s*>)?/g, (_, n) => take(n))

  if (seen.some(c => c !== 1)) return null
  if (/<\/?[gv]\d+/.test(out)) return null

  // Emphasis and links back to markdown.
  out = out
    .replace(/<strong\s*>([\s\S]*?)<\/strong\s*>/g, '**$1**')
    .replace(/<b\s*>([\s\S]*?)<\/b\s*>/g, '**$1**')
    .replace(/<em\s*>([\s\S]*?)<\/em\s*>/g, '*$1*')
    .replace(/<i\s*>([\s\S]*?)<\/i\s*>/g, '*$1*')
    .replace(/<a\s+href="([^"]*)"\s*>([\s\S]*?)<\/a\s*>/g, '[$2]($1)')

  // Any of our own tags left over means the translator broke the structure.
  if (/<\/?(strong|em|b|i|a)\b/.test(out)) return null

  return unescapeHtml(out).trim()
}
