<script setup lang="ts">
/**
 * The live sponsor's banner, under the navbar on every page. Several live
 * sponsors take turns by page view. Each page counts one view per sponsor and
 * every CTA click (POST /api/sponsor/track) — the numbers the sponsor sees in
 * their studio. Shown to everyone, members included: it is not an ad network.
 */
interface Live { id: number, company: string, creative: Record<string, string> }
const route = useRoute()
const { data } = useLazyFetch<{ sponsors: Live[] }>('/api/sponsor/live', { server: false, key: 'sponsor-live' })
const turn = useState('sponsor-turn', () => 0)
const current = computed(() => {
  const list = data.value?.sponsors ?? []
  return list.length ? list[turn.value % list.length] : null
})
const track = (id: number, kind: 'view' | 'click') => {
  const body = JSON.stringify({ id, kind, path: route.path })
  if (navigator.sendBeacon) navigator.sendBeacon('/api/sponsor/track', new Blob([body], { type: 'text/plain' }))
  else fetch('/api/sponsor/track', { method: 'POST', body, keepalive: true }).catch(() => {})
}
// Each navigation shows the next sponsor; each (page, sponsor) counts one view.
watch(() => route.path, () => turn.value++)
const counted = new Set<string>()
watch(() => [route.path, current.value?.id] as const, ([path, id]) => {
  if (!id || counted.has(`${path}:${id}`)) return
  counted.add(`${path}:${id}`)
  track(id, 'view')
}, { immediate: true })
</script>

<template>
  <SponsorCard
    v-if="current"
    :company="current.company"
    :creative="current.creative"
    @click="track(current.id, 'click')"
  />
</template>
