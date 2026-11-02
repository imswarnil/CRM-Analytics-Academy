<script setup lang="ts">
/**
 * The live sponsor, under the navbar on every page and (as a card and a tile)
 * in every lesson — one sponsor per page view, in all three places. The page view
 * (plugins/analytics.client.ts → POST /api/collect) picks which sponsor shows,
 * in turn, and counts its view — no request of its own. Clicks are counted by
 * POST /api/sponsor/track. If the page view was blocked, the banner asks
 * /api/sponsor/live itself. Shown to everyone, members included: it is not an
 * ad network.
 */
interface Live { id: number, company: string, creative: Record<string, string> }
/** bar: under the navbar (app.vue). card / tile: in lessons ([...slug].vue). */
const props = withDefaults(defineProps<{ format?: 'bar' | 'card' | 'tile' }>(), { format: 'bar' })
const route = useRoute()
const current = useState<Live | null>('sponsor-current', () => null)
const blocked = useState('collect-blocked', () => false)
const { data } = useLazyFetch<{ sponsors: Live[] }>('/api/sponsor/live', { server: false, key: 'sponsor-live', immediate: false })
watch(blocked, (b) => {
  if (b && !data.value) refreshNuxtData('sponsor-live')
})
const turn = useState('sponsor-turn', () => 0)
if (props.format === 'bar') watch(() => route.path, () => turn.value++)
const shown = computed(() => {
  if (current.value) return current.value
  const list = data.value?.sponsors ?? []
  return list.length ? list[turn.value % list.length]! : null
})
function click(id: number) {
  const body = JSON.stringify({ id, kind: 'click', path: route.path })
  if (navigator.sendBeacon) navigator.sendBeacon('/api/sponsor/track', new Blob([body], { type: 'text/plain' }))
  else fetch('/api/sponsor/track', { method: 'POST', body, keepalive: true }).catch(() => {})
}
</script>

<template>
  <SponsorCard
    v-if="shown"
    :company="shown.company"
    :creative="shown.creative"
    :format="props.format"
    @click="click(shown.id)"
  />
</template>
