import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'
import { computeEligibility, CERT_COURSE, CERT_MIN_SCORE } from '../utils/progress'

// A short, human-friendly, hard-to-guess certificate code, e.g. CRMA-9F3A-71QD.
function genCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I
  const rand = (n: number) => Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `CRMA-${rand(4)}-${rand(4)}`
}

// Issue (once) or return the signed-in learner's certificate. The code, name,
// score, and date are snapshotted on first issue and never change afterwards.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = serverSupabaseServiceRole<Database>(event)

  // Already issued? Return it verbatim — the code must be stable.
  const { data: existing } = await db
    .from('certificates')
    .select('code, name, course, avg_score, issued_at')
    .eq('user_id', user.id)
    .eq('course', CERT_COURSE)
    .maybeSingle()

  if (existing) {
    return { eligible: true, certMinScore: CERT_MIN_SCORE, certificate: existing }
  }

  const { eligible, avgScore } = await computeEligibility(db, user.id)
  if (!eligible) {
    return { eligible: false, certMinScore: CERT_MIN_SCORE, certificate: null }
  }

  const { data: profile } = await db
    .from('profiles')
    .select('full_name, username')
    .eq('id', user.id)
    .single()
  const name = profile?.full_name || profile?.username || 'Learner'

  // Insert with a fresh code, retrying on the rare code collision. A race on
  // (user_id, course) surfaces as a conflict too — refetch and return that row.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db
      .from('certificates')
      .insert({ code: genCode(), user_id: user.id, name, course: CERT_COURSE, avg_score: avgScore })
      .select('code, name, course, avg_score, issued_at')
      .single()

    if (!error && data) {
      return { eligible: true, certMinScore: CERT_MIN_SCORE, certificate: data }
    }

    // 23505 = unique_violation. If (user_id, course) already exists, return it.
    const { data: raced } = await db
      .from('certificates')
      .select('code, name, course, avg_score, issued_at')
      .eq('user_id', user.id)
      .eq('course', CERT_COURSE)
      .maybeSingle()
    if (raced) {
      return { eligible: true, certMinScore: CERT_MIN_SCORE, certificate: raced }
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Could not issue certificate' })
})
