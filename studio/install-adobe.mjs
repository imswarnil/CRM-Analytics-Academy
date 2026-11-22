#!/usr/bin/env node
/**
 * Install the kit into the Adobe apps on this Mac:
 *
 *   After Effects  Window → CRMA Kit.jsx (a dockable panel). The panel file in
 *                  After Effects' ScriptUI Panels folder is a one-line loader
 *                  pointing at studio/aftereffects/CRMA Kit.jsx, so kit edits
 *                  appear the next time the panel opens.
 *   Premiere Pro   Essential Graphics → My Templates → CRMA: the MOGRTs from
 *                  studio/premiere/mogrt/ (make them with `node studio/comp.mjs --mogrt`).
 *
 *   node studio/install-adobe.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STUDIO = path.dirname(fileURLToPath(import.meta.url))
const prefs = path.join(os.homedir(), 'Library', 'Preferences', 'Adobe', 'After Effects')
const versions = existsSync(prefs) ? readdirSync(prefs).filter(v => /^\d+\.\d+$/.test(v)).sort((a, b) => Number(a) - Number(b)) : []
if (!versions.length) {
  console.error('After Effects preferences not found. Open After Effects once, then run this again.')
  process.exit(1)
}
const panels = path.join(prefs, versions.at(-1), 'Scripts', 'ScriptUI Panels')
mkdirSync(panels, { recursive: true })
writeFileSync(path.join(panels, 'CRMA Kit.jsx'), `#include "${path.join(STUDIO, 'aftereffects', 'CRMA Kit.jsx')}"\n`)
console.log(`After Effects ${versions.at(-1)}: Window → CRMA Kit.jsx  (restart After Effects once)`)

const mogrt = path.join(STUDIO, 'premiere', 'mogrt')
if (existsSync(mogrt)) {
  const dest = path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'Common', 'Motion Graphics Templates', 'CRMA')
  mkdirSync(dest, { recursive: true })
  const files = readdirSync(mogrt).filter(f => f.endsWith('.mogrt'))
  for (const f of files) copyFileSync(path.join(mogrt, f), path.join(dest, f))
  console.log(`Premiere Pro: ${files.length} templates → Essential Graphics → My Templates (${dest})`)
} else {
  console.log('Premiere Pro: no templates yet. Run `node studio/comp.mjs --mogrt`, then this again.')
}
