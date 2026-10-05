/**
 * Upload a lesson video to Mux and wire it into the lesson.
 *
 *   pnpm mux:lesson <lesson> <video.mp4> [--test] [--policy=signed|public] [--no-write]
 *
 * Kept as the short form of `pnpm video upload <lesson> --file=<video>`; the
 * work happens in scripts/video/stages/upload.mjs. One video per lesson: the
 * playback id is written into the English frontmatter as `mux: <id>`, and the
 * asset asks Mux for generated English captions (the languages come from
 * translating those). `--lang` is gone — there are no per-language recordings.
 */
import { parseArgs } from './lib/lessons.mjs'
import { createContext, StageError } from './video/lib/context.mjs'
import { run } from './video/stages/upload.mjs'

const { flags, positional } = parseArgs(process.argv.slice(2))
const [lesson, video] = positional
if (!lesson || !video) {
  console.error('usage: pnpm mux:lesson <lesson route or file> <video file> [--test] [--policy=signed|public] [--no-write]')
  process.exit(1)
}
if (flags.lang && flags.lang !== 'en') {
  console.error('--lang is no longer supported: a lesson has one video, and other languages are captions (see video/README.md).')
  process.exit(1)
}

run(createContext(lesson, { ...flags, file: video })).catch((e) => {
  console.error(e instanceof StageError ? e.message : e)
  process.exit(1)
})
