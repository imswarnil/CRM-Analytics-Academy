/**
 * The human-readable message from a failed $fetch.
 *
 * ofetch's `FetchError.statusMessage` is the HTTP reason phrase, and HTTP/2
 * has none — so on the live site it is always empty, and every server message
 * ("Sign in required", "The demo account cannot comment") was replaced by a
 * generic fallback. The message the server wrote is in the response body.
 */
export function apiError(e: unknown): string {
  const err = e as { statusMessage?: string, data?: { statusMessage?: string, message?: string } } | null
  return err?.data?.statusMessage || err?.data?.message || err?.statusMessage || ''
}
