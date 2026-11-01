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
 * header counter, /pro and the dashboard. `open` is called for every metered
 * page by plugins/meter.client.ts; `blocked` raises the wall.
 */
export function useMeter() {
  const status = useState<MeterStatus | null>('meter-status', () => null)
  const blocked = useState('meter-blocked', () => false)
  const toast = useToast()
  const { t } = useI18n()

  async function refresh() {
    status.value = await $fetch<MeterStatus>('/api/meter').catch(() => status.value)
  }

  async function open(path: string) {
    const res = await $fetch<{ ok: boolean, charged: boolean, status: MeterStatus }>('/api/meter', { method: 'POST', body: { path } }).catch(() => null)
    if (!res) return // the meter failing must never hide a page
    status.value = res.status
    blocked.value = !res.ok
    if (res.charged && !res.status.unlimited && res.status.remaining <= 3) {
      toast.add({ title: t('meter.low', { n: res.status.remaining }), icon: 'i-lucide-ticket', color: 'warning' })
    }
    if (!res.ok) useNuxtApp().$track?.('meter_wall', path)
  }

  async function buy(packs = 1) {
    const res = await $fetch<{ balance: number, status: MeterStatus }>('/api/meter/buy', { method: 'POST', body: { packs } })
    status.value = res.status
    blocked.value = false
    useNuxtApp().$track?.('pack_buy', String(packs))
    return res
  }

  return { status, blocked, refresh, open, buy }
}
