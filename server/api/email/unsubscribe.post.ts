/** Opt out of journey emails: the button on the GET page and RFC 8058 one-click. */
export default defineEventHandler(async (event) => {
  const { u, s } = getQuery(event)
  if (typeof u !== 'string' || typeof s !== 'string' || !await verifyUnsubscribe(u, s)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid link' })
  }
  await useDb()`insert into app.email_optout (user_id) values (${u}) on conflict do nothing`
  const accept = getRequestHeader(event, 'accept') ?? ''
  if (!accept.includes('text/html')) return { ok: true }
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181818;padding:16px">
<div style="max-width:420px;background:#fff;border:1px solid #dddbda;border-radius:6px;padding:28px;text-align:center"><p style="font-size:16px">Done. You will not get course emails any more.</p><p><a href="/" style="color:#0176d3">Back to the Academy</a></p></div></body></html>`
})
