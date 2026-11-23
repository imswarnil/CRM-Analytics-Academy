/**
 * Google's redirect after consent (admin session required, signed state).
 * Exchanges the code, reads the mailbox address, seals the refresh token
 * with the site secret and stores it. Then back to /admin → Integrations.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const cfg = googleConfigFromEnv()
  const { code, state, error } = getQuery(event)
  const back = (msg: string) => sendRedirect(event, `/admin?tab=integrations&gmail=${encodeURIComponent(msg)}`, 302)
  if (!cfg) return back('not-configured')
  if (error) return back('denied')
  if (typeof state !== 'string' || !await verifyOauthState(state)) return back('bad-state')
  if (typeof code !== 'string' || code.length > 2000) return back('no-code')
  try {
    const tokens = await exchangeCode(cfg, code, gmailRedirectUri(), fetch as never)
    const email = await profileEmail(tokens.accessToken, fetch as never)
    const sealed = await encryptSecret(tokens.refreshToken, await secretKey())
    const sql = useDb()
    await sql`delete from app.mail_account where email <> ${email}`
    await sql`insert into app.mail_account (email, refresh_enc, status) values (${email}, ${sealed}, 'ok')
              on conflict (email) do update set refresh_enc = excluded.refresh_enc, status = 'ok', connected_at = now()`
    return back('connected')
  } catch (e) {
    console.warn(`gmail connect: ${String((e as Error).message).slice(0, 160)}`)
    return back(String((e as Error).message).slice(0, 120))
  }
})
