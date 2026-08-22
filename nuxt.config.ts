// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      // Warm up the third-party origins early, but load the scripts themselves
      // from the end of <body> so they never compete with the critical CSS/JS
      // for bandwidth during first paint.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://pagead2.googlesyndication.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' }
      ],
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540',
          async: true,
          crossorigin: 'anonymous',
          tagPosition: 'bodyClose'
        },
        // Google tag (gtag.js)
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-VJD486Z7WT', async: true, tagPosition: 'bodyClose' },
        { innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VJD486Z7WT');`, tagPosition: 'bodyClose' }
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

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    // GitHub Pages serves plain files — there is no server. This preset emits a
    // pure static tree into .output/public and, critically, writes a `.nojekyll`
    // marker: without it GitHub runs Jekyll over the output, which silently
    // ignores every underscore-prefixed directory (i.e. all of `_nuxt/`) and
    // the site deploys with no CSS or JS at all.
    preset: 'github_pages',

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
    // Bundle icons from the installed @iconify-json/* collections locally
    // instead of fetching from the Iconify API at runtime (which times out
    // in dev → "failed to load icon …").
    serverBundle: 'local'
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
        title: 'CRM Analytics Foundations',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/foundations%' }
        ]
      },
      {
        title: 'Setup & User Provisioning',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/setup%' }
        ]
      },
      {
        title: 'Creating Datasets',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/creating-datasets%' }
        ]
      },
      {
        title: 'Lenses & Explorations',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/lenses-and-explorations%' }
        ]
      },
      {
        title: 'Designing Dashboards',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/designing-dashboards%' }
        ]
      },
      {
        title: 'Collaboration',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/collaboration%' }
        ]
      }
    ]
  },

  ogImage: {
    zeroRuntime: true
  }
})
