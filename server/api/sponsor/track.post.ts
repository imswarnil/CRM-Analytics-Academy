/**
 * A sponsor banner was seen or clicked: { id, kind: 'view' | 'click', path }.
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
  const id = Number(body.id)
  const kind = body.kind === 'click' ? 'click' : 'view'
  const path = String(body.path ?? '/').replace(/^\/(es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/, '').slice(0, 200) || '/'
  if (!Number.isInteger(id) || id <= 0 || !/^\/[a-z0-9/-]*$/.test(path)) return { ok: true }
  await useDb()`
    insert into app.sponsor_stat (sponsor_id, path, views, clicks)
    select ${id}, ${path}, ${kind === 'view' ? 1 : 0}, ${kind === 'click' ? 1 : 0}
    where exists (select 1 from app.sponsor where id = ${id} and status = 'live')
    on conflict (sponsor_id, day, path) do update set views = app.sponsor_stat.views + excluded.views, clicks = app.sponsor_stat.clicks + excluded.clicks`
  return { ok: true }
})
