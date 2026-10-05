#!/usr/bin/env node
/**
 * Sync each lesson video's English captions from Mux into the repo.
 *
 *   pnpm captions /saql/functions        one lesson
 *   pnpm captions --all                  every English lesson with `mux`
 *   pnpm video captions /saql/functions  (the same, as a pipeline stage)
 *
 * For each lesson: playback id → Mux asset → its auto-generated English text
 * track → WebVTT, written to content-transcripts/en/<route>.vtt only when it
 * changed. That file is the source the translation pipeline turns into the
 * other eleven languages (translate.mjs --only=transcripts), and gate-content
 * publishes for the player. Editing a caption in the Mux dashboard therefore
 * flows through: the scheduled captions workflow re-syncs, translate.yml
 * re-translates, deploy ships.
 *
 * Also records the asset's upload date and duration in
 * content-transcripts/videos.json, for the lesson's VideoObject JSON-LD.
 *
 * Read-only against Mux. Auth: MUX_TOKEN_ID/MUX_TOKEN_SECRET, else the `mux`
 * CLI login; a signed (Pro) video's captions also need MUX_SIGNING_KEY_ID/SECRET
 * (or the CLI) to mint a download token.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { englishLessons, muxIdOf, parseArgs, readLesson, resolveLesson, transcriptPath, TRANSCRIPTS } from '../lib/lessons.mjs'
import { StageError } from './lib/context.mjs'
import { assetForPlayback, downloadVtt, englishTextTrack } from './lib/mux.mjs'

const INFO = path.join(TRANSCRIPTS, 'videos.json')

/** Mux sometimes ends a file without a newline; normalise so diffs stay quiet. */
const tidy = vtt => vtt.replace(/\r\n/g, '\n').replace(/\s*$/, '\n')

export async function syncCaptions(files, { quiet = false } = {}) {
  const info = existsSync(INFO) ? JSON.parse(readFileSync(INFO, 'utf8')) : {}
  const report = { updated: [], unchanged: [], pending: [], failed: [] }

  for (const file of files) {
    const lesson = readLesson(file)
    const playbackId = muxIdOf(lesson.data.mux)
    if (!playbackId) continue
    const route = lesson.route
    try {
      const asset = await assetForPlayback(playbackId)
      const policy = (asset.playback_ids ?? []).find(p => p.id === playbackId)?.policy ?? 'public'
      info[route] = {
        playbackId,
        assetId: asset.id,
        ...(asset.created_at ? { uploadDate: new Date(Number(asset.created_at) * 1000).toISOString() } : {}),
        ...(asset.duration ? { duration: Number(asset.duration) } : {})
      }
      const track = englishTextTrack(asset)
      if (!track) {
        report.pending.push(route)
        if (!quiet) console.log(`  … ${route}: no ready English caption track yet (still generating, or never requested — mux assets tracks generate-subtitles ${asset.id} <audio-track-id>)`)
        continue
      }
      const vtt = tidy(await downloadVtt(playbackId, track.id, policy))
      if (!/^\s?WEBVTT/.test(vtt)) throw new StageError(`Mux returned something that is not WebVTT for ${route}`)
      const out = transcriptPath('en', route)
      const before = existsSync(out) ? readFileSync(out, 'utf8') : null
      if (before === vtt) {
        report.unchanged.push(route)
        continue
      }
      mkdirSync(path.dirname(out), { recursive: true })
      writeFileSync(out, vtt)
      report.updated.push(route)
      if (!quiet) console.log(`  ✓ ${route} → ${path.relative(process.cwd(), out)}`)
    } catch (e) {
      report.failed.push(route)
      console.error(`  ✗ ${route}: ${e.message}`)
    }
  }

  mkdirSync(TRANSCRIPTS, { recursive: true })
  const sorted = Object.fromEntries(Object.entries(info).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(INFO, JSON.stringify(sorted, null, 2) + '\n')
  return report
}

/** Pipeline stage entry: `pnpm video captions <route>`. */
export async function run(ctx) {
  const r = await syncCaptions([ctx.file])
  if (r.failed.length) throw new StageError('Caption sync failed (see above).')
  if (r.unchanged.length) console.log('  captions unchanged')
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))
  if (!flags.all && !positional[0]) {
    console.error('usage: pnpm captions <route> | --all')
    process.exit(1)
  }
  const files = flags.all ? englishLessons() : [resolveLesson(positional[0])]
  const r = await syncCaptions(files)
  console.log(`captions: ${r.updated.length} updated, ${r.unchanged.length} unchanged, ${r.pending.length} pending, ${r.failed.length} failed`)
  if (r.failed.length) process.exit(1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e instanceof StageError ? e.message : e)
    process.exit(1)
  })
}
