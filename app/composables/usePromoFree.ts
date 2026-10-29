/**
 * Members read without promos: signing up is the way to turn them off, and the
 * site says so. True as soon as the browser carries the `crma_signed_in` hint
 * (set by useAuth), so the decision needs no request. Named "promo", never
 * "ad" — see app/utils/promo.ts.
 */
export function usePromoFree() {
  const hint = useCookie<string | null>('crma_signed_in')
  const { isSignedIn } = useAuth()
  return computed(() => isSignedIn.value || hint.value === '1')
}
