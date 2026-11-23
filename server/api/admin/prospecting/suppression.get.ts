/** The global do-not-contact list (addresses and @domains). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const rows = await useDb()`select value, reason, note, created_at from app.prospect_suppression order by created_at desc limit 1000`
  return { suppression: rows.map(r => ({ value: String(r.value), reason: String(r.reason), note: (r.note as string | null) ?? null, at: String(r.created_at) })) }
})
