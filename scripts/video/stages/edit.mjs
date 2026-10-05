/**
 * Stage `edit` — an edit manifest and a ready-to-paste brief for assembling
 * the lesson in Premiere Pro through the Premiere MCP. It does not drive
 * Premiere itself.
 *
 *   pnpm video edit /saql/functions
 *
 * Output:
 *   edit.json      sequence settings, every media file, clips per track with
 *                  in/out times, beat markers
 *   captions.srt   burn-in/sidecar captions from the script on the beat
 *                  timeline (Mux generates the published captions later)
 *   PREMIERE.md    the instructions to paste into Claude Code, naming the
 *                  Premiere MCP tools in order
 *
 * Tracks: V1 motion.mp4 (full length), V2 screen recordings pinned to beats
 * (recordings/beat-NNN.*), V3 the avatar as picture-in-picture, V4 brand
 * overlays from content-assets/premiere/; A1 the narration.
 */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from '../../lib/lessons.mjs'
import { cuesToSrt } from '../../lib/vtt.mjs'
import { beatTimeline } from '../lib/timeline.mjs'

/** Split a beat's narration into caption cues over its duration, by characters. */
function captionCues(beats, maxChars) {
  const cues = []
  for (const b of beats) {
    if (!b.say) continue
    const words = b.say.split(/\s+/)
    const chunks = []
    let cur = ''
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars * 2 && cur) {
        chunks.push(cur.trim())
        cur = ''
      }
      cur += ' ' + w
    }
    if (cur.trim()) chunks.push(cur.trim())
    const total = chunks.reduce((n, c) => n + c.length, 0) || 1
    let t = b.start
    for (const c of chunks) {
      const d = (c.length / total) * b.seconds
      cues.push({ start: t, end: t + d, text: c })
      t += d
    }
  }
  return cues
}

export async function run(ctx) {
  const tl = beatTimeline(ctx)
  const e = { fps: 30, width: 1920, height: 1080, captionsMaxChars: 42, ...ctx.config.edit }
  const f = name => (existsSync(ctx.at(name)) ? ctx.at(name) : null)

  const voice = f('voice.wav')
  const avatar = f('avatar.mp4')
  const motion = f('motion.mp4')
  const recDir = ctx.at('recordings')
  const recordings = existsSync(recDir)
    ? readdirSync(recDir).filter(n => /\.(mov|mp4|mkv)$/i.test(n)).map(n => ({ file: path.join(recDir, n), beat: /beat-\d{3}/.exec(n)?.[0] ?? null }))
    : []
  const overlay = n => path.join(ROOT, 'content-assets/premiere', n)
  const lowerThird = existsSync(overlay('lower-third-5s.mov')) ? overlay('lower-third-5s.mov') : null
  const endOverlay = existsSync(overlay('subscribe-next-lesson-6s.mov')) ? overlay('subscribe-next-lesson-6s.mov') : null

  const byId = new Map(tl.beats.map(b => [b.id, b]))
  const firstPoint = tl.beats.find(b => b.kind !== 'title') ?? tl.beats[0]
  const end = tl.beats.at(-1)

  const tracks = {
    V1: motion ? [{ file: motion, start: 0, in: 0, out: tl.total, note: 'motion graphics, full length' }] : [],
    V2: recordings.map((r) => {
      const b = r.beat && byId.get(r.beat)
      return { file: r.file, start: b ? b.start : null, in: 0, out: b ? b.seconds : null, beat: r.beat, note: b ? `screen recording for ${b.id}` : 'unpinned recording — place by hand' }
    }),
    V3: avatar ? [{ file: avatar, start: 0, in: 0, out: tl.total, note: 'avatar, picture-in-picture: scale 35%, bottom-right, 48px margin' }] : [],
    V4: [
      ...(lowerThird && firstPoint ? [{ file: lowerThird, start: firstPoint.start, in: 0, out: 5, note: 'lower third' }] : []),
      ...(endOverlay && end ? [{ file: endOverlay, start: Math.max(0, tl.total - 6), in: 0, out: 6, note: 'subscribe / next lesson' }] : [])
    ],
    A1: voice ? [{ file: voice, start: 0, in: 0, out: tl.total, note: 'narration' }] : []
  }
  const markers = tl.beats.map(b => ({ time: b.start, name: `${b.id} ${b.kind}${b.heading ? ` — ${b.heading}` : ''}`.slice(0, 80), comment: (b.say || '').slice(0, 240) }))

  const srt = ctx.at('captions.srt')
  ctx.writeText('captions.srt', cuesToSrt(captionCues(tl.beats, e.captionsMaxChars)))

  const manifest = {
    route: ctx.route,
    timing: tl.timing,
    sequence: { name: `CAA ${ctx.route}`, width: e.width, height: e.height, fps: e.fps, duration: tl.total },
    media: [...new Set(Object.values(tracks).flat().map(c => c.file))],
    tracks,
    markers,
    captions: srt,
    export: { file: ctx.at('final.mp4'), preset: 'H.264 Match Source - High bitrate' }
  }
  ctx.writeJson('edit.json', manifest)

  const missing = [!voice && 'voice.wav (pnpm video voice)', !motion && 'motion.mp4 (render motion/ with HyperFrames)'].filter(Boolean)
  const md = `# Assemble ${ctx.route} in Premiere Pro

Paste this into Claude Code with the **Premiere Pro MCP** connected and
Premiere open. The manifest is \`${ctx.rel(ctx.at('edit.json'))}\`; every path
below is absolute.
${missing.length ? `\n> Missing before you start: ${missing.join(', ')}. Re-run \`pnpm video edit ${ctx.route}\` once they exist.\n` : ''}
1. \`premiere_is_running\` — stop if Premiere is not open.
2. \`premiere_import_files\` with:
${manifest.media.map(m => `   - ${m}`).join('\n')}
3. \`premiere_create_sequence\` named "${manifest.sequence.name}", ${e.width}×${e.height} at ${e.fps} fps.
4. \`premiere_place_clip\` for every clip in \`tracks\` of edit.json: V1 → video track 1,
   V2 → 2, V3 → 3, V4 → 4, A1 → audio track 1, at each clip's \`start\` seconds with
   its \`in\`/\`out\`. Clips with \`start: null\` are unpinned recordings: ask me where.
5. For V3 (avatar): \`premiere_apply_video_effect\` Motion — scale 35, position
   bottom-right with a 48 px margin.
6. \`premiere_add_sequence_marker\` for each of the ${markers.length} entries in \`markers\`.
7. \`premiere_add_subtitles_from_srt\` with \`${srt}\` (reference captions; the
   published captions come from Mux after upload).
8. \`premiere_normalize_audio\` on A1 to -16 LUFS; \`premiere_save_project\`.
9. Show me the timeline (\`premiere_get_timeline\`) and wait for my OK.
10. \`premiere_export\` to \`${manifest.export.file}\` (H.264, match source).

Then: \`pnpm video upload ${ctx.route}\`.
`
  ctx.writeText('PREMIERE.md', md)
  console.log(`✓ ${ctx.rel(ctx.at('edit.json'))}, captions.srt, PREMIERE.md — ${Math.round(tl.total)}s, ${markers.length} markers (${tl.timing} timing)`)
  if (missing.length) console.log(`  still missing: ${missing.join(', ')}`)
}
