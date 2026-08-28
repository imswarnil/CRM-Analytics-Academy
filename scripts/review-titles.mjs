#!/usr/bin/env node
/**
 * Print the sidebar module titles for every locale, flagging the ones most
 * likely to need a human eye.
 *
 * These six strings per language are the most-read text on the site — they are
 * the sidebar — and machine translation fails on them more often than on prose,
 * because a short title-case phrase gives the engine no context. Two failure
 * modes show up repeatedly:
 *
 *   UNCHANGED — returned identical to English (the engine gave up)
 *   CHECK     — a known wrong-sense translation, e.g. "Foundations" rendered as
 *               charitable foundations (es "Fundaciones", de "Stiftungen")
 *
 * Editing a locale's .navigation.yml by hand is safe: the pipeline only
 * regenerates a file when its ENGLISH source changes.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const LOCALES = ['es', 'fr', 'de', 'pt', 'ja', 'zh', 'hi', 'ar', 'ru', 'bn', 'ur']

/**
 * Renderings observed to be wrong-sense, across all 11 target languages.
 *
 * Two clusters dominate:
 *  - "Foundations" (meaning fundamentals) is read as a charitable foundation in
 *    every single language: Fundaciones / Fondations / Stiftungen / Fundações /
 *    財団 / 基金会 / फाउंडेशन / المؤسسات / Фонды / ফাউন্ডেশন / فاؤنڈیشن.
 *  - Short title-case phrases drift badly in ur and bn — "Collaboration" came
 *    back as کولکاتا (Kolkata) and "Designing Dashboards" as ڈاک ٹکٹ تیار کرنا
 *    (preparing postage stamps).
 *
 * Not exhaustive, and not a gate — a prompt to look, nothing more.
 */
const SUSPECT = new RegExp([
  'Fundaciones', 'Stiftungen', 'Fondations', 'Funda[cç][õo]es',
  '財団', '基金会', 'फाउंडेशन', 'المؤسسات', 'Фонды', 'ফাউন্ডেশন', 'فاؤنڈیشن',
  'Linsen', 'Sentidos', 'Objectifs', 'Lentilhas',
  'کولکاتا', 'ڈاک ٹکٹ', 'محفوظ کریں'
].join('|'), 'i')

const title = (f) => {
  const m = /^title:\s*"?(.*?)"?\s*$/m.exec(readFileSync(f, 'utf8'))
  return m?.[1] ?? ''
}

const modules = readdirSync('content/en', { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort()

const english = Object.fromEntries(
  modules.map(m => [m, title(join('content/en', m, '.navigation.yml'))])
)

let flagged = 0
for (const locale of LOCALES) {
  const rows = []
  for (const m of modules) {
    const f = join('content', locale, m, '.navigation.yml')

    if (!existsSync(f)) {
      rows.push([m, '(not translated yet)', 'MISSING'])
      flagged++
      continue
    }

    const t = title(f)
    let note = ''
    if (t === english[m]) {
      note = 'UNCHANGED'
    } else if (SUSPECT.test(t)) {
      note = 'CHECK'
    }
    if (note) flagged++

    rows.push([m, t, note])
  }
  if (!rows.some(r => r[2])) continue
  console.log(`\n${locale}  (content/${locale}/<module>/.navigation.yml)`)
  for (const [m, t, note] of rows) {
    if (!note) continue
    console.log(`  ${note.padEnd(9)} ${m}`)
    console.log(`             en: ${english[m]}`)
    console.log(`             ${locale}: ${t}`)
  }
}
console.log(`\n${flagged} title(s) worth a human look.`)
