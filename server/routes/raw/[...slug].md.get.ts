import { withLeadingSlash } from 'ufo'
import { stringify } from 'minimark/stringify'
import { queryCollection } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md')) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  // The HTML canonical of an English page has no locale segment, so accept
  // /raw/<route>.md as well as /raw/en/<route>.md.
  const raw = withLeadingSlash(slug.replace(/\.md$/, ''))
  const path = /^\/(en|es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(\/|$)/.test(raw) ? raw : `/en${raw}`

  // Every raw page a reader may see is prerendered, so on Cloudflare this
  // handler only runs for URLs that have no file — gated lessons and typos —
  // where the Worker has no content database and the query throws. Either
  // way the right answer is 404, not a 500.
  let page: Awaited<ReturnType<ReturnType<typeof queryCollection<'docs'>>['first']>> = null
  try {
    page = await queryCollection(event, 'docs' as const).path(path).first()
  } catch {
    // Building the query can throw too, before any promise exists.
  }
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  // A gated lesson has no raw form. This route exists to hand the markdown to
  // crawlers and assistants, which is exactly what a paid lesson must not do —
  // and during the build the prerenderer would otherwise write the whole body
  // to a public .md file, which is how the first version of this leaked.
  if (page.access === 'pro') {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  // Add title and description to the top of the page if missing
  if (page.body.value[0]?.[0] !== 'h1') {
    page.body.value.unshift(['blockquote', {}, page.description])
    page.body.value.unshift(['h1', {}, page.title])
  }

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' })
})
