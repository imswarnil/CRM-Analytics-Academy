// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
    '@vercel/analytics/nuxt',
    '@vercel/speed-insights/nuxt'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540',
          async: true,
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://crmanalytics.imswarnil.com',
    name: 'CRM Analytics Academy'
  },

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    }
  },

  runtimeConfig: {
    // Server-only. Provided via NUXT_GEMINI_API_KEY (see .env.example).
    geminiApiKey: '',
    // Overridable via NUXT_GEMINI_MODEL if needed.
    geminiModel: 'gemini-flash-latest'
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      autoSubfolderIndex: false,
      // Don't abort the whole build if a single crawled route errors.
      failOnError: false
    }
  },

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit', '@vueuse/core', 'remark-emoji']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    baseUrl: 'https://crmanalytics.imswarnil.com',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json' },
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'hi', language: 'hi-IN', name: 'हिन्दी', file: 'hi.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en'
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://crmanalytics.imswarnil.com/',
    title: 'CRM Analytics Academy',
    description: 'A free, open-source curriculum for mastering Salesforce CRM Analytics — data prep, SAQL, dashboards, and Einstein Discovery.',
    full: {
      title: 'CRM Analytics Academy - Full Curriculum',
      description: 'The complete CRM Analytics Academy curriculum (English).'
    },
    sections: [
      {
        title: 'Foundations',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/foundations%' }
        ]
      },
      {
        title: 'Getting Started',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/getting-started%' }
        ]
      },
      {
        title: 'Tour',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/tour%' }
        ]
      },
      {
        title: 'Navigating Dashboards',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/navigating%' }
        ]
      },
      {
        title: 'SAQL',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/saql%' }
        ]
      },
      {
        title: 'Analytics & Einstein',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/analytics%' }
        ]
      },
      {
        title: 'Bindings',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/bindings%' }
        ]
      },
      {
        title: 'Chart Embedding',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/chart-embedding%' }
        ]
      }
    ]
  },

  mcp: {
    name: 'CRM Analytics Academy'
  },

  ogImage: {
    zeroRuntime: true
  },

  // Supabase auth + data. Keys come from the CRMA_-prefixed env vars created by
  // the Vercel↔Supabase integration (see .env.example). `redirect: false` keeps
  // the whole site public by default; individual pages opt in via the `auth`
  // middleware. The service key is server-only (used for admin/moderation).
  supabase: {
    url: process.env.CRMA_SUPABASE_URL,
    key: process.env.CRMA_SUPABASE_ANON_KEY,
    serviceKey: process.env.CRMA_SUPABASE_SERVICE_ROLE_KEY,
    redirect: false,
    // Client typing comes from useDb() (useSupabaseClient<Database>()), so the
    // module's own type generation stays off.
    types: false
  }
})
