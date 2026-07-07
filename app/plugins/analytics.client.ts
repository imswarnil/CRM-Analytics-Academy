import Clarity from '@microsoft/clarity'

// Microsoft Clarity (session analytics / heatmaps). Client-only; guarded so it
// initialises once. gtag.js is loaded via nuxt.config app.head.
export default defineNuxtPlugin(() => {
  try {
    Clarity.init('xixmfuf56d')
  } catch {
    // never let analytics break the app
  }
})
