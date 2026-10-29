import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config

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
/**
 * Signed-in surfaces, excluded from the prerender in every locale.
 *
 * These are REGULAR EXPRESSIONS anchored at a path boundary, not bare strings.
 * Nitro matches a string in this list as a PREFIX, so '/dashboard' also
 * excluded /dashboard-json and '/api' excluded /apis-and-automation — two whole
 * sections silently absent from the build, with no error anywhere, because
 * their slugs happen to start with the same characters as a private route.
 */
const PRIVATE_PATHS = ['/dashboard', '/account', '/submit', '/admin', '/api']

/** Pages that were removed, and where their visitors now go. */
const RETIRED: Record<string, string> = {
  '/jobs': '/',
  '/leaderboard': '/dashboard',
  '/ask': '/curriculum',
  '/training': '/curriculum',
  '/sales': '/about',
  '/contact': '/about',
  '/implementation': '/curriculum',
  '/experts': '/about',
  '/experts/join': '/about',
  // 2026-10-22: payments, teams and sponsorship removed — every lesson is free.
  '/pricing': '/pro',
  '/teams': '/pro',
  '/team': '/dashboard',
  '/join': '/sign-up',
  '/nominate': '/wall-of-fame',
  '/sponsor': '/about',
  '/sponsor/studio': '/about',
  // 2026-10-23: lessons published section by section; these pages retired.
  '/showcase': '/curriculum',
  '/showcase/**': '/curriculum',
  '/instructors': '/about',
  '/roadmap': '/curriculum',
  '/changelog': '/about'
}

const redirectRules = Object.fromEntries(Object.entries(RETIRED).flatMap(([from, to]) => [
  [from, { redirect: { to, statusCode: 301 } }],
  ...locales.filter(l => l.code !== DEFAULT_LOCALE).map(l => [`/${l.code}${from}`, { redirect: { to: `/${l.code}${to === '/' ? '' : to}`, statusCode: 301 } }])
]))

// Security headers on everything the Worker answers (pages it renders, the
// API). Static files get the same set from public/_headers. The CSP is narrow
// on purpose: AdSense loads scripts from many Google hosts, so a script
// allow-list would silently break the promos; this one blocks framing,
// plugins, <base> hijacking and off-site form posts.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), payment=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Content-Security-Policy': 'frame-ancestors \'self\'; object-src \'none\'; base-uri \'self\'; form-action \'self\'; upgrade-insecure-requests'
}

