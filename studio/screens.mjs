#!/usr/bin/env node
/**
 * Screenshots of the live site for videos, at 2× (2880 px wide) so they stay
 * sharp when zoomed. Ads and the ad-consent pop-up are blocked while capturing.
 *
 *   node studio/screens.mjs intro            capture what studio/films/intro.json lists (missing only)
 *   node studio/screens.mjs intro --refresh  capture all again
 *
 * A spec's `screens` maps a name to a path ("/start") or [path, width, height]
 * (a tall height gives a long page to pan down). Files land in
 * workspace/04-clips/screens/<name>.png.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STUDIO = path.dirname(fileURLToPath(import.meta.url))
const SITE = 'https://crmanalytics.imswarnil.com'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BLOCK = ['fundingchoicesmessages.google.com', 'pagead2.googlesyndication.com', 'googleads.g.doubleclick.net', 'tpc.googlesyndication.com', 'ep2.adtrafficquality.google', 'www.googletagservices.com']

export function captureScreens(screens, { refresh = false } = {}) {
  const dir = path.join(STUDIO, 'workspace', '04-clips', 'screens')
  mkdirSync(dir, { recursive: true })
  for (const [name, v] of Object.entries(screens ?? {})) {
    const [route, w, h] = Array.isArray(v) ? v : [v, 1440, 900]
    const file = path.join(dir, `${name}.png`)
    if (existsSync(file) && !refresh) continue
    spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', `--window-size=${w},${h}`, '--virtual-time-budget=9000',
      `--host-resolver-rules=${BLOCK.map(b => `MAP ${b} 0.0.0.0`).join(', ')}`, `--screenshot=${file}`, `${SITE}${route}`], { stdio: 'ignore' })
    console.log(`${existsSync(file) ? '✓' : '✗'} ${name}  ${route}`)
  }
  return dir
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2] ?? 'intro'
  const spec = JSON.parse(readFileSync(path.join(STUDIO, 'films', `${slug}.json`), 'utf8'))
  captureScreens(spec.screens, { refresh: process.argv.includes('--refresh') })
}
