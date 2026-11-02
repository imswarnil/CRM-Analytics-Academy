export interface MeterStatus {
  signedIn: boolean
  unlimited: boolean
  via: string | null
  allowance: number
  used: number
  remaining: number
  bought: number
  windowDays: number | null
}

/**
 * The reader's sessions (server/utils/meter.ts), shared by the wall, the
 * header counter, /pro and the dashboard. Every page view charges it on the
 * server (POST /api/collect, m: 1) and the answer is `apply`-ed here;
 * `blocked` raises the wall.
 */
export function useMeter() {
  const status = useState<MeterStatus | null>('meter-status', () => null)
  const blocked = useState('meter-blocked', () => false)
  const toast = useToast()
  // Not useI18n(): plugins/analytics.client.ts calls this outside any component,
  // where useI18n() throws (vue-i18n error 26) and takes the whole app down.
  const i18n = useNuxtApp().$i18n as { t: (k: string, p?: Record<string, unknown>) => string }
  const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

  async function refresh() {
    status.value = await $fetch<MeterStatus>('/api/meter').catch(() => status.value)
  }

  /** A meter answer (from the page view, or from POST /api/meter). */
  function apply(res: { ok: boolean, charged: boolean, status?: MeterStatus | null }, path: string) {
    if (res.status) status.value = res.status
    blocked.value = !res.ok
    if (res.charged && res.status && !res.status.unlimited && res.status.remaining <= 3) {
      toast.add({ title: t('meter.low', { n: res.status.remaining }), icon: 'i-lucide-book-open', color: 'warning' })
    }
    if (!res.ok) useNuxtApp().$track?.('meter_wall', path)
  }

  /** Only when the page view could not carry the meter (plugins/analytics.client.ts). */
  async function open(path: string) {
    const res = await $fetch<{ ok: boolean, charged: boolean, status: MeterStatus }>('/api/meter', { method: 'POST', body: { path } }).catch(() => null)
    if (res) apply(res, path) // the meter failing must never hide a page
  }

  return { status, blocked, refresh, open, apply }
}
