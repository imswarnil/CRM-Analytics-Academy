// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit'
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
      autoSubfolderIndex: false
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

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://crmanalytics.imswarnil.com/',
    title: 'CRM Analytics Academy',
    description: 'A free, open-source curriculum for mastering Salesforce CRM Analytics — data prep, SAQL, dashboards, and Einstein Discovery.',
    full: {
      title: 'CRM Analytics Academy - Full Curriculum',
      description: 'The complete CRM Analytics Academy curriculum across all five modules.'
    },
    sections: [
      {
        title: 'Foundations',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/foundations%' }
        ]
      },
      {
        title: 'Data Integration & Prep',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/data-integration%' }
        ]
      },
      {
        title: 'SAQL',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/saql%' }
        ]
      },
      {
        title: 'Dashboards',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/dashboards%' }
        ]
      },
      {
        title: 'Einstein Discovery',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/einstein-discovery%' }
        ]
      }
    ]
  },

  mcp: {
    name: 'CRM Analytics Academy'
  },

  ogImage: {
    zeroRuntime: true
  }
})
