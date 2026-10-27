#!/usr/bin/env node
// content-creation/obs/install.mjs — `pnpm obs:install`: the OBS profile and scene collection for recording
// lessons, in the CRMA Blueprint design, built from native OBS sources you can select and edit.
//
//   Profile           "CRMA Recording": 1920×1080 at 30 fps (the Final Cut Pro projects' format), Apple
//                     hardware H.264 at "indistinguishable" quality, .mov, 48 kHz, every take saved to
//                     content-creation/sessions/inbox/ as "YYYY-MM-DD hh-mm-ss.mov". ⌃⌥⌘R starts and stops.
//   Scene collection  "CRMA Recording":
//     CRMA · Title ⌃⌥⌘0 · CRMA · Camera ⌃⌥⌘1 · CRMA · Screen ⌃⌥⌘2 · CRMA · Screen + Camera ⌃⌥⌘3,
//     built from components that are scenes of their own (listed after the four), so editing one edits
//     it everywhere: CRMA ◆ Paper · Logo · Brand · Name Card · Live Tab · Window Bar · Lesson Column ·
//     Marks (one per frame).
//   Every shape is a Color source and every word a Text source (CRMA Grotesk / IBM Plex Mono); the graph
//   paper is the one image. The lesson's words are OBS texts shared by every scene that shows them —
//   Lesson Title, Lesson Eyebrow, Name, Role, Address — so you edit one in OBS and every scene follows.
//   `pnpm obs:install [<session slug>]` fills them from that session.yml once; after that OBS owns them.
//   Transitions: CRMA Paper (through the paper colour), CRMA Fade, CRMA Slide, CRMA Swipe, CRMA Wipe;
//   CRMA · Title always leaves through CRMA Paper.
//   The mic gets noise suppression, a compressor and a limiter.
//
// Quit OBS first: it rewrites these files when it closes. The previous CRMA Recording files are backed up;
// other profiles and collections are left alone. Pick these two in OBS's Profile and Scene Collection menus.

import { randomUUID } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { HERE } from '../fcp-shared.mjs'
import { lessonFrom } from './lesson.mjs'

const OBS = join(homedir(), 'Library', 'Application Support', 'obs-studio', 'basic')
const INBOX = join(HERE, 'sessions', 'inbox')
const NAME = 'CRMA Recording'
const DIR = 'CRMA_Recording'

if (spawnSync('pgrep', ['-x', 'OBS']).status === 0) {
  console.error('! OBS is running. Quit it (⌘Q) and run pnpm obs:install again — OBS overwrites its config when it closes.')
  process.exit(1)
}
if (!existsSync(OBS)) {
  console.error(`! No OBS config at ${OBS}. Open OBS once, quit it, then run this again.`)
  process.exit(1)
}
mkdirSync(INBOX, { recursive: true })

// ---------------------------------------------------------------- Blueprint tokens and layout (px, top-left origin)
const C = {
  paper: '#F4F7FB', card: '#FBFCFE', ink: '#0C1B33', ink2: '#4A5B78', line: '#C3D2E6',
  signal: '#2F5BEA', tide: '#3D8BD9', frost: '#A8CCF2', ice: '#DDEBFA', white: '#FFFFFF', light: '#A9B4C6'
}
const SANS = 'CRMA Grotesk'
const MONO = 'IBM Plex Mono'
const BAR = 52
const COL = 1624
const L = {
  camera: { x: 160, y: 64, w: 1600, h: 900 },
  screen: { x: 64, y: 64 + BAR, w: 1504, h: 846 },
  small: { x: COL, y: 600, w: 272, h: 272 }
}

function knownDevices() {
  const found = { camera: null, display: null }
  for (const f of ['Broadcast_Kit.json', 'Swarnil_Broadcast_Kit.json', 'Untitled.json']) {
    const p = join(OBS, 'scenes', f)
    if (!existsSync(p)) continue
    try {
      for (const s of JSON.parse(readFileSync(p, 'utf8')).sources ?? []) {
        if (s.id === 'macos-avcapture' && !found.camera) found.camera = s.settings
        if (s.id === 'screen_capture' && !found.display) found.display = s.settings
      }
    } catch {
      // a collection OBS is halfway through writing: skip it
    }
  }
  return found
}

function backup(p) {
  if (existsSync(p)) copyFileSync(p, `${p}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`)
}

