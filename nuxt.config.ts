// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxt'
  ],

    supabase: {
    url: process.env.CRM_ANALYTICS_ACADEMY_NUXT_PUBLIC_SITE_URLSUPABASE_URL,
    key: process.env.CRM_ANALYTICS_ACADEMY_NUXT_PUBLIC_SITE_URLSUPABASE_ANON_KEY,
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',  // we'll create this route (simple)
      exclude: [
        '/',                       // public
        '/login',
        '/signup',
        '/docs/**',
        '/changelog'
      ]
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
