#!/usr/bin/env node
/**
 * Pulls approved community interview questions from Neon into English source
 * files, content/en/interview-questions/<slug>.md, so the build translates and
 * prerenders them like everything else. Existing files are never overwritten.
 * Run by scripts/prebuild.mjs on your machine (skipped in CI and without
 * DATABASE_URL); approve submissions in /admin → Interview Q&A first.
 */
import { existsSync, writeFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { stringify } from 'yaml'

if (!process.env.DATABASE_URL) {
  console.log('[pull-interview] no DATABASE_URL — skipped')
  process.exit(0)
}
const sql = neon(process.env.DATABASE_URL)
const rows = await sql`
  select slug, question, answer_md, type, topic, level, company, role
  from app.interview_question where status = 'approved' and source = 'community'`
const excerpt = (md, n = 155) => {
  const t = md.replace(/[#*_`>[\]()]/g, '').replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t
}
// Community markdown becomes a public page: no raw HTML (it would render as
// markup), no javascript:/data: links, no MDC components.
const safeMarkdown = md => String(md)
  .replace(/<(?=[a-z/!?])/gi, '&lt;')
  .replace(/\]\(\s*(javascript|data|vbscript):[^)]*\)/gi, '](#)')
  .replace(/^(\s*):{2,}/gm, '$1')
const plain = s => String(s).replace(/[<>]/g, '').slice(0, 300)

let added = 0
const ok = r => /^[a-z0-9-]{3,100}$/.test(r.slug)
  && ['conceptual', 'technical', 'scenario', 'behavioral', 'saql'].includes(r.type)
  && ['junior', 'mid', 'senior'].includes(r.level)
  && /^[a-z0-9-]{2,60}$/.test(r.topic)
for (const r of rows) {
  if (!ok(r)) {
    console.warn(`[pull-interview] skipped ${String(r.slug).slice(0, 60)}: unexpected fields`)
    continue
  }
  const file = new URL(`../content/en/interview-questions/${r.slug}.md`, import.meta.url)
  if (existsSync(file)) continue
  const fm = { title: plain(r.question), description: plain(excerpt(r.answer_md)), type: r.type, topic: r.topic, level: r.level, ...(r.company ? { company: plain(r.company) } : {}), ...(r.role ? { role: plain(r.role) } : {}), source: 'community' }
  writeFileSync(file, `---\n${stringify(fm, { lineWidth: 0 }).trimEnd()}\n---\n\n${safeMarkdown(r.answer_md).trim()}\n`)
  added++
}
console.log(`[pull-interview] ${added} new community question(s) written`)
