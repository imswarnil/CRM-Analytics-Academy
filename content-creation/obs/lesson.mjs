// content-creation/obs/lesson.mjs — the words the CRMA OBS scenes start with.
//
// `pnpm obs:install [<session slug>]` seeds the shared OBS texts (Lesson Title, Lesson Eyebrow, Name,
// Role, Address) from that session's session.yml. After that the words live in OBS: edit them there.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { HERE as CC } from '../fcp-shared.mjs'

export function lessonFrom(slug) {
  let y = {}
  const p = slug && join(CC, 'sessions', slug, 'session.yml')
  if (p && existsSync(p)) y = parseYaml(readFileSync(p, 'utf8')) ?? {}
  return {
    title: String(y.title ?? 'CRM Analytics Academy'),
    eyebrow: String(y.eyebrow ?? 'CRM ANALYTICS ACADEMY').toUpperCase(),
    name: String(y.instructor ?? 'Swarnil Singhai'),
    role: String(y.role ?? 'CRM ANALYTICS').toUpperCase(),
    url: String(y.url ?? 'crmanalytics.imswarnil.com')
  }
}
