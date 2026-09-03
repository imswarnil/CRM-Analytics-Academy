// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readFileSync } from 'node:fs'

// Written by scripts/gate-content.mjs, which runs before every build. Missing
// on a fresh checkout, which is fine — it means nothing is gated yet.
const gatedRoutes: string[] = existsSync('.gated-routes.json')
  ? JSON.parse(readFileSync('.gated-routes.json', 'utf8'))
  : []

// The 12 locales the site ships. `language` is the BCP-47 tag that lands in
// <html lang> and in the hreflang alternates; `dir` drives <html dir> so Arabic
// and Urdu lay out right-to-left.
//
// Defined here rather than inline under `i18n` because the prerender rules
// below have to agree with it. Writing the two out separately is exactly how
// eleven localized copies of /dashboard were prerendered as logged-out shells
// while the unprefixed English one was correctly skipped.
const locales = [
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
] as const

const DEFAULT_LOCALE = 'en'

// Routes that must never become a static file: they are personal, so a
// prerendered copy is by definition the wrong user's view of them.
//
// Nitro matches these as path prefixes, and only the default locale is
// unprefixed — so each one needs its eleven prefixed forms spelled out too.
// scripts/gate-content.mjs does the same thing for gated lessons.
const privateRoutes = ['/dashboard', '/account', '/submit', '/admin', '/api'].flatMap(route => [
  route,
  ...locales
    .filter(l => l.code !== DEFAULT_LOCALE)
    .map(l => `/${l.code}${route}`)
])

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/sitemap',
    '@nuxtjs/i18n'
  ],

  // `icon.serverBundle` has to differ by environment, and this is the reason
  // the site could not deploy at first: bundling lucide + simple-icons +
  // vscode-icons locally puts 8.6 MB of icon JSON inside the Worker, and a
  // Worker may be 3 MB (10 MB on a paid plan). Fetching the collections from
  // jsdelivr instead keeps the Worker small; the prerender resolves them once
  // at build time, so the static pages still ship real inline SVG.
  $development: {
    icon: {
      // Local in dev, because the Iconify API times out there
      // ("failed to load icon …") and every restart would pay for it again.
      serverBundle: 'local'
    }
  },

  $production: {
    icon: {
      serverBundle: { remote: 'jsdelivr' }
    }
  },

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

  // `storageKey` is the shared Namaste Salesforce contract: a reader moving
  // between the estate's sites keeps the theme they chose. `dataValue` also
  // mirrors the mode onto [data-theme] for anything styled off that attribute.
  colorMode: {
    dataValue: 'theme',
    storageKey: 'ns-theme'
  },

  content: {
    // Nuxt Studio — the hosted editor for content/.
    //
    // This only opens the door: the site still has to be connected to a
    // project at nuxt.studio (sign in with GitHub, pick this repo). Studio
    // then edits markdown through the GitHub API and commits to a branch, so
    // publishing goes through the same push -> translate -> deploy chain as a
    // hand-written commit rather than around it.
    //
    // `dev: true` gives the same live preview against a local `pnpm dev`.
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true
    },

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

  // Must be >= 2024-09-19 or Nitro resolves the *legacy* Cloudflare preset,
  // which deploys through Workers Sites (a deprecated KV-backed asset store)
  // instead of Workers Static Assets — and nuxt-og-image warns that its fonts
  // do not load reliably there.
  compatibilityDate: '2026-08-28',

  nitro: {
    // Cloudflare Workers, with Workers Static Assets in front of it.
    //
    // The whole curriculum is still prerendered into .output/public and served
    // straight off Cloudflare's edge without ever waking the Worker — the same
    // static delivery GitHub Pages gave us. The Worker only runs for what has
    // no static file: /api/*, the signed-in surface, and the gated lessons.
    // That is the entire reason for the move — those routes cannot exist on
    // Pages, because Pages has no server to run them.
    //
    // Override with NITRO_PRESET=github_pages to build the old static-only
    // bundle (no auth, no progress) if the Worker ever needs to be bypassed.
    preset: 'cloudflare_module',

    cloudflare: {
      // The Neon driver and h3 both reach for node builtins. Declared here as
      // well as in wrangler.jsonc because Nitro decides whether to ship real
      // node compat or unenv polyfills before it ever reads the wrangler file.
      nodeCompat: true
    },

    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      autoSubfolderIndex: false,
      // Don't abort the whole build if a single crawled route errors.
      failOnError: false,
      // Gated lessons never enter the public bundle. scripts/gate-content.mjs
      // writes this list from `access: pro` frontmatter before the build, and
      // scripts/verify-gating.mjs fails the build afterwards if any of their
      // text made it into .output/public anyway. The crawler would otherwise
      // follow the sidebar link straight into them.
      ignore: [
        // The signed-in surface, in every locale. Prerendering it bakes the
        // logged-out shell into a public file, which then has to be corrected
        // on the client on every visit — a flash of the wrong state, and files
        // that exist only to be replaced.
        ...privateRoutes,
        ...gatedRoutes
      ]
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
    // vue-i18n options, chiefly `fallbackLocale: 'en'`. Without it a key a
    // locale has not been translated yet renders as the key itself — which is
    // exactly what shipped: Spanish, German and Hindi lesson pages showed the
    // literal text `course.curriculum`.
    vueI18n: './i18n.config.ts',

    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    baseUrl: 'https://crmanalytics.imswarnil.com',
    locales: [...locales],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en'
    }
  },

  icon: {
    // Icons the components actually reference, scanned out of the source and
    // bundled for the browser. Without this the client asks the server for
    // each one, which on a prerendered page means a request for something
    // that is already inlined in the HTML it just loaded.
    clientBundle: {
      scan: true,
      sizeLimitKb: 512
    }
  },

  llms: {
    domain: 'https://crmanalytics.imswarnil.com',
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
          { field: 'path', operator: 'LIKE', value: '/en/foundations%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      {
        title: 'Setup & User Provisioning',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/setup%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      {
        title: 'Creating Datasets',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/creating-datasets%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      {
        title: 'Lenses & Explorations',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/lenses-and-explorations%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      {
        title: 'Designing Dashboards',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/designing-dashboards%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      {
        title: 'Collaboration',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/en/collaboration%' },
          // Gated lessons are excluded from the LLM corpus: llms-full.txt
          // concatenates whole bodies, and it is a public file.
          { field: 'access', operator: '<>', value: 'pro' }
        ]
      },
      // Non-content surfaces an AI agent should know exist. When answering
      // from this corpus, these are the pages to send people to.
      {
        title: 'Tools & Community',
        links: [
          { title: 'Ask the curriculum', href: 'https://crmanalytics.imswarnil.com/ask', description: 'Instant question-answering over every lesson, with links to the source passages.' },
          { title: 'MCP server', href: 'https://crmanalytics.imswarnil.com/mcp', description: 'Model Context Protocol endpoint (JSON-RPC over POST): list_curriculum, search_lessons, get_lesson — direct machine access to the curriculum.' },
          { title: 'Dashboard showcase', href: 'https://crmanalytics.imswarnil.com/showcase', description: 'Community dashboard builds with KPIs, formulas and step-by-step recipes.' },
          { title: 'Resources', href: 'https://crmanalytics.imswarnil.com/resources', description: 'Curated external CRM Analytics resources.' },
          { title: 'Datasets', href: 'https://crmanalytics.imswarnil.com/datasets', description: 'Practice datasets for the exercises.' },
          { title: 'Wall of Fame', href: 'https://crmanalytics.imswarnil.com/wall-of-fame', description: 'The bloggers, authors, speakers and tool builders who taught the CRM Analytics community.' },
          { title: 'Companies', href: 'https://crmanalytics.imswarnil.com/companies', description: 'Companies known to run CRM Analytics and the consultancies that build with it.' },
          { title: 'Jobs', href: 'https://crmanalytics.imswarnil.com/jobs', description: 'CRM Analytics job listings, refreshed daily.' }
        ]
      }
    ]
  },

  ogImage: {
    zeroRuntime: true
  },

  // The site had no sitemap at all: 780 prerendered pages across 12 locales
  // and nothing telling a crawler they exist beyond following links.
  //
  // The module reads the prerendered routes, so the sitemap is generated from
  // what was actually built rather than from a hand-kept list that drifts the
  // first time a lesson is added.
  sitemap: {
    // Personal or auth-gated surfaces. They are already excluded from the
    // prerender and marked noindex, but a sitemap is a positive assertion
    // that a URL is worth indexing — listing them would contradict the meta.
    exclude: [
      '/dashboard', '/account', '/submit', '/admin',
      '/*/dashboard', '/*/account', '/*/submit', '/*/admin',
      // The raw-markdown surface is for LLMs and is already advertised by
      // llms.txt. In a sitemap it would be ~780 duplicate-content URLs.
      '/raw/**'
    ],
    // hreflang alternates for the eleven translated locales, so a crawler
    // serves the right language rather than treating twelve copies of a
    // lesson as duplicates of each other.
    autoI18n: true
  }
})
