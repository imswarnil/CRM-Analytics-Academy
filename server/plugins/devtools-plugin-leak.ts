/**
 * Stops a memory leak that made the prerender run out of heap.
 *
 * During prerender Nitro runs with a non-production NODE_ENV, so vue-i18n's
 * devtools integration switches on for every server render. With no Vue
 * devtools attached, `setupDevtoolsPlugin` parks each registration in the
 * global `__VUE_DEVTOOLS_PLUGINS__` array, waiting for a devtools frontend
 * that never comes. Each entry holds that request's whole app — router,
 * i18n messages, component tree — so the heap grew ~6 MB per page and the
 * build died past 12 GB once the locales were fully translated.
 *
 * Nothing on the server ever reads that array, so it is emptied after every
 * response. In the deployed Worker NODE_ENV is production and the array is
 * never filled; this is then a no-op.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', () => {
    const list = (globalThis as { __VUE_DEVTOOLS_PLUGINS__?: unknown[] }).__VUE_DEVTOOLS_PLUGINS__
    if (list?.length) list.length = 0
  })
})
