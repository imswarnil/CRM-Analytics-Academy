/**
 * Google → here. Checks the state against the httpOnly cookie and the signed
 * in user, exchanges the code, (optionally) subscribes, checks the
 * subscription, records the answer and revokes the token.
 */
interface Token { access_token: string, id_token?: string }

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const cookie = getCookie(event, YT_STATE_COOKIE)
  deleteCookie(event, YT_STATE_COOKIE, { path: '/api/youtube' })
  if (q.error) return popupResult(event, { ok: false, error: 'cancelled' })

  const state = String(q.state ?? '')
  const payload = await readState(state)
  const user = await getSessionUser(event)
  if (!payload || !cookie || cookie !== state || !user) return popupResult(event, { ok: false, error: 'state' })
  const [, userId, flag] = payload.split(':')
  if (userId !== user.id) return popupResult(event, { ok: false, error: 'state' })

  const token = await $fetch<Token>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code: String(q.code ?? ''),
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: youtubeRedirectUri(event),
      grant_type: 'authorization_code'
    }).toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  }).catch(() => null)
  if (!token?.access_token) return popupResult(event, { ok: false, error: 'token' })
  const auth = { authorization: `Bearer ${token.access_token}` }
  const channel = process.env.YOUTUBE_CHANNEL_ID!

  try {
    const me = await $fetch<{ sub: string, email?: string }>('https://openidconnect.googleapis.com/v1/userinfo', { headers: auth })
    const check = () => $fetch<{ items?: unknown[] }>('https://www.googleapis.com/youtube/v3/subscriptions', {
      headers: auth, query: { part: 'id', mine: 'true', forChannelId: channel, maxResults: 1 }
    })
    let subscribed = Boolean((await check()).items?.length)
    if (!subscribed && flag === '1') {
      await $fetch('https://www.googleapis.com/youtube/v3/subscriptions', {
        method: 'POST', headers: auth, query: { part: 'snippet' },
        body: { snippet: { resourceId: { kind: 'youtube#channel', channelId: channel } } }
      }).catch(() => null)
      subscribed = Boolean((await check()).items?.length)
    }

    const sql = useDb()
    // One Google account unlocks one Academy account.
    const [taken] = await sql`select user_id from app.youtube_link where google_sub = ${me.sub} and user_id <> ${user.id}`
    if (taken) return popupResult(event, { ok: false, error: 'linked-elsewhere' })
    await sql`
      insert into app.youtube_link (user_id, google_sub, google_email, subscribed, verified_at)
      values (${user.id}, ${me.sub}, ${me.email ?? null}, ${subscribed}, now())
      on conflict (user_id) do update set google_sub = excluded.google_sub, google_email = excluded.google_email,
        subscribed = excluded.subscribed, verified_at = now()`
    return popupResult(event, { ok: true, subscribed })
  } catch {
    return popupResult(event, { ok: false, error: 'youtube' })
  } finally {
    // Nothing from Google is kept: give the token back.
    event.waitUntil(fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token.access_token)}`, { method: 'POST' }).catch(() => null))
  }
})
