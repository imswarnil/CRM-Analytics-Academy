import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Public certificate validation. Given an exact code, return the holder name,
// course, score, and issue date so anyone can confirm a shared certificate is
// genuine. Exact-match only — no listing, no enumeration of other fields.
export default defineEventHandler(async (event) => {
  const raw = getQuery(event).code
  const code = (typeof raw === 'string' ? raw : '').trim().toUpperCase()
  if (!code || code.length > 32) {
    return { valid: false }
  }

  const db = serverSupabaseServiceRole<Database>(event)
  const { data } = await db
    .from('certificates')
    .select('code, name, course, avg_score, issued_at')
    .eq('code', code)
    .maybeSingle()

  if (!data) return { valid: false }
  return {
    valid: true,
    code: data.code,
    name: data.name,
    course: data.course,
    avgScore: data.avg_score,
    issuedAt: data.issued_at
  }
})
