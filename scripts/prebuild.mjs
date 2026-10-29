#!/usr/bin/env node
/**
 * Everything `pnpm build` does before `nuxt build`:
 *
 *   0. pull       — approved community interview questions → English files
 *   1. translate  — only on your machine: starts the local LibreTranslate in
 *                   .libretranslate/, translates whatever English changed into
 *                   the other 11 locales, stops it. Skipped in CI (the
 *                   translations are committed) and with SKIP_TRANSLATE=1.
 *   2. lesson meta — minutes / kind / quiz per lesson (app/data/lesson-meta.json)
 *   3. ask index  — public/ask-index.json for the MCP server, and the
 *                   translated /raw/<locale>/*.md files
 *
 * So the whole publishing loop is: edit English markdown → pnpm build →
 * commit → push.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

// Approved community interview questions become English source files first,
// so the translation below covers them (needs DATABASE_URL; never in CI).
if (!process.env.CI && existsSync(path.join(ROOT, '.env'))) {
  run('node', ['--env-file=.env', 'scripts/pull-interview.mjs'])
}

if (process.env.CI || process.env.SKIP_TRANSLATE) {
  console.log('[prebuild] translation skipped (CI or SKIP_TRANSLATE) — using the committed locales')
} else if (!existsSync(path.join(ROOT, '.libretranslate/venv/bin/libretranslate'))) {
  console.log('[prebuild] LibreTranslate is not installed yet — run `pnpm translate:setup` once. Building with the committed locales.')
} else {
  run('bash', ['scripts/libretranslate.sh', 'run', '--', 'node', 'scripts/translate.mjs'])
}

run('node', ['scripts/gate-content.mjs'])
run('node', ['scripts/lesson-meta.mjs'])
run('node', ['scripts/build-search-index.mjs'])
