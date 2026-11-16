/** Starts the Google consent flow for "subscribed on YouTube" (server/utils/youtube.ts). */
export default defineEventHandler(async (event) => {
  if (!youtubeConfigured()) return popupResult(event, { ok: false, error: 'not-configured' })
  const user = await getSessionUser(event)
  if (!user) return popupResult(event, { ok: false, error: 'sign-in' })
  await rateLimit(event, 'youtube-connect', 20, 60)

  const subscribe = getQuery(event).subscribe === '1'
  const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('')
  const state = await signState(`${nonce}:${user.id}:${subscribe ? 1 : 0}`)
  setCookie(event, YT_STATE_COOKIE, state, { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax', path: '/api/youtube', maxAge: 600 })

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: youtubeRedirectUri(event),
    response_type: 'code',
    scope: ['openid', 'email', subscribe ? 'https://www.googleapis.com/auth/youtube.force-ssl' : 'https://www.googleapis.com/auth/youtube.readonly'].join(' '),
    state,
    access_type: 'online',
    prompt: 'select_account',
    login_hint: user.email
  })
  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302)
})