// ---------------------------------------------------------------- fonts, the lesson's words, the graph paper
const fonts = spawnSync('python3', [join(HERE, 'obs', 'fonts.py')], { encoding: 'utf8' })
if (fonts.status !== 0) console.warn(`! CRMA Grotesk not installed (${(fonts.stderr || fonts.stdout).trim().split('\n').at(-1)}); titles fall back to the default font. pip install fonttools, then run this again.`)

const lesson = lessonFrom(process.argv[2])
const ASSETS = join(HERE, 'obs', 'live')
mkdirSync(ASSETS, { recursive: true })
const graphPaper = join(ASSETS, 'graph-paper.png')
{
  // tokens: 24 px grid, every 5th line stronger, rulers along the top and left edges (as the thumbnails)
  let minor = '', major = '', ruler = ''
  for (let i = 0, x = 0; x <= 1920; x += 24, i++) (i % 5 ? (minor += `M${x} 0V1080`) : (major += `M${x} 0V1080`))
  for (let i = 0, y = 0; y <= 1080; y += 24, i++) (i % 5 ? (minor += `M0 ${y}H1920`) : (major += `M0 ${y}H1920`))
  for (let t = 0; t <= 1920; t += 12) ruler += `M${t} 0V${t % 120 === 0 ? 18 : t % 60 === 0 ? 13 : 8}`
  for (let t = 0; t <= 1080; t += 12) ruler += `M0 ${t}H${t % 120 === 0 ? 18 : t % 60 === 0 ? 13 : 8}`
  writeFileSync(`${graphPaper}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">`
  + `<path d="${minor}" stroke="${C.line}" stroke-opacity=".45" stroke-width="1" fill="none"/>`
  + `<path d="${major}" stroke="${C.ink2}" stroke-opacity=".16" stroke-width="1.5" fill="none"/>`
  + `<path d="${ruler}" stroke="${C.ink}" stroke-opacity=".55" stroke-width="1.5" fill="none"/></svg>`)
  execFileSync('rsvg-convert', [`${graphPaper}.svg`, '-o', graphPaper])
}

// ---------------------------------------------------------------- builders
const sources = [] // inputs (shapes, texts, images, devices)
const components = [] // CRMA ◆ scenes, in the order they are made
const abgr = (hex) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return 0xFF000000 + (b << 16) + (g << 8) + r
}
const base = (id, name, settings, extra = {}) => ({
  name, 'uuid': randomUUID(), id, 'versioned_id': id, settings, 'mixers': 0, 'sync': 0, 'flags': 0, 'volume': 1.0, 'balance': 0.5,
  'enabled': true, 'muted': false, 'push-to-mute': false, 'push-to-mute-delay': 0, 'push-to-talk': false, 'push-to-talk-delay': 0,
  'hotkeys': {}, 'deinterlace_mode': 0, 'deinterlace_field_order': 0, 'monitoring_type': 0, 'private_settings': {}, ...extra
})
const names = new Set()
const unique = (n) => {
  let k = n, i = 2
  while (names.has(k)) k = `${n} ${i++}`
  names.add(k)
  return k
}
const input = (id, name, settings, extra) => {
  const s = base(id, unique(name), settings, extra)
  sources.push(s)
  return s
}
/** A Color source: one flat Blueprint shape. */
const rect = (name, w, h, color) => input('color_source_v3', name, { color: abgr(color), width: Math.round(w), height: Math.round(h) })
/** A Text source holding its own words. */
const text = (name, { value = '', face = MONO, style = 'Medium', size = 22, color = C.ink, wrap = 0 }) =>
  input('text_ft2_source_v2', name, {
    font: { face, style, size, flags: 0 }, text: value, from_file: false,
    color1: abgr(color), color2: abgr(color), word_wrap: wrap > 0, custom_width: wrap, antialiasing: true, outline: false, drop_shadow: false
  })

