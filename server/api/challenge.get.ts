/** A fresh proof-of-work challenge for <HumanCheck> (server/utils/pow.ts). */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return createChallenge()
})
