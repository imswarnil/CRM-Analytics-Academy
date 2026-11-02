/**
 * A sponsor banner was clicked (views ride on the page view, POST /api/collect): { id, kind: 'view' | 'click', path }.
 * Counted per sponsor, day and page (app.sponsor_stat). Bots are not counted;
 * a sendBeacon text/plain body is accepted.
 */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|python|node-fetch/i
export default defineEventHandler(async (event) => {
  if (BOT.test(getRequestHeader(event, 'user-agent') ?? '')) return { ok: true }
  await rateLimit(event, 'sponsor-track', 300, 10)
  let body: Record<string, unknown> = {}
  try {
    body = JSON.parse(await readRawBody(event, 'utf8') || '{}')
  } catch { /* ignore */ }
  await countSponsor(Number(body.id), body.kind === 'click' ? 'click' : 'view', String(body.path ?? '/'))
  return { ok: true }
})
