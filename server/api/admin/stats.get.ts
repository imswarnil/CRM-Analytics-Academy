/**
 * Aggregate metrics for the admin overview.
 *
 * Every query is wrapped individually: on a database that has not run every
 * migration yet, a missing table zeroes its own metric instead of turning the
 * whole payload into a 500. The dashboard then renders whatever is real.
 */
interface SeriesPoint {
  day: string
  count: number
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()

  const totals = {
    users: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    lessonsCompleted: 0,
    quizAttempts: 0
  }

  try {
    const rows = await sql`select count(*)::int as n from neon_auth."user"`
    totals.users = Number(rows[0]?.n ?? 0)
  } catch {
    // neon_auth is owned by the managed auth service and may not exist in a
    // local database — approximate from the user ids app.* has seen.
    try {
      const rows = await sql`
        select count(distinct user_id)::int as n from (
          select user_id from app.progress
          union
          select user_id from app.submission
        ) ids
      `
      totals.users = Number(rows[0]?.n ?? 0)
    } catch {
      // Leave zero.
    }
  }

  try {
    const rows = await sql`select status, count(*)::int as n from app.submission group by status`
    for (const r of rows) {
      if (r.status === 'pending') totals.pendingSubmissions = Number(r.n)
      if (r.status === 'approved') totals.approvedSubmissions = Number(r.n)
      if (r.status === 'rejected') totals.rejectedSubmissions = Number(r.n)
    }
  } catch {
    // Leave zero.
  }

  try {
    const rows = await sql`select count(*)::int as n from app.progress`
    totals.lessonsCompleted = Number(rows[0]?.n ?? 0)
  } catch {
    // Leave zero.
  }

  try {
    const rows = await sql`select count(*)::int as n from app.quiz_attempt`
    totals.quizAttempts = Number(rows[0]?.n ?? 0)
  } catch {
    // Leave zero.
  }

  // Dense 14-day windows: every day present, zero when nothing happened, so
  // the client draws a fixed-width chart instead of doing calendar math.
  const days: string[] = []
  const now = Date.now()
  for (let i = 13; i >= 0; i--) {
    days.push(new Date(now - i * 86400000).toISOString().slice(0, 10))
  }

  const dense = (rows: { day?: unknown, n?: unknown }[]): SeriesPoint[] => {
    const byDay = new Map(rows.map(r => [String(r.day), Number(r.n)]))
    return days.map(day => ({ day, count: byDay.get(day) ?? 0 }))
  }

  let submissionRows: { day?: unknown, n?: unknown }[] = []
  try {
    submissionRows = await sql`
      select date_trunc('day', created_at)::date::text as day, count(*)::int as n
      from app.submission
      where created_at >= now() - interval '14 days'
      group by 1
    `
  } catch {
    // Leave empty.
  }

  let progressRows: { day?: unknown, n?: unknown }[] = []
  try {
    progressRows = await sql`
      select date_trunc('day', completed_at)::date::text as day, count(*)::int as n
      from app.progress
      where completed_at >= now() - interval '14 days'
      group by 1
    `
  } catch {
    // Leave empty.
  }

  // Signups per day. Deliberately [] (not fourteen zeros) when the query
  // fails: neon_auth."user" belongs to the managed auth service and may not
  // exist locally, and an empty array tells the client "no data available,
  // hide the chart" rather than "fourteen days of nobody signing up".
  let signups: SeriesPoint[] = []
  try {
    const rows = await sql`
      select date_trunc('day', created_at)::date::text as day, count(*)::int as n
      from neon_auth."user"
      where created_at >= now() - interval '14 days'
      group by 1
    `
    signups = dense(rows)
  } catch {
    // Leave empty.
  }

  let topLessons: { path: string, count: number }[] = []
  try {
    const rows = await sql`
      select lesson_path, count(*)::int as n
      from app.progress
      group by lesson_path
      order by n desc, lesson_path
      limit 5
    `
    topLessons = rows.map(r => ({ path: String(r.lesson_path), count: Number(r.n) }))
  } catch {
    // Leave empty.
  }

  const quiz = { attempts: 0, avgScorePct: 0 }
  try {
    const rows = await sql`
      select count(*)::int as attempts,
             coalesce(round(avg(score::numeric / total) * 100), 0)::int as avg_pct
      from app.quiz_attempt
    `
    quiz.attempts = Number(rows[0]?.attempts ?? 0)
    quiz.avgScorePct = Number(rows[0]?.avg_pct ?? 0)
  } catch {
    // Leave zero.
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    totals,
    series: {
      submissions: dense(submissionRows),
      progress: dense(progressRows),
      signups
    },
    topLessons,
    quiz
  }
})
