/** Starts the Gmail OAuth connect (admin only): redirects to Google's consent screen. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const cfg = googleConfigFromEnv()
  if (!cfg) throw createError({ statusCode: 409, statusMessage: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first (docs/PROSPECTING.md)' })
  return sendRedirect(event, authorizeUrl(cfg, gmailRedirectUri(), await oauthState()), 302)
})
