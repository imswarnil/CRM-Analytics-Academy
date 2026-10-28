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
let added = 0
for (const r of rows) {
  const file = new URL(`../content/en/interview-questions/${r.slug}.md`, import.meta.url)
  if (existsSync(file)) continue
  const fm = { title: r.question, description: excerpt(r.answer_md), type: r.type, topic: r.topic, level: r.level, ...(r.company ? { company: r.company } : {}), ...(r.role ? { role: r.role } : {}), source: 'community' }
  writeFileSync(file, `---\n${stringify(fm, { lineWidth: 0 }).trimEnd()}\n---\n\n${String(r.answer_md).trim()}\n`)
  added++
}
console.log(`[pull-interview] ${added} new community question(s) written`)
