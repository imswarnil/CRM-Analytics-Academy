/**
 * WebVTT, parsed losslessly enough to translate.
 *
 * A transcript is translated cue by cue, and the only thing translation may
 * change is cue TEXT. The header, NOTE/STYLE/REGION blocks, cue identifiers,
 * timing lines (with their settings) and the blank-line separators are held
 * verbatim, so `serializeVtt(parseVtt(x)) === x` for any file with `\n` line
 * endings — scripts/video/test-vtt.mjs asserts exactly that.
 */

const TIMING = /^\s*((?:\d+:)?\d{2}:\d{2}\.\d{3})\s+-->\s+((?:\d+:)?\d{2}:\d{2}\.\d{3})(.*)$/

/** "01:02.500" / "1:01:02.500" → seconds. */
export function toSeconds(ts) {
  const parts = ts.split(':').map(Number)
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

/**
 * → { blocks, separators, eol }
 *   blocks[i] = { kind: 'header' | 'note' | 'cue' | 'other', raw }
 *             | { kind: 'cue', id, timing, start, end, lines }
 */
export function parseVtt(text) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const normal = text.replace(/\r\n/g, '\n')
  // Keep the separators (runs of blank lines) so they round-trip exactly.
  const parts = normal.split(/(\n(?:[ \t]*\n)+)/)
  const blocks = []
  const separators = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 2) {
      separators.push(parts[i])
      continue
    }
    const raw = parts[i]
    const lines = raw.split('\n')
    if (i === 0 && /^\s?WEBVTT/.test(lines[0] ?? '')) {
      blocks.push({ kind: 'header', raw })
      continue
    }
    if (/^(NOTE|STYLE|REGION)\b/.test(lines[0] ?? '')) {
      blocks.push({ kind: 'note', raw })
      continue
    }
    const t = lines.findIndex(l => TIMING.test(l))
    if (t === -1 || t > 1) {
      blocks.push({ kind: 'other', raw })
      continue
    }
    const m = TIMING.exec(lines[t])
    blocks.push({
      kind: 'cue',
      id: t === 1 ? lines[0] : null,
      timing: lines[t],
      start: toSeconds(m[1]),
      end: toSeconds(m[2]),
      lines: lines.slice(t + 1)
    })
  }
  return { blocks, separators, eol }
}

export function serializeVtt({ blocks, separators, eol }) {
  let out = ''
  blocks.forEach((b, i) => {
    out += b.kind === 'cue'
      ? [...(b.id != null ? [b.id] : []), b.timing, ...b.lines].join('\n')
      : b.raw
    if (i < separators.length) out += separators[i]
  })
  // A trailing separator (file ends in blank lines) follows the last block.
  for (let i = blocks.length; i < separators.length; i++) out += separators[i]
  return eol === '\n' ? out : out.replace(/\n/g, eol)
}

/** Plain cue list, for SRT/edit manifests and transcripts. */
export function cuesOf(text) {
  return parseVtt(text).blocks
    .filter(b => b.kind === 'cue')
    .map(b => ({ start: b.start, end: b.end, text: b.lines.join(' ').replace(/<[^>]+>/g, '').trim() }))
}

const pad = (n, w = 2) => String(n).padStart(w, '0')
function clock(sec, sep) {
  const ms = Math.round(sec * 1000)
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor(ms / 60_000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms % 1000, 3)}`
}

/** Cues → SubRip, for Premiere's caption import. */
export function cuesToSrt(cues) {
  return cues.map((c, i) => `${i + 1}\n${clock(c.start, ',')} --> ${clock(c.end, ',')}\n${c.text}\n`).join('\n')
}

/** Cues → WebVTT. */
export function cuesToVtt(cues) {
  return `WEBVTT\n\n${cues.map(c => `${clock(c.start, '.')} --> ${clock(c.end, '.')}\n${c.text}`).join('\n\n')}\n`
}

/**
 * Translate the cue text of a VTT file with `translate(strings) → Map`.
 *
 * Each cue is one translation unit (its lines joined by a `<br>` the protect
 * layer holds as an atom, then split again), so a two-line cue stays two
 * lines. Everything that is not cue text is never handed to the translator.
 * Returns `{ text, kept }` where `kept` counts cues that fell back to English.
 */
export async function translateVtt(raw, translate) {
  const doc = parseVtt(raw)
  const cues = doc.blocks.filter(b => b.kind === 'cue' && b.lines.some(l => l.trim()))
  const sources = cues.map(c => c.lines.join('<br>'))
  const out = await translate(sources)
  let kept = 0
  for (const c of cues) {
    const src = c.lines.join('<br>')
    const t = out.get(src)
    if (t == null) {
      kept++
      continue
    }
    const lines = t.split(/<br\s*\/?>/i).map(l => l.trim())
    // A line count that changed means the engine merged or split the cue; keep
    // the lines anyway (the cue still times correctly), joined back to the
    // original count so layout matches the source.
    c.lines = lines.length === c.lines.length ? lines : [lines.join(' ')]
  }
  return { text: serializeVtt(doc), kept }
}
