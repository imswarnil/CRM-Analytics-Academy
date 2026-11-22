/**
 * The unsubscribe link in every journey email. GET only shows a button (mail
 * scanners open links, and a GET must not change anything); the button, and
 * the one-click List-Unsubscribe POST from Gmail/Yahoo, go to the POST route.
 */
export default defineEventHandler(async (event) => {
  const { u, s } = getQuery(event)
  const ok = typeof u === 'string' && typeof s === 'string' && await verifyUnsubscribe(u, s)
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'x-robots-tag', 'noindex')
  const page = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email preferences</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181818;padding:16px">
<div style="max-width:420px;background:#fff;border:1px solid #dddbda;border-radius:6px;padding:28px;text-align:center">${body}</div></body></html>`
  if (!ok) return page('<p>This link is not valid. Sign in and email contact@imswarnil.com if you keep getting emails.</p>')
  const action = `/api/email/unsubscribe?u=${encodeURIComponent(u)}&s=${encodeURIComponent(s)}`
  return page(`<p style="font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#0176d3">CRM Analytics Academy</p>
<p style="font-size:16px">Stop course emails (tips, reminders, exam follow-ups)?</p>
<form method="post" action="${action}"><button style="background:#0176d3;color:#fff;border:0;border-radius:4px;padding:10px 18px;font-weight:600;font-size:14px;cursor:pointer">Unsubscribe</button></form>
<p style="font-size:13px;color:#706e6b;margin-top:16px">You will still get receipts and certificates.</p>`)
})
