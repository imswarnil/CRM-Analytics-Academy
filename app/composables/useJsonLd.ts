type JsonLd = Record<string, unknown>

/**
 * Inject one or more JSON-LD structured-data blocks into the document head.
 * Accepts a single schema object or an array of them.
 */
export function useJsonLd(data: JsonLd | JsonLd[]) {
  const blocks = Array.isArray(data) ? data : [data]
  useHead({
    script: blocks.map(block => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(block)
    }))
  })
}
