/** Remaining credits / quota of each connected provider, where its API tells (never cached). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const out: { provider: string, label: string, credits: { label: string, used: number | null, available: number | null }[], error: string | null }[] = []
  for (const p of activeProviders(process.env as Record<string, string | undefined>)) {
    if (!p.credits) continue
    try {
      out.push({ provider: p.id, label: p.label, credits: await p.credits(providerContext(p)), error: null })
    } catch (e) {
      out.push({ provider: p.id, label: p.label, credits: [], error: (e as { statusMessage?: string }).statusMessage ?? String((e as Error).message).slice(0, 120) })
    }
  }
  return { credits: out }
})
