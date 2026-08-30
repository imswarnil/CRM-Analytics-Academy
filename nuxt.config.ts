// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
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
      htmlAttrs: {
        // The theme is applied before paint by a small inline script (see
        // app/plugins/theme.client.ts) so a dark-mode reader never gets a white
        // flash on first load.
        'data-theme': 'light'
      },
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
        // Applied before first paint, in <head>, deliberately blocking: this is
        // the one script that must run early. Anything later and a reader who
        // chose dark gets a white flash on every navigation. It reads the same
        // key useTheme() writes and sets the attribute the token layer keys on.
        {
          innerHTML: `(function(){try{var c=localStorage.getItem('crma-theme')||'system';var d=c==='dark'||(c==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`
        },
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

  css: ['~/assets/styles/index.scss'],

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

  // Only the signed-in surface is dynamic. Everything else is the same static,
  // markdown-driven site it has always been, prerendered at build time and
  // served off Cloudflare's edge as a file. These routes are never cached:
  // caching a page rendered for one signed-in learner and handing it to another
  // is the classic way to leak an account.
  routeRules: {
    // `robots: false` would need the nuxt-robots module, which is not installed
    // here — X-Robots-Tag does the same job at the header level.
    '/dashboard/**': { prerender: false, headers: { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' } },
    '/account/**': { prerender: false, headers: { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' } },
    '/api/**': { prerender: false, headers: { 'cache-control': 'no-store' } }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    // Set per build pass — see the two `build:*` scripts in package.json.
    //
    // The site is built twice from this one codebase, because Nuxt Content and
    // the Cloudflare preset cannot both get what they want in a single pass.
    // The preset rebinds the content database to D1 during nitro config; the
    // prerenderer then runs in plain Node with no D1 binding, every
    // queryCollection 500s, `/` fails, and the crawler finds no links. Measured
    // on this repo: node-server prerenders 2243 routes, cloudflare_module
    // prerenders 5.
    //
    //   build:static -> node-server        -> .output-static/public  (the site)
    //   build:worker -> cloudflare_module  -> .output/server         (the API)
    //
    // wrangler.jsonc then points `assets` at the first and `main` at the
    // second. The Worker never queries a content collection, so its broken D1
    // binding is never reached.
    preset: process.env.NITRO_PRESET || 'node-server',

    // Set explicitly rather than via NITRO_OUTPUT_DIR: Nitro does not pick that
    // env var up here, so the static pass wrote into .output and the worker
    // pass then overwrote it, leaving zero prerendered pages.
    output: {
      dir: process.env.NITRO_OUTPUT_DIR || '.output'
    },

    prerender: {
      // The worker pass has nothing worth prerendering and would only
      // reproduce the 500 above.
      crawlLinks: process.env.NITRO_PRERENDER !== 'false',
      // /404.html is prerendered so Cloudflare can serve a real not-found page
      // from static assets. Without it an unknown URL falls through to the
      // Worker, which has no content database and dies with a 500 instead.
      routes: process.env.NITRO_PRERENDER === 'false' ? [] : ['/', '/404.html'],
      autoSubfolderIndex: false,
      // Don't abort the whole build if a single crawled route errors.
      failOnError: false,
      // The crawler follows every link it finds. The signed-in routes have no
      // meaningful build-time render — they would bake in the logged-out state
      // and then be served, cached, to real sessions.
      ignore: ['/dashboard', '/account', '/api']
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
    // 12 locales. `language` is the BCP-47 tag that lands in <html lang> and in
    // the hreflang alternates; `dir` drives <html dir> so Arabic and Urdu lay
    // out right-to-left. `translateTo` is not an i18n option — it is read by
    // scripts/translate.mjs, which needs LibreTranslate's own codes (it speaks
    // `zh-Hans`, not `zh`). Keep the two in sync when adding a locale.
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json' },
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'hi', language: 'hi-IN', name: 'हिन्दी', file: 'hi.json' },
      { code: 'ar', language: 'ar-SA', name: 'العربية', file: 'ar.json', dir: 'rtl' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.json' },
      { code: 'ur', language: 'ur-PK', name: 'اردو', file: 'ur.json', dir: 'rtl' }
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
