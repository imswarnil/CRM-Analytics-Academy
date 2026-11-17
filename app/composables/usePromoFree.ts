/**
 * Pro members read without promos; free learners (signed in or not) see them.
 * Decided without a request: the `crma_pro` hint cookie is set by useProgress
 * once /api/progress says the learner has Pro, and cleared otherwise and on
 * sign-out. The real gate (lesson bodies) is server-side; this is cosmetic.
 * Named "promo", never "ad" — see app/utils/promo.ts.
 */
export function usePromoFree() {
  const hint = useCookie<string | null>('crma_pro')
  const { pro } = useProgress()
  return computed(() => pro.value || hint.value === '1')
}
