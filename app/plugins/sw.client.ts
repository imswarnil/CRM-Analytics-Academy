// Registers the service worker (public/sw.js) once the app has loaded.
// Client-only by filename convention (`.client.ts`); safe no-op in
// unsupported browsers.
export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
})
