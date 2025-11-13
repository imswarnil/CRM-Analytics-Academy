export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-studio',      // ✅ keep this once
    '@vueuse/nuxt',
    'nuxt-og-image'
  ],

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'imswarnil',              // your GitHub username
      repo: 'CRM-Analytics-Academy',   // your repo
          branch: 'process.env.main'             
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
