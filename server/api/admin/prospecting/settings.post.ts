/** Sending settings: daily cap, ramp-up, window, default time zone, sender name, footer, learner suppression. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const entries: [string, unknown][] = []
  const num = (k: string, key: string, min: number, max: number) => {
    if (body[k] === undefined) return
    const n = Math.round(Number(body[k]))
    if (!Number.isFinite(n) || n < min || n > max) throw createError({ statusCode: 400, statusMessage: `${k} must be ${min}–${max}` })
    entries.push([key, n])
  }
  num('dailyCap', 'daily_cap', 0, 200)
  num('rampStart', 'ramp_start', 1, 200)
  num('rampStep', 'ramp_step', 0, 100)
  num('windowStart', 'window_start', 0, 23)
  num('windowEnd', 'window_end', 1, 24)
  if (body.defaultTz !== undefined) {
    if (!isTimeZone(String(body.defaultTz))) throw createError({ statusCode: 400, statusMessage: 'Unknown time zone' })
    entries.push(['default_tz', String(body.defaultTz)])
  }
  if (body.senderName !== undefined) entries.push(['sender_name', pclean(body.senderName, 80) ?? ''])
  if (body.footer !== undefined) {
    const footer = String(body.footer ?? '').trim().slice(0, 500)
    if (footer.length < 10) throw createError({ statusCode: 400, statusMessage: 'The footer must say who you are' })
    entries.push(['footer', footer])
  }
  if (typeof body.suppressLearners === 'boolean') entries.push(['suppress_learners', body.suppressLearners])
  const sql = useDb()
  for (const [k, v] of entries) {
    await sql`insert into app.prospect_setting (key, value) values (${k}, ${JSON.stringify(v)}::jsonb) on conflict (key) do update set value = excluded.value`
  }
  return { ok: true, settings: await prospectSettings() }
})
