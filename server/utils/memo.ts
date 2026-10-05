/**
 * A small time-boxed cache in the Worker isolate's memory.
 *
 * Cloudflare reuses an isolate for many requests, so a module-level Map
 * survives between them for as long as the isolate lives — seconds to
 * minutes. That is enough to stop every API call on a page from paying the
 * same network round trip (a session lookup, a leaderboard query) again.
 *
 * It is a latency cache, never a source of truth: entries expire quickly, the
 * map is bounded, and anything that must be exact is not put through it.
 */
interface Entry<T> {
  value: T
  expires: number
}

const store = new Map<string, Entry<unknown>>()
const MAX_ENTRIES = 1000

export async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>, keep: (value: T) => boolean = () => true): Promise<T> {
  const now = Date.now()
  const hit = store.get(key) as Entry<T> | undefined
  if (hit && hit.expires > now) return hit.value

  const value = await fn()
  // Some answers must not be remembered — a failed lookup, say, which would
  // otherwise be served as fact for the whole TTL.
  if (!keep(value)) return value
  if (store.size >= MAX_ENTRIES) {
    // Drop the oldest insertion — Map iterates in insertion order.
    const first = store.keys().next().value
    if (first !== undefined) store.delete(first)
  }
  store.set(key, { value, expires: now + ttlMs })
  return value
}

export function forget(prefix: string) {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key)
}

/** SHA-256 of a secret, so the cache key never holds the secret itself. */
export async function hashKey(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}
