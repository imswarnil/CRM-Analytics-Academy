#!/usr/bin/env node
/**
 * Loads the Academy's own interview questions into Neon (app.interview_question),
 * from server/db/seed/interview-questions.json. Idempotent: an existing slug is
 * updated, so editing the JSON and re-running is the way to change one.
 *
 *   node --env-file=.env scripts/seed-interview.mjs
 */
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const rows = JSON.parse(readFileSync(new URL('../server/db/seed/interview-questions.json', import.meta.url), 'utf8'))
let n = 0
for (const r of rows) {
  await sql`
    insert into app.interview_question (slug, question, answer_md, type, topic, level, source, status)
    values (${r.slug}, ${r.question}, ${r.answer}, ${r.type}, ${r.topic}, ${r.level}, 'academy', 'approved')
    on conflict (slug) do update set
      question = excluded.question, answer_md = excluded.answer_md, type = excluded.type,
      topic = excluded.topic, level = excluded.level, updated_at = now()
  `
  n++
}
console.log(`[seed-interview] ${n} questions`)
