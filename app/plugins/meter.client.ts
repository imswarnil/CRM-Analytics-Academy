/**
 * Counts every metered page (lessons, interview answers, visualisers) against
 * the reader's sessions as it opens — on the first load and on every client
 * navigation. Leaving for a page that is not metered lowers the wall.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const { open, blocked } = useMeter()
  const check = (path: string) => {
    if (isMeteredPath(path)) open(path)
    else blocked.value = false
  }
  router.afterEach((to, from) => {
    if (to.path !== from.path) check(to.path)
  })
  nuxtApp.hook('app:mounted', () => check(router.currentRoute.value.path))
})
