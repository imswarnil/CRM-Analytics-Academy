/**
 * One inline `::pro` block of an otherwise free lesson.
 *
 *   GET /api/lesson-block/<locale>/<route>?n=<block>   e.g. /api/lesson-block/es/saql/functions?n=2
 *
 * The same paywall as /api/lesson, at block scale: scripts/gate-content.mjs
 * moved the block's markdown into server/assets/gated-blocks/ (bundled into
 * the Worker, never into .output/public) and left a `::pro-locked`
 * placeholder in the public page. This route returns the block only after
 * hasPro(), with a signed Mux playback for every video inside it.
 */
interface GatedBlocks {
  blocks: { n: number, markdown: string }[]
}

export default defineEventHandler(async (event) => {
  const path = '/' + (getRouterParam(event, 'path') || '')
  const n = Number(getQuery(event).n)

  if (!/^\/[a-z]{2}(\/[a-z0-9-]+)*$/i.test(path) || path.includes('..') || !Number.isInteger(n) || n < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid block' })
  }

  const parts = path.replace(/^\//, '').split('/')
  if (parts.length === 1) parts.push('index')
  const storage = useStorage('assets:server')
  const file = await storage.getItem<GatedBlocks>(`gated-blocks:${parts.join(':')}.json`)
  const block = file?.blocks?.find(b => b.n === n)
  if (!block) {
    throw createError({ statusCode: 404, statusMessage: 'Block not found' })
  }

  const user = await requireUser(event)
  if (!(await hasPro(user.id))) {
    throw createError({ statusCode: 403, statusMessage: 'This section requires Pro' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    markdown: block.markdown,
    playback: await signMuxPlaybacks(muxIdsIn(block.markdown))
  }
})