const privateRoutes = PRIVATE_PATHS.flatMap(route => [
  route,
  ...locales
    .filter(l => l.code !== DEFAULT_LOCALE)
    .map(l => `/${l.code}${route}`)
]).map(route => new RegExp(`^${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$)`))

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxtjs/sitemap',
    '@nuxtjs/i18n',
    'nuxt-studio'
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
      meta: [
        // PWA chrome colour — navy in the title bar when installed.
        { name: 'theme-color', content: '#0F2A5C' },
        // AdSense site ownership (ads.txt is in public/).
        { name: 'google-adsense-account', content: 'ca-pub-1291242080282540' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com' }
      ],
      // AdSense, loaded once. Units are <PromoSlot>s (app/utils/promo.ts for
      // the inventory); Auto ads (incl. Vignette) are switched on in AdSense.
      script: [
        // Members see no promos at all — not even Auto ads. This runs before
        // the library loads; useAuth sets the cookie on sign-in.
        { innerHTML: 'if(/(?:^|; )crma_signed_in=1/.test(document.cookie)){(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1}', tagPosition: 'head' },
        { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540', async: true, crossorigin: 'anonymous' }
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
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    },
    // CONTENT_LOCAL_DB gives a build its own content database file, so it can
    // run while a dev server holds .data/content/contents.sqlite open.
    ...(process.env.CONTENT_LOCAL_DB ? { _localDatabase: { type: 'sqlite' as const, filename: process.env.CONTENT_LOCAL_DB } } : {})
  },

  // Every import of `h3` — server bundle, Vue SSR bundle and client — gets the
  // 1.x this Nuxt and Nitro are built on. Some modules (@nuxt/content's
  // runtime, nuxt-site-config) import h3 without declaring it and get whichever
  // copy pnpm hoisted; after a dependency change that was devtools' h3 2.x, and
  // every content query and every prerendered page failed ("event.req.headers
  // .get is not a function"). h3 1.x is a direct dependency so the path exists.
  alias: {
    h3: realpathSync(fileURLToPath(new URL('./node_modules/h3/dist/index.mjs', import.meta.url)))
  },

  routeRules: {
    ...redirectRules,
    '/**': { headers: SECURITY_HEADERS }
  },

  experimental: {
    asyncContext: true,
    // Prefetch a page's payload when the pointer or focus reaches its link,
    // not when the link scrolls into view. The course rail alone puts dozens
    // of lesson links on screen, and prefetch-on-visibility fetched every one
    // of their payloads on every page load, competing with the page itself.
    // Hover-to-click is ~200ms, which is enough for the payload to arrive, so
    // navigation still feels instant.
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true, visibility: false }
      }
    }
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
    // no static file: /api/*, /mcp and the signed-in surface.
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
      ignore: [
        // The signed-in surface, in every locale. Prerendering it bakes the
        // logged-out shell into a public file, which then has to be corrected
        // on the client on every visit — a flash of the wrong state, and files
        // that exist only to be replaced.
        ...privateRoutes,
        // Redirect sources are answered by the Worker (routeRules above), and
        // must never be crawled: rendered through the lesson catch-all, each
        // one advertised hreflang alternates like /ja/ru/jobs, whose
        // alternates nested again — thousands of phantom routes until the
        // prerenderer ran out of memory.
        ...Object.keys(redirectRules).map(path => new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$|\\?)`)),
        new RegExp(`^/(${locales.map(l => l.code).join('|')})/(${locales.map(l => l.code).join('|')})(/|$)`),
        // The editor is a signed-in surface too; a prerendered copy would be
        // a logged-out shell.
        '/_studio',
        '/__nuxt_studio'
      ]
    }
  },

  vite: {
    optimizeDeps: {
      // Only packages this project depends on directly can be listed here:
      // pnpm keeps transitive packages out of the root node_modules, so Vite
      // cannot resolve them and warns on every start. This one is imported
      // from app code and are pre-bundled so the first request does not
      // trigger a "new dependencies discovered" reload.
      include: ['@vueuse/core']
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
    // The module's own detection is off. It ran on `/` only (`redirectOn:
    // 'root'`, because on prefixed routes it rendered every locale as English
    // during prerender), switched the locale mid-hydration of the English HTML
    // — a hydration mismatch — and wrote `i18n_redirected=en` on every
    // unprefixed page, which then silenced plugins/locale-auto.client.ts. That
    // plugin is now the one place the first-visit language is decided.
    detectBrowserLanguage: false
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
      '/dashboard', '/account', '/submit', '/admin', '/_studio',
      '/*/dashboard', '/*/account', '/*/submit', '/*/admin', '/*/_studio',
      // The raw-markdown surface is for LLMs and is already advertised by
      // llms.txt. In a sitemap it would be duplicate content.
      '/raw/**'
    ],
    // hreflang alternates for the eleven translated locales, so a crawler
    // serves the right language rather than treating twelve copies of a
    // lesson as duplicates of each other.
    autoI18n: true
  },

  // Nuxt Studio — the in-site editor for content/, served by this Worker at
  // /_studio.
  //
  // The hosted service at nuxt.studio (the old `content.preview.api`
  // setting) was sunset when Studio went open source, which is why the
  // editor never appeared on the live site. The module now runs on our own
  // server: it signs the editor in through a GitHub OAuth app, edits
  // markdown through the GitHub API and commits to `main`, so publishing goes
  // through the same push -> translate -> deploy chain as a hand-written
  // commit rather than around it.
  //
  // Credentials are Worker secrets, never config:
  //   STUDIO_GITHUB_CLIENT_ID / STUDIO_GITHUB_CLIENT_SECRET
  // The OAuth app's callback URL is
  //   https://crmanalytics.imswarnil.com/__nuxt_studio/auth/github
  // Without the secrets the editor loads but cannot sign anyone in.
  studio: {
    repository: {
      provider: 'github',
      owner: 'imswarnil',
      repo: 'CRM-Analytics-Academy',
      branch: 'main'
    }
  }
})
