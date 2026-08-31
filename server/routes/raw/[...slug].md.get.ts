import { withLeadingSlash } from 'ufo'
import { stringify } from 'minimark/stringify'
import { queryCollection } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  const slug = getRouterParams(event)['slug.md']
  if (!slug?.endsWith('.md')) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }

  const path = withLeadingSlash(slug.replace('.md', ''))

  const page = await queryCollection(event, 'docs' as const).path(path).first()
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
