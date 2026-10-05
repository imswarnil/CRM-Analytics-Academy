/**
 * Lesson video helpers shared by the app and the Worker (Nuxt auto-imports
 * shared/utils on both sides).
 *
 * One video per lesson: `mux` is a single Mux playback id. The old
 * per-language map (`mux: { en: …, es: … }`) is still accepted, but only its
 * English entry plays — every language gets the same video with its own
 * captions and transcript instead of a separate recording.
 */
export type MuxField = string | Record<string, string> | null | undefined

export function muxPlaybackId(mux: MuxField): string | undefined {
  if (!mux) return undefined
  if (typeof mux === 'string') return mux
  return mux.en ?? Object.values(mux)[0]
}

/** Mux ids referenced inside a markdown fragment (`mux="…"` / `mux: …`). */
export function muxIdsIn(markdown: string): string[] {
  const ids = new Set<string>()
  for (const m of markdown.matchAll(/\bmux=["']([A-Za-z0-9]+)["']/g)) ids.add(m[1]!)
  for (const m of markdown.matchAll(/^\s*mux:\s*["']?([A-Za-z0-9]+)["']?\s*$/gm)) ids.add(m[1]!)
  return [...ids]
}

/** What the Worker returns for a signed (Pro) video: tokens for video, poster and storyboard. */
export interface PlaybackTokens {
  playbackId: string
  token: string
  thumbnailToken?: string
  storyboardToken?: string
}

export interface TranscriptCue {
  start: number
  end: number
  text: string
}

function seconds(ts: string): number {
  return ts.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0)
}

/** WebVTT → cues (text only; tags stripped). Tolerant: unknown blocks are skipped. */
export function parseVttCues(vtt: string): TranscriptCue[] {
  const cues: TranscriptCue[] = []
  for (const block of vtt.replace(/\r\n/g, '\n').split(/\n[ \t]*\n/)) {
    const lines = block.split('\n')
    const t = lines.findIndex(l => l.includes('-->'))
    if (t === -1 || t > 1) continue
    const m = /((?:\d+:)?\d{2}:\d{2}\.\d{3})\s+-->\s+((?:\d+:)?\d{2}:\d{2}\.\d{3})/.exec(lines[t]!)
    if (!m) continue
    const text = lines.slice(t + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (text) cues.push({ start: seconds(m[1]!), end: seconds(m[2]!), text })
  }
  return cues
}

/** 75.4 → "1:15"; 3725 → "1:02:05". */
export function formatTimestamp(sec: number): string {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor(s / 60) % 60
  const r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

/** `/en/saql/functions` or `en/saql/functions` → `en/saql/functions.vtt` (index for a bare locale). */
export function transcriptFile(locale: string, route: string): string {
  const r = route.replace(/^\/+|\/+$/g, '')
  return `${locale}/${r || 'index'}.vtt`
}
