/**
 * /admin → Emails: preview who is due which journey email (`dry`), or run the
 * hourly job now. Never sends without RESEND_API_KEY.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ dry?: boolean }>(event).catch(() => null)
  const report = await runJourneys({ dry: body?.dry !== false })
  const [counts] = await useDb()`select
    (select count(*)::int from app.email_sent where sent_at > now() - interval '30 days') as sent30,
    (select count(*)::int from app.email_optout) as optouts`
  return { ...report, sent30: counts?.sent30 ?? 0, optouts: counts?.optouts ?? 0 }
})
