export default defineNuxtPlugin(() => {
  if (process.server) return

  // Already present?
  const existing = document.getElementById('adsbygoogle-js') as HTMLScriptElement | null
  if (existing) return

  const s = document.createElement('script')
  s.id = 'adsbygoogle-js'
  s.async = false
  s.crossOrigin = 'anonymous'
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540'
  document.head.appendChild(s)
})
