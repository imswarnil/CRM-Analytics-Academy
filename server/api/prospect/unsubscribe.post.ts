/**
 * Outreach opt-out: the button on the GET page and RFC 8058 one-click.
 * Suppresses the address for good, stops every sequence, logs it.
 */
export default defineEventHandler(async (event) => {
  const { p, s } = getQuery(event)
  if (typeof p !== 'string' || !/^\d{1,18}$/.test(p) || typeof s !== 'string' || !await verifyProspectUnsubscribe(p, s)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid link' })
  }
  const sql = useDb()
  const [row] = await sql`select id, email from app.prospect where id = ${p}`
  if (row) {
    if (row.email) await suppress(String(row.email), 'unsubscribed')
    await sql`update app.prospect_enrollment set status = 'unsubscribed' where prospect_id = ${row.id} and status = 'active'`
    await sql`update app.prospect set status = 'unsubscribed', updated_at = now() where id = ${row.id}`
    await logActivity(Number(row.id), 'unsubscribed', 'Used the unsubscribe link')
  }
  setResponseHeader(event, 'cache-control', 'no-store')
  const accept = getRequestHeader(event, 'accept') ?? ''
  if (!accept.includes('text/html')) return { ok: true }
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181818;padding:16px">
<div style="max-width:420px;background:#fff;border:1px solid #dddbda;border-radius:6px;padding:28px;text-align:center"><p style="font-size:16px">Done. You will not get another email from me.</p></div></body></html>`
})