let itemId = 0
/** A scene item. Video is given a box (w, h) that it fits, or covers and crops; everything else keeps its size. */
const put = (src, x, y, { scale = 1, w, h, cover = false } = {}) => ({
  name: src.name, source_uuid: src.uuid, visible: true, locked: false, rot: 0.0, align: 5,
  bounds_type: w ? (cover ? 3 : 2) : 0, bounds_align: 0, bounds_crop: cover, crop_left: 0, crop_top: 0, crop_right: 0, crop_bottom: 0,
  id: ++itemId, group_item_backup: false, pos: { x, y }, scale: { x: scale, y: scale }, bounds: { x: w ?? 0, y: h ?? 0 },
  scale_filter: 'disable', blend_method: 'default', blend_type: 'normal', show_transition: { duration: 0 }, hide_transition: { duration: 0 }, private_settings: {}
})
/** A scene; items bottom first, as OBS saves them. */
const scene = (name, items, key) => base('scene', name, { id_counter: items.length, custom_size: false, items },
  { hotkeys: key ? { 'OBSBasic.SelectScene': [{ control: true, alt: true, command: true, key }] } : {} })
const component = (name, items) => {
  const s = scene(`CRMA ◆ ${name}`, items)
  components.push(s)
  return s
}

/** Crop marks: a "+" just outside each corner of a box, as two thin rects each. */
function marks(name, { x, y, w, h }, len = 18, off = 14) {
  const items = []
  for (const [cx, cy, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) {
    const px = cx + sx * off, py = cy + sy * off
    items.push(put(rect('Mark —', len * 2, 2, C.ink), px - len, py - 1), put(rect('Mark |', 2, len * 2, C.ink), px - 1, py - len))
  }
  return component(`Marks · ${name}`, items)
}
/** Ink border (4 px) and hard shadow under a video box; `top` extends it up over a window bar. */
const frame = ({ x, y, w, h }, shadow = 12, top = 0) => [
  put(rect('Frame Shadow', w + 8, h + 8 + top, C.ink), x - 4 + shadow, y - 4 - top + shadow),
  put(rect('Frame Border', w + 8, h + 8 + top, C.ink), x - 4, y - 4 - top)
]

// ---------------------------------------------------------------- components
// The lesson's words: one source each, placed (and scaled) wherever they appear.
const words = {
  title: text('Lesson Title', { value: lesson.title, face: SANS, style: 'Black', size: 46, wrap: 272 }),
  eyebrow: text('Lesson Eyebrow', { value: lesson.eyebrow, size: 15, color: C.signal, wrap: 272 }),
  name: text('Name', { value: lesson.name, face: SANS, style: 'ExtraBold', size: 36 }),
  role: text('Role', { value: lesson.role, size: 18, color: C.signal }),
  url: text('Address', { value: lesson.url, size: 17, color: C.ink2 })
}
const paper = component('Paper', [
  put(rect('Paper', 1920, 1080, C.paper), 0, 0),
  put(input('image_source', 'Graph Paper', { file: graphPaper, unload: false }), 0, 0),
  ...[[54, 54], [1866, 54], [54, 1026], [1866, 1026]].flatMap(([x, y]) => [put(rect('Corner —', 44, 2, C.ink), x - 22, y - 1), put(rect('Corner |', 2, 44, C.ink), x - 1, y - 22)])
])

const k = 72 / 512 // public/icon.svg, drawn on a 72 px square
const logo = component('Logo', [
  put(rect('Logo Frame', 460 * k, 460 * k, C.ink), 26 * k, 26 * k),
  put(rect('Logo Paper', 404 * k, 404 * k, C.paper), 54 * k, 54 * k),
  put(rect('Logo Bar 1', 64 * k, 100 * k, C.frost), 128 * k, 292 * k),
  put(rect('Logo Bar 2', 64 * k, 168 * k, C.tide), 224 * k, 224 * k),
  put(rect('Logo Bar 3', 64 * k, 252 * k, C.signal), 320 * k, 140 * k)
])

const brand = component('Brand', [
  put(logo, 0, 0, { scale: 44 / 72 }),
  put(text('Brand Text', { value: 'CRM ANALYTICS ACADEMY', size: 20, color: C.ink2 }), 58, 10)
])

const nameCard = component('Name Card', [
  put(rect('Card Shadow', 428, 104, C.ink), 8, 8),
  put(rect('Card Border', 428, 104, C.ink), 0, 0),
  put(rect('Card', 420, 96, C.card), 4, 4),
  put(words.name, 26, 10),
  put(words.role, 28, 64)
])

const liveTab = component('Live Tab', [
  put(rect('Tab Border', 300, 40, C.ink), 0, 0),
  put(rect('Tab', 294, 34, C.signal), 3, 3),
  put(text('Tab Text', { value: 'FIG. — LIVE', size: 18, color: C.white }), 18, 7)
])

const windowBar = component('Window Bar', [
  put(rect('Bar Edge', L.screen.w + 8, BAR + 4, C.ink), 0, 0),
  put(rect('Bar', L.screen.w, BAR - 4, C.ice), 4, 4),
  ...[C.ink, C.ink2, C.light].map((c, i) => put(rect(`Light ${i + 1}`, 14, 14, c), 24 + i * 24, 21)),
  put(rect('Address Edge', 624, 34, C.ink), 108, 11),
  put(rect('Address', 620, 30, C.card), 110, 13),
  put(words.url, 124, 15)
])

const column = component('Lesson Column', [
  put(rect('Accent', 72, 8, C.signal), 0, 64),
  put(text('Figure', { value: 'FIG. — SCREEN', size: 18, color: C.signal }), 0, 84),
  put(words.eyebrow, 0, 116),
  put(words.title, 0, 168),
  put(logo, 0, 996, { scale: 0.75 }),
  put(text('Column Brand 1', { value: 'CRM ANALYTICS', size: 15, color: C.ink2 }), 66, 1004),
  put(text('Column Brand 2', { value: 'ACADEMY', size: 15, color: C.ink2 }), 66, 1026)
])

const screenWindow = { ...L.screen, y: L.screen.y - BAR, h: L.screen.h + BAR }
const marksCamera = marks('Camera', L.camera)
const marksScreen = marks('Screen', screenWindow)
const marksSmall = marks('Small Camera', L.small, 12, 10)

// ---------------------------------------------------------------- devices and the four scenes
const dev = knownDevices()
const camera = input('macos-avcapture', 'Camera', { ...(dev.camera ?? {}), preset: 'AVCaptureSessionPreset1920x1080', use_preset: true })
const screen = input('screen_capture', 'Screen', { ...(dev.display ?? {}), type: 0, show_cursor: true, hide_obs: true })
const mic = base('coreaudio_input_capture', 'Mic', { device_id: 'default' }, {
  mixers: 255,
  filters: [
    { name: 'Noise Suppression', id: 'noise_suppress_filter_v2', settings: { method: 'rnnoise' } },
    { name: 'Compressor', id: 'compressor_filter', settings: { ratio: 3.0, threshold: -20.0, attack_time: 6, release_time: 60, output_gain: 3.0 } },
    { name: 'Limiter', id: 'limiter_filter', settings: { threshold: -1.5, release_time: 60 } }
  ].map(f => ({ ...f, uuid: randomUUID(), versioned_id: f.id, enabled: true, mixers: 0, hotkeys: {}, private_settings: {} }))
})
const box = r => ({ w: r.w, h: r.h })
const screenParts = () => [
  put(paper, 0, 0),
  ...frame(L.screen, 12, BAR),
  put(screen, L.screen.x, L.screen.y, box(L.screen)),
  put(windowBar, L.screen.x - 4, L.screen.y - BAR - 4),
  put(marksScreen, 0, 0),
  put(column, COL, 0)
]

const scenes = [
  scene('CRMA · Title', [
    put(paper, 0, 0),
    put(rect('Title Accent', 200, 16, C.signal), 160, 150),
    put(words.eyebrow, 160, 190, { scale: 2 }),
    put(words.title, 152, 240, { scale: 120 / 46 }),
    put(logo, 1440, 220, { scale: 300 / 72 }),
    put(nameCard, 1300, 760),
    put(brand, 160, 920, { scale: 56 / 44 })
  ], 'OBS_KEY_0'),
  scene('CRMA · Camera', [
    put(paper, 0, 0),
    ...frame(L.camera),
    put(camera, L.camera.x, L.camera.y, box(L.camera)),
    put(marksCamera, 0, 0),
    put(liveTab, L.camera.x, L.camera.y - 2),
    put(nameCard, L.camera.x - 48, L.camera.y + L.camera.h - 72),
    put(words.eyebrow, L.camera.x + 420, 1022, { scale: 18 / 15 }),
    put(brand, L.camera.x + L.camera.w - 380, 1000)
  ], 'OBS_KEY_1'),
  scene('CRMA · Screen', screenParts(), 'OBS_KEY_2'),
  scene('CRMA · Screen + Camera', [
    ...screenParts(),
    ...frame(L.small, 8),
    put(camera, L.small.x, L.small.y, { ...box(L.small), cover: true }),
    put(marksSmall, 0, 0),
    put(nameCard, L.small.x, L.small.y + L.small.h + 18, { scale: 0.62 })
  ], 'OBS_KEY_3')
]

// ---------------------------------------------------------------- profile
const hotkey = key => JSON.stringify({ bindings: [{ control: true, alt: true, command: true, key }] })
const ini = `[General]
Name=${NAME}

[Output]
Mode=Simple
FilenameFormatting=%CCYY-%MM-%DD %hh-%mm-%ss
OverwriteIfExists=false
Reconnect=true

[SimpleOutput]
FilePath=${INBOX}
RecFormat2=hybrid_mov
RecQuality=HQ
RecEncoder=apple_h264
RecAudioEncoder=aac
StreamEncoder=apple_h264
VBitrate=6000
ABitrate=192
RecRB=false

[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=0
FPSCommon=30
ScaleType=lanczos
ColorFormat=NV12
ColorSpace=709
ColorRange=Partial

[Audio]
SampleRate=48000
ChannelSetup=Stereo

[Hotkeys]
OBSBasic.StartRecording=${hotkey('OBS_KEY_R')}
OBSBasic.StopRecording=${hotkey('OBS_KEY_R')}
`
const profileDir = join(OBS, 'profiles', DIR)
mkdirSync(profileDir, { recursive: true })
backup(join(profileDir, 'basic.ini'))
writeFileSync(join(profileDir, 'basic.ini'), ini)

// ---------------------------------------------------------------- transitions (OBS's own; pick one in the Scene Transitions dock)
const transitions = [
  { name: 'CRMA Paper', id: 'fade_to_color_transition', settings: { color: abgr(C.paper), switch_point: 50 } },
  { name: 'CRMA Fade', id: 'fade_transition', settings: {} },
  { name: 'CRMA Slide', id: 'slide_transition', settings: { direction: 'left' } },
  { name: 'CRMA Swipe', id: 'swipe_transition', settings: { direction: 'left', swipe_in: false } },
  { name: 'CRMA Wipe', id: 'wipe_transition', settings: { luma_image: 'linear-h.png', luma_softness: 0.08, luma_invert: false } }
]
// Per-scene override (Transition Override in the scene's right-click menu): the title sheet leaves through paper.
scenes[0].private_settings = { transition: 'CRMA Paper', transition_duration: 600 }

// ---------------------------------------------------------------- collection: the four scenes first, then the components
const order = [...scenes, ...components]
const collection = {
  name: NAME,
  AuxAudioDevice1: mic,
  sources: [...sources, ...order],
  groups: [],
  scene_order: order.map(s => ({ name: s.name })),
  current_scene: scenes[1].name,
  current_program_scene: scenes[1].name,
  current_transition: 'CRMA Fade',
  transition_duration: 400,
  transitions,
  quick_transitions: [],
  saved_projectors: [],
  preview_locked: false,
  modules: {},
  resolution: { x: 1920, y: 1080 },
  version: 2
}
const scenePath = join(OBS, 'scenes', `${DIR}.json`)
backup(scenePath)
writeFileSync(scenePath, JSON.stringify(collection, null, 4))

console.log(`Installed into OBS:
  profile           ${NAME}   (1080p30, Apple H.264, .mov → ${INBOX})
  scene collection  ${NAME}   Title ⌃⌥⌘0 · Camera ⌃⌥⌘1 · Screen ⌃⌥⌘2 · Screen + Camera ⌃⌥⌘3
                    + ${components.length} CRMA ◆ components from ${sources.length - 2} native shapes, texts and the graph paper
                    5 CRMA transitions; texts start as "${lesson.title}" — edit them in OBS
  record            ⌃⌥⌘R starts and stops
Open OBS → Profile → ${NAME}, and Scene Collection → ${NAME}.
${dev.camera ? `Camera: ${dev.camera.device_name ?? 'from your other collection'}.` : 'Camera: none picked yet — double-click "Camera" in OBS and choose one.'} ${dev.display ? 'Display: from your other collection.' : 'Display: double-click "Screen" in OBS and choose one.'}`)
