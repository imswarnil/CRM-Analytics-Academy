// app.config.ts
export default defineAppConfig({
  // Nuxt UI theme tokens
  ui: {
    colors: {
      primary: 'blue',   // maps to your Tailwind/Nuxt UI primary
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },

  // Global SEO defaults (used via useAppConfig().seo)
  seo: {
    // Basic identity
    siteName: 'CRM Analytics Academy',
    siteUrl: 'https://crm-analytics-academy.com',
    defaultTitle: 'CRM Analytics Academy',
    titleTemplate: '%s - CRM Analytics Academy',

    description:
      'Learn Salesforce CRM Analytics (Einstein Analytics / Tableau CRM) from scratch with real org examples, dashboards, and production-ready projects.',

    // Locale / language
    locale: 'en-IN',
    defaultLocale: 'en',
    alternateLocales: ['en-US', 'en-GB'],

    // Social / Open Graph
    ogType: 'website',
    ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/saas-light.png',
    twitterCard: 'summary_large_image',
    twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/saas-light.png',
    twitterSite: '@imswarnil',
    twitterCreator: '@imswarnil',

    // Optional: structured data you can inject via useHead/useSeoMeta
    // on main pages (home, docs index, etc.)
    jsonLd: {
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CRM Analytics Academy',
        url: 'https://crm-analytics-academy.com',
        logo: 'https://crm-analytics-academy.com/logo.png',
        sameAs: [
          'https://www.youtube.com/@crm-analytics-academy',
          'https://x.com/imswarnil',
          'https://github.com/imswarnil'
        ]
      },
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CRM Analytics Academy',
        url: 'https://crm-analytics-academy.com',
        potentialAction: {
          '@type': 'SearchAction',
          target:
            'https://crm-analytics-academy.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    }
  },

  // Header config (used by <AppHeader />)
  header: {
    title: 'CRM Analytics Academy',
    to: '/', // logo/home link

    // You’re currently using <AppLogo /> directly,
    // but we keep this for potential future use with <UColorModeImage />
    logo: {
      alt: 'CRM Analytics Academy',
      light: '/logo-light.svg',
      dark: '/logo-dark.svg'
    },

    search: true,
    colorMode: true,

    // Top-right icon links
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/imswarnil',
        target: '_blank',
        'aria-label': 'GitHub'
      },
      {
        icon: 'i-simple-icons-youtube',
        to: 'https://www.youtube.com/@crm-analytics-academy',
        target: '_blank',
        'aria-label': 'YouTube'
      }
    ],

    // Main navigation (used in AppHeader via header.nav)
    nav: [
      {
        label: 'Docs',
        to: '/docs',
        icon: 'i-lucide-book-open',
        match: '/docs'
      },
      {
        label: 'Pricing',
        to: '/pricing',
        icon: 'i-lucide-credit-card',
        match: '/pricing'
      },
      {
        label: 'Blog',
        to: '/blog',
        icon: 'i-lucide-pencil',
        match: '/blog'
      },
      {
        label: 'Changelog',
        to: '/changelog',
        icon: 'i-lucide-history',
        match: '/changelog'
      }
    ]
  },

  // Footer config
  footer: {
    credits: `Built with Nuxt UI • © ${new Date().getFullYear()} CRM Analytics Academy`,
    colorMode: false,
    links: [
      {
        icon: 'i-simple-icons-youtube',
        to: 'https://www.youtube.com/@crm-analytics-academy',
        target: '_blank',
        'aria-label': 'YouTube'
      },
      {
        icon: 'i-simple-icons-x',
        to: 'https://x.com/imswarnil',
        target: '_blank',
        'aria-label': 'X (Twitter)'
      },
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/imswarnil',
        target: '_blank',
        'aria-label': 'GitHub'
      }
    ]
  },

  // Docs TOC config (used in your docs page layout)
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community & links',
      // Point this to your actual repo content path
      edit: 'https://github.com/imswarnil/crm-analytics-academy/edit/main/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/imswarnil/crm-analytics-academy',
          target: '_blank'
        },
        {
          icon: 'i-lucide-message-circle',
          label: 'Join the community',
          to: 'https://t.me/your-community-or-discord',
          target: '_blank'
        }
      ]
    }
  }
})
