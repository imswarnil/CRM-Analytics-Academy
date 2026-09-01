/**
 * Create a user.
 *
 * Goes through the auth service's own sign-up endpoint rather than inserting
 * into neon_auth."user" directly — that table stores a password hash in a
 * format Better Auth owns, and a hand-written row is one that cannot sign in.
 *
 * ---------------------------------------------------------------------------
 * CAVEAT, and it is the reason this route is small:
 *
 * There is no email sending configured on this site, so there is no way to
 * send an invite or a reset link. The temporary password is therefore
 * generated here and returned to the ADMIN once, for them to pass on out of
 * band. That is a stopgap, not a good permanent answer: a password that
 * travels through a person is a password that ends up in a chat log.
 *
 * The right shape is an invite email with a single-use link. See next-steps.md
 * — Cloudflare Email Service would cover it and needs no new vendor.
 * ---------------------------------------------------------------------------
 */
function temporaryPassword(): string {
  // 24 chars of base64url from the platform CSPRNG. Not Math.random(), which
  // is seeded predictably and is not a secret generator.
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const base = process.env.NEON_AUTH_BASE_URL
  if (!base) {
    throw createError({ statusCode: 503, statusMessage: 'Auth service is not configured.' })
  }

  const body = await readBody<{ email?: string, name?: string, role?: string }>(event)

  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'That is not a valid email address.' })
  }
  const name = String(body?.name ?? '').trim() || email.split('@')[0]!
  const password = temporaryPassword()

  const upstream = await fetch(`${base}/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'origin': getRequestOrigin(event) },
    body: JSON.stringify({ email, password, name })
  })

  if (!upstream.ok) {
    // Most often: the address already has an account.
    throw createError({
      statusCode: 409,
      statusMessage: 'Could not create that account — the address may already be registered.'
    })
  }

  // Optional role, applied after the account exists.
  const role = String(body?.role ?? 'learner')
  if (['admin', 'moderator'].includes(role)) {
    const sql = useDb()
    const rows = await sql`select id::text as id from neon_auth."user" where lower(email) = ${email}`
    if (rows[0]) {
      await sql`
        insert into app.user_role (user_id, role) values (${rows[0].id}, ${role})
        on conflict (user_id) do update set role = excluded.role, granted_at = now()
      `
    }
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  // Shown once, never stored by us.
  return { ok: true, email, temporaryPassword: password }
})
