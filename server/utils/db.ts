import { neon } from '@neondatabase/serverless'

/**
 * Neon over HTTP.
 *
 * The HTTP driver rather than the TCP one because this runs on Cloudflare
 * Workers, where a long-lived socket pool does not exist and every request may
 * be a cold isolate. The pooled connection string is the right endpoint for the
 * same reason.
 *
 * Created per request rather than at module scope: a Worker isolate can be
 * reused across requests belonging to different users, and a client captured
 * in module state is the kind of thing that leaks one request's context into
 * another's.
 */
export function useDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'DATABASE_URL is not configured' })
  }
  return neon(url)
}
