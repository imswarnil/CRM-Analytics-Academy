// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-studio',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'nuxt-studio'
  ],

  studio: {
    route: '/_studio', 
    repository: {
      provider: 'github', // only GitHub is currently supported
      owner: 'imswarnil', // your GitHub username or organization
      repo: 'CRM-Analytics-Academy', // your repository name
      branch: 'main', // the branch to commit to (default: main)
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
      routes: [
        '/'
      ],
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