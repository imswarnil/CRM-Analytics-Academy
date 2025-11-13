export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    // ✅ keep this once
    'nuxt-studio',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxtjs/sitemap'
  ],

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'imswarnil',              // your GitHub username
      repo: 'CRM-Analytics-Academy',   // your repo
      branch: 'process.env.main',
      rootDir: '',             
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