/**
 * The unsubscribe link in every outreach email. GET only shows a button (mail
 * scanners open links); the button and RFC 8058 one-click POST go to the POST route.
 */
export default defineEventHandler(async (event) => {
  const { p, s } = getQuery(event)
  const ok = typeof p === 'string' && /^\d{1,18}$/.test(p) && typeof s === 'string' && await verifyProspectUnsubscribe(p, s)
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'x-robots-tag', 'noindex')
  setResponseHeader(event, 'cache-control', 'no-store')
  const page = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181818;padding:16px">
<div style="max-width:420px;background:#fff;border:1px solid #dddbda;border-radius:6px;padding:28px;text-align:center">${body}</div></body></html>`
  if (!ok) return page('<p>This link is not valid. Reply to the email with "unsubscribe" and you will not hear from me again.</p>')
  const action = `/api/prospect/unsubscribe?p=${encodeURIComponent(p)}&s=${encodeURIComponent(s)}`
  return page(`<p style="font-size:16px">Stop emails from Swarnil Singhai (CRM Analytics Academy)?</p>
<form method="post" action="${action}"><button style="background:#0176d3;color:#fff;border:0;border-radius:4px;padding:10px 18px;font-weight:600;font-size:14px;cursor:pointer">Unsubscribe</button></form>`)
})
